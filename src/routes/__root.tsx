import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import { Link, useNavigate } from '@tanstack/react-router'
import { ClerkProvider, SignedIn, SignedOut, useUser, useClerk } from '@clerk/clerk-react'
import React from 'react'
import '../styles.css'

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Virtual Staging IOM -- AI Interior Redesign for Property Listings' },
    ],
    links: [
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' as const },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300&family=DM+Sans:wght@300;400;500&display=swap',
      },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
          <SiteNav />
          {children}
          <Scripts />
        </ClerkProvider>
      </body>
    </html>
  )
}

function SiteNav() {
  const { user, isLoaded } = useUser()
  const { signOut } = useClerk()
  const navigate = useNavigate()

  const userType = user?.unsafeMetadata?.userType as string | undefined
  const isAgent = userType === 'agent'
  const isHomeOwner = userType === 'buyer' || (!isAgent && !!user)
  const dashboardPath = isAgent ? '/agent-dashboard' : '/buyer-dashboard'

  const handleSignOut = async () => {
    await signOut()
    navigate({ to: '/' })
  }

  return (
    <header style={{
      background: '#1a1612',
      padding: '0 48px',
      height: '72px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <Link to="/" style={{ textDecoration: 'none' }}>
        <span style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: '26px',
          fontWeight: 300,
          color: '#f5f0e8',
          letterSpacing: '0.04em',
        }}>
          Virtual Staging<span style={{ color: '#b8965a', fontStyle: 'italic' }}> IOM</span>
        </span>
      </Link>

      <nav style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>

        {/* Nav links for signed-out users */}
        <SignedOut>
          {[
            { to: '/tool' as const, label: 'Home Owner Tool' },
            { to: '/embed-demo' as const, label: 'Embed Demo' },
            { to: '/faq' as const, label: 'FAQ' },
          ].map(({ to, label }) => (
            <Link key={to} to={to} style={navLinkStyle} activeProps={{ style: { color: '#b8965a' } }}>
              {label}
            </Link>
          ))}
        </SignedOut>

        {/* Nav links for signed-in users — filtered by user type */}
        {isLoaded && user && (
          <>
            {/* Home Owner sees: Home Owner Tool, My Designs, FAQ */}
            {isHomeOwner && (
              <>
                <Link to="/tool" style={navLinkStyle} activeProps={{ style: { color: '#b8965a' } }}>
                  Home Owner Tool
                </Link>
                <Link to="/my-designs" style={navLinkStyle} activeProps={{ style: { color: '#b8965a' } }}>
                  My Designs
                </Link>
                <Link to="/faq" style={navLinkStyle} activeProps={{ style: { color: '#b8965a' } }}>
                  FAQ
                </Link>
              </>
            )}

            {/* Estate Agent sees: Embed Demo, FAQ */}
            {isAgent && (
              <>
                <Link to="/embed-demo" style={navLinkStyle} activeProps={{ style: { color: '#b8965a' } }}>
                  Embed Demo
                </Link>
                <Link to="/faq" style={navLinkStyle} activeProps={{ style: { color: '#b8965a' } }}>
                  FAQ
                </Link>
              </>
            )}

            {/* Shared signed-in links */}
            <Link to={dashboardPath as any} style={navLinkStyle} activeProps={{ style: { color: '#b8965a' } }}>
              Dashboard
            </Link>
            <Link to="/my-account" style={navLinkStyle} activeProps={{ style: { color: '#b8965a' } }}>
              My Account
            </Link>
            <button onClick={handleSignOut} style={signOutStyle}>
              Sign Out
            </button>
          </>
        )}

        {/* Sign in / Get Started for signed-out users */}
        {isLoaded && !user && (
          <>
            <Link to="/sign-in" style={navLinkStyle}>Sign In</Link>
            <Link to="/sign-up" style={getStartedStyle}>Get Started</Link>
          </>
        )}
      </nav>
    </header>
  )
}

const navLinkStyle: React.CSSProperties = {
  color: 'rgba(245,240,232,0.55)',
  textDecoration: 'none',
  fontSize: '13px',
  fontWeight: 400,
  letterSpacing: '0.04em',
  transition: 'color 0.2s',
}

const getStartedStyle: React.CSSProperties = {
  fontSize: '12px',
  fontWeight: 500,
  color: '#b8965a',
  border: '1px solid rgba(184,150,90,0.5)',
  padding: '6px 16px',
  borderRadius: '20px',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  textDecoration: 'none',
}

const signOutStyle: React.CSSProperties = {
  fontSize: '12px',
  fontWeight: 500,
  color: '#b8965a',
  border: '1px solid rgba(184,150,90,0.5)',
  padding: '6px 16px',
  borderRadius: '20px',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  background: 'transparent',
  cursor: 'pointer',
  fontFamily: "'DM Sans', sans-serif",
}
