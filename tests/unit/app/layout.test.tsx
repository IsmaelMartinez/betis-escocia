import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RootLayout from '../../../src/app/layout';
import { ClerkProvider } from '@clerk/nextjs';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import * as Sentry from '@sentry/nextjs';
import Layout from '@/components/Layout';
import OfflineDetector from '@/components/OfflineDetector';
import SentryUserContext from '@/components/SentryUserContext';
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
vi.mock('@/components/FacebookSDK', () => ({
  default: vi.fn(() => <div data-testid="mock-facebook-sdk" />),
}));

describe('RootLayout', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
    // Ensure mocks return default implementations if needed
    vi.mocked(Layout).mockImplementation(({ children }: any) => <div data-testid="mock-layout">{children}</div>);
    vi.mocked(Sentry.ErrorBoundary).mockImplementation((props: any) => <div data-testid="mock-sentry-error-boundary">{props.children}</div> as any);
    vi.mocked(ClerkProvider).mockImplementation((props: any) => <div data-testid="mock-clerk-provider">{props.children}</div> as any);
  });

  it('renders children correctly within the layout structure', () => {
    render(RootLayout({ children: <p>Test Children</p> }));

    expect(screen.getByText('Test Children')).toBeInTheDocument();
    expect(screen.getByTestId('mock-layout')).toBeInTheDocument();
    expect(screen.getByTestId('mock-sentry-error-boundary')).toBeInTheDocument();
    expect(screen.getByTestId('mock-clerk-provider')).toBeInTheDocument();
  });

  it('renders all expected top-level components', () => {
    render(RootLayout({ children: <p>Test Children</p> }));

    expect(screen.getByTestId('mock-facebook-sdk')).toBeInTheDocument();
    expect(screen.getByTestId('mock-offline-detector')).toBeInTheDocument();
    expect(screen.getByTestId('mock-sentry-user-context')).toBeInTheDocument();
    expect(screen.getByTestId('mock-analytics')).toBeInTheDocument();
    expect(screen.getByTestId('mock-speed-insights')).toBeInTheDocument();
  });

  it('renders without errors', () => {
    expect(() => {
      render(RootLayout({ children: <p>Test Children</p> }));
    }).not.toThrow();
  });

  it('passes debugInfo to Layout component', () => {
    render(RootLayout({ children: <p>Test Children</p> }));
    
    // Layout should be called with debugInfo as null (simplified implementation)
    const layoutCalls = vi.mocked(Layout).mock.calls;
    expect(layoutCalls.length).toBeGreaterThan(0);
    expect(layoutCalls[0][0]).toMatchObject({
      debugInfo: null,
    });
  });
});