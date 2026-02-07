import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import RootLayout from "../../../src/app/layout";
import { ClerkProvider } from "@clerk/nextjs";
import * as Sentry from "@sentry/nextjs";
import Layout from "@/components/layout/Layout";

// Mock external modules and components
vi.mock("next/font/google", () => ({
  Geist: vi.fn(() => ({ variable: "var(--font-geist-sans)" })),
  Geist_Mono: vi.fn(() => ({ variable: "var(--font-geist-mono)" })),
  Oswald: vi.fn(() => ({ variable: "var(--font-oswald)" })),
  Source_Sans_3: vi.fn(() => ({ variable: "var(--font-source-sans)" })),
  Playfair_Display: vi.fn(() => ({ variable: "var(--font-playfair)" })),
}));
vi.mock("@/components/layout/Layout", () => ({
  default: vi.fn(({ children }) => (
    <div data-testid="mock-layout">{children}</div>
  )),
}));
vi.mock("@/components/OfflineDetector", () => ({
  default: vi.fn(() => <div data-testid="mock-offline-detector" />),
}));
vi.mock("@vercel/analytics/next", () => ({
  Analytics: vi.fn(() => <div data-testid="mock-analytics" />),
}));
vi.mock("@sentry/nextjs", () => ({
  ErrorBoundary: vi.fn(({ children }: any) => (
    <div data-testid="mock-sentry-error-boundary">{children}</div>
  )),
  captureException: vi.fn(),
}));
vi.mock("@vercel/speed-insights/next", () => ({
  SpeedInsights: vi.fn(() => <div data-testid="mock-speed-insights" />),
}));
vi.mock("@/components/SentryUserContext", () => ({
  default: vi.fn(() => <div data-testid="mock-sentry-user-context" />),
}));
vi.mock("@clerk/nextjs", () => ({
  ClerkProvider: vi.fn(({ children }: any) => (
    <div data-testid="mock-clerk-provider">{children}</div>
  )),
}));
vi.mock("@/components/social/FacebookSDK", () => ({
  default: vi.fn(() => <div data-testid="mock-facebook-sdk" />),
}));

describe("RootLayout", () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
    // Ensure mocks return default implementations if needed
    vi.mocked(Layout).mockImplementation(({ children }: any) => (
      <div data-testid="mock-layout">{children}</div>
    ));
    vi.mocked(Sentry.ErrorBoundary).mockImplementation(
      (props: any) =>
        (
          <div data-testid="mock-sentry-error-boundary">{props.children}</div>
        ) as any,
    );
    vi.mocked(ClerkProvider).mockImplementation(
      (props: any) =>
        (<div data-testid="mock-clerk-provider">{props.children}</div>) as any,
    );
  });

  it("renders children correctly within the layout structure", () => {
    render(RootLayout({ children: <p>Test Children</p> }));

    expect(screen.getByText("Test Children")).toBeInTheDocument();
    expect(screen.getByTestId("mock-layout")).toBeInTheDocument();
    expect(
      screen.getByTestId("mock-sentry-error-boundary"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("mock-clerk-provider")).toBeInTheDocument();
  });

  it("renders all expected top-level components", () => {
    render(RootLayout({ children: <p>Test Children</p> }));

    expect(screen.getByTestId("mock-facebook-sdk")).toBeInTheDocument();
    expect(screen.getByTestId("mock-offline-detector")).toBeInTheDocument();
    expect(screen.getByTestId("mock-sentry-user-context")).toBeInTheDocument();
    // Analytics and SpeedInsights are only rendered on Vercel (when VERCEL=1)
    // They are conditionally rendered, so we check they're NOT present in test env
    expect(screen.queryByTestId("mock-analytics")).not.toBeInTheDocument();
    expect(screen.queryByTestId("mock-speed-insights")).not.toBeInTheDocument();
  });

  it("renders without errors", () => {
    expect(() => {
      render(RootLayout({ children: <p>Test Children</p> }));
    }).not.toThrow();
  });

  it("passes debugInfo to Layout component", () => {
    render(RootLayout({ children: <p>Test Children</p> }));

    // Layout should be called with debugInfo as null (simplified implementation)
    const layoutCalls = vi.mocked(Layout).mock.calls;
    expect(layoutCalls.length).toBeGreaterThan(0);
    expect(layoutCalls[0][0]).toMatchObject({
      debugInfo: null,
    });
  });
});
