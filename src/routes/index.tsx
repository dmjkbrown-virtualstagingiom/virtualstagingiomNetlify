import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Home,
})

const S = {
  // Color tokens
  ink: '#1a1612',
  cream: '#f5f0e8',
  warm: '#e8dcc8',
  gold: '#b8965a',
  goldLight: '#d4b07a',
  muted: '#8a7f72',
  surface: '#faf7f2',
  white: '#ffffff',
} as const

function Home() {
  return (
    <div style={{ minHeight: '100vh', background: S.surface, color: S.ink }}>
      {/* Hero */}
      <section style={{
        background: S.ink,
        padding: '80px 48px 96px',
        color: S.cream,
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: '-80px', right: '-80px',
          width: '500px', height: '500px',
          background: 'radial-gradient(circle, rgba(184,150,90,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <p style={{
            fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase',
            color: S.gold, fontWeight: 500, marginBottom: '24px',
          }}>
            AI-Powered Interior Redesign for Estate Agents
          </p>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 'clamp(40px, 6vw, 72px)',
            fontWeight: 300,
            lineHeight: 1.05,
            maxWidth: '700px',
            marginBottom: '24px',
          }}>
            Let buyers see the home{' '}
            <em style={{ fontStyle: 'italic', color: S.goldLight }}>they could live in</em>
          </h1>
          <p style={{
            color: S.muted, fontSize: '17px', maxWidth: '520px',
            lineHeight: 1.75, fontWeight: 300, marginBottom: '40px',
          }}>
            One script tag on your listing pages. Buyers choose an interior style.
            AI reimagines every room in 30 seconds. No uploads. No friction. More viewings.
          </p>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <Link to="/embed-demo" style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: S.gold, color: S.white,
              padding: '14px 32px', borderRadius: '2px',
              fontSize: '13px', fontWeight: 500, letterSpacing: '0.08em',
              textTransform: 'uppercase', textDecoration: 'none',
              transition: 'all 0.2s',
            }}>
              See the widget in action
            </Link>
            <Link to="/tool" style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              border: '1px solid rgba(184,150,90,0.4)', color: S.cream,
              padding: '14px 32px', borderRadius: '2px',
              fontSize: '13px', fontWeight: 400, letterSpacing: '0.08em',
              textTransform: 'uppercase', textDecoration: 'none',
            }}>
              Try the buyer tool
            </Link>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section style={{
        background: S.warm,
        padding: '36px 48px',
        display: 'flex',
        justifyContent: 'center',
        gap: '0',
      }}>
        <div style={{ maxWidth: '900px', width: '100%', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1px', background: S.muted }}>
          {[
            { num: '72%', label: 'of buyers struggle to visualise potential from photos alone' },
            { num: '3.2×', label: 'longer buyers spend on listings with interactive features' },
            { num: '+38%', label: 'more viewing requests from listings using HomeVision' },
          ].map((stat) => (
            <div key={stat.num} style={{
              background: S.cream, padding: '32px 36px', textAlign: 'center',
            }}>
              <div style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: '48px', fontWeight: 300, color: S.gold,
                lineHeight: 1, marginBottom: '10px',
              }}>{stat.num}</div>
              <p style={{ fontSize: '13px', color: S.muted, lineHeight: 1.5, maxWidth: '200px', margin: '0 auto' }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: '96px 48px', maxWidth: '1100px', margin: '0 auto' }}>
        <p style={{
          fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase',
          color: S.gold, fontWeight: 500, marginBottom: '16px',
          display: 'flex', alignItems: 'center', gap: '12px',
        }}>
          How It Works
          <span style={{ flex: 1, height: '1px', background: S.warm, display: 'block' }} />
        </p>
        <h2 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 'clamp(32px, 4vw, 52px)',
          fontWeight: 300, lineHeight: 1.1,
          marginBottom: '56px', maxWidth: '500px',
        }}>
          Three steps. <em style={{ fontStyle: 'italic', color: S.goldLight }}>Zero friction.</em>
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1px', background: S.warm, border: `1px solid ${S.warm}`, borderRadius: '2px', overflow: 'hidden' }}>
          {[
            {
              num: '01',
              title: 'Widget detects photos',
              body: 'One script tag on your listing template. The widget automatically finds all property photos — no uploading, no manual setup per listing.',
            },
            {
              num: '02',
              title: 'Buyer picks a style',
              body: 'A sleek panel slides in. Buyers choose from up to 8 curated interior styles — Scandinavian, Contemporary, Art Deco, and more.',
            },
            {
              num: '03',
              title: 'AI reimagines every room',
              body: 'Each room is transformed in 15–30 seconds. Results stream back one by one. Before/after toggle lets buyers compare instantly.',
            },
          ].map((step) => (
            <div key={step.num} style={{
              background: S.white, padding: '40px 36px',
            }}>
              <div style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: '60px', fontWeight: 300, color: S.warm,
                lineHeight: 1, marginBottom: '16px',
              }}>{step.num}</div>
              <h3 style={{
                fontSize: '14px', fontWeight: 500,
                letterSpacing: '0.06em', textTransform: 'uppercase',
                color: S.ink, marginBottom: '10px',
              }}>{step.title}</h3>
              <p style={{ fontSize: '13px', color: S.muted, lineHeight: 1.65 }}>
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Styles showcase */}
      <section style={{ background: S.ink, padding: '80px 48px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <p style={{
            fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase',
            color: S.gold, fontWeight: 500, marginBottom: '16px',
          }}>
            8 Curated Styles
          </p>
          <h2 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 'clamp(28px, 3.5vw, 44px)',
            fontWeight: 300, color: S.cream, lineHeight: 1.1,
            marginBottom: '48px', maxWidth: '480px',
          }}>
            From <em style={{ fontStyle: 'italic', color: S.goldLight }}>bland listing</em> to dream home in 30 seconds
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            {STYLES.map((style) => (
              <div key={style.id} style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(232,220,200,0.12)',
                borderRadius: '2px',
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '80px',
                  background: style.gradient,
                }} />
                <div style={{ padding: '14px 16px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: S.cream, marginBottom: '3px' }}>
                    {style.label}
                  </div>
                  <div style={{ fontSize: '11px', color: S.muted }}>{style.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integration */}
      <section style={{ padding: '96px 48px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center' }}>
          <div>
            <p style={{
              fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase',
              color: S.gold, fontWeight: 500, marginBottom: '16px',
            }}>Integration</p>
            <h2 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 'clamp(28px, 3.5vw, 44px)',
              fontWeight: 300, lineHeight: 1.1, marginBottom: '24px',
            }}>
              One tag. <em style={{ fontStyle: 'italic', color: S.goldLight }}>Every listing.</em>
            </h2>
            <p style={{ fontSize: '15px', color: S.muted, lineHeight: 1.75, marginBottom: '32px' }}>
              Paste one script tag into your listing template. The widget detects photos automatically, activates on every listing, and never disrupts your page layout.
            </p>
            {[
              'Works with WordPress, Reapit, Alto, and custom sites',
              'Loads asynchronously — zero impact on page speed',
              'Customise accent colour to match your brand',
              'Automatic image detection — no per-listing setup',
              'Results cached — repeat visitors see instant results',
            ].map((item) => (
              <div key={item} style={{
                display: 'flex', alignItems: 'flex-start', gap: '12px',
                marginBottom: '12px', fontSize: '14px', color: S.ink,
              }}>
                <span style={{ color: S.gold, marginTop: '2px', flexShrink: 0 }}>◆</span>
                {item}
              </div>
            ))}
          </div>
          <div style={{
            background: S.ink, borderRadius: '4px',
            padding: '32px', fontFamily: 'monospace', fontSize: '13px',
            lineHeight: 1.7,
          }}>
            <div style={{ color: S.muted, marginBottom: '16px', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Embed snippet
            </div>
            <div style={{ color: '#a8c4d8' }}>&lt;script</div>
            <div style={{ color: S.goldLight, paddingLeft: '16px' }}>
              src="https://cdn.homevision.ai/widget.js"
            </div>
            <div style={{ color: '#a8d4a8', paddingLeft: '16px' }}>
              data-key="ag_live_<span style={{ color: S.muted }}>your_key_here</span>"
            </div>
            <div style={{ color: '#a8d4a8', paddingLeft: '16px' }}>
              data-accent="#c8a96e"
            </div>
            <div style={{ color: '#a8d4a8', paddingLeft: '16px' }}>
              data-watermark="true"
            </div>
            <div style={{ color: '#a8d4a8', paddingLeft: '16px' }}>
              defer
            </div>
            <div style={{ color: '#a8c4d8' }}>&gt;&lt;/script&gt;</div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{ background: S.warm, padding: '96px 48px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <p style={{
            fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase',
            color: S.gold, fontWeight: 500, marginBottom: '16px', textAlign: 'center',
          }}>Pricing</p>
          <h2 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 'clamp(32px, 4vw, 52px)',
            fontWeight: 300, lineHeight: 1.1,
            textAlign: 'center', marginBottom: '56px',
          }}>
            Transparent pricing, <em style={{ fontStyle: 'italic', color: S.goldLight }}>exceptional value</em>
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', maxWidth: '960px', margin: '0 auto' }}>
            {PLANS.map((plan) => (
              <div key={plan.name} style={{
                background: plan.highlighted ? S.ink : S.white,
                color: plan.highlighted ? S.cream : S.ink,
                padding: '36px 28px',
                borderRadius: '2px',
                border: plan.highlighted ? 'none' : `1px solid ${S.warm}`,
                boxShadow: plan.highlighted ? '0 8px 40px rgba(26,22,18,0.2)' : 'none',
                display: 'flex', flexDirection: 'column',
              }}>
                <div style={{
                  fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase',
                  fontWeight: 500, color: plan.highlighted ? S.goldLight : S.muted,
                  marginBottom: '12px',
                }}>{plan.name}</div>
                <div style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: '44px', fontWeight: 300,
                  color: plan.highlighted ? S.gold : S.ink,
                  lineHeight: 1, marginBottom: '4px',
                }}>{plan.price}</div>
                {plan.period && (
                  <div style={{ fontSize: '12px', color: S.muted, marginBottom: '16px' }}>{plan.period}</div>
                )}
                <p style={{
                  fontSize: '13px', color: plan.highlighted ? 'rgba(245,240,232,0.6)' : S.muted,
                  lineHeight: 1.6, marginBottom: '24px', flex: 1,
                }}>{plan.desc}</p>
                <div style={{ marginBottom: '28px' }}>
                  {plan.features.map((f) => (
                    <div key={f} style={{
                      fontSize: '13px', color: plan.highlighted ? 'rgba(245,240,232,0.8)' : S.ink,
                      marginBottom: '8px', display: 'flex', alignItems: 'flex-start', gap: '8px',
                    }}>
                      <span style={{ color: S.gold, flexShrink: 0 }}>◆</span> {f}
                    </div>
                  ))}
                </div>
                <Link to="/dashboard" style={{
                  display: 'block', textAlign: 'center',
                  padding: '12px',
                  background: plan.highlighted ? S.gold : 'transparent',
                  color: plan.highlighted ? S.white : S.ink,
                  border: plan.highlighted ? 'none' : `1px solid ${S.warm}`,
                  borderRadius: '2px',
                  fontSize: '12px', fontWeight: 500,
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                  textDecoration: 'none',
                }}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{
        background: S.ink, padding: '96px 48px',
        textAlign: 'center',
      }}>
        <p style={{
          fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase',
          color: S.gold, fontWeight: 500, marginBottom: '20px',
        }}>Get Started Today</p>
        <h2 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 'clamp(32px, 4vw, 56px)',
          fontWeight: 300, color: S.cream, lineHeight: 1.1,
          marginBottom: '24px',
        }}>
          Ready to transform <em style={{ fontStyle: 'italic', color: S.goldLight }}>your listings?</em>
        </h2>
        <p style={{ color: S.muted, fontSize: '16px', marginBottom: '40px', maxWidth: '440px', margin: '0 auto 40px' }}>
          Join estate agents who are giving buyers a richer experience and generating more viewings.
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/embed-demo" style={{
            background: S.gold, color: S.white,
            padding: '16px 40px', borderRadius: '2px',
            fontSize: '13px', fontWeight: 500,
            letterSpacing: '0.1em', textTransform: 'uppercase',
            textDecoration: 'none',
          }}>
            See live demo
          </Link>
          <Link to="/dashboard" style={{
            border: '1px solid rgba(184,150,90,0.4)', color: S.cream,
            padding: '16px 40px', borderRadius: '2px',
            fontSize: '13px', fontWeight: 400,
            letterSpacing: '0.1em', textTransform: 'uppercase',
            textDecoration: 'none',
          }}>
            Start free trial
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: `1px solid ${S.warm}`,
        padding: '40px 48px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontSize: '13px', color: S.muted,
      }}>
        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '20px', fontWeight: 300, color: S.ink }}>
          Home<span style={{ color: S.gold, fontStyle: 'italic' }}>Vision</span>
        </span>
        <span>© 2026 HomeVision · homevision.ai · hello@homevision.ai</span>
        <div style={{ display: 'flex', gap: '24px' }}>
          <Link to="/faq" style={{ color: S.muted, textDecoration: 'none' }}>FAQ</Link>
          <Link to="/tool" style={{ color: S.muted, textDecoration: 'none' }}>Buyer Tool</Link>
          <Link to="/embed-demo" style={{ color: S.muted, textDecoration: 'none' }}>Embed Demo</Link>
        </div>
      </footer>
    </div>
  )
}

const STYLES = [
  { id: 'scandinavian', label: 'Scandinavian', desc: 'Clean lines, natural wood', gradient: 'linear-gradient(135deg, #f0ede6 0%, #e4ddd3 50%, #d8cfc2 100%)' },
  { id: 'contemporary', label: 'Contemporary', desc: 'Sleek, modern, minimal', gradient: 'linear-gradient(135deg, #e8eef2 0%, #d0dce5 50%, #b8c8d4 100%)' },
  { id: 'industrial', label: 'Industrial', desc: 'Raw steel, urban edge', gradient: 'linear-gradient(135deg, #3d3933 0%, #5a5650 50%, #2d2b28 100%)' },
  { id: 'maximalist', label: 'Maximalist', desc: 'Bold colour, rich texture', gradient: 'linear-gradient(135deg, #4a2d6b 0%, #7a4a95 50%, #d4a03a 100%)' },
  { id: 'japandi', label: 'Japandi', desc: 'Warm wabi-sabi calm', gradient: 'linear-gradient(135deg, #e8e0d5 0%, #c8bfb0 50%, #a09285 100%)' },
  { id: 'coastal', label: 'Coastal', desc: 'Sea blues, natural linen', gradient: 'linear-gradient(135deg, #d4eaf5 0%, #a8d4e8 50%, #7ab8d2 100%)' },
  { id: 'artdeco', label: 'Art Deco', desc: 'Geometric, glamorous gold', gradient: 'linear-gradient(135deg, #1a1408 0%, #3d3010 50%, #b8965a 100%)' },
  { id: 'biophilic', label: 'Biophilic', desc: 'Living walls, natural forms', gradient: 'linear-gradient(135deg, #2d4a2a 0%, #4a7a45 50%, #88b880 100%)' },
]

const PLANS = [
  {
    name: 'Starter',
    price: '£49',
    period: 'per month',
    desc: 'Perfect for independent agents and small offices.',
    features: ['5 listings per month', 'All 8 interior styles', 'Standard support'],
    cta: 'Start free',
    highlighted: false,
  },
  {
    name: 'Growth',
    price: '£149',
    period: 'per month',
    desc: 'For growing agencies that want more reach.',
    features: ['20 listings per month', 'Custom accent colour', 'Priority support', 'Lead capture forms'],
    cta: 'Start free trial',
    highlighted: true,
  },
  {
    name: 'Agency',
    price: '£399',
    period: 'per month',
    desc: 'For larger agencies with high listing volumes.',
    features: ['Unlimited listings', 'White-label branding', 'Webhook integrations', 'Dedicated onboarding'],
    cta: 'Get started',
    highlighted: false,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    desc: 'For national networks and portals.',
    features: ['Unlimited everything', 'Custom AI model fine-tuning', 'SLA guarantee', 'Dedicated account manager', 'On-premise option'],
    cta: 'Contact sales',
    highlighted: false,
  },
]
