import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/embed-demo')({
  component: EmbedDemo,
})

const STYLES = [
  { id: 'scandinavian', label: 'Scandinavian', desc: 'Clean lines, natural wood', gradient: 'linear-gradient(135deg, #f0ede6 0%, #d8cfc2 100%)' },
  { id: 'contemporary', label: 'Contemporary', desc: 'Sleek, modern, minimal', gradient: 'linear-gradient(135deg, #e8eef2 0%, #b8c8d4 100%)' },
  { id: 'industrial', label: 'Industrial', desc: 'Raw steel, urban edge', gradient: 'linear-gradient(135deg, #3d3933 0%, #2d2b28 100%)' },
  { id: 'maximalist', label: 'Maximalist', desc: 'Bold colour, rich texture', gradient: 'linear-gradient(135deg, #4a2d6b 0%, #d4a03a 100%)' },
  { id: 'japandi', label: 'Japandi', desc: 'Warm wabi-sabi calm', gradient: 'linear-gradient(135deg, #e8e0d5 0%, #a09285 100%)' },
  { id: 'coastal', label: 'Coastal', desc: 'Sea blues, natural linen', gradient: 'linear-gradient(135deg, #d4eaf5 0%, #7ab8d2 100%)' },
]

const ROOMS = [
  { url: '/examples/living-room-before.webp', afterUrl: '/examples/living-room-after.png', label: 'Living Room' },
  { url: '/examples/kitchen-before.webp', afterUrl: '/examples/kitchen-after.jpeg', label: 'Kitchen' },
  { url: '/examples/bedroom-before.webp', afterUrl: '/examples/bedroom-after.jpeg', label: 'Bedroom' },
  { url: '/examples/hallway-before.webp', afterUrl: '/examples/hallway-after.jpeg', label: 'Hallway' },
  { url: '/examples/playroom-before.webp', afterUrl: '/examples/playroom-after.jpeg', label: 'Play Room' },
]

type WidgetState = 'closed' | 'picker' | 'generating' | 'results'

function EmbedDemo() {
  const [widgetState, setWidgetState] = useState<WidgetState>('closed')
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null)
  const [generatingIdx, setGeneratingIdx] = useState(0)

  const openWidget = () => {
    setWidgetState('picker')
    setSelectedStyle(null)
  }

  const closeWidget = () => {
    setWidgetState('closed')
    setSelectedStyle(null)
    setGeneratingIdx(0)
  }

  const generate = () => {
    if (!selectedStyle) return
    setWidgetState('generating')
    setGeneratingIdx(0)
    let count = 0
    const interval = setInterval(() => {
      count++
      setGeneratingIdx(count)
      if (count >= ROOMS.length) {
        clearInterval(interval)
        setTimeout(() => setWidgetState('results'), 500)
      }
    }, 1600)
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 72px)', background: '#f8f7f4', fontFamily: "'Outfit', 'DM Sans', sans-serif", color: '#1c1c1c' }}>

      {/* Annotation banner */}
      <div style={{
        background: '#1a1612', padding: '10px 40px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <p style={{ fontSize: '12px', color: '#b8965a', letterSpacing: '0.08em' }}>
          ◆ DEMO — This is a mock estate agent website. The Virtual Staging IOM widget activates when you click the button below.
        </p>
        <a href="#embed-code" style={{ fontSize: '12px', color: 'rgba(245,240,232,0.5)', textDecoration: 'none' }}>
          View embed code ↓
        </a>
      </div>

      {/* Mock estate agent header */}
      <header style={{
        background: '#1c2b3a', padding: '0 40px', height: '64px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
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
      <div style={{
        background: '#fff', padding: '28px 40px',
        borderBottom: '1px solid #e8e4dc',
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
      }}>
        <div>
          <div style={{ fontFamily: 'Georgia, serif', fontSize: '26px', color: '#1c2b3a' }}>
            14 Elmwood Crescent, Hale, WA15
          </div>
          <div style={{ fontSize: '13px', color: '#888', marginTop: '6px' }}>
            Detached · 4 bed · 3 bath · EPC: C · Freehold
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'Georgia, serif', fontSize: '32px', color: '#1c2b3a' }}>£895,000</div>
          <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>Guide price</div>
        </div>
      </div>

      {/* Photo gallery */}
      <div style={{ position: 'relative' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr',
          gridTemplateRows: '260px 260px',
          gap: '4px', maxHeight: '528px', overflow: 'hidden',
        }}>
          {ROOMS.map((room, idx) => (
            <div key={idx} style={{
              overflow: 'hidden', position: 'relative',
              gridRow: idx === 0 ? '1 / 3' : undefined,
            }}>
              <img
                src={room.url}
                alt={room.label}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
              <div style={{
                position: 'absolute', bottom: '10px', left: '10px',
                background: 'rgba(28,43,58,0.75)', color: '#fff',
                fontSize: '11px', padding: '3px 10px', borderRadius: '2px',
                letterSpacing: '0.06em',
              }}>{room.label}</div>
            </div>
          ))}
        </div>

        {/* Widget trigger button */}
        <button
          onClick={openWidget}
          style={{
            position: 'absolute', bottom: '20px', right: '20px',
            background: 'rgba(28,43,58,0.9)', backdropFilter: 'blur(8px)',
            color: '#fff', border: '1px solid rgba(200,169,110,0.4)',
            borderRadius: '4px', padding: '12px 20px',
            cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
            display: 'flex', alignItems: 'center', gap: '8px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            transition: 'all 0.2s',
          }}
        >
          <span style={{ color: '#c8a96e', fontSize: '14px' }}>✦</span>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 500, letterSpacing: '0.04em' }}>
              Reimagine this home
            </div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em' }}>
              AI Interior Styling
            </div>
          </div>
        </button>
      </div>

      {/* Listing body */}
      <div style={{
        maxWidth: '960px', margin: '40px auto', padding: '0 40px',
        display: 'grid', gridTemplateColumns: '1fr 300px', gap: '40px',
      }}>
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
          <p style={{ fontSize: '14px', lineHeight: 1.8, color: '#555' }}>
            The ground floor comprises an expansive reception hall, dual aspect sitting room, open plan kitchen-dining family room, utility room and guest cloakroom. To the first floor are four generous bedrooms, the principal of which benefits from a luxurious en suite bathroom.
          </p>
        </div>
        <div>
          <div style={{ background: '#fff', border: '1px solid #e8e4dc', borderRadius: '4px', padding: '24px' }}>
            <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '16px', color: '#1c2b3a', marginBottom: '16px' }}>Arrange a Viewing</h3>
            <button style={{
              display: 'block', width: '100%', background: '#1c2b3a', color: '#fff',
              border: 'none', padding: '14px', fontFamily: "'DM Sans', sans-serif",
              fontSize: '13px', fontWeight: 500, letterSpacing: '0.08em',
              textTransform: 'uppercase', cursor: 'pointer', marginBottom: '10px', borderRadius: '2px',
            }}>Book a Viewing</button>
            <button style={{
              display: 'block', width: '100%', background: 'transparent',
              border: '1px solid #1c2b3a', color: '#1c2b3a', padding: '14px',
              fontFamily: "'DM Sans', sans-serif", fontSize: '13px', fontWeight: 500,
              letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', borderRadius: '2px',
            }}>Request Details</button>
          </div>
        </div>
      </div>

      {/* Embed code section */}
      <div id="embed-code" style={{
        background: '#1a1612', padding: '72px 40px', marginTop: '40px',
      }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <p style={{ fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#b8965a', fontWeight: 500, marginBottom: '12px' }}>
            Integration
          </p>
          <h2 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '36px', fontWeight: 300, color: '#f5f0e8',
            lineHeight: 1.1, marginBottom: '32px',
          }}>
            One snippet. <em style={{ fontStyle: 'italic', color: '#d4b07a' }}>Every listing.</em>
          </h2>
          <div style={{
            background: '#0f0e0c', border: '1px solid rgba(232,220,200,0.1)',
            borderRadius: '4px', padding: '28px',
            fontFamily: 'monospace', fontSize: '13px', lineHeight: 1.8,
            overflowX: 'auto',
          }}>
            <div style={{ color: '#8a9baa', marginBottom: '4px' }}>{'<!-- Place before </body> in your listing template -->'}</div>
            <div style={{ color: '#a8c4d8' }}>&lt;script</div>
            <div style={{ color: '#a8d8a8', paddingLeft: '16px' }}>src="https://cdn.virtualstagingIOM.com/widget.js"</div>
            <div style={{ color: '#a8d8a8', paddingLeft: '16px' }}>data-key="ag_live_<span style={{ color: '#666' }}>your_key_here</span>"</div>
            <div style={{ color: '#a8d8a8', paddingLeft: '16px' }}>data-accent="#c8a96e"</div>
            <div style={{ color: '#a8d8a8', paddingLeft: '16px' }}>data-watermark="true"</div>
            <div style={{ color: '#a8d8a8', paddingLeft: '16px' }}>defer</div>
            <div style={{ color: '#a8c4d8' }}>&gt;&lt;/script&gt;</div>
          </div>
        </div>
      </div>

      {/* Widget overlay panel */}
      {widgetState !== 'closed' && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(26,22,18,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', justifyContent: 'flex-end',
        }}
          onClick={(e) => { if (e.target === e.currentTarget) closeWidget() }}
        >
          <div style={{
            width: '440px', maxWidth: '100vw',
            background: '#faf7f2', height: '100%',
            overflowY: 'auto', display: 'flex', flexDirection: 'column',
            animation: 'slideIn 0.3s ease',
          }}>
            <style>{`@keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>

            {/* Widget header */}
            <div style={{
              background: '#1a1612', padding: '24px 24px 20px',
              borderBottom: '1px solid rgba(232,220,200,0.1)',
              flexShrink: 0,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: '22px', fontWeight: 300, color: '#f5f0e8',
                }}>
                  Virtual Staging <span style={{ color: '#b8965a', fontStyle: 'italic' }}>IOM</span>
                </span>
                <button onClick={closeWidget} style={{
                  background: 'transparent', border: 'none',
                  color: 'rgba(245,240,232,0.4)', cursor: 'pointer',
                  fontSize: '20px', lineHeight: 1, padding: '4px',
                }}>✕</button>
              </div>
              <p style={{ fontSize: '12px', color: '#8a7f72', letterSpacing: '0.06em' }}>
                Reimagine 14 Elmwood Crescent
              </p>
            </div>

            <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>

              {/* Style picker state */}
              {widgetState === 'picker' && (
                <>
                  <p style={{
                    fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase',
                    color: '#b8965a', fontWeight: 500, marginBottom: '16px',
                  }}>Choose your style</p>
                  <p style={{ fontSize: '13px', color: '#8a7f72', marginBottom: '20px', lineHeight: 1.6 }}>
                    Select an interior style and AI will reimagine all 5 rooms in seconds.
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '28px' }}>
                    {STYLES.map((style) => (
                      <div
                        key={style.id}
                        onClick={() => setSelectedStyle(style.id)}
                        style={{
                          cursor: 'pointer', borderRadius: '2px',
                          overflow: 'hidden',
                          border: `2px solid ${selectedStyle === style.id ? '#b8965a' : 'transparent'}`,
                          transition: 'all 0.2s',
                          background: '#fff',
                          boxShadow: '0 2px 12px rgba(26,22,18,0.07)',
                        }}
                      >
                        <div style={{ height: '70px', background: style.gradient, position: 'relative' }}>
                          {selectedStyle === style.id && (
                            <div style={{
                              position: 'absolute', top: '6px', right: '6px',
                              width: '20px', height: '20px', background: '#b8965a',
                              borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                            </div>
                          )}
                        </div>
                        <div style={{ padding: '9px 10px 10px' }}>
                          <div style={{ fontSize: '12px', fontWeight: 500, color: '#1a1612', marginBottom: '2px' }}>{style.label}</div>
                          <div style={{ fontSize: '10px', color: '#8a7f72' }}>{style.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={generate}
                    disabled={!selectedStyle}
                    style={{
                      width: '100%', background: selectedStyle ? '#b8965a' : '#e8dcc8',
                      color: '#fff', border: 'none', padding: '14px',
                      borderRadius: '2px', fontSize: '13px', fontWeight: 500,
                      letterSpacing: '0.1em', textTransform: 'uppercase',
                      cursor: selectedStyle ? 'pointer' : 'not-allowed',
                      fontFamily: "'DM Sans', sans-serif",
                      transition: 'background 0.2s',
                    }}
                  >
                    Reimagine 5 rooms
                  </button>
                  <p style={{ fontSize: '11px', color: '#8a7f72', textAlign: 'center', marginTop: '12px' }}>
                    AI Visualisation — not a guarantee of appearance
                  </p>
                </>
              )}

              {/* Generating state */}
              {widgetState === 'generating' && (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <div style={{
                    width: '56px', height: '56px', margin: '0 auto 20px',
                    border: '2px solid #e8dcc8', borderTop: '2px solid #b8965a',
                    borderRadius: '50%', animation: 'spin 1.2s linear infinite',
                  }} />
                  <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                  <h3 style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: '24px', fontWeight: 300,
                    color: '#1a1612', marginBottom: '8px',
                  }}>
                    Reimagining your rooms
                  </h3>
                  <p style={{ fontSize: '13px', color: '#8a7f72', marginBottom: '28px' }}>
                    {STYLES.find((s) => s.id === selectedStyle)?.label} style
                  </p>
                  {ROOMS.map((room, idx) => (
                    <div key={idx} style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      marginBottom: '10px', padding: '10px 12px',
                      background: '#fff', borderRadius: '2px',
                    }}>
                      <div style={{
                        width: '20px', height: '20px', borderRadius: '50%',
                        background: generatingIdx > idx ? '#b8965a' : '#e8dcc8',
                        flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'background 0.4s',
                      }}>
                        {generatingIdx > idx && (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                        )}
                      </div>
                      <span style={{ fontSize: '13px', color: '#1a1612' }}>{room.label}</span>
                      {generatingIdx === idx && (
                        <span style={{ fontSize: '11px', color: '#b8965a', marginLeft: 'auto' }}>generating...</span>
                      )}
                      {generatingIdx > idx && (
                        <span style={{ fontSize: '11px', color: '#6a9a6a', marginLeft: 'auto' }}>done</span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Results state */}
              {widgetState === 'results' && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <p style={{
                      fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase',
                      color: '#b8965a', fontWeight: 500,
                    }}>Your reimagined home</p>
                    <button
                      onClick={() => { setWidgetState('picker'); setSelectedStyle(null) }}
                      style={{
                        background: 'transparent', border: 'none',
                        fontSize: '11px', color: '#8a7f72', cursor: 'pointer',
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      Try another style
                    </button>
                  </div>
                  <p style={{ fontSize: '12px', color: '#8a7f72', marginBottom: '16px' }}>
                    Styled in <strong style={{ color: '#1a1612' }}>{STYLES.find((s) => s.id === selectedStyle)?.label}</strong>.
                    Compare before & after.
                  </p>
                  {ROOMS.map((room, idx) => (
                    <div key={idx} style={{ marginBottom: '14px', borderRadius: '2px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(26,22,18,0.08)' }}>
                      <div style={{ display: 'flex', aspectRatio: '16/9' }}>
                        <div style={{ flex: 1, position: 'relative', borderRight: '1px solid #fff' }}>
                          <img src={room.url} alt={`${room.label} before`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                          <div style={{
                            position: 'absolute', top: '8px', left: '8px',
                            background: 'rgba(26,22,18,0.7)', color: '#f5f0e8',
                            fontSize: '10px', padding: '2px 7px', borderRadius: '2px',
                            letterSpacing: '0.08em', textTransform: 'uppercase',
                          }}>
                            Before
                          </div>
                        </div>
                        <div style={{ flex: 1, position: 'relative' }}>
                          {room.afterUrl ? (
                            <img src={room.afterUrl} alt={`${room.label} after`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                          ) : (
                            <StyledRoomMini style={selectedStyle!} label={room.label} />
                          )}
                          <div style={{
                            position: 'absolute', top: '8px', left: '8px',
                            background: 'rgba(26,22,18,0.7)', color: '#f5f0e8',
                            fontSize: '10px', padding: '2px 7px', borderRadius: '2px',
                            letterSpacing: '0.08em', textTransform: 'uppercase',
                          }}>
                            After
                          </div>
                        </div>
                      </div>
                      <div style={{
                        background: '#fff', padding: '10px 12px',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      }}>
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

const miniPalettes: Record<string, { bg: string; accent: string; text: string }> = {
  scandinavian: { bg: '#f0ede6', accent: '#c8b9a0', text: '#5a5040' },
  contemporary: { bg: '#dce6ed', accent: '#7a9ab8', text: '#1a2a3a' },
  industrial: { bg: '#3a3630', accent: '#806a58', text: '#c0a890' },
  maximalist: { bg: '#3a2060', accent: '#d09030', text: '#f0d8c0' },
  japandi: { bg: '#e0d8cc', accent: '#a09080', text: '#403020' },
  coastal: { bg: '#c8e4f5', accent: '#60a8cc', text: '#102840' },
}

function StyledRoomMini({ style, label }: { style: string; label: string }) {
  const p = miniPalettes[style] || miniPalettes.contemporary
  return (
    <div style={{
      width: '100%', height: '100%', background: p.bg,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: '8px',
    }}>
      <div style={{ width: '40px', height: '3px', background: p.accent, borderRadius: '1px' }} />
      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '15px', fontWeight: 300, color: p.text }}>
        {label}
      </div>
      <div style={{ fontSize: '10px', color: p.accent, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
        AI Generated
      </div>
    </div>
  )
}
