import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import React from 'react'
import { useUser, useClerk, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react'

export const Route = createFileRoute('/my-account')({
  component: MyAccount,
})

const S = {
  ink: '#1a1612', cream: '#f5f0e8', warm: '#e8dcc8',
  gold: '#b8965a', goldLight: '#d4b07a', muted: '#8a7f72',
  surface: '#faf7f2', white: '#ffffff',
} as const

function MyAccount() {
  return (
    <>
      <SignedOut><RedirectToSignIn /></SignedOut>
      <SignedIn><MyAccountContent /></SignedIn>
    </>
  )
}

function MyAccountContent() {
  const { user } = useUser()
  const { signOut } = useClerk()
  const navigate = useNavigate()
  const [cancelling, setCancelling] = useState(false)
  const [cancelConfirm, setCancelConfirm] = useState(false)

  const userType = user?.unsafeMetadata?.userType as string | undefined
  const isAgent = userType === 'agent'
  const plan = (user?.publicMetadata?.plan as string) || (user?.unsafeMetadata?.plan as string) || 'free'
  const planLabel = (user?.publicMetadata?.planLabel as string) || (user?.unsafeMetadata?.planLabel as string) || 'Free Trial'
  const generationsRemaining = (user?.publicMetadata?.generationsRemaining as number) ?? (user?.unsafeMetadata?.generationsRemaining as number) ?? 0
  const generationsAllowance = (user?.publicMetadata?.generationsAllowance as number) ?? (user?.unsafeMetadata?.generationsAllowance as number) ?? 0
  const generationsUsed = generationsAllowance - generationsRemaining
  const planActivatedAt = (user?.publicMetadata?.planActivatedAt as string) || null

  const isPaid = plan === 'monthly' || plan === 'payg'

  const handleCancelMembership = async () => {
    if (!cancelConfirm) {
      setCancelConfirm(true)
      return
    }
    setCancelling(true)
    // For now, direct to Stripe billing portal or contact support
    // In a full implementation this would call Stripe's customer portal
    alert('To cancel your subscription, please contact support@virtualstagingiom.com or manage your subscription via the Stripe billing portal.')
    setCancelling(false)
    setCancelConfirm(false)
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 72px)', background: S.surface }}>
      <div style={{ background: S.ink, padding: '48px', color: S.cream }}>
        <p style={{ fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: S.gold, marginBottom: '12px' }}>Account</p>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '40px', fontWeight: 300, marginBottom: '8px' }}>
          My <em style={{ color: S.goldLight }}>Account</em>
        </h1>
        <p style={{ color: S.muted, fontSize: '14px' }}>Manage your personal details, plan and usage</p>
      </div>

      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '56px 48px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* Personal details */}
        <section style={{ background: S.white, borderRadius: '4px', padding: '32px', boxShadow: '0 2px 16px rgba(26,22,18,0.06)' }}>
          <p style={sectionLabel}>Personal Details</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '16px' }}>
            <div>
              <p style={fieldLabel}>First name</p>
              <p style={fieldValue}>{user?.firstName || '—'}</p>
            </div>
            <div>
              <p style={fieldLabel}>Last name</p>
              <p style={fieldValue}>{user?.lastName || '—'}</p>
            </div>
            <div>
              <p style={fieldLabel}>Email address</p>
              <p style={fieldValue}>{user?.primaryEmailAddress?.emailAddress || '—'}</p>
            </div>
            <div>
              <p style={fieldLabel}>Account type</p>
              <p style={fieldValue}>{isAgent ? 'Estate Agent' : 'Home Owner'}</p>
            </div>
            {isAgent && user?.unsafeMetadata?.agencyName && (
              <div>
                <p style={fieldLabel}>Agency name</p>
                <p style={fieldValue}>{user.unsafeMetadata.agencyName as string}</p>
              </div>
            )}
            <div>
              <p style={fieldLabel}>Member since</p>
              <p style={fieldValue}>
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
              </p>
            </div>
          </div>
        </section>

        {/* Plan & usage — home owners only */}
        {!isAgent && (
          <section style={{ background: S.white, borderRadius: '4px', padding: '32px', boxShadow: '0 2px 16px rgba(26,22,18,0.06)' }}>
            <p style={sectionLabel}>Plan & Usage</p>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div>
                <p style={fieldLabel}>Current plan</p>
                <p style={{ fontSize: '20px', fontWeight: 500, color: S.ink, marginBottom: '4px' }}>{planLabel}</p>
                {planActivatedAt && (
                  <p style={{ fontSize: '12px', color: S.muted }}>
                    Active since {new Date(planActivatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                )}
              </div>
              {!isPaid && (
                <button
                  onClick={() => navigate({ to: '/checkout' })}
                  style={{ background: S.gold, color: S.white, padding: '10px 24px', borderRadius: '2px', border: 'none', fontSize: '12px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
                >
                  Upgrade
                </button>
              )}
              {plan === 'payg' && (
                <button
                  onClick={() => navigate({ to: '/checkout' })}
                  style={{ background: 'transparent', color: S.gold, padding: '10px 24px', borderRadius: '2px', border: `1px solid ${S.gold}`, fontSize: '12px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
                >
                  Top up / Go monthly
                </button>
              )}
            </div>

            {/* Generation usage */}
            <div style={{ padding: '20px', background: S.surface, borderRadius: '4px', border: `1px solid ${S.warm}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <p style={{ fontSize: '13px', fontWeight: 500, color: S.ink }}>AI Image Generations</p>
                <p style={{ fontSize: '13px', color: generationsRemaining === 0 ? '#c0392b' : S.muted }}>
                  {generationsRemaining === 0 ? 'None remaining' : `${generationsRemaining} remaining`}
                </p>
              </div>

              {plan === 'free' && (
                <div>
                  <div style={{ height: '8px', background: S.warm, borderRadius: '4px', overflow: 'hidden', marginBottom: '8px' }}>
                    <div style={{ height: '100%', background: generationsUsed >= 3 ? '#c0392b' : S.gold, borderRadius: '4px', width: `${Math.min(100, (generationsUsed / 3) * 100)}%`, transition: 'width 0.4s' }} />
                  </div>
                  <p style={{ fontSize: '12px', color: S.muted }}>{generationsUsed} of 3 free generations used</p>
                  {generationsRemaining === 0 && (
                    <p style={{ fontSize: '12px', color: '#c0392b', marginTop: '8px' }}>
                      Free generations used up.{' '}
                      <button onClick={() => navigate({ to: '/checkout' })} style={{ background: 'none', border: 'none', color: '#c0392b', textDecoration: 'underline', cursor: 'pointer', fontSize: '12px', padding: 0 }}>
                        Purchase a plan to continue
                      </button>
                    </p>
                  )}
                </div>
              )}

              {plan === 'payg' && (
                <div>
                  <div style={{ height: '8px', background: S.warm, borderRadius: '4px', overflow: 'hidden', marginBottom: '8px' }}>
                    <div style={{ height: '100%', background: generationsRemaining <= 2 ? '#e67e22' : S.gold, borderRadius: '4px', width: `${Math.min(100, (generationsUsed / 15) * 100)}%`, transition: 'width 0.4s' }} />
                  </div>
                  <p style={{ fontSize: '12px', color: S.muted }}>{generationsUsed} of 15 generations used — {generationsRemaining} remaining before top-up needed</p>
                </div>
              )}

              {plan === 'monthly' && (
                <div>
                  <div style={{ height: '8px', background: S.warm, borderRadius: '4px', overflow: 'hidden', marginBottom: '8px' }}>
                    <div style={{ height: '100%', background: generationsRemaining <= 10 ? '#e67e22' : S.gold, borderRadius: '4px', width: `${Math.min(100, (generationsUsed / 100) * 100)}%`, transition: 'width 0.4s' }} />
                  </div>
                  <p style={{ fontSize: '12px', color: S.muted }}>{generationsUsed} of 100 monthly generations used — {generationsRemaining} remaining this billing cycle</p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Cancel membership */}
        {isPaid && (
          <section style={{ background: S.white, borderRadius: '4px', padding: '32px', boxShadow: '0 2px 16px rgba(26,22,18,0.06)', border: '1px solid #fde8e8' }}>
            <p style={sectionLabel}>Membership</p>
            <p style={{ fontSize: '13px', color: S.muted, marginBottom: '20px', lineHeight: 1.6 }}>
              {plan === 'monthly'
                ? 'You are on a monthly subscription. Cancelling will stop your subscription at the end of the current billing period. You will retain access to your remaining generations until then.'
                : 'You are on a Pay As You Go plan. Your remaining generations do not expire.'}
            </p>
            {plan === 'monthly' && (
              <div>
                {cancelConfirm && (
                  <p style={{ fontSize: '13px', color: '#c0392b', marginBottom: '12px', padding: '10px 14px', background: '#fef0ef', borderRadius: '2px' }}>
                    Are you sure? Click cancel again to confirm.
                  </p>
                )}
                <button
                  onClick={handleCancelMembership}
                  disabled={cancelling}
                  style={{ background: 'transparent', color: '#c0392b', border: '1px solid #c0392b', padding: '10px 24px', borderRadius: '2px', fontSize: '12px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
                >
                  {cancelling ? 'Processing...' : cancelConfirm ? 'Confirm cancellation' : 'Cancel membership'}
                </button>
              </div>
            )}
          </section>
        )}

      </main>
    </div>
  )
}

const sectionLabel: React.CSSProperties = {
  fontSize: '11px', fontWeight: 500, letterSpacing: '0.16em',
  textTransform: 'uppercase', color: '#b8965a', marginBottom: '20px',
}
const fieldLabel: React.CSSProperties = {
  fontSize: '11px', fontWeight: 500, letterSpacing: '0.1em',
  textTransform: 'uppercase', color: '#8a7f72', marginBottom: '4px',
}
const fieldValue: React.CSSProperties = {
  fontSize: '15px', color: '#1a1612', fontWeight: 400,
}
