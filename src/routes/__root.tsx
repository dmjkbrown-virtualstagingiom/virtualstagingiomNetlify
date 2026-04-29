import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import { Link } from '@tanstack/react-router'
import '../styles.css'

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
        <SiteNav />
        {children}
        <Scripts />
      </body>
    </html>
  )
}

function SiteNav() {
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
          { to: '/dashboard' as const, label: 'Dashboard' },
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
        <Link
          to="/dashboard"
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
            transition: 'all 0.2s',
          }}
        >
          Agent Login
        </Link>
      </nav>
    </header>
  )
}
