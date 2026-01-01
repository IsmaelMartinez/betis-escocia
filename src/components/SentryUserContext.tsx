'use client';

import { useEffect } from 'react';
import * as Sentry from "@sentry/nextjs";
import { useUserSafe, isClerkConfigured } from "@/hooks/useClerkSafe";

/**
 * Sets Sentry user context when Clerk user is available.
 * Safely handles cases where ClerkProvider is not present (e.g., build time or missing credentials).
 */
export default function SentryUserContext() {
  const { user } = useUserSafe();

  useEffect(() => {
    // Only set Sentry user if Clerk is configured and user exists
    if (isClerkConfigured && user) {
      Sentry.setUser({
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress,
        username: user.username || user.fullName || user.id,
      });
    } else {
      Sentry.setUser(null);
    }
  }, [user]);

  return null;
}
