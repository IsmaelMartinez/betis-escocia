import { test, expect } from './fixtures';

test.describe('Unete Page Happy Path', () => {

  test('should load successfully and display key elements', async ({ page }) => {
    // 2.6.1 Verify page loads successfully (HTTP 200)
    const response = await page.goto('/unete');
    expect(response?.status()).toBe(200);

    // 2.6.2 Assert visibility of key elements
    await expect(page.getByRole('heading', { name: 'Únete', level: 1 })).toBeVisible();
    await expect(page.getByText('Ser bético en Escocia nunca fue tan fácil')).toBeVisible();

    // 2.6.4 Ensure no console errors or network failures on page load
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error(`Console error: ${msg.text()}`);
        expect(msg.type()).not.toBe('error');
      }
    });
    page.on('requestfailed', request => {
      console.error(`Network request failed: ${request.url()} - ${request.failure()?.errorText}`);
      expect(request.failure()).toBeNull();
    });
  });

  test('should navigate back to home page', async ({ page }) => {
    await page.goto('/unete');

    // 2.6.3 Verify basic navigation
    await page.locator('header a[href="/"]').click();
    await expect(page).toHaveURL('/');
  });
});
