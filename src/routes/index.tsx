import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import React from 'react'
import { useUser } from '@clerk/clerk-react'

export const Route = createFileRoute('/')({
  component: Home,
})

const S = {
  ink: '#1a1612', cream: '#f5f0e8', warm: '#e8dcc8',
  gold: '#b8965a', goldLight: '#d4b07a', muted: '#8a7f72',
  surface: '#faf7f2', white: '#ffffff',
} as const

function Home() {
  const { user, isLoaded } = useUser()
  const navigate = useNavigate()

  // Redirect signed-out users to sign-up
  useEffect(() => {
    if (isLoaded && !user) {
      navigate({ to: '/sign-up' })
    }
  }, [isLoaded, user])

  // Redirect signed-in users to their dashboard
  useEffect(() => {
    if (isLoaded && user) {
      const userType = user.unsafeMetadata?.userType as string | undefined
      navigate({ to: userType === 'agent' ? '/agent-dashboard' : '/buyer-dashboard' })
    }
  }, [isLoaded, user])

  // Show nothing while redirecting
  return (
    <div style={{ minHeight: 'calc(100vh - 72px)', background: S.surface, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '32px', fontWeight: 300, color: S.ink, marginBottom: '8px' }}>
          Virtual Staging <em style={{ color: S.gold }}>IOM</em>
        </p>
        <p style={{ fontSize: '14px', color: S.muted }}>Loading...</p>
      </div>
    </div>
  )
}
