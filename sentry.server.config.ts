// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever a Next.js server environment is bootstrapped (e.g. by the `next` command).
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1.0,

  // Set profilesSampleRate to 1.0 to enable profiling for all events
  profilesSampleRate: 1.0,

  // In server-side Sentry, you can also set up a `beforeSend` hook to
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
});
