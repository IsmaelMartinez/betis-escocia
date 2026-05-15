import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import UpcomingMatchesWidget from "@/components/match/UpcomingMatchesWidget";

vi.mock("@/components/match/MatchCard", () => ({
  default: () => null,
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

const futureDate = new Date(Date.now() + 86_400_000).toISOString();

const upcomingMatches = [
  {
    id: 1,
    utcDate: futureDate,
    status: "SCHEDULED",
    homeTeam: { id: 90, name: "Real Betis" },
    awayTeam: { id: 95, name: "Valencia CF" },
    competition: { name: "LaLiga" },
  },
  {
    id: 2,
    utcDate: futureDate,
    status: "SCHEDULED",
    homeTeam: { id: 95, name: "Sevilla FC" },
    awayTeam: { id: 90, name: "Real Betis" },
    competition: { name: "LaLiga" },
  },
  {
    id: 3,
    utcDate: futureDate,
    status: "SCHEDULED",
    homeTeam: { id: 90, name: "Real Betis" },
    awayTeam: { id: 96, name: "Athletic Club" },
    competition: { name: "LaLiga" },
  },
];

describe("UpcomingMatchesWidget", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders only the first two upcoming matches", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({ matches: upcomingMatches }),
    });

    render(<UpcomingMatchesWidget />);

    await waitFor(() => {
      expect(screen.getByText("Valencia CF")).toBeInTheDocument();
    });
    expect(screen.getByText("Sevilla FC")).toBeInTheDocument();
    expect(screen.queryByText("Athletic Club")).not.toBeInTheDocument();
    expect(fetch).toHaveBeenCalledWith("/api/matches?type=upcoming&live=true");
  });

  it("shows the empty state when the API returns no matches", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({ matches: [] }),
    });

    render(<UpcomingMatchesWidget />);

    await waitFor(() => {
      expect(
        screen.getByText("No hay partidos programados"),
      ).toBeInTheDocument();
    });
  });

  it("shows the error state when the API fails", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({}),
    });

    render(<UpcomingMatchesWidget />);

    await waitFor(() => {
      expect(
        screen.getByText("Error al cargar los próximos partidos"),
      ).toBeInTheDocument();
    });
  });
});
