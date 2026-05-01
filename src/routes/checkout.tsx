import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import React from 'react'
import { useUser, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react'
import { createCheckoutSessionFn } from '../server/stripe.functions'

export const Route = createFileRoute('/checkout')({
  component: CheckoutPage,
})

const S = {
  ink: '#1a1612', cream: '#f5f0e8', warm: '#e8dcc8',
  gold: '#b8965a', goldLight: '#d4b07a', muted: '#8a7f72',
  surface: '#faf7f2', white: '#ffffff',
} as const

const PLANS = [
  {
    id: 'payg',
    name: 'Pay As You Go',
    price: '\u00a33.99',
    unit: 'one-off',
    mode: 'payment' as const,
    desc: '15 photo generations to use whenever you like. Top up anytime you need more.',
    features: ['15 photo generations', 'All 8 interior styles', 'Download generated images', 'Save to your account', 'Never expires'],
    highlight: false,
  },
  {
    id: 'monthly',
    name: 'Monthly',
    price: '\u00a37.99',
    unit: 'per month',
    mode: 'subscription' as const,
    desc: '100 photo generations every month, automatically renewed. Cancel anytime.',
    features: ['100 generations per month', 'All 8 interior styles', 'Download generated images', 'Save to your account', 'Monthly top-up included', 'Cancel anytime'],
    highlight: true,
  },
]

function CheckoutPage() {
  return (
    <>
      <SignedOut><RedirectToSignIn /></SignedOut>
      <SignedIn><CheckoutContent /></SignedIn>
    </>
  )
}

function CheckoutContent() {
  const { user } = useUser()
  const navigate = useNavigate()
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const [error, setError] = useState('')

  const handleCheckout = async (plan: typeof PLANS[0]) => {
    if (!user) return
    setLoadingPlan(plan.id)
    setError('')

    const priceId = plan.id === 'payg'
      ? import.meta.env.VITE_STRIPE_PRICE_PAYG
      : import.meta.env.VITE_STRIPE_PRICE_MONTHLY

    try {
      const result = await createCheckoutSessionFn({
        priceId,
        userId: user.id,
        userEmail: user.primaryEmailAddress?.emailAddress ?? '',
        mode: plan.mode,
      })
      if (result.url) {
        window.location.href = result.url
      }
    } catch (err: any) {
      setError('Could not start checkout. Please try again.')
      setLoadingPlan(null)
    }
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 72px)', background: S.surface }}>
      <div style={{ background: S.ink, padding: '56px 48px 64px', color: S.cream, textAlign: 'center' }}>
        <p style={{ fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: S.gold, marginBottom: '12px' }}>Upgrade</p>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 300, marginBottom: '16px' }}>
          Choose your <em style={{ color: S.goldLight }}>plan</em>
        </h1>
        <p style={{ color: S.muted, fontSize: '15px', maxWidth: '480px', margin: '0 auto', lineHeight: 1.7 }}>
          Unlock AI interior redesigns and see your home through fresh eyes.
        </p>
      </div>

      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '64px 48px' }}>
        {error && (
          <p style={{ fontSize: '13px', color: '#c0392b', padding: '12px 16px', background: '#fef0ef', borderRadius: '4px', marginBottom: '32px', textAlign: 'center' }}>
            {error}
          </p>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {PLANS.map(plan => (
            <div
              key={plan.id}
              style={{
                background: plan.highlight ? S.ink : S.white,
                borderRadius: '8px', padding: '40px 32px',
                border: `2px solid ${plan.highlight ? S.gold : S.warm}`,
                boxShadow: plan.highlight ? '0 16px 48px rgba(26,22,18,0.2)' : '0 4px 24px rgba(26,22,18,0.06)',
                position: 'relative',
              }}
            >
              {plan.highlight && (
                <div style={{
                  position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)',
                  background: S.gold, color: S.white, fontSize: '10px', fontWeight: 600,
                  letterSpacing: '0.14em', textTransform: 'uppercase', padding: '4px 16px', borderRadius: '20px',
                }}>
                  Most popular
                </div>
              )}

              <p style={{ fontSize: '12px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: plan.highlight ? S.gold : S.muted, marginBottom: '16px' }}>
                {plan.name}
              </p>
              <div style={{ marginBottom: '8px' }}>
                <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '48px', fontWeight: 300, color: plan.highlight ? S.cream : S.ink, lineHeight: 1 }}>
                  {plan.price}
                </span>
                <span style={{ fontSize: '13px', color: S.muted, marginLeft: '6px' }}>{plan.unit}</span>
              </div>
              <p style={{ fontSize: '13px', color: plan.highlight ? 'rgba(245,240,232,0.6)' : S.muted, marginBottom: '28px', lineHeight: 1.6 }}>
                {plan.desc}
              </p>

              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {plan.features.map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: plan.highlight ? S.cream : S.ink }}>
                    <span style={{ width: '18px', height: '18px', borderRadius: '50%', background: plan.highlight ? 'rgba(184,150,90,0.3)' : '#f0ede6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={S.gold} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    </span>
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleCheckout(plan)}
                disabled={loadingPlan !== null}
                style={{
                  width: '100%', padding: '14px',
                  background: plan.highlight ? S.gold : 'transparent',
                  color: plan.highlight ? S.white : S.gold,
                  border: `1.5px solid ${S.gold}`, borderRadius: '2px',
                  fontSize: '13px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase',
                  cursor: loadingPlan !== null ? 'wait' : 'pointer',
                  fontFamily: "'DM Sans', sans-serif",
                  opacity: loadingPlan !== null && loadingPlan !== plan.id ? 0.5 : 1,
                  transition: 'all 0.2s',
                }}
              >
                {loadingPlan === plan.id ? 'Redirecting to Stripe...' : `Get ${plan.name}`}
              </button>
            </div>
          ))}
        </div>

        <p style={{ textAlign: 'center', fontSize: '12px', color: S.muted, marginTop: '32px', lineHeight: 1.6 }}>
          Payments processed securely by Stripe. Monthly plans can be cancelled anytime from your dashboard.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px', gap: '24px' }}>
          {['\uD83D\uDD12 Secure checkout', '\uD83D\uDCB3 All major cards', '\u21A9\uFE0F Cancel anytime'].map(item => (
            <span key={item} style={{ fontSize: '12px', color: S.muted }}>{item}</span>
          ))}
        </div>
      </main>
    </div>
  )
}
