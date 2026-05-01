import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useUser, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react'

export const Route = createFileRoute('/agent-dashboard')({
  component: AgentDashboard,
})

const S = {
  ink: '#1a1612',
  cream: '#f5f0e8',
  warm: '#e8dcc8',
  gold: '#b8965a',
  goldLight: '#d4b07a',
  muted: '#8a7f72',
  surface: '#faf7f2',
  white: '#ffffff',
} as const

function AgentDashboard() {
  return (
    <>
      <SignedIn>
        <AgentDashboardContent />
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  )
}

function AgentDashboardContent() {
  const { user } = useUser()
  const navigate = useNavigate()
  const firstName = user?.firstName || 'there'
  const agencyName = user?.unsafeMetadata?.agencyName as string | undefined

  const embedCode = `<script src="https://cdn.virtualstagingIOM.com/widget.js" data-key="ag_live_your_key_here" defer></script>`

  return (
    <div style={{ minHeight: '100vh', background: S.surface, padding: '40px 24px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 36,
            fontWeight: 300,
            color: S.ink,
            margin: '0 0 8px',
          }}>
            Agent Dashboard
          </h1>
          <p style={{ color: S.muted, fontSize: 15, margin: 0 }}>
            Welcome, {agencyName || firstName} -- Manage your AI staging across all property listings
          </p>
        </div>

        {/* Stats row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 16,
          marginBottom: 40,
        }}>
          {[
            { label: 'Active Listings', value: '0' },
            { label: 'Total Redesigns', value: '0' },
            { label: 'Buyer Engagements', value: '0' },
            { label: 'Plan', value: 'Trial' },
          ].map(({ label, value }) => (
            <div key={label} style={{
              background: S.white,
              border: `1px solid ${S.warm}`,
              borderRadius: 2,
              padding: '24px 20px',
            }}>
              <p style={{ color: S.muted, fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 8px' }}>{label}</p>
              <p style={{ color: S.ink, fontSize: 28, fontWeight: 500, margin: 0 }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Embed code */}
        <div style={{
          background: S.white,
          border: `1px solid ${S.warm}`,
          borderRadius: 2,
          padding: 32,
          marginBottom: 32,
        }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 400, color: S.ink, margin: '0 0 8px' }}>
            Your Embed Code
          </h2>
          <p style={{ color: S.muted, fontSize: 14, margin: '0 0 16px' }}>
            Add this snippet to any property listing page to embed the AI staging tool for buyers.
          </p>
          <div style={{
            background: S.ink,
            color: S.cream,
            padding: '16px 20px',
            borderRadius: 2,
            fontFamily: 'monospace',
            fontSize: 13,
            marginBottom: 12,
            overflowX: 'auto',
          }}>
            {embedCode}
          </div>
          <button
            onClick={() => navigator.clipboard?.writeText(embedCode)}
            style={{
              background: 'transparent',
              color: S.gold,
              border: `1px solid ${S.gold}`,
              padding: '8px 16px',
              borderRadius: 2,
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Copy code
          </button>
        </div>

        {/* Quick actions */}
        <div style={{ marginBottom: 40 }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 400, color: S.ink, margin: '0 0 16px' }}>
            Quick Actions
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {[
              {
                title: 'Test the Buyer Tool',
                desc: 'Preview how buyers will experience your listings',
                cta: 'Open tool',
                onClick: () => navigate({ to: '/tool' }),
              },
              {
                title: 'View Embed Demo',
                desc: 'See how the tool looks embedded in a property listing',
                cta: 'View demo',
                onClick: () => navigate({ to: '/embed-demo' }),
              },
              {
                title: 'Manage Subscription',
                desc: 'Upgrade your plan to add more listings',
                cta: 'View plans',
                onClick: () => {},
              },
            ].map((item) => (
              <div key={item.title} style={{
                background: S.white,
                border: `1px solid ${S.warm}`,
                borderRadius: 2,
                padding: 24,
              }}>
                <h3 style={{ color: S.ink, fontSize: 15, fontWeight: 500, margin: '0 0 8px' }}>{item.title}</h3>
                <p style={{ color: S.muted, fontSize: 13, margin: '0 0 16px' }}>{item.desc}</p>
                <button
                  onClick={item.onClick}
                  style={{
                    background: S.ink,
                    color: S.cream,
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: 2,
                    fontSize: 12,
                    fontWeight: 500,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {item.cta}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing plans */}
        <div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 400, color: S.ink, margin: '0 0 16px' }}>
            Agent Plans
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {[
              {
                name: 'Starter',
                price: '£49',
                unit: '/month',
                listings: '1 active listing',
                redesigns: '50 redesigns/month',
                support: 'Email support',
                highlight: false,
              },
              {
                name: 'Professional',
                price: '£149',
                unit: '/month',
                listings: '10 active listings',
                redesigns: 'Unlimited redesigns',
                support: 'Priority support',
                highlight: true,
              },
              {
                name: 'Enterprise',
                price: 'Custom',
                unit: '',
                listings: 'Unlimited listings',
                redesigns: 'Unlimited redesigns',
                support: 'Dedicated account manager',
                highlight: false,
              },
            ].map((plan) => (
              <div key={plan.name} style={{
                background: plan.highlight ? S.ink : S.white,
                border: `1px solid ${plan.highlight ? S.gold : S.warm}`,
                borderRadius: 2,
                padding: 28,
              }}>
                <p style={{ color: plan.highlight ? S.gold : S.muted, fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 8px' }}>
                  {plan.name}
                </p>
                <p style={{ color: plan.highlight ? S.cream : S.ink, fontSize: 32, fontWeight: 300, margin: '0 0 4px' }}>
                  {plan.price}<span style={{ fontSize: 14, color: S.muted }}>{plan.unit}</span>
                </p>
                <div style={{ margin: '16px 0 24px' }}>
                  {[plan.listings, plan.redesigns, plan.support].map((feature) => (
                    <p key={feature} style={{ color: plan.highlight ? S.warm : S.muted, fontSize: 13, margin: '0 0 6px' }}>
                      v {feature}
                    </p>
                  ))}
                </div>
                <button style={{
                  background: plan.highlight ? S.gold : 'transparent',
                  color: plan.highlight ? S.white : S.ink,
                  border: `1px solid ${plan.highlight ? S.gold : S.ink}`,
                  padding: '10px 20px',
                  borderRadius: 2,
                  fontSize: 12,
                  fontWeight: 500,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  fontFamily: "'DM Sans', sans-serif",
                  width: '100%',
                }}>
                  {plan.name === 'Enterprise' ? 'Contact us' : 'Choose plan'}
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
