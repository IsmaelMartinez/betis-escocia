import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// Mock Next.js Link component
vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock FeatureWrapper to always render children (feature enabled)
vi.mock("@/lib/features/featureProtection", () => ({
  FeatureWrapper: ({ children }: { children: React.ReactNode }) => <>{children}</>,
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

describe("Nosotros Page", () => {
  describe("Basic rendering", () => {
    it("should render the main heading", async () => {
      const { NosotrosContent } = await import(
        "@/app/[locale]/nosotros/page"
      );
      render(<NosotrosContent />);

      expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
      expect(screen.getByText("Nosotros")).toBeInTheDocument();
    });

    it("should render the hero section tagline", async () => {
      const { NosotrosContent } = await import(
        "@/app/[locale]/nosotros/page"
      );
      render(<NosotrosContent />);

      expect(
        screen.getByText("Más que una peña, somos familia"),
      ).toBeInTheDocument();
      expect(screen.getByText(/💚 Nuestra Historia/)).toBeInTheDocument();
    });
  });

  describe("Three main cards", () => {
    it("should render all three card headings", async () => {
      const { NosotrosContent } = await import(
        "@/app/[locale]/nosotros/page"
      );
      render(<NosotrosContent />);

      expect(screen.getByText("Nuestros Orígenes")).toBeInTheDocument();
      expect(screen.getByText("Nuestra Familia")).toBeInTheDocument();
      expect(screen.getByText("Nuestro Legado")).toBeInTheDocument();
    });

    it("should render founding story in card 1", async () => {
      const { NosotrosContent } = await import(
        "@/app/[locale]/nosotros/page"
      );
      render(<NosotrosContent />);

      expect(screen.getByText(/4 de diciembre de 2010/)).toBeInTheDocument();
      expect(
        screen.getByText(/Juan Morata y José María Conde/),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/primera peña oficial del Real Betis en Reino Unido/),
      ).toBeInTheDocument();
    });

    it("should render LaLiga quote in card 1", async () => {
      const { NosotrosContent } = await import(
        "@/app/[locale]/nosotros/page"
      );
      render(<NosotrosContent />);

      expect(
        screen.getByText(
          /La idea vino tomando algo en un pub. Simplemente lo decidieron así/,
        ),
      ).toBeInTheDocument();
      expect(screen.getByText("— LaLiga oficial")).toBeInTheDocument();
    });

    it("should render community description in card 2", async () => {
      const { NosotrosContent } = await import(
        "@/app/[locale]/nosotros/page"
      );
      render(<NosotrosContent />);

      expect(screen.getByText(/todos son bienvenidos/)).toBeInTheDocument();
      expect(
        screen.getByText(
          /Reconocidos por LaLiga como "bastión" del betismo en Escocia/,
        ),
      ).toBeInTheDocument();
    });

    it("should render condensed timeline in card 3", async () => {
      const { NosotrosContent } = await import(
        "@/app/[locale]/nosotros/page"
      );
      render(<NosotrosContent />);

      // Check for the 3 key milestones
      expect(screen.getByText("2010")).toBeInTheDocument();
      expect(screen.getByText("2015")).toBeInTheDocument();
      expect(screen.getByText("2018")).toBeInTheDocument();

      expect(
        screen.getByText(/Primera peña oficial del Betis en Reino Unido/),
      ).toBeInTheDocument();
      expect(screen.getByText(/Nuevo hogar en Polwarth Tavern/)).toBeInTheDocument();
      expect(
        screen.getByText(/Reconocimiento oficial de LaLiga/),
      ).toBeInTheDocument();
    });

    it("should render icons for all cards", async () => {
      const { NosotrosContent } = await import(
        "@/app/[locale]/nosotros/page"
      );
      render(<NosotrosContent />);

      expect(screen.getAllByTestId("heart-icon").length).toBeGreaterThan(0);
      expect(screen.getAllByTestId("users-icon").length).toBeGreaterThan(0);
      expect(screen.getAllByTestId("calendar-icon").length).toBeGreaterThan(0);
    });
  });

  describe("Call to action section", () => {
    it("should render CTA heading and text", async () => {
      const { NosotrosContent } = await import(
        "@/app/[locale]/nosotros/page"
      );
      render(<NosotrosContent />);

      expect(
        screen.getByText(/¿Quieres ser parte de nuestra historia?/),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Tu historia también puede formar parte de la nuestra/),
      ).toBeInTheDocument();
    });

    it("should render navigation links", async () => {
      const { NosotrosContent } = await import(
        "@/app/[locale]/nosotros/page"
      );
      render(<NosotrosContent />);

      const uneteLink = screen.getByRole("link", {
        name: /Únete a Nosotros/,
      });
      const partidosLink = screen.getByRole("link", { name: /Ver Partidos/ });

      expect(uneteLink).toHaveAttribute("href", "/unete");
      expect(partidosLink).toHaveAttribute("href", "/partidos");
    });
  });

  describe("Design system consistency", () => {
    it("should use cultural fusion design patterns", async () => {
      const { NosotrosContent } = await import(
        "@/app/[locale]/nosotros/page"
      );
      const { container } = render(<NosotrosContent />);

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
      const { NosotrosContent } = await import(
        "@/app/[locale]/nosotros/page"
      );
      render(<NosotrosContent />);

      const heading = screen.getByText("Nosotros");
      expect(heading).toHaveClass("font-display");
    });
  });

  describe("Accessibility", () => {
    it("should have proper heading hierarchy", async () => {
      const { NosotrosContent } = await import(
        "@/app/[locale]/nosotros/page"
      );
      render(<NosotrosContent />);

      const headings = screen.getAllByRole("heading");
      expect(headings.length).toBeGreaterThan(0);

      // Should have a main heading (h1)
      const h1 = screen.getByRole("heading", { level: 1 });
      expect(h1).toBeInTheDocument();
      expect(h1).toHaveTextContent("Nosotros");
    });

    it("should have proper link structure", async () => {
      const { NosotrosContent } = await import(
        "@/app/[locale]/nosotros/page"
      );
      render(<NosotrosContent />);

      const links = screen.getAllByRole("link");
      expect(links.length).toBeGreaterThan(0);
      expect(links[0]).toHaveAttribute("href");
    });
  });
});
