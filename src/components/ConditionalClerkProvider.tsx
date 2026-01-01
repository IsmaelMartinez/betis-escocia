"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { ReactNode } from "react";

interface ConditionalClerkProviderProps {
  children: ReactNode;
}

/**
 * Wraps children with ClerkProvider only if the publishable key is available.
 * This prevents build failures when Clerk env vars aren't set (e.g., in CI without secrets).
 */
export default function ConditionalClerkProvider({
  children,
}: ConditionalClerkProviderProps) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  // If no Clerk key is available, render children without Clerk
  if (!publishableKey) {
    return <>{children}</>;
  }

  return (
    <ClerkProvider
      publishableKey={publishableKey}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      signInFallbackRedirectUrl="/dashboard"
      afterSignUpUrl="/dashboard"
    >
      {children}
    </ClerkProvider>
  );
}
