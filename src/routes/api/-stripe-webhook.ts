import { createAPIFileRoute } from '@tanstack/react-start/api'
import Stripe from 'stripe'

const PLAN_ALLOWANCES: Record<string, number> = {
  payg: 15,
  monthly: 100,
}

async function getClerkUser(userId: string) {
  const res = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
    headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` },
  })
  if (!res.ok) throw new Error(`Clerk user fetch failed: ${res.status}`)
  return res.json()
}

async function updateClerkMetadata(userId: string, publicMetadata: Record<string, unknown>) {
  const res = await fetch(`https://api.clerk.com/v1/users/${userId}/metadata`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ public_metadata: publicMetadata }),
  })
  if (!res.ok) throw new Error(`Clerk metadata update failed: ${res.status}`)
  return res.json()
}

async function findUserByCustomerId(customerId: string) {
  const res = await fetch(`https://api.clerk.com/v1/users?limit=100`, {
    headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` },
  })
  if (!res.ok) return null
  const data = await res.json()
  return data.find((u: any) => u.public_metadata?.stripeCustomerId === customerId) ?? null
}

export const APIRoute = createAPIFileRoute('/api/stripe-webhook')({
  POST: async ({ request }) => {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2024-11-20.acacia',
    })

    const rawBody = await request.text()
    const signature = request.headers.get('stripe-signature') ?? ''

    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      )
    } catch (err: any) {
      return new Response(`Webhook Error: ${err.message}`, { status: 400 })
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.userId
      const priceId = session.metadata?.priceId

      if (userId && priceId) {
        const plan = priceId === process.env.STRIPE_PRICE_MONTHLY ? 'monthly' : 'payg'
        const planLabel = plan === 'monthly' ? 'Monthly' : 'Pay As You Go'
        const allowance = PLAN_ALLOWANCES[plan]

        let generationsRemaining = allowance
        if (plan === 'payg') {
          try {
            const existingUser = await getClerkUser(userId)
            const existing = (existingUser.public_metadata?.generationsRemaining as number) ?? 0
            generationsRemaining = existing + allowance
          } catch {
            generationsRemaining = allowance
          }
        }

        await updateClerkMetadata(userId, {
          plan,
          planLabel,
          planActivatedAt: new Date().toISOString(),
          stripeSessionId: session.id,
          stripeCustomerId: session.customer as string,
          generationsRemaining,
          generationsAllowance: allowance,
        })
      }
    }

    if (event.type === 'invoice.payment_succeeded') {
      const invoice = event.data.object as Stripe.Invoice
      if (invoice.billing_reason === 'subscription_cycle') {
        const user = await findUserByCustomerId(invoice.customer as string)
        if (user && user.public_metadata?.plan === 'monthly') {
          await updateClerkMetadata(user.id, {
            ...user.public_metadata,
            generationsRemaining: 100,
            planActivatedAt: new Date().toISOString(),
          })
        }
      }
    }

    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription
      const user = await findUserByCustomerId(subscription.customer as string)
      if (user) {
        await updateClerkMetadata(user.id, {
          plan: 'free',
          planLabel: 'Free Trial',
          planActivatedAt: null,
          generationsRemaining: 0,
        })
      }
    }

    return new Response('ok', { status: 200 })
  },
})
