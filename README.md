# HomeVision

AI-powered interior redesign widget for estate agent property listings. Buyers click a button on a listing page, choose an interior style, and AI reimagines every room in 30 seconds.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | TanStack Start |
| Frontend | React 19, TanStack Router v1 |
| Build | Vite 7 |
| Styling | Tailwind CSS 4 + inline CSS (design-first approach) |
| Language | TypeScript 5.7 (strict mode) |
| Deployment | Netlify |

## Running Locally

```bash
npm install
npm run dev      # Start dev server on port 3000
npm run build    # Production build
```

Or with the Netlify CLI for full platform emulation:

```bash
netlify dev      # Runs on port 8888 with Netlify feature emulation
```

## Pages

| Route | Description |
|-------|-------------|
| `/` | Marketing landing page — hero, stats, how it works, pricing |
| `/tool` | Buyer-facing homestyler tool — upload photos, pick a style, see AI results |
| `/embed-demo` | Mock estate agent listing with live HomeVision widget demo |
| `/dashboard` | Agent SaaS dashboard — stats, listings, integration, customise, billing, settings |
| `/faq` | FAQ organised by Product, Integration, Pricing, Results |

## Design System

The application uses a luxury property-market aesthetic:

- **Display font**: Cormorant Garamond (serif, loaded from Google Fonts)
- **Body font**: DM Sans (sans-serif, loaded from Google Fonts)
- **Colors**: Dark navy ink `#1a1612`, warm gold `#b8965a`, cream `#f5f0e8`
- **Radius**: 2px (sharp, editorial)

## Production Integration

In production, estate agents add one script tag to their listing template:

```html
<script
  src="https://cdn.homevision.ai/widget.js"
  data-key="ag_live_your_key_here"
  data-accent="#c8a96e"
  data-watermark="true"
  defer
></script>
```

See the [Architecture section in AGENTS.md](./AGENTS.md) for the full production stack.
