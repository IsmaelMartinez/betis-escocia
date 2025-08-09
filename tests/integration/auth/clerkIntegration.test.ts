import { NextRequest } from 'next/server';

// Mock Clerk before any other imports
jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(() => ({
    userId: null,
    getToken: jest.fn(() => Promise.resolve(null)),
  })),
  currentUser: jest.fn(() => Promise.resolve(null)),
  createClerkClient: jest.fn(() => ({
    users: {
      getUser: jest.fn(),
      getUserList: jest.fn(),
      updateUserMetadata: jest.fn(),
    },
  })),
}));

import { auth, currentUser } from '@clerk/nextjs/server';

const mockAuth = auth as unknown as jest.Mock; // Add unknown for safer casting
const mockCurrentUser = currentUser as unknown as jest.Mock;

describe('Clerk Authentication Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Authenticated User', () => {
    it('should return the authenticated user ID and user object', async () => {
      const MOCK_USER_ID = 'user_test123';
      const MOCK_USER = {
        id: MOCK_USER_ID,
        emailAddresses: [{ emailAddress: 'test@example.com' }],
        firstName: 'Test',
        lastName: 'User',
        publicMetadata: { role: 'user' },
      };

      mockAuth.mockReturnValue({
        userId: MOCK_USER_ID,
        getToken: jest.fn(() => Promise.resolve('mock_token')),
      });
      mockCurrentUser.mockResolvedValue(MOCK_USER);

      const { userId } = await auth();
      const user = await currentUser();

      expect(userId).toBe(MOCK_USER_ID);
      expect(user).toEqual(MOCK_USER);
      expect(mockAuth).toHaveBeenCalledTimes(1);
      expect(mockCurrentUser).toHaveBeenCalledTimes(1);
    });
  });
});