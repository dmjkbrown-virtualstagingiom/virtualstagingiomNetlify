import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
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

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  return isMobile
}

function Home() {
  const { user, isLoaded } = useUser()
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const [showAfter, setShowAfter] = useState(false)

  // Redirect signed-in users straight to their dashboard
  useEffect(() => {
    if (isLoaded && user) {
      const userType = user.unsafeMetadata?.userType as string | undefined
      navigate({ to: userType === 'agent' ? '/agent-dashboard' : '/buyer-dashboard' })
    }
  }, [isLoaded, user])

  // Auto-toggle before/after every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => setShowAfter(prev => !prev), 3000)
    return () => clearInterval(interval)
  }, [])

  // Still loading — show nothing to avoid flash
  if (!isLoaded) return null

  // Signed in — redirect handled above, show nothing
  if (user) return null

  return (
    <div style={{ minHeight: 'calc(100vh - 72px)', background: S.ink, color: S.cream }}>

      {/* Hero section */}
      <div style={{
        maxWidth: '1100px', margin: '0 auto',
        padding: isMobile ? '48px 20px 40px' : '80px 48px 64px',
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
        gap: isMobile ? '40px' : '64px',
        alignItems: 'center',
      }}>

        {/* Left: text */}
        <div>
          <p style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: S.gold, marginBottom: '16px', fontWeight: 500 }}>
            AI Interior Redesign
          </p>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: isMobile ? '36px' : '52px',
            fontWeight: 300, lineHeight: 1.1,
            marginBottom: '24px', color: S.cream,
          }}>
            See your home{' '}
            <em style={{ color: S.gold, fontStyle: 'italic' }}>reimagined</em>{' '}
            before you commit
          </h1>
          <p style={{ fontSize: '16px', color: 'rgba(245,240,232,0.7)', lineHeight: 1.8, marginBottom: '16px' }}>
            Upload photos of any room and watch AI transform them into your dream interior style — in seconds. Choose from 10 styles including Japandi, Coastal, Minimalist, and more.
          </p>
          <p style={{ fontSize: '14px', color: S.muted, lineHeight: 1.7, marginBottom: '40px' }}>
            Whether you're buying a property and imagining the possibilities, or planning a renovation and want to see it first — Virtual Staging IOM gives you a photorealistic preview before you spend a penny.
          </p>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link
              to="/sign-up"
              style={{
                background: S.gold, color: S.white,
                padding: '14px 32px', borderRadius: '2px',
                fontSize: '13px', fontWeight: 500,
                letterSpacing: '0.1em', textTransform: 'uppercase',
                textDecoration: 'none', fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Get started free
            </Link>
            <Link
              to="/sign-in"
              style={{
                background: 'transparent', color: S.cream,
                padding: '14px 32px', borderRadius: '2px',
                border: '1px solid rgba(245,240,232,0.25)',
                fontSize: '13px', fontWeight: 500,
                letterSpacing: '0.1em', textTransform: 'uppercase',
                textDecoration: 'none', fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Sign in
            </Link>
          </div>

          <p style={{ fontSize: '12px', color: S.muted, marginTop: '16px' }}>
            ✓ 3 free AI generations included &nbsp;·&nbsp; No credit card required
          </p>
        </div>

        {/* Right: before/after image toggle */}
        <div>
          <div style={{ position: 'relative', borderRadius: '4px', overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.4)' }}>

            {/* Before image */}
            <img
              src="/Before.png"
              alt="Room before redesign"
              style={{
                width: '100%', display: 'block',
                aspectRatio: '4/3', objectFit: 'cover',
                position: showAfter ? 'absolute' : 'relative',
                top: 0, left: 0,
                opacity: showAfter ? 0 : 1,
                transition: 'opacity 0.8s ease',
              }}
            />

            {/* After image */}
            <img
              src="/After.png"
              alt="Room after Japandi redesign"
              style={{
                width: '100%', display: 'block',
                aspectRatio: '4/3', objectFit: 'cover',
                position: showAfter ? 'relative' : 'absolute',
                top: 0, left: 0,
                opacity: showAfter ? 1 : 0,
                transition: 'opacity 0.8s ease',
              }}
            />

            {/* Before/After badge */}
            <div style={{
              position: 'absolute', top: '12px', left: '12px',
              background: 'rgba(26,22,18,0.8)', backdropFilter: 'blur(4px)',
              color: S.cream, fontSize: '11px', fontWeight: 500,
              letterSpacing: '0.12em', textTransform: 'uppercase',
              padding: '5px 12px', borderRadius: '2px',
            }}>
              {showAfter ? 'After — Japandi Style' : 'Before'}
            </div>

            {/* AI Visualisation badge */}
            {showAfter && (
              <div style={{
                position: 'absolute', top: '12px', right: '12px',
                background: 'rgba(184,150,90,0.9)',
                color: S.white, fontSize: '10px',
                padding: '4px 10px', borderRadius: '2px',
                letterSpacing: '0.08em',
              }}>
                AI Visualisation
              </div>
            )}
          </div>

          {/* Toggle buttons */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            {[{ label: 'Before', active: !showAfter }, { label: 'After', active: showAfter }].map(({ label, active }) => (
              <button
                key={label}
                onClick={() => setShowAfter(label === 'After')}
                style={{
                  flex: 1, padding: '8px',
                  background: active ? 'rgba(184,150,90,0.2)' : 'transparent',
                  border: `1px solid ${active ? S.gold : 'rgba(255,255,255,0.15)'}`,
                  color: active ? S.gold : 'rgba(245,240,232,0.4)',
                  borderRadius: '2px', fontSize: '12px',
                  fontWeight: 500, letterSpacing: '0.08em',
                  textTransform: 'uppercase', cursor: 'pointer',
                  fontFamily: "'DM Sans', sans-serif",
                  transition: 'all 0.2s',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* How it works */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: isMobile ? '48px 20px' : '64px 48px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <p style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: S.gold, marginBottom: '32px', fontWeight: 500, textAlign: 'center' }}>
            How it works
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
            gap: '32px',
          }}>
            {[
              { step: '01', title: 'Upload your photos', desc: 'Take photos of any room and upload up to 5 at a time. Label each room type so the AI knows what it\'s working with.' },
              { step: '02', title: 'Choose a style', desc: 'Pick from 10 interior styles — Japandi, Coastal, Minimalist, Urban Masculine, and more. The AI redesigns every room to match.' },
              { step: '03', title: 'Download and save', desc: 'Get photorealistic results in under a minute. Download your favourites or save them to your account to revisit anytime.' },
            ].map(({ step, title, desc }) => (
              <div key={step} style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                <div style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: '32px', fontWeight: 300,
                  color: 'rgba(184,150,90,0.4)', flexShrink: 0,
                  lineHeight: 1,
                }}>
                  {step}
                </div>
                <div>
                  <p style={{ fontSize: '15px', fontWeight: 500, color: S.cream, marginBottom: '8px' }}>{title}</p>
                  <p style={{ fontSize: '13px', color: S.muted, lineHeight: 1.7 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Styles strip */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: isMobile ? '40px 20px' : '48px', textAlign: 'center' }}>
        <p style={{ fontSize: '13px', color: S.muted, marginBottom: '20px' }}>10 interior styles to choose from</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
          {['Japandi', 'Coastal', 'Minimalist', 'Whites', 'Scandinavian', 'Modern Farmhouse', 'Luxury Modern', 'Urban Masculine', 'Biophilic', 'Maximalist'].map(style => (
            <span key={style} style={{
              padding: '6px 14px',
              border: '1px solid rgba(184,150,90,0.3)',
              borderRadius: '20px', fontSize: '12px',
              color: 'rgba(245,240,232,0.6)',
              fontFamily: "'DM Sans', sans-serif",
            }}>
              {style}
            </span>
          ))}
        </div>
      </div>

      {/* CTA footer */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: isMobile ? '48px 20px' : '64px 48px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: isMobile ? '28px' : '40px', fontWeight: 300, marginBottom: '16px', color: S.cream }}>
          Ready to see your home{' '}
          <em style={{ color: S.gold }}>transformed?</em>
        </h2>
        <p style={{ fontSize: '14px', color: S.muted, marginBottom: '32px' }}>
          Create a free account and get 3 AI generations to try it out.
        </p>
        <Link
          to="/sign-up"
          style={{
            display: 'inline-block',
            background: S.gold, color: S.white,
            padding: '16px 48px', borderRadius: '2px',
            fontSize: '13px', fontWeight: 500,
            letterSpacing: '0.12em', textTransform: 'uppercase',
            textDecoration: 'none', fontFamily: "'DM Sans', sans-serif",
          }}
        >
          Get started free
        </Link>
      </div>

    </div>
  )
}
