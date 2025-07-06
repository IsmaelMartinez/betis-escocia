# Feature Flags Environment Variables

This file shows how to control which features are visible in the application using environment variables.

## 🔒 SECURE BY DEFAULT APPROACH

**ALL FEATURES ARE HIDDEN BY DEFAULT** unless explicitly enabled via environment variables. This provides maximum security and control over which features are visible in production.

## Available Feature Flags

### All Features (Hidden by Default - Require Explicit Enablement)
- `NEXT_PUBLIC_FEATURE_CLASIFICACION` - Shows/hides the Clasificación (Standings) page
- `NEXT_PUBLIC_FEATURE_COLECCIONABLES` - Shows/hides the Coleccionables (Collectibles) page  
- `NEXT_PUBLIC_FEATURE_GALERIA` - Shows/hides the Galería (Gallery) page
- `NEXT_PUBLIC_FEATURE_RSVP` - Shows/hides the RSVP page
- `NEXT_PUBLIC_FEATURE_SOCIAL_MEDIA` - Shows/hides social media features
- `NEXT_PUBLIC_FEATURE_CONTACTO` - Shows/hides the Contacto (Contact) page
- `NEXT_PUBLIC_FEATURE_HISTORY` - Shows/hides the Historia (History) page
- `NEXT_PUBLIC_FEATURE_NOSOTROS` - Shows/hides the Nosotros (About) page

## Usage

### To Enable Any Feature

**EVERY feature must be explicitly set to `true` to be visible:**

```bash
NEXT_PUBLIC_FEATURE_CLASIFICACION=true
NEXT_PUBLIC_FEATURE_COLECCIONABLES=true
NEXT_PUBLIC_FEATURE_GALERIA=true
NEXT_PUBLIC_FEATURE_RSVP=true
NEXT_PUBLIC_FEATURE_SOCIAL_MEDIA=true
NEXT_PUBLIC_FEATURE_CONTACTO=true
NEXT_PUBLIC_FEATURE_HISTORY=true
NEXT_PUBLIC_FEATURE_NOSOTROS=true
```

### Default Behavior (No Environment Variables)

Without any environment variables set, the application will show:
- ✅ **Always Visible**: Home page only
- ❌ **Hidden**: ALL other pages and features (RSVP, About, History, Standings, Collectibles, Gallery, Social Media, Contact)

### Common Scenarios

#### Minimal Setup (Home + RSVP + About)
```bash
NEXT_PUBLIC_FEATURE_RSVP=true
NEXT_PUBLIC_FEATURE_NOSOTROS=true
```

#### Community Features Only (No Merchandise/Gallery)
```bash
NEXT_PUBLIC_FEATURE_RSVP=true
NEXT_PUBLIC_FEATURE_NOSOTROS=true
NEXT_PUBLIC_FEATURE_HISTORY=true
NEXT_PUBLIC_FEATURE_CONTACTO=true
NEXT_PUBLIC_FEATURE_SOCIAL_MEDIA=true
```

#### Full Feature Set (Everything Enabled)

```bash
NEXT_PUBLIC_FEATURE_CLASIFICACION=true
NEXT_PUBLIC_FEATURE_COLECCIONABLES=true
NEXT_PUBLIC_FEATURE_GALERIA=true
NEXT_PUBLIC_FEATURE_RSVP=true
NEXT_PUBLIC_FEATURE_SOCIAL_MEDIA=true
NEXT_PUBLIC_FEATURE_CONTACTO=true
NEXT_PUBLIC_FEATURE_HISTORY=true
NEXT_PUBLIC_FEATURE_NOSOTROS=true
```

#### Hide Work-in-Progress Features

```bash
# Only enable core pages (Home automatically visible)
NEXT_PUBLIC_FEATURE_RSVP=true
NEXT_PUBLIC_FEATURE_NOSOTROS=true
NEXT_PUBLIC_FEATURE_CONTACTO=true
# All other features remain hidden (not set)
```

## Development

### Debug Mode

Enable debug mode to see which features are enabled/disabled:

```bash
NEXT_PUBLIC_DEBUG_MODE=true
```

This will show a debug panel in the bottom-right corner of the page in development mode.

## Deployment

### Vercel Environment Variables

In your Vercel project settings, add these environment variables:

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add the feature flags you want to enable (only set to `true` for features you want visible):

```bash
NEXT_PUBLIC_FEATURE_CLASIFICACION=true
NEXT_PUBLIC_FEATURE_RSVP=true
NEXT_PUBLIC_FEATURE_NOSOTROS=true
NEXT_PUBLIC_FEATURE_CONTACTO=true
# Other features not set = hidden by default
```

### Production vs Development

You can set different values for different environments:

- **Development**: Show all features for testing
- **Preview**: Hide incomplete features
- **Production**: Only show completed, stable features

## Implementation Details

The feature flags are implemented in `/src/lib/featureFlags.ts` and integrated into the navigation via `/src/components/Layout.tsx`.

### Adding New Feature Flags

1. Add the flag to the `FeatureFlags` interface in `featureFlags.ts`
2. Add the default value to `defaultFlags`
3. Add the environment variable override to `environmentFlags`
4. Use `isFeatureEnabled('yourFeature')` in components to conditionally render

### Example Component Usage

```tsx
import { isFeatureEnabled } from '@/lib/featureFlags';

export default function MyComponent() {
  if (!isFeatureEnabled('showMyFeature')) {
    return null; // Hide the component
  }
  
  return <div>My feature content</div>;
}
```
