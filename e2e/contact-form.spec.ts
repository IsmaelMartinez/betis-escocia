import { test, expect } from '@playwright/test';

test.describe('Contact Form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contacto');
  });

  test('should display contact form with all required fields', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Contacto', exact: true })).toBeVisible();
    await expect(page.getByLabel(/nombre completo/i)).toBeVisible();
    await expect(page.getByLabel('Email *')).toBeVisible();
    await expect(page.getByLabel('Asunto *')).toBeVisible();
    await expect(page.getByLabel('Mensaje *')).toBeVisible();
    await expect(page.getByRole('button', { name: /enviar mensaje/i })).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    // Try to submit without filling required fields
    await page.getByRole('button', { name: /enviar mensaje/i }).click();

    // Browser validation will prevent submission, so check that form inputs are required
    await expect(page.getByLabel(/nombre completo/i)).toHaveAttribute('required');
    await expect(page.getByLabel('Email *')).toHaveAttribute('required');
    await expect(page.getByLabel('Asunto *')).toHaveAttribute('required');
    await expect(page.getByLabel('Mensaje *')).toHaveAttribute('required');
  });

  test('should validate email format', async ({ page }) => {
    await page.getByLabel('Email *').fill('invalid-email');
    await page.getByLabel(/nombre completo/i).fill('Test User'); // Fill other required fields
    await page.getByLabel('Asunto *').fill('Test Subject');
    await page.getByLabel('Mensaje *').fill('Test message');
    
    await page.getByRole('button', { name: /enviar mensaje/i }).click();

    // Browser will show validation message for invalid email
    const emailInput = page.getByLabel('Email *');
    await expect(emailInput).toHaveAttribute('type', 'email');
  });

  test('should successfully submit contact form', async ({ page }) => {
    // Fill out the form
    await page.getByLabel(/nombre completo/i).fill('Juan Pérez');
    await page.getByLabel('Email *').fill('juan@example.com');
    await page.getByLabel('Asunto *').fill('Consulta sobre membresía');
    await page.getByLabel('Mensaje *').fill('Hola, me gustaría saber más sobre la peña bética en Edimburgo.');

    // Submit the form
    await page.getByRole('button', { name: /enviar mensaje/i }).click();

    // Should show success message
    await expect(page.getByText(/mensaje enviado/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/te responderemos pronto/i)).toBeVisible();
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
    await page.getByLabel(/nombre completo/i).fill('Test User');
    await page.getByLabel('Email *').fill('test@example.com');
    await page.getByLabel('Asunto *').fill('Test Subject');
    await page.getByLabel('Mensaje *').fill('Test message');
    
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
    await page.getByLabel(/nombre completo/i).fill('Test User');
    await page.getByLabel('Email *').fill('test@example.com');
    await page.getByLabel('Asunto *').fill('Test Subject');
    await page.getByLabel('Mensaje *').fill('Test message');
    
    await page.getByRole('button', { name: /enviar mensaje/i }).click();

    // Should show loading state
    await expect(page.getByText(/enviando mensaje/i)).toBeVisible();
    
    // Button should be disabled during loading (check via attribute since the text changes)
    await expect(page.getByTestId('submit-contact')).toBeDisabled();
  });

  test('should reset form after successful submission', async ({ page }) => {
    // Fill and submit form
    await page.getByLabel(/nombre completo/i).fill('Test User');
    await page.getByLabel('Email *').fill('test@example.com');
    await page.getByLabel('Asunto *').fill('Test Subject');
    await page.getByLabel('Mensaje *').fill('Test message');
    
    await page.getByRole('button', { name: /enviar mensaje/i }).click();

    // Wait for success message
    await expect(page.getByText(/mensaje enviado/i)).toBeVisible({ timeout: 10000 });

    // Only some form fields are cleared (not name/email as they may be pre-populated)
    await expect(page.getByLabel('Asunto *')).toHaveValue('');
    await expect(page.getByLabel('Mensaje *')).toHaveValue('');
    // Name and email are kept for user convenience
  });

  test('should be accessible with keyboard navigation', async ({ page }) => {
    // Start from the contact form section
    const nameInput = page.getByLabel(/nombre completo/i);
    await nameInput.focus();
    await expect(nameInput).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.getByLabel('Email *')).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.getByLabel(/teléfono/i)).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.getByLabel('Asunto *')).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.getByLabel('Mensaje *')).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: /enviar mensaje/i })).toBeFocused();
  });
});