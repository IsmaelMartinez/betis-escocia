import { test, expect } from '@playwright/test';

test.describe('Contact Form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contacto');
  });

  test('should display contact form with all required fields', async ({ page }) => {
    await expect(page.getByText('Contacto')).toBeVisible();
    await expect(page.getByLabel(/nombre/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/asunto/i)).toBeVisible();
    await expect(page.getByLabel(/mensaje/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /enviar mensaje/i })).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    // Try to submit without filling required fields
    await page.getByRole('button', { name: /enviar mensaje/i }).click();

    // Should show validation errors
    await expect(page.getByText(/nombre.*requerido/i)).toBeVisible();
    await expect(page.getByText(/email.*requerido/i)).toBeVisible();
    await expect(page.getByText(/asunto.*requerido/i)).toBeVisible();
    await expect(page.getByText(/mensaje.*requerido/i)).toBeVisible();
  });

  test('should validate email format', async ({ page }) => {
    await page.getByLabel(/email/i).fill('invalid-email');
    await page.getByLabel(/nombre/i).fill('Test User'); // Fill other required fields
    await page.getByLabel(/asunto/i).fill('Test Subject');
    await page.getByLabel(/mensaje/i).fill('Test message');
    
    await page.getByRole('button', { name: /enviar mensaje/i }).click();

    await expect(page.getByText(/email.*válido/i)).toBeVisible();
  });

  test('should successfully submit contact form', async ({ page }) => {
    // Fill out the form
    await page.getByLabel(/nombre/i).fill('Juan Pérez');
    await page.getByLabel(/email/i).fill('juan@example.com');
    await page.getByLabel(/asunto/i).fill('Consulta sobre membresía');
    await page.getByLabel(/mensaje/i).fill('Hola, me gustaría saber más sobre la peña bética en Edimburgo.');

    // Submit the form
    await page.getByRole('button', { name: /enviar mensaje/i }).click();

    // Should show success message
    await expect(page.getByText(/mensaje enviado/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/te contactaremos/i)).toBeVisible();
  });

  test('should handle form submission errors gracefully', async ({ page }) => {
    // Mock API to return error
    await page.route('/api/contact', (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ success: false, error: 'Server error' })
      });
    });

    // Fill and submit form
    await page.getByLabel(/nombre/i).fill('Test User');
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/asunto/i).fill('Test Subject');
    await page.getByLabel(/mensaje/i).fill('Test message');
    
    await page.getByRole('button', { name: /enviar mensaje/i }).click();

    // Should show error message
    await expect(page.getByText(/error.*enviar/i)).toBeVisible({ timeout: 10000 });
  });

  test('should show loading state during submission', async ({ page }) => {
    // Delay the API response
    await page.route('/api/contact', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true })
      });
    });

    // Fill and submit form
    await page.getByLabel(/nombre/i).fill('Test User');
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/asunto/i).fill('Test Subject');
    await page.getByLabel(/mensaje/i).fill('Test message');
    
    await page.getByRole('button', { name: /enviar mensaje/i }).click();

    // Should show loading state
    await expect(page.getByText(/enviando/i)).toBeVisible();
    
    // Button should be disabled during loading
    await expect(page.getByRole('button', { name: /enviar mensaje/i })).toBeDisabled();
  });

  test('should reset form after successful submission', async ({ page }) => {
    // Fill and submit form
    await page.getByLabel(/nombre/i).fill('Test User');
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/asunto/i).fill('Test Subject');
    await page.getByLabel(/mensaje/i).fill('Test message');
    
    await page.getByRole('button', { name: /enviar mensaje/i }).click();

    // Wait for success message
    await expect(page.getByText(/mensaje enviado/i)).toBeVisible({ timeout: 10000 });

    // Form fields should be cleared
    await expect(page.getByLabel(/nombre/i)).toHaveValue('');
    await expect(page.getByLabel(/email/i)).toHaveValue('');
    await expect(page.getByLabel(/asunto/i)).toHaveValue('');
    await expect(page.getByLabel(/mensaje/i)).toHaveValue('');
  });

  test('should be accessible with keyboard navigation', async ({ page }) => {
    // Tab through form elements
    await page.keyboard.press('Tab');
    await expect(page.getByLabel(/nombre/i)).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.getByLabel(/email/i)).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.getByLabel(/asunto/i)).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.getByLabel(/mensaje/i)).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: /enviar mensaje/i })).toBeFocused();
  });
});