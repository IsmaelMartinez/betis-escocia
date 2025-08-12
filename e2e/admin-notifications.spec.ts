import { test, expect } from '@playwright/test';
import { mockFlagsmithAPI } from './helpers/flagsmith-mock';

test.describe('Admin Push Notifications', () => {
  test.use({ storageState: 'playwright/.clerk/user.json' });

  test.beforeEach(async ({ page }) => {
    // Mock Flagsmith API to prevent excessive requests
    await mockFlagsmithAPI(page, {
      'admin-push-notifications': true
    });

    // Grant notification permission to avoid permission dialogs during testing
    await page.context().grantPermissions(['notifications']);
  });

  test('should display notification panel for admin users', async ({ page }) => {
    // Navigate to admin page
    const response = await page.goto('/admin');
    expect(response?.status()).toBe(200);

    // Verify admin page loads successfully
    await expect(page.locator('h1', { hasText: 'Panel de Administración' })).toBeVisible();

    // Look for notification panel components
    await expect(page.locator('[data-testid="notification-panel"]')).toBeVisible();
  });

  test('should show browser compatibility status', async ({ page }) => {
    await page.goto('/admin');

    // Check that the notification panel shows browser support status
    const notificationPanel = page.locator('[data-testid="notification-panel"]');
    await expect(notificationPanel).toBeVisible();

    // Should show browser support information
    await expect(notificationPanel.locator('text=Compatibilidad del navegador')).toBeVisible();
  });

  test('should handle notification permission states', async ({ page }) => {
    await page.goto('/admin');

    const notificationPanel = page.locator('[data-testid="notification-panel"]');
    await expect(notificationPanel).toBeVisible();

    // Should have toggle for enabling/disabling notifications
    const enableToggle = notificationPanel.locator('input[type="checkbox"]').first();
    await expect(enableToggle).toBeVisible();

    // Test toggling notification preference
    const initialState = await enableToggle.isChecked();
    await enableToggle.click();
    
    // Wait for API call to complete
    await page.waitForTimeout(1000);
    
    // Verify state changed
    const newState = await enableToggle.isChecked();
    expect(newState).toBe(!initialState);
  });

  test('should allow sending test notifications', async ({ page }) => {
    await page.goto('/admin');

    const notificationPanel = page.locator('[data-testid="notification-panel"]');
    await expect(notificationPanel).toBeVisible();

    // Look for test notification button
    const testButton = notificationPanel.locator('button', { hasText: /Enviar.*[Tt]est/i });
    
    if (await testButton.isVisible()) {
      // Click test notification button
      await testButton.click();

      // Should show success feedback or loading state
      await expect(page.locator('text=Enviando notificación')).toBeVisible({ timeout: 2000 });
    }
  });

  test('should display notification status indicators', async ({ page }) => {
    await page.goto('/admin');

    const notificationPanel = page.locator('[data-testid="notification-panel"]');
    await expect(notificationPanel).toBeVisible();

    // Should show permission status
    await expect(notificationPanel.locator('[data-testid="permission-status"]')).toBeVisible();

    // Should show subscription status
    await expect(notificationPanel.locator('[data-testid="subscription-status"]')).toBeVisible();
  });

  test('should handle notification errors gracefully', async ({ page }) => {
    // Listen for console errors
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/admin');

    const notificationPanel = page.locator('[data-testid="notification-panel"]');
    await expect(notificationPanel).toBeVisible();

    // Wait a moment for any async operations to complete
    await page.waitForTimeout(2000);

    // Check that no critical errors occurred
    const criticalErrors = consoleErrors.filter(error => 
      error.includes('Failed to') || 
      error.includes('Error:') && !error.includes('[PushNotifications]')
    );
    
    expect(criticalErrors).toHaveLength(0);
  });

  test('should persist notification preferences', async ({ page }) => {
    await page.goto('/admin');

    const notificationPanel = page.locator('[data-testid="notification-panel"]');
    await expect(notificationPanel).toBeVisible();

    const enableToggle = notificationPanel.locator('input[type="checkbox"]').first();
    
    // Set a known state
    if (!(await enableToggle.isChecked())) {
      await enableToggle.click();
      await page.waitForTimeout(1000);
    }

    // Reload the page
    await page.reload();
    await expect(notificationPanel).toBeVisible();

    // Verify preference was persisted
    const toggleAfterReload = notificationPanel.locator('input[type="checkbox"]').first();
    await expect(toggleAfterReload).toBeChecked();
  });

  test('should integrate with RSVP workflow', async ({ page }) => {
    // First enable notifications
    await page.goto('/admin');
    const notificationPanel = page.locator('[data-testid="notification-panel"]');
    await expect(notificationPanel).toBeVisible();

    const enableToggle = notificationPanel.locator('input[type="checkbox"]').first();
    if (!(await enableToggle.isChecked())) {
      await enableToggle.click();
      await page.waitForTimeout(1000);
    }

    // Navigate to RSVP page in new tab to simulate user action
    const newPage = await page.context().newPage();
    await newPage.goto('/rsvp');

    // Fill and submit RSVP form
    await newPage.fill('input[name="name"]', 'Test User E2E');
    await newPage.fill('input[name="email"]', 'test.e2e@example.com');
    await newPage.selectOption('select[name="attendees"]', '2');
    
    // Submit form
    await newPage.click('button[type="submit"]');
    
    // Wait for submission to complete
    await newPage.waitForTimeout(2000);

    // Check for success message
    await expect(newPage.locator('text=confirmación recibida')).toBeVisible({ timeout: 5000 });

    await newPage.close();
    
    // Return to admin page and verify it still works
    await page.reload();
    await expect(notificationPanel).toBeVisible();
  });
});

test.describe('Admin Notifications - Feature Integration', () => {
  test.use({ storageState: 'playwright/.clerk/user.json' });

  test.beforeEach(async ({ page }) => {
    // Mock Flagsmith API to prevent excessive requests
    await mockFlagsmithAPI(page, {
      'admin-push-notifications': true
    });
  });

  test('should show notifications are disabled when user preference is off', async ({ page }) => {
    await page.goto('/admin');

    const notificationPanel = page.locator('[data-testid="notification-panel"]');
    await expect(notificationPanel).toBeVisible();

    const enableToggle = notificationPanel.locator('input[type="checkbox"]').first();
    
    // Ensure notifications are disabled
    if (await enableToggle.isChecked()) {
      await enableToggle.click();
      await page.waitForTimeout(1000);
    }

    // Should show disabled state in UI
    await expect(notificationPanel.locator('text=deshabilitadas')).toBeVisible();
  });

  test('should handle browser support detection correctly', async ({ page }) => {
    await page.goto('/admin');

    // Inject debug script to check browser support
    const supportInfo = await page.evaluate(() => {
      return {
        hasServiceWorker: 'serviceWorker' in navigator,
        hasPushManager: 'PushManager' in window,
        hasNotification: 'Notification' in window,
        isSecureContext: window.isSecureContext,
        protocol: window.location.protocol
      };
    });

    console.log('Browser support info:', supportInfo);
    
    // All should be true in test environment
    expect(supportInfo.hasServiceWorker).toBe(true);
    expect(supportInfo.hasPushManager).toBe(true);
    expect(supportInfo.hasNotification).toBe(true);

    // Should not show unsupported browser message
    await expect(page.locator('text=Tu navegador no es compatible')).not.toBeVisible();
  });
});