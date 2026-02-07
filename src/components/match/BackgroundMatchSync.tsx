'use client';

import { useEffect, useRef } from 'react';
import { log } from '@/lib/logger';

/**
 * BackgroundMatchSync Component
 *
 * Triggers automatic syncing of outdated match data in the background
 * when users visit the site. Uses a cookie-based throttle to avoid
 * excessive API calls.
 *
 * This component:
 * - Runs once per session (tracked via sessionStorage)
 * - Only triggers sync if last sync was more than 1 hour ago (tracked via cookie)
 * - Runs silently without blocking the UI
 */
export default function BackgroundMatchSync() {
  const hasTriggeredSync = useRef(false);

  useEffect(() => {
    // Only run once per session
    if (hasTriggeredSync.current) return;
    hasTriggeredSync.current = true;

    // Check if we should trigger a sync
    const shouldSync = () => {
      try {
        // Check sessionStorage to avoid multiple calls in the same session
        const sessionSync = sessionStorage.getItem('match-sync-triggered');
        if (sessionSync === 'true') {
          return false;
        }

        // Check cookie for last sync time (1 hour throttle)
        const cookieMatch = document.cookie.match(/(?:^|;\s*)last-match-sync=(\d+)/);
        if (cookieMatch) {
          const lastSyncTime = parseInt(cookieMatch[1], 10);
          const oneHourAgo = Date.now() - (60 * 60 * 1000);

          if (lastSyncTime > oneHourAgo) {
            return false;
          }
        }

        return true;
      } catch (error) {
        log.error('Error checking sync conditions', error);
        return false;
      }
    };

    if (!shouldSync()) {
      return;
    }

    // Trigger the sync in the background
    const triggerSync = async () => {
      try {
        // Mark as triggered in session storage
        sessionStorage.setItem('match-sync-triggered', 'true');

        // Set cookie to track last sync time (1 hour expiry)
        const expires = new Date(Date.now() + 60 * 60 * 1000).toUTCString();
        document.cookie = `last-match-sync=${Date.now()}; expires=${expires}; path=/; SameSite=Lax`;

        // Call the sync endpoint
        const response = await fetch('/api/sync-outdated-matches', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          log.warn('Background match sync failed', undefined, {
            status: response.status,
            statusText: response.statusText
          });
          return;
        }

        const result = await response.json();

        if (result.summary?.updated > 0) {
          log.info('Background match sync completed', undefined, {
            updated: result.summary.updated,
            checked: result.summary.checked
          });
        }
      } catch (error) {
        // Silently fail - background sync shouldn't interrupt user experience
        log.error('Background match sync error', error);
      }
    };

    // Delay sync slightly to avoid blocking initial page load
    const timeoutId = setTimeout(triggerSync, 2000);

    return () => clearTimeout(timeoutId);
  }, []);

  // This component renders nothing
  return null;
}
