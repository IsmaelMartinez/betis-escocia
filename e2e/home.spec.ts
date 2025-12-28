import { test, expect } from './fixtures';

// TODO: Re-enable these tests when feature flags (RSVP, Partidos) are enabled in CI environment
// These tests check for RSVP widget and navigation to feature-flagged pages
test.describe.skip('Home Page Happy Path', () => {
  test('should load successfully and display key elements', async ({ page }) => {
    // 2.1.1 Verify page loads successfully (HTTP 200)
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);

    // 2.1.2 Assert visibility of key elements (e.g., hero section, main headings, navigation bar)
    await expect(page.locator('h1', { hasText: 'MÁS QUE' })).toBeVisible();
    await expect(page.locator('nav')).toBeVisible();
    // Look for the logo/home link instead of "Inicio" text
    await expect(page.locator('header a[href="/"]')).toBeVisible();
    // Check for RSVP widget (now embedded on homepage)
    await expect(page.getByText('🍺 Confirmar Asistencia')).toBeVisible();

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
    // Navigate to Partidos page instead (RSVP is now embedded)
    await page.getByRole('link', { name: 'Partidos' }).click();
    await expect(page).toHaveURL('/partidos');
    await expect(page.locator('h1', { hasText: 'Partidos del Betis' })).toBeVisible();

    // Click the logo/home link instead of "Inicio" text
    await page.locator('header a[href="/"]').click();
    await expect(page).toHaveURL('/');
  });
});
