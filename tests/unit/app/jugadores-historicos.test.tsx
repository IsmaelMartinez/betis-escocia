import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
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
  ChevronDown: vi.fn(({ className }) => (
    <div data-testid="chevrondown-icon" className={className} />
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
    it("should render all 21 player cards", () => {
      const playerNames = screen.getAllByRole("heading", { level: 3 });
      expect(playerNames).toHaveLength(21);
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
      expect(screen.getAllByText("Extremo derecho").length).toBeGreaterThan(0);
    });

    it("should render player year ranges", () => {
      expect(screen.getByText("1971–1981")).toBeInTheDocument();
      expect(screen.getByText("2019–2024")).toBeInTheDocument();
    });

    it("should render player highlights", () => {
      expect(
        screen.getByText("Ídolo eterno del Villamarín"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("Máximo goleador histórico del club"),
      ).toBeInTheDocument();
    });

    it("should render player quotes when card is expanded", async () => {
      const user = userEvent.setup();
      // Expand Julio Cardeñosa's card (has a quote)
      await user.click(screen.getByText("Julio Cardeñosa"));
      expect(
        screen.getByText(/El Villamarín fue mi vida entera/),
      ).toBeInTheDocument();
    });

    it("should render player stats when card is expanded", async () => {
      const user = userEvent.setup();
      // Expand Julio Cardeñosa's card (has stats)
      await user.click(screen.getByText("Julio Cardeñosa"));
      expect(
        screen.getByText("+300 partidos con el Betis"),
      ).toBeInTheDocument();
    });

    it("should render video links with correct attributes when expanded", async () => {
      const user = userEvent.setup();
      await user.click(screen.getByText("Julio Cardeñosa"));

      const videoLink = screen.getByRole("link", { name: /Ver Vídeos/ });
      expect(videoLink).toHaveAttribute("href");
      expect(videoLink.getAttribute("href")).toContain("youtube.com/results");
      expect(videoLink).toHaveAttribute("target", "_blank");
      expect(videoLink).toHaveAttribute("rel", "noopener noreferrer");
    });

    it("should encode video search queries in URLs", async () => {
      const user = userEvent.setup();
      await user.click(screen.getByText("Julio Cardeñosa"));

      const videoLink = screen.getByRole("link", { name: /Ver Vídeos/ });
      const href = videoLink.getAttribute("href") || "";
      const queryPart = href.split("search_query=")[1];
      expect(queryPart).toBeDefined();
      // Ensure the query segment has no whitespace (i.e. spaces are encoded)
      expect(queryPart).not.toMatch(/\s/);
      // And it should contain at least one percent-encoded sequence
      expect(queryPart).toMatch(/%[0-9A-Fa-f]{2}/);
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
      expect(screen.getByText("1970–1986")).toBeInTheDocument();
      expect(screen.getByText("1997–2008")).toBeInTheDocument();
      expect(screen.getByText("2008–2018")).toBeInTheDocument();
      expect(screen.getByText("2015–2024")).toBeInTheDocument();
    });
  });

  describe("Era filter", () => {
    it("should render all filter buttons", () => {
      expect(screen.getByRole("button", { name: /^Todos/ })).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /^Clásicos del Villamarín/ }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /^La Era Dorada/ }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /^Corazón Verdiblanco/ }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /^El Nuevo Betis/ }),
      ).toBeInTheDocument();
    });

    it("should filter players when an era is selected", async () => {
      const user = userEvent.setup();

      await user.click(
        screen.getByRole("button", { name: /^Clásicos del Villamarín/ }),
      );

      expect(screen.getByText("Julio Cardeñosa")).toBeInTheDocument();
      expect(screen.getByText("Rafael Gordillo")).toBeInTheDocument();

      expect(screen.queryByText("Denilson")).not.toBeInTheDocument();
      expect(screen.queryByText("Joaquín Sánchez")).not.toBeInTheDocument();
    });

    it("should show all players when Todos filter is clicked after filtering", async () => {
      const user = userEvent.setup();

      await user.click(screen.getByRole("button", { name: /^La Era Dorada/ }));
      expect(screen.queryByText("Julio Cardeñosa")).not.toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: /^Todos/ }));
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

    it("should have external links with proper attributes when expanded", async () => {
      const user = userEvent.setup();
      await user.click(screen.getByText("Julio Cardeñosa"));

      const externalLinks = screen
        .getAllByRole("link")
        .filter((link) => link.getAttribute("target") === "_blank");

      expect(externalLinks.length).toBeGreaterThan(0);
      externalLinks.forEach((link) => {
        expect(link).toHaveAttribute("rel", "noopener noreferrer");
      });
    });
  });
});
