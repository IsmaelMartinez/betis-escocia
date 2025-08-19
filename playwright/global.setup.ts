import { clerk, clerkSetup } from '@clerk/testing/playwright';
import { chromium, FullConfig, expect } from '@playwright/test';
import path from 'path';

async function globalSetup(config: FullConfig) {
  const { baseURL } = config.projects[0].use;

  // Configure Playwright with Clerk
  await clerkSetup();

  // Define the path to the storage file, which is `user.json`
  const authFile = path.join(__dirname, '../playwright/.clerk/user.json');

  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Set default timeout for all page operations
  page.setDefaultTimeout(60000);

  // Navigate to the base URL first
  await page.goto(baseURL || '/');

  // Perform authentication steps.
  await clerk.signIn({
    page,
    signInParams: {
      strategy: 'password',
      identifier: process.env.CLERK_TEST_EMAIL!,
      password: process.env.CLERK_TEST_PASSWORD!,
    },
  });

  // Wait for the page to be idle after sign-in to ensure all redirects and authentication processes are complete
  await page.waitForLoadState('networkidle');

  // Navigate to the protected trivia page and verify access
  await page.goto(`${baseURL}/trivia`);
  await page.waitForURL(`${baseURL}/trivia`); // Ensure the URL is the trivia page
  
  await expect(page.locator('h1', { hasText: 'Betis & Scotland Trivia Challenge' })).toBeVisible();

  await page.context().storageState({ path: authFile });
  await browser.close();
}

export default globalSetup;
