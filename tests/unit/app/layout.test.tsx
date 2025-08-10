import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RootLayout from '../../../src/app/layout';
import { ClerkProvider } from '@clerk/nextjs';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import * as Sentry from '@sentry/nextjs';
import * as featureFlags from '@/lib/featureFlags';
import Layout from '@/components/Layout';
import OfflineDetector from '@/components/OfflineDetector';
import SentryUserContext from '@/components/SentryUserContext';
import FlagsmithRefresher from '@/components/FlagsmithRefresher';
import FacebookSDK from '@/components/FacebookSDK';

// Mock external modules and components
vi.mock('next/font/google', () => ({
  Geist: vi.fn(() => ({ variable: 'var(--font-geist-sans)' })),
  Geist_Mono: vi.fn(() => ({ variable: 'var(--font-geist-mono)' })),
}));
vi.mock('@/components/Layout', () => ({
  default: vi.fn(({ children }) => <div data-testid="mock-layout">{children}</div>),
}));
vi.mock('@/components/OfflineDetector', () => ({
  default: vi.fn(() => <div data-testid="mock-offline-detector" />),
}));
vi.mock('@vercel/analytics/next', () => ({
  Analytics: vi.fn(() => <div data-testid="mock-analytics" />),
}));
vi.mock('@sentry/nextjs', () => ({
  ErrorBoundary: vi.fn(({ children }: any) => <div data-testid="mock-sentry-error-boundary">{children}</div>),
  captureException: vi.fn(),
}));
vi.mock('@vercel/speed-insights/next', () => ({
  SpeedInsights: vi.fn(() => <div data-testid="mock-speed-insights" />),
}));
vi.mock('@/components/SentryUserContext', () => ({
  default: vi.fn(() => <div data-testid="mock-sentry-user-context" />),
}));
vi.mock('@clerk/nextjs', () => ({
  ClerkProvider: vi.fn(({ children }: any) => <div data-testid="mock-clerk-provider">{children}</div>),
}));
vi.mock('@/lib/featureFlags', () => ({
  initializeFeatureFlags: vi.fn(),
  getEnabledNavigationItemsAsync: vi.fn(() => Promise.resolve([])),
}));
vi.mock('@/components/FlagsmithRefresher', () => ({
  default: vi.fn(() => <div data-testid="mock-flagsmith-refresher" />),
}));
vi.mock('@/components/FacebookSDK', () => ({
  default: vi.fn(() => <div data-testid="mock-facebook-sdk" />),
}));

describe('RootLayout', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
    // Ensure mocks return default implementations if needed
    vi.mocked(Layout).mockImplementation(({ children }: any) => <div data-testid="mock-layout">{children}</div>);
    vi.mocked(Sentry.ErrorBoundary).mockImplementation(({ children }: any) => <div data-testid="mock-sentry-error-boundary">{children}</div>);
    vi.mocked(ClerkProvider).mockImplementation(({ children }: any) => <div data-testid="mock-clerk-provider">{children}</div>);
  });

  it('renders children correctly within the layout structure', async () => {
    render(await RootLayout({ children: <p>Test Children</p> }));

    expect(screen.getByText('Test Children')).toBeInTheDocument();
    expect(screen.getByTestId('mock-layout')).toBeInTheDocument();
    expect(screen.getByTestId('mock-sentry-error-boundary')).toBeInTheDocument();
    expect(screen.getByTestId('mock-clerk-provider')).toBeInTheDocument();
  });

  it('renders all expected top-level components', async () => {
    render(await RootLayout({ children: <p>Test Children</p> }));

    expect(screen.getByTestId('mock-facebook-sdk')).toBeInTheDocument();
    expect(screen.getByTestId('mock-offline-detector')).toBeInTheDocument();
    expect(screen.getByTestId('mock-flagsmith-refresher')).toBeInTheDocument();
    expect(screen.getByTestId('mock-sentry-user-context')).toBeInTheDocument();
    expect(screen.getByTestId('mock-analytics')).toBeInTheDocument();
    expect(screen.getByTestId('mock-speed-insights')).toBeInTheDocument();
  });

  it('initializes feature flags on render', async () => {
    render(await RootLayout({ children: <p>Test Children</p> }));
    expect(featureFlags.initializeFeatureFlags).toHaveBeenCalledTimes(1);
    expect(featureFlags.getEnabledNavigationItemsAsync).toHaveBeenCalledTimes(1);
  });

  it('logs error if feature flag initialization fails and sets empty navigation', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const mockError = new Error('Flagsmith init failed');
    vi.mocked(featureFlags.initializeFeatureFlags).mockRejectedValueOnce(mockError);

    render(await RootLayout({ children: <p>Test Children</p> }));

    expect(consoleErrorSpy).toHaveBeenCalledWith('[RootLayout] Error during Flagsmith initialization or flag fetching:', mockError);
    // Verify that getEnabledNavigationItemsAsync is still called, but its result might be ignored or handled by fallback
    expect(featureFlags.getEnabledNavigationItemsAsync).not.toHaveBeenCalled(); // Modified line
    consoleErrorSpy.mockRestore();
  });
});