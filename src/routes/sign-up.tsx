import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import React from 'react'
import { useSignUp } from '@clerk/clerk-react'

export const Route = createFileRoute('/sign-up')({
  component: SignUpPage,
  validateSearch: (search: Record<string, unknown>) => ({
    homeOwnerOnly: search.homeOwnerOnly === 'true',
  }),
})

const S = {
  ink: '#1a1612', cream: '#f5f0e8', warm: '#e8dcc8',
  gold: '#b8965a', goldLight: '#d4b07a', muted: '#8a7f72',
  surface: '#faf7f2', white: '#ffffff',
} as const

function SignUpPage() {
  const { signUp, setActive } = useSignUp()
  const navigate = useNavigate()
  const { homeOwnerOnly } = Route.useSearch()
  // If homeOwnerOnly, pre-select buyer and skip type selection
  const [userType, setUserType] = useState<'buyer' | 'agent' | null>(homeOwnerOnly ? 'buyer' : null)
  const [step, setStepRaw] = useState<'type' | 'details' | 'verify'>(homeOwnerOnly ? 'details' : 'type')
  const setStep = setStepRaw

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [agencyName, setAgencyName] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!signUp || !userType) return
    setLoading(true)
    setError('')

    try {
      await signUp.create({
        emailAddress: email,
        password,
        firstName,
        lastName,
        unsafeMetadata: {
          userType,
          agencyName: userType === 'agent' ? agencyName : undefined,
          // Give home owners 3 free generations on sign-up
          generationsRemaining: userType === 'buyer' ? 3 : 0,
          generationsAllowance: userType === 'buyer' ? 3 : 0,
          plan: 'free',
          planLabel: 'Free Trial',
        },
      })
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
      setStep('verify')
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!signUp || !setActive) return
    setLoading(true)
    setError('')

    try {
      const result = await signUp.attemptEmailAddressVerification({ code })
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId })
        const resolvedUserType = userType ?? (result as any).unsafeMetadata?.userType ?? 'buyer'
        navigate({ to: resolvedUserType === 'agent' ? '/agent-dashboard' : '/buyer-dashboard' })
      } else {
        setError('Verification incomplete — please try again.')
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Invalid code')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 72px)', background: S.surface, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px' }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>

        {/* Step 1: Choose user type */}
        {step === 'type' && (
          <>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '36px', fontWeight: 300, color: S.ink, marginBottom: '8px' }}>Create your account</h1>
            <p style={{ fontSize: '14px', color: S.muted, marginBottom: '40px' }}>Choose how you'll be using Virtual Staging IOM</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
              {[
                { type: 'buyer' as const, title: 'Home Owner', desc: 'Visualise rooms in your style before you buy or redecorate', price: '3 free generations included' },
                { type: 'agent' as const, title: 'Estate Agent', desc: 'Embed AI staging on your property listings', price: 'From \u00a33.99 per session' },
              ].map(({ type, title, desc, price }) => (
                <div
                  key={type}
                  onClick={() => setUserType(type)}
                  style={{ padding: '24px', background: S.white, border: `2px solid ${userType === type ? S.gold : S.warm}`, borderRadius: '4px', cursor: 'pointer', transition: 'all 0.2s', transform: userType === type ? 'translateY(-2px)' : 'none', boxShadow: userType === type ? '0 8px 32px rgba(184,150,90,0.15)' : '0 2px 12px rgba(26,22,18,0.06)' }}
                >
                  <div style={{ fontSize: '15px', fontWeight: 500, color: userType === type ? S.gold : S.ink, marginBottom: '8px' }}>{title}</div>
                  <div style={{ fontSize: '12px', color: S.muted, lineHeight: 1.5, marginBottom: '12px' }}>{desc}</div>
                  <div style={{ fontSize: '11px', color: S.gold, fontWeight: 500 }}>{price}</div>
                </div>
              ))}
            </div>

            <button
              onClick={() => userType && setStep('details')}
              disabled={!userType}
              style={{ width: '100%', background: userType ? S.gold : S.warm, color: S.white, padding: '14px', borderRadius: '2px', border: 'none', fontSize: '13px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: userType ? 'pointer' : 'not-allowed', fontFamily: "'DM Sans', sans-serif" }}
            >
              Continue
            </button>

            <p style={{ textAlign: 'center', fontSize: '13px', color: S.muted, marginTop: '24px' }}>
              Already have an account?{' '}
              <a href="/sign-in" style={{ color: S.gold, textDecoration: 'none' }}>Sign in</a>
            </p>
          </>
        )}

        {/* Step 2: Account details */}
        {step === 'details' && (
          <>
            <button onClick={() => setStep('type')} style={{ background: 'transparent', border: 'none', color: S.muted, cursor: 'pointer', fontSize: '13px', marginBottom: '24px', padding: 0, fontFamily: "'DM Sans', sans-serif" }}>Back</button>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '36px', fontWeight: 300, color: S.ink, marginBottom: '8px' }}>
              {userType === 'agent' ? 'Agent account' : 'Home Owner account'}
            </h1>
            <p style={{ fontSize: '14px', color: S.muted, marginBottom: '32px' }}>Enter your details to get started</p>

            <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>First name</label>
                  <input value={firstName} onChange={(e) => setFirstName(e.target.value)} required style={inputStyle} placeholder="Jane" />
                </div>
                <div>
                  <label style={labelStyle}>Last name</label>
                  <input value={lastName} onChange={(e) => setLastName(e.target.value)} required style={inputStyle} placeholder="Smith" />
                </div>
              </div>

              {/* Agency name only shown for estate agents */}
              {userType === 'agent' && (
                <div>
                  <label style={labelStyle}>Agency name</label>
                  <input value={agencyName} onChange={(e) => setAgencyName(e.target.value)} required style={inputStyle} placeholder="Smith & Co Estate Agents" />
                </div>
              )}

              <div>
                <label style={labelStyle}>Email address</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} placeholder="jane@example.com" />
              </div>
              <div>
                <label style={labelStyle}>Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={inputStyle} placeholder="At least 8 characters" />
              </div>

              {userType === 'buyer' && (
                <div style={{ padding: '12px 14px', background: '#f0f7f0', border: '1px solid #b8d4b8', borderRadius: '2px', fontSize: '13px', color: '#2d5a2d' }}>
                  \u2713 Includes 3 free AI image generations to get you started
                </div>
              )}

              {error && <p style={{ fontSize: '13px', color: '#c0392b', padding: '10px 14px', background: '#fef0ef', borderRadius: '2px' }}>{error}</p>}
              <div id="clerk-captcha" />
              <button type="submit" disabled={loading} style={{ background: S.gold, color: S.white, padding: '14px', borderRadius: '2px', border: 'none', fontSize: '13px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: loading ? 'wait' : 'pointer', fontFamily: "'DM Sans', sans-serif", marginTop: '8px' }}>
                {loading ? 'Creating account...' : 'Create account'}
              </button>
            </form>
          </>
        )}

        {/* Step 3: Verify email */}
        {step === 'verify' && (
          <>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '36px', fontWeight: 300, color: S.ink, marginBottom: '8px' }}>Check your email</h1>
            <p style={{ fontSize: '14px', color: S.muted, marginBottom: '32px' }}>We've sent a verification code to <strong>{email}</strong></p>

            <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Verification code</label>
                <input value={code} onChange={(e) => setCode(e.target.value)} required style={{ ...inputStyle, fontSize: '24px', letterSpacing: '0.3em', textAlign: 'center' }} placeholder="000000" maxLength={6} />
              </div>
              {error && <p style={{ fontSize: '13px', color: '#c0392b', padding: '10px 14px', background: '#fef0ef', borderRadius: '2px' }}>{error}</p>}
              <button type="submit" disabled={loading} style={{ background: S.gold, color: S.white, padding: '14px', borderRadius: '2px', border: 'none', fontSize: '13px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: loading ? 'wait' : 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                {loading ? 'Verifying...' : 'Verify and continue'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = { display: 'block', fontSize: '11px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8a7f72', marginBottom: '6px' }
const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 14px', border: '1px solid #e8dcc8', borderRadius: '2px', fontSize: '14px', fontFamily: "'DM Sans', sans-serif", outline: 'none', boxSizing: 'border-box', background: '#ffffff' }
