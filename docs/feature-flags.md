# Feature Flags with Flagsmith

This document outlines how to manage feature visibility using Flagsmith, our feature flag provider.

## 🚩 Feature Flag Management

All feature flags are managed through the [Flagsmith dashboard](https://flagsmith.com/). This allows for real-time updates without requiring code deployments.

### Key Concepts

*   **Features are disabled by default:** A feature will only be enabled if its corresponding flag is active in the Flagsmith environment.
*   **Environments:** We use separate Flagsmith environments for development, staging, and production to ensure proper testing and isolation.
*   **Default Values:** Each flag has a default value configured in Flagsmith, which is served if the SDK fails to fetch the latest flag configurations.

## Available Feature Flags

The following is a list of feature flags currently in use:

*   `show-clasificacion` - Shows/hides the Clasificación (Standings) page
*   `show-coleccionables` - Shows/hides the Coleccionables (Collectibles) page
*   `show-galeria` - Shows/hides the Galería (Gallery) page
*   `show-rsvp` - Shows/hides the RSVP page
*   `show-partidos` - Shows/hides the Partidos (Matches) page
*   `show-social-media` - Shows/hides social media features
*   `show-history` - Shows/hides the Historia (History) page
*   `show-nosotros` - Shows/hides the Nosotros (About) page
*   `show-unete` - Shows/hides the Unete (Join Us) page
*   `show-contacto` - Shows/hides the Contacto (Contact) page
*   `show-redes-sociales` - Shows/hides the Redes Sociales (Social Media) page
*   `show-admin` - Shows/hides the Admin dashboard
*   `show-clerk-auth` - Enables Clerk authentication

## Usage in Code

To check if a feature is enabled, use the `hasFeature` function from `@/lib/flagsmith`.

### Example Component Usage

```tsx
import { hasFeature } from '@/lib/flagsmith';

export default function MyComponent() {
  if (!hasFeature('my-feature-flag')) {
    return null; // Hide the component if the flag is disabled
  }

  return <div>My feature content</div>;
}
```

## Local Development

To run the application with feature flags locally, you need to set the following environment variable in your `.env.local` file:

```bash
NEXT_PUBLIC_FLAGSMITH_ENVIRONMENT_ID=your_development_environment_id_here
```

You can find the environment ID in your Flagsmith project settings.

### Debugging

To enable debug logs for the Flagsmith SDK, set the following environment variable:

```bash
NEXT_PUBLIC_FLAGSMITH_DEBUG=true
```

This will output detailed information about flag evaluations to the browser console.