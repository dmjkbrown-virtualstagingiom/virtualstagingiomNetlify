import React from 'react'
import { HeadContent, Scripts, createRootRoute, Outlet } from '@tanstack/react-router'
import { Link, useNavigate } from '@tanstack/react-router'
import { ClerkProvider, SignedIn, SignedOut, useUser, useClerk } from '@clerk/clerk-react'
import '../styles.css'
 
const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
 
export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'HomeVision — AI Interior Redesign for Property Listings' },
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
        </ClerkProvider>
        <Scripts />
      </body>
    </html>
  )
}
 
function SiteNav() {
  const { user, isLoaded } = useUser()
  const { signOut } = useClerk()
  const navigate = useNavigate()
 
  const userType = user?.unsafeMetadata?.userType as string | undefined
  const dashboardPath = userType === 'agent' ? '/agent-dashboard' : '/buyer-dashboard'
 
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
          Home<span style={{ color: '#b8965a', fontStyle: 'italic' }}>Vision</span>
        </span>
      </Link>
 
      <nav style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
        {[
          { to: '/tool' as const, label: 'Buyer Tool' },
          { to: '/embed-demo' as const, label: 'Embed Demo' },
          { to: '/faq' as const, label: 'FAQ' },
        ].map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            style={{
              color: 'rgba(245,240,232,0.55)',
              textDecoration: 'none',
              fontSize: '13px',
              fontWeight: 400,
              letterSpacing: '0.04em',
              transition: 'color 0.2s',
            }}
            activeProps={{ style: { color: '#b8965a' } }}
          >
            {label}
          </Link>
        ))}
 
        {isLoaded && (
          <>
            <SignedOut>
              <Link
                to="/sign-in"
                style={{
                  color: 'rgba(245,240,232,0.55)',
                  textDecoration: 'none',
                  fontSize: '13px',
                  fontWeight: 400,
                  letterSpacing: '0.04em',
                }}
              >
                Sign In
              </Link>
              <Link
                to="/sign-up"
                style={{
                  fontSize: '12px',
                  fontWeight: 500,
                  color: '#b8965a',
                  border: '1px solid rgba(184,150,90,0.5)',
                  padding: '6px 16px',
                  borderRadius: '20px',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  textDecoration: 'none',
                }}
              >
                Get Started
              </Link>
            </SignedOut>
 
            <SignedIn>
              <Link
                to={dashboardPath as any}
                style={{
                  color: 'rgba(245,240,232,0.55)',
                  textDecoration: 'none',
                  fontSize: '13px',
                  fontWeight: 400,
                  letterSpacing: '0.04em',
                }}
                activeProps={{ style: { color: '#b8965a' } }}
              >
                Dashboard
              </Link>
              <button
                onClick={handleSignOut}
                style={{
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
                }}
              >
                Sign Out
              </button>
            </SignedIn>
          </>
        )}
      </nav>
    </header>
  )
}
