'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect } from 'react';
import * as Sentry from "@sentry/nextjs";

export default function SentryUserContext() {
  const { user } = useUser();

  useEffect(() => {
    if (user) {
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
