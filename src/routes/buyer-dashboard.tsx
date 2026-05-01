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
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
      <SignedIn>
        <BuyerDashboardContent />
      </SignedIn>
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

  useEffect(() => {
    if (!user) return
    setLoadingDesigns(true)
    getDesignsFn({ data: { userId: user.id } })
      .then(data => setDesigns(data.designs || []))
      .catch(() => setDesigns([]))
      .finally(() => setLoadingDesigns(false))
  }, [user])

  async function deleteDesign(designId: string) {
    if (!user) return
    setDesigns(prev => prev.filter(d => d.id !== designId))
    await deleteDesignFn({ data: { userId: user.id, designId } }).catch(console.error)
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
      {/* Header */}
      <div style={{ background: S.ink, padding: '48px', color: S.cream }}>
        <p style={{ fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: S.gold, marginBottom: '12px' }}>My Account</p>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '40px', fontWeight: 300, marginBottom: '8px' }}>
          Welcome back, <em style={{ color: S.goldLight }}>{firstName}</em>
        </h1>
        <p style={{ color: S.muted, fontSize: '14px', marginBottom: '32px' }}>Visualise your dream home before you buy</p>

        {/* Tab nav */}
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
            {/* Plan status */}
            <div style={{ background: S.white, borderRadius: '4px', padding: '32px', marginBottom: '32px', boxShadow: '0 2px 16px rgba(26,22,18,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: S.muted, marginBottom: '6px' }}>Current Plan</p>
                <p style={{ fontSize: '20px', fontWeight: 500, color: S.ink, marginBottom: '4px' }}>Free Trial</p>
                <p style={{ fontSize: '13px', color: S.muted }}>3 room redesigns remaining</p>
              </div>
              <button style={{ background: S.gold, color: S.white, padding: '12px 28px', borderRadius: '2px', border: 'none', fontSize: '12px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                Upgrade Plan
              </button>
            </div>

            {/* Quick actions */}
            <p style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.16em', textTransform: 'uppercase', color: S.gold, marginBottom: '20px' }}>
              Quick Actions
              <span style={{ display: 'inline-block', marginLeft: '12px', flex: 1, height: '1px', background: S.warm, verticalAlign: 'middle', width: '100px' }} />
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px', marginBottom: '48px' }}>
              <ActionCard
                title="Redesign a Room"
                desc="Upload photos and transform any room into your style"
                cta="Start redesigning"
                onClick={() => navigate({ to: '/tool' })}
              />
              <ActionCard
                title="Pricing Plans"
                desc="Unlock unlimited redesigns with a monthly subscription"
                cta="View pricing"
                onClick={() => {}}
              />
              <ActionCard
                title="My Designs"
                desc={designs.length > 0 ? `You have ${designs.length} saved design${designs.length !== 1 ? 's' : ''}` : "View and download your previously generated room designs"}
                cta={designs.length > 0 ? `View ${designs.length} design${designs.length !== 1 ? 's' : ''}` : "No designs yet"}
                onClick={() => setActiveSection('designs')}
                disabled={designs.length === 0}
              />
            </div>

            {/* Pricing plans */}
            <p style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.16em', textTransform: 'uppercase', color: S.gold, marginBottom: '20px' }}>Choose a Plan</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
              {[
                { name: 'Pay As You Go', price: '£2.99', unit: 'per session', desc: '5 room redesigns per session. No commitment.', highlight: false },
                { name: 'Monthly', price: '£9.99', unit: 'per month', desc: 'Unlimited redesigns. Cancel anytime.', highlight: true },
                { name: 'Annual', price: '£79', unit: 'per year', desc: 'Best value. Save 34% vs monthly.', highlight: false },
              ].map((plan) => (
                <div key={plan.name} style={{ background: plan.highlight ? S.ink : S.white, borderRadius: '4px', padding: '28px 24px', border: `2px solid ${plan.highlight ? S.gold : S.warm}`, boxShadow: plan.highlight ? '0 8px 32px rgba(26,22,18,0.15)' : '0 2px 12px rgba(26,22,18,0.06)' }}>
                  <p style={{ fontSize: '12px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: plan.highlight ? S.gold : S.muted, marginBottom: '12px' }}>{plan.name}</p>
                  <p style={{ fontSize: '32px', fontWeight: 300, fontFamily: "'Cormorant Garamond', serif", color: plan.highlight ? S.cream : S.ink }}>{plan.price}</p>
                  <p style={{ fontSize: '12px', color: S.muted, marginBottom: '16px' }}>{plan.unit}</p>
                  <p style={{ fontSize: '13px', color: plan.highlight ? 'rgba(245,240,232,0.6)' : S.muted, marginBottom: '24px', lineHeight: 1.5 }}>{plan.desc}</p>
                  <button style={{ width: '100%', background: plan.highlight ? S.gold : 'transparent', color: plan.highlight ? S.white : S.gold, padding: '10px', borderRadius: '2px', border: `1px solid ${S.gold}`, fontSize: '12px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                    Choose plan
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
                <p style={{ fontSize: '15px', color: S.ink, marginBottom: '8px', fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: '24px' }}>No designs saved yet</p>
                <p style={{ fontSize: '13px', color: S.muted, marginBottom: '24px' }}>Generate a room redesign and click "Save to account" to keep it here.</p>
                <button
                  onClick={() => navigate({ to: '/tool' })}
                  style={{ background: S.gold, color: S.white, padding: '12px 28px', borderRadius: '2px', border: 'none', fontSize: '12px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
                >
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
