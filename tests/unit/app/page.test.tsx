import React from "react";
import { render, screen, within, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Home from "../../../src/app/[locale]/page";

// Mock components and modules
vi.mock("@/components/hero/HeroCommunity", () => ({
  default: vi.fn(() => <div data-testid="mock-hero-community" />),
}));
vi.mock("@/components/match/UpcomingMatchesWidget", () => ({
  default: vi.fn(() => <div data-testid="mock-upcoming-matches-widget" />),
}));
vi.mock("@/components/widgets/ClassificationWidget", () => ({
  default: vi.fn(() => <div data-testid="mock-classification-widget" />),
}));
vi.mock("@/components/widgets/BetisEfemerides", () => ({
  default: vi.fn(() => <div data-testid="mock-betis-efemerides" />),
}));
// Mock feature flags to return true (features enabled)
vi.mock("@/lib/features/featureFlags", () => ({
  hasFeature: vi.fn(() => true),
}));

// Helper to render the async server component
async function renderHome() {
  const params = Promise.resolve({ locale: "es" });
  const Component = await Home({ params });
  return render(Component as React.ReactElement);
}

describe("Home page", () => {
  it("renders HeroCommunity component", async () => {
    await renderHome();
    expect(screen.getByTestId("mock-hero-community")).toBeInTheDocument();
  });

  it("renders UpcomingMatchesWidget and ClassificationWidget when features are enabled", async () => {
    await renderHome();
    // Wait for dynamic imports to load
    await waitFor(() => {
      expect(
        screen.getByTestId("mock-upcoming-matches-widget"),
      ).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(
        screen.getByTestId("mock-classification-widget"),
      ).toBeInTheDocument();
    });
  });

  it('renders the "Join Us" section with correct text and links', async () => {
    await renderHome();
    // Both titles are within the same <h2> element separated by <br />
    expect(screen.getByText(/visitingTitle1/)).toBeInTheDocument();
    expect(screen.getByText(/visitingTitle2/)).toBeInTheDocument();
    expect(screen.getByText("visitingSubtitle")).toBeInTheDocument();
    expect(screen.getByText("visitingDesc")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "joinFamily" }),
    ).toBeInTheDocument();
  });

  it("renders contact info section with correct details", async () => {
    await renderHome();
    // Find the "Ubicación" section and query within it
    const locationSection = screen
      .getByText("locationTitle")
      .closest("div");
    expect(locationSection).toBeInTheDocument();
    expect(
      within(locationSection!).getByText("locationDetails"),
    ).toBeInTheDocument();

    // Find the "Ambiente" section and query within it
    const ambienteSection = screen
      .getByText("atmosphereTitle")
      .closest("div");
    expect(ambienteSection).toBeInTheDocument();
    expect(
      within(ambienteSection!).getByText("atmosphereDetails"),
    ).toBeInTheDocument();

    expect(screen.getByText("scheduleTitle")).toBeInTheDocument();
    expect(screen.getByText("scheduleDetails")).toBeInTheDocument();
  });
});
