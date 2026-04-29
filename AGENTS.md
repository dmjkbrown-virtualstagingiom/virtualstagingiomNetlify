# AGENTS.md

This document describes the HomeVision project architecture for developers and AI agents working on this codebase.

## Project Overview

HomeVision is an AI-powered interior redesign widget for estate agents. This repository contains the marketing site and interactive prototype, built with TanStack Start and deployed on Netlify.

Two audiences:
1. **Estate agents** — sign up for an API key, paste a snippet into their listing templates, manage usage from the dashboard
2. **Buyers** — interact with the widget on listing pages to see AI-styled room visualisations

### Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | TanStack Start 1.x |
| Frontend | React 19, TanStack Router v1 |
| Build | Vite 7 |
| Styling | Tailwind CSS 4 + inline React styles (design-first) |
| Icons | Lucide React |
| Language | TypeScript 5.7 (strict mode) |
| Deployment | Netlify |

## Directory Structure

```
src/
├── routes/
│   ├── __root.tsx          # Root layout: Google Fonts, sticky nav, HTML shell
│   ├── index.tsx           # Marketing landing page (hero, stats, how it works, pricing)
│   ├── tool.tsx            # Buyer-facing homestyler (upload → style → results)
│   ├── embed-demo.tsx      # Mock estate agent site with live widget simulation
│   ├── dashboard.tsx       # Agent SaaS dashboard (6 tabs: dashboard/listings/integration/customise/billing/settings)
│   └── faq.tsx             # FAQ by category (Product, Integration, Pricing, Results)
├── styles.css              # Tailwind import + CSS base reset
└── router.tsx              # TanStack Router setup with scroll restoration
```

## Key Concepts

### File-Based Routing (TanStack Router)

Routes are defined by files in `src/routes/`:

- `__root.tsx` — Root layout: Google Fonts link tags, sticky navigation, HTML shell
- `index.tsx` — Route for `/` (marketing landing page)
- `tool.tsx` — Route for `/tool` (buyer homestyler tool)
- `embed-demo.tsx` — Route for `/embed-demo` (widget demo in context)
- `dashboard.tsx` — Route for `/dashboard` (agent SaaS portal)
- `faq.tsx` — Route for `/faq`

### Design System

All pages use inline React style objects rather than Tailwind utilities (Tailwind is only used for baseline resets). Design tokens are defined as `const S = {...}` objects at module scope:

```typescript
const S = {
  ink: '#1a1612',       // Primary dark
  cream: '#f5f0e8',     // Warm off-white text on dark
  warm: '#e8dcc8',      // Borders, dividers, warm fills
  gold: '#b8965a',      // Primary accent
  goldLight: '#d4b07a', // Italic headings on dark bg
  muted: '#8a7f72',     // Secondary/body text
  surface: '#faf7f2',   // Page background
  white: '#ffffff',
}
```

Dashboard uses `const C = {...}` with additional semantic tokens (green, red, blue for status indicators).

### Fonts

Cormorant Garamond (display/serif) and DM Sans (body/sans-serif) loaded from Google Fonts via link tags in `__root.tsx`'s `head()` config. Applied via inline `fontFamily` styles on headings.

### State Management

All state is local (`useState`, `useEffect`). No global state library. All "data" is hardcoded constants — this is a prototype, not a connected app.

## Configuration Files

| File | Purpose |
|------|---------|
| `vite.config.ts` | Vite plugins: TanStack Start, Netlify, Tailwind |
| `tsconfig.json` | TypeScript config with `@/*` path alias for `src/*` |
| `netlify.toml` | Build command, output directory, dev server settings |
| `styles.css` | Tailwind import + base body reset |

## Development Commands

```bash
npm run dev      # Start dev server on port 3000
npm run build    # Production build
```

## Conventions

### Naming
- Components: PascalCase
- Routes: kebab-case files
- Style constants: `S` (pages), `C` (dashboard)

### Styling
- Inline React style objects — no Tailwind utility classes on elements
- `const S = {...}` style token objects at module scope
- Border-radius: 2px throughout (sharp editorial feel)
- No CSS modules, no styled-components

### TypeScript
- Strict mode enabled
- `@/*` path alias for `src/*`
- Type-only imports with `type` keyword
- No `any` types

## Application Name

The application is called **HomeVision**. The logo appears in `__root.tsx`'s `SiteNav` function as:

```
Home<em>Vision</em>   (em = italic gold)
```
