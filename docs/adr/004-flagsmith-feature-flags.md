# ADR-004: Flagsmith Feature Flag Provider

## Status
- **Status**: Proposed
- **Date**: 2025-07-17
- **Authors**: Development Team
- **Decision Maker**: Technical Lead

## Context
The Peña Bética Escocesa website currently uses environment variable-based feature flags for controlling feature visibility. While this approach works, it has several limitations:

- **No real-time updates**: Requires deployment to change flags
- **Limited targeting**: Cannot enable features for specific users or groups
- **No A/B testing**: Cannot run experiments or gradual rollouts
- **Manual management**: Requires developer intervention for all changes
- **No analytics**: Cannot track feature usage or adoption

We need to migrate to a third-party feature flag provider that offers:
- Free tier suitable for small projects
- Real-time flag updates without deployment
- A/B testing capabilities for future use
- Easy migration from current environment variable setup
- Preferably integrates well with Vercel deployment

## Decision
We chose **Flagsmith** as our feature flag provider for the following reasons:

### Primary Reasons
1. **Generous Free Tier**: 50,000 requests/month vs competitors' 1,000-1,500 limits
2. **Real-time Updates**: Instant flag changes without deployment
3. **A/B Testing**: Built-in experimentation capabilities
4. **Open Source**: Full transparency and self-hosting option if needed
5. **Good SDKs**: Quality JavaScript/TypeScript SDK for Next.js integration
6. **Easy Migration**: Straightforward migration from environment variables

### Cost Comparison
- **Flagsmith**: 50,000 requests/month free
- **LaunchDarkly**: 1,000 contexts/month free, $10/month minimum
- **ConfigCat**: 1,000 evaluations/month free
- **Vercel Flags**: Free but basic features only

## Consequences
### Positive
- **Real-time flag management**: No more deployments for flag changes
- **Better collaboration**: Non-technical team members can manage flags
- **A/B testing capability**: Future experimentation possibilities
- **Analytics**: Track feature usage and adoption
- **Audit trail**: See who changed what and when
- **Cost-effective**: Free tier covers current and projected usage
- **Scalability**: Can handle growth without immediate cost impact

### Negative
- **External dependency**: Adds reliance on third-party service
- **Learning curve**: Team needs to learn new tool and concepts
- **Migration effort**: Requires development work to migrate existing flags
- **Potential latency**: Additional API calls for flag evaluation
- **Vendor lock-in**: Some degree of dependency on Flagsmith

### Neutral
- **Feature parity**: Will maintain all current feature flag functionality
- **Gradual migration**: Can migrate flags incrementally

## Alternatives Considered
### Option 1: LaunchDarkly (Industry Standard)
- **Pros**: Most mature platform, excellent features, great support
- **Cons**: Expensive ($10/month minimum), limited free tier (1,000 contexts)
- **Reason for rejection**: Cost too high for small project, free tier too restrictive

### Option 2: Vercel Feature Flags (Native Integration)
- **Pros**: Native Vercel integration, zero setup, completely free
- **Cons**: Very basic features, no A/B testing, limited targeting
- **Reason for rejection**: Too basic for future needs, no experimentation capability

### Option 3: ConfigCat (Developer-Friendly)
- **Pros**: Developer-focused, easy setup, good documentation
- **Cons**: Limited free tier (1,000 evaluations), expensive scaling ($99/month)
- **Reason for rejection**: Free tier too restrictive, pricing not competitive

### Option 4: Unleash (Open Source)
- **Pros**: Open source, enterprise features, flexible deployment
- **Cons**: Requires self-hosting, complex setup, infrastructure overhead
- **Reason for rejection**: Too complex for current needs, requires DevOps expertise

## Implementation Notes
- **Migration Strategy**: Complete migration to Flagsmith.
- **Fallback Mechanism**: Rely on default flag values configured within Flagsmith.
- **Performance**: Implement caching to minimize API calls
- **Integration**: Use Flagsmith JavaScript SDK with Next.js
- **Configuration**: Environment-based configuration (dev/staging/prod)

## References
- [Feature Flag Provider Comparison](../../tasks/feature-flag-providers-comparison.md)
- [Flagsmith Documentation](https://docs.flagsmith.com/)
- [Project Ideas](../../tasks/ideas.md)

## Review
- **Next review date**: 2025-10-17 (3-month review)
- **Review criteria**: Usage patterns, cost effectiveness, feature adoption, team satisfaction
