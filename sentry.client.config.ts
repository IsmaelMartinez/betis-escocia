// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV,
  release: process.env.NEXT_PUBLIC_SENTRY_RELEASE,

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 0.1,

  // Set profilesSampleRate to 0.1 to enable profiling for a fraction of events
  profilesSampleRate: 0.1,

  // In client-side Sentry, you can also set up a `beforeSend` hook to
  // filter out sensitive data or add additional context.
  beforeSend(event) {
    // Check if it's a production environment
    if (process.env.NODE_ENV === 'production') {
      // You can add custom logic here to filter out sensitive data
      // For example, if you have a field named 'password' in your event data, you can remove it:
      // if (event.request && event.request.data && event.request.data.password) {
      //   event.request.data.password = '[Filtered]';
      // }
    }
    return event;
  },

  // You can remove this option if you're not planning to use the Sentry Session Replay feature.
  // Note: Session Replay is now configured in instrumentation-client.ts to avoid duplicate instances
  // integrations: [
  //   Sentry.replayIntegration({
  //     // Additional Replay configuration goes in here, for example:
  //     maskAllText: true,
  //     blockAllMedia: true,
  //   }),
  // ],
});
