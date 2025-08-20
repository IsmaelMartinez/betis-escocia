import { test, expect } from '@playwright/test';

test.describe('Merchandise Ordering', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to merchandise page (assuming it exists)
    await page.goto('/coleccionables');
  });

  test('should display merchandise catalog', async ({ page }) => {
    await expect(page.getByText(/coleccionables/i)).toBeVisible();
    
    // Should show merchandise items
    await expect(page.locator('[data-testid*="merchandise-item"]').first()).toBeVisible();
  });

  test('should open order form when clicking on merchandise item', async ({ page }) => {
    // Click on first merchandise item
    const firstItem = page.locator('[data-testid*="merchandise-item"]').first();
    await firstItem.click();

    // Should open order modal/form
    await expect(page.getByText(/hacer pedido/i)).toBeVisible();
    await expect(page.getByText(/pre-pedido/i)).toBeVisible();
  });

  test('should complete merchandise order flow', async ({ page }) => {
    // Click on a merchandise item to open order form
    const merchandiseItem = page.locator('[data-testid*="merchandise-item"]').first();
    await merchandiseItem.click();

    // Wait for order form to appear
    await expect(page.getByLabel(/nombre completo/i)).toBeVisible();

    // Fill out order form
    await page.getByLabel(/nombre completo/i).fill('María García');
    await page.getByLabel(/email/i).fill('maria@example.com');
    await page.getByLabel(/teléfono/i).fill('+34 123 456 789');

    // Select quantity
    await page.getByLabel(/cantidad/i).selectOption('2');

    // Select size if available (for clothing items)
    const sizeSelect = page.getByLabel(/talla/i);
    if (await sizeSelect.isVisible()) {
      await sizeSelect.selectOption('M');
    }

    // Select contact method
    await page.getByLabel(/método de contacto/i).selectOption('whatsapp');

    // Add optional message
    await page.getByLabel(/mensaje adicional/i).fill('Por favor, confirmar disponibilidad antes del envío.');

    // Submit order
    await page.getByRole('button', { name: /enviar pedido/i }).click();

    // Should show success message
    await expect(page.getByText(/pedido enviado/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/te contactaremos/i)).toBeVisible();
  });

  test('should validate order form fields', async ({ page }) => {
    // Open order form
    const merchandiseItem = page.locator('[data-testid*="merchandise-item"]').first();
    await merchandiseItem.click();

    // Try to submit without required fields
    await page.getByRole('button', { name: /enviar pedido/i }).click();

    // Should show validation errors
    await expect(page.getByText(/nombre.*requerido/i)).toBeVisible();
    await expect(page.getByText(/email.*requerido/i)).toBeVisible();
    await expect(page.getByText(/teléfono.*requerido/i)).toBeVisible();
  });

  test('should calculate total price correctly', async ({ page }) => {
    // Open order form
    const merchandiseItem = page.locator('[data-testid*="merchandise-item"]').first();
    await merchandiseItem.click();

    // Wait for form to load and check initial price
    await expect(page.getByLabel(/cantidad/i)).toBeVisible();
    
    // Change quantity and verify total updates
    await page.getByLabel(/cantidad/i).selectOption('3');

    // Total should be updated (assuming €25 per item)
    await expect(page.getByText(/€75\.00/)).toBeVisible();
  });

  test('should handle pre-orders differently than regular orders', async ({ page }) => {
    // Mock an out-of-stock item
    await page.route('/api/merchandise', (route) => {
      const merchandise = [
        {
          id: 'test-item',
          name: 'Camiseta Betis',
          price: 25,
          isInStock: false
        }
      ];
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: merchandise })
      });
    });

    await page.reload();

    // Click on out-of-stock item
    const outOfStockItem = page.locator('[data-testid*="merchandise-item"]').first();
    await outOfStockItem.click();

    // Should show pre-order form
    await expect(page.getByText(/pre-pedido/i)).toBeVisible();
    await expect(page.getByText(/te contactaremos cuando esté disponible/i)).toBeVisible();

    // Button text should indicate pre-order
    await expect(page.getByRole('button', { name: /enviar pre-pedido/i })).toBeVisible();
  });

  test('should close order form when clicking close button', async ({ page }) => {
    // Open order form
    const merchandiseItem = page.locator('[data-testid*="merchandise-item"]').first();
    await merchandiseItem.click();

    // Wait for form to appear
    await expect(page.getByLabel(/nombre completo/i)).toBeVisible();

    // Close the form
    await page.getByText('×').click();

    // Form should be closed
    await expect(page.getByLabel(/nombre completo/i)).not.toBeVisible();
  });

  test('should show stock indicator for items', async ({ page }) => {
    // Should show stock status indicators
    const stockIndicators = page.locator('[data-testid*="stock-indicator"]');
    await expect(stockIndicators.first()).toBeVisible();
  });

  test('should filter merchandise by category', async ({ page }) => {
    // Look for category filters (if they exist)
    const categoryFilter = page.getByLabel(/categoría/i);
    
    if (await categoryFilter.isVisible()) {
      // Select a specific category
      await categoryFilter.selectOption('camisetas');

      // Should filter the displayed items
      await expect(page.getByText(/camiseta/i)).toBeVisible();
    }
  });

  test('should handle order submission errors', async ({ page }) => {
    // Mock API error
    await page.route('/api/orders', (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ success: false, error: 'Order processing failed' })
      });
    });

    // Open and fill order form
    const merchandiseItem = page.locator('[data-testid*="merchandise-item"]').first();
    await merchandiseItem.click();

    await page.getByLabel(/nombre completo/i).fill('Test User');
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/teléfono/i).fill('123456789');

    // Submit order
    await page.getByRole('button', { name: /enviar pedido/i }).click();

    // Should show error message
    await expect(page.getByText(/error.*enviar.*pedido/i)).toBeVisible({ timeout: 10000 });
  });
});