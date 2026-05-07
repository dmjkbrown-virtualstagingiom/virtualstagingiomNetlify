import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import React from 'react'
import { useSignIn, useUser } from '@clerk/clerk-react'

export const Route = createFileRoute('/sign-in')({
  component: SignInPage,
})

const S = {
  ink: '#1a1612', cream: '#f5f0e8', warm: '#e8dcc8',
  gold: '#b8965a', muted: '#8a7f72', surface: '#faf7f2', white: '#ffffff',
} as const

type View = 'signin' | 'forgot' | 'reset'

function SignInPage() {
  const { signIn, setActive } = useSignIn()
  const { user } = useUser()
  const navigate = useNavigate()

  const [view, setView] = useState<View>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [resetCode, setResetCode] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  // Redirect if already signed in
  useEffect(() => {
    if (user) {
      const userType = user.unsafeMetadata?.userType as string | undefined
      navigate({ to: userType === 'agent' ? '/agent-dashboard' : '/buyer-dashboard' })
    }
  }, [user])

  // Step 1: Sign in
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!signIn || !setActive) return
    setLoading(true)
    setError('')
    try {
      const result = await signIn.create({ identifier: email, password })
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId })
        // Navigate to dashboard — user type checked after session is active
        // Default to buyer-dashboard; __root.tsx will handle agent redirect if needed
        navigate({ to: '/buyer-dashboard' })
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Request password reset code
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!signIn) return
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      await signIn.create({
        strategy: 'reset_password_email_code',
        identifier: email,
      })
      setSuccess('Check your email for a reset code.')
      setView('reset')
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Could not send reset email. Check the address and try again.')
    } finally {
      setLoading(false)
    }
  }

  // Step 3: Verify code and set new password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!signIn || !setActive) return
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const result = await signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code: resetCode,
        password: newPassword,
      })
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId })
        navigate({ to: '/buyer-dashboard' })
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Invalid or expired code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 72px)', background: S.surface, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>

        {/* Sign in view */}
        {view === 'signin' && (
          <>
            <h1 style={headingStyle}>Welcome back</h1>
            <p style={subheadStyle}>Sign in to your Virtual Staging IOM account</p>

            <form onSubmit={handleSignIn} style={formStyle}>
              <div>
                <label style={labelStyle}>Email address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={inputStyle} placeholder="jane@example.com" />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ ...labelStyle, marginBottom: 0 }}>Password</label>
                  <button
                    type="button"
                    onClick={() => { setView('forgot'); setError(''); setSuccess('') }}
                    style={{ background: 'none', border: 'none', color: S.gold, fontSize: '12px', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", padding: 0 }}
                  >
                    Forgot password?
                  </button>
                </div>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={inputStyle} placeholder="Your password" />
              </div>
              {error && <ErrorBox>{error}</ErrorBox>}
              <button type="submit" disabled={loading} style={submitStyle(loading)}>
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            <p style={footerStyle}>
              Don't have an account?{' '}
              <a href="/sign-up" style={{ color: S.gold, textDecoration: 'none' }}>Create one</a>
            </p>
          </>
        )}

        {/* Forgot password view */}
        {view === 'forgot' && (
          <>
            <button onClick={() => { setView('signin'); setError(''); setSuccess('') }} style={backButtonStyle}>← Back to sign in</button>
            <h1 style={headingStyle}>Reset your password</h1>
            <p style={subheadStyle}>Enter your email address and we'll send you a reset code.</p>

            <form onSubmit={handleForgotPassword} style={formStyle}>
              <div>
                <label style={labelStyle}>Email address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={inputStyle} placeholder="jane@example.com" />
              </div>
              {error && <ErrorBox>{error}</ErrorBox>}
              {success && <SuccessBox>{success}</SuccessBox>}
              <button type="submit" disabled={loading} style={submitStyle(loading)}>
                {loading ? 'Sending...' : 'Send reset code'}
              </button>
            </form>

            <p style={{ ...footerStyle, marginTop: '16px' }}>
              Remembered it?{' '}
              <button onClick={() => { setView('signin'); setError('') }} style={{ background: 'none', border: 'none', color: S.gold, fontSize: '13px', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", padding: 0 }}>
                Sign in
              </button>
            </p>
          </>
        )}

        {/* Reset password view */}
        {view === 'reset' && (
          <>
            <h1 style={headingStyle}>Set new password</h1>
            <p style={subheadStyle}>Enter the code we sent to <strong>{email}</strong> and choose a new password.</p>

            <form onSubmit={handleResetPassword} style={formStyle}>
              <div>
                <label style={labelStyle}>Reset code</label>
                <input
                  value={resetCode}
                  onChange={e => setResetCode(e.target.value)}
                  required
                  style={{ ...inputStyle, fontSize: '22px', letterSpacing: '0.25em', textAlign: 'center' }}
                  placeholder="000000"
                  maxLength={6}
                />
              </div>
              <div>
                <label style={labelStyle}>New password</label>
                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required style={inputStyle} placeholder="At least 8 characters" />
              </div>
              <div>
                <label style={labelStyle}>Confirm new password</label>
                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required style={inputStyle} placeholder="Repeat your new password" />
              </div>
              {error && <ErrorBox>{error}</ErrorBox>}
              <button type="submit" disabled={loading} style={submitStyle(loading)}>
                {loading ? 'Resetting...' : 'Reset password'}
              </button>
            </form>

            <p style={footerStyle}>
              Didn't receive a code?{' '}
              <button onClick={() => { setView('forgot'); setError(''); setSuccess(''); setResetCode('') }} style={{ background: 'none', border: 'none', color: S.gold, fontSize: '13px', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", padding: 0 }}>
                Try again
              </button>
            </p>
          </>
        )}

      </div>
    </div>
  )
}

function ErrorBox({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: '13px', color: '#c0392b', padding: '10px 14px', background: '#fef0ef', borderRadius: '2px', margin: 0 }}>{children}</p>
}

function SuccessBox({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: '13px', color: '#2d6a2d', padding: '10px 14px', background: '#f0f7f0', borderRadius: '2px', border: '1px solid #b8d4b8', margin: 0 }}>{children}</p>
}

const headingStyle: React.CSSProperties = { fontFamily: "'Cormorant Garamond', serif", fontSize: '36px', fontWeight: 300, color: '#1a1612', marginBottom: '8px' }
const subheadStyle: React.CSSProperties = { fontSize: '14px', color: '#8a7f72', marginBottom: '32px', lineHeight: 1.6 }
const formStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '16px' }
const footerStyle: React.CSSProperties = { textAlign: 'center', fontSize: '13px', color: '#8a7f72', marginTop: '24px' }
const backButtonStyle: React.CSSProperties = { background: 'none', border: 'none', color: '#8a7f72', fontSize: '13px', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", padding: '0 0 20px', display: 'block' }
const labelStyle: React.CSSProperties = { display: 'block', fontSize: '11px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8a7f72', marginBottom: '6px' }
const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 14px', border: '1px solid #e8dcc8', borderRadius: '2px', fontSize: '14px', fontFamily: "'DM Sans', sans-serif", outline: 'none', boxSizing: 'border-box', background: '#ffffff' }
const submitStyle = (loading: boolean): React.CSSProperties => ({ background: '#b8965a', color: '#ffffff', padding: '14px', borderRadius: '2px', border: 'none', fontSize: '13px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: loading ? 'wait' : 'pointer', fontFamily: "'DM Sans', sans-serif", marginTop: '8px', opacity: loading ? 0.7 : 1 })
