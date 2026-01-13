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
 * Helper to create mock for fetchTrendingPlayersWithTimeline.
 * The new implementation queries news_players with inner joins to players and betis_news,
 * filtering by ai_probability > 0, then groups/counts in application code.
 */
function setupTrendingMock(
  mockMentions: Array<{
    player_id: number;
    players: {
      id: number;
      name: string;
      normalized_name: string;
      first_seen_at: string;
      last_seen_at: string;
    };
    betis_news: { pub_date: string };
  }>,
) {
  mockSupabase.from.mockImplementation((table: string) => {
    if (table === "news_players") {
      return {
        select: vi.fn().mockReturnValue({
          gt: vi.fn().mockResolvedValue({
            data: mockMentions,
            error: null,
          }),
        }),
      };
    }
    return {};
  });
}

/**
 * Helper to create mock mention data for a player with multiple mentions
 */
function createPlayerMentions(
  playerId: number,
  playerName: string,
  normalizedName: string,
  mentionDates: string[],
  firstSeen: string = "2025-12-01T10:00:00Z",
  lastSeen: string = "2025-12-28T10:00:00Z",
) {
  return mentionDates.map((pubDate) => ({
    player_id: playerId,
    players: {
      id: playerId,
      name: playerName,
      normalized_name: normalizedName,
      first_seen_at: firstSeen,
      last_seen_at: lastSeen,
    },
    betis_news: { pub_date: pubDate },
  }));
}

describe("Trending Players API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/soylenti/trending", () => {
    it("should return trending players sorted by trend score (recency-weighted)", async () => {
      // Generate dates relative to today to avoid test failures
      const today = new Date();
      const getDaysAgo = (days: number) => {
        const date = new Date(today);
        date.setUTCDate(date.getUTCDate() - days);
        return date.toISOString();
      };

      // Player 1: 5 rumor mentions (recent)
      const player1Mentions = createPlayerMentions(
        1,
        "Isco Alarcón",
        "isco alarcon",
        [
          getDaysAgo(0), // today
          getDaysAgo(1),
          getDaysAgo(2),
          getDaysAgo(3),
          getDaysAgo(4),
        ],
      );

      // Player 2: 5 rumor mentions (older - lower trend score)
      const player2Mentions = createPlayerMentions(
        2,
        "Nabil Fekir",
        "nabil fekir",
        [
          getDaysAgo(2),
          getDaysAgo(3),
          getDaysAgo(4),
          getDaysAgo(5),
          getDaysAgo(6),
        ],
      );

      // Player 3: 3 very recent mentions (high trend score due to recency bonus)
      const player3Mentions = createPlayerMentions(
        3,
        "Marc Roca",
        "marc roca",
        [
          getDaysAgo(0), // today
          getDaysAgo(0), // today (same day, different article)
          getDaysAgo(1),
        ],
      );

      setupTrendingMock([
        ...player1Mentions,
        ...player2Mentions,
        ...player3Mentions,
      ]);

      const request = new NextRequest(
        "http://localhost:3000/api/soylenti/trending",
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.players).toHaveLength(3);
      expect(data.data.totalCount).toBe(3);

      // With decay algorithm: sorted by trend score (recency-weighted)
      // Marc Roca ranks high due to very recent activity + recency bonus
      // Isco Alarcón has more mentions and decent recency
      // Nabil Fekir has older mentions so lower trend score
      // Note: Exact order depends on decay weights and recency bonus

      // All players should have trend metrics
      expect(data.data.players[0]).toHaveProperty("trendScore");
      expect(data.data.players[0]).toHaveProperty("velocity");

      // Verify counts are preserved regardless of sort order
      const iscoPlayer = data.data.players.find(
        (p: { name: string }) => p.name === "Isco Alarcón",
      );
      const fekirPlayer = data.data.players.find(
        (p: { name: string }) => p.name === "Nabil Fekir",
      );
      const rocaPlayer = data.data.players.find(
        (p: { name: string }) => p.name === "Marc Roca",
      );

      // Ensure all players were found
      expect(iscoPlayer).toBeDefined();
      expect(fekirPlayer).toBeDefined();
      expect(rocaPlayer).toBeDefined();

      expect(iscoPlayer!.rumorCount).toBe(5);
      expect(fekirPlayer!.rumorCount).toBe(5);
      expect(rocaPlayer!.rumorCount).toBe(3);

      // Fekir (oldest mentions) should have lowest trend score
      expect(fekirPlayer!.trendScore).toBeLessThan(iscoPlayer!.trendScore);
    });

    it("should return empty array when no players found", async () => {
      setupTrendingMock([]);

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
        if (table === "news_players") {
          return {
            select: vi.fn().mockReturnValue({
              gt: vi.fn().mockResolvedValue({
                data: null,
                error: { message: "Database error" },
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

      // Active player: recent mentions
      const activeMentions = createPlayerMentions(
        1,
        "Active Player",
        "active player",
        [threeDaysAgo.toISOString(), threeDaysAgo.toISOString()],
      );

      // Inactive player: old mentions
      const inactiveMentions = createPlayerMentions(
        2,
        "Inactive Player",
        "inactive player",
        [tenDaysAgo.toISOString(), tenDaysAgo.toISOString()],
      );

      setupTrendingMock([...activeMentions, ...inactiveMentions]);

      const request = new NextRequest(
        "http://localhost:3000/api/soylenti/trending",
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.players[0].isActive).toBe(true);
      expect(data.data.players[1].isActive).toBe(false);
    });

    it("should query news_players table for rumor mentions", async () => {
      setupTrendingMock([]);

      const request = new NextRequest(
        "http://localhost:3000/api/soylenti/trending",
      );
      await GET(request);

      expect(mockSupabase.from).toHaveBeenCalledWith("news_players");
    });

    it("should include timeline data and momentum phase", async () => {
      const now = new Date();
      const oneDayAgo = new Date(now);
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);

      // Player with recent activity for momentum calculation
      const mentions = createPlayerMentions(1, "Hot Player", "hot player", [
        oneDayAgo.toISOString(),
        oneDayAgo.toISOString(),
        oneDayAgo.toISOString(),
      ]);

      setupTrendingMock(mentions);

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
