import { test, expect } from './fixtures';

test.describe('Home Page Happy Path', () => {
  test('should load successfully and display key elements', async ({ page }) => {
    // 2.1.1 Verify page loads successfully (HTTP 200)
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);

    // 2.1.2 Assert visibility of key elements (e.g., hero section, main headings, navigation bar)
    await expect(page.locator('h1', { hasText: 'No busques más' })).toBeVisible();
    await expect(page.locator('nav')).toBeVisible();
    // Look for the logo/home link instead of "Inicio" text
    await expect(page.locator('header a[href="/"]')).toBeVisible();
    await expect(page.getByRole('link', { name: 'RSVP' })).toBeVisible();

    // 2.1.4 Ensure no console errors or network failures on page load
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

  test('should navigate to other unauthenticated pages', async ({ page }) => {
    await page.goto('/');

    // 2.1.3 Verify basic navigation to other unauthenticated pages
    await page.getByRole('link', { name: 'RSVP' }).click();
    await expect(page).toHaveURL('/rsvp');
    await expect(page.locator('h1', { hasText: '¿Vienes al Polwarth?' })).toBeVisible();

    // Click the logo/home link instead of "Inicio" text
    await page.locator('header a[href="/"]').click();
    await expect(page).toHaveURL('/');
  });
});
