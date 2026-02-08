import { notFound } from 'next/navigation';
import { hasFeature, type FeatureName } from '@/lib/features/featureFlags';

/**
 * Higher-order component to protect routes based on feature flags
 * If the feature is disabled, returns a 404 page
 */
export function withFeatureFlag<T extends object>(
  Component: React.ComponentType<T>,
  featureFlag: FeatureName
) {
  return function ProtectedComponent(props: T) {
    if (!hasFeature(featureFlag)) {
      notFound();
    }

    return <Component {...props} />;
  };
}

/**
 * Hook to check if a feature is enabled and optionally redirect
 * Use this in page components for client-side feature checking
 */
export function useFeatureFlag(
  featureFlag: FeatureName,
  redirectTo?: string
) {
  const isEnabled = hasFeature(featureFlag);

  if (!isEnabled && redirectTo && typeof window !== 'undefined') {
    window.location.href = redirectTo;
  }

  return isEnabled;
}

/**
 * Conditional wrapper component for feature-flagged content
 * Use this to conditionally render components based on feature flags
 */
interface FeatureWrapperProps {
  readonly feature: FeatureName;
  readonly fallback?: React.ReactNode;
  readonly children: React.ReactNode;
}

export function FeatureWrapper({ feature, fallback = null, children }: FeatureWrapperProps) {
  if (!hasFeature(feature)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
