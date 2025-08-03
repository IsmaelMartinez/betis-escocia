# Developer Onboarding Guide

## Welcome to Peña Bética Escocesa Website

This guide will help you get started with the project quickly and efficiently.

## Prerequisites

- Node.js 22+ installed
- npm or yarn package manager
- Git for version control
- Basic knowledge of Next.js, TypeScript, and React

## Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/pena-betica-escocesa.git
cd pena-betica-escocesa
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Environment Variables
Copy the example environment file:
```bash
cp .env.example .env.local
```

Fill in the required environment variables

### 4. Run the Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── api/            # API routes
│   ├── admin/          # Admin dashboard pages
│   ├── coleccionables/ # Merchandise page
│   ├── contacto/       # Contact page
│   ├── galeria/        # Gallery page
│   ├── nosotros/       # About page
│   ├── partidos/       # Matches page
│   ├── clasificacion/  # League table page
│   ├── redes-sociales/ # Social media page
│   ├── sign-in/        # Authentication pages
│   └── sign-up/
├── components/         # Reusable UI components
├── lib/               # Utility functions and configurations
├── types/             # TypeScript type definitions
└── middleware.ts      # Next.js middleware for route protection
```

## Key Technologies

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Clerk.com
- **Styling**: Tailwind CSS 4
- **Deployment**: Vercel

## Feature Flags

The application uses feature flags to control which features are visible. Features are disabled by default and must be explicitly enabled in environment variables.

See [Feature Flags Documentation](../feature-flags.md) for more details.

## Architecture Decisions

Important technical decisions are documented as ADRs (Architecture Decision Records):

- [ADR-001: Clerk Authentication](../adr/001-clerk-authentication.md)
- [ADR-002: Football-Data.org API](../adr/002-football-api.md)
- [ADR-003: Supabase Database](../adr/003-supabase-database.md)

## Development Workflow

1. **Create a branch** for your feature/fix
2. **Make changes** following the existing code patterns
3. **Test thoroughly** - ensure all functionality works
4. **Update documentation** if needed
5. **Create a pull request** with clear description

## Common Tasks

### Running Tests
```bash
npm run lint                # ESLint checking
npm run type-check         # TypeScript validation
npm run build-storybook    # Build component documentation
npm test                   # Jest unit/integration tests
npm run test:e2e          # Playwright end-to-end tests
npm run build             # Test build process
```

Note: The CI/CD pipeline runs all these checks automatically on every push and pull request.

### Database Management
Access the Supabase dashboard for database management:
- Schema changes should be documented
- Always backup before major changes

#### Trivia Questions Management
The project includes a comprehensive script for managing trivia questions:

```bash
# Update all trivia questions with new curated content
npm run update-trivia
```

**Features:**
- Safely replaces all existing trivia data
- 1465 questions (130 Real Betis + 425 Scotland + 900 Whisky)
- Automatic UUID handling and data verification
- Progress tracking and error handling

**Script Location:** `scripts/update-trivia-questions.ts`
**Documentation:** `scripts/README.md`

**Requirements:**
- Environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Database tables: `trivia_questions`, `trivia_answers`

### Adding New Features
1. Check if feature flag is needed
2. Update TypeScript types if necessary
3. Follow existing component patterns
4. Update documentation

## Troubleshooting

### Environment Variables
- Ensure all required variables are set in `.env.local`
- Restart development server after changes

### Authentication Issues
- Check Clerk dashboard configuration
- Verify API keys are correct
- Ensure middleware is properly configured

### Database Connection
- Verify Supabase URL and keys
- Check network connectivity
- Review Supabase project status

## Getting Help

1. Check existing documentation in `/docs`
2. Review ADRs for context on decisions
3. Look at similar implementations in the codebase
4. Ask team members for guidance

## Next Steps

Once you're set up:
1. Explore the codebase structure
2. Read the ADRs to understand key decisions
3. Review the security documentation
4. Try making a small change to get familiar with the workflow

Welcome to the team! 🟢⚪
