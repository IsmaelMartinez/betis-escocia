# Feature Flags Environment Variables

This file shows how to control which features are visible in the application using environment variables.

## Available Feature Flags

- `NEXT_PUBLIC_FEATURE_CLASIFICACION` - Shows/hides the Clasificación (Standings) page
- `NEXT_PUBLIC_FEATURE_COLECCIONABLES` - Shows/hides the Coleccionables (Collectibles) page  
- `NEXT_PUBLIC_FEATURE_GALERIA` - Shows/hides the Galería (Gallery) page
- `NEXT_PUBLIC_FEATURE_RSVP` - Shows/hides the RSVP page
- `NEXT_PUBLIC_FEATURE_SOCIAL_MEDIA` - Shows/hides social media features
- `NEXT_PUBLIC_FEATURE_HISTORY` - Shows/hides the Historia (History) page
- `NEXT_PUBLIC_FEATURE_NOSOTROS` - Shows/hides the Nosotros (About) page
- `NEXT_PUBLIC_FEATURE_CONTACTO` - Shows/hides the Contacto (Contact) page

## Usage

### To Hide a Feature

Set the environment variable to `false`:

```bash
NEXT_PUBLIC_FEATURE_CLASIFICACION=false
NEXT_PUBLIC_FEATURE_COLECCIONABLES=false
NEXT_PUBLIC_FEATURE_GALERIA=false
NEXT_PUBLIC_FEATURE_RSVP=false
```

### To Show a Feature

Set the environment variable to `true` or omit it entirely (defaults to `true`):

```bash
NEXT_PUBLIC_FEATURE_CLASIFICACION=true
# OR simply omit the variable for default behavior
```

### Common Scenarios

#### Hide Everything Except Core Pages (Home, Contact, About)
```bash
NEXT_PUBLIC_FEATURE_CLASIFICACION=false
NEXT_PUBLIC_FEATURE_COLECCIONABLES=false
NEXT_PUBLIC_FEATURE_GALERIA=false
NEXT_PUBLIC_FEATURE_RSVP=false
NEXT_PUBLIC_FEATURE_SOCIAL_MEDIA=false
NEXT_PUBLIC_FEATURE_HISTORY=false
```

#### Show Only RSVP and Contact (Minimal Setup)
```bash
NEXT_PUBLIC_FEATURE_CLASIFICACION=false
NEXT_PUBLIC_FEATURE_COLECCIONABLES=false
NEXT_PUBLIC_FEATURE_GALERIA=false
NEXT_PUBLIC_FEATURE_RSVP=true
NEXT_PUBLIC_FEATURE_SOCIAL_MEDIA=false
NEXT_PUBLIC_FEATURE_HISTORY=false
NEXT_PUBLIC_FEATURE_NOSOTROS=false
NEXT_PUBLIC_FEATURE_CONTACTO=true
```

#### Hide Work-in-Progress Features
```bash
NEXT_PUBLIC_FEATURE_GALERIA=false
NEXT_PUBLIC_FEATURE_SOCIAL_MEDIA=false
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
3. Add the feature flags you want to control:

```
NEXT_PUBLIC_FEATURE_CLASIFICACION = false
NEXT_PUBLIC_FEATURE_COLECCIONABLES = false
NEXT_PUBLIC_FEATURE_GALERIA = false
NEXT_PUBLIC_FEATURE_RSVP = true
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
