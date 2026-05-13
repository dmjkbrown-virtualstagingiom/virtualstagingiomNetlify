import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'

function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  return isMobile
}
import React from 'react'
import { useUser, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react'
import { getDesignsFn, deleteDesignFn } from '../server/designs.functions'

export const Route = createFileRoute('/my-designs')({
  component: MyDesigns,
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

function MyDesigns() {
  return (
    <>
      <SignedOut><RedirectToSignIn /></SignedOut>
      <SignedIn><MyDesignsContent /></SignedIn>
    </>
  )
}

function MyDesignsContent() {
  const { user } = useUser()
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const [designs, setDesigns] = useState<SavedDesign[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const load = async () => {
      setLoading(true)
      try {
        const data = await getDesignsFn({ data: { userId: user.id } })
        setDesigns(data.designs || [])
      } catch {
        setDesigns([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user])

  async function deleteDesign(designId: string) {
    if (!user) return
    setDesigns(prev => prev.filter(d => d.id !== designId))
    try {
      await deleteDesignFn({ data: { userId: user.id, designId } })
    } catch (err) {
      console.error('Failed to delete design:', err)
    }
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
      <div style={{ background: S.ink, padding: isMobile ? '32px 20px' : '48px', color: S.cream }}>
        <p style={{ fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: S.gold, marginBottom: '12px' }}>My Designs</p>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: isMobile ? '28px' : '40px', fontWeight: 300, marginBottom: '8px' }}>
          Your <em style={{ color: S.goldLight }}>reimagined rooms</em>
        </h1>
        <p style={{ color: S.muted, fontSize: '14px' }}>All the AI-generated room designs you've saved</p>
      </div>

      <main style={{ maxWidth: '960px', margin: '0 auto', padding: isMobile ? '24px 16px' : '56px 48px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <p style={{ fontSize: '13px', color: S.muted }}>
            {loading ? 'Loading...' : `${designs.length} saved design${designs.length !== 1 ? 's' : ''}`}
          </p>
          <button
            onClick={() => navigate({ to: '/tool' })}
            style={{ background: S.gold, color: S.white, padding: '10px 24px', borderRadius: '2px', border: 'none', fontSize: '12px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
          >
            New Redesign
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: S.muted }}>Loading your designs...</div>
        ) : designs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', background: S.white, borderRadius: '4px', border: `1px dashed ${S.warm}` }}>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '28px', fontWeight: 300, color: S.ink, marginBottom: '8px' }}>No designs saved yet</p>
            <p style={{ fontSize: '13px', color: S.muted, marginBottom: '24px' }}>Generate a room redesign and click "Save to account" to see it here.</p>
            <button
              onClick={() => navigate({ to: '/tool' })}
              style={{ background: S.gold, color: S.white, padding: '12px 28px', borderRadius: '2px', border: 'none', fontSize: '12px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
            >
              Start redesigning
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {designs.map(design => (
              <div key={design.id} style={{ background: S.white, borderRadius: '2px', overflow: 'hidden', boxShadow: '0 4px 24px rgba(26,22,18,0.08)' }}>
                <div style={{ position: 'relative', aspectRatio: '4/3' }}>
                  <img
                    src={design.afterUrl}
                    alt={design.roomLabel}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    onError={(e) => {
                      const target = e.currentTarget
                      target.style.display = 'none'
                      const placeholder = target.nextElementSibling as HTMLElement
                      if (placeholder) placeholder.style.display = 'flex'
                    }}
                  />
                  <div style={{ display: 'none', width: '100%', height: '100%', background: '#f0ede6', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '8px' }}>
                    <span style={{ fontSize: '28px' }}>🖼️</span>
                    <span style={{ fontSize: '11px', color: '#8a7f72', textAlign: 'center', padding: '0 12px' }}>Image expired — generate a new one</span>
                  </div>
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
                      {new Date(design.savedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
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
      </main>
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
