# Feature Flags Deployment Guide

## Overview

The project uses environment variables for simple feature flag control. This document explains how to configure feature flags for different deployment environments.

## Environment Variable System

### Key Principles

- **Default behavior**: Core features are enabled by default, advanced features are disabled
- **Environment variables**: Set to `true` to enable features, `false` to disable core features, or omit for defaults
- **Development mode**: No caching - changes to `.env.local` take effect immediately
- **Production mode**: Cached for performance after first read
- **Type safety**: All feature names are strictly typed

### Available Feature Flags

#### Enabled by Default (Core Features)

These features are enabled by default and don't require environment variables. Set `NEXT_PUBLIC_FEATURE_*=false` to disable:

- `show-nosotros` - About page (`NEXT_PUBLIC_FEATURE_NOSOTROS`)
- `show-unete` - Join functionality (`NEXT_PUBLIC_FEATURE_UNETE`)
- `show-clasificacion` - League standings (`NEXT_PUBLIC_FEATURE_CLASIFICACION`)

#### Disabled by Default (Require Environment Variable to Enable)

These features are disabled by default and require `NEXT_PUBLIC_FEATURE_*=true` to enable:

- `show-rsvp` - RSVP functionality (`NEXT_PUBLIC_FEATURE_RSVP=true`)
- `show-contacto` - Contact form (`NEXT_PUBLIC_FEATURE_CONTACTO=true`)
- `show-partidos` - Match information (`NEXT_PUBLIC_FEATURE_PARTIDOS=true`)
- `show-clerk-auth` - Authentication UI (`NEXT_PUBLIC_FEATURE_CLERK_AUTH=true`)
- `show-debug-info` - Debug info panel (`NEXT_PUBLIC_FEATURE_DEBUG_INFO=true`)

## Configuration Examples

### Development Environment

```bash
# Enable features you're working on + debug info
NEXT_PUBLIC_FEATURE_DEBUG_INFO=true
NEXT_PUBLIC_FEATURE_CLERK_AUTH=true
NEXT_PUBLIC_FEATURE_RSVP=true
NEXT_PUBLIC_FEATURE_CONTACTO=true
```

### Production Environment (Full Features)

```bash
# Enable all Phase 2 features for production
# (clasificacion is already enabled by default)
NEXT_PUBLIC_FEATURE_RSVP=true
NEXT_PUBLIC_FEATURE_CONTACTO=true
NEXT_PUBLIC_FEATURE_PARTIDOS=true
NEXT_PUBLIC_FEATURE_CLERK_AUTH=true
# Note: Don't enable debug info in production
```

### Staging Environment

```bash
# Enable all features including debug for testing
# (clasificacion is already enabled by default)
NEXT_PUBLIC_FEATURE_RSVP=true
NEXT_PUBLIC_FEATURE_CONTACTO=true
NEXT_PUBLIC_FEATURE_PARTIDOS=true
NEXT_PUBLIC_FEATURE_CLERK_AUTH=true
NEXT_PUBLIC_FEATURE_DEBUG_INFO=true
```

## Usage in Code

```typescript
import { hasFeature } from "@/lib/featureFlags";

// Synchronous feature check
const isRsvpEnabled = hasFeature("show-rsvp");
if (!isRsvpEnabled) return null;

// Navigation filtering
const enabledItems = getEnabledNavigationItems();
```

## Deployment Checklist

1. **Review feature status**: Determine which features should be enabled
2. **Set environment variables**: Add `NEXT_PUBLIC_FEATURE_*=true` for features to enable
3. **Test thoroughly**: Verify feature visibility in staging
4. **Document changes**: Update this file if new flags are added

## Development Notes

### Hot Reload Support

In development mode (`NODE_ENV=development`), feature flags are **not cached**. This means:

- Changes to `.env.local` take effect on the next page load
- No need to restart the dev server when changing feature flags
- Useful for testing different feature combinations

### Debug Info Panel

Enable `NEXT_PUBLIC_FEATURE_DEBUG_INFO=true` to see a floating panel showing:

- Current environment
- List of enabled features
- List of disabled features

This is helpful for debugging feature flag issues in development and staging.

## Migration Notes

- **From Flagsmith**: This system replaces the previous Flagsmith integration
- **Simplified approach**: No external service dependencies
- **Better performance**: No runtime API calls for feature resolution (cached in production)
- **Type safety**: Compile-time validation of feature names
