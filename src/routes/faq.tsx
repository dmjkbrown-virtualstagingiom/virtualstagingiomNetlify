import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

export const Route = createFileRoute('/faq')({
  component: FAQ,
})

const S = {
  ink: '#1a1612',
  cream: '#f5f0e8',
  warm: '#e8dcc8',
  gold: '#b8965a',
  goldLight: '#d4b07a',
  muted: '#8a7f72',
  surface: '#faf7f2',
  white: '#ffffff',
} as const

const faqs = [
  {
    category: 'Product',
    items: [
      {
        question: 'What is Virtual Staging IOM?',
        answer:
          'Virtual Staging IOM is an AI-powered interior redesign widget for estate agent websites. Buyers click a button on a listing page, choose an interior style, and the AI reimagines every room in 15-30 seconds. Estate agents add a single script tag -- no per-listing setup required.',
      },
      {
        question: 'How does the AI generation work?',
        answer:
          'Virtual Staging IOM uses FLUX, a state-of-the-art image generation model, to reimagine property photos in a chosen interior style. Each image is processed via our API pipeline: room type is detected with Claude Vision, a tailored prompt is built, and the result is generated and cached for future visitors.',
      },
      {
        question: 'What interior styles are available?',
        answer:
          'There are 8 curated styles: Scandinavian, Contemporary, Industrial, Maximalist, Japandi, Coastal, Art Deco, and Biophilic. You can enable or disable individual styles per account from your dashboard. Additional custom styles are available on Agency and Enterprise plans.',
      },
      {
        question: 'Do buyers need to upload photos?',
        answer:
          'No. In production, the widget automatically detects property photos already on the listing page -- buyers never need to upload anything. The "upload" step in the standalone buyer tool demo is for testing purposes only.',
      },
    ],
  },
  {
    category: 'Integration',
    items: [
      {
        question: 'How do I add Virtual Staging IOM to my listing pages?',
        answer:
          'Paste one script tag before the closing </body> tag in your listing page template. The widget activates automatically on every listing. For platforms like WordPress, Reapit, or Alto, we provide step-by-step guides in your dashboard -> Integration tab.',
      },
      {
        question: 'Does the widget affect my page speed?',
        answer:
          'No. The widget script loads asynchronously with the defer attribute, so it never blocks page rendering. The total uncompressed widget size is ~40KB. Generated images are served from Cloudflare\'s CDN with a 70%+ cache hit rate, so most repeat visitors see instant results.',
      },
      {
        question: 'Can I customise the widget to match my brand?',
        answer:
          'Yes. You can set your accent colour, button label, and which styles to offer from your dashboard. On Agency plans you can fully white-label the widget, removing all Virtual Staging IOM branding.',
      },
    ],
  },
  {
    category: 'Pricing & Billing',
    items: [
      {
        question: 'What counts as a "generation"?',
        answer:
          'A generation is one AI-transformed image. If a buyer views results for a listing and 4 rooms have already been generated in Scandinavian style (cached), those don\'t count against your quota. Only the first fresh generation per image+style combination uses quota.',
      },
      {
        question: 'Can I change plans at any time?',
        answer:
          'Yes. You can upgrade or downgrade at any time from your dashboard -> Billing tab. Upgrades take effect immediately (prorated). Downgrades take effect at the start of your next billing cycle.',
      },
      {
        question: 'Do you offer a free trial?',
        answer:
          'The Starter plan (£49/month) comes with a 14-day free trial -- no credit card required. Growth and Agency plans can be trialled by contacting us at hello@virtualstagingIOM.com.',
      },
    ],
  },
  {
    category: 'Results & Disclosure',
    items: [
      {
        question: 'Are the AI results shown to buyers as real?',
        answer:
          'No. All results include an "AI Visualisation" watermark by default (configurable). We recommend including a note in your listing disclaimers such as: "Some images show AI-generated interior styling concepts and are not representative of the current state of the property."',
      },
      {
        question: 'What results are estate agents seeing?',
        answer:
          'Beta partners report a 38% increase in viewing requests from listings using Virtual Staging IOM, buyers spending 3.2x longer on listing pages, and measurably higher engagement with listings under £1.5M where buyers are most likely to personalise.',
      },
    ],
  },
]

function FAQ() {
  return (
    <div style={{ minHeight: 'calc(100vh - 72px)', background: '#faf7f2' }}>
      <div style={{ background: '#1a1612', padding: '64px 48px 72px', color: '#f5f0e8' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <p style={{ fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#b8965a', fontWeight: 500, marginBottom: '16px' }}>
            FAQ
          </p>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 'clamp(32px, 4vw, 52px)',
            fontWeight: 300, lineHeight: 1.1, marginBottom: '16px',
          }}>
            Frequently asked <em style={{ fontStyle: 'italic', color: '#d4b07a' }}>questions</em>
          </h1>
          <p style={{ color: '#8a7f72', fontSize: '15px', lineHeight: 1.7, maxWidth: '480px' }}>
            Everything estate agents and buyers need to know about Virtual Staging IOM.
            Can't find an answer? Email us at{' '}
            <a href="mailto:hello@virtualstagingIOM.com" style={{ color: '#b8965a' }}>hello@virtualstagingIOM.com</a>
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '64px 48px' }}>
        {faqs.map((section) => (
          <div key={section.category} style={{ marginBottom: '48px' }}>
            <p style={{
              fontSize: '11px', fontWeight: 500, letterSpacing: '0.16em',
              textTransform: 'uppercase', color: '#b8965a', marginBottom: '20px',
              display: 'flex', alignItems: 'center', gap: '12px',
            }}>
              {section.category}
              <span style={{ flex: 1, height: '1px', background: '#e8dcc8', display: 'block' }} />
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {section.items.map((faq, i) => (
                <Accordion key={i} question={faq.question} answer={faq.answer} />
              ))}
            </div>
          </div>
        ))}

        <div style={{
          background: '#1a1612', padding: '36px 36px', borderRadius: '2px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <p style={{ color: '#f5f0e8', fontSize: '16px', fontWeight: 400, marginBottom: '6px' }}>
              Still have questions?
            </p>
            <p style={{ color: '#8a7f72', fontSize: '13px' }}>
              Our team is happy to walk you through a live demo.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link to="/embed-demo" style={{
              background: '#b8965a', color: '#fff',
              padding: '10px 24px', borderRadius: '2px',
              fontSize: '12px', fontWeight: 500,
              letterSpacing: '0.08em', textTransform: 'uppercase',
              textDecoration: 'none',
            }}>
              See demo
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function Accordion({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)

  return (
    <div style={{
      border: `1px solid ${S.warm}`,
      borderRadius: '2px', overflow: 'hidden',
      background: S.white,
    }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', padding: '18px 22px',
          textAlign: 'left', cursor: 'pointer',
          background: open ? '#fdf9f3' : S.white,
          border: 'none', transition: 'background 0.2s',
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <span style={{ fontSize: '15px', fontWeight: 500, color: S.ink, lineHeight: 1.4, paddingRight: '16px' }}>
          {question}
        </span>
        <ChevronDown
          size={18}
          style={{
            color: open ? S.gold : S.muted,
            transform: open ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.2s, color 0.2s',
            flexShrink: 0,
          }}
        />
      </button>
      {open && (
        <div style={{
          padding: '0 22px 18px', fontSize: '14px', color: S.muted, lineHeight: 1.75,
          borderTop: `1px solid ${S.warm}`,
          paddingTop: '16px',
        }}>
          {answer}
        </div>
      )}
    </div>
  )
}
