import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import { Link, useNavigate } from '@tanstack/react-router'
import { ClerkProvider, SignedIn, SignedOut, useUser, useClerk } from '@clerk/clerk-react'
import React, { useState, useEffect } from 'react'
import '../styles.css'

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

// Responsive hook
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  return isMobile
}

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
        {/* Hidden form for Netlify form detection */}
        <form name="estate-agent-enquiry" data-netlify="true" hidden>
          <input type="text" name="name" />
          <input type="text" name="agency" />
          <input type="email" name="email" />
          <input type="tel" name="phone" />
          <input type="text" name="website" />
          <input type="text" name="listings-count" />
          <textarea name="message" />
        </form>
      </body>
    </html>
  )
}

function SiteNav() {
  const { user, isLoaded } = useUser()
  const { signOut } = useClerk()
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const [menuOpen, setMenuOpen] = useState(false)

  const userType = user?.unsafeMetadata?.userType as string | undefined
  const isAgent = userType === 'agent'
  const isHomeOwner = userType === 'buyer' || (!isAgent && !!user)
  const dashboardPath = isAgent ? '/agent-dashboard' : '/buyer-dashboard'

  const handleSignOut = async () => {
    await signOut()
    setMenuOpen(false)
    navigate({ to: '/sign-up' })
  }

  const closeMenu = () => setMenuOpen(false)

  // Nav links based on user type
  const navLinks = isLoaded && user ? [
    ...(isHomeOwner ? [
      { to: '/tool', label: 'Home Owner Tool' },
      { to: '/my-designs', label: 'My Designs' },
    ] : []),
    ...(isAgent ? [
      { to: '/estate-agent-tool', label: 'Estate Agent Tool' },
    ] : []),
    { to: '/faq', label: 'FAQ' },
    { to: dashboardPath, label: 'Dashboard' },
    { to: '/my-account', label: 'My Account' },
  ] : [
    { to: '/tool', label: 'Home Owner Tool' },
    { to: '/estate-agent-tool', label: 'Estate Agent Tool' },
    { to: '/faq', label: 'FAQ' },
  ]

  return (
    <>
      <header style={{
        background: '#1a1612',
        padding: isMobile ? '0 20px' : '0 48px',
        height: '72px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 200,
      }}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none' }} onClick={closeMenu}>
          <span style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: isMobile ? '20px' : '26px',
            fontWeight: 300,
            color: '#f5f0e8',
            letterSpacing: '0.04em',
          }}>
            Virtual Staging<span style={{ color: '#b8965a', fontStyle: 'italic' }}> IOM</span>
          </span>
        </Link>

        {/* Desktop nav */}
        {!isMobile && (
          <nav style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
            {navLinks.map(({ to, label }) => (
              <Link key={to} to={to as any} style={navLinkStyle} activeProps={{ style: { color: '#b8965a' } }}>
                {label}
              </Link>
            ))}
            {isLoaded && user ? (
              <button onClick={handleSignOut} style={signOutStyle}>Sign Out</button>
            ) : isLoaded ? (
              <>
                <Link to="/sign-in" style={navLinkStyle}>Sign In</Link>
                <Link to="/sign-up" style={getStartedStyle}>Get Started</Link>
              </>
            ) : null}
          </nav>
        )}

        {/* Mobile hamburger */}
        {isMobile && (
          <button
            onClick={() => setMenuOpen(o => !o)}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '8px', display: 'flex', flexDirection: 'column', gap: '5px' }}
            aria-label="Toggle menu"
          >
            <span style={{ display: 'block', width: '24px', height: '2px', background: menuOpen ? '#b8965a' : '#f5f0e8', transition: 'all 0.2s', transform: menuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none' }} />
            <span style={{ display: 'block', width: '24px', height: '2px', background: '#f5f0e8', transition: 'all 0.2s', opacity: menuOpen ? 0 : 1 }} />
            <span style={{ display: 'block', width: '24px', height: '2px', background: menuOpen ? '#b8965a' : '#f5f0e8', transition: 'all 0.2s', transform: menuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none' }} />
          </button>
        )}
      </header>

      {/* Mobile drawer */}
      {isMobile && menuOpen && (
        <div style={{
          position: 'fixed', top: '72px', left: 0, right: 0, bottom: 0,
          background: '#1a1612', zIndex: 199, overflowY: 'auto',
          display: 'flex', flexDirection: 'column', padding: '24px 24px 48px',
        }}>
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to as any}
              onClick={closeMenu}
              style={{
                color: 'rgba(245,240,232,0.8)', textDecoration: 'none',
                fontSize: '18px', fontWeight: 300, letterSpacing: '0.04em',
                padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.08)',
                fontFamily: "'Cormorant Garamond', serif",
              }}
            >
              {label}
            </Link>
          ))}

          <div style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {isLoaded && user ? (
              <button onClick={handleSignOut} style={{ ...signOutStyle, padding: '14px', fontSize: '13px', borderRadius: '2px' }}>
                Sign Out
              </button>
            ) : isLoaded ? (
              <>
                <Link to="/sign-in" onClick={closeMenu} style={{ ...getStartedStyle, textAlign: 'center', padding: '14px', borderRadius: '2px' }}>
                  Sign In
                </Link>
                <Link to="/sign-up" onClick={closeMenu} style={{ ...getStartedStyle, textAlign: 'center', padding: '14px', borderRadius: '2px', background: '#b8965a' }}>
                  Get Started
                </Link>
              </>
            ) : null}
          </div>
        </div>
      )}
    </>
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
