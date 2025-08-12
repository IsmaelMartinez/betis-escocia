import { Page } from '@playwright/test';

/**
 * Mock Flagsmith API responses to prevent excessive requests during E2E testing
 */
export async function mockFlagsmithAPI(page: Page, customFlags?: Record<string, boolean | string>) {
  const defaultFlags = {
    'show-clasificacion': true,
    'show-partidos': true,
    'show-nosotros': true,
    'show-unete': true,
    'clerk-auth': true,
    'admin-dashboard': true,
    'trivia-game': true,
    'admin-push-notifications': true,
    ...customFlags
  };

  // Mock both edge.api.flagsmith.com and api.flagsmith.com endpoints
  await page.route('**/api.flagsmith.com/**', async route => {
    const url = route.request().url();
    
    if (url.includes('/flags/')) {
      // Mock flags endpoint
      const flags = Object.entries(defaultFlags).map(([name, enabled], index) => ({
        id: index + 1,
        feature: { 
          name, 
          type: typeof enabled === 'boolean' ? 'FLAG' : 'CONFIG'
        },
        feature_state_value: typeof enabled === 'string' ? enabled : null,
        enabled: typeof enabled === 'boolean' ? enabled : true
      }));

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(flags)
      });
    } else {
      // Mock other Flagsmith endpoints with empty success response
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({})
      });
    }
  });

  // Also mock edge.api.flagsmith.com specifically
  await page.route('**/edge.api.flagsmith.com/**', async route => {
    const url = route.request().url();
    
    if (url.includes('/flags/')) {
      const flags = Object.entries(defaultFlags).map(([name, enabled], index) => ({
        id: index + 1,
        feature: { 
          name, 
          type: typeof enabled === 'boolean' ? 'FLAG' : 'CONFIG'
        },
        feature_state_value: typeof enabled === 'string' ? enabled : null,
        enabled: typeof enabled === 'boolean' ? enabled : true
      }));

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(flags)
      });
    } else {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({})
      });
    }
  });
}