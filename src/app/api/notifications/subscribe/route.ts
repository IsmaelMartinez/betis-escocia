import { createCrudHandlers } from '@/lib/apiUtils';

/**
 * Legacy API endpoint for push notification subscriptions
 * This route is deprecated and only returns placeholder responses
 * since we've simplified to use browser notifications instead
 */

const legacyResponse = {
  success: true,
  subscribed: false,
  supported: false,
  message: 'Using simplified browser notifications instead'
};

export const { GET, POST, DELETE } = createCrudHandlers({
  auth: 'none',
  handlers: {
    GET: async () => legacyResponse,
    POST: async () => ({ ...legacyResponse, supported: false }),
    DELETE: async () => ({ ...legacyResponse, supported: false })
  }
});