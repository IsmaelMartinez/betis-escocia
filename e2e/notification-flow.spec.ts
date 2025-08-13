import { test, expect } from '@playwright/test';
import { mockFlagsmithAPI } from './helpers/flagsmith-mock';

test.describe('Notification Flow E2E', () => {
  test.beforeEach(async ({ page, context }) => {
    // Grant notification permissions for tests
    await context.grantPermissions(['notifications']);
    
    // Mock Flagsmith to enable required features
    await mockFlagsmithAPI(page, {
      'show-admin': true,
      'show-clerk-auth': true,
    });
  });

  test.describe('Anonymous User', () => {
    test('should be able to submit RSVP without notifications', async ({ page }) => {
      await page.goto('/');

      // Fill out RSVP form
      await page.fill('[data-testid="name-input"]', 'John Doe');
      await page.fill('[data-testid="email-input"]', 'john@example.com');
      await page.selectOption('[data-testid="match-select"]', { index: 1 });
      await page.check('[data-testid="attending-yes"]');

      // Submit RSVP
      await page.click('[data-testid="submit-rsvp"]');

      // Should see success message
      await expect(page.getByText('RSVP enviado correctamente')).toBeVisible({ timeout: 10000 });
      
      // Should not see any notification-related UI for anonymous users
      await expect(page.getByTestId('notification-panel')).not.toBeVisible();
    });

    test('should be able to submit contact form without notifications', async ({ page }) => {
      await page.goto('/contacto');

      // Fill out contact form
      await page.fill('[data-testid="contact-name"]', 'Jane Smith');
      await page.fill('[data-testid="contact-email"]', 'jane@example.com');
      await page.fill('[data-testid="contact-message"]', 'Hello from the test suite!');

      // Submit contact form
      await page.click('[data-testid="submit-contact"]');

      // Should see success message
      await expect(page.getByText('Mensaje enviado correctamente')).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Admin User - Notification Management', () => {
    test.use({ storageState: 'playwright/.clerk/user.json' });

    test('should access notification settings in admin dashboard', async ({ page }) => {
      await page.goto('/admin');

      // Should see admin dashboard
      await expect(page.getByRole('heading', { name: 'Admin Dashboard' })).toBeVisible();

      // Should see notification panel
      await expect(page.getByTestId('notification-panel')).toBeVisible();
      await expect(page.getByText('Notificaciones Push')).toBeVisible();
      await expect(page.getByText('Recibe notificaciones instantáneas cuando hay nuevos RSVPs o mensajes de contacto.')).toBeVisible();
    });

    test('should enable notifications step by step', async ({ page }) => {
      await page.goto('/admin');

      // Wait for notification panel to load
      await expect(page.getByTestId('notification-panel')).toBeVisible();

      // Check initial state - should show option to activate
      const permissionStatus = page.getByTestId('permission-status');
      await expect(permissionStatus).toBeVisible();

      // Look for activation button (text may vary based on current state)
      const activateButton = page.getByRole('button', { name: /Activar|Suscribirse/i });
      
      if (await activateButton.isVisible()) {
        // Click to enable notifications
        await activateButton.click();

        // Should show loading state
        await expect(page.getByText('Procesando...')).toBeVisible();

        // Wait for the process to complete
        await expect(page.getByText('Procesando...')).not.toBeVisible({ timeout: 10000 });

        // After enabling, should see subscription controls
        await expect(page.getByTestId('subscription-status')).toBeVisible({ timeout: 5000 });
        await expect(page.getByText('Recibir notificaciones:')).toBeVisible();
      }
    });

    test('should send test notification when enabled', async ({ page }) => {
      await page.goto('/admin');

      // Wait for notification panel to load
      await expect(page.getByTestId('notification-panel')).toBeVisible();

      // Check if test notification button is available
      const testButton = page.getByRole('button', { name: /Probar Notificación/i });
      
      if (await testButton.isVisible()) {
        // Click test notification button
        await testButton.click();

        // Should show loading state
        await expect(page.getByText('Procesando...')).toBeVisible();

        // Should show success message
        await expect(page.getByText('¡Notificación de prueba enviada! Revisa tu navegador.')).toBeVisible({ timeout: 10000 });
        
        // Button should change to "Enviada!"
        await expect(page.getByRole('button', { name: /Enviada!/i })).toBeVisible();

        // Success message should disappear after a few seconds
        await expect(page.getByText('¡Notificación de prueba enviada! Revisa tu navegador.')).not.toBeVisible({ timeout: 5000 });
      }
    });

    test('should toggle notification preferences', async ({ page }) => {
      await page.goto('/admin');

      // Wait for notification panel to load
      await expect(page.getByTestId('notification-panel')).toBeVisible();

      // Look for subscription status section
      const subscriptionStatus = page.getByTestId('subscription-status');
      
      if (await subscriptionStatus.isVisible()) {
        // Find the toggle button (could be "Activar" or "Desactivar")
        const toggleButton = subscriptionStatus.getByRole('button', { name: /Activar|Desactivar/i });
        
        if (await toggleButton.isVisible()) {
          const initialButtonText = await toggleButton.textContent();
          
          // Click to toggle
          await toggleButton.click();

          // Should show loading state
          await expect(page.getByText('Procesando...')).toBeVisible();
          await expect(page.getByText('Procesando...')).not.toBeVisible({ timeout: 10000 });

          // Button text should change
          await expect(toggleButton).not.toHaveText(initialButtonText || '');
        }
      }
    });

    test('should display appropriate help text based on notification state', async ({ page }) => {
      await page.goto('/admin');

      // Wait for notification panel to load
      await expect(page.getByTestId('notification-panel')).toBeVisible();

      // Check for help text - could be active or inactive state
      const activeHelpText = page.getByText('✅ Recibirás notificaciones para:');
      const inactiveHelpText = page.getByText('ℹ️ Las notificaciones están configuradas pero desactivadas');
      
      // Should show either active or inactive help text
      const hasActiveHelp = await activeHelpText.isVisible();
      const hasInactiveHelp = await inactiveHelpText.isVisible();
      
      expect(hasActiveHelp || hasInactiveHelp).toBe(true);

      if (hasActiveHelp) {
        // Should show what notifications are available
        await expect(page.getByText('• Nuevas confirmaciones de asistencia (RSVPs)')).toBeVisible();
        await expect(page.getByText('• Nuevos mensajes de contacto')).toBeVisible();
      }
    });
  });

  test.describe('Notification Triggers', () => {
    test.use({ storageState: 'playwright/.clerk/user.json' });

    test('should handle RSVP submission with admin notification', async ({ page, context }) => {
      // Open admin page in a new tab to monitor notifications
      const adminPage = await context.newPage();
      await adminPage.goto('/admin');
      
      // Ensure admin has notifications enabled (if possible)
      await expect(adminPage.getByTestId('notification-panel')).toBeVisible();

      // Go to main page for RSVP submission
      await page.goto('/');

      // Fill and submit RSVP as anonymous user
      await page.fill('[data-testid="name-input"]', 'Test User');
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.selectOption('[data-testid="match-select"]', { index: 1 });
      await page.check('[data-testid="attending-yes"]');

      // Submit RSVP
      await page.click('[data-testid="submit-rsvp"]');

      // Should see success message
      await expect(page.getByText('RSVP enviado correctamente')).toBeVisible({ timeout: 10000 });

      // Admin page should potentially receive notification (if enabled)
      // Note: Actual browser notification testing is limited in Playwright,
      // but we can verify the admin panel functionality is working
      await expect(adminPage.getByTestId('notification-panel')).toBeVisible();

      await adminPage.close();
    });

    test('should handle contact form submission with admin notification', async ({ page, context }) => {
      // Open admin page in a new tab to monitor notifications
      const adminPage = await context.newPage();
      await adminPage.goto('/admin');
      
      // Ensure admin page loads properly
      await expect(adminPage.getByTestId('notification-panel')).toBeVisible();

      // Go to contact page for form submission
      await page.goto('/contacto');

      // Fill and submit contact form
      await page.fill('[data-testid="contact-name"]', 'Test Contact');
      await page.fill('[data-testid="contact-email"]', 'contact@example.com');
      await page.fill('[data-testid="contact-message"]', 'This is a test message for notifications.');

      // Submit contact form
      await page.click('[data-testid="submit-contact"]');

      // Should see success message
      await expect(page.getByText('Mensaje enviado correctamente')).toBeVisible({ timeout: 10000 });

      // Admin page should potentially receive notification (if enabled)
      await expect(adminPage.getByTestId('notification-panel')).toBeVisible();

      await adminPage.close();
    });
  });

  test.describe('Browser Compatibility', () => {
    test.use({ storageState: 'playwright/.clerk/user.json' });

    test('should handle unsupported browsers gracefully', async ({ page }) => {
      // Mock unsupported browser by removing Notification API
      await page.addInitScript(() => {
        // @ts-ignore
        delete window.Notification;
        // @ts-ignore  
        delete navigator.serviceWorker;
      });

      await page.goto('/admin');

      // Should still show notification panel
      await expect(page.getByTestId('notification-panel')).toBeVisible();

      // Should show browser compatibility message
      await expect(page.getByTestId('browser-compatibility')).toBeVisible();
      await expect(page.getByText('Tu navegador no es compatible con las notificaciones push.')).toBeVisible();
      await expect(page.getByText('Prueba con Chrome, Firefox, Safari o Edge para recibir notificaciones.')).toBeVisible();
    });

    test('should handle permission denied state', async ({ page, context }) => {
      // Deny notification permissions
      await context.grantPermissions([]);

      await page.goto('/admin');

      // Wait for notification panel to load
      await expect(page.getByTestId('notification-panel')).toBeVisible();

      // Should show instructions for enabling notifications in browser
      const deniedState = page.getByText('Las notificaciones están bloqueadas.');
      if (await deniedState.isVisible()) {
        await expect(page.getByText('Puedes habilitarlas en la configuración del navegador')).toBeVisible();
      }
    });
  });

  test.describe('Error Handling', () => {
    test.use({ storageState: 'playwright/.clerk/user.json' });

    test('should handle API errors gracefully', async ({ page }) => {
      // Mock API failure
      await page.route('/api/notifications/preferences', route => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal server error' })
        });
      });

      await page.goto('/admin');

      // Should still show notification panel
      await expect(page.getByTestId('notification-panel')).toBeVisible();

      // Should handle the error gracefully without crashing
      await expect(page.getByText('Notificaciones Push')).toBeVisible();
    });

    test('should handle network failures gracefully', async ({ page }) => {
      await page.goto('/admin');

      // Wait for initial load
      await expect(page.getByTestId('notification-panel')).toBeVisible();

      // Mock network failure for subsequent requests
      await page.route('/api/notifications/**', route => {
        route.abort('failed');
      });

      // Try to interact with notifications (if button is available)
      const activateButton = page.getByRole('button', { name: /Activar|Probar/i });
      
      if (await activateButton.first().isVisible()) {
        await activateButton.first().click();

        // Should show error message
        await expect(page.getByText(/Error|error/i)).toBeVisible({ timeout: 10000 });
      }
    });
  });

  test.describe('Responsive Design', () => {
    test.use({ storageState: 'playwright/.clerk/user.json' });

    test('should work correctly on mobile devices', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      await page.goto('/admin');

      // Should show notification panel on mobile
      await expect(page.getByTestId('notification-panel')).toBeVisible();
      await expect(page.getByText('Notificaciones Push')).toBeVisible();

      // Panel should be properly sized for mobile
      const panel = page.getByTestId('notification-panel');
      const boundingBox = await panel.boundingBox();
      
      expect(boundingBox?.width).toBeLessThanOrEqual(375); // Should fit in mobile viewport
    });

    test('should work correctly on tablet devices', async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });

      await page.goto('/admin');

      // Should show notification panel on tablet
      await expect(page.getByTestId('notification-panel')).toBeVisible();
      await expect(page.getByText('Notificaciones Push')).toBeVisible();
    });
  });
});