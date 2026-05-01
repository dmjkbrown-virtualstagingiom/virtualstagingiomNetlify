import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useUser, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react'

export const Route = createFileRoute('/buyer-dashboard')({
  component: BuyerDashboard,
})

const S = {
  ink: '#1a1612', cream: '#f5f0e8', warm: '#e8dcc8',
  gold: '#b8965a', goldLight: '#d4b07a', muted: '#8a7f72',
  surface: '#faf7f2', white: '#ffffff',
} as const

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

  const firstName = user?.firstName || 'there'

  return (
    <div style={{ minHeight: 'calc(100vh - 72px)', background: S.surface }}>
      {/* Header */}
      <div style={{ background: S.ink, padding: '48px', color: S.cream }}>
        <p style={{ fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: S.gold, marginBottom: '12px' }}>My Account</p>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '40px', fontWeight: 300, marginBottom: '8px' }}>
          Welcome back, <em style={{ color: S.goldLight }}>{firstName}</em>
        </h1>
        <p style={{ color: S.muted, fontSize: '14px' }}>Visualise your dream home before you buy</p>
      </div>

      <main style={{ maxWidth: '960px', margin: '0 auto', padding: '56px 48px' }}>

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
            desc="View and download your previously generated room designs"
            cta="Coming soon"
            onClick={() => {}}
            disabled
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
              <p style={{ fontSize: '12px', color: plan.highlight ? S.muted : S.muted, marginBottom: '16px' }}>{plan.unit}</p>
              <p style={{ fontSize: '13px', color: plan.highlight ? 'rgba(245,240,232,0.6)' : S.muted, marginBottom: '24px', lineHeight: 1.5 }}>{plan.desc}</p>
              <button style={{ width: '100%', background: plan.highlight ? S.gold : 'transparent', color: plan.highlight ? S.white : S.gold, padding: '10px', borderRadius: '2px', border: `1px solid ${S.gold}`, fontSize: '12px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                Choose plan
              </button>
            </div>
          ))}
        </div>
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



