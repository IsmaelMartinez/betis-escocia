import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';

// Mock Clerk before any other imports
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(() => ({
    userId: null,
    getToken: vi.fn(() => Promise.resolve(null)),
  })),
  currentUser: vi.fn(() => Promise.resolve(null)),
  createClerkClient: vi.fn(() => ({
    users: {
      getUser: vi.fn(),
      getUserList: vi.fn(),
      updateUserMetadata: vi.fn(),
    },
  })),
}));

import { auth, currentUser } from '@clerk/nextjs/server';

const mockAuth = vi.mocked(auth);
const mockCurrentUser = vi.mocked(currentUser);

describe('Clerk Authentication Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
        getToken: vi.fn(() => Promise.resolve('mock_token')),
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