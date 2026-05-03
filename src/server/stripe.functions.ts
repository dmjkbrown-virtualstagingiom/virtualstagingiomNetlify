import { createServerFn } from '@tanstack/react-start'
import Stripe from 'stripe'

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-06-20',
    timeout: 8000, // 8 second timeout, under Netlify's 10s function limit
  })
}

// Helper: update Clerk user metadata via REST API
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

// Helper: get Clerk user via REST API
async function getClerkUser(userId: string) {
  const res = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
    headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` },
  })
  if (!res.ok) throw new Error(`Clerk user fetch failed: ${res.status}`)
  return res.json()
}

// Create a Stripe Checkout session and return the URL
export const createCheckoutSessionFn = createServerFn(
  'POST',
  async (data: {
    priceId: string
    userId: string
    userEmail: string
    mode: 'payment' | 'subscription'
  }) => {
    if (!data.priceId) throw new Error('No price ID provided')
    if (!process.env.STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY not set')

    const stripe = getStripe()

    try {
      const session = await stripe.checkout.sessions.create({
        mode: data.mode,
        payment_method_types: ['card'],
        line_items: [{ price: data.priceId, quantity: 1 }],
        success_url: `https://virtualstagingiom.com/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `https://virtualstagingiom.com/buyer-dashboard`,
        customer_email: data.userEmail,
        metadata: {
          userId: data.userId,
          priceId: data.priceId,
        },
      })

      return { url: session.url, error: null }
    } catch (err: any) {
      console.error('Stripe checkout error:', err.message)
      throw new Error(err.message)
    }
  }
)

// Decrement a user's generation count by 1
export const decrementGenerationsFn = createServerFn(
  'POST',
  async (data: { userId: string }) => {
    const user = await getClerkUser(data.userId)
    const current = (user.public_metadata?.generationsRemaining as number) ?? 0
    const updated = Math.max(0, current - 1)

    await updateClerkMetadata(data.userId, {
      ...user.public_metadata,
      generationsRemaining: updated,
    })

    return { generationsRemaining: updated }
  }
)

// Get current generation count for a user
export const getGenerationsFn = createServerFn(
  'GET',
  async (data: { userId: string }) => {
    const user = await getClerkUser(data.userId)
    const generationsRemaining = (user.public_metadata?.generationsRemaining as number) ?? 0
    const plan = (user.public_metadata?.plan as string) ?? 'free'
    return { generationsRemaining, plan }
  }
)
