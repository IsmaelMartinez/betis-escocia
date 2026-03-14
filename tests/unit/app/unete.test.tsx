import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// Mock FeatureWrapper
vi.mock("@/lib/features/featureProtection", () => ({
  FeatureWrapper: ({ children }: any) => children,
}));

// Mock Lucide React icons
vi.mock("lucide-react", () => ({
  MapPin: vi.fn(({ className }) => (
    <div data-testid="map-pin-icon" className={className} />
  )),
  Clock: vi.fn(({ className }) => (
    <div data-testid="clock-icon" className={className} />
  )),
  Users: vi.fn(({ className }) => (
    <div data-testid="users-icon" className={className} />
  )),
}));

describe("Unete Page", () => {
  const renderPage = async () => {
    const UnetePage = (await import("@/app/[locale]/unete/page")).default;
    const params = Promise.resolve({ locale: "es" });
    const Component = await UnetePage({ params });
    return render(Component as React.ReactElement);
  };

  describe("Basic rendering", () => {
    it("should render the main heading", async () => {
      await renderPage();

      const h1 = screen.getByRole("heading", { level: 1 });
      expect(h1).toBeInTheDocument();
      expect(h1).toHaveTextContent("title");
    });

    it("should render tagline", async () => {
      await renderPage();

      expect(screen.getByText("subtitle")).toBeInTheDocument();
    });
  });

  describe("Three main cards", () => {
    it("should render all three card headings", async () => {
      await renderPage();

      expect(screen.getByText("step1Title")).toBeInTheDocument();
      expect(screen.getByText("step2Title")).toBeInTheDocument();
      expect(screen.getByText("step3Title")).toBeInTheDocument();
    });

    it("should render location information in card 1", async () => {
      await renderPage();

      expect(screen.getByText("step1Venue")).toBeInTheDocument();
      expect(screen.getByText(/35 Polwarth Crescent/)).toBeInTheDocument();
      expect(screen.getByText(/Edinburgh EH11 1HR/)).toBeInTheDocument();
      expect(screen.getByText("step1Time")).toBeInTheDocument();
    });

    it("should render social media links in card 2", async () => {
      await renderPage();

      const facebookLink = screen.getByRole("link", { name: /Facebook/ });
      expect(facebookLink).toHaveAttribute(
        "href",
        "https://www.facebook.com/groups/beticosenescocia/",
      );

      const instagramLink = screen.getByRole("link", { name: /Instagram/ });
      expect(instagramLink).toHaveAttribute(
        "href",
        "https://www.instagram.com/rbetisescocia/",
      );
    });

    it("should render benefits list in card 3", async () => {
      await renderPage();

      expect(screen.getByText("step3Item1")).toBeInTheDocument();
      expect(screen.getByText("step3Item2")).toBeInTheDocument();
      expect(screen.getByText("step3Item3")).toBeInTheDocument();
      expect(screen.getByText("step3Item4")).toBeInTheDocument();
    });
  });

  describe("Visitor information section", () => {
    it("should render visitor welcome message", async () => {
      await renderPage();

      expect(screen.getByText("visitingTitle")).toBeInTheDocument();
      expect(screen.getByText("visitingText")).toBeInTheDocument();
    });
  });

  describe("Links and CTAs", () => {
    it("should render Google Maps link", async () => {
      await renderPage();

      const mapsLink = screen.getByRole("link", { name: /step1Map/ });
      expect(mapsLink).toHaveAttribute(
        "href",
        "https://maps.google.com/maps?q=Polwarth+Tavern+Edinburgh",
      );
    });

    it("should render Ver Próximos Partidos CTA", async () => {
      await renderPage();

      const ctaLink = screen.getByRole("link", {
        name: /ctaButton/,
      });
      expect(ctaLink).toHaveAttribute("href", "/partidos");
    });
  });

  describe("Accessibility", () => {
    it("should have proper heading structure", async () => {
      await renderPage();

      const headings = screen.getAllByRole("heading");
      expect(headings.length).toBeGreaterThan(0);

      // Should have a main heading (h1)
      const h1 = screen.getByRole("heading", { level: 1 });
      expect(h1).toBeInTheDocument();
    });

    it("should have external links with proper attributes", async () => {
      await renderPage();

      const externalLinks = screen.getAllByRole("link", {
        name: /Facebook|Instagram|step1Map/,
      });
      externalLinks.forEach((link) => {
        expect(link).toHaveAttribute("target", "_blank");
        expect(link).toHaveAttribute("rel", "noopener noreferrer");
      });
    });
  });

  describe("Design system consistency", () => {
    it("should use cultural fusion design patterns", async () => {
      const { container } = await renderPage();

      // Check for design system classes
      expect(container.querySelector(".bg-hero-fusion")).toBeInTheDocument();
      expect(
        container.querySelector(".pattern-tartan-navy"),
      ).toBeInTheDocument();
      expect(
        container.querySelector(".pattern-verdiblanco-subtle"),
      ).toBeInTheDocument();
    });

    it("should render icons from Lucide React", async () => {
      await renderPage();

      expect(screen.getAllByTestId("map-pin-icon").length).toBeGreaterThan(0);
      expect(screen.getAllByTestId("clock-icon").length).toBeGreaterThan(0);
      expect(screen.getAllByTestId("users-icon").length).toBeGreaterThan(0);
    });
  });
});
