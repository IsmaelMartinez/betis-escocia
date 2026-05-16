# Peña Bética Escocesa 🟢⚪

Real Betis supporters club website in Edinburgh. We watch matches at **Polwarth Tavern**.

## Quick Start

```bash
npm install
cp .env.local.example .env.local  # set FOOTBALL_DATA_API_KEY
npm run dev                       # http://localhost:3000
```

### Required Environment Variables

```bash
FOOTBALL_DATA_API_KEY=your-key   # free at https://www.football-data.org/
```

Optional: `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SENTRY_DSN`, `GOOGLE_SITE_VERIFICATION`. See `docs/developer-guide.md` for the full list.

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

- **Next.js 16** + React 19 + TypeScript
- **Tailwind CSS 4** with custom Betis branding
- **football-data.org** for match and standings data, cached via `unstable_cache`
- **Sentry** for error monitoring
- **Vitest** + **Playwright** + **Storybook**

No database. No authentication. The site is a static public page; match data flows directly from football-data.org.

## Features

- Match listing and individual match pages (`/partidos`)
- La Liga standings (`/clasificacion`)
- About the peña (`/nosotros`)
- Joining and visiting info (`/unete`)
- Historic Betis players (`/jugadores-historicos`)
- Joaquín easter egg (`/joaquin`)
- Daily Betis "efemérides" on the homepage

## Documentation

- [Developer Guide](docs/developer-guide.md) — full setup and patterns
- [Testing Guide](docs/testing-guide.md) — test strategies
- [Deployment Guide](docs/deployment-guide.md) — Vercel deploy specifics
- [ADRs](docs/adr/) — architecture decisions

## Social

- [Facebook](https://www.facebook.com/groups/beticosenescocia/)
- [Instagram](https://www.instagram.com/rbetisescocia/)

---

**¡Viva er Betis manque pierda!** 🟢⚪
