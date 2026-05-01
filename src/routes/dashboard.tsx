import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'

export const Route = createFileRoute('/dashboard')({
  component: AgentDashboard,
})

type Tab = 'dashboard' | 'listings' | 'integration' | 'customise' | 'billing' | 'settings'

const SIDEBAR_W = 240

const C = {
  ink: '#0f0e0c',
  bg: '#f2efe9',
  surface: '#ffffff',
  surface2: '#f8f6f1',
  border: '#e4dfd5',
  muted: '#9a9288',
  dim: '#c4bfb5',
  gold: '#c9922a',
  goldPale: '#f5e9d0',
  goldMid: '#e8c87a',
  green: '#2a7a4e',
  greenPale: '#e0f0e8',
  red: '#b84040',
  redPale: '#f5e0e0',
  blue: '#2a4a8a',
  bluePale: '#e0e8f8',
} as const

function AgentDashboard() {
  const [tab, setTab] = useState<Tab>('dashboard')
  const [showKey, setShowKey] = useState(false)
  const [copied, setCopied] = useState(false)
  const [accentColor, setAccentColor] = useState('#c8a96e')
  const [buttonLabel, setButtonLabel] = useState('Reimagine this home')
  const [barHeights, setBarHeights] = useState<number[]>([])

  useEffect(() => {
    const data = [42, 67, 55, 80, 93, 71, 58, 84, 96, 72, 88, 64, 77, 91, 68]
    setTimeout(() => setBarHeights(data), 100)
  }, [])

  const copySnippet = () => {
    navigator.clipboard.writeText(
      `<script\n  src="https://cdn.Virtual Staging IOM.ai/widget.js"\n  data-key="ag_live_acorn8a2f9b"\n  data-accent="${accentColor}"\n  data-watermark="true"\n  defer\n></script>`
    ).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 72px)', background: C.bg, fontFamily: "'Geist', 'DM Sans', sans-serif", fontSize: '14px', color: C.ink }}>

      {/* Sidebar */}
      <aside style={{
        width: SIDEBAR_W, background: C.ink, minHeight: '100%',
        display: 'flex', flexDirection: 'column', flexShrink: 0,
        position: 'fixed', top: '72px', bottom: 0, left: 0, zIndex: 50,
      }}>
        {/* Agent info */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: `linear-gradient(135deg, ${C.gold}, #8a5a10)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '13px', fontWeight: 600, color: '#fff', flexShrink: 0,
            }}>AC</div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 500, color: '#fff', lineHeight: 1.2 }}>Acorn Estate Agents</div>
              <div style={{ fontSize: '10px', color: C.goldMid, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Growth Plan</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 12px' }}>
          {[
            { id: 'dashboard', icon: '▦', label: 'Dashboard' },
            { id: 'listings', icon: '⊞', label: 'Listings', badge: '47' },
            { id: 'integration', icon: '◇', label: 'Integration' },
            { id: 'customise', icon: '◉', label: 'Customise' },
            { id: 'billing', icon: '◈', label: 'Billing' },
            { id: 'settings', icon: '⊙', label: 'Settings' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id as Tab)}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 12px', borderRadius: '6px',
                cursor: 'pointer', width: '100%', border: 'none',
                marginBottom: '2px', fontFamily: "'DM Sans', sans-serif",
                background: tab === item.id ? 'rgba(201,146,42,0.15)' : 'transparent',
                color: tab === item.id ? C.goldMid : 'rgba(255,255,255,0.45)',
                fontSize: '13px', fontWeight: 400,
                transition: 'all 0.15s', textAlign: 'left',
              }}
            >
              <span style={{ fontSize: '14px', width: '20px', textAlign: 'center' }}>{item.icon}</span>
              {item.label}
              {item.badge && (
                <span style={{
                  marginLeft: 'auto', background: C.gold, color: '#fff',
                  fontSize: '10px', fontWeight: 600, padding: '2px 7px', borderRadius: '20px',
                }}>{item.badge}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Usage bar */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginBottom: '8px' }}>
            <span>Monthly usage</span>
            <span style={{ color: C.goldMid }}>618 / 1,000</span>
          </div>
          <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ height: '100%', background: `linear-gradient(90deg, ${C.gold}, ${C.goldMid})`, width: '62%', borderRadius: '2px', transition: 'width 1s ease' }} />
          </div>
        </div>
      </aside>

      {/* Main */}
      <main style={{ marginLeft: SIDEBAR_W, flex: 1, minHeight: '100%', display: 'flex', flexDirection: 'column' }}>

        {/* Topbar */}
        <div style={{
          background: C.surface, borderBottom: `1px solid ${C.border}`,
          padding: '0 40px', height: '60px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: '72px', zIndex: 40,
        }}>
          <h1 style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: '20px', color: C.ink,
          }}>
            {tab === 'dashboard' ? 'Dashboard' :
             tab === 'listings' ? 'Active Listings' :
             tab === 'integration' ? 'Integration' :
             tab === 'customise' ? 'Customise Widget' :
             tab === 'billing' ? 'Billing' : 'Settings'}
          </h1>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {tab === 'dashboard' && (
              <span style={{ fontSize: '12px', color: C.muted }}>Last updated: just now</span>
            )}
            <Btn variant="ghost" size="sm">Help</Btn>
            {tab === 'billing' && <Btn variant="gold" size="sm">Upgrade Plan</Btn>}
          </div>
        </div>

        <div style={{ padding: '32px 40px', flex: 1 }}>

          {/* ── DASHBOARD TAB ── */}
          {tab === 'dashboard' && (
            <>
              {/* Stats row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginBottom: '24px' }}>
                {[
                  { label: 'Total Generations', value: '4,812', delta: '+18%', trend: 'up', color: 'gold' },
                  { label: 'Active Listings', value: '47', delta: '+3 this week', trend: 'up', color: 'green' },
                  { label: 'Cache Hit Rate', value: '71%', delta: 'of requests cached', trend: 'neutral', color: 'blue' },
                  { label: 'Avg. Time on Page', value: '4m 38s', delta: '+24% vs baseline', trend: 'up', color: 'neutral' },
                ].map((stat) => (
                  <div key={stat.label} style={{
                    background: C.surface, border: `1px solid ${C.border}`,
                    borderRadius: '6px', padding: '20px 22px',
                    borderTop: `3px solid ${stat.color === 'gold' ? C.gold : stat.color === 'green' ? C.green : stat.color === 'blue' ? C.blue : C.dim}`,
                  }}>
                    <div style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.muted, marginBottom: '10px' }}>
                      {stat.label}
                    </div>
                    <div style={{ fontFamily: 'Georgia, serif', fontSize: '34px', color: C.ink, lineHeight: 1, marginBottom: '8px' }}>
                      {stat.value}
                    </div>
                    <div style={{ fontSize: '12px', color: stat.trend === 'up' ? C.green : C.muted }}>
                      {stat.delta}
                    </div>
                  </div>
                ))}
              </div>

              {/* Chart row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '16px', marginBottom: '24px' }}>
                {/* Bar chart */}
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '6px', overflow: 'hidden' }}>
                  <div style={{ padding: '18px 22px', borderBottom: `1px solid ${C.border}` }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: C.ink }}>Daily Generations</div>
                    <div style={{ fontSize: '12px', color: C.muted, marginTop: '2px' }}>Fresh + cached, last 15 days</div>
                  </div>
                  <div style={{ padding: '22px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '140px' }}>
                      {barHeights.map((h, i) => (
                        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', height: '100%', justifyContent: 'flex-end' }}>
                          <div style={{
                            width: '100%', borderRadius: '3px 3px 0 0',
                            background: `linear-gradient(to top, ${C.gold}, ${C.goldMid})`,
                            height: `${(h / 100) * 140}px`,
                            transition: 'height 0.8s cubic-bezier(0.34,1.56,0.64,1)',
                          }} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Top styles */}
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '6px', overflow: 'hidden' }}>
                  <div style={{ padding: '18px 22px', borderBottom: `1px solid ${C.border}` }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: C.ink }}>Top Styles</div>
                    <div style={{ fontSize: '12px', color: C.muted, marginTop: '2px' }}>Buyer preferences this month</div>
                  </div>
                  <div style={{ padding: '16px 22px' }}>
                    {[
                      { name: 'Scandinavian', pct: 28, color: '#c8b9a0' },
                      { name: 'Contemporary', pct: 22, color: '#90a8c0' },
                      { name: 'Japandi', pct: 18, color: '#b0a090' },
                      { name: 'Coastal', pct: 14, color: '#78b0d0' },
                      { name: 'Art Deco', pct: 10, color: '#b8965a' },
                      { name: 'Other', pct: 8, color: '#c4bfb5' },
                    ].map((style) => (
                      <div key={style.name} style={{ marginBottom: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                          <span style={{ color: C.ink }}>{style.name}</span>
                          <span style={{ color: C.muted }}>{style.pct}%</span>
                        </div>
                        <div style={{ height: '4px', background: C.border, borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', background: style.color, width: `${style.pct * 3.57}%`, borderRadius: '2px', transition: 'width 1s ease' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Listings table */}
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '6px', overflow: 'hidden' }}>
                <div style={{ padding: '18px 22px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: C.ink }}>Recent Listings</div>
                    <div style={{ fontSize: '12px', color: C.muted, marginTop: '2px' }}>Properties where widget was triggered this week</div>
                  </div>
                  <Btn variant="ghost" size="sm" onClick={() => setTab('listings')}>View all</Btn>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: C.surface2 }}>
                      {['Address', 'Generations', 'Top Style', 'Avg. Session', 'Status'].map((h) => (
                        <th key={h} style={{ padding: '10px 22px', textAlign: 'left', fontSize: '11px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.muted, fontFamily: "'DM Sans', sans-serif" }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {SAMPLE_LISTINGS.slice(0, 5).map((l, i) => (
                      <tr key={i} style={{ borderTop: `1px solid ${C.border}` }}>
                        <td style={{ padding: '12px 22px', fontSize: '13px', color: C.ink, fontWeight: 500 }}>{l.address}</td>
                        <td style={{ padding: '12px 22px', fontSize: '13px', color: C.ink }}>{l.gens}</td>
                        <td style={{ padding: '12px 22px', fontSize: '13px', color: C.muted }}>{l.topStyle}</td>
                        <td style={{ padding: '12px 22px', fontSize: '13px', color: C.muted }}>{l.avgSession}</td>
                        <td style={{ padding: '12px 22px' }}>
                          <span style={{
                            fontSize: '11px', fontWeight: 500, padding: '3px 9px', borderRadius: '20px',
                            background: l.status === 'Active' ? C.greenPale : C.border,
                            color: l.status === 'Active' ? C.green : C.muted,
                          }}>{l.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ── LISTINGS TAB ── */}
          {tab === 'listings' && (
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '6px', overflow: 'hidden' }}>
              <div style={{ padding: '18px 22px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: C.ink }}>All Active Listings</div>
                  <div style={{ fontSize: '12px', color: C.muted, marginTop: '2px' }}>
                    Pages are added automatically when a buyer first triggers the widget
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input placeholder="Search listings..." style={{
                    border: `1px solid ${C.border}`, background: C.surface2,
                    borderRadius: '4px', padding: '7px 12px', fontSize: '13px',
                    fontFamily: "'DM Sans', sans-serif", outline: 'none', width: '220px',
                    color: C.ink,
                  }} />
                  <Btn variant="ghost" size="sm">Filter</Btn>
                </div>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: C.surface2 }}>
                    {['Address', 'Activated', 'Generations', 'Cache hits', 'Top Style', 'Status'].map((h) => (
                      <th key={h} style={{ padding: '10px 22px', textAlign: 'left', fontSize: '11px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.muted, fontFamily: "'DM Sans', sans-serif" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {SAMPLE_LISTINGS.map((l, i) => (
                    <tr key={i} style={{ borderTop: `1px solid ${C.border}`, transition: 'background 0.1s' }}>
                      <td style={{ padding: '12px 22px', fontSize: '13px', fontWeight: 500, color: C.ink }}>{l.address}</td>
                      <td style={{ padding: '12px 22px', fontSize: '12px', color: C.muted }}>{l.activated}</td>
                      <td style={{ padding: '12px 22px', fontSize: '13px', color: C.ink }}>{l.gens}</td>
                      <td style={{ padding: '12px 22px', fontSize: '13px', color: C.muted }}>{l.cacheHits}</td>
                      <td style={{ padding: '12px 22px', fontSize: '12px', color: C.muted }}>{l.topStyle}</td>
                      <td style={{ padding: '12px 22px' }}>
                        <span style={{
                          fontSize: '11px', padding: '3px 9px', borderRadius: '20px',
                          background: l.status === 'Active' ? C.greenPale : C.border,
                          color: l.status === 'Active' ? C.green : C.muted,
                        }}>{l.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── INTEGRATION TAB ── */}
          {tab === 'integration' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {/* API Key */}
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '6px', overflow: 'hidden', gridColumn: '1/-1' }}>
                <div style={{ padding: '18px 22px', borderBottom: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: C.ink }}>API Key</div>
                  <div style={{ fontSize: '12px', color: C.muted, marginTop: '2px' }}>Keep this secret — it authorises widget requests from your domain</div>
                </div>
                <div style={{ padding: '22px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <code style={{
                    flex: 1, background: C.surface2, border: `1px solid ${C.border}`,
                    borderRadius: '4px', padding: '10px 16px', fontSize: '13px', fontFamily: 'monospace',
                    color: C.ink, letterSpacing: '0.04em',
                  }}>
                    {showKey ? 'ag_live_acorn8a2f9b3c1d4e5f6g7h8i9j' : 'ag_live_•••••••••••••••••••••••'}
                  </code>
                  <Btn variant="ghost" size="sm" onClick={() => setShowKey(!showKey)}>
                    {showKey ? 'Hide' : 'Reveal'}
                  </Btn>
                  <Btn variant="ghost" size="sm">Regenerate</Btn>
                </div>
              </div>

              {/* Embed snippet */}
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '6px', overflow: 'hidden', gridColumn: '1/-1' }}>
                <div style={{ padding: '18px 22px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: C.ink }}>Embed Snippet</div>
                    <div style={{ fontSize: '12px', color: C.muted, marginTop: '2px' }}>Paste before the closing &lt;/body&gt; tag in your listing template</div>
                  </div>
                  <Btn variant="ghost" size="sm" onClick={copySnippet}>
                    {copied ? '✓ Copied!' : 'Copy snippet'}
                  </Btn>
                </div>
                <div style={{ padding: '22px', background: C.ink }}>
                  <pre style={{ fontFamily: 'monospace', fontSize: '13px', lineHeight: 1.8, color: '#a8c4d8', margin: 0, whiteSpace: 'pre-wrap' }}>
{`<script
  src="https://cdn.Virtual Staging IOM.ai/widget.js"
  data-key="ag_live_acorn8a2f9b"
  data-accent="`}<span style={{ color: '#a8d8a8' }}>{accentColor}</span>{`"
  data-watermark="true"
  defer
></script>`}
                  </pre>
                </div>
              </div>

              {/* Platform guides */}
              {['WordPress', 'Reapit / Alto', 'Custom HTML'].map((platform) => (
                <div key={platform} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '6px', padding: '22px' }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: C.ink, marginBottom: '8px' }}>{platform}</div>
                  <p style={{ fontSize: '13px', color: C.muted, lineHeight: 1.6, marginBottom: '16px' }}>
                    {platform === 'WordPress'
                      ? 'Add the snippet via Appearance → Theme Editor → footer.php, or use a header/footer plugin.'
                      : platform === 'Reapit / Alto'
                      ? 'Add the snippet to your listing detail page template via your CMS portal → custom scripts section.'
                      : 'Paste the snippet before the closing </body> tag in your property detail page template.'}
                  </p>
                  <Btn variant="ghost" size="sm">View guide →</Btn>
                </div>
              ))}
            </div>
          )}

          {/* ── CUSTOMISE TAB ── */}
          {tab === 'customise' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px' }}>
              <div>
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '6px', overflow: 'hidden', marginBottom: '16px' }}>
                  <div style={{ padding: '18px 22px', borderBottom: `1px solid ${C.border}` }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: C.ink }}>Appearance</div>
                  </div>
                  <div style={{ padding: '22px' }}>
                    <FormRow label="Accent colour">
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <input
                          type="color"
                          value={accentColor}
                          onChange={(e) => setAccentColor(e.target.value)}
                          style={{ width: '40px', height: '36px', border: `1px solid ${C.border}`, borderRadius: '4px', cursor: 'pointer', padding: '2px' }}
                        />
                        <code style={{ fontSize: '12px', color: C.muted, background: C.surface2, padding: '4px 10px', borderRadius: '4px', border: `1px solid ${C.border}` }}>
                          {accentColor}
                        </code>
                      </div>
                    </FormRow>
                    <FormRow label="Button label">
                      <input
                        value={buttonLabel}
                        onChange={(e) => setButtonLabel(e.target.value)}
                        style={{
                          border: `1px solid ${C.border}`, borderRadius: '4px',
                          padding: '8px 12px', fontSize: '13px',
                          fontFamily: "'DM Sans', sans-serif", outline: 'none',
                          width: '280px', color: C.ink, background: C.surface,
                        }}
                      />
                    </FormRow>
                    <FormRow label="Panel position">
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {['Right slide-in', 'Bottom sheet', 'Fullscreen'].map((pos) => (
                          <button key={pos} style={{
                            padding: '7px 14px', borderRadius: '4px', fontSize: '12px',
                            border: `1px solid ${pos === 'Right slide-in' ? accentColor : C.border}`,
                            background: pos === 'Right slide-in' ? C.goldPale : C.surface2,
                            color: pos === 'Right slide-in' ? C.gold : C.muted,
                            cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                          }}>{pos}</button>
                        ))}
                      </div>
                    </FormRow>
                  </div>
                </div>

                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '6px', overflow: 'hidden', marginBottom: '16px' }}>
                  <div style={{ padding: '18px 22px', borderBottom: `1px solid ${C.border}` }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: C.ink }}>Active Styles</div>
                    <div style={{ fontSize: '12px', color: C.muted, marginTop: '2px' }}>Choose which styles buyers can select</div>
                  </div>
                  <div style={{ padding: '22px', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '8px' }}>
                    {['Scandinavian', 'Contemporary', 'Industrial', 'Maximalist', 'Japandi', 'Coastal', 'Art Deco', 'Biophilic'].map((s) => (
                      <label key={s} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12px', color: C.ink }}>
                        <input type="checkbox" defaultChecked style={{ accentColor: C.gold }} />
                        {s}
                      </label>
                    ))}
                  </div>
                </div>

                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '6px', overflow: 'hidden' }}>
                  <div style={{ padding: '18px 22px', borderBottom: `1px solid ${C.border}` }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: C.ink }}>Behaviour</div>
                  </div>
                  <div style={{ padding: '22px' }}>
                    {[
                      { label: 'Show AI visualisation watermark', defaultChecked: true },
                      { label: 'Enable download button for buyers', defaultChecked: false },
                      { label: 'Lead capture form after results', defaultChecked: true },
                      { label: 'Auto-open on page load (not recommended)', defaultChecked: false },
                    ].map((toggle) => (
                      <label key={toggle.label} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', cursor: 'pointer' }}>
                        <input type="checkbox" defaultChecked={toggle.defaultChecked} style={{ accentColor: C.gold, width: '16px', height: '16px' }} />
                        <span style={{ fontSize: '13px', color: C.ink }}>{toggle.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Live preview */}
              <div>
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '6px', overflow: 'hidden', position: 'sticky', top: '132px' }}>
                  <div style={{ padding: '14px 18px', borderBottom: `1px solid ${C.border}` }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: C.ink }}>Live Preview</div>
                  </div>
                  <div style={{ padding: '20px', background: '#e8e4dc' }}>
                    <button style={{
                      background: 'rgba(28,43,58,0.85)', color: '#fff',
                      border: `1px solid ${accentColor}44`, borderRadius: '4px',
                      padding: '10px 16px', cursor: 'pointer',
                      fontFamily: "'DM Sans', sans-serif",
                      display: 'flex', alignItems: 'center', gap: '8px',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                      width: '100%',
                    }}>
                      <span style={{ color: accentColor, fontSize: '14px' }}>✦</span>
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: '12px', fontWeight: 500 }}>{buttonLabel}</div>
                        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.45)', letterSpacing: '0.08em' }}>AI Interior Styling</div>
                      </div>
                    </button>
                    <p style={{ fontSize: '11px', color: '#888', marginTop: '12px', textAlign: 'center' }}>
                      Widget trigger button
                    </p>
                  </div>
                  <div style={{ padding: '14px 18px', borderTop: `1px solid ${C.border}` }}>
                    <Btn variant="gold" onClick={() => {}}>Save changes</Btn>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── BILLING TAB ── */}
          {tab === 'billing' && (
            <>
              {/* Current plan */}
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '6px', overflow: 'hidden', marginBottom: '20px' }}>
                <div style={{ padding: '18px 22px', borderBottom: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: C.ink }}>Current Plan</div>
                </div>
                <div style={{ padding: '22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '22px', fontWeight: 600, color: C.ink, marginBottom: '4px' }}>Growth · £149/month</div>
                    <div style={{ fontSize: '13px', color: C.muted }}>Next billing date: 1 June 2026 · Auto-renews</div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <Btn variant="ghost">Cancel plan</Btn>
                    <Btn variant="gold">Upgrade to Agency</Btn>
                  </div>
                </div>
                <div style={{ padding: '0 22px 22px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: C.muted, marginBottom: '8px' }}>
                    <span>Generations this month</span>
                    <span style={{ color: C.gold }}>618 / 1,000</span>
                  </div>
                  <div style={{ height: '8px', background: C.border, borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: `linear-gradient(90deg, ${C.gold}, ${C.goldMid})`, width: '62%', borderRadius: '4px' }} />
                  </div>
                </div>
              </div>

              {/* Plans comparison */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '24px' }}>
                {PLANS.map((plan) => (
                  <div key={plan.name} style={{
                    background: plan.highlighted ? C.ink : C.surface,
                    border: `1px solid ${plan.highlighted ? 'transparent' : C.border}`,
                    borderRadius: '6px', padding: '24px 20px',
                    display: 'flex', flexDirection: 'column',
                  }}>
                    <div style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: plan.highlighted ? C.goldMid : C.muted, marginBottom: '8px' }}>
                      {plan.name}
                    </div>
                    <div style={{ fontFamily: 'Georgia, serif', fontSize: '32px', color: plan.highlighted ? C.gold : C.ink, lineHeight: 1, marginBottom: '4px' }}>
                      {plan.price}
                    </div>
                    {plan.period && <div style={{ fontSize: '11px', color: C.muted, marginBottom: '14px' }}>{plan.period}</div>}
                    {plan.features.map((f) => (
                      <div key={f} style={{ fontSize: '12px', color: plan.highlighted ? 'rgba(245,240,232,0.7)' : C.muted, marginBottom: '6px', display: 'flex', gap: '6px' }}>
                        <span style={{ color: C.gold, flexShrink: 0 }}>◆</span> {f}
                      </div>
                    ))}
                    <div style={{ flex: 1 }} />
                    <button style={{
                      marginTop: '16px', padding: '10px',
                      background: plan.highlighted ? C.gold : 'transparent',
                      color: plan.highlighted ? '#fff' : C.ink,
                      border: `1px solid ${plan.highlighted ? 'transparent' : C.border}`,
                      borderRadius: '4px', fontSize: '12px', fontWeight: 500,
                      cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                      letterSpacing: '0.06em',
                    }}>
                      {plan.name === 'Growth' ? '✓ Current plan' : plan.name === 'Enterprise' ? 'Contact sales' : `Switch to ${plan.name}`}
                    </button>
                  </div>
                ))}
              </div>

              {/* Invoice history */}
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '6px', overflow: 'hidden' }}>
                <div style={{ padding: '18px 22px', borderBottom: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: C.ink }}>Invoice History</div>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: C.surface2 }}>
                      {['Date', 'Description', 'Amount', 'Status', ''].map((h) => (
                        <th key={h} style={{ padding: '10px 22px', textAlign: 'left', fontSize: '11px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.muted, fontFamily: "'DM Sans', sans-serif" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { date: '1 May 2026', desc: 'Growth Plan — May 2026', amount: '£149.00', status: 'Paid' },
                      { date: '1 Apr 2026', desc: 'Growth Plan — April 2026', amount: '£149.00', status: 'Paid' },
                      { date: '1 Mar 2026', desc: 'Growth Plan — March 2026', amount: '£149.00', status: 'Paid' },
                      { date: '1 Feb 2026', desc: 'Starter → Growth upgrade', amount: '£100.00', status: 'Paid' },
                    ].map((inv, i) => (
                      <tr key={i} style={{ borderTop: `1px solid ${C.border}` }}>
                        <td style={{ padding: '12px 22px', fontSize: '13px', color: C.muted }}>{inv.date}</td>
                        <td style={{ padding: '12px 22px', fontSize: '13px', color: C.ink }}>{inv.desc}</td>
                        <td style={{ padding: '12px 22px', fontSize: '13px', fontWeight: 500, color: C.ink }}>{inv.amount}</td>
                        <td style={{ padding: '12px 22px' }}>
                          <span style={{ fontSize: '11px', background: C.greenPale, color: C.green, padding: '3px 9px', borderRadius: '20px' }}>{inv.status}</span>
                        </td>
                        <td style={{ padding: '12px 22px' }}>
                          <button style={{ background: 'none', border: 'none', color: C.gold, fontSize: '12px', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                            Download PDF
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ── SETTINGS TAB ── */}
          {tab === 'settings' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '6px', overflow: 'hidden', gridColumn: '1/-1' }}>
                <div style={{ padding: '18px 22px', borderBottom: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: C.ink }}>Agency Details</div>
                </div>
                <div style={{ padding: '22px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  {[
                    { label: 'Agency name', value: 'Acorn Estate Agents' },
                    { label: 'Website', value: 'acornestate.co.uk' },
                    { label: 'Contact email', value: 'info@acornestate.co.uk' },
                    { label: 'Phone', value: '0161 928 4400' },
                  ].map((field) => (
                    <FormRow key={field.label} label={field.label}>
                      <input defaultValue={field.value} style={{
                        border: `1px solid ${C.border}`, borderRadius: '4px',
                        padding: '8px 12px', fontSize: '13px',
                        fontFamily: "'DM Sans', sans-serif", outline: 'none',
                        width: '100%', color: C.ink, background: C.surface,
                      }} />
                    </FormRow>
                  ))}
                </div>
                <div style={{ padding: '0 22px 22px' }}>
                  <Btn variant="gold">Save changes</Btn>
                </div>
              </div>

              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '6px', overflow: 'hidden' }}>
                <div style={{ padding: '18px 22px', borderBottom: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: C.ink }}>Notifications</div>
                </div>
                <div style={{ padding: '22px' }}>
                  {[
                    { label: 'Weekly usage summary', defaultChecked: true },
                    { label: 'Generation milestone alerts', defaultChecked: true },
                    { label: 'Lead capture notifications', defaultChecked: false },
                    { label: 'Billing & invoice emails', defaultChecked: true },
                  ].map((n) => (
                    <label key={n.label} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', cursor: 'pointer' }}>
                      <input type="checkbox" defaultChecked={n.defaultChecked} style={{ accentColor: C.gold, width: '16px', height: '16px' }} />
                      <span style={{ fontSize: '13px', color: C.ink }}>{n.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ background: C.redPale, border: `1px solid #e0c0c0`, borderRadius: '6px', overflow: 'hidden' }}>
                <div style={{ padding: '18px 22px', borderBottom: '1px solid #e0c0c0' }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: C.red }}>Danger Zone</div>
                </div>
                <div style={{ padding: '22px' }}>
                  <p style={{ fontSize: '13px', color: C.red, marginBottom: '16px', lineHeight: 1.6 }}>
                    These actions are irreversible. Please proceed with care.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <button style={{
                      padding: '10px 16px', borderRadius: '4px', fontSize: '13px', fontWeight: 500,
                      background: 'transparent', border: `1px solid ${C.red}`, color: C.red,
                      cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", textAlign: 'left',
                    }}>Pause widget on all listings</button>
                    <button style={{
                      padding: '10px 16px', borderRadius: '4px', fontSize: '13px', fontWeight: 500,
                      background: C.red, border: 'none', color: '#fff',
                      cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", textAlign: 'left',
                    }}>Delete account and data</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function Btn({
  children, variant = 'ghost', size = 'normal', onClick,
}: {
  children: React.ReactNode
  variant?: 'ghost' | 'gold' | 'primary'
  size?: 'sm' | 'normal'
  onClick?: () => void
}) {
  const C2 = {
    ink: '#0f0e0c',
    gold: '#c9922a',
    border: '#e4dfd5',
    surface2: '#f8f6f1',
    goldPale: '#f5e9d0',
  }
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        padding: size === 'sm' ? '6px 12px' : '9px 18px',
        borderRadius: '5px', fontSize: size === 'sm' ? '12px' : '13px',
        fontWeight: 500, cursor: 'pointer', border: 'none',
        transition: 'all 0.15s', fontFamily: "'DM Sans', sans-serif",
        background: variant === 'ghost' ? 'transparent' : variant === 'gold' ? C2.gold : C2.ink,
        color: variant === 'ghost' ? C2.ink : '#fff',
        borderWidth: '1px', borderStyle: 'solid',
        borderColor: variant === 'ghost' ? C2.border : 'transparent',
      }}
    >
      {children}
    </button>
  )
}

function FormRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#9a9288', marginBottom: '6px', letterSpacing: '0.04em' }}>
        {label}
      </label>
      {children}
    </div>
  )
}

const SAMPLE_LISTINGS = [
  { address: '14 Elmwood Crescent, Hale, WA15', activated: '24 Apr 2026', gens: '142', cacheHits: '89', topStyle: 'Scandinavian', avgSession: '5m 12s', status: 'Active' },
  { address: '7 Beechwood Ave, Altrincham, WA14', activated: '22 Apr 2026', gens: '98', cacheHits: '61', topStyle: 'Contemporary', avgSession: '4m 38s', status: 'Active' },
  { address: '3 Maple Drive, Bowdon, WA14', activated: '20 Apr 2026', gens: '76', cacheHits: '48', topStyle: 'Japandi', avgSession: '3m 55s', status: 'Active' },
  { address: '22 Oak Road, Hale Barns, WA15', activated: '18 Apr 2026', gens: '61', cacheHits: '40', topStyle: 'Coastal', avgSession: '4m 12s', status: 'Active' },
  { address: '9 Willow Lane, Timperley, WA15', activated: '15 Apr 2026', gens: '44', cacheHits: '29', topStyle: 'Art Deco', avgSession: '3m 28s', status: 'Active' },
  { address: '31 Cedar Close, Sale, M33', activated: '10 Apr 2026', gens: '38', cacheHits: '24', topStyle: 'Maximalist', avgSession: '2m 58s', status: 'Active' },
  { address: '5 Ash Grove, Knutsford, WA16', activated: '6 Apr 2026', gens: '29', cacheHits: '18', topStyle: 'Scandinavian', avgSession: '3m 42s', status: 'Active' },
  { address: '17 Elm Street, Wilmslow, SK9', activated: '1 Apr 2026', gens: '12', cacheHits: '7', topStyle: 'Contemporary', avgSession: '2m 14s', status: 'Inactive' },
]

const PLANS = [
  {
    name: 'Starter',
    price: '£49',
    period: 'per month',
    features: ['5 listings per month', 'All 8 styles'],
    highlighted: false,
  },
  {
    name: 'Growth',
    price: '£149',
    period: 'per month',
    features: ['20 listings per month', 'Custom branding', 'Lead capture'],
    highlighted: true,
  },
  {
    name: 'Agency',
    price: '£399',
    period: 'per month',
    features: ['Unlimited listings', 'White-label', 'Webhooks'],
    highlighted: false,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    features: ['Unlimited everything', 'Custom AI tuning', 'SLA guarantee'],
    highlighted: false,
  },
]
