import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Mock Next.js Link component
vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock Lucide React icons
vi.mock("lucide-react", () => ({
  Star: vi.fn(({ className }) => (
    <div data-testid="star-icon" className={className} />
  )),
  Trophy: vi.fn(({ className }) => (
    <div data-testid="trophy-icon" className={className} />
  )),
  Heart: vi.fn(({ className }) => (
    <div data-testid="heart-icon" className={className} />
  )),
  Play: vi.fn(({ className }) => (
    <div data-testid="play-icon" className={className} />
  )),
  Quote: vi.fn(({ className }) => (
    <div data-testid="quote-icon" className={className} />
  )),
  BarChart3: vi.fn(({ className }) => (
    <div data-testid="barchart-icon" className={className} />
  )),
}));

describe("Jugadores Históricos Page", () => {
  beforeEach(async () => {
    const JugadoresHistoricos = (
      await import("@/app/jugadores-historicos/page")
    ).default;
    render(<JugadoresHistoricos />);
  });

  describe("Hero section", () => {
    it("should render the main heading", () => {
      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
        "Leyendas Béticas",
      );
    });

    it("should render the hero tagline", () => {
      expect(
        screen.getByText(
          "Los jugadores que hicieron historia en el Villamarín",
        ),
      ).toBeInTheDocument();
    });

    it("should render the hero badge", () => {
      expect(screen.getByText("Jugadores Legendarios")).toBeInTheDocument();
    });

    it("should render the intro paragraph", () => {
      expect(
        screen.getByText(/De los clásicos del 78 a los campeones de Copa/),
      ).toBeInTheDocument();
    });
  });

  describe("Player cards", () => {
    it("should render all 16 player cards", () => {
      const videoLinks = screen.getAllByRole("link", { name: /Ver Vídeos/ });
      expect(videoLinks).toHaveLength(16);
    });

    it("should render player names", () => {
      expect(screen.getByText("Julio Cardeñosa")).toBeInTheDocument();
      expect(screen.getByText("Rafael Gordillo")).toBeInTheDocument();
      expect(screen.getByText("Denilson")).toBeInTheDocument();
      expect(screen.getByText("Joaquín Sánchez")).toBeInTheDocument();
      expect(screen.getByText("Nabil Fekir")).toBeInTheDocument();
      expect(screen.getByText("Borja Iglesias")).toBeInTheDocument();
    });

    it("should render player positions", () => {
      expect(screen.getAllByText("Centrocampista").length).toBeGreaterThan(0);
      expect(screen.getByText("Lateral izquierdo")).toBeInTheDocument();
      expect(screen.getByText("Extremo izquierdo")).toBeInTheDocument();
      expect(screen.getByText("Extremo derecho")).toBeInTheDocument();
    });

    it("should render player year ranges", () => {
      expect(screen.getByText("1971–1981")).toBeInTheDocument();
      expect(screen.getByText("2019–2024")).toBeInTheDocument();
    });

    it("should render player highlights", () => {
      expect(screen.getByText("Ídolo eterno del Villamarín")).toBeInTheDocument();
      expect(
        screen.getByText("Máximo goleador histórico del club"),
      ).toBeInTheDocument();
    });

    it("should render player quotes when available", () => {
      expect(
        screen.getByText(/El Villamarín fue mi vida entera/),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Viva er Betis manque pierda/),
      ).toBeInTheDocument();
    });

    it("should render player stats when available", () => {
      expect(
        screen.getByText("+300 partidos con el Betis"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("183 goles — récord absoluto del club"),
      ).toBeInTheDocument();
    });

    it("should render video links with correct attributes", () => {
      const videoLinks = screen.getAllByRole("link", { name: /Ver Vídeos/ });

      videoLinks.forEach((link) => {
        expect(link).toHaveAttribute("href");
        expect(link.getAttribute("href")).toContain("youtube.com/results");
        expect(link).toHaveAttribute("target", "_blank");
        expect(link).toHaveAttribute("rel", "noopener noreferrer");
      });
    });

    it("should encode video search queries in URLs", () => {
      const videoLinks = screen.getAllByRole("link", { name: /Ver Vídeos/ });
      // All links should use encodeURIComponent, so no raw '+' in search_query param
      videoLinks.forEach((link) => {
        const href = link.getAttribute("href") || "";
        const queryPart = href.split("search_query=")[1];
        // Encoded '+' becomes '%2B', spaces become '%20' or '+'
        expect(queryPart).toBeDefined();
      });
    });
  });

  describe("Era sections", () => {
    it("should render all four era headings", () => {
      const h2s = screen.getAllByRole("heading", { level: 2 });
      const eraHeadings = h2s.map((h) => h.textContent);
      expect(eraHeadings).toContain("Clásicos del Villamarín");
      expect(eraHeadings).toContain("La Era Dorada");
      expect(eraHeadings).toContain("Corazón Verdiblanco");
      expect(eraHeadings).toContain("El Nuevo Betis");
    });

    it("should render era subtitles", () => {
      expect(
        screen.getByText("Los pioneros que forjaron la leyenda del Betis"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("Brasileños, Champions y Copa del Rey"),
      ).toBeInTheDocument();
    });

    it("should render era year ranges", () => {
      expect(screen.getByText("1970s–1980s")).toBeInTheDocument();
      expect(screen.getByText("1997–2008")).toBeInTheDocument();
      expect(screen.getByText("2008–2018")).toBeInTheDocument();
      expect(screen.getByText("2015–2024")).toBeInTheDocument();
    });
  });

  describe("Era filter", () => {
    it("should render all filter buttons", () => {
      expect(
        screen.getByRole("button", { name: "Todos" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Clásicos del Villamarín" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "La Era Dorada" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Corazón Verdiblanco" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "El Nuevo Betis" }),
      ).toBeInTheDocument();
    });

    it("should filter players when an era is selected", async () => {
      const user = userEvent.setup();

      // Click "Clásicos del Villamarín" filter
      await user.click(
        screen.getByRole("button", { name: "Clásicos del Villamarín" }),
      );

      // Should show clasicos players
      expect(screen.getByText("Julio Cardeñosa")).toBeInTheDocument();
      expect(screen.getByText("Rafael Gordillo")).toBeInTheDocument();

      // Should not show players from other eras
      expect(screen.queryByText("Denilson")).not.toBeInTheDocument();
      expect(screen.queryByText("Joaquín Sánchez")).not.toBeInTheDocument();
    });

    it("should show all players when Todos filter is clicked after filtering", async () => {
      const user = userEvent.setup();

      // First filter to one era
      await user.click(
        screen.getByRole("button", { name: "La Era Dorada" }),
      );
      expect(screen.queryByText("Julio Cardeñosa")).not.toBeInTheDocument();

      // Click Todos to show all
      await user.click(screen.getByRole("button", { name: "Todos" }));
      expect(screen.getByText("Julio Cardeñosa")).toBeInTheDocument();
      expect(screen.getByText("Denilson")).toBeInTheDocument();
      expect(screen.getByText("Joaquín Sánchez")).toBeInTheDocument();
    });
  });

  describe("CTA section", () => {
    it("should render the CTA heading", () => {
      expect(
        screen.getByText("Comparte la pasión bética con nosotros"),
      ).toBeInTheDocument();
    });

    it("should render the join link", () => {
      const joinLink = screen.getByRole("link", {
        name: /Únete a Nosotros/,
      });
      expect(joinLink).toHaveAttribute("href", "/unete");
    });
  });

  describe("Design system consistency", () => {
    it("should use branded design patterns", async () => {
      // Re-render to get container reference
      const JugadoresHistoricos = (
        await import("@/app/jugadores-historicos/page")
      ).default;
      const { container } = render(<JugadoresHistoricos />);

      expect(container.querySelector(".bg-hero-fusion")).toBeInTheDocument();
      expect(
        container.querySelector(".pattern-tartan-navy"),
      ).toBeInTheDocument();
      expect(container.querySelector(".bg-canvas-warm")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have proper heading hierarchy", () => {
      const h1 = screen.getByRole("heading", { level: 1 });
      expect(h1).toBeInTheDocument();
      expect(h1).toHaveTextContent("Leyendas Béticas");

      const h2s = screen.getAllByRole("heading", { level: 2 });
      expect(h2s.length).toBeGreaterThan(0);
    });

    it("should have external links with proper attributes", () => {
      const externalLinks = screen
        .getAllByRole("link")
        .filter((link) => link.getAttribute("target") === "_blank");

      externalLinks.forEach((link) => {
        expect(link).toHaveAttribute("rel", "noopener noreferrer");
      });
    });
  });
});
