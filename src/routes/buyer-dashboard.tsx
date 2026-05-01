import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import React from 'react'
import { useUser, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react'
import { getDesignsFn, deleteDesignFn } from '../server/designs.functions'

export const Route = createFileRoute('/buyer-dashboard')({
  component: BuyerDashboard,
})

const S = {
  ink: '#1a1612', cream: '#f5f0e8', warm: '#e8dcc8',
  gold: '#b8965a', goldLight: '#d4b07a', muted: '#8a7f72',
  surface: '#faf7f2', white: '#ffffff',
} as const

interface SavedDesign {
  id: string
  roomLabel: string
  styleName: string
  afterUrl: string
  savedAt: string
}

function BuyerDashboard() {
  return (
    <>
      <SignedOut><RedirectToSignIn /></SignedOut>
      <SignedIn><BuyerDashboardContent /></SignedIn>
    </>
  )
}

function BuyerDashboardContent() {
  const { user } = useUser()
  const navigate = useNavigate()
  const [designs, setDesigns] = useState<SavedDesign[]>([])
  const [loadingDesigns, setLoadingDesigns] = useState(true)
  const [activeSection, setActiveSection] = useState<'overview' | 'designs'>('overview')

  const firstName = user?.firstName || 'there'

  // Plan + generation info from Clerk public metadata
  const plan = (user?.publicMetadata?.plan as string) || 'free'
  const planLabel = (user?.publicMetadata?.planLabel as string) || 'Free Trial'
  const generationsRemaining = (user?.publicMetadata?.generationsRemaining as number) ?? 0
  const generationsAllowance = (user?.publicMetadata?.generationsAllowance as number) ?? 0
  const isPaid = plan === 'monthly' || plan === 'payg'

  // Generation progress bar percentage
  const usedPct = generationsAllowance > 0
    ? Math.round(((generationsAllowance - generationsRemaining) / generationsAllowance) * 100)
    : 0

  useEffect(() => {
    if (!user) return
    setLoadingDesigns(true)
    getDesignsFn({ userId: user.id })
      .then(data => setDesigns(data.designs || []))
      .catch(() => setDesigns([]))
      .finally(() => setLoadingDesigns(false))
  }, [user])

  async function deleteDesign(designId: string) {
    if (!user) return
    setDesigns(prev => prev.filter(d => d.id !== designId))
    await deleteDesignFn({ userId: user.id, designId }).catch(console.error)
  }

  async function downloadImage(url: string, filename: string) {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const objectUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = objectUrl
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(objectUrl)
    } catch {
      window.open(url, '_blank')
    }
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 72px)', background: S.surface }}>
      <div style={{ background: S.ink, padding: '48px', color: S.cream }}>
        <p style={{ fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: S.gold, marginBottom: '12px' }}>My Account</p>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '40px', fontWeight: 300, marginBottom: '8px' }}>
          Welcome back, <em style={{ color: S.goldLight }}>{firstName}</em>
        </h1>
        <p style={{ color: S.muted, fontSize: '14px', marginBottom: '32px' }}>Visualise your dream home before you buy</p>

        <div style={{ display: 'flex', gap: '0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          {(['overview', 'designs'] as const).map(section => (
            <button
              key={section}
              onClick={() => setActiveSection(section)}
              style={{
                background: 'transparent', border: 'none', padding: '10px 24px 12px',
                fontSize: '12px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase',
                color: activeSection === section ? S.gold : 'rgba(245,240,232,0.4)',
                cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                borderBottom: `2px solid ${activeSection === section ? S.gold : 'transparent'}`,
                marginBottom: '-1px', transition: 'all 0.2s',
              }}
            >
              {section === 'overview' ? 'Overview' : `My Designs${designs.length > 0 ? ` (${designs.length})` : ''}`}
            </button>
          ))}
        </div>
      </div>

      <main style={{ maxWidth: '960px', margin: '0 auto', padding: '56px 48px' }}>

        {activeSection === 'overview' && (
          <>
            {/* Plan + generation status card */}
            <div style={{ background: S.white, borderRadius: '4px', padding: '32px', marginBottom: '32px', boxShadow: '0 2px 16px rgba(26,22,18,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: isPaid ? '24px' : '0' }}>
                <div>
                  <p style={{ fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: S.muted, marginBottom: '6px' }}>Current Plan</p>
                  <p style={{ fontSize: '20px', fontWeight: 500, color: S.ink, marginBottom: '4px' }}>{planLabel}</p>
                  <p style={{ fontSize: '13px', color: S.muted }}>
                    {plan === 'free' && 'No active plan — purchase below to get started'}
                    {plan === 'payg' && `${generationsRemaining} of 15 generations remaining`}
                    {plan === 'monthly' && `${generationsRemaining} of 100 generations remaining this month`}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {(!isPaid || plan === 'payg') && (
                    <button
                      onClick={() => navigate({ to: '/checkout' })}
                      style={{ background: S.gold, color: S.white, padding: '12px 28px', borderRadius: '2px', border: 'none', fontSize: '12px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
                    >
                      {plan === 'payg' ? 'Top up / Go monthly' : 'Get started'}
                    </button>
                  )}
                </div>
              </div>

              {/* Generation progress bar — only shown on paid plans */}
              {isPaid && generationsAllowance > 0 && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '11px', color: S.muted, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Generations used</span>
                    <span style={{ fontSize: '11px', color: generationsRemaining === 0 ? '#c0392b' : S.muted }}>
                      {generationsAllowance - generationsRemaining} / {generationsAllowance}
                    </span>
                  </div>
                  <div style={{ height: '6px', background: S.warm, borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: '3px', transition: 'width 0.4s ease',
                      width: `${usedPct}%`,
                      background: usedPct >= 90 ? '#c0392b' : usedPct >= 70 ? '#e67e22' : S.gold,
                    }} />
                  </div>
                  {generationsRemaining === 0 && (
                    <p style={{ fontSize: '12px', color: '#c0392b', marginTop: '8px' }}>
                      You've used all your generations.{' '}
                      <button onClick={() => navigate({ to: '/checkout' })} style={{ background: 'none', border: 'none', color: '#c0392b', textDecoration: 'underline', cursor: 'pointer', fontSize: '12px', padding: 0 }}>
                        Top up or upgrade
                      </button>
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Quick actions */}
            <p style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.16em', textTransform: 'uppercase', color: S.gold, marginBottom: '20px' }}>
              Quick Actions
              <span style={{ display: 'inline-block', marginLeft: '12px', height: '1px', background: S.warm, verticalAlign: 'middle', width: '100px' }} />
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px', marginBottom: '48px' }}>
              <ActionCard
                title="Redesign a Room"
                desc={generationsRemaining > 0 ? `You have ${generationsRemaining} generation${generationsRemaining !== 1 ? 's' : ''} remaining` : 'Purchase a plan to start redesigning rooms'}
                cta={generationsRemaining > 0 ? 'Start redesigning' : 'Get generations'}
                onClick={() => generationsRemaining > 0 ? navigate({ to: '/tool' }) : navigate({ to: '/checkout' })}
              />
              <ActionCard
                title={plan === 'payg' ? 'Top Up' : 'Pricing Plans'}
                desc={plan === 'payg' ? 'Running low? Buy another 15 generations or switch to monthly for 100/month.' : 'Get 15 generations for \u00a33.99 or 100/month for \u00a37.99'}
                cta={plan === 'payg' ? 'Top up now' : 'View plans'}
                onClick={() => navigate({ to: '/checkout' })}
              />
              <ActionCard
                title="My Designs"
                desc={designs.length > 0 ? `You have ${designs.length} saved design${designs.length !== 1 ? 's' : ''}` : 'View and download your previously generated room designs'}
                cta={designs.length > 0 ? `View ${designs.length} design${designs.length !== 1 ? 's' : ''}` : 'No designs yet'}
                onClick={() => setActiveSection('designs')}
                disabled={designs.length === 0}
              />
            </div>

            {/* Pricing plans */}
            <p style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.16em', textTransform: 'uppercase', color: S.gold, marginBottom: '20px' }}>Pricing</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
              {[
                { name: 'Pay As You Go', price: '\u00a33.99', unit: 'one-off', desc: '15 photo generations. Top up anytime.', highlight: false },
                { name: 'Monthly', price: '\u00a37.99', unit: 'per month', desc: '100 generations/month. Cancel anytime.', highlight: true },
              ].map((p) => (
                <div key={p.name} style={{ background: p.highlight ? S.ink : S.white, borderRadius: '4px', padding: '28px 24px', border: `2px solid ${p.highlight ? S.gold : S.warm}`, boxShadow: p.highlight ? '0 8px 32px rgba(26,22,18,0.15)' : '0 2px 12px rgba(26,22,18,0.06)' }}>
                  <p style={{ fontSize: '12px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: p.highlight ? S.gold : S.muted, marginBottom: '12px' }}>{p.name}</p>
                  <p style={{ fontSize: '32px', fontWeight: 300, fontFamily: "'Cormorant Garamond', serif", color: p.highlight ? S.cream : S.ink }}>{p.price}</p>
                  <p style={{ fontSize: '12px', color: S.muted, marginBottom: '16px' }}>{p.unit}</p>
                  <p style={{ fontSize: '13px', color: p.highlight ? 'rgba(245,240,232,0.6)' : S.muted, marginBottom: '24px', lineHeight: 1.5 }}>{p.desc}</p>
                  <button
                    onClick={() => navigate({ to: '/checkout' })}
                    style={{ width: '100%', background: p.highlight ? S.gold : 'transparent', color: p.highlight ? S.white : S.gold, padding: '10px', borderRadius: '2px', border: `1px solid ${S.gold}`, fontSize: '12px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
                  >
                    {plan === 'payg' && !p.highlight ? 'Top up' : 'Choose plan'}
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {activeSection === 'designs' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <div>
                <p style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.16em', textTransform: 'uppercase', color: S.gold, marginBottom: '6px' }}>My Designs</p>
                <p style={{ fontSize: '13px', color: S.muted }}>
                  {loadingDesigns ? 'Loading...' : designs.length === 0 ? 'No saved designs yet' : `${designs.length} saved design${designs.length !== 1 ? 's' : ''}`}
                </p>
              </div>
              <button
                onClick={() => navigate({ to: '/tool' })}
                style={{ background: S.gold, color: S.white, padding: '10px 24px', borderRadius: '2px', border: 'none', fontSize: '12px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
              >
                New Redesign
              </button>
            </div>

            {loadingDesigns ? (
              <div style={{ textAlign: 'center', padding: '80px 0', color: S.muted, fontSize: '14px' }}>Loading your designs...</div>
            ) : designs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 0', background: S.white, borderRadius: '4px', border: `1px dashed ${S.warm}` }}>
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '24px', fontWeight: 300, color: S.ink, marginBottom: '8px' }}>No designs saved yet</p>
                <p style={{ fontSize: '13px', color: S.muted, marginBottom: '24px' }}>Generate a room redesign and click "Save to account" to keep it here.</p>
                <button onClick={() => navigate({ to: '/tool' })} style={{ background: S.gold, color: S.white, padding: '12px 28px', borderRadius: '2px', border: 'none', fontSize: '12px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                  Start redesigning
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                {designs.map(design => (
                  <div key={design.id} style={{ background: S.white, borderRadius: '2px', overflow: 'hidden', boxShadow: '0 4px 24px rgba(26,22,18,0.08)' }}>
                    <div style={{ position: 'relative', aspectRatio: '4/3' }}>
                      <img src={design.afterUrl} alt={design.roomLabel} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(184,150,90,0.9)', color: S.white, fontSize: '10px', padding: '3px 8px', borderRadius: '2px', letterSpacing: '0.06em' }}>
                        AI Visualisation
                      </div>
                    </div>
                    <div style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div>
                          <span style={{ fontSize: '13px', fontWeight: 500, color: S.ink, display: 'block' }}>{design.roomLabel}</span>
                          <span style={{ fontSize: '11px', color: S.muted }}>{design.styleName} Style</span>
                        </div>
                        <span style={{ fontSize: '10px', color: S.muted }}>
                          {new Date(design.savedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => downloadImage(design.afterUrl, `${design.roomLabel}-${design.styleName}.jpg`)}
                          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: 'transparent', border: `1px solid ${S.gold}`, color: S.gold, padding: '7px 12px', borderRadius: '2px', fontSize: '11px', fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", letterSpacing: '0.06em' }}
                        >
                          <DownloadIcon /> Download
                        </button>
                        <button
                          onClick={() => deleteDesign(design.id)}
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: `1px solid ${S.warm}`, color: S.muted, padding: '7px 12px', borderRadius: '2px', fontSize: '11px', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

function ActionCard({ title, desc, cta, onClick, disabled }: { title: string; desc: string; cta: string; onClick: () => void; disabled?: boolean }) {
  return (
    <div style={{ background: '#fff', borderRadius: '4px', padding: '28px', boxShadow: '0 2px 12px rgba(26,22,18,0.06)', border: '1px solid #e8dcc8' }}>
      <h3 style={{ fontSize: '15px', fontWeight: 500, color: '#1a1612', marginBottom: '8px' }}>{title}</h3>
      <p style={{ fontSize: '13px', color: '#8a7f72', lineHeight: 1.5, marginBottom: '20px' }}>{desc}</p>
      <button onClick={onClick} disabled={disabled} style={{ background: 'transparent', color: disabled ? '#8a7f72' : '#b8965a', border: `1px solid ${disabled ? '#e8dcc8' : '#b8965a'}`, padding: '8px 16px', borderRadius: '2px', fontSize: '12px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: disabled ? 'default' : 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
        {cta}
      </button>
    </div>
  )
}

function DownloadIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  )
}
