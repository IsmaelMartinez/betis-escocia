"use client";

/**
 * Safe Clerk hooks that work even when Clerk isn't configured.
 * Returns null/empty states when NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is not set.
 */

// Check if Clerk is configured at module level
const isClerkConfigured = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

// Types for the user object (simplified version of Clerk's User type)
interface ClerkUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  fullName: string | null;
  username: string | null;
  emailAddresses: Array<{ emailAddress: string }>;
  publicMetadata: Record<string, unknown>;
}

interface UseUserResult {
  user: ClerkUser | null | undefined;
  isLoaded: boolean;
  isSignedIn: boolean | undefined;
}

interface UseClerkResult {
  signOut: () => Promise<void>;
  openSignIn: () => void;
  openSignUp: () => void;
}

interface UseAuthResult {
  isLoaded: boolean;
  isSignedIn: boolean | undefined;
  userId: string | null | undefined;
  getToken: (options?: { template?: string }) => Promise<string | null>;
}

// Default implementations when Clerk isn't configured
const defaultUseUser = (): UseUserResult => ({
  user: null,
  isLoaded: true,
  isSignedIn: false,
});

const defaultUseClerk = (): UseClerkResult => ({
  signOut: async () => {},
  openSignIn: () => {},
  openSignUp: () => {},
});

const defaultUseAuth = (): UseAuthResult => ({
  isLoaded: true,
  isSignedIn: false,
  userId: null,
  getToken: async () => null,
});

// Export the actual hooks, conditionally using Clerk or defaults
// eslint-disable-next-line @typescript-eslint/no-require-imports
const clerkModule = isClerkConfigured ? require("@clerk/nextjs") : null;

export const useUserSafe: () => UseUserResult = isClerkConfigured
  ? clerkModule.useUser
  : defaultUseUser;

export const useClerkSafe: () => UseClerkResult = isClerkConfigured
  ? clerkModule.useClerk
  : defaultUseClerk;

export const useAuthSafe: () => UseAuthResult = isClerkConfigured
  ? clerkModule.useAuth
  : defaultUseAuth;

export { isClerkConfigured };
