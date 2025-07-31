# 011-sentry-error-monitoring

## Title
Sentry for Error Monitoring and Performance Tracing

## Status
Accepted

## Context
As the application grows, it becomes critical to have a robust system for identifying, tracking, and resolving errors in both frontend and backend environments. Manual error detection is inefficient and reactive, leading to potential downtime and degraded user experience. Performance bottlenecks also need to be proactively identified.

## Decision
We will integrate Sentry as our primary error monitoring and performance tracing solution. Sentry provides comprehensive error reporting with rich context, performance monitoring capabilities (including Web Vitals and custom transactions), and release health tracking.

## Consequences
*   **Improved Error Visibility:** All unhandled exceptions and critical errors will be automatically captured and reported to Sentry, providing immediate visibility into production issues.
*   **Faster Debugging:** Detailed stack traces, user context (via Clerk integration), request details, and breadcrumbs will significantly accelerate the debugging process.
*   **Performance Insights:** We will gain insights into application performance, allowing us to identify and address bottlenecks.
*   **Release Health:** Ability to monitor the health of new deployments and quickly identify regressions.
*   **Cost-Effectiveness:** Initial integration will leverage Sentry's free tier, with potential for scaling as needed.
*   **Development Overhead:** Initial setup and ongoing maintenance of Sentry configurations and potential custom instrumentation.

## Learnings
*   **Environment Variables for DSNs:** It's crucial to correctly configure `NEXT_PUBLIC_SENTRY_DSN` and `SENTRY_DSN` via environment variables for different environments.
*   **Explicit Error Capture for Backend:** While Sentry's Next.js SDK provides good automatic instrumentation, explicitly calling `Sentry.captureException` in backend API routes for critical errors ensures they are always reported, especially when dealing with complex error handling flows.
*   **Client vs. Server Configuration:** Understanding the distinct configuration files (`sentry.client.config.ts` and `sentry.server.config.ts`) and their respective roles is key for proper setup.
*   **Source Map Uploads in CI/CD:** Automating source map uploads via `sentry-cli` in the CI/CD pipeline is essential for readable stack traces in production.
*   **Sampling Rates:** Adjusting `tracesSampleRate` and `profilesSampleRate` is important for managing data volume and staying within free tier limits while still getting valuable insights.
