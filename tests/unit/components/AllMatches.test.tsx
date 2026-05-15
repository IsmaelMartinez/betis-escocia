import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import AllMatches from "@/components/match/AllMatches";

vi.mock("@/components/match/MatchCard", () => ({
  default: ({ opponent }: { opponent: string }) => (
    <div data-testid="match-card">{opponent}</div>
  ),
  convertFootballDataMatchToCardProps: (match: {
    id: number;
    utcDate: string;
    competition: { name: string };
    homeTeam: { id: number; name: string };
    awayTeam: { id: number; name: string };
    status: string;
  }) => ({
    id: match.id,
    opponent: match.homeTeam.id === 90 ? match.awayTeam.name : match.homeTeam.name,
    date: match.utcDate,
    competition: match.competition.name,
    isHome: match.homeTeam.id === 90,
    status: match.status,
  }),
}));

const upcomingDate = new Date(Date.now() + 86_400_000).toISOString();
const pastDate = new Date(Date.now() - 86_400_000).toISOString();

const sampleMatches = [
  {
    id: 1,
    utcDate: upcomingDate,
    status: "SCHEDULED",
    homeTeam: { id: 90, name: "Real Betis" },
    awayTeam: { id: 95, name: "Valencia CF" },
    competition: { name: "LaLiga" },
  },
  {
    id: 2,
    utcDate: pastDate,
    status: "FINISHED",
    homeTeam: { id: 95, name: "Sevilla FC" },
    awayTeam: { id: 90, name: "Real Betis" },
    competition: { name: "LaLiga" },
  },
];

describe("AllMatches", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders matches returned by /api/matches", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({ matches: sampleMatches }),
    });

    render(<AllMatches />);

    await waitFor(() => {
      expect(screen.getByText("Valencia CF")).toBeInTheDocument();
    });
    expect(fetch).toHaveBeenCalledWith("/api/matches?type=all&live=true");
  });

  it("shows the empty state when the API returns no matches", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({ matches: [] }),
    });

    render(<AllMatches />);

    await waitFor(() => {
      expect(
        screen.getByText("No hay partidos disponibles"),
      ).toBeInTheDocument();
    });
  });

  it("shows an error state when the API fails", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({}),
    });

    render(<AllMatches />);

    await waitFor(() => {
      expect(
        screen.getByText("Error al cargar partidos"),
      ).toBeInTheDocument();
    });
  });
});
