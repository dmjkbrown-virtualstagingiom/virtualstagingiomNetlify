import { createAPIFileRoute } from '@tanstack/react-start/api'
import Stripe from 'stripe'
import { clerkClient } from '@clerk/express'

// How many generations each plan grants
const PLAN_ALLOWANCES: Record<string, number> = {
  payg: 15,
  monthly: 100,
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
        const paygPriceId = process.env.STRIPE_PRICE_PAYG
        const monthlyPriceId = process.env.STRIPE_PRICE_MONTHLY

        const plan = priceId === monthlyPriceId ? 'monthly' : 'payg'
        const planLabel = priceId === monthlyPriceId ? 'Monthly' : 'Pay As You Go'
        const allowance = PLAN_ALLOWANCES[plan]

        // For Pay As You Go: add 15 to any existing balance (top-up behaviour)
        // For Monthly: always reset to 100
        let generationsRemaining = allowance
        if (plan === 'payg') {
          try {
            const existingUser = await clerkClient.users.getUser(userId)
            const existing = (existingUser.publicMetadata?.generationsRemaining as number) ?? 0
            generationsRemaining = existing + allowance
          } catch {
            generationsRemaining = allowance
          }
        }

        await clerkClient.users.updateUserMetadata(userId, {
          publicMetadata: {
            plan,
            planLabel,
            planActivatedAt: new Date().toISOString(),
            stripeSessionId: session.id,
            stripeCustomerId: session.customer as string,
            generationsRemaining,
            generationsAllowance: allowance,
          },
        })
      }
    }

    // Monthly subscription renewal — top up to 100 again
    if (event.type === 'invoice.payment_succeeded') {
      const invoice = event.data.object as Stripe.Invoice
      const customerId = invoice.customer as string

      // Only handle renewal invoices (not the first payment which is covered above)
      if (invoice.billing_reason === 'subscription_cycle') {
        const users = await clerkClient.users.getUserList({ limit: 100 })
        const user = users.data.find(
          (u) => u.publicMetadata?.stripeCustomerId === customerId
        )
        if (user && user.publicMetadata?.plan === 'monthly') {
          await clerkClient.users.updateUserMetadata(user.id, {
            publicMetadata: {
              ...user.publicMetadata,
              generationsRemaining: 100,
              planActivatedAt: new Date().toISOString(),
            },
          })
        }
      }
    }

    // Subscription cancelled — remove plan
    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription
      const customerId = subscription.customer as string

      const users = await clerkClient.users.getUserList({ limit: 100 })
      const user = users.data.find(
        (u) => u.publicMetadata?.stripeCustomerId === customerId
      )
      if (user) {
        await clerkClient.users.updateUserMetadata(user.id, {
          publicMetadata: {
            plan: 'free',
            planLabel: 'Free Trial',
            planActivatedAt: null,
            generationsRemaining: 0,
          },
        })
      }
    }

    return new Response('ok', { status: 200 })
  },
})
