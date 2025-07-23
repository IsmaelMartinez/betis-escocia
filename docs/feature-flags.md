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
*   `show-trivia-game` - Shows/hides the Trivia game feature

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

---

## Provider Selection & Comparison

### Why Flagsmith Was Chosen

After evaluating multiple feature flag providers, Flagsmith was selected as the optimal solution for the Peña Bética Escocesa website based on the following criteria:

#### ✅ **Flagsmith Advantages**
- **Generous Free Tier**: 50,000 requests/month (sufficient for current traffic)
- **Open Source**: Full transparency and option for self-hosting if needed
- **Rich Features**: Advanced targeting, segments, A/B testing capabilities
- **Good SDKs**: Quality JavaScript/React SDKs with excellent developer experience
- **Real-time Updates**: Instant flag changes without deployments
- **Active Development**: Regular updates and improvements
- **Cost Effective**: Meets all current needs within the free tier

#### 🔄 **Migration from Environment Variables**

The project successfully migrated from environment variable-based feature flags to Flagsmith:

1. **Phase 1**: Implemented Flagsmith SDK alongside existing env vars
2. **Phase 2**: Created Flagsmith account and configured all flags
3. **Phase 3**: Tested both systems in parallel
4. **Phase 4**: Gradually migrated flags one by one
5. **Phase 5**: Removed env var system once stable

#### 📊 **Alternatives Considered**

| Provider | Free Tier | Ease of Setup | Features | Decision |
|----------|-----------|---------------|----------|----------|
| **Flagsmith** | ⭐⭐⭐⭐⭐ (50K requests) | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | **✅ Selected** |
| **Vercel Flags** | ⭐⭐⭐⭐⭐ (Free) | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | Too basic |
| **LaunchDarkly** | ⭐⭐ (1K contexts) | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Too expensive |
| **ConfigCat** | ⭐⭐⭐ (1K evals) | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Limited free tier |
| **Unleash** | ⭐⭐ (self-host) | ⭐⭐ | ⭐⭐⭐⭐ | Too complex |

### Implementation Details

- **SDK**: Uses `flagsmith-js-client-sdk` for React integration
- **Caching**: Client-side caching for performance optimization
- **Fallbacks**: Default values configured for offline scenarios
- **Environments**: Separate configurations for development/production
- **Security**: Environment-specific API keys with appropriate permissions