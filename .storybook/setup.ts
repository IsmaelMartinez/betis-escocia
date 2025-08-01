import { jest } from '@storybook/jest';

jest.mock('@clerk/nextjs', () => ({
  useAuth: () => ({
    getToken: jest.fn(() => Promise.resolve('mock-token')),
  }),
  useUser: () => ({
    isLoaded: true,
    user: {
      id: 'user_123',
      firstName: 'John',
      lastName: 'Doe',
      emailAddresses: [{ emailAddress: 'john.doe@example.com' }],
      createdAt: Date.now(),
      lastSignInAt: Date.now(),
    },
  }),
  UserProfile: () => '<div>Mock UserProfile Component</div>', // Mock UserProfile
}));
