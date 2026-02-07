import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Hero from "@/components/hero/Hero";

// Mock Next.js Link
vi.mock("next/link", () => ({
  default: vi.fn(({ href, className, children }) => (
    <a href={href} className={className} data-testid="next-link">
      {children}
    </a>
  )),
}));

// Mock FeatureWrapper to always render children (feature enabled)
vi.mock("@/lib/features/featureProtection", () => ({
  FeatureWrapper: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

// Mock Lucide React icons
vi.mock("lucide-react", () => ({
  MapPin: vi.fn(({ className }) => (
    <div data-testid="map-pin-icon" className={className} />
  )),
  Calendar: vi.fn(({ className }) => (
    <div data-testid="calendar-icon" className={className} />
  )),
  Users: vi.fn(({ className }) => (
    <div data-testid="users-icon" className={className} />
  )),
  Heart: vi.fn(({ className }) => (
    <div data-testid="heart-icon" className={className} />
  )),
}));

describe("Hero", () => {
  describe("Basic rendering", () => {
    it("renders hero section with correct structure", () => {
      const { container } = render(<Hero />);

      const section = container.querySelector("section");
      expect(section).toHaveClass(
        "relative",
        "min-h-screen",
        "bg-betis-black",
        "text-white",
        "overflow-hidden",
      );
    });

    it("renders main heading with correct text", () => {
      render(<Hero />);

      expect(screen.getByText("No busques más")).toBeInTheDocument();
      expect(screen.getByText("que no hay")).toBeInTheDocument();
    });

    it("renders main tagline", () => {
      render(<Hero />);

      expect(
        screen.getByText("¡Viva er Betis manque pierda!"),
      ).toBeInTheDocument();
    });

    it("renders peña description", () => {
      render(<Hero />);

      expect(
        screen.getByText(/La peña del Real Betis en Edimburgo, Escocia/),
      ).toBeInTheDocument();
      expect(screen.getAllByText("Polwarth Tavern")).toHaveLength(3);
      expect(screen.getByText("¡únete a nosotros!")).toBeInTheDocument();
    });

    it("renders premium badge", () => {
      render(<Hero />);

      expect(screen.getByText("DESDE SEVILLA A EDIMBURGO")).toBeInTheDocument();
    });
  });

  describe("Feature cards", () => {
    it("renders all three feature cards", () => {
      render(<Hero />);

      expect(screen.getAllByText("Polwarth Tavern")).toHaveLength(3);
      expect(screen.getByText("Cada Partido")).toBeInTheDocument();
      expect(screen.getByText("Todos Bienvenidos")).toBeInTheDocument();
    });

    it("renders feature card descriptions", () => {
      render(<Hero />);

      expect(
        screen.getByText(/Nuestro hogar en Edimburgo/),
      ).toBeInTheDocument();
      expect(screen.getByText(/Liga, Copa, Europa/)).toBeInTheDocument();
      expect(screen.getByText(/Especialmente visitantes/)).toBeInTheDocument();
    });

    it("renders feature card icons", () => {
      render(<Hero />);

      expect(screen.getAllByTestId("map-pin-icon")).toHaveLength(2); // One in card, one in next match
      expect(screen.getAllByTestId("calendar-icon")).toHaveLength(3); // One in card, one in CTA, one in next match
      expect(screen.getAllByTestId("users-icon")).toHaveLength(2); // One in card, one in CTA
    });
  });

  describe("Call-to-action buttons", () => {
    it("renders CTA buttons with correct links", () => {
      render(<Hero />);

      const uneteLink = screen.getByText("Únete a nosotros").closest("a");
      const partidosLink = screen.getByText(/Ver Partidos/).closest("a");

      expect(uneteLink).toHaveAttribute("href", "/unete");
      expect(partidosLink).toHaveAttribute("href", "/partidos");
    });

    it("renders CTA button text and icons", () => {
      render(<Hero />);

      expect(screen.getByText("Únete a nosotros")).toBeInTheDocument();
      expect(screen.getByText("📅 Ver Partidos")).toBeInTheDocument();
    });
  });

  describe("Social media section", () => {
    it("renders social media heading", () => {
      render(<Hero />);

      expect(
        screen.getByText("Síguenos en nuestras redes:"),
      ).toBeInTheDocument();
    });

    it("renders social media links with correct hrefs", () => {
      render(<Hero />);

      const allLinks = screen.getAllByRole("link");
      const facebookLink = allLinks.find((link) =>
        link.getAttribute("href")?.includes("facebook"),
      );
      const instagramLink = allLinks.find((link) =>
        link.getAttribute("href")?.includes("instagram"),
      );

      expect(facebookLink).toHaveAttribute(
        "href",
        "https://www.facebook.com/groups/beticosenescocia/",
      );
      expect(instagramLink).toHaveAttribute(
        "href",
        "https://www.instagram.com/rbetisescocia/",
      );
    });

    it("renders social media links with correct attributes", () => {
      render(<Hero />);

      const socialLinks = screen
        .getAllByRole("link")
        .filter(
          (link) =>
            link.getAttribute("href")?.includes("facebook") ||
            link.getAttribute("href")?.includes("instagram"),
        );

      socialLinks.forEach((link) => {
        expect(link).toHaveAttribute("target", "_blank");
        expect(link).toHaveAttribute("rel", "noopener noreferrer");
      });
    });
  });

  describe("Statistics section", () => {
    it("renders community statistics", () => {
      render(<Hero />);

      expect(screen.getByText("15+")).toBeInTheDocument();
      expect(screen.getByText("Años activos")).toBeInTheDocument();
      expect(screen.getByText("200+")).toBeInTheDocument();
      expect(screen.getByText("Miembros")).toBeInTheDocument();
      expect(screen.getByText("100%")).toBeInTheDocument();
      expect(screen.getByText("Bético")).toBeInTheDocument();
    });
  });

  describe("Next match preview", () => {
    it("renders next match section", () => {
      render(<Hero />);

      expect(screen.getByText("PRÓXIMO PARTIDO")).toBeInTheDocument();
      expect(screen.getByText("Real Betis vs Sevilla FC")).toBeInTheDocument();
      expect(screen.getByText("15 Julio, 20:00")).toBeInTheDocument();
    });

    it("renders match venue information", () => {
      render(<Hero />);

      expect(screen.getAllByText("Polwarth Tavern")).toHaveLength(3); // One in feature card, one in match
      expect(screen.getByText("Llegada: 19:30")).toBeInTheDocument();
      expect(
        screen.getByText("¡15 minutos antes para asegurar sitio!"),
      ).toBeInTheDocument();
    });

    it("renders derby highlight", () => {
      render(<Hero />);

      expect(screen.getByText("🔥 ¡EL DERBI SEVILLANO!")).toBeInTheDocument();
    });
  });

  describe("Background and styling", () => {
    it("applies correct background classes", () => {
      const { container } = render(<Hero />);
      const section = container.querySelector("section");
      expect(section).toHaveClass("bg-betis-black", "text-white");
    });

    it("renders with responsive layout classes", () => {
      const { container } = render(<Hero />);
      const maxWidthContainer = container.querySelector(".max-w-7xl");
      expect(maxWidthContainer).toHaveClass(
        "mx-auto",
        "px-4",
        "sm:px-6",
        "lg:px-8",
      );
    });
  });

  describe("Accessibility", () => {
    it("uses semantic HTML structure", () => {
      const { container } = render(<Hero />);
      expect(container.querySelector("section")).toBeInTheDocument();
      expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    });

    it("provides proper headings hierarchy", () => {
      render(<Hero />);

      const h1 = screen.getByRole("heading", { level: 1 });
      const h3Elements = screen.getAllByRole("heading", { level: 3 });

      expect(h1).toBeInTheDocument();
      expect(h3Elements.length).toBeGreaterThan(0);
    });

    it("includes proper link accessibility", () => {
      render(<Hero />);

      const links = screen.getAllByRole("link");
      expect(links.length).toBeGreaterThan(0);

      // Check that external links have proper attributes
      const externalLinks = links.filter(
        (link) => link.getAttribute("target") === "_blank",
      );

      externalLinks.forEach((link) => {
        expect(link).toHaveAttribute("rel", "noopener noreferrer");
      });
    });
  });

  describe("Interactive elements", () => {
    it("renders interactive buttons with proper classes", () => {
      render(<Hero />);

      const uneteButton = screen.getByText("Únete a nosotros").closest("a");
      const partidosButton = screen.getByText(/Ver Partidos/).closest("a");

      expect(uneteButton).toHaveClass("group");
      expect(partidosButton).toHaveClass("group");
    });

    it("includes hover and transition classes", () => {
      render(<Hero />);

      const featureCards = screen
        .getAllByText("Polwarth Tavern")[1]
        .closest("div");
      expect(featureCards?.className).toContain("hover:");
      expect(featureCards?.className).toContain("transition");
    });
  });

  describe("Component structure", () => {
    it("renders as a single section element", () => {
      const { container } = render(<Hero />);

      expect(container.firstChild?.nodeName).toBe("SECTION");
      expect(container.children).toHaveLength(1);
    });

    it("maintains proper nesting structure", () => {
      render(<Hero />);

      const { container } = render(<Hero />);
      const section = container.querySelector("section");
      const maxWidthContainer = section?.querySelector(".max-w-7xl");

      expect(maxWidthContainer).toBeInTheDocument();
      expect(maxWidthContainer?.closest("section")).toBe(section);
    });
  });

  describe("Heart icon animation", () => {
    it("renders heart icon with animation classes", () => {
      render(<Hero />);

      const heartIcons = screen.getAllByTestId("heart-icon");
      expect(heartIcons.length).toBeGreaterThan(0);

      // Check that at least one heart icon has animation classes
      const animatedHeart = heartIcons.find((heart) =>
        heart.className.includes("animate-pulse"),
      );
      expect(animatedHeart).toBeTruthy();
    });
  });
});
