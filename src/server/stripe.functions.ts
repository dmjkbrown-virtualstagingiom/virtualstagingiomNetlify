import { createServerFn } from '@tanstack/react-start'
import Stripe from 'stripe'

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-06-20',
    timeout: 8000,
  })
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
    throw new Error(`Clerk update failed: ${res.status}`)
  }
  return res.json()
}

async function getClerkUser(userId: string) {
  const res = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
    headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` },
  })
  if (!res.ok) throw new Error(`Clerk user fetch failed: ${res.status}`)
  return res.json()
}

export const createCheckoutSessionFn = createServerFn({ method: 'POST' })
  .inputValidator((input: { priceId: string; userId: string; userEmail: string; mode: 'payment' | 'subscription' }) => input)
  .handler(async ({ data }) => {
    if (!data.priceId) throw new Error('No price ID provided')
    if (!process.env.STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY not set')

    const stripe = getStripe()
    console.log('Creating Stripe session for priceId:', data.priceId, 'userId:', data.userId)

    try {
      const session = await stripe.checkout.sessions.create({
        mode: data.mode,
        payment_method_types: ['card'],
        line_items: [{ price: data.priceId, quantity: 1 }],
        success_url: `https://virtualstagingiom.com/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `https://virtualstagingiom.com/buyer-dashboard`,
        customer_email: data.userEmail,
        metadata: { userId: data.userId, priceId: data.priceId },
      })
      console.log('Session created, url:', session.url ? 'yes' : 'null')
      return { url: session.url, error: null }
    } catch (err: any) {
      console.error('Stripe checkout error:', err.message)
      throw new Error(err.message)
    }
  })

export const decrementGenerationsFn = createServerFn({ method: 'POST' })
  .inputValidator((input: { userId: string }) => input)
  .handler(async ({ data }) => {
    console.log('decrementGenerationsFn called for userId:', data.userId)
    const user = await getClerkUser(data.userId)

    const isPaidUser = user.public_metadata?.plan && user.public_metadata.plan !== 'free'
    const current = isPaidUser
      ? (user.public_metadata?.generationsRemaining as number) ?? 0
      : (user.unsafe_metadata?.generationsRemaining as number) ?? 0

    const updated = Math.max(0, current - 1)
    console.log('Decrementing from', current, 'to', updated)

    if (isPaidUser) {
      await updateClerkMetadata(data.userId, {
        ...user.public_metadata,
        generationsRemaining: updated,
      })
    } else {
      const res = await fetch(`https://api.clerk.com/v1/users/${data.userId}/metadata`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ unsafe_metadata: { ...user.unsafe_metadata, generationsRemaining: updated } }),
      })
      if (!res.ok) console.error('Failed to update free tier generations')
    }

    console.log('Decrement complete, new value:', updated)
    return { generationsRemaining: updated }
  })

export const getGenerationsFn = createServerFn({ method: 'GET' })
  .inputValidator((input: { userId: string }) => input)
  .handler(async ({ data }) => {
    const user = await getClerkUser(data.userId)
    const generationsRemaining = (user.public_metadata?.generationsRemaining as number) ?? (user.unsafe_metadata?.generationsRemaining as number) ?? 0
    const plan = (user.public_metadata?.plan as string) ?? 'free'
    return { generationsRemaining, plan }
  })
