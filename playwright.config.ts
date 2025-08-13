import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
require('dotenv').config({ path: '.env.local' });

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
        NEXT_PUBLIC_FEATURE_ADMIN: 'true',
        NEXT_PUBLIC_FEATURE_TRIVIA_GAME: 'true',
        // Mock Flagsmith to prevent excessive API requests in tests
        NEXT_PUBLIC_FLAGSMITH_ENVIRONMENT_ID: 'test-environment',
  E2E_FLAGSMITH_MOCK: 'true',
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
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000, // Increased timeout to 120 seconds
  },
});
