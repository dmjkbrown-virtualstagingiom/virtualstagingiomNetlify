import { createAPIFileRoute } from '@tanstack/react-start/api'
import Stripe from 'stripe'

const PLAN_ALLOWANCES: Record<string, number> = {
  payg: 15,
  monthly: 100,
}

async function findClerkUserByEmail(email: string) {
  const res = await fetch(`https://api.clerk.com/v1/users?email_address=${encodeURIComponent(email)}&limit=5`, {
    headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` },
  })
  if (!res.ok) return null
  const data = await res.json()
  return Array.isArray(data) && data.length > 0 ? data[0] : null
}

async function findClerkUserById(userId: string) {
  const res = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
    headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` },
  })
  if (!res.ok) return null
  return res.json()
}

async function findUserByCustomerId(customerId: string) {
  const res = await fetch(`https://api.clerk.com/v1/users?limit=100`, {
    headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` },
  })
  if (!res.ok) return null
  const data = await res.json()
  return (Array.isArray(data) ? data : data.data ?? []).find(
    (u: any) => u.public_metadata?.stripeCustomerId === customerId
  ) ?? null
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
  if (!res.ok) {
    const err = await res.text()
    console.error('Clerk metadata update failed:', err)
  }
  return res.ok
}

export const APIRoute = createAPIFileRoute('/api/stripe-webhook')({
  POST: async ({ request }) => {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2024-06-20',
    })

    const rawBody = await request.text()
    const signature = request.headers.get('stripe-signature') ?? ''

    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET!)
    } catch (err: any) {
      console.error('Webhook signature error:', err.message)
      return new Response(`Webhook Error: ${err.message}`, { status: 400 })
    }

    console.log('Stripe webhook event:', event.type)

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session

      // Find user — try client_reference_id first (set by checkout.tsx), then email
      let clerkUser: any = null
      const clientRefId = session.client_reference_id
      const customerEmail = session.customer_details?.email || session.customer_email

      if (clientRefId) {
        console.log('Looking up user by client_reference_id:', clientRefId)
        clerkUser = await findClerkUserById(clientRefId)
      }

      if (!clerkUser && customerEmail) {
        console.log('Looking up user by email:', customerEmail)
        clerkUser = await findClerkUserByEmail(customerEmail)
      }

      if (!clerkUser) {
        console.error('Could not find Clerk user for session:', session.id)
        return new Response('ok', { status: 200 })
      }

      // Determine plan from amount
      const amountTotal = session.amount_total ?? 0
      const plan = amountTotal <= 399 ? 'payg' : 'monthly'
      const planLabel = plan === 'monthly' ? 'Monthly' : 'Pay As You Go'
      const allowance = PLAN_ALLOWANCES[plan]

      // For PAYG: add to existing balance (top-up). For monthly: reset to 100.
      let generationsRemaining = allowance
      if (plan === 'payg') {
        const existing = (clerkUser.public_metadata?.generationsRemaining as number) ?? 0
        generationsRemaining = existing + allowance
      }

      await updateClerkMetadata(clerkUser.id, {
        plan,
        planLabel,
        planActivatedAt: new Date().toISOString(),
        stripeSessionId: session.id,
        stripeCustomerId: session.customer as string,
        generationsRemaining,
        generationsAllowance: allowance,
      })

      console.log(`Updated user ${clerkUser.id} to plan ${plan} with ${generationsRemaining} generations`)
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
          console.log(`Reset monthly generations for user ${user.id}`)
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
          generationsAllowance: 0,
        })
        console.log(`Revoked plan for user ${user.id}`)
      }
    }

    return new Response('ok', { status: 200 })
  },
})
