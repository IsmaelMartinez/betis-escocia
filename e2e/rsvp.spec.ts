import { test, expect } from './fixtures';

test.describe('RSVP Page Happy Path', () => {

  test('should load successfully and display key elements', async ({ page }) => {
    // 2.2.1 Verify page loads successfully (HTTP 200)
    const response = await page.goto('/rsvp');
    expect(response?.status()).toBe(200);

    // 2.2.2 Assert visibility of key elements
    await expect(page.locator('h1', { hasText: '¿Vienes al Polwarth?' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Confirma tu Asistencia' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Confirmar Asistencia' })).toBeVisible();

    // 2.2.4 Ensure no console errors or network failures on page load
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
    await page.goto('/rsvp');

    // 2.2.3 Verify basic navigation
    await page.locator('header a[href="/"]').click();
    await expect(page).toHaveURL('/');
  });
});
