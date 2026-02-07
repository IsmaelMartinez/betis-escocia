import React from "react";
import { render, screen, within, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Home from "../../../src/app/page";

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
// Mock feature flags to return true (features enabled)
vi.mock("@/lib/featureFlags", () => ({
  hasFeature: vi.fn(() => true),
}));

describe("Home page", () => {
  it("renders HeroCommunity component", () => {
    render(<Home />);
    expect(screen.getByTestId("mock-hero-community")).toBeInTheDocument();
  });

  it("renders UpcomingMatchesWidget and ClassificationWidget when features are enabled", async () => {
    render(<Home />);
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

  it('renders the "Join Us" section with correct text and links', () => {
    render(<Home />);
    // Text is split across lines with <br /> so we check for parts
    expect(screen.getByText(/¿Estás de visita/i)).toBeInTheDocument();
    expect(screen.getByText(/en Escocia\?/i)).toBeInTheDocument();
    expect(
      screen.getByText("¡Ven a ver los partidos con nosotros!"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Todos los béticos son bienvenidos/i),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Únete/i })).toBeInTheDocument();
    // Facebook and YouTube links are wrapped in FeatureWrapper for social media feature
  });

  it("renders contact info section with correct details", () => {
    render(<Home />);
    // Find the "Ubicación" section and query within it
    const locationSection = screen.getByText("📍 Ubicación").closest("div");
    expect(locationSection).toBeInTheDocument();
    expect(
      within(locationSection!).getByText(/Polwarth Tavern/i),
    ).toBeInTheDocument();

    // Find the "Ambiente" section and query within it
    const ambienteSection = screen.getByText("💚 Ambiente").closest("div");
    expect(ambienteSection).toBeInTheDocument();
    // Query for the paragraph element that contains the text "100% bético"
    expect(
      within(ambienteSection!).getByText(/100% bético/i, { selector: "p" }),
    ).toBeInTheDocument();

    expect(screen.getByText("⏰ Horarios")).toBeInTheDocument();
    expect(screen.getByText(/15 min antes del partido/i)).toBeInTheDocument();
  });
});
