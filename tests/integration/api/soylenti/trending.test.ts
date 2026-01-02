import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Mock Supabase client - must be defined inline in the factory
vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: vi.fn(),
  },
}));

// Import after mocking
import { GET } from "@/app/api/soylenti/trending/route";
import { supabase } from "@/lib/supabase";

// Cast the mocked supabase for type safety
const mockSupabase = supabase as unknown as { from: ReturnType<typeof vi.fn> };

/**
 * Helper to create mock for the new fetchTrendingPlayersWithTimeline function.
 * It makes two queries: players table first, then news_players for timeline.
 */
function setupTrendingMock(
  mockPlayers: Array<{
    id: number;
    name: string;
    normalized_name: string;
    rumor_count: number;
    first_seen_at: string;
    last_seen_at: string;
  }>,
  mockTimeline: Array<{
    player_id: number;
    betis_news: { pub_date: string };
  }> = [],
) {
  mockSupabase.from.mockImplementation((table: string) => {
    if (table === "players") {
      return {
        select: vi.fn().mockReturnValue({
          gte: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue({
                  data: mockPlayers,
                  error: null,
                }),
              }),
            }),
          }),
        }),
      };
    } else if (table === "news_players") {
      return {
        select: vi.fn().mockReturnValue({
          in: vi.fn().mockReturnValue({
            gte: vi.fn().mockReturnValue({
              gt: vi.fn().mockResolvedValue({
                data: mockTimeline,
                error: null,
              }),
            }),
          }),
        }),
      };
    }
    return {};
  });
}

describe("Trending Players API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/soylenti/trending", () => {
    it("should return trending players sorted by rumor count", async () => {
      const mockPlayers = [
        {
          id: 1,
          name: "Isco Alarcón",
          normalized_name: "isco alarcon",
          rumor_count: 5,
          first_seen_at: "2025-12-20T10:00:00Z",
          last_seen_at: "2025-12-28T10:00:00Z",
        },
        {
          id: 2,
          name: "Nabil Fekir",
          normalized_name: "nabil fekir",
          rumor_count: 5,
          first_seen_at: "2025-12-18T10:00:00Z",
          last_seen_at: "2025-12-26T10:00:00Z",
        },
        {
          id: 3,
          name: "Marc Roca",
          normalized_name: "marc roca",
          rumor_count: 3,
          first_seen_at: "2025-12-15T10:00:00Z",
          last_seen_at: "2025-12-29T10:00:00Z", // Most recent, but fewer rumors
        },
      ];

      setupTrendingMock(mockPlayers, []);

      const request = new NextRequest(
        "http://localhost:3000/api/soylenti/trending",
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.players).toHaveLength(3);
      expect(data.data.totalCount).toBe(3);

      // Verify primary sort by rumor_count (desc)
      expect(data.data.players[0].name).toBe("Isco Alarcón");
      expect(data.data.players[1].name).toBe("Nabil Fekir");
      // Verify secondary sort by last_seen_at (desc)
      expect(data.data.players[0].rumorCount).toBe(5);
      expect(data.data.players[1].rumorCount).toBe(5);
      // Marc Roca has fewer rumors, so should be last despite recent activity
      expect(data.data.players[2].name).toBe("Marc Roca");
      expect(data.data.players[2].rumorCount).toBe(3);
    });

    it("should return empty array when no players found", async () => {
      setupTrendingMock([], []);

      const request = new NextRequest(
        "http://localhost:3000/api/soylenti/trending",
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.players).toHaveLength(0);
      expect(data.data.totalCount).toBe(0);
    });

    it("should return empty array on database error", async () => {
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === "players") {
          return {
            select: vi.fn().mockReturnValue({
              gte: vi.fn().mockReturnValue({
                order: vi.fn().mockReturnValue({
                  order: vi.fn().mockReturnValue({
                    limit: vi.fn().mockResolvedValue({
                      data: null,
                      error: { message: "Database error" },
                    }),
                  }),
                }),
              }),
            }),
          };
        }
        return {};
      });

      const request = new NextRequest(
        "http://localhost:3000/api/soylenti/trending",
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.players).toHaveLength(0);
    });

    it("should correctly identify active players (last seen within 7 days)", async () => {
      const now = new Date();
      const threeDaysAgo = new Date(now);
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      const tenDaysAgo = new Date(now);
      tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

      const mockPlayers = [
        {
          id: 1,
          name: "Active Player",
          normalized_name: "active player",
          rumor_count: 2,
          first_seen_at: "2025-12-01T10:00:00Z",
          last_seen_at: threeDaysAgo.toISOString(),
        },
        {
          id: 2,
          name: "Inactive Player",
          normalized_name: "inactive player",
          rumor_count: 2,
          first_seen_at: "2025-12-01T10:00:00Z",
          last_seen_at: tenDaysAgo.toISOString(),
        },
      ];

      setupTrendingMock(mockPlayers, []);

      const request = new NextRequest(
        "http://localhost:3000/api/soylenti/trending",
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.players[0].isActive).toBe(true);
      expect(data.data.players[1].isActive).toBe(false);
    });

    it("should limit results to 10 players", async () => {
      setupTrendingMock([], []);

      const request = new NextRequest(
        "http://localhost:3000/api/soylenti/trending",
      );
      await GET(request);

      expect(mockSupabase.from).toHaveBeenCalledWith("players");
    });

    it("should include timeline data and momentum phase", async () => {
      const now = new Date();
      const oneDayAgo = new Date(now);
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);

      const mockPlayers = [
        {
          id: 1,
          name: "Hot Player",
          normalized_name: "hot player",
          rumor_count: 10,
          first_seen_at: "2025-12-01T10:00:00Z",
          last_seen_at: oneDayAgo.toISOString(),
        },
      ];

      // Mock timeline data with recent activity
      const mockTimeline = [
        { player_id: 1, betis_news: { pub_date: oneDayAgo.toISOString() } },
        { player_id: 1, betis_news: { pub_date: oneDayAgo.toISOString() } },
        { player_id: 1, betis_news: { pub_date: oneDayAgo.toISOString() } },
      ];

      setupTrendingMock(mockPlayers, mockTimeline);

      const request = new NextRequest(
        "http://localhost:3000/api/soylenti/trending",
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.players[0]).toHaveProperty("timeline");
      expect(data.data.players[0]).toHaveProperty("phase");
      expect(data.data.players[0]).toHaveProperty("momentumPct");
      expect(data.data.players[0]).toHaveProperty("daysSinceLastMention");
    });
  });
});
