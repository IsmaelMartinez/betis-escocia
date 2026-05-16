import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import MatchCard, {
  convertFootballDataMatchToCardProps,
} from "@/components/match/MatchCard";
import type { Match as FootballDataMatch } from "@/types/match";

// Mock dependencies
vi.mock("next/image", () => ({
  default: vi.fn(({ src, alt, width, height, className }) => (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      data-testid="match-image"
    />
  )),
}));

vi.mock("next/link", () => ({
  default: vi.fn(({ href, className, children }) => (
    <a href={href} className={className} data-testid="match-link">
      {children}
    </a>
  )),
}));

vi.mock("lucide-react", () => ({
  Calendar: vi.fn(({ className }) => (
    <div data-testid="calendar-icon" className={className} />
  )),
}));

describe("MatchCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockUpcomingMatch = {
    id: 1,
    opponent: "Real Madrid",
    date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    competition: "LaLiga",
    isHome: true,
    status: "SCHEDULED" as const,
    matchday: 10,
  };

  const mockFinishedMatch = {
    id: 2,
    opponent: "Sevilla FC",
    date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    competition: "Copa del Rey",
    isHome: false,
    status: "FINISHED" as const,
    score: { home: 2, away: 1 },
    matchday: 8,
  };

  describe("Basic rendering", () => {
    it("renders upcoming match correctly", () => {
      render(<MatchCard {...mockUpcomingMatch} />);

      expect(screen.getByText("LaLiga")).toBeInTheDocument();
      expect(screen.getByText("J10")).toBeInTheDocument();
      expect(screen.getByText("Real Madrid")).toBeInTheDocument();
      expect(screen.getByText("Real Betis")).toBeInTheDocument();
      expect(screen.getByText("PRÓXIMO")).toBeInTheDocument();
    });

    it("renders finished match correctly", () => {
      render(<MatchCard {...mockFinishedMatch} />);

      expect(screen.getByText("Copa del Rey")).toBeInTheDocument();
      expect(screen.getByText("Sevilla FC")).toBeInTheDocument();
      expect(screen.getByText("2 - 1")).toBeInTheDocument();
      expect(screen.getByText("FINALIZADO")).toBeInTheDocument();
    });

    it("displays competition badge with correct matchday", () => {
      render(<MatchCard {...mockUpcomingMatch} />);

      expect(screen.getByText("J10")).toBeInTheDocument();
    });

    it("shows calendar icon with date", () => {
      render(<MatchCard {...mockUpcomingMatch} />);

      expect(screen.getByTestId("calendar-icon")).toBeInTheDocument();
    });
  });

  describe("Competition colors and display names", () => {
    it("displays LaLiga correctly", () => {
      render(<MatchCard {...mockUpcomingMatch} />);

      const competitionElement = screen.getByText("LaLiga");
      expect(competitionElement).toBeInTheDocument();
    });

    it("displays Champions League correctly", () => {
      const championsMatch = {
        ...mockUpcomingMatch,
        competition: "Champions League",
      };
      render(<MatchCard {...championsMatch} />);

      expect(screen.getByText("Champions League")).toBeInTheDocument();
    });

    it("displays Copa del Rey correctly", () => {
      const copaMatch = { ...mockUpcomingMatch, competition: "Copa del Rey" };
      render(<MatchCard {...copaMatch} />);

      expect(screen.getByText("Copa del Rey")).toBeInTheDocument();
    });
  });

  describe("Match status", () => {
    it("shows correct status for live match", () => {
      const liveMatch = { ...mockUpcomingMatch, status: "IN_PLAY" as const };
      render(<MatchCard {...liveMatch} />);

      expect(screen.getByText("EN VIVO")).toBeInTheDocument();
    });

    it("shows correct status for paused match", () => {
      const pausedMatch = { ...mockUpcomingMatch, status: "PAUSED" as const };
      render(<MatchCard {...pausedMatch} />);

      expect(screen.getByText("DESCANSO")).toBeInTheDocument();
    });

    it("shows correct status for postponed match", () => {
      const postponedMatch = {
        ...mockUpcomingMatch,
        status: "POSTPONED" as const,
      };
      render(<MatchCard {...postponedMatch} />);

      expect(screen.getByText("APLAZADO")).toBeInTheDocument();
    });

    it("shows correct status for cancelled match", () => {
      const cancelledMatch = {
        ...mockUpcomingMatch,
        status: "CANCELLED" as const,
      };
      render(<MatchCard {...cancelledMatch} />);

      expect(screen.getByText("CANCELADO")).toBeInTheDocument();
    });
  });

  describe("Team positioning", () => {
    it("displays home teams correctly when Betis is home", () => {
      const homeMatch = { ...mockUpcomingMatch, isHome: true };
      render(<MatchCard {...homeMatch} />);

      expect(screen.getByText("Real Betis")).toBeInTheDocument();
      expect(screen.getByText("Real Madrid")).toBeInTheDocument();
    });

    it("displays away teams correctly when Betis is away", () => {
      const awayMatch = { ...mockUpcomingMatch, isHome: false };
      render(<MatchCard {...awayMatch} />);

      expect(screen.getByText("Real Betis")).toBeInTheDocument();
      expect(screen.getByText("Real Madrid")).toBeInTheDocument();
    });
  });

  describe("Score display", () => {
    it("shows score for finished matches", () => {
      render(<MatchCard {...mockFinishedMatch} />);

      expect(screen.getByText("2 - 1")).toBeInTheDocument();
    });

    it("shows VS for upcoming matches without score", () => {
      const upcomingNoScore = { ...mockUpcomingMatch };
      render(<MatchCard {...upcomingNoScore} />);

      expect(screen.getByText("VS")).toBeInTheDocument();
    });

    it("handles null scores correctly", () => {
      const matchWithNullScore = {
        ...mockFinishedMatch,
        score: { home: null, away: null },
      };
      render(<MatchCard {...matchWithNullScore} />);

      expect(screen.getByText("VS")).toBeInTheDocument();
    });
  });

  describe("Competition images", () => {
    it("displays competition emblem when provided", () => {
      const matchWithEmblem = {
        ...mockUpcomingMatch,
        competitionEmblem: "/images/laliga.png",
      };
      render(<MatchCard {...matchWithEmblem} />);

      const images = screen.getAllByTestId("match-image");
      expect(
        images.some((img) => img.getAttribute("src") === "/images/laliga.png"),
      ).toBe(true);
    });

    it("renders without competition emblem when not provided", () => {
      render(<MatchCard {...mockUpcomingMatch} />);

      // Should still render the card without crashing
      expect(screen.getByText("LaLiga")).toBeInTheDocument();
    });
  });

  describe("Edge cases", () => {
    it("handles missing matchday gracefully", () => {
      const { matchday, ...matchWithoutMatchday } = mockUpcomingMatch;
      render(<MatchCard {...matchWithoutMatchday} />);

      expect(screen.queryByText(/^J\d+$/)).not.toBeInTheDocument();
      expect(screen.getByText("LaLiga")).toBeInTheDocument();
    });

    it("handles very long opponent names", () => {
      const matchWithLongName = {
        ...mockUpcomingMatch,
        opponent: "Real Club Deportivo de la Coruña Athletic Club",
      };
      render(<MatchCard {...matchWithLongName} />);

      expect(
        screen.getByText("Real Club Deportivo de la Coruña Athletic Club"),
      ).toBeInTheDocument();
    });

    it("handles unknown competition names", () => {
      const matchWithUnknownCompetition = {
        ...mockUpcomingMatch,
        competition: "Unknown Competition Name",
      };
      render(<MatchCard {...matchWithUnknownCompetition} />);

      expect(screen.getByText("Unknown Competition Name")).toBeInTheDocument();
    });
  });
});

describe("convertFootballDataMatchToCardProps", () => {
  const betisHomeMatch: FootballDataMatch = {
    id: 101,
    utcDate: new Date(Date.now() + 86400000).toISOString(),
    status: "SCHEDULED",
    matchday: 15,
    stage: "REGULAR_SEASON",
    lastUpdated: new Date().toISOString(),
    homeTeam: {
      id: 90,
      name: "Real Betis",
      shortName: "Betis",
      tla: "BET",
      crest: "https://example.com/betis.png",
    },
    awayTeam: {
      id: 95,
      name: "Valencia CF",
      shortName: "Valencia",
      tla: "VAL",
      crest: "https://example.com/valencia.png",
    },
    score: {
      duration: "REGULAR",
      fullTime: { home: null, away: null },
      halfTime: { home: null, away: null },
    },
    competition: {
      id: 2014,
      name: "LaLiga",
      code: "PD",
      type: "LEAGUE",
      emblem: "https://example.com/laliga.png",
    },
    season: {
      id: 1,
      startDate: "2025-08-01",
      endDate: "2026-05-31",
      currentMatchday: 15,
    },
  };

  it("marks Betis as home and uses the opponent's team details", () => {
    const result = convertFootballDataMatchToCardProps(betisHomeMatch);

    expect(result).toEqual({
      id: 101,
      opponent: "Valencia CF",
      date: betisHomeMatch.utcDate,
      competition: "LaLiga",
      isHome: true,
      status: "SCHEDULED",
      matchday: 15,
      opponentCrest: "https://example.com/valencia.png",
      competitionEmblem: "https://example.com/laliga.png",
      score: undefined,
    });
  });

  it("marks Betis as away when away team id is 90", () => {
    const awayMatch: FootballDataMatch = {
      ...betisHomeMatch,
      homeTeam: betisHomeMatch.awayTeam,
      awayTeam: betisHomeMatch.homeTeam,
    };

    const result = convertFootballDataMatchToCardProps(awayMatch);

    expect(result.isHome).toBe(false);
    expect(result.opponent).toBe("Valencia CF");
    expect(result.opponentCrest).toBe("https://example.com/valencia.png");
  });

  it("populates score when fullTime values are present", () => {
    const finishedMatch: FootballDataMatch = {
      ...betisHomeMatch,
      status: "FINISHED",
      score: {
        duration: "REGULAR",
        fullTime: { home: 3, away: 1 },
        halfTime: { home: 2, away: 0 },
      },
    };

    const result = convertFootballDataMatchToCardProps(finishedMatch);

    expect(result.status).toBe("FINISHED");
    expect(result.score).toEqual({ home: 3, away: 1 });
  });

  it("leaves score undefined when fullTime values are null", () => {
    const result = convertFootballDataMatchToCardProps(betisHomeMatch);

    expect(result.score).toBeUndefined();
  });
});
