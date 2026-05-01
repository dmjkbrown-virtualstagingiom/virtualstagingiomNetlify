import { createServerFn } from '@tanstack/react-start'
import Stripe from 'stripe'
import { clerkClient } from '@clerk/clerk-sdk-node'

// Generation allowances per plan
const PLAN_ALLOWANCES = {
  payg: 15,
  monthly: 100,
  free: 0,
}

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-11-20.acacia',
  })
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
    const stripe = getStripe()

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

    return { url: session.url }
  }
)

// Decrement a user's generation count by 1 — called each time an image is generated
export const decrementGenerationsFn = createServerFn(
  'POST',
  async (data: { userId: string }) => {
    const user = await clerkClient.users.getUser(data.userId)
    const current = (user.publicMetadata?.generationsRemaining as number) ?? 0
    const updated = Math.max(0, current - 1)

    await clerkClient.users.updateUserMetadata(data.userId, {
      publicMetadata: {
        ...user.publicMetadata,
        generationsRemaining: updated,
      },
    })

    return { generationsRemaining: updated }
  }
)

// Get current generation count for a user
export const getGenerationsFn = createServerFn(
  'GET',
  async (data: { userId: string }) => {
    const user = await clerkClient.users.getUser(data.userId)
    const generationsRemaining = (user.publicMetadata?.generationsRemaining as number) ?? 0
    const plan = (user.publicMetadata?.plan as string) ?? 'free'
    return { generationsRemaining, plan }
  }
)
