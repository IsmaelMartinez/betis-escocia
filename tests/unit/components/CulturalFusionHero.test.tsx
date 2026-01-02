import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import CulturalFusionHero from "@/components/CulturalFusionHero";

describe("CulturalFusionHero Component", () => {
  describe("Basic rendering", () => {
    it("renders children content", () => {
      render(
        <CulturalFusionHero>
          <h1>Test Heading</h1>
          <p>Test paragraph</p>
        </CulturalFusionHero>,
      );

      expect(screen.getByText("Test Heading")).toBeInTheDocument();
      expect(screen.getByText("Test paragraph")).toBeInTheDocument();
    });

    it("renders as a section element", () => {
      const { container } = render(
        <CulturalFusionHero>
          <div>Content</div>
        </CulturalFusionHero>,
      );

      const section = container.querySelector("section");
      expect(section).toBeInTheDocument();
    });

    it("has overflow-hidden class on section", () => {
      const { container } = render(
        <CulturalFusionHero>
          <div>Content</div>
        </CulturalFusionHero>,
      );

      const section = container.querySelector("section");
      expect(section).toHaveClass("overflow-hidden");
    });
  });

  describe("Background layers", () => {
    it("renders hero fusion background layer", () => {
      const { container } = render(
        <CulturalFusionHero>
          <div>Content</div>
        </CulturalFusionHero>,
      );

      const heroFusion = container.querySelector(".bg-hero-fusion");
      expect(heroFusion).toBeInTheDocument();
      expect(heroFusion).toHaveClass("absolute", "inset-0");
    });

    it("renders tartan navy pattern layer", () => {
      const { container } = render(
        <CulturalFusionHero>
          <div>Content</div>
        </CulturalFusionHero>,
      );

      const tartanNavy = container.querySelector(".pattern-tartan-navy");
      expect(tartanNavy).toBeInTheDocument();
      expect(tartanNavy).toHaveClass("opacity-25");
    });

    it("renders verdiblanco subtle pattern layer", () => {
      const { container } = render(
        <CulturalFusionHero>
          <div>Content</div>
        </CulturalFusionHero>,
      );

      const verdiblanco = container.querySelector(
        ".pattern-verdiblanco-subtle",
      );
      expect(verdiblanco).toBeInTheDocument();
      expect(verdiblanco).toHaveClass("opacity-30");
    });

    it("renders oro glow accent layer", () => {
      const { container } = render(
        <CulturalFusionHero>
          <div>Content</div>
        </CulturalFusionHero>,
      );

      const oroGlow = container.querySelector(".bg-oro-glow");
      expect(oroGlow).toBeInTheDocument();
      expect(oroGlow).toHaveClass("blur-3xl", "opacity-40", "pointer-events-none");
    });
  });

  describe("Container styling", () => {
    it("applies default container classes", () => {
      const { container } = render(
        <CulturalFusionHero>
          <div>Content</div>
        </CulturalFusionHero>,
      );

      const contentContainer = container.querySelector(".mx-auto");
      expect(contentContainer).toHaveClass(
        "mx-auto",
        "px-4",
        "sm:px-6",
        "lg:px-8",
      );
    });

    it("applies default max-width and text-center", () => {
      const { container } = render(
        <CulturalFusionHero>
          <div>Content</div>
        </CulturalFusionHero>,
      );

      const contentContainer = container.querySelector(".mx-auto");
      expect(contentContainer).toHaveClass("max-w-6xl", "text-center");
    });

    it("applies custom containerClassName", () => {
      const { container } = render(
        <CulturalFusionHero containerClassName="max-w-4xl">
          <div>Content</div>
        </CulturalFusionHero>,
      );

      const contentContainer = container.querySelector(".mx-auto");
      expect(contentContainer).toHaveClass("max-w-4xl");
      // Should still have common layout classes
      expect(contentContainer).toHaveClass("mx-auto", "px-4");
    });

    it("allows text alignment override via containerClassName", () => {
      const { container } = render(
        <CulturalFusionHero containerClassName="max-w-4xl text-left">
          <div>Content</div>
        </CulturalFusionHero>,
      );

      const contentContainer = container.querySelector(".mx-auto");
      expect(contentContainer).toHaveClass("text-left");
    });
  });

  describe("Accessibility", () => {
    it("renders section with proper structure for screen readers", () => {
      const { container } = render(
        <CulturalFusionHero>
          <h1>Main Heading</h1>
        </CulturalFusionHero>,
      );

      const section = container.querySelector("section");
      expect(section).toBeInTheDocument();
      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
        "Main Heading",
      );
    });

    it("content is accessible despite background layers", () => {
      render(
        <CulturalFusionHero>
          <button>Click me</button>
        </CulturalFusionHero>,
      );

      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent("Click me");
    });
  });

  describe("Integration scenarios", () => {
    it("works with centered single-column content", () => {
      render(
        <CulturalFusionHero containerClassName="max-w-4xl text-center">
          <h1 className="text-white">Contacto</h1>
          <p className="text-oro-bright">Get in touch</p>
        </CulturalFusionHero>,
      );

      expect(screen.getByText("Contacto")).toBeInTheDocument();
      expect(screen.getByText("Get in touch")).toBeInTheDocument();
    });

    it("works with side-by-side layout", () => {
      render(
        <CulturalFusionHero containerClassName="max-w-4xl">
          <div className="flex gap-8">
            <div className="flex-1">
              <h1>Left content</h1>
            </div>
            <div>
              <div>Right content</div>
            </div>
          </div>
        </CulturalFusionHero>,
      );

      expect(screen.getByText("Left content")).toBeInTheDocument();
      expect(screen.getByText("Right content")).toBeInTheDocument();
    });

    it("works with badge and content", () => {
      render(
        <CulturalFusionHero containerClassName="max-w-4xl text-center">
          <div className="mb-8">Badge</div>
          <h1>Title</h1>
          <p>Description</p>
        </CulturalFusionHero>,
      );

      expect(screen.getByText("Badge")).toBeInTheDocument();
      expect(screen.getByText("Title")).toBeInTheDocument();
      expect(screen.getByText("Description")).toBeInTheDocument();
    });
  });
});
