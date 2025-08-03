# Scripts Documentation

This document provides an overview of all utility scripts available in the project.

## Available Scripts

### Development Scripts

#### `npm run dev`
Starts the Next.js development server with Turbopack for faster builds.

#### `npm run build`
Creates a production build of the application.

#### `npm run start`
Starts the production server (requires build first).

### Testing Scripts

#### `npm test`
Runs all unit and integration tests using Jest.

#### `npm run test:watch`
Runs tests in watch mode for development.

#### `npm run test:coverage`
Generates test coverage reports (HTML and LCOV formats).

#### `npm run test:e2e`
Runs end-to-end tests using Playwright.

### Database Management Scripts

#### `npm run update-trivia`
**Purpose**: Completely replaces all trivia questions and answers with a curated set.

**Location**: `scripts/update-trivia-questions.ts`

**Features**:
- Safely clears existing trivia data
- Inserts 1465 new questions (Spanish)
- 1465 questions (130 Real Betis + 425 Scotland + 900 Whisky)
- Automatic UUID handling and progress tracking
- Data verification after insertion

**Usage**:
```bash
npm run update-trivia
```

**Requirements**:
- Environment variables in `.env.local`:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Question Categories**:
- **Betis**: Stadium, history, players, achievements, current information
- **Scotland**: Geography, culture, history, Edinburgh connections

**Safety Features**:
- Transactional approach (clears old data before inserting new)
- Foreign key constraint handling
- Error handling with informative messages
- Progress tracking during execution
- Post-insertion data verification

### Storybook Scripts

#### `npm run storybook`
Starts Storybook development server on port 6006.

#### `npm run build-storybook`
Builds static Storybook for deployment.

### Quality Assurance Scripts

#### `npm run lint`
Runs ESLint to check code quality and style.

#### `npm run type-check`
Runs TypeScript compiler to check for type errors.

#### `npm run lighthouse:accessibility`
Runs Lighthouse accessibility audit on the local development server.

## Script Implementation Guidelines

### Adding New Scripts

1. **Location**: Place scripts in the `scripts/` directory
2. **Language**: Use TypeScript for consistency
3. **Environment**: Use tsx for execution (`npx tsx script-name.ts`)
4. **Documentation**: Create or update `scripts/README.md`
5. **Package.json**: Add npm script entry for easy execution

### Best Practices

- **Error Handling**: Implement comprehensive error handling
- **Progress Feedback**: Provide user feedback for long-running operations
- **Environment Variables**: Validate required environment variables
- **Documentation**: Include usage examples and requirements
- **Safety**: Implement safeguards for destructive operations

### Example Script Structure

```typescript
#!/usr/bin/env tsx

import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function myScript() {
  // Validate environment
  const requiredVar = process.env.REQUIRED_VAR;
  if (!requiredVar) {
    console.error('❌ Missing REQUIRED_VAR environment variable');
    process.exit(1);
  }

  try {
    console.log('🔄 Starting script...');
    
    // Script logic here
    
    console.log('✅ Script completed successfully!');
  } catch (error) {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  myScript().catch(console.error);
}

export { myScript };
```

## Troubleshooting

### Common Issues

**Environment Variables Not Found**:
- Check `.env.local` file exists
- Verify variable names match exactly
- Restart script after environment changes

**Database Connection Issues**:
- Verify Supabase URL and keys
- Check network connectivity
- Ensure database tables exist

**Permission Issues**:
- Verify API keys have required permissions
- Check Supabase RLS policies if applicable
- Ensure Clerk API keys have user read permissions

### Getting Help

1. Check script-specific README files in `scripts/`
2. Review error messages for specific guidance
3. Verify environment configuration
4. Check service status (Supabase, Clerk, Flagsmith)

## Security Considerations

- **Never commit** API keys or sensitive data
- **Use environment variables** for all configuration
- **Validate inputs** to prevent injection attacks
- **Follow principle of least privilege** for API permissions
- **Log operations** but avoid logging sensitive data
