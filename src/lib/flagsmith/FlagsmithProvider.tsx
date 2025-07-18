"use client";

import { useEffect } from 'react';
import { initializeFeatureFlags } from '@/lib/featureFlags';

export function FlagsmithProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    async function init() {
      await initializeFeatureFlags();
    }
    init();
  }, []);

  return <>{children}</>;
}
