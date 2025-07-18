import { test, expect } from '@playwright/test';

test.describe('Nosotros Page Happy Path', () => {
  test('should load successfully and display key elements', async ({ page }) => {
    // 2.5.1 Verify page loads successfully (HTTP 200)
    const response = await page.goto('/nosotros');
    expect(response?.status()).toBe(200);

    // 2.5.2 Assert visibility of key elements
    await expect(page.locator('h1', { hasText: 'Nosotros' })).toBeVisible();
    await expect(page.getByText('Más que una peña, somos familia')).toBeVisible();

    // 2.5.4 Ensure no console errors or network failures on page load
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
    await page.goto('/nosotros');

    // 2.5.3 Verify basic navigation
    await page.getByRole('link', { name: 'Inicio' }).click();
    await expect(page).toHaveURL('/');
  });
});
