# Feature Flags Deployment Guide

## Overview

The project uses environment variables for simple feature flag control. This document explains how to configure feature flags for different deployment environments.

## Environment Variable System

### Key Principles
- **Default behavior**: Most features are enabled by default
- **Environment variables**: Only needed for disabled/experimental features
- **Build-time resolution**: Feature flags are resolved at build time, not runtime
- **Type safety**: All feature names are strictly typed

### Available Feature Flags

#### Always-On Features (No Environment Variable Needed)
- `show-rsvp` - RSVP functionality
- `show-unete` - Join functionality  
- `show-contacto` - Contact functionality
- `show-clasificacion` - League standings
- `show-partidos` - Match information
- `show-nosotros` - About page
- `show-clerk-auth` - Authentication

#### Optional Features (Environment Variable Controlled)
- `show-galeria` - Photo gallery
- `show-redes-sociales` - Social networks
- `show-debug-info` - Debug information
- `admin-push-notifications` - Admin push notifications

## Configuration Examples

### Development Environment
```bash
# Enable experimental features for testing
NEXT_PUBLIC_FEATURE_GALERIA=true
NEXT_PUBLIC_FEATURE_DEBUG_INFO=true
```

### Production Environment
```bash
# Only set variables for features you want to enable
# Omit variables for disabled features (they default to false)
NEXT_PUBLIC_FEATURE_GALERIA=true
```

### Staging Environment
```bash
# Enable all features for testing
NEXT_PUBLIC_FEATURE_GALERIA=true
NEXT_PUBLIC_FEATURE_SOCIAL_MEDIA=true
NEXT_PUBLIC_FEATURE_REDES_SOCIALES=true
NEXT_PUBLIC_FEATURE_DEBUG_INFO=true
NEXT_PUBLIC_FEATURE_ADMIN_PUSH_NOTIFICATIONS=true
```

## Usage in Code

```typescript
import { hasFeature } from '@/lib/featureFlags';

// Synchronous feature check
const isGalleryEnabled = hasFeature('show-galeria');
if (!isGalleryEnabled) return null;

// Navigation filtering
const enabledItems = getEnabledNavigationItems();
```

## Deployment Checklist

1. **Review feature status**: Determine which features should be enabled
2. **Set environment variables**: Only for features you want to enable
3. **Test thoroughly**: Verify feature visibility in staging
4. **Document changes**: Update this file if new flags are added

## Migration Notes

- **From Flagsmith**: This system replaces the previous Flagsmith integration
- **Simplified approach**: No external service dependencies
- **Better performance**: No runtime API calls for feature resolution
- **Type safety**: Compile-time validation of feature names