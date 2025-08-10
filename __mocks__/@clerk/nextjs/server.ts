import { vi } from 'vitest';

export const auth = vi.fn(() => ({
  userId: 'mock_user_id',
  sessionId: 'mock_session_id',
  getToken: vi.fn(() => Promise.resolve('mock_token')),
}));

export const currentUser = vi.fn(() => Promise.resolve({
  id: 'mock_user_id',
  emailAddresses: [{ emailAddress: 'mock@example.com' }],
  firstName: 'Mock',
  lastName: 'User',
  publicMetadata: { role: 'admin' }, // Default to admin for admin API tests
  imageUrl: 'https://example.com/mock.jpg',
}));
