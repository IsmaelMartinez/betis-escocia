import { jest } from '@jest/globals';

export const auth = jest.fn(() => ({
  userId: 'mock_user_id',
  sessionId: 'mock_session_id',
  getToken: jest.fn(() => Promise.resolve('mock_token')),
}));

export const currentUser = jest.fn(() => Promise.resolve({
  id: 'mock_user_id',
  emailAddresses: [{ emailAddress: 'mock@example.com' }],
  firstName: 'Mock',
  lastName: 'User',
  publicMetadata: { role: 'admin' }, // Default to admin for admin API tests
  imageUrl: 'https://example.com/mock.jpg',
}));
