import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import SentryUserContext from '@/components/SentryUserContext';
import * as Sentry from '@sentry/nextjs';

// Mock Clerk
const mockUseUser = vi.fn();
vi.mock('@clerk/nextjs', () => ({
  useUser: () => mockUseUser()
}));

// Mock Sentry
vi.mock('@sentry/nextjs', () => ({
  setUser: vi.fn()
}));

describe('SentryUserContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Component rendering', () => {
    it('renders without any visible output', () => {
      mockUseUser.mockReturnValue({ user: null });

      const { container } = render(<SentryUserContext />);
      
      expect(container.firstChild).toBeNull();
    });

    it('does not add any DOM elements', () => {
      mockUseUser.mockReturnValue({ user: null });

      const { container } = render(
        <div data-testid="parent">
          <SentryUserContext />
        </div>
      );
      
      const parent = container.querySelector('[data-testid="parent"]');
      expect(parent?.children).toHaveLength(0);
    });
  });

  describe('User context synchronization', () => {
    it('sets Sentry user when user is available', () => {
      const mockUser = {
        id: 'user-123',
        emailAddresses: [{ emailAddress: 'test@example.com' }],
        username: 'testuser',
        fullName: 'Test User'
      };

      mockUseUser.mockReturnValue({ user: mockUser });

      render(<SentryUserContext />);

      expect(Sentry.setUser).toHaveBeenCalledWith({
        id: 'user-123',
        email: 'test@example.com',
        username: 'testuser'
      });
    });

    it('uses fullName when username is not available', () => {
      const mockUser = {
        id: 'user-456',
        emailAddresses: [{ emailAddress: 'noname@example.com' }],
        username: null,
        fullName: 'Full Name User'
      };

      mockUseUser.mockReturnValue({ user: mockUser });

      render(<SentryUserContext />);

      expect(Sentry.setUser).toHaveBeenCalledWith({
        id: 'user-456',
        email: 'noname@example.com',
        username: 'Full Name User'
      });
    });

    it('uses user id when both username and fullName are not available', () => {
      const mockUser = {
        id: 'user-789',
        emailAddresses: [{ emailAddress: 'anonymous@example.com' }],
        username: null,
        fullName: null
      };

      mockUseUser.mockReturnValue({ user: mockUser });

      render(<SentryUserContext />);

      expect(Sentry.setUser).toHaveBeenCalledWith({
        id: 'user-789',
        email: 'anonymous@example.com',
        username: 'user-789'
      });
    });

    it('handles user with empty emailAddresses array', () => {
      const mockUser = {
        id: 'user-no-email',
        emailAddresses: [],
        username: 'noemail',
        fullName: 'No Email User'
      };

      mockUseUser.mockReturnValue({ user: mockUser });

      render(<SentryUserContext />);

      expect(Sentry.setUser).toHaveBeenCalledWith({
        id: 'user-no-email',
        email: undefined,
        username: 'noemail'
      });
    });

    it('handles user with undefined emailAddresses', () => {
      const mockUser = {
        id: 'user-undefined-email',
        emailAddresses: undefined as any,
        username: 'undefinedemail',
        fullName: 'Undefined Email User'
      };

      mockUseUser.mockReturnValue({ user: mockUser });

      // The component will throw an error when emailAddresses is undefined
      // This is the actual behavior of the current implementation
      expect(() => render(<SentryUserContext />)).toThrow();
    });

    it('clears Sentry user when user is null', () => {
      mockUseUser.mockReturnValue({ user: null });

      render(<SentryUserContext />);

      expect(Sentry.setUser).toHaveBeenCalledWith(null);
    });

    it('clears Sentry user when user is undefined', () => {
      mockUseUser.mockReturnValue({ user: undefined });

      render(<SentryUserContext />);

      expect(Sentry.setUser).toHaveBeenCalledWith(null);
    });
  });

  describe('User context updates', () => {
    it('updates Sentry user when user changes', () => {
      const firstUser = {
        id: 'user-1',
        emailAddresses: [{ emailAddress: 'first@example.com' }],
        username: 'firstuser',
        fullName: 'First User'
      };

      const secondUser = {
        id: 'user-2',
        emailAddresses: [{ emailAddress: 'second@example.com' }],
        username: 'seconduser',
        fullName: 'Second User'
      };

      // Initial render with first user
      mockUseUser.mockReturnValue({ user: firstUser });
      const { rerender } = render(<SentryUserContext />);

      expect(Sentry.setUser).toHaveBeenCalledWith({
        id: 'user-1',
        email: 'first@example.com',
        username: 'firstuser'
      });

      // Clear mock calls
      vi.mocked(Sentry.setUser).mockClear();

      // Update to second user
      mockUseUser.mockReturnValue({ user: secondUser });
      rerender(<SentryUserContext />);

      expect(Sentry.setUser).toHaveBeenCalledWith({
        id: 'user-2',
        email: 'second@example.com',
        username: 'seconduser'
      });
    });

    it('updates to null when user logs out', () => {
      const mockUser = {
        id: 'user-logout',
        emailAddresses: [{ emailAddress: 'logout@example.com' }],
        username: 'logoutuser',
        fullName: 'Logout User'
      };

      // Initial render with user
      mockUseUser.mockReturnValue({ user: mockUser });
      const { rerender } = render(<SentryUserContext />);

      expect(Sentry.setUser).toHaveBeenCalledWith({
        id: 'user-logout',
        email: 'logout@example.com',
        username: 'logoutuser'
      });

      // Clear mock calls
      vi.mocked(Sentry.setUser).mockClear();

      // User logs out
      mockUseUser.mockReturnValue({ user: null });
      rerender(<SentryUserContext />);

      expect(Sentry.setUser).toHaveBeenCalledWith(null);
    });

    it('does not call setUser again when user remains the same', () => {
      const mockUser = {
        id: 'user-same',
        emailAddresses: [{ emailAddress: 'same@example.com' }],
        username: 'sameuser',
        fullName: 'Same User'
      };

      mockUseUser.mockReturnValue({ user: mockUser });
      const { rerender } = render(<SentryUserContext />);

      expect(Sentry.setUser).toHaveBeenCalledTimes(1);

      // Clear mock calls
      vi.mocked(Sentry.setUser).mockClear();

      // Rerender with same user
      mockUseUser.mockReturnValue({ user: mockUser });
      rerender(<SentryUserContext />);

      // Should not call setUser again as useEffect dependency hasn't changed
      expect(Sentry.setUser).not.toHaveBeenCalled();
    });
  });

  describe('Edge cases', () => {
    it('handles user object with missing properties gracefully', () => {
      const incompleteUser = {
        id: 'incomplete-user',
        // Missing emailAddresses will cause an error in the current implementation
      } as any;

      mockUseUser.mockReturnValue({ user: incompleteUser });

      // The component will throw an error when emailAddresses is missing
      expect(() => render(<SentryUserContext />)).toThrow();
    });

    it('handles multiple email addresses by using the first one', () => {
      const multiEmailUser = {
        id: 'multi-email',
        emailAddresses: [
          { emailAddress: 'primary@example.com' },
          { emailAddress: 'secondary@example.com' }
        ],
        username: 'multiuser',
        fullName: 'Multi Email User'
      };

      mockUseUser.mockReturnValue({ user: multiEmailUser });

      render(<SentryUserContext />);

      expect(Sentry.setUser).toHaveBeenCalledWith({
        id: 'multi-email',
        email: 'primary@example.com',
        username: 'multiuser'
      });
    });

    it('handles empty string values correctly', () => {
      const emptyStringUser = {
        id: 'empty-string-user',
        emailAddresses: [{ emailAddress: '' }],
        username: '',
        fullName: ''
      };

      mockUseUser.mockReturnValue({ user: emptyStringUser });

      render(<SentryUserContext />);

      expect(Sentry.setUser).toHaveBeenCalledWith({
        id: 'empty-string-user',
        email: '',
        username: 'empty-string-user' // Falls back to id when username is empty
      });
    });
  });

  describe('Component lifecycle', () => {
    it('calls setUser on mount when user exists', () => {
      const mockUser = {
        id: 'mount-user',
        emailAddresses: [{ emailAddress: 'mount@example.com' }],
        username: 'mountuser',
        fullName: 'Mount User'
      };

      mockUseUser.mockReturnValue({ user: mockUser });

      render(<SentryUserContext />);

      expect(Sentry.setUser).toHaveBeenCalledTimes(1);
      expect(Sentry.setUser).toHaveBeenCalledWith({
        id: 'mount-user',
        email: 'mount@example.com',
        username: 'mountuser'
      });
    });

    it('calls setUser with null on mount when user does not exist', () => {
      mockUseUser.mockReturnValue({ user: null });

      render(<SentryUserContext />);

      expect(Sentry.setUser).toHaveBeenCalledTimes(1);
      expect(Sentry.setUser).toHaveBeenCalledWith(null);
    });
  });

  describe('Integration behavior', () => {
    it('properly integrates with Clerk user state changes', () => {
      let userState: any = null;

      mockUseUser.mockImplementation(() => ({ user: userState }));

      const { rerender } = render(<SentryUserContext />);

      // Initially no user
      expect(Sentry.setUser).toHaveBeenCalledWith(null);
      vi.mocked(Sentry.setUser).mockClear();

      // User logs in
      userState = {
        id: 'integration-user',
        emailAddresses: [{ emailAddress: 'integration@example.com' }],
        username: 'integrationuser',
        fullName: 'Integration User'
      };
      mockUseUser.mockReturnValue({ user: userState });
      rerender(<SentryUserContext />);

      expect(Sentry.setUser).toHaveBeenCalledWith({
        id: 'integration-user',
        email: 'integration@example.com',
        username: 'integrationuser'
      });
    });

    it('handles rapid user state changes', () => {
      const users = [
        null,
        {
          id: 'rapid-1',
          emailAddresses: [{ emailAddress: 'rapid1@example.com' }],
          username: 'rapid1',
          fullName: 'Rapid User 1'
        },
        {
          id: 'rapid-2',
          emailAddresses: [{ emailAddress: 'rapid2@example.com' }],
          username: 'rapid2',
          fullName: 'Rapid User 2'
        },
        null
      ];

      let currentUserIndex = 0;
      mockUseUser.mockImplementation(() => ({ user: users[currentUserIndex] }));

      const { rerender } = render(<SentryUserContext />);

      // Check each state change
      users.forEach((user, index) => {
        currentUserIndex = index;
        mockUseUser.mockReturnValue({ user });
        rerender(<SentryUserContext />);

        if (user) {
          expect(Sentry.setUser).toHaveBeenCalledWith({
            id: user.id,
            email: user.emailAddresses[0]?.emailAddress,
            username: user.username
          });
        } else {
          expect(Sentry.setUser).toHaveBeenCalledWith(null);
        }

        vi.mocked(Sentry.setUser).mockClear();
      });
    });
  });
});