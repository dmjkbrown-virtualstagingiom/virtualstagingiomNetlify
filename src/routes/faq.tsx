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
    category: 'Getting Started',
    items: [
      {
        question: 'What is Virtual Staging IOM?',
        answer:
          'Virtual Staging IOM is an AI-powered interior redesign tool for home owners. Upload photos of any room in your home, choose an interior style, and our AI reimagines the space in seconds — giving you a photorealistic preview of how your home could look before you spend a penny on renovations, furniture, or decorating.',
      },
      {
        question: 'Do I need any design experience to use it?',
        answer:
          'Not at all. Simply upload your photos, pick a room type, choose a style you love, and let the AI do the rest. The whole process takes less than two minutes and requires no technical or design knowledge whatsoever.',
      },
      {
        question: 'What kind of photos should I upload?',
        answer:
          'Clear, well-lit photos taken from a corner or doorway work best — similar to how estate agents photograph rooms. Avoid very dark images or extremely wide-angle shots. JPG, PNG and WEBP formats are all supported. You can upload up to 5 room photos at a time.',
      },
      {
        question: 'How long does it take to generate a redesign?',
        answer:
          'Each room takes approximately 30–60 seconds to generate. If you upload 5 rooms, all 5 are processed and ready within a couple of minutes. You can watch the progress in real time as each room completes.',
      },
    ],
  },
  {
    category: 'Styles & Results',
    items: [
      {
        question: 'What interior styles are available?',
        answer:
          'There are 10 curated styles to choose from: Japandi, Scandinavian, Coastal, Luxury Modern, Modern Farmhouse, Urban Masculine, Biophilic Design, Maximalist, Minimalist, and Whites. Each style produces a distinctly different look and feel, from calm and neutral to bold and dramatic.',
      },
      {
        question: 'Can I try different styles on the same photos?',
        answer:
          'Yes! After your first generation you can click "Try another style" to run the same room photos through a completely different style without re-uploading anything. Your photos stay loaded until you start over.',
      },
      {
        question: 'How accurate are the results?',
        answer:
          'The AI maintains the architectural layout of your room — windows, doors, ceiling height, and room proportions stay exactly as they are. Furniture, flooring, wall colours, and soft furnishings are redesigned to match your chosen style. Results are photorealistic and intended as an inspiring visualisation rather than an exact blueprint.',
      },
      {
        question: 'Will the AI change the structure of my room?',
        answer:
          'No. The AI is instructed to preserve all structural elements — walls, windows, doors, ceilings — and only replace the decorative elements like furniture, flooring, paint colours, and accessories. The bones of your room stay the same.',
      },
    ],
  },
  {
    category: 'Saving & Downloads',
    items: [
      {
        question: 'Can I download my generated images?',
        answer:
          'Yes. Every generated image has a Download button that saves a high-quality version directly to your device. You can download as many as you like.',
      },
      {
        question: 'What is "Save to My Designs"?',
        answer:
          'Clicking "Save to My Designs" stores your favourite generated images to your account permanently. You can access them anytime from the My Designs page in your navigation. This is a great way to save the looks you love and compare them later.',
      },
      {
        question: 'How long are my saved designs kept?',
        answer:
          'Designs saved to your account are stored permanently and will not expire. Generated images that have not been saved may expire after a few days, so we recommend saving any designs you love straight away.',
      },
    ],
  },
  {
    category: 'Credits & Pricing',
    items: [
      {
        question: 'How do credits work?',
        answer:
          'Each AI-generated image uses one credit. If you upload 5 rooms and generate redesigns, that uses 5 credits. Trying a different style on the same 5 rooms uses another 5 credits. Your credit balance is shown on your My Account page at all times.',
      },
      {
        question: 'How many free generations do I get?',
        answer:
          'Every new account includes 3 free AI generations so you can try the tool before purchasing. No credit card is required to sign up.',
      },
      {
        question: 'What happens when I run out of credits?',
        answer:
          'When your credits run low you will see a prompt to top up. Once you have used all your credits, you will need to purchase more before generating additional images. Your saved designs and account remain fully accessible.',
      },
      {
        question: 'What are my payment options?',
        answer:
          'We offer two options. Pay As You Go (£3.99) gives you 15 credits that never expire — top up whenever you need more. Monthly (£7.99/month) gives you 100 credits every month, automatically renewed. You can cancel your monthly plan at any time from your My Account page.',
      },
      {
        question: 'Do Pay As You Go credits expire?',
        answer:
          'No. Pay As You Go credits never expire. Use them at your own pace — whether that\'s all at once or spread over several months.',
      },
      {
        question: 'Can I cancel my monthly subscription?',
        answer:
          'Yes, you can cancel at any time from your My Account page. Your subscription will remain active until the end of the current billing period, and you will keep access to your remaining credits until then.',
      },
    ],
  },
  {
    category: 'Account & Privacy',
    items: [
      {
        question: 'Is my data safe?',
        answer:
          'Yes. Your uploaded photos are used solely to generate your redesigns and are not shared with third parties or used to train AI models. Generated images saved to your account are stored securely and are only accessible by you.',
      },
      {
        question: 'Can I use the generated images commercially?',
        answer:
          'Images generated through Virtual Staging IOM are for personal use and inspiration — for example, planning a renovation or visualising a new look for your home. If you intend to use generated images in marketing materials or for commercial property listings, please contact us first.',
      },
      {
        question: 'Are the AI images presented as real?',
        answer:
          'All generated images are clearly labelled with an "AI Visualisation" badge. They are intended as an inspiring preview of possibilities, not a representation of the current state of a property.',
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
            Everything you need to know about reimagining your home with Virtual Staging IOM.
            Can't find an answer? Email us at{' '}
            <a href="mailto:virtualstagingiom@gmail.com" style={{ color: '#b8965a' }}>virtualstagingiom@gmail.com</a>
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
          background: '#1a1612', padding: '36px', borderRadius: '2px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: '20px',
        }}>
          <div>
            <p style={{ color: '#f5f0e8', fontSize: '16px', fontWeight: 400, marginBottom: '6px' }}>
              Still have questions?
            </p>
            <p style={{ color: '#8a7f72', fontSize: '13px' }}>
              We're happy to help — drop us an email and we'll get back to you.
            </p>
          </div>
          <a
            href="mailto:virtualstagingiom@gmail.com"
            style={{
              background: '#b8965a', color: '#fff',
              padding: '10px 24px', borderRadius: '2px',
              fontSize: '12px', fontWeight: 500,
              letterSpacing: '0.08em', textTransform: 'uppercase',
              textDecoration: 'none', whiteSpace: 'nowrap',
            }}
          >
            Get in touch
          </a>
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
          padding: '16px 22px 18px', fontSize: '14px', color: S.muted, lineHeight: 1.75,
          borderTop: `1px solid ${S.warm}`,
        }}>
          {answer}
        </div>
      )}
    </div>
  )
}
