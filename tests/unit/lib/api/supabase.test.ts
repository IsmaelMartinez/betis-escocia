import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock logger
vi.mock("@/lib/utils/logger", () => ({
  log: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    database: vi.fn(),
    business: vi.fn(),
    apiRequest: vi.fn(),
    auth: vi.fn(),
    featureFlag: vi.fn(),
    child: vi.fn(),
    setGlobalContext: vi.fn(),
    clearGlobalContext: vi.fn(),
  },
}));

// Mock the createClient function
vi.mock("@supabase/supabase-js", () => {
  const createMockQueryBuilder = () => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lt: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn(),
    maybeSingle: vi.fn(),
    then: vi.fn(),
  });

  const mockSupabase = {
    from: vi.fn(() => createMockQueryBuilder()),
  };

  return {
    createClient: vi.fn(() => mockSupabase),
  };
});

// Import functions to test after mocking
import {
  getMatches,
  getUpcomingMatches,
  getMatch,
  createMatch,
  updateMatch,
  deleteMatch,
  getTriviaQuestions,
  getTriviaQuestion,
  getUserDailyTriviaScore,
  getAuthenticatedSupabaseClient,
  type Match,
  type MatchInsert,
  type MatchUpdate,
} from "@/lib/api/supabase";
import { log } from "@/lib/utils/logger";

import { createClient } from "@supabase/supabase-js";
const mockCreateClient = createClient as ReturnType<typeof vi.fn>;

// Helper to create fresh mock query builders
function createMockQueryBuilder() {
  return {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lt: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn(),
    maybeSingle: vi.fn(),
    then: vi.fn(),
  };
}

// Get the mocked supabase instance
const mockSupabase = mockCreateClient();

// Mock data
const mockMatch: Match = {
  id: 1,
  competition: "La Liga",
  date_time: "2025-08-10T18:00:00Z",
  opponent: "FC Barcelona",
  home_away: "home",
  home_score: undefined,
  away_score: undefined,
  status: "SCHEDULED",
  matchday: 30,
  created_at: "2025-07-01T00:00:00Z",
  updated_at: "2025-07-01T00:00:00Z",
  external_id: 12345,
  notes: "Important match",
};

const mockMatchInsert: MatchInsert = {
  competition: "La Liga",
  date_time: "2025-08-10T18:00:00Z",
  opponent: "FC Barcelona",
  home_away: "home",
  status: "SCHEDULED",
  matchday: 30,
  external_id: 12345,
  notes: "Important match",
};

const mockMatchUpdate: MatchUpdate = {
  status: "FINISHED",
  home_score: 2,
  away_score: 1,
};

describe("supabase", () => {
  let mockQueryBuilder: any;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});

    // Create a fresh mock query builder for each test
    mockQueryBuilder = createMockQueryBuilder();
    (mockSupabase.from as any).mockReturnValue(mockQueryBuilder);
  });

  describe("client creation", () => {
    it("should create authenticated client with token", () => {
      const token = "test-token";
      getAuthenticatedSupabaseClient(token);

      expect(mockCreateClient).toHaveBeenCalledWith(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
          global: {
            headers: { Authorization: `Bearer ${token}` },
          },
        },
      );
    });
  });

  describe("getMatches", () => {
    it("should fetch all matches without limit", async () => {
      // Mock the promise resolution to return success
      mockQueryBuilder.then.mockImplementation(async (resolve: any) =>
        resolve({ data: [mockMatch], error: null }),
      );

      const result = await getMatches();

      expect(mockSupabase.from).toHaveBeenCalledWith("matches");
      expect(mockQueryBuilder.select).toHaveBeenCalledWith("*");
      expect(mockQueryBuilder.order).toHaveBeenCalledWith("date_time", {
        ascending: true,
      });
      expect(mockQueryBuilder.limit).not.toHaveBeenCalled();
      expect(result).toEqual([mockMatch]);
    });

    it("should fetch matches with limit", async () => {
      // Mock the promise resolution for the query with limit
      mockQueryBuilder.then.mockImplementation(async (resolve: any) =>
        resolve({ data: [mockMatch], error: null }),
      );

      const result = await getMatches(5);

      expect(mockSupabase.from).toHaveBeenCalledWith("matches");
      expect(mockQueryBuilder.select).toHaveBeenCalledWith("*");
      expect(mockQueryBuilder.order).toHaveBeenCalledWith("date_time", {
        ascending: true,
      });
      expect(mockQueryBuilder.limit).toHaveBeenCalledWith(5);
      expect(result).toEqual([mockMatch]);
    });

    it("should return null on error", async () => {
      // Mock the promise resolution to return error
      mockQueryBuilder.then.mockImplementation(async (resolve: any) =>
        resolve({ data: null, error: { message: "Database error" } }),
      );

      const result = await getMatches();

      expect(log.database).toHaveBeenCalledWith(
        "select",
        "matches",
        undefined,
        expect.any(Object),
      );
      expect(result).toBeNull();
    });
  });

  describe("getUpcomingMatches", () => {
    it("should fetch upcoming matches with default limit", async () => {
      mockQueryBuilder.then.mockImplementation(async (resolve: any) =>
        resolve({ data: [mockMatch], error: null }),
      );

      const result = await getUpcomingMatches();

      expect(mockSupabase.from).toHaveBeenCalledWith("matches");
      expect(mockQueryBuilder.select).toHaveBeenCalledWith("*");
      expect(mockQueryBuilder.gte).toHaveBeenCalledWith(
        "date_time",
        expect.any(String),
      );
      expect(mockQueryBuilder.order).toHaveBeenCalledWith("date_time", {
        ascending: true,
      });
      expect(mockQueryBuilder.limit).toHaveBeenCalledWith(2);
      expect(result).toEqual([mockMatch]);
    });

    it("should fetch upcoming matches with custom limit", async () => {
      mockQueryBuilder.then.mockImplementation(async (resolve: any) =>
        resolve({ data: [mockMatch], error: null }),
      );

      const result = await getUpcomingMatches(5);

      expect(mockQueryBuilder.limit).toHaveBeenCalledWith(5);
      expect(result).toEqual([mockMatch]);
    });

    it("should return null on error", async () => {
      mockQueryBuilder.then.mockImplementation(async (resolve: any) =>
        resolve({ data: null, error: { message: "Database error" } }),
      );

      const result = await getUpcomingMatches();

      expect(log.database).toHaveBeenCalledWith(
        "select",
        "matches",
        undefined,
        expect.any(Object),
      );
      expect(result).toBeNull();
    });
  });

  describe("getMatch", () => {
    it("should fetch single match by id", async () => {
      mockQueryBuilder.maybeSingle.mockResolvedValue({
        data: mockMatch,
        error: null,
      });

      const result = await getMatch(1);

      expect(mockSupabase.from).toHaveBeenCalledWith("matches");
      expect(mockQueryBuilder.select).toHaveBeenCalledWith("*");
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith("id", 1);
      expect(mockQueryBuilder.maybeSingle).toHaveBeenCalled();
      expect(result).toEqual(mockMatch);
    });

    it("should return null on error", async () => {
      mockQueryBuilder.maybeSingle.mockResolvedValue({
        data: null,
        error: { message: "Match not found" },
      });

      const result = await getMatch(999);

      expect(log.database).toHaveBeenCalledWith(
        "select",
        "matches",
        undefined,
        expect.any(Object),
        expect.objectContaining({ matchId: 999 }),
      );
      expect(result).toBeNull();
    });
  });

  describe("createMatch", () => {
    it("should create new match successfully", async () => {
      mockQueryBuilder.single.mockResolvedValue({
        data: mockMatch,
        error: null,
      });

      const result = await createMatch(mockMatchInsert);

      expect(mockSupabase.from).toHaveBeenCalledWith("matches");
      expect(mockQueryBuilder.insert).toHaveBeenCalledWith([mockMatchInsert]);
      expect(mockQueryBuilder.select).toHaveBeenCalled();
      expect(mockQueryBuilder.single).toHaveBeenCalled();
      expect(result).toEqual({ success: true, data: mockMatch });
    });

    it("should return error on failed creation", async () => {
      mockQueryBuilder.single.mockResolvedValue({
        data: null,
        error: { message: "Validation error" },
      });

      const result = await createMatch(mockMatchInsert);

      expect(log.database).toHaveBeenCalledWith(
        "insert",
        "matches",
        undefined,
        expect.any(Object),
      );
      expect(result).toEqual({ success: false, error: "Validation error" });
    });
  });

  describe("updateMatch", () => {
    it("should update match successfully", async () => {
      const updatedMatch = { ...mockMatch, ...mockMatchUpdate };
      mockQueryBuilder.single.mockResolvedValue({
        data: updatedMatch,
        error: null,
      });

      const result = await updateMatch(1, mockMatchUpdate);

      expect(mockSupabase.from).toHaveBeenCalledWith("matches");
      expect(mockQueryBuilder.update).toHaveBeenCalledWith(mockMatchUpdate);
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith("id", 1);
      expect(mockQueryBuilder.select).toHaveBeenCalled();
      expect(mockQueryBuilder.single).toHaveBeenCalled();
      expect(result).toEqual({ success: true, data: updatedMatch });
    });

    it("should return error on failed update", async () => {
      mockQueryBuilder.single.mockResolvedValue({
        data: null,
        error: { message: "Match not found" },
      });

      const result = await updateMatch(999, mockMatchUpdate);

      expect(log.database).toHaveBeenCalledWith(
        "update",
        "matches",
        undefined,
        expect.any(Object),
        expect.objectContaining({ matchId: 999 }),
      );
      expect(result).toEqual({ success: false, error: "Match not found" });
    });
  });

  describe("deleteMatch", () => {
    it("should delete match successfully", async () => {
      mockQueryBuilder.then.mockImplementation(async (resolve: any) =>
        resolve({ error: null }),
      );

      const result = await deleteMatch(1);

      expect(mockSupabase.from).toHaveBeenCalledWith("matches");
      expect(mockQueryBuilder.delete).toHaveBeenCalled();
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith("id", 1);
      expect(result).toEqual({ success: true });
    });

    it("should return error on failed deletion", async () => {
      mockQueryBuilder.then.mockImplementation(async (resolve: any) =>
        resolve({ error: { message: "Delete failed" } }),
      );

      const result = await deleteMatch(999);

      expect(log.database).toHaveBeenCalledWith(
        "delete",
        "matches",
        undefined,
        expect.any(Object),
        expect.objectContaining({ matchId: 999 }),
      );
      expect(result).toEqual({ success: false, error: "Delete failed" });
    });
  });

  describe("trivia functions", () => {
    it("should get trivia questions", async () => {
      const mockData = [{ id: "1", question: "Test?", answers: [] }];
      const mockBuilder = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        then: vi
          .fn()
          .mockImplementation(async (resolve: any) =>
            resolve({ data: mockData, error: null }),
          ),
      };

      mockSupabase.from.mockReturnValue(mockBuilder);

      const result = await getTriviaQuestions();

      expect(mockSupabase.from).toHaveBeenCalledWith("trivia_questions");
      expect(mockBuilder.select).toHaveBeenCalledWith("*");
      expect(mockBuilder.order).toHaveBeenCalledWith("created_at", {
        ascending: false,
      });
      expect(result).toEqual(mockData);
    });

    it("should handle trivia questions error", async () => {
      const mockBuilder = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        then: vi
          .fn()
          .mockImplementation(async (resolve: any) =>
            resolve({ data: null, error: new Error("DB error") }),
          ),
      };

      mockSupabase.from.mockReturnValue(mockBuilder);
      vi.clearAllMocks();

      const result = await getTriviaQuestions();

      expect(result).toBeNull();
      expect(log.database).toHaveBeenCalledWith(
        "select",
        "trivia_questions",
        undefined,
        expect.any(Object),
      );
    });

    it("should get single trivia question", async () => {
      const mockData = { id: "1", question: "Test?", answers: [] };
      const mockBuilder = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockReturnThis(),
        then: vi
          .fn()
          .mockImplementation(async (resolve: any) =>
            resolve({ data: mockData, error: null }),
          ),
      };

      mockSupabase.from.mockReturnValue(mockBuilder);

      const result = await getTriviaQuestion("1");

      expect(mockSupabase.from).toHaveBeenCalledWith("trivia_questions");
      expect(mockBuilder.select).toHaveBeenCalledWith("*");
      expect(mockBuilder.eq).toHaveBeenCalledWith("id", "1");
      expect(mockBuilder.maybeSingle).toHaveBeenCalled();
      expect(result).toEqual(mockData);
    });
  });

  describe("getUserDailyTriviaScore", () => {
    const mockAuthenticatedSupabase = {
      from: vi.fn(),
    } as any;

    it("should get user daily trivia score", async () => {
      const mockData = { id: 1, user_id: "user123", score: 100 };
      const mockBuilder = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lt: vi.fn().mockReturnThis(),
        single: vi.fn().mockReturnThis(),
        then: vi
          .fn()
          .mockImplementation(async (resolve: any) =>
            resolve({ data: mockData, error: null }),
          ),
      };

      mockAuthenticatedSupabase.from.mockReturnValue(mockBuilder);

      const result = await getUserDailyTriviaScore(
        "user123",
        mockAuthenticatedSupabase,
      );

      expect(result).toEqual({ success: true, data: mockData });
    });

    it("should handle no rows found (PGRST116)", async () => {
      const mockBuilder = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lt: vi.fn().mockReturnThis(),
        single: vi.fn().mockReturnThis(),
        then: vi.fn().mockImplementation(async (resolve: any) =>
          resolve({
            data: null,
            error: { code: "PGRST116", message: "No rows found" },
          }),
        ),
      };

      mockAuthenticatedSupabase.from.mockReturnValue(mockBuilder);

      const result = await getUserDailyTriviaScore(
        "user123",
        mockAuthenticatedSupabase,
      );

      expect(result).toEqual({ success: true, data: null });
    });

    it("should handle database errors", async () => {
      const mockBuilder = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lt: vi.fn().mockReturnThis(),
        single: vi.fn().mockReturnThis(),
        then: vi.fn().mockImplementation(async (resolve: any) =>
          resolve({
            data: null,
            error: { code: "OTHER_ERROR", message: "Database error" },
          }),
        ),
      };

      mockAuthenticatedSupabase.from.mockReturnValue(mockBuilder);
      vi.clearAllMocks();

      const result = await getUserDailyTriviaScore(
        "user123",
        mockAuthenticatedSupabase,
      );

      expect(result).toEqual({ success: false, error: "Database error" });
      expect(log.database).toHaveBeenCalledWith(
        "select",
        "user_trivia_scores",
        undefined,
        expect.any(Object),
        expect.objectContaining({ userId: "user123" }),
      );
    });
  });

});
