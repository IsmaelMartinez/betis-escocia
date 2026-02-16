# Developer Setup Guide

Welcome to the Peña Bética Escocesa project! This guide will help you set up your development environment.

## Prerequisites

### Required Software

1. **Node.js 22+**
   ```bash
   # Check your version
   node --version
   
   # Install via nvm (recommended)
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   nvm install 22
   nvm use 22
   ```

2. **Git**
   ```bash
   git --version
   ```

3. **Modern Code Editor** (VS Code recommended with extensions):
   - TypeScript and JavaScript Language Features
   - Tailwind CSS IntelliSense
   - ESLint
   - Prettier

### Recommended Tools

1. **GitHub CLI** (for PR management)
   ```bash
   # macOS
   brew install gh
   
   # Login
   gh auth login
   ```

2. **PostgreSQL Client** (for database inspection)
   ```bash
   # macOS
   brew install postgresql
   
   # Or use a GUI client like TablePlus, pgAdmin
   ```

## Project Setup

### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/IsmaelMartinez/betis-escocia.git
cd betis-escocia

# Install dependencies
npm install

# Verify installation
npm run build
```

### 2. Environment Configuration

Create your local environment file:

```bash
# Copy the template
cp .env.local.example .env.local

# Edit with your values
code .env.local
```

**Required Environment Variables:**

| Variable | Description | Where to get it |
|----------|-------------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Supabase Dashboard → Project → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Supabase Dashboard → Project → Settings → API |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key | Clerk Dashboard → API Keys |
| `CLERK_SECRET_KEY` | Clerk secret key | Clerk Dashboard → API Keys |

**Optional but Recommended:**

| Variable | Description | Purpose |
|----------|-------------|---------|
| `FOOTBALL_DATA_API_KEY` | Football-Data.org API key | Match data synchronization |
| `NEXT_PUBLIC_ONESIGNAL_APP_ID` | OneSignal app ID | Admin push notifications |
| `ONESIGNAL_REST_API_KEY` | OneSignal REST API key | Admin push notifications |
| `NEXT_PUBLIC_DEBUG_MODE=true` | Enable debug mode | Development debugging |

## External Service Setup

### 1. Supabase (Database) - **REQUIRED**

1. **Create Account**: Go to [supabase.com](https://supabase.com)
2. **Create Project**: 
   - Name: `betis-escocia-dev-[your-name]`
   - Region: Europe (West) - closest to Edinburgh
   - Database password: Generate a strong password (save it!)

3. **Set up Database**:
   ```bash
   # Navigate to SQL Editor in Supabase Dashboard
   # Run the SQL scripts in order:
   ```
   - Copy contents of `sql/0000_complete_schema.sql` and execute in Supabase SQL Editor
   - Copy contents of `sql/0001_seed_data.sql` and execute (includes sample data + trivia table fixes)

4. **Get API Keys**:
   - Go to Settings → API
   - Copy `Project URL` and `anon/public` key
   - Add to your `.env.local`

### 2. Clerk (Authentication) - **REQUIRED**

1. **Create Account**: Go to [clerk.com](https://clerk.com)
2. **Create Application**:
   - Name: `betis-escocia-dev-[your-name]`
   - Sign-in methods: Email + Password (minimum)
   - Optional: Add social providers (Google, GitHub)

3. **Configure Application**:
   - **Domains**: Add `localhost:3000` to allowed domains
   - **User Management**: Enable user profiles

4. **Get API Keys**:
   - Go to API Keys
   - Copy `Publishable Key` and `Secret Key`
   - Add to your `.env.local`

### 3. Football Data API (Optional)

1. **Create Account**: Go to [football-data.org](https://www.football-data.org/client/register)
2. **Get Free Tier**: 10 requests/minute (sufficient for development)
3. **Copy API Key**: Add to your `.env.local`

### 4. OneSignal Push Notifications (Optional)

1. **Create Account**: Go to [onesignal.com](https://onesignal.com)
2. **Create App**: For web push notifications
3. **Get Keys**: 
   - App ID from Settings → Keys & IDs
   - REST API Key from Settings → Keys & IDs
4. **Add to .env.local**: `NEXT_PUBLIC_ONESIGNAL_APP_ID` and `ONESIGNAL_REST_API_KEY`
5. **Purpose**: Enables real-time admin notifications for RSVP and contact form submissions

## Development Workflow

### 1. Start Development

```bash
# Start the development server
npm run dev

# Open in browser
open http://localhost:3000
```

### 2. Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run E2E tests (requires test user setup)
npm run test:e2e

# Check test coverage
npm run test:coverage
```

### 3. Code Quality

```bash
# Run linting
npm run lint

# Check TypeScript
npm run type-check

# Format code
npm run format  # if available, or configure Prettier in your editor
```

### 4. Storybook (Component Development)

```bash
# Start Storybook
npm run storybook

# Build Storybook
npm run build-storybook
```

## Branch and PR Workflow

### 1. Create Feature Branch

```bash
# Create and switch to feature branch
git checkout -b feature/your-feature-name

# Make your changes and commit
git add .
git commit -m "feat: add your feature description"

# Push to remote
git push -u origin feature/your-feature-name
```

### 2. Create Pull Request

```bash
# Using GitHub CLI (recommended)
gh pr create --title "Your PR Title" --body "Description of changes"

# Or create manually on GitHub.com
```

### 3. PR Requirements

Before your PR can be merged:
- ✅ All tests must pass
- ✅ No linting errors
- ✅ No TypeScript errors
- ✅ Code review from team member
- ✅ Build succeeds

## Project Structure

```
betis-escocia/
├── src/
│   ├── app/                 # Next.js App Router pages & API routes
│   ├── components/          # Reusable React components
│   ├── lib/                 # Utilities, configurations, helpers
│   └── types/              # TypeScript type definitions
├── tests/
│   ├── unit/               # Unit tests (Vitest)
│   ├── integration/        # Integration tests (Vitest)
│   └── e2e/                # End-to-end tests (Playwright)
├── sql/
│   ├── 0000_complete_schema.sql  # Database schema
│   ├── 0001_seed_data.sql       # Sample data
│   └── legacy/             # Old migration files
├── docs/
│   ├── adr/                # Architecture Decision Records
│   └── *.md                # Documentation files
└── .storybook/             # Storybook configuration
```

## Common Development Tasks

### Add New Feature

1. **Check feature flags**: `src/lib/featureConfig.ts`
2. **Create components**: `src/components/`
3. **Add tests**: `tests/unit/` and/or `tests/integration/`
4. **Add Storybook stories**: `src/components/*.stories.tsx`
5. **Update types**: `src/types/` if needed

### Database Changes

1. **Create new migration**: `sql/NNNN_your_change.sql`
2. **Follow naming convention**: 4-digit sequential numbering
3. **Test locally**: Run against your dev database
4. **Update TypeScript types**: `src/lib/supabase.ts`

### API Routes

- **Use abstracted pattern**: `src/lib/apiUtils.ts` with `createApiHandler`
- **Add proper authentication**: Check existing patterns
- **Include tests**: `tests/integration/api/`
- **Follow security practices**: Never expose sensitive data

## Troubleshooting

### Common Issues

**Build Errors**
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

**Database Connection Issues**
- Check Supabase project is running
- Verify environment variables
- Check database URL format

**Authentication Issues**
- Verify Clerk keys in `.env.local`
- Check localhost:3000 is in allowed domains
- Clear browser cookies/storage

**Test Failures**
```bash
# Run specific test
npm test -- tests/unit/your-test.test.ts

# Debug with verbose output
npm test -- --reporter=verbose
```

### Getting Help

1. **Check documentation**: All docs in `docs/` folder
2. **Review ADRs**: Architecture decisions in `docs/adr/`
3. **Ask team**: Create GitHub issue or discussion
4. **Debug locally**: Use `NEXT_PUBLIC_DEBUG_MODE=true`

## Additional Resources

- **Next.js 16 Docs**: https://nextjs.org/docs
- **React 19 Features**: https://react.dev/blog/2024/12/05/react-19
- **Supabase Docs**: https://supabase.com/docs
- **Clerk Docs**: https://clerk.com/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Vitest Testing**: https://vitest.dev/
- **Playwright E2E**: https://playwright.dev/

## Security Notes

- **Never commit secrets**: Use `.env.local` (already in `.gitignore`)
- **Use environment variables**: For all configuration
- **Follow RLS patterns**: When adding database features
- **Validate inputs**: Use Zod schemas for API routes
- **Test security**: Include auth tests in your features

---

**Welcome to the team! 🟢⚪️**

For questions or issues with this setup guide, please create a GitHub issue or reach out to the team.

*¡Viva el Betis!* 💚🤍