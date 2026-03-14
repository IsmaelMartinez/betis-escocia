import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// Mock FeatureWrapper to always render children (feature enabled)
vi.mock("@/lib/features/featureProtection", () => ({
  FeatureWrapper: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

// Mock Lucide React icons
vi.mock("lucide-react", () => ({
  Heart: vi.fn(({ className }) => (
    <div data-testid="heart-icon" className={className} />
  )),
  Users: vi.fn(({ className }) => (
    <div data-testid="users-icon" className={className} />
  )),
  Calendar: vi.fn(({ className }) => (
    <div data-testid="calendar-icon" className={className} />
  )),
}));

async function renderNosotrosPage() {
  const NosotrosPage = (await import("@/app/[locale]/nosotros/page")).default;
  const params = Promise.resolve({ locale: "es" });
  const Component = await NosotrosPage({ params });
  return render(Component as React.ReactElement);
}

describe("Nosotros Page", () => {
  describe("Basic rendering", () => {
    it("should render the main heading", async () => {
      await renderNosotrosPage();

      expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
      expect(screen.getByText("title")).toBeInTheDocument();
    });

    it("should render the hero section tagline", async () => {
      await renderNosotrosPage();

      expect(screen.getByText("subtitle")).toBeInTheDocument();
      expect(screen.getByText("badge")).toBeInTheDocument();
    });
  });

  describe("Three main cards", () => {
    it("should render all three card headings", async () => {
      await renderNosotrosPage();

      expect(screen.getByText("originsTitle")).toBeInTheDocument();
      expect(screen.getByText("familyTitle")).toBeInTheDocument();
      expect(screen.getByText("legacyTitle")).toBeInTheDocument();
    });

    it("should render founding story in card 1", async () => {
      await renderNosotrosPage();

      expect(screen.getByText("originsDate")).toBeInTheDocument();
      expect(screen.getByText("originsText1")).toBeInTheDocument();
      expect(screen.getByText("originsText2")).toBeInTheDocument();
    });

    it("should render LaLiga quote in card 1", async () => {
      await renderNosotrosPage();

      expect(screen.getByText("originsQuote")).toBeInTheDocument();
      expect(screen.getByText("originsSource")).toBeInTheDocument();
    });

    it("should render community description in card 2", async () => {
      await renderNosotrosPage();

      expect(screen.getByText("familyText1")).toBeInTheDocument();
      expect(screen.getByText("familyRecognition")).toBeInTheDocument();
    });

    it("should render condensed timeline in card 3", async () => {
      await renderNosotrosPage();

      // Check for the 3 key milestones
      expect(screen.getByText("2010")).toBeInTheDocument();
      expect(screen.getByText("2015")).toBeInTheDocument();
      expect(screen.getByText("2018")).toBeInTheDocument();

      expect(screen.getByText("legacy2010")).toBeInTheDocument();
      expect(screen.getByText("legacy2015")).toBeInTheDocument();
      expect(screen.getByText("legacy2018")).toBeInTheDocument();
    });

    it("should render icons for all cards", async () => {
      await renderNosotrosPage();

      expect(screen.getAllByTestId("heart-icon").length).toBeGreaterThan(0);
      expect(screen.getAllByTestId("users-icon").length).toBeGreaterThan(0);
      expect(screen.getAllByTestId("calendar-icon").length).toBeGreaterThan(0);
    });
  });

  describe("Call to action section", () => {
    it("should render CTA heading and text", async () => {
      await renderNosotrosPage();

      expect(screen.getByText("ctaTitle")).toBeInTheDocument();
      expect(screen.getByText("ctaText")).toBeInTheDocument();
    });

    it("should render navigation links", async () => {
      await renderNosotrosPage();

      const uneteLink = screen.getByRole("link", {
        name: /ctaJoin/,
      });
      const partidosLink = screen.getByRole("link", { name: /ctaMatches/ });

      expect(uneteLink).toHaveAttribute("href", "/unete");
      expect(partidosLink).toHaveAttribute("href", "/partidos");
    });
  });

  describe("Design system consistency", () => {
    it("should use cultural fusion design patterns", async () => {
      const { container } = await renderNosotrosPage();

      // Check for design system classes
      expect(container.querySelector(".bg-hero-fusion")).toBeInTheDocument();
      expect(
        container.querySelector(".pattern-tartan-navy"),
      ).toBeInTheDocument();
      expect(
        container.querySelector(".pattern-verdiblanco-subtle"),
      ).toBeInTheDocument();
    });

    it("should use typography system classes", async () => {
      await renderNosotrosPage();

      const heading = screen.getByText("title");
      expect(heading).toHaveClass("font-display");
    });
  });

  describe("Accessibility", () => {
    it("should have proper heading hierarchy", async () => {
      await renderNosotrosPage();

      const headings = screen.getAllByRole("heading");
      expect(headings.length).toBeGreaterThan(0);

      // Should have a main heading (h1)
      const h1 = screen.getByRole("heading", { level: 1 });
      expect(h1).toBeInTheDocument();
      expect(h1).toHaveTextContent("title");
    });

    it("should have proper link structure", async () => {
      await renderNosotrosPage();

      const links = screen.getAllByRole("link");
      expect(links.length).toBeGreaterThan(0);
      expect(links[0]).toHaveAttribute("href");
    });
  });
});
