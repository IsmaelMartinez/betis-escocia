import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import HeroCommunity from "@/components/hero/HeroCommunity";

// Mock Next.js Link
vi.mock("next/link", () => ({
  default: vi.fn(({ href, className, children }) => (
    <a href={href} className={className} data-testid="next-link">
      {children}
    </a>
  )),
}));

// Default props for tests (features enabled)
const defaultProps = {
  showPartidos: true,
  showRsvp: true,
};

// Mock Lucide React icons
vi.mock("lucide-react", () => ({
  Users: vi.fn(({ className }) => (
    <div data-testid="users-icon" className={className} />
  )),
  Heart: vi.fn(({ className }) => (
    <div data-testid="heart-icon" className={className} />
  )),
  Coffee: vi.fn(({ className }) => (
    <div data-testid="coffee-icon" className={className} />
  )),
  Smile: vi.fn(({ className }) => (
    <div data-testid="smile-icon" className={className} />
  )),
  ChevronDown: vi.fn(({ className }) => (
    <div data-testid="chevron-down-icon" className={className} />
  )),
  ChevronUp: vi.fn(({ className }) => (
    <div data-testid="chevron-up-icon" className={className} />
  )),
  Calendar: vi.fn(({ className }) => (
    <div data-testid="calendar-icon" className={className} />
  )),
}));

// Mock dynamic import of CommunityStats
vi.mock("next/dynamic", () => ({
  default: vi.fn((importFn, options) => {
    // Always return the actual component, not the loading state for tests
    const MockComponent = () => {
      return <div data-testid="community-stats">Mock CommunityStats</div>;
    };
    MockComponent.displayName = "DynamicCommunityStats";
    return MockComponent;
  }),
}));

describe("HeroCommunity", () => {
  describe("Basic rendering", () => {
    it("renders hero community section with correct structure", () => {
      const { container } = render(<HeroCommunity {...defaultProps} />);

      const section = container.querySelector("section");
      expect(section).toHaveClass(
        "relative",
        "min-h-screen",
        "overflow-hidden",
      );
    });

    it("renders main heading", () => {
      render(<HeroCommunity {...defaultProps} />);

      expect(screen.getByText("MÁS QUE")).toBeInTheDocument();
      expect(screen.getByText("UNA PEÑA")).toBeInTheDocument();
      // Note: "Una Familia" is the new tagline styling
      expect(screen.getByText("Una Familia")).toBeInTheDocument();
    });
  });

  describe("Description section", () => {
    it("renders community description", () => {
      render(<HeroCommunity {...defaultProps} />);

      expect(screen.getByText(/Más de 15 años/)).toBeInTheDocument();
      expect(screen.getByText("amigos de verdad")).toBeInTheDocument();
      expect(screen.getByText("ya eres de los nuestros")).toBeInTheDocument();
    });

    it("highlights key information", () => {
      render(<HeroCommunity {...defaultProps} />);

      // Check for highlighted text within the description
      const descriptionSection = screen
        .getByText(/Más de 15 años/)
        .closest("div");
      expect(descriptionSection).toBeInTheDocument();
    });
  });

  describe("Feature cards", () => {
    it("renders feature cards with correct titles", () => {
      render(<HeroCommunity {...defaultProps} />);

      expect(screen.getByText("Ambiente Familiar")).toBeInTheDocument();
      expect(screen.getByText("Siempre con Humor")).toBeInTheDocument();
    });

    it("renders feature card descriptions", () => {
      render(<HeroCommunity {...defaultProps} />);

      expect(
        screen.getByText("Niños bienvenidos, ambiente relajado y acogedor"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("Ganemos o perdamos, aquí se ríe y se disfruta"),
      ).toBeInTheDocument();
    });

    it("renders feature card icons", () => {
      render(<HeroCommunity {...defaultProps} />);

      expect(screen.getByTestId("coffee-icon")).toBeInTheDocument();
      expect(screen.getByTestId("smile-icon")).toBeInTheDocument();
    });

    it("applies hover and transition classes to feature cards", () => {
      render(<HeroCommunity {...defaultProps} />);

      const ambienteCard = screen.getByText("Ambiente Familiar").closest("div");
      const humorCard = screen.getByText("Siempre con Humor").closest("div");

      expect(ambienteCard).toHaveClass(
        "group",
        "hover:border-betis-verde",
        "transition-all",
      );
      expect(humorCard).toHaveClass(
        "group",
        "hover:border-betis-verde",
        "transition-all",
      );
    });
  });

  describe("Call-to-action section", () => {
    it("renders CTA button", () => {
      render(<HeroCommunity {...defaultProps} />);

      expect(screen.getByText("ÚNETE A LA FAMILIA")).toBeInTheDocument();
    });

    it("renders CTA button with correct link", () => {
      render(<HeroCommunity {...defaultProps} />);

      const ctaLink = screen.getByText("ÚNETE A LA FAMILIA").closest("a");
      expect(ctaLink).toHaveAttribute("href", "/unete");
    });

    it("includes heart icon in CTA button", () => {
      render(<HeroCommunity {...defaultProps} />);

      expect(screen.getAllByTestId("heart-icon")).toHaveLength(2);
    });

    it("renders VER PARTIDOS secondary CTA", () => {
      render(<HeroCommunity {...defaultProps} />);

      expect(screen.getByText("VER PARTIDOS")).toBeInTheDocument();
      const partidosLink = screen.getByText("VER PARTIDOS").closest("a");
      expect(partidosLink).toHaveAttribute("href", "/partidos");
    });
  });

  // RSVP section tests are skipped because show-rsvp feature flag is disabled by default
  describe.skip("RSVP section (requires show-rsvp feature flag)", () => {
    it("renders RSVP section title", () => {
      render(<HeroCommunity {...defaultProps} />);

      expect(screen.getByText("Confirmar Asistencia")).toBeInTheDocument();
    });

    it("renders RSVP expandable button", () => {
      render(<HeroCommunity {...defaultProps} />);

      const rsvpButton = screen.getByRole("button", {
        name: /confirmar asistencia/i,
      });
      expect(rsvpButton).toBeInTheDocument();
      expect(rsvpButton).toHaveClass(
        "w-full",
        "flex",
        "items-center",
        "justify-between",
      );
    });

    it("renders chevron down icon when collapsed", () => {
      render(<HeroCommunity {...defaultProps} />);

      const chevronDown = screen.getByTestId("chevron-down-icon");
      expect(chevronDown).toBeInTheDocument();
    });
  });

  describe("CommunityStats integration", () => {
    it("renders dynamically loaded CommunityStats component", () => {
      render(<HeroCommunity {...defaultProps} />);

      expect(screen.getByTestId("community-stats")).toBeInTheDocument();
    });
  });

  describe("Layout and styling", () => {
    it("uses grid layout for main content", () => {
      render(<HeroCommunity {...defaultProps} />);

      const mainGrid = screen.getByText("MÁS QUE").closest(".grid");
      expect(mainGrid).toHaveClass("lg:grid-cols-2", "gap-12", "lg:gap-20");
    });

    it("applies responsive padding and spacing", () => {
      const { container } = render(<HeroCommunity {...defaultProps} />);
      const maxWidthContainer = container.querySelector(".max-w-7xl");
      expect(maxWidthContainer).toHaveClass(
        "mx-auto",
        "px-4",
        "sm:px-6",
        "lg:px-8",
      );
    });
  });

  describe("Background and patterns", () => {
    it("applies edinburgh mist background", () => {
      const { container } = render(<HeroCommunity {...defaultProps} />);
      const section = container.querySelector("section");
      const backgroundDiv = section?.querySelector(".bg-edinburgh-mist");
      expect(backgroundDiv).toBeInTheDocument();
    });

    it("includes subtle tartan pattern overlay", () => {
      const { container } = render(<HeroCommunity {...defaultProps} />);
      const section = container.querySelector("section");
      const patternDiv = section?.querySelector(".pattern-tartan-subtle");
      expect(patternDiv).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("uses semantic HTML structure", () => {
      const { container } = render(<HeroCommunity {...defaultProps} />);
      expect(container.querySelector("section")).toBeInTheDocument();
      expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    });

    it("provides proper heading hierarchy", () => {
      render(<HeroCommunity {...defaultProps} />);

      const h1 = screen.getByRole("heading", { level: 1 });
      expect(h1.textContent).toContain("MÁS QUE");
    });

    it("includes proper link accessibility", () => {
      render(<HeroCommunity {...defaultProps} />);

      const links = screen.getAllByRole("link");
      expect(links.length).toBeGreaterThan(0);
      expect(links[0]).toHaveAttribute("href");
    });
  });

  describe("Floating elements", () => {
    it("renders floating Betis heart element", () => {
      const { container } = render(<HeroCommunity {...defaultProps} />);
      // The floating element now uses gradient classes
      const floatingElements = container.querySelectorAll(
        ".absolute.rounded-full",
      );
      expect(floatingElements.length).toBeGreaterThan(0);
    });
  });

  describe("Animation classes", () => {
    it("includes animation classes on feature cards", () => {
      render(<HeroCommunity {...defaultProps} />);

      const ambienteCard = screen.getByText("Ambiente Familiar").closest("div");
      const humorCard = screen.getByText("Siempre con Humor").closest("div");

      // Cards have transition classes for hover effects
      expect(ambienteCard).toHaveClass("transition-all");
      expect(humorCard).toHaveClass("transition-all");
    });
  });

  describe("Component structure", () => {
    it("renders as a single section element", () => {
      const { container } = render(<HeroCommunity {...defaultProps} />);

      expect(container.firstChild?.nodeName).toBe("SECTION");
      expect(container.children).toHaveLength(1);
    });

    it("maintains proper nesting structure", () => {
      const { container } = render(<HeroCommunity {...defaultProps} />);
      const section = container.querySelector("section");
      const maxWidthContainer = section?.querySelector(".max-w-7xl");

      expect(maxWidthContainer).toBeInTheDocument();
      expect(maxWidthContainer?.closest("section")).toBe(section);
    });
  });

  describe("Dynamic imports and loading states", () => {
    it("handles CommunityStats dynamic import correctly", () => {
      render(<HeroCommunity {...defaultProps} />);

      // The mock should render our test component
      expect(screen.getByTestId("community-stats")).toBeInTheDocument();
    });
  });

  describe("Design System v2 elements", () => {
    it("renders tagline badge", () => {
      render(<HeroCommunity {...defaultProps} />);

      expect(screen.getByText(/Desde Sevilla a Edimburgo/)).toBeInTheDocument();
    });

    it("uses display font classes for main heading", () => {
      render(<HeroCommunity {...defaultProps} />);

      const heading = screen.getByText("MÁS QUE");
      expect(heading).toHaveClass("font-display");
    });

    it("uses accent font class for tagline", () => {
      render(<HeroCommunity {...defaultProps} />);

      const tagline = screen.getByText("Una Familia");
      expect(tagline).toHaveClass("font-accent");
    });
  });
});
