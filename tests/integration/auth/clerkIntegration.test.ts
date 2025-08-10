import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { User } from '@clerk/backend';

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
        emailAddresses: [{ emailAddress: 'test@example.com', id: 'email_test123' }], // Added id to emailAddress
        firstName: 'Test',
        lastName: 'User',
        publicMetadata: { role: 'user' },
        passwordEnabled: false,
        totpEnabled: false,
        backupCodeEnabled: false,
        twoFactorEnabled: false,
        unsafeMetadata: {},
        externalAccounts: [],
        externalId: null,
        hasImage: false,
        imageUrl: '',
        lastSignInAt: null,
        locked: false,
        phoneNumber: null,
        phoneNumbers: [],
        primaryEmailAddressId: 'email_test123', // Set primary email ID
        primaryPhoneNumberId: null,
        primaryWeb3WalletId: null,
        profileImageUrl: '',
        web3Wallets: [],
        createdAt: 0,
        updatedAt: 0,
      } as unknown as User;

      mockAuth.mockReturnValue({
        userId: MOCK_USER_ID,
        sessionId: 'mock_session_id',
        orgId: null,
        orgRole: null,
        orgSlug: null,
        actor: null,
        getToken: vi.fn(() => Promise.resolve('mock_token')),
        has: vi.fn(() => false),
        protect: vi.fn(() => true),
        org: null,
      } as any);
      mockCurrentUser.mockResolvedValue(MOCK_USER);

      const { userId } = await (auth() as any);
      const user = await currentUser();

      expect(userId).toBe(MOCK_USER_ID);
      expect(user).toEqual(MOCK_USER);
      expect(mockAuth).toHaveBeenCalledTimes(1);
      expect(mockCurrentUser).toHaveBeenCalledTimes(1);
    });
  });
});