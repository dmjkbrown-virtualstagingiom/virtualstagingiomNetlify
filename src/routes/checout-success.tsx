import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import React from 'react'
import { useUser } from '@clerk/clerk-react'

export const Route = createFileRoute('/checkout-success')({
  component: CheckoutSuccess,
})

const S = {
  ink: '#1a1612', cream: '#f5f0e8', warm: '#e8dcc8',
  gold: '#b8965a', goldLight: '#d4b07a', muted: '#8a7f72',
  surface: '#faf7f2', white: '#ffffff',
} as const

function CheckoutSuccess() {
  const navigate = useNavigate()
  const { user, isLoaded } = useUser()
  const [countdown, setCountdown] = useState(5)

  // Reload user so we get fresh metadata from Clerk after webhook fires
  useEffect(() => {
    if (isLoaded && user) {
      user.reload()
    }
  }, [isLoaded])

  // Count down and redirect to dashboard
  useEffect(() => {
    if (countdown <= 0) {
      navigate({ to: '/buyer-dashboard' })
      return
    }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  return (
    <div style={{ minHeight: 'calc(100vh - 72px)', background: S.surface, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px' }}>
      <div style={{ textAlign: 'center', maxWidth: '480px' }}>
        <div style={{
          width: '72px', height: '72px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #b8965a, #d4b07a)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 32px',
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '40px', fontWeight: 300, color: S.ink, marginBottom: '16px' }}>
          Payment <em style={{ color: S.gold }}>confirmed</em>
        </h1>
        <p style={{ fontSize: '15px', color: S.muted, lineHeight: 1.7, marginBottom: '8px' }}>
          Thank you{user?.firstName ? `, ${user.firstName}` : ''}! Your plan has been activated and you're ready to start reimagining rooms.
        </p>
        <p style={{ fontSize: '13px', color: S.muted, marginBottom: '40px' }}>
          Redirecting to your dashboard in {countdown} second{countdown !== 1 ? 's' : ''}...
        </p>

        <button
          onClick={() => navigate({ to: '/buyer-dashboard' })}
          style={{
            background: S.gold, color: S.white, padding: '14px 40px',
            borderRadius: '2px', border: 'none', fontSize: '13px',
            fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase',
            cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
          }}
        >
          Go to dashboard now
        </button>
      </div>
    </div>
  )
}
