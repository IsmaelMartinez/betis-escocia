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
  describe("Basic rendering", () => {
    it("should render the main heading", async () => {
      const UnetePage = (await import("@/app/unete/page")).default;
      render(<UnetePage />);

      const h1 = screen.getByRole("heading", { level: 1 });
      expect(h1).toBeInTheDocument();
      expect(h1).toHaveTextContent("Únete");
    });

    it("should render tagline", async () => {
      const UnetePage = (await import("@/app/unete/page")).default;
      render(<UnetePage />);

      expect(
        screen.getByText(/Tres cosas que necesitas saber/),
      ).toBeInTheDocument();
    });
  });

  describe("Three main cards", () => {
    it("should render all three card headings", async () => {
      const UnetePage = (await import("@/app/unete/page")).default;
      render(<UnetePage />);

      expect(screen.getByText("1. Aparece")).toBeInTheDocument();
      expect(screen.getByText("2. Conéctate")).toBeInTheDocument();
      expect(screen.getByText("3. Disfruta")).toBeInTheDocument();
    });

    it("should render location information in card 1", async () => {
      const UnetePage = (await import("@/app/unete/page")).default;
      render(<UnetePage />);

      expect(screen.getByText("Polwarth Tavern")).toBeInTheDocument();
      expect(screen.getByText(/35 Polwarth Crescent/)).toBeInTheDocument();
      expect(screen.getByText(/Edinburgh EH11 1HR/)).toBeInTheDocument();
      expect(
        screen.getByText(/15 minutos antes del partido/),
      ).toBeInTheDocument();
    });

    it("should render social media links in card 2", async () => {
      const UnetePage = (await import("@/app/unete/page")).default;
      render(<UnetePage />);

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
      const UnetePage = (await import("@/app/unete/page")).default;
      render(<UnetePage />);

      expect(screen.getByText(/Sin cuotas ni gastos/)).toBeInTheDocument();
      expect(
        screen.getByText(/Ambiente familiar y acogedor/),
      ).toBeInTheDocument();
      expect(screen.getByText(/Niños bienvenidos/)).toBeInTheDocument();
      expect(screen.getByText(/No hace falta reservar/)).toBeInTheDocument();
    });
  });

  describe("Visitor information section", () => {
    it("should render visitor welcome message", async () => {
      const UnetePage = (await import("@/app/unete/page")).default;
      render(<UnetePage />);

      expect(screen.getByText(/¿De visita en Escocia?/)).toBeInTheDocument();
      expect(
        screen.getByText(/Turistas, estudiantes, trabajadores temporales/),
      ).toBeInTheDocument();
    });
  });

  describe("Links and CTAs", () => {
    it("should render Google Maps link", async () => {
      const UnetePage = (await import("@/app/unete/page")).default;
      render(<UnetePage />);

      const mapsLink = screen.getByRole("link", { name: /Abrir en Maps/ });
      expect(mapsLink).toHaveAttribute(
        "href",
        "https://maps.google.com/maps?q=Polwarth+Tavern+Edinburgh",
      );
    });

    it("should render Ver Próximos Partidos CTA", async () => {
      const UnetePage = (await import("@/app/unete/page")).default;
      render(<UnetePage />);

      const ctaLink = screen.getByRole("link", {
        name: /Ver Próximos Partidos/,
      });
      expect(ctaLink).toHaveAttribute("href", "/partidos");
    });
  });

  describe("Accessibility", () => {
    it("should have proper heading structure", async () => {
      const UnetePage = (await import("@/app/unete/page")).default;
      render(<UnetePage />);

      const headings = screen.getAllByRole("heading");
      expect(headings.length).toBeGreaterThan(0);

      // Should have a main heading (h1)
      const h1 = screen.getByRole("heading", { level: 1 });
      expect(h1).toBeInTheDocument();
    });

    it("should have external links with proper attributes", async () => {
      const UnetePage = (await import("@/app/unete/page")).default;
      render(<UnetePage />);

      const externalLinks = screen.getAllByRole("link", {
        name: /Facebook|Instagram|Maps/,
      });
      externalLinks.forEach((link) => {
        expect(link).toHaveAttribute("target", "_blank");
        expect(link).toHaveAttribute("rel", "noopener noreferrer");
      });
    });
  });

  describe("Design system consistency", () => {
    it("should use cultural fusion design patterns", async () => {
      const UnetePage = (await import("@/app/unete/page")).default;
      const { container } = render(<UnetePage />);

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
      const UnetePage = (await import("@/app/unete/page")).default;
      render(<UnetePage />);

      expect(screen.getAllByTestId("map-pin-icon").length).toBeGreaterThan(0);
      expect(screen.getAllByTestId("clock-icon").length).toBeGreaterThan(0);
      expect(screen.getAllByTestId("users-icon").length).toBeGreaterThan(0);
    });
  });
});
