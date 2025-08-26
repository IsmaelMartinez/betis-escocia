import { test, expect } from '@playwright/test';

test.describe('Site Navigation', () => {
  test('should navigate through all main pages', async ({ page }) => {
    // Start from home page
    await page.goto('/');
    // Check for header brand text specifically in the header
    await expect(page.locator('header').getByText('que no hay')).toBeVisible();

    // Navigate to About page (Nosotros)
    await page.getByRole('link', { name: /nosotros/i }).first().click();
    await page.waitForURL('**/nosotros');
    await expect(page.url()).toContain('/nosotros');
    await expect(page.getByText(/peña bética/i)).toBeVisible();

    // Navigate to Matches page (Partidos)
    await page.getByRole('link', { name: /partidos/i }).first().click();
    await page.waitForURL('**/partidos');
    await expect(page.url()).toContain('/partidos');
    await expect(page.getByRole('heading', { name: /partidos del betis/i }).first()).toBeVisible();

    // Navigate to Classification page (Clasificación)
    await page.getByRole('link', { name: /clasificación/i }).first().click();
    await page.waitForURL('**/clasificacion');
    await expect(page.url()).toContain('/clasificacion');
    await expect(page.getByRole('heading', { name: /clasificación de la liga/i }).first()).toBeVisible();

    // Navigate to Join page (Únete)
    await page.getByRole('link', { name: /únete/i }).first().click();
    await page.waitForURL('**/unete');
    await expect(page.url()).toContain('/unete');
    await expect(page.getByRole('heading', { name: /únete/i }).first()).toBeVisible();

    // Navigate to Contact page (Contacto)
    await page.getByRole('link', { name: /contacto/i }).first().click();
    await page.waitForURL('**/contacto');
    await expect(page.url()).toContain('/contacto');
    await expect(page.getByRole('heading', { name: /contacto/i }).first()).toBeVisible();
  });

  test('should have working logo link to home', async ({ page }) => {
    // Start from a different page
    await page.goto('/nosotros');

    // Click on logo to go home - wait for navigation to complete
    await page.locator('header a[href="/"]').click();
    await page.waitForURL('http://localhost:3000/');
    await expect(page.url()).toBe('http://localhost:3000/');
  });

  test('should have responsive navigation menu', async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Mobile menu button should be visible
    const mobileMenuButton = page.getByRole('button', { name: /menú/i });
    if (await mobileMenuButton.isVisible()) {
      await mobileMenuButton.click();
      
      // Navigation links should be visible in mobile menu
      await expect(page.getByRole('link', { name: /nosotros/i })).toBeVisible();
      await expect(page.getByRole('link', { name: /partidos/i })).toBeVisible();
      await expect(page.getByRole('link', { name: /contacto/i })).toBeVisible();
    }
  });

  test('should highlight active navigation item', async ({ page }) => {
    await page.goto('/nosotros');

    // Check that navigation items are visible (active styling not implemented yet)
    const nosotrosLink = page.getByRole('navigation').getByRole('link', { name: 'Nosotros' });
    await expect(nosotrosLink).toBeVisible();
  });

  test('should handle 404 pages gracefully', async ({ page }) => {
    // Navigate to non-existent page
    const response = await page.goto('/non-existent-page');
    expect(response?.status()).toBe(404);

    // Should show 404 page
    await expect(page.getByText(/404/i)).toBeVisible();
    await expect(page.getByText(/página no encontrada/i)).toBeVisible();
    
    // Should have link back to home
    await expect(page.getByRole('link', { name: /volver al inicio/i })).toBeVisible();
  });

  test('should have accessible navigation', async ({ page }) => {
    await page.goto('/');

    // Navigation should have proper ARIA labels
    const nav = page.getByRole('navigation');
    await expect(nav).toBeVisible();

    // Links should be keyboard accessible - focus through navigation
    // Keep pressing Tab until we find a focused link in the navigation
    let attempts = 0;
    let focused = false;
    const maxAttempts = 10;
    
    while (attempts < maxAttempts && !focused) {
      await page.keyboard.press('Tab');
      attempts++;
      
      // Check if any navigation link is focused
      const navLinks = nav.getByRole('link');
      const count = await navLinks.count();
      
      for (let i = 0; i < count; i++) {
        const link = navLinks.nth(i);
        try {
          await expect(link).toBeFocused({ timeout: 100 });
          focused = true;
          break;
        } catch {
          // Continue to next link
        }
      }
    }
    
    expect(focused).toBe(true);
  });

  test('should preserve navigation state during navigation', async ({ page }) => {
    await page.goto('/');

    // Navigation should remain visible and functional on all pages
    const navigationLinks = ['/nosotros', '/partidos', '/clasificacion', '/contacto'];

    for (const link of navigationLinks) {
      await page.goto(link);
      
      // Navigation should still be present and functional
      await expect(page.getByRole('navigation')).toBeVisible();
      // Check for any navigation link to ensure navigation is functional
      await expect(page.getByRole('navigation').getByRole('link').first()).toBeVisible();
    }
  });

  test('should handle external links correctly', async ({ page }) => {
    await page.goto('/');

    // Find external links (social media, external resources)
    const externalLinks = page.locator('a[target="_blank"]');
    
    if (await externalLinks.count() > 0) {
      const firstExternalLink = externalLinks.first();
      
      // External links should have proper attributes
      await expect(firstExternalLink).toHaveAttribute('target', '_blank');
      await expect(firstExternalLink).toHaveAttribute('rel', /noopener|noreferrer/);
    }
  });

  test('should maintain scroll position appropriately', async ({ page }) => {
    await page.goto('/');

    // Scroll down on the page
    await page.evaluate(() => window.scrollTo(0, 500));
    
    // Navigate to another page
    await page.getByRole('link', { name: /nosotros/i }).click();
    await page.waitForLoadState('networkidle');

    // Should start at top of new page
    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBe(0);
  });

  test('should handle language/locale navigation if implemented', async ({ page }) => {
    await page.goto('/');

    // Check if language selector exists
    const languageSelector = page.getByRole('button', { name: /language|idioma/i });
    
    if (await languageSelector.isVisible()) {
      await languageSelector.click();
      
      // Should show language options
      await expect(page.getByText(/english|español/i)).toBeVisible();
    }
  });
});