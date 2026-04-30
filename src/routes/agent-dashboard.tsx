import { createFileRoute, useNavigate } from '@tanstack/react-router' import { useUser, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react' export const Route = createFileRoute('/agent-dashboard')({ component: AgentDashboard, }) const S = { ink: '#1a1612', cream: '#f5f0e8', warm: '#e8dcc8', gold: '#b8965a', goldLight: '#d4b07a', muted: '#8a7f72', surface: '#faf7f2', white: '#ffffff', } as const function AgentDashboard() { return ( <> ) } function AgentDashboardContent() { const { user } = useUser() const navigate = useNavigate() const firstName = user?.firstName || 'there' const agencyName = user?.unsafeMetadata?.agencyName as string | undefined return ( 
{/* Header */} 
Agent Dashboard
Welcome, {agencyName || firstName} 
Manage your AI staging across all property listings
{/* Stats row */} 
{[ { label: 'Active Listings', value: '0' }, { label: 'Total Redesigns', value: '0' }, { label: 'Buyer Engagements', value: '0' }, { label: 'Plan', value: 'Trial' }, ].map(({ label, value }) => ( 
{label}
{value}
))} 
{/* Embed code */} 
Your Embed Code
Add this snippet to any property listing page to embed the AI staging tool for buyers.
{``} 
navigator.clipboard?.writeText(``)} style={{ background: 'transparent', color: S.gold, border: `1px solid ${S.gold}`, padding: '8px 16px', borderRadius: '2px', fontSize: '12px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }} > Copy code 
{/* Quick actions */} 
Quick Actions
{[ { title: 'Test the Buyer Tool', desc: 'Preview how buyers will experience your listings', cta: 'Open tool', onClick: () => navigate({ to: '/tool' }) }, { title: 'View Embed Demo', desc: 'See how the tool looks embedded in a property listing', cta: 'View demo', onClick: () => navigate({ to: '/embed-demo' }) }, { title: 'Manage Subscription', desc: 'Upgrade your plan to add more listings', cta: 'View plans', onClick: () => {} }, ].map((item) => ( 
{item.title}
{item.desc}
{item.cta} 
))} 
{/* Pricing plans */} 
Agent Plans
{[ { name: 'Starter', price: 'Â£49', unit: '/month', listings: '1 active listing', redesigns: '50 redesigns/month', support: 'Email support', highlight: false }, { name: 'Professional', price: 'Â£149', unit: '/month', listings: '10 active listings', redesigns: 'Unlimited redesigns', support: 'Priority support', highlight: true }, { name: 'Enterprise', price: 'Custom', unit: '', listings: 'Unlimited listings', redesigns: 'Unlimited redesigns', support: 'Dedicated account manager', highlight: false }, ].map((plan) => ( 
{plan.name}
{plan.price}{plan.unit}
{[plan.listings, plan.redesigns, plan.support].map((feature) => ( 
âœ“ {feature} 
))} 
{plan.name === 'Enterprise' ? 'Contact us' : 'Choose plan'} 
))} 
) } 
