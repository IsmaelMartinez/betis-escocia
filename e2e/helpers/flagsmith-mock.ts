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
    'show-admin': true,
    'show-clerk-auth': true,
    ...customFlags
  };

  const mockResponse = (url: string) => {
    console.log(`[E2E] Mocking Flagsmith API call: ${url}`);
    
    if (url.includes('/flags/') || url.includes('/identities/')) {
      // Mock flags/identities endpoint with feature flags
      const flags = Object.entries(defaultFlags).map(([name, enabled], index) => ({
        id: index + 1,
        feature: { 
          name, 
          type: typeof enabled === 'boolean' ? 'FLAG' : 'CONFIG'
        },
        feature_state_value: typeof enabled === 'string' ? enabled : null,
        enabled: typeof enabled === 'boolean' ? enabled : true,
        environment: { id: 1, name: 'test' },
        identity: null
      }));

      return {
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(flags)
      };
    } else if (url.includes('/environment-document/')) {
      // Mock environment document endpoint
      return {
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          environment: { id: 1, name: 'test' },
          flags: Object.entries(defaultFlags).map(([name, enabled], index) => ({
            id: index + 1,
            feature: { name, type: typeof enabled === 'boolean' ? 'FLAG' : 'CONFIG' },
            feature_state_value: typeof enabled === 'string' ? enabled : null,
            enabled: typeof enabled === 'boolean' ? enabled : true
          }))
        })
      };
    } else {
      // Mock other endpoints with empty success response
      return {
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true })
      };
    }
  };

  // Mock all Flagsmith domains and endpoints
  const flagsmithDomains = [
    '**/api.flagsmith.com/**',
    '**/edge.api.flagsmith.com/**',
    '**flagsmith.com/**'
  ];

  for (const domain of flagsmithDomains) {
    await page.route(domain, async route => {
      const url = route.request().url();
      const response = mockResponse(url);
      await route.fulfill(response);
    });
  }
}