# ADR-004: Feature Flags (Environment Variables)

## Status

Superseded (2026-05-16). Kept for historical context.

## Decision

Originally: environment-variable-based feature flags for simple, synchronous feature control via `hasFeature("flag-name")`.

## Why It Was Superseded

By 2026-05 every remaining flag was on-by-default with no realistic toggling case (auth/admin/trivia/DB had been removed in earlier iterations of the static-site simplification). The runtime cost of env-lookup + cache and the surface of a `FeatureWrapper` component / `withFeatureFlag` HOC were carrying weight without earning any. Navigation links are now hard-coded in `src/components/layout/Header.tsx`; every page renders unconditionally.

If a real toggling need returns, reach for a single inline `process.env.NEXT_PUBLIC_FEATURE_X === "true"` check at the call site or revisit a managed flag service (Flagsmith was originally rejected here as too heavy for the site's scale; that judgement still stands at the time of removal).

## References

- Removal commit: PR #430 (2026-05-16)
- `src/components/layout/Header.tsx` for the hard-coded navigation
