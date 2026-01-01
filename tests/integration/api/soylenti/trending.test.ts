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

describe("Trending Players API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/soylenti/trending", () => {
    it("should return trending players sorted by rumor count", async () => {
      const mockPlayers = [
        {
          name: "Isco Alarcón",
          normalized_name: "isco alarcon",
          rumor_count: 5,
          first_seen_at: "2025-12-20T10:00:00Z",
          last_seen_at: "2025-12-28T10:00:00Z",
        },
        {
          name: "Marc Roca",
          normalized_name: "marc roca",
          rumor_count: 3,
          first_seen_at: "2025-12-15T10:00:00Z",
          last_seen_at: "2025-12-25T10:00:00Z",
        },
      ];

      mockSupabase.from.mockReturnValue({
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
      });

      const request = new NextRequest(
        "http://localhost:3000/api/soylenti/trending",
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.players).toHaveLength(2);
      expect(data.data.players[0].name).toBe("Isco Alarcón");
      expect(data.data.players[0].normalizedName).toBe("isco alarcon");
      expect(data.data.players[0].rumorCount).toBe(5);
      expect(data.data.totalCount).toBe(2);
    });

    it("should return empty array when no players found", async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          gte: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue({
                  data: [],
                  error: null,
                }),
              }),
            }),
          }),
        }),
      });

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
      mockSupabase.from.mockReturnValue({
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
          name: "Active Player",
          normalized_name: "active player",
          rumor_count: 2,
          first_seen_at: "2025-12-01T10:00:00Z",
          last_seen_at: threeDaysAgo.toISOString(),
        },
        {
          name: "Inactive Player",
          normalized_name: "inactive player",
          rumor_count: 2,
          first_seen_at: "2025-12-01T10:00:00Z",
          last_seen_at: tenDaysAgo.toISOString(),
        },
      ];

      mockSupabase.from.mockReturnValue({
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
      });

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
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          gte: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                limit: vi.fn((count) => {
                  expect(count).toBe(10);
                  return Promise.resolve({
                    data: [],
                    error: null,
                  });
                }),
              }),
            }),
          }),
        }),
      });

      const request = new NextRequest(
        "http://localhost:3000/api/soylenti/trending",
      );
      await GET(request);

      expect(mockSupabase.from).toHaveBeenCalledWith("players");
    });
  });
});
