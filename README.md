# Peña Bética Escocesa 🟢⚪

Real Betis supporters club website in Edinburgh. We watch matches at **Polwarth Tavern**.

## Quick Start

```bash
npm install
cp .env.example .env.local  # Fill in your keys
npm run dev                 # http://localhost:3000
```

### Required Environment Variables
```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
```

## Commands

```bash
npm run dev           # Development server
npm run build         # Production build
npm test              # Run tests
npm run test:e2e      # E2E tests
npm run storybook     # Component dev (port 6006)
npm run lint          # ESLint
npm run type-check    # TypeScript
```

## Tech Stack

- **Next.js 15** + React 19 + TypeScript
- **Supabase** (PostgreSQL with RLS)
- **Clerk** (authentication)
- **Tailwind CSS 4**
- **Vitest** + **Playwright** + **Storybook**

## Documentation

- [Developer Guide](docs/developer-guide.md) - Full setup and patterns
- [Testing Guide](docs/testing-guide.md) - Test strategies
- [ADRs](docs/adr/) - Architecture decisions

## Social

- [Facebook](https://www.facebook.com/groups/beticosenescocia/)
- [Instagram](https://www.instagram.com/rbetisescocia/)

---

**¡Viva er Betis manque pierda!** 🟢⚪
