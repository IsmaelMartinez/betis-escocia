import { test, expect } from '@playwright/test';

test.describe('Site Navigation', () => {
  test('should navigate through all main pages', async ({ page }) => {
    // Start from home page
    await page.goto('/');
    await expect(page.getByText(/peña bética/i)).toBeVisible();

    // Navigate to About page (Nosotros)
    await page.getByRole('link', { name: /nosotros/i }).click();
    await expect(page.url()).toContain('/nosotros');
    await expect(page.getByText(/nuestra historia/i)).toBeVisible();

    // Navigate to Matches page (Partidos)
    await page.getByRole('link', { name: /partidos/i }).click();
    await expect(page.url()).toContain('/partidos');
    await expect(page.getByText(/próximos partidos/i)).toBeVisible();

    // Navigate to Classification page (Clasificación)
    await page.getByRole('link', { name: /clasificación/i }).click();
    await expect(page.url()).toContain('/clasificacion');
    await expect(page.getByText(/la liga/i)).toBeVisible();

    // Navigate to Join page (Únete)
    await page.getByRole('link', { name: /únete/i }).click();
    await expect(page.url()).toContain('/unete');
    await expect(page.getByText(/únete.*peña/i)).toBeVisible();

    // Navigate to Contact page (Contacto)
    await page.getByRole('link', { name: /contacto/i }).click();
    await expect(page.url()).toContain('/contacto');
    await expect(page.getByText(/ponte en contacto/i)).toBeVisible();
  });

  test('should have working logo link to home', async ({ page }) => {
    // Start from a different page
    await page.goto('/nosotros');

    // Click on logo to go home
    await page.getByRole('link', { name: /betis/i }).first().click();
    await expect(page.url()).toMatch(/\/$|\/$/);
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

    // Active navigation item should have active styling
    const activeLink = page.getByRole('link', { name: /nosotros/i });
    await expect(activeLink).toHaveClass(/active|current/);
  });

  test('should handle 404 pages gracefully', async ({ page }) => {
    // Navigate to non-existent page
    const response = await page.goto('/non-existent-page');
    expect(response?.status()).toBe(404);

    // Should show 404 page
    await expect(page.getByText(/404|not found|página no encontrada/i)).toBeVisible();
    
    // Should have link back to home
    await expect(page.getByRole('link', { name: /inicio|home|volver/i })).toBeVisible();
  });

  test('should have accessible navigation', async ({ page }) => {
    await page.goto('/');

    // Navigation should have proper ARIA labels
    const nav = page.getByRole('navigation');
    await expect(nav).toBeVisible();

    // Links should be keyboard accessible
    await page.keyboard.press('Tab');
    const firstLink = page.getByRole('link').first();
    await expect(firstLink).toBeFocused();
  });

  test('should preserve navigation state during navigation', async ({ page }) => {
    await page.goto('/');

    // Navigation should remain visible and functional on all pages
    const navigationLinks = ['/nosotros', '/partidos', '/clasificacion', '/contacto'];

    for (const link of navigationLinks) {
      await page.goto(link);
      
      // Navigation should still be present and functional
      await expect(page.getByRole('navigation')).toBeVisible();
      await expect(page.getByRole('link', { name: /inicio|home/i })).toBeVisible();
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