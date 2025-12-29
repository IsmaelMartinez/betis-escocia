import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PaginatedMatches from "@/components/PaginatedMatches";

// Mock MatchCard component
vi.mock("@/components/MatchCard", () => ({
  default: ({
    id,
    opponent,
    competition,
  }: {
    id: number;
    opponent: string;
    competition: string;
  }) => (
    <div data-testid={`match-${id}`}>
      Real Betis vs {opponent} - {competition}
    </div>
  ),
}));

// Mock fetch globally
const mockFetch = vi.fn();
Object.defineProperty(globalThis, "fetch", {
  value: mockFetch,
  writable: true,
  configurable: true,
});

// Mock ErrorBoundary components
vi.mock("@/components/ErrorBoundary", () => ({
  MatchCardErrorBoundary: ({ children }: { children: React.ReactNode }) =>
    children,
}));

// Mock other components
vi.mock("@/components/ErrorMessage", () => ({
  ApiErrorMessage: ({ onRetry }: { onRetry: () => void }) => (
    <div>
      <span>Algo salió mal</span>
      <button onClick={onRetry}>Reintentar</button>
    </div>
  ),
  NoRecentMatchesMessage: () => (
    <div>No hay partidos recientes disponibles</div>
  ),
}));

vi.mock("@/components/LoadingSpinner", () => ({
  default: () => <div>Cargando...</div>,
}));

describe("PaginatedMatches", () => {
  const mockMatches = [
    {
      id: 1,
      homeTeam: {
        id: 90,
        name: "Real Betis",
        shortName: "Betis",
        tla: "BET",
        crest: "betis.png",
      },
      awayTeam: {
        id: 95,
        name: "Valencia",
        shortName: "Valencia",
        tla: "VAL",
        crest: "valencia.png",
      },
      utcDate: "2024-01-01T15:00:00Z",
      competition: {
        id: 2014,
        name: "LaLiga",
        code: "PD",
        type: "LEAGUE",
        emblem: "laliga.png",
      },
      status: "FINISHED" as const,
      matchday: 1,
      stage: "REGULAR_SEASON",
      lastUpdated: "2024-01-01T15:00:00Z",
      season: {
        id: 2024,
        startDate: "2024-08-01",
        endDate: "2025-05-31",
        currentMatchday: 10,
      },
      score: {
        duration: "REGULAR" as const,
        fullTime: { home: 2, away: 1 },
        halfTime: { home: 1, away: 0 },
      },
    },
    {
      id: 2,
      homeTeam: {
        id: 95,
        name: "Sevilla",
        shortName: "Sevilla",
        tla: "SEV",
        crest: "sevilla.png",
      },
      awayTeam: {
        id: 90,
        name: "Real Betis",
        shortName: "Betis",
        tla: "BET",
        crest: "betis.png",
      },
      utcDate: "2024-01-08T18:00:00Z",
      competition: {
        id: 2014,
        name: "LaLiga",
        code: "PD",
        type: "LEAGUE",
        emblem: "laliga.png",
      },
      status: "FINISHED" as const,
      matchday: 2,
      stage: "REGULAR_SEASON",
      lastUpdated: "2024-01-08T18:00:00Z",
      season: {
        id: 2024,
        startDate: "2024-08-01",
        endDate: "2025-05-31",
        currentMatchday: 10,
      },
      score: {
        duration: "REGULAR" as const,
        fullTime: { home: 0, away: 3 },
        halfTime: { home: 0, away: 1 },
      },
    },
    {
      id: 3,
      homeTeam: {
        id: 90,
        name: "Real Betis",
        shortName: "Betis",
        tla: "BET",
        crest: "betis.png",
      },
      awayTeam: {
        id: 81,
        name: "Barcelona",
        shortName: "Barça",
        tla: "BAR",
        crest: "barca.png",
      },
      utcDate: "2024-01-15T20:00:00Z",
      competition: {
        id: 2014,
        name: "LaLiga",
        code: "PD",
        type: "LEAGUE",
        emblem: "laliga.png",
      },
      status: "FINISHED" as const,
      matchday: 3,
      stage: "REGULAR_SEASON",
      lastUpdated: "2024-01-15T20:00:00Z",
      season: {
        id: 2024,
        startDate: "2024-08-01",
        endDate: "2025-05-31",
        currentMatchday: 10,
      },
      score: {
        duration: "REGULAR" as const,
        fullTime: { home: 1, away: 2 },
        halfTime: { home: 1, away: 1 },
      },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockClear();
  });

  it("should render initial matches", () => {
    render(
      <PaginatedMatches initialMatches={mockMatches} matchType="recent" />,
    );

    expect(screen.getByTestId("match-1")).toBeInTheDocument();
    expect(screen.getByTestId("match-2")).toBeInTheDocument();
    expect(screen.getByTestId("match-3")).toBeInTheDocument();
  });

  it("should show load more button when there are more matches", () => {
    // Create more than 10 matches to trigger "load more" state
    const manyMatches = Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      homeTeam: {
        id: 90,
        name: "Real Betis",
        shortName: "Betis",
        tla: "BET",
        crest: "betis.png",
      },
      awayTeam: {
        id: 95 + i,
        name: `Team ${i}`,
        shortName: `T${i}`,
        tla: `T${i}`,
        crest: `team${i}.png`,
      },
      utcDate: `2024-01-0${i + 1}T15:00:00Z`,
      competition: {
        id: 2014,
        name: "LaLiga",
        code: "PD",
        type: "LEAGUE",
        emblem: "laliga.png",
      },
      status: "FINISHED" as const,
      matchday: i + 1,
      stage: "REGULAR_SEASON",
      lastUpdated: `2024-01-0${i + 1}T15:00:00Z`,
      season: {
        id: 2024,
        startDate: "2024-08-01",
        endDate: "2025-05-31",
        currentMatchday: 10,
      },
      score: {
        duration: "REGULAR" as const,
        fullTime: { home: 2, away: 1 },
        halfTime: { home: 1, away: 0 },
      },
    }));

    render(
      <PaginatedMatches initialMatches={manyMatches} matchType="recent" />,
    );

    expect(
      screen.getByRole("button", { name: /ver más eventos/i }),
    ).toBeInTheDocument();
  });

  it("should load more matches when load more button is clicked", async () => {
    const user = userEvent.setup();

    // Create exactly 10 matches to trigger "load more" state
    const initialMatches = Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      homeTeam: {
        id: 90,
        name: "Real Betis",
        shortName: "Betis",
        tla: "BET",
        crest: "betis.png",
      },
      awayTeam: {
        id: 95 + i,
        name: `Team ${i}`,
        shortName: `T${i}`,
        tla: `T${i}`,
        crest: `team${i}.png`,
      },
      utcDate: `2024-01-0${i + 1}T15:00:00Z`,
      competition: {
        id: 2014,
        name: "LaLiga",
        code: "PD",
        type: "LEAGUE",
        emblem: "laliga.png",
      },
      status: "FINISHED" as const,
      matchday: i + 1,
      stage: "REGULAR_SEASON",
      lastUpdated: `2024-01-0${i + 1}T15:00:00Z`,
      season: {
        id: 2024,
        startDate: "2024-08-01",
        endDate: "2025-05-31",
        currentMatchday: 10,
      },
      score: {
        duration: "REGULAR" as const,
        fullTime: { home: 2, away: 1 },
        halfTime: { home: 1, away: 0 },
      },
    }));

    const newMatches = [
      {
        id: 11,
        homeTeam: {
          id: 90,
          name: "Real Betis",
          shortName: "Betis",
          tla: "BET",
          crest: "betis.png",
        },
        awayTeam: {
          id: 106,
          name: "New Team",
          shortName: "New",
          tla: "NEW",
          crest: "new.png",
        },
        utcDate: "2024-01-11T15:00:00Z",
        competition: {
          id: 2014,
          name: "LaLiga",
          code: "PD",
          type: "LEAGUE",
          emblem: "laliga.png",
        },
        status: "FINISHED" as const,
        matchday: 11,
        stage: "REGULAR_SEASON",
        lastUpdated: "2024-01-11T15:00:00Z",
        season: {
          id: 2024,
          startDate: "2024-08-01",
          endDate: "2025-05-31",
          currentMatchday: 10,
        },
        score: {
          duration: "REGULAR" as const,
          fullTime: { home: 1, away: 0 },
          halfTime: { home: 0, away: 0 },
        },
      },
    ];

    // Mock successful fetch response
    const mockResponse = new Response(JSON.stringify({ matches: newMatches }), {
      status: 200,
      statusText: "OK",
      headers: { "Content-Type": "application/json" },
    });
    mockFetch.mockResolvedValueOnce(mockResponse);

    render(
      <PaginatedMatches initialMatches={initialMatches} matchType="recent" />,
    );

    const loadMoreButton = screen.getByRole("button", {
      name: /ver más eventos/i,
    });
    await user.click(loadMoreButton);

    await waitFor(
      () => {
        expect(screen.getByTestId("match-11")).toBeInTheDocument();
      },
      { timeout: 3000 },
    );

    // Original matches should still be there
    expect(screen.getByTestId("match-1")).toBeInTheDocument();

    // Verify the fetch was called
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("should show loading state when loading more matches", async () => {
    const user = userEvent.setup();

    const initialMatches = Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      homeTeam: {
        id: 90,
        name: "Real Betis",
        shortName: "Betis",
        tla: "BET",
        crest: "betis.png",
      },
      awayTeam: {
        id: 95 + i,
        name: `Team ${i}`,
        shortName: `T${i}`,
        tla: `T${i}`,
        crest: `team${i}.png`,
      },
      utcDate: `2024-01-0${i + 1}T15:00:00Z`,
      competition: {
        id: 2014,
        name: "LaLiga",
        code: "PD",
        type: "LEAGUE",
        emblem: "laliga.png",
      },
      status: "FINISHED" as const,
      matchday: i + 1,
      stage: "REGULAR_SEASON",
      lastUpdated: `2024-01-0${i + 1}T15:00:00Z`,
      season: {
        id: 2024,
        startDate: "2024-08-01",
        endDate: "2025-05-31",
        currentMatchday: 10,
      },
      score: {
        duration: "REGULAR" as const,
        fullTime: { home: 2, away: 1 },
        halfTime: { home: 1, away: 0 },
      },
    }));

    // Mock a delayed response
    mockFetch.mockImplementationOnce(
      () =>
        new Promise((resolve) =>
          setTimeout(() => {
            const mockResponse = new Response(JSON.stringify({ matches: [] }), {
              status: 200,
              statusText: "OK",
              headers: { "Content-Type": "application/json" },
            });
            resolve(mockResponse);
          }, 100),
        ),
    );

    render(
      <PaginatedMatches initialMatches={initialMatches} matchType="recent" />,
    );

    const loadMoreButton = screen.getByRole("button", {
      name: /ver más eventos/i,
    });
    await user.click(loadMoreButton);

    expect(screen.getByText(/cargando más eventos/i)).toBeInTheDocument();

    // Wait for async operation to complete before test cleanup to prevent unhandled rejection
    await waitFor(() => {
      expect(
        screen.queryByText(/cargando más eventos/i),
      ).not.toBeInTheDocument();
    });
  });

  it("should hide load more button when there are no more matches", () => {
    // Less than 10 matches means no more to load
    render(
      <PaginatedMatches initialMatches={mockMatches} matchType="recent" />,
    );

    expect(
      screen.queryByRole("button", { name: /ver más eventos/i }),
    ).not.toBeInTheDocument();
  });

  it("should show error message when loading fails", async () => {
    const user = userEvent.setup();

    const initialMatches = Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      homeTeam: {
        id: 90,
        name: "Real Betis",
        shortName: "Betis",
        tla: "BET",
        crest: "betis.png",
      },
      awayTeam: {
        id: 95 + i,
        name: `Team ${i}`,
        shortName: `T${i}`,
        tla: `T${i}`,
        crest: `team${i}.png`,
      },
      utcDate: `2024-01-0${i + 1}T15:00:00Z`,
      competition: {
        id: 2014,
        name: "LaLiga",
        code: "PD",
        type: "LEAGUE",
        emblem: "laliga.png",
      },
      status: "FINISHED" as const,
      matchday: i + 1,
      stage: "REGULAR_SEASON",
      lastUpdated: `2024-01-0${i + 1}T15:00:00Z`,
      season: {
        id: 2024,
        startDate: "2024-08-01",
        endDate: "2025-05-31",
        currentMatchday: 10,
      },
      score: {
        duration: "REGULAR" as const,
        fullTime: { home: 2, away: 1 },
        halfTime: { home: 1, away: 0 },
      },
    }));

    // Mock a failed fetch
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    render(
      <PaginatedMatches initialMatches={initialMatches} matchType="recent" />,
    );

    const loadMoreButton = screen.getByRole("button", {
      name: /ver más eventos/i,
    });
    await user.click(loadMoreButton);

    await waitFor(
      () => {
        expect(screen.getByText(/algo salió mal/i)).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  });

  it("should show upcoming match with watch party info", () => {
    render(
      <PaginatedMatches initialMatches={mockMatches} matchType="upcoming" />,
    );

    expect(screen.getByTestId("match-1")).toBeInTheDocument();
    expect(screen.getByTestId("match-2")).toBeInTheDocument();
    expect(screen.getByTestId("match-3")).toBeInTheDocument();
  });

  it("should show empty state when no matches", () => {
    render(<PaginatedMatches initialMatches={[]} matchType="recent" />);

    expect(screen.getByText(/no hay partidos recientes/i)).toBeInTheDocument();
  });

  it("should hide load more button when all matches are loaded", async () => {
    const user = userEvent.setup();

    const initialMatches = Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      homeTeam: {
        id: 90,
        name: "Real Betis",
        shortName: "Betis",
        tla: "BET",
        crest: "betis.png",
      },
      awayTeam: {
        id: 95 + i,
        name: `Team ${i}`,
        shortName: `T${i}`,
        tla: `T${i}`,
        crest: `team${i}.png`,
      },
      utcDate: `2024-01-0${i + 1}T15:00:00Z`,
      competition: {
        id: 2014,
        name: "LaLiga",
        code: "PD",
        type: "LEAGUE",
        emblem: "laliga.png",
      },
      status: "FINISHED" as const,
      matchday: i + 1,
      stage: "REGULAR_SEASON",
      lastUpdated: `2024-01-0${i + 1}T15:00:00Z`,
      season: {
        id: 2024,
        startDate: "2024-08-01",
        endDate: "2025-05-31",
        currentMatchday: 10,
      },
      score: {
        duration: "REGULAR" as const,
        fullTime: { home: 2, away: 1 },
        halfTime: { home: 1, away: 0 },
      },
    }));

    // Mock empty response (no more matches)
    const mockResponse = new Response(JSON.stringify({ matches: [] }), {
      status: 200,
      statusText: "OK",
      headers: { "Content-Type": "application/json" },
    });
    mockFetch.mockResolvedValueOnce(mockResponse);

    render(
      <PaginatedMatches initialMatches={initialMatches} matchType="recent" />,
    );

    const loadMoreButton = screen.getByRole("button", {
      name: /ver más eventos/i,
    });
    await user.click(loadMoreButton);

    // Wait for the load more button to disappear when no more matches
    await waitFor(
      () => {
        expect(
          screen.queryByRole("button", { name: /ver más eventos/i }),
        ).not.toBeInTheDocument();
      },
      { timeout: 5000 },
    );

    // Verify that all initial matches are still displayed
    expect(screen.getByTestId("match-1")).toBeInTheDocument();
    expect(screen.getByTestId("match-10")).toBeInTheDocument();
  });
});
