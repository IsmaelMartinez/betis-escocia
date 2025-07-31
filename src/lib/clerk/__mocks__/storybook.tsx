// src/lib/clerk/__mocks__/index.tsx
// This file provides mocks for Clerk hooks for Storybook.

import React from 'react';

// Simplified mock user type to avoid complex interface compatibility issues
interface MockUser {
  id: string;
  firstName: string;
  lastName: string;
  emailAddresses: Array<{ emailAddress: string }>;
  publicMetadata: { role: string };
  createdAt: Date;
  lastSignInAt: Date;
  imageUrl: string;
}

// Simple mock function that mimics jest.fn() behavior
const mockFn = (impl?: any): any => {
  const fn = impl || (() => undefined);
  fn.mockReturnValue = (value: any) => {
    fn._mockReturnValue = value;
    return fn;
  };
  fn.mockImplementation = (newImpl: any) => {
    fn._mockImplementation = newImpl;
    return fn;
  };
  fn.mockReset = () => {
    delete fn._mockReturnValue;
    delete fn._mockImplementation;
    return fn;
  };
  
  const wrappedFn = (...args: any[]) => {
    if (fn._mockReturnValue !== undefined) {
      return fn._mockReturnValue;
    }
    if (fn._mockImplementation) {
      return fn._mockImplementation(...args);
    }
    return fn(...args);
  };
  
  Object.assign(wrappedFn, fn);
  return wrappedFn;
};

// Default mock user data
const DEFAULT_MOCK_USER: MockUser = {
  id: 'user_default_mock',
  firstName: 'Mock',
  lastName: 'User',
  emailAddresses: [{ emailAddress: 'mock.user@example.com' }],
  publicMetadata: { role: 'user' },
  createdAt: new Date(),
  lastSignInAt: new Date(),
  imageUrl: 'https://www.gravatar.com/avatar/?d=mp',
};

// Default mock auth data
const DEFAULT_MOCK_AUTH = {
  userId: DEFAULT_MOCK_USER.id,
  sessionId: 'sess_default_mock',
  getToken: mockFn(() => Promise.resolve('mock_token')),
  signOut: mockFn(() => Promise.resolve()),
};

// Mock for useUser hook
export const useUser = mockFn(() => ({
  isLoaded: true,
  isSignedIn: true,
  user: DEFAULT_MOCK_USER,
}));

// Mock for useAuth hook
export const useAuth = mockFn(() => ({
  isLoaded: true,
  isSignedIn: true,
  ...DEFAULT_MOCK_AUTH,
}));

// Mock for useClerk hook
export const useClerk = mockFn(() => ({
  signOut: mockFn(() => Promise.resolve()),
}));

// Mock for ClerkProvider (does nothing in mock)
export const ClerkProvider = ({ children }: { children: React.ReactNode }) => children;

// Mock for SignedIn/SignedOut components
export const SignedIn = ({ children }: { children: React.ReactNode }) => {
  const { isSignedIn } = useUser();
  return isSignedIn ? children : null;
};

export const SignedOut = ({ children }: { children: React.ReactNode }) => {
  const { isSignedIn } = useUser();
  return !isSignedIn ? children : null;
};

// Mock for SignIn/SignUp components (render a simple message)
export const SignIn = () => <div>Mock SignIn Component</div>;
export const SignUp = () => <div>Mock SignUp Component</div>;

// Helper to set mock user data for stories
export const setMockUser = (user: MockUser | null) => {
  useUser.mockReturnValue({
    isLoaded: true,
    isSignedIn: !!user,
    user: user || undefined,
  });
  useAuth.mockReturnValue({
    isLoaded: true,
    isSignedIn: !!user,
    userId: user?.id || null,
    sessionId: user ? DEFAULT_MOCK_AUTH.sessionId : null,
    getToken: mockFn(() => Promise.resolve(user ? 'mock_token' : null)),
    signOut: mockFn(() => Promise.resolve()),
  });
};

// Helper to reset mocks
export const resetClerkMocks = () => {
  useUser.mockReset();
  useAuth.mockReset();
  useClerk.mockReset();
  setMockUser(DEFAULT_MOCK_USER); // Reset to default mock user
};
