import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import BetisEfemerides from "@/components/widgets/BetisEfemerides";
import { getEfemeridesForDate } from "@/data/efemerides";

// Mock the efemerides data module
vi.mock("@/data/efemerides", () => ({
  getEfemeridesForDate: vi.fn(() => [
    {
      year: 1935,
      title: "El Betis campeón de Liga",
      description: "EL BETIS CAMPEÓN DE LIGA. Hazaña irrepetible.",
      category: "titulo",
    },
  ]),
  getCategoryEmoji: vi.fn((category: string) => {
    const emojis: Record<string, string> = {
      titulo: "🏆",
      gol: "⚽",
      fichaje: "✍️",
      fundacion: "🏛️",
      anecdota: "📖",
      europa: "🌍",
      escocia: "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
    };
    return emojis[category] || "📖";
  }),
  getCategoryLabel: vi.fn((category: string) => {
    const labels: Record<string, string> = {
      titulo: "Título",
      gol: "Golazo",
      fichaje: "Fichaje",
      fundacion: "Fundación",
      anecdota: "Bético",
      europa: "Europa",
      escocia: "Escocia",
    };
    return labels[category] || "Bético";
  }),
}));

describe("BetisEfemerides", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Basic rendering", () => {
    it("renders the component with efemérides content", () => {
      render(<BetisEfemerides />);

      expect(screen.getByText("El Betis campeón de Liga")).toBeInTheDocument();
      expect(
        screen.getByText("EL BETIS CAMPEÓN DE LIGA. Hazaña irrepetible."),
      ).toBeInTheDocument();
    });

    it("renders the category badge", () => {
      render(<BetisEfemerides />);

      expect(screen.getByText("categoryTitulo")).toBeInTheDocument();
    });

    it("renders the year when present", () => {
      render(<BetisEfemerides />);

      expect(screen.getByText("1935")).toBeInTheDocument();
    });

    it("renders the header section", () => {
      render(<BetisEfemerides />);

      expect(screen.getByText("header")).toBeInTheDocument();
    });

    it("renders the footer tagline", () => {
      render(<BetisEfemerides />);

      expect(screen.getByText(/footerTagline/)).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("has an accessible region role", () => {
      render(<BetisEfemerides />);

      const region = screen.getByRole("region");
      expect(region).toHaveAttribute("aria-label", "ariaLabel");
    });

    it("renders category emoji as decorative", () => {
      const { container } = render(<BetisEfemerides />);

      const emojiSpan = container.querySelector('[aria-hidden="true"]');
      expect(emojiSpan).toBeInTheDocument();
    });
  });

  describe("Multiple efemérides", () => {
    it("renders multiple events for the same day", () => {
      vi.mocked(getEfemeridesForDate).mockReturnValue([
        {
          year: 2005,
          title: "Copa del Rey primer título",
          description: "Victoria memorable.",
          category: "titulo",
        },
        {
          year: 2022,
          title: "Copa del Rey segundo título",
          description: "Penaltis históricos.",
          category: "titulo",
        },
      ]);

      render(<BetisEfemerides />);

      expect(
        screen.getByText("Copa del Rey primer título"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("Copa del Rey segundo título"),
      ).toBeInTheDocument();
    });
  });

  describe("Fallback events", () => {
    it("does not render year for fallback events (year 0)", () => {
      vi.mocked(getEfemeridesForDate).mockReturnValue([
        {
          year: 0,
          title: "Día de reflexión bética",
          description: "No consta ninguna efeméride oficial para hoy.",
          category: "anecdota",
        },
      ]);

      render(<BetisEfemerides />);

      expect(screen.getByText("Día de reflexión bética")).toBeInTheDocument();
      expect(screen.queryByText("0")).not.toBeInTheDocument();
    });
  });

  describe("Visual design", () => {
    it("uses branded color classes", () => {
      const { container } = render(<BetisEfemerides />);

      const root = container.firstChild as HTMLElement;
      expect(root).toHaveClass("rounded-2xl", "shadow-xl");
    });

    it("has the green gradient header", () => {
      const { container } = render(<BetisEfemerides />);

      const header = container.querySelector(
        ".bg-gradient-to-r.from-betis-verde.to-betis-verde-dark",
      );
      expect(header).toBeInTheDocument();
    });
  });
});
