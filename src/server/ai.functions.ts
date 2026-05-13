import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'
import React from 'react'
import { generateRoomImageFn } from '../server/ai.functions'

export const Route = createFileRoute('/estate-agent-tool')({
  component: EstateAgentTool,
})

const S = {
  ink: '#1a1612', cream: '#f5f0e8', warm: '#e8dcc8',
  gold: '#b8965a', goldLight: '#d4b07a', muted: '#8a7f72',
  surface: '#faf7f2', white: '#ffffff',
} as const

const STYLES = [
  { id: 'scandinavian', label: 'Scandinavian', desc: 'Clean lines, natural wood', gradient: 'linear-gradient(135deg, #f0ede6 0%, #d8cfc2 100%)' },
  { id: 'contemporary', label: 'Contemporary', desc: 'Sleek, modern, minimal', gradient: 'linear-gradient(135deg, #e8eef2 0%, #b8c8d4 100%)' },
  { id: 'industrial', label: 'Industrial', desc: 'Raw steel, urban edge', gradient: 'linear-gradient(135deg, #3d3933 0%, #2d2b28 100%)' },
  { id: 'maximalist', label: 'Maximalist', desc: 'Bold colour, rich texture', gradient: 'linear-gradient(135deg, #4a2d6b 0%, #d4a03a 100%)' },
  { id: 'japandi', label: 'Japandi', desc: 'Warm wabi-sabi calm', gradient: 'linear-gradient(135deg, #e8e0d5 0%, #a09285 100%)' },
  { id: 'coastal', label: 'Coastal', desc: 'Sea blues, natural linen', gradient: 'linear-gradient(135deg, #d4eaf5 0%, #7ab8d2 100%)' },
]

const ROOMS = [
  { url: '/Living%20room.jpg', label: 'Living Room', roomId: 'livingroom' },
  { url: '/Kitchen.png', label: 'Kitchen', roomId: 'kitchen' },
  { url: '/Bedroom.JPG', label: 'Bedroom', roomId: 'bedroom' },
  { url: '/Hallway.png', label: 'Hallway', roomId: 'hallway' },
  { url: '/Open%20plan%20dining%20lounge.jpg', label: 'Open Plan Dining Lounge', roomId: 'openplanlounge' },
]

type WidgetState = 'closed' | 'picker' | 'generating' | 'results'

interface GeneratedRoom {
  label: string
  beforeUrl: string
  afterUrl: string | null
  roomId: string
  error?: boolean
}

const miniPalettes: Record<string, { bg: string; accent: string; text: string }> = {
  scandinavian: { bg: '#f0ede6', accent: '#c8b9a0', text: '#5a5040' },
  contemporary: { bg: '#dce6ed', accent: '#7a9ab8', text: '#1a2a3a' },
  industrial: { bg: '#3a3630', accent: '#806a58', text: '#c0a890' },
  maximalist: { bg: '#3a2060', accent: '#d09030', text: '#f0d8c0' },
  japandi: { bg: '#e0d8cc', accent: '#a09080', text: '#403020' },
  coastal: { bg: '#c8e4f5', accent: '#60a8cc', text: '#102840' },
}

function EstateAgentTool() {
  const [widgetState, setWidgetState] = useState<WidgetState>('closed')
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null)
  const [generatingIdx, setGeneratingIdx] = useState(0)
  const [showEnquiryForm, setShowEnquiryForm] = useState(false)
  const [generatedRooms, setGeneratedRooms] = useState<GeneratedRoom[]>([])
  const abortRef = useRef(false)

  const openWidget = () => { setWidgetState('picker'); setSelectedStyle(null); setGeneratedRooms([]) }
  const closeWidget = () => {
    abortRef.current = true
    setWidgetState('closed')
    setSelectedStyle(null)
    setGeneratingIdx(0)
    setGeneratedRooms([])
    setTimeout(() => { abortRef.current = false }, 100)
  }

  const generate = async () => {
    if (!selectedStyle) return
    setWidgetState('generating')
    setGeneratingIdx(0)
    abortRef.current = false

    const results: GeneratedRoom[] = ROOMS.map(r => ({
      label: r.label,
      beforeUrl: r.url,
      afterUrl: null,
      roomId: r.roomId,
    }))
    setGeneratedRooms([...results])

    for (let i = 0; i < ROOMS.length; i++) {
      if (abortRef.current) break
      const room = ROOMS[i]

      try {
        // Fetch the demo image and convert to base64
        const imgRes = await fetch(room.url)
        const blob = await imgRes.blob()
        const imageDataUri = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = e => resolve(e.target?.result as string)
          reader.onerror = reject
          reader.readAsDataURL(blob)
        })

        const result = await generateRoomImageFn({
          data: { imageDataUri, style: selectedStyle, roomId: room.roomId }
        })

        results[i] = { ...results[i], afterUrl: result.generatedImageUrl }
      } catch (err) {
        console.error('Generation failed for', room.label, err)
        results[i] = { ...results[i], afterUrl: null, error: true }
      }

      setGeneratedRooms([...results])
      setGeneratingIdx(i + 1)
    }

    if (!abortRef.current) {
      setTimeout(() => setWidgetState('results'), 400)
    }
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 72px)', background: '#f8f7f4', fontFamily: "'Outfit', 'DM Sans', sans-serif", color: '#1c1c1c' }}>

      {/* Annotation banner */}
      <div style={{ background: '#1a1612', padding: '10px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ fontSize: '12px', color: '#b8965a', letterSpacing: '0.08em' }}>
          — DEMO — This is a mock estate agent website showing how the Virtual Staging IOM widget works on your listing pages.
        </p>
        <a href="#enquire" style={{ fontSize: '12px', color: 'rgba(245,240,232,0.5)', textDecoration: 'none' }}>
          Enquire Now ↓
        </a>
      </div>

      {/* Mock estate agent header */}
      <header style={{ background: '#1c2b3a', padding: '0 40px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ color: '#fff', fontFamily: 'Georgia, serif', fontSize: '22px' }}>
          Acorn<span style={{ color: '#c8a96e' }}>.</span>
        </div>
        <nav style={{ display: 'flex', gap: '24px' }}>
          {['Buy', 'Rent', 'Sell', 'About'].map((item) => (
            <a key={item} href="#" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '13px' }}>{item}</a>
          ))}
        </nav>
      </header>

      {/* Listing header */}
      <div style={{ background: '#fff', padding: '28px 40px', borderBottom: '1px solid #e8e4dc', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontFamily: 'Georgia, serif', fontSize: '26px', color: '#1c2b3a' }}>14 Elmwood Crescent, Hale, WA15</div>
          <div style={{ fontSize: '13px', color: '#888', marginTop: '6px' }}>Detached · 4 bed · 3 bath · EPC: C · Freehold</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'Georgia, serif', fontSize: '32px', color: '#1c2b3a' }}>£895,000</div>
          <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>Guide price</div>
        </div>
      </div>

      {/* Photo gallery */}
      <div style={{ position: 'relative' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gridTemplateRows: '260px 260px', gap: '4px', maxHeight: '528px', overflow: 'hidden' }}>
          {ROOMS.map((room, idx) => (
            <div key={idx} style={{ overflow: 'hidden', position: 'relative', gridRow: idx === 0 ? '1 / 3' : undefined }}>
              <img src={room.url} alt={room.label} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              <div style={{ position: 'absolute', bottom: '10px', left: '10px', background: 'rgba(28,43,58,0.75)', color: '#fff', fontSize: '11px', padding: '3px 10px', borderRadius: '2px', letterSpacing: '0.06em' }}>
                {room.label}
              </div>
            </div>
          ))}
        </div>

        {/* Widget trigger button */}
        <button onClick={openWidget} style={{ position: 'absolute', bottom: '20px', right: '20px', background: 'rgba(28,43,58,0.9)', backdropFilter: 'blur(8px)', color: '#fff', border: '1px solid rgba(200,169,110,0.4)', borderRadius: '4px', padding: '12px 20px', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
          <span style={{ color: '#c8a96e', fontSize: '14px' }}>✦</span>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 500, letterSpacing: '0.04em' }}>Reimagine this home</div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em' }}>AI Interior Styling</div>
          </div>
        </button>
      </div>

      {/* Listing body */}
      <div style={{ maxWidth: '960px', margin: '40px auto', padding: '0 40px', display: 'grid', gridTemplateColumns: '1fr 300px', gap: '40px' }}>
        <div>
          <div style={{ display: 'flex', gap: '32px', marginBottom: '32px' }}>
            {[['4', 'Bedrooms'], ['3', 'Bathrooms'], ['2,100', 'Sq Ft'], ['0.3', 'Acre plot']].map(([num, label]) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'Georgia, serif', fontSize: '28px', color: '#1c2b3a' }}>{num}</div>
                <div style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</div>
              </div>
            ))}
          </div>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', color: '#1c2b3a', marginBottom: '16px' }}>About this property</h2>
          <p style={{ fontSize: '14px', lineHeight: 1.8, color: '#555', marginBottom: '16px' }}>
            A beautifully presented four bedroom detached family home set within the heart of one of South Manchester's most sought after residential roads. Offering generous and versatile accommodation across two floors, the property has been thoughtfully maintained throughout.
          </p>
        </div>
        <div>
          <div style={{ background: '#fff', border: '1px solid #e8e4dc', borderRadius: '4px', padding: '24px' }}>
            <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '16px', color: '#1c2b3a', marginBottom: '16px' }}>Arrange a Viewing</h3>
            <button style={{ display: 'block', width: '100%', background: '#1c2b3a', color: '#fff', border: 'none', padding: '14px', fontFamily: "'DM Sans', sans-serif", fontSize: '13px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', marginBottom: '10px', borderRadius: '2px' }}>Book a Viewing</button>
            <button style={{ display: 'block', width: '100%', background: 'transparent', border: '1px solid #1c2b3a', color: '#1c2b3a', padding: '14px', fontFamily: "'DM Sans', sans-serif", fontSize: '13px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', borderRadius: '2px' }}>Request Details</button>
          </div>
        </div>
      </div>

      {/* Enquire Now section */}
      <div id="enquire" style={{ background: S.ink, padding: '72px 40px', marginTop: '40px' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <p style={{ fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: S.gold, fontWeight: 500, marginBottom: '12px' }}>
            For Estate Agents
          </p>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '36px', fontWeight: 300, color: S.cream, lineHeight: 1.1, marginBottom: '16px' }}>
            Add AI staging to <em style={{ color: S.goldLight }}>every listing.</em>
          </h2>
          <p style={{ fontSize: '14px', color: S.muted, marginBottom: '40px', lineHeight: 1.7, maxWidth: '560px' }}>
            One script tag on your listing pages lets buyers reimagine any property in their preferred style — instantly. No uploads, no friction. Enquire below and we'll be in touch within one business day.
          </p>

          {!showEnquiryForm ? (
            <button
              onClick={() => setShowEnquiryForm(true)}
              style={{ background: S.gold, color: S.white, padding: '16px 40px', borderRadius: '2px', border: 'none', fontSize: '13px', fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
            >
              Enquire Now
            </button>
          ) : (
            <EnquiryForm onClose={() => setShowEnquiryForm(false)} />
          )}
        </div>
      </div>

      {/* Widget overlay panel */}
      {widgetState !== 'closed' && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(26,22,18,0.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'flex-end' }} onClick={(e) => { if (e.target === e.currentTarget) closeWidget() }}>
          <div style={{ width: '440px', maxWidth: '100vw', background: '#faf7f2', height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', animation: 'slideIn 0.3s ease' }}>
            <style>{`@keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>
            <div style={{ background: '#1a1612', padding: '24px 24px 20px', borderBottom: '1px solid rgba(232,220,200,0.1)', flexShrink: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '22px', fontWeight: 300, color: '#f5f0e8' }}>
                  Virtual Staging <span style={{ color: '#b8965a', fontStyle: 'italic' }}>IOM</span>
                </span>
                <button onClick={closeWidget} style={{ background: 'transparent', border: 'none', color: 'rgba(245,240,232,0.4)', cursor: 'pointer', fontSize: '20px' }}>✕</button>
              </div>
              <p style={{ fontSize: '12px', color: '#8a7f72', letterSpacing: '0.06em' }}>Reimagine 14 Elmwood Crescent</p>
            </div>
            <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
              {widgetState === 'picker' && (
                <>
                  <p style={{ fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#b8965a', fontWeight: 500, marginBottom: '16px' }}>Choose your style</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '28px' }}>
                    {STYLES.map((style) => (
                      <div key={style.id} onClick={() => setSelectedStyle(style.id)} style={{ cursor: 'pointer', borderRadius: '2px', overflow: 'hidden', border: `2px solid ${selectedStyle === style.id ? '#b8965a' : 'transparent'}`, background: '#fff', boxShadow: '0 2px 12px rgba(26,22,18,0.07)' }}>
                        <div style={{ height: '70px', background: style.gradient, position: 'relative' }}>
                          {selectedStyle === style.id && <div style={{ position: 'absolute', top: '6px', right: '6px', width: '20px', height: '20px', background: '#b8965a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg></div>}
                        </div>
                        <div style={{ padding: '9px 10px 10px' }}>
                          <div style={{ fontSize: '12px', fontWeight: 500, color: '#1a1612', marginBottom: '2px' }}>{style.label}</div>
                          <div style={{ fontSize: '10px', color: '#8a7f72' }}>{style.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button onClick={generate} disabled={!selectedStyle} style={{ width: '100%', background: selectedStyle ? '#b8965a' : '#e8dcc8', color: '#fff', border: 'none', padding: '14px', borderRadius: '2px', fontSize: '13px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: selectedStyle ? 'pointer' : 'not-allowed', fontFamily: "'DM Sans', sans-serif" }}>
                    Reimagine 5 rooms
                  </button>
                </>
              )}
              {widgetState === 'generating' && (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <div style={{ width: '56px', height: '56px', margin: '0 auto 20px', border: '2px solid #e8dcc8', borderTop: '2px solid #b8965a', borderRadius: '50%', animation: 'spin 1.2s linear infinite' }} />
                  <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                  <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '24px', fontWeight: 300, color: '#1a1612', marginBottom: '8px' }}>Reimagining your rooms</h3>
                  <p style={{ fontSize: '12px', color: '#8a7f72', marginBottom: '20px' }}>Using real AI — this takes about 30 seconds per room</p>
                  {ROOMS.map((room, idx) => {
                    const generated = generatedRooms[idx]
                    const isDone = generated?.afterUrl || generated?.error
                    const isActive = generatingIdx === idx
                    return (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px', padding: '10px 12px', background: '#fff', borderRadius: '2px' }}>
                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: isDone ? (generated?.error ? '#e07070' : '#b8965a') : '#e8dcc8', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {isDone && !generated?.error && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>}
                          {generated?.error && <span style={{ color: 'white', fontSize: '10px' }}>✕</span>}
                        </div>
                        <span style={{ fontSize: '13px', color: '#1a1612' }}>{room.label}</span>
                        {isActive && !isDone && <span style={{ fontSize: '11px', color: '#b8965a', marginLeft: 'auto' }}>generating...</span>}
                        {isDone && !generated?.error && <span style={{ fontSize: '11px', color: '#6a9a6a', marginLeft: 'auto' }}>done</span>}
                        {generated?.error && <span style={{ fontSize: '11px', color: '#e07070', marginLeft: 'auto' }}>failed</span>}
                      </div>
                    )
                  })}
                </div>
              )}
              {widgetState === 'results' && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <p style={{ fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#b8965a', fontWeight: 500 }}>Your reimagined home</p>
                    <button onClick={() => { setWidgetState('picker'); setSelectedStyle(null); setGeneratedRooms([]) }} style={{ background: 'transparent', border: 'none', fontSize: '11px', color: '#8a7f72', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>Try another style</button>
                  </div>
                  {generatedRooms.map((room, idx) => (
                    <div key={idx} style={{ marginBottom: '14px', borderRadius: '2px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(26,22,18,0.08)' }}>
                      <div style={{ display: 'flex', aspectRatio: '16/9' }}>
                        <div style={{ flex: 1, position: 'relative', borderRight: '1px solid #fff' }}>
                          <img src={room.beforeUrl} alt={`${room.label} before`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                          <div style={{ position: 'absolute', top: '8px', left: '8px', background: 'rgba(26,22,18,0.7)', color: '#f5f0e8', fontSize: '10px', padding: '2px 7px', borderRadius: '2px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Before</div>
                        </div>
                        <div style={{ flex: 1, position: 'relative' }}>
                          {room.afterUrl
                            ? <img src={room.afterUrl} alt={`${room.label} after`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                            : room.error
                              ? <div style={{ width: '100%', height: '100%', background: '#f0ede6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontSize: '11px', color: '#8a7f72' }}>Generation failed</span></div>
                              : <StyledRoomMini style={selectedStyle!} label={room.label} />
                          }
                          <div style={{ position: 'absolute', top: '8px', left: '8px', background: 'rgba(26,22,18,0.7)', color: '#f5f0e8', fontSize: '10px', padding: '2px 7px', borderRadius: '2px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>After</div>
                          {room.afterUrl && <div style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(184,150,90,0.9)', color: '#fff', fontSize: '9px', padding: '2px 6px', borderRadius: '2px', letterSpacing: '0.06em' }}>AI</div>}
                        </div>
                      </div>
                      <div style={{ background: '#fff', padding: '10px 12px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 500, color: '#1a1612' }}>{room.label}</span>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function EnquiryForm({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ name: '', agency: '', email: '', phone: '', website: '', listingsCount: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async () => {
    if (!form.name || !form.agency || !form.email) {
      setStatus('error')
      return
    }
    setStatus('sending')

    try {
      // Send via Netlify Forms (free, no backend needed)
      const body = new FormData()
      body.append('form-name', 'estate-agent-enquiry')
      body.append('name', form.name)
      body.append('agency', form.agency)
      body.append('email', form.email)
      body.append('phone', form.phone)
      body.append('website', form.website)
      body.append('listings-count', form.listingsCount)
      body.append('message', form.message)

      const res = await fetch('/', { method: 'POST', body })
      if (res.ok) {
        setStatus('sent')
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <div style={{ background: 'rgba(184,150,90,0.1)', border: '1px solid rgba(184,150,90,0.3)', borderRadius: '4px', padding: '32px', textAlign: 'center' }}>
        <div style={{ fontSize: '32px', marginBottom: '16px' }}>✓</div>
        <p style={{ fontSize: '16px', color: S.cream, fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, marginBottom: '8px' }}>Enquiry received</p>
        <p style={{ fontSize: '13px', color: S.muted, lineHeight: 1.7 }}>Thank you for your interest. We'll be in touch within one business day at {form.email}.</p>
      </div>
    )
  }

  return (
    <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', padding: '32px' }}>
      <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '24px', fontWeight: 300, color: S.cream, marginBottom: '24px' }}>Get in touch</h3>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        <div>
          <label style={fLabel}>Your name *</label>
          <input name="name" value={form.name} onChange={handleChange} style={fInput} placeholder="Jane Smith" />
        </div>
        <div>
          <label style={fLabel}>Agency name *</label>
          <input name="agency" value={form.agency} onChange={handleChange} style={fInput} placeholder="Smith & Co" />
        </div>
        <div>
          <label style={fLabel}>Email address *</label>
          <input name="email" type="email" value={form.email} onChange={handleChange} style={fInput} placeholder="jane@smithco.com" />
        </div>
        <div>
          <label style={fLabel}>Phone number</label>
          <input name="phone" type="tel" value={form.phone} onChange={handleChange} style={fInput} placeholder="+44 7700 000000" />
        </div>
        <div>
          <label style={fLabel}>Agency website</label>
          <input name="website" value={form.website} onChange={handleChange} style={fInput} placeholder="www.smithco.com" />
        </div>
        <div>
          <label style={fLabel}>Active listings (approx.)</label>
          <select name="listingsCount" value={form.listingsCount} onChange={handleChange} style={{ ...fInput, appearance: 'none' as any }}>
            <option value="">Select range</option>
            <option value="1-10">1–10</option>
            <option value="11-50">11–50</option>
            <option value="51-100">51–100</option>
            <option value="100+">100+</option>
          </select>
        </div>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label style={fLabel}>Your message</label>
        <textarea
          name="message"
          value={form.message}
          onChange={handleChange}
          rows={4}
          style={{ ...fInput, resize: 'vertical', minHeight: '100px' }}
          placeholder="Tell us about your agency and how you'd like to use Virtual Staging IOM on your listings..."
        />
      </div>

      {status === 'error' && (
        <p style={{ fontSize: '13px', color: '#f08080', marginBottom: '16px' }}>
          {!form.name || !form.agency || !form.email ? 'Please fill in all required fields.' : 'Something went wrong. Please try again or email virtualstagingiom@gmail.com directly.'}
        </p>
      )}

      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          onClick={handleSubmit}
          disabled={status === 'sending'}
          style={{ flex: 1, background: S.gold, color: S.white, padding: '14px', borderRadius: '2px', border: 'none', fontSize: '13px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: status === 'sending' ? 'wait' : 'pointer', fontFamily: "'DM Sans', sans-serif" }}
        >
          {status === 'sending' ? 'Sending...' : 'Send Enquiry'}
        </button>
        <button
          onClick={onClose}
          style={{ padding: '14px 20px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: S.muted, borderRadius: '2px', fontSize: '13px', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

function StyledRoomMini({ style, label }: { style: string; label: string }) {
  const p = miniPalettes[style] || miniPalettes.contemporary
  return (
    <div style={{ width: '100%', height: '100%', background: p.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
      <div style={{ width: '40px', height: '3px', background: p.accent, borderRadius: '1px' }} />
      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '15px', fontWeight: 300, color: p.text }}>{label}</div>
      <div style={{ fontSize: '10px', color: p.accent, letterSpacing: '0.1em', textTransform: 'uppercase' }}>AI Generated</div>
    </div>
  )
}

const fLabel: React.CSSProperties = { display: 'block', fontSize: '11px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: S.muted, marginBottom: '6px' }
const fInput: React.CSSProperties = { width: '100%', padding: '10px 14px', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '2px', fontSize: '14px', fontFamily: "'DM Sans', sans-serif", outline: 'none', boxSizing: 'border-box', background: 'rgba(255,255,255,0.08)', color: S.cream }
