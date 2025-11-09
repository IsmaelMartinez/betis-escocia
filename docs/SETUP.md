# Local Development Setup Guide

Quick guide to get the Betis Escocia project running locally.

## Prerequisites

- Node.js 22 or higher
- npm (comes with Node.js)
- Git

## Step-by-Step Setup

### 1. Clone and Install

```bash
# Install dependencies
npm install
```

### 2. Configure Environment Variables

```bash
# Copy the example environment file
cp .env.local.example .env.local

# Edit .env.local with your actual credentials
# You'll need accounts for:
# - Supabase: https://supabase.com/dashboard
# - Clerk: https://dashboard.clerk.com
# - Football Data API: https://www.football-data.org/client/register
```

**Required variables to update in `.env.local`:**
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Your Clerk publishable key
- `CLERK_SECRET_KEY` - Your Clerk secret key

**For E2E tests, also set:**
- `CLERK_TEST_EMAIL` - Email of a test user in your Clerk instance
- `CLERK_TEST_PASSWORD` - Password for that test user

### 3. Run the Development Server

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

### 4. Run Tests

```bash
# Unit and integration tests (work without .env.local)
npm test

# Watch mode for development
npm run test:watch

# Coverage report
npm run test:coverage

# E2E tests (requires .env.local with real credentials)
npm run test:e2e
```

## Common Issues

### E2E Tests Failing

**Symptom:** `Error: @clerk/clerk-react: Missing publishableKey`

**Solution:** Make sure your `.env.local` file exists and has valid Clerk credentials.

### Google Fonts Warnings

**Symptom:** "Failed to download Geist from Google Fonts"

**Solution:** This is just a warning. The app will use fallback fonts. If you're in an isolated network environment, this is expected.

### Port Already in Use

**Symptom:** `Error: listen EADDRINUSE: address already in use :::3000`

**Solution:**
```bash
# Find and kill the process using port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
```

## Development Workflow

### Before Committing

```bash
# Run linter
npm run lint

# Run type checking
npm run type-check

# Run tests
npm test
```

### Building for Production

```bash
npm run build
npm run start
```

## Additional Tools

### Storybook (Component Development)

```bash
npm run storybook
```

Open http://localhost:6006 to view component documentation.

### Lighthouse Accessibility Audit

```bash
# Start the dev server first
npm run dev

# In another terminal
npm run lighthouse:accessibility
```

## Getting Help

- **Documentation:** See `docs/DEVELOPER_GUIDE.md` for comprehensive docs
- **Testing Guide:** See `docs/TESTING_GUIDE.md` for testing patterns
- **Investigation Report:** See `INVESTIGATION_REPORT.md` for recent improvements

## Next Steps

1. Review the [Developer Guide](./DEVELOPER_GUIDE.md) for architecture details
2. Check [Testing Guide](./TESTING_GUIDE.md) for testing patterns
3. Review [ADRs](./adr/) for architectural decisions
4. Read [CLAUDE.md](../CLAUDE.md) for AI assistant context
