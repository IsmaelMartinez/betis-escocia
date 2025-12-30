import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
require('dotenv').config({ path: '.env.local' });

/**
 * Required environment variables for E2E tests
 * In CI: These are set via GitHub Actions secrets
 * Locally: These are loaded from .env.local via dotenv
 */
const REQUIRED_ENV_VARS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
  'CLERK_SECRET_KEY',
] as const;

const OPTIONAL_ENV_VARS = [
  'FOOTBALL_DATA_API_KEY',
] as const;

/**
 * Validate that required environment variables are set in CI
 * Locally, .env.local handles this, so we only validate in CI
 */
function validateEnvironmentVariables() {
  if (!process.env.CI) {
    // Skip validation locally - .env.local should handle this
    return;
  }

  const missing = REQUIRED_ENV_VARS.filter(varName => !process.env[varName]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables in CI: ${missing.join(', ')}\n` +
      'Please ensure these are set in GitHub Actions secrets.'
    );
  }
}

// Validate before running tests
validateEnvironmentVariables();

/**
 * Build environment object for webServer
 * Pass through all environment variables needed by Next.js
 */
function buildWebServerEnv(): Record<string, string> {
  const env: Record<string, string> = {
    NEXT_PUBLIC_FEATURE_ADMIN_PUSH_NOTIFICATIONS: 'true',
  };

  // Add all required and optional env vars
  [...REQUIRED_ENV_VARS, ...OPTIONAL_ENV_VARS].forEach(varName => {
    env[varName] = process.env[varName] || '';
  });

  return env;
}

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  globalSetup: require.resolve('./playwright/global.setup'),
  testDir: './e2e',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in tests for like `await page.goto('/ ')`. */
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',

    launchOptions: {
      env: {
        NEXT_PUBLIC_FEATURE_CLASIFICACION: 'true',
        NEXT_PUBLIC_FEATURE_RSVP: 'true',
        NEXT_PUBLIC_FEATURE_PARTIDOS: 'true',
        NEXT_PUBLIC_FEATURE_NOSOTROS: 'true',
        NEXT_PUBLIC_FEATURE_UNETE: 'true',
        NEXT_PUBLIC_FEATURE_CLERK_AUTH: 'true',
        // Feature flags for E2E testing
      },
    },

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], storageState: 'playwright/.clerk/user.json' },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'NEXT_PUBLIC_FEATURE_ADMIN_PUSH_NOTIFICATIONS=true npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000, // Increased timeout to 120 seconds
    env: buildWebServerEnv(),
  },
});
