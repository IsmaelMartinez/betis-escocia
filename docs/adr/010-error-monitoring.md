# ADR-010: Sentry Error Monitoring

## Status

Accepted

## Decision

**Sentry** for error monitoring and performance tracing.

## Why Sentry

- **Error visibility**: Automatic exception capture with context
- **Performance**: Web Vitals and custom transaction monitoring
- **Debugging**: Stack traces, breadcrumbs
- **Cost**: Free tier covers our needs

## Configuration

```bash
# Environment variables
NEXT_PUBLIC_SENTRY_DSN=your_public_dsn   # client-side DSN
SENTRY_DSN=your_server_dsn               # server-side DSN
NEXT_PUBLIC_SENTRY_RELEASE=optional      # release tag for client events (sentry.edge.config.ts)
SENTRY_RELEASE=optional                  # release tag for server events (sentry.server.config.ts)
```

## Key Files

- `sentry.client.config.ts` - Client-side configuration
- `sentry.server.config.ts` - Server-side configuration
- `sentry.edge.config.ts` - Edge runtime configuration

## Best Practices

- Explicit `Sentry.captureException()` for critical backend errors
- Adjust `tracesSampleRate` to stay within free tier
- Upload source maps in CI/CD for readable stack traces
