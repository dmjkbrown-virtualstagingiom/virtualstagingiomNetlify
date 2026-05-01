import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useSignIn, useUser } from '@clerk/clerk-react'

export const Route = createFileRoute('/sign-in')({
  component: SignInPage,
})

const S = {
  ink: '#1a1612', cream: '#f5f0e8', warm: '#e8dcc8',
  gold: '#b8965a', muted: '#8a7f72', surface: '#faf7f2', white: '#ffffff',
} as const

function SignInPage() {
  const { signIn, setActive } = useSignIn()
  const { user } = useUser()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!signIn || !setActive) return
    setLoading(true)
    setError('')

    try {
      const result = await signIn.create({ identifier: email, password })
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId })
        // Redirect based on user type
        const userType = result.userData?.publicMetadata?.userType as string | undefined
        navigate({ to: userType === 'agent' ? '/agent-dashboard' : '/buyer-dashboard' })
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 72px)', background: S.surface, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '36px', fontWeight: 300, color: S.ink, marginBottom: '8px' }}>Welcome back</h1>
        <p style={{ fontSize: '14px', color: S.muted, marginBottom: '40px' }}>Sign in to your Virtual Staging IOM account</p>

        <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Email address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} placeholder="jane@example.com" />
          </div>
          <div>
            <label style={labelStyle}>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={inputStyle} placeholder="Your password" />
          </div>
          {error && <p style={{ fontSize: '13px', color: '#c0392b', padding: '10px 14px', background: '#fef0ef', borderRadius: '2px' }}>{error}</p>}
          <button type="submit" disabled={loading} style={{ background: S.gold, color: S.white, padding: '14px', borderRadius: '2px', border: 'none', fontSize: '13px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: loading ? 'wait' : 'pointer', fontFamily: "'DM Sans', sans-serif", marginTop: '8px' }}>
            {loading ? 'Signing in...' : 'Sign in →'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '13px', color: S.muted, marginTop: '24px' }}>
          Don't have an account?{' '}
          <a href="/sign-up" style={{ color: S.gold, textDecoration: 'none' }}>Create one</a>
        </p>
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = { display: 'block', fontSize: '11px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8a7f72', marginBottom: '6px' }
const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 14px', border: '1px solid #e8dcc8', borderRadius: '2px', fontSize: '14px', fontFamily: "'DM Sans', sans-serif", outline: 'none', boxSizing: 'border-box', background: '#ffffff' }
