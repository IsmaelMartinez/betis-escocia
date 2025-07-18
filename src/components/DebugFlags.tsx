'use client';

import { useState, useEffect } from 'react';
import { getAllFeatureFlags, useFeatureFlag } from '@/lib/flags';

export default function DebugFlags() {
  const [isClient, setIsClient] = useState(false);
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [showRsvp, setShowRsvp] = useState(false);
  
  useEffect(() => {
    // Only run on client side to avoid hydration mismatches
    setIsClient(true);
    setFlags(getAllFeatureFlags());
    setShowRsvp(useFeatureFlag('show-rsvp'));
  }, []);
  
  if (process.env.NODE_ENV !== 'development' || !isClient) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded shadow-lg text-xs max-w-sm z-50">
      <h3 className="font-bold mb-2">Feature Flags Debug</h3>
      <div className="space-y-1">
        <div className="text-gray-400 mb-2">Environment Variable Flags:</div>
        {Object.entries(flags).map(([flag, enabled]) => (
          <div key={flag} className="flex justify-between">
            <span className="truncate">{flag}:</span>
            <span className={enabled ? 'text-green-400' : 'text-red-400'}>
              {enabled ? 'ON' : 'OFF'}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-2 pt-2 border-t border-gray-600">
        <div className="text-gray-400">
          Test: useFeatureFlag('show-rsvp') = {showRsvp ? 'true' : 'false'}
        </div>
        <div className="text-gray-400">
          Source: Environment Variables
        </div>
      </div>
    </div>
  );
}
