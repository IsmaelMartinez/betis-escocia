
// Mock Clerk before any other imports
jest.mock("@clerk/nextjs/server", () => ({
  auth: jest.fn(),
  currentUser: jest.fn(),
}));

// Mock Supabase
jest.mock("@/lib/supabase", () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ error: null })),
      })),
      insert: jest.fn(() => Promise.resolve({ error: null })),
    })),
  },
}));

// Mock security functions
jest.mock("@/lib/security", () => ({
  checkRateLimit: jest.fn(() => ({
    allowed: true,
    remaining: 10,
    resetTime: Date.now() + 60 * 60 * 1000,
  })),
  getClientIP: jest.fn(() => "127.0.0.1"),
}));

// Mock FootballDataService
jest.mock("@/services/footballDataService", () => ({
  FootballDataService: jest.fn(() => ({
    getBetisMatchesForSeasons: jest.fn(() => Promise.resolve([])),
  })),
}));

// Mock Next.js NextResponse
jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((data, options) => ({
      status: options?.status || 200,
      data: data,
    })),
  },
}));

import { POST } from "@/app/api/admin/sync-matches/route";
import { NextRequest } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";
import { FootballDataService } from "@/services/footballDataService";
import { checkRateLimit } from "@/lib/security";

const mockAuth = auth as jest.Mock;
const mockCurrentUser = currentUser as jest.Mock;
const mockSupabaseFrom = supabase.from as jest.Mock;
const mockGetBetisMatchesForSeasons = jest.fn();
jest.mock("@/services/footballDataService", () => ({
  FootballDataService: jest.fn(() => ({
    getBetisMatchesForSeasons: mockGetBetisMatchesForSeasons,
  })),
}));
const mockCheckRateLimit = checkRateLimit as jest.Mock;

describe("POST /api/admin/sync-matches", () => {
  let mockRequest: Partial<NextRequest>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest = {
      headers: new Headers({
        "x-forwarded-for": "127.0.0.1",
      }),
    };
    // Default mock for admin role check
    mockAuth.mockReturnValue({ userId: "admin_user_id" });
    mockCurrentUser.mockResolvedValue({
      id: "admin_user_id",
      publicMetadata: { role: "admin" },
    });
    mockCheckRateLimit.mockReturnValue({
      allowed: true,
      remaining: 10,
      resetTime: Date.now() + 60 * 60 * 1000,
    });
  });

  // Test Case 1: Authentication and Authorization
  it("should return 401 if no user is authenticated", async () => {
    mockAuth.mockReturnValue({ userId: null });

    const response = await POST(mockRequest as NextRequest);
    const jsonResponse = (response as any).data;

    expect(response.status).toBe(401);
    expect(jsonResponse.success).toBe(false);
    expect(jsonResponse.message).toBe("Unauthorized. Please sign in.");
  });

  it("should return 403 if user is not an admin", async () => {
    mockAuth.mockReturnValue({ userId: "non_admin_user_id" });
    mockCurrentUser.mockResolvedValue({
      id: "non_admin_user_id",
      publicMetadata: { role: "user" },
    });

    const response = await POST(mockRequest as NextRequest);
    const jsonResponse = (response as any).data;

    expect(response.status).toBe(403);
    expect(jsonResponse.success).toBe(false);
    expect(jsonResponse.message).toBe("Forbidden. Admin access required.");
  });

  // Test Case 4: Rate Limiting
  it("should return 429 if rate limit is exceeded", async () => {
    mockCheckRateLimit.mockReturnValue({
      allowed: false,
      remaining: 0,
      resetTime: Date.now() + 60 * 60 * 1000,
    });

    const response = await POST(mockRequest as NextRequest);
    const jsonResponse = (response as any).data;

    expect(response.status).toBe(429);
    expect(jsonResponse.success).toBe(false);
    expect(jsonResponse.error).toBe("Demasiadas solicitudes de sincronización. Intenta de nuevo más tarde.");
  });

  // Test Case 5: Successful Match Synchronization - New and Updated Matches
  it("should successfully synchronize new and updated matches", async () => {
    const mockNewMatch = {
      id: 1001,
      utcDate: "2025-08-01T18:00:00Z",
      status: "FINISHED",
      matchday: 1,
      homeTeam: { id: 90, name: "Real Betis Balompié" },
      awayTeam: { id: 100, name: "Opponent A" },
      competition: { name: "La Liga" },
      score: { fullTime: { home: 2, away: 1 } },
    };

    const mockExistingMatch = {
      id: 1002,
      utcDate: "2025-08-05T20:00:00Z",
      status: "SCHEDULED",
      matchday: 2,
      homeTeam: { id: 101, name: "Opponent B" },
      awayTeam: { id: 90, name: "Real Betis Balompié" },
      competition: { name: "La Liga" },
      score: { fullTime: { home: null, away: null } },
    };

    // Mock FootballDataService to return both new and existing matches
    mockGetBetisMatchesForSeasons.mockResolvedValueOnce([mockNewMatch, mockExistingMatch]);

    // Mock Supabase to simulate:
    // 1. New match not existing
    // 2. Existing match already existing
    let mockInsert = jest.fn(() => Promise.resolve({ error: null })); // Successful insert
    let mockUpdate = jest.fn(() => ({
      eq: jest.fn(() => Promise.resolve({ error: null })), // Successful update
    }));

    mockSupabaseFrom.mockImplementation((table: string) => {
      if (table === "matches") {
        return {
          select: jest.fn(() => ({
            eq: jest.fn((column: string, value: any) => {
              if (column === "external_id") {
                if (value === mockNewMatch.id) {
                  return { single: jest.fn(() => Promise.resolve({ data: null, error: null })) }; // New match
                } else if (value === mockExistingMatch.id) {
                  return { single: jest.fn(() => Promise.resolve({ data: { id: "existing_db_id_1002" }, error: null })) }; // Existing match
                }
              }
              return { single: jest.fn(() => Promise.resolve({ data: null, error: null })) };
            }),
          })),
          insert: mockInsert,
          update: mockUpdate,
        };
      }
      return {
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ data: null, error: null })),
          })),
        })),
      };
    });

    const response = await POST(mockRequest as NextRequest);
    const jsonResponse = (response as any).data;

    expect(response.status).toBe(200);
    expect(jsonResponse.success).toBe(true);
    expect(jsonResponse.message).toContain("Sincronización completada");
    expect(jsonResponse.summary.total).toBe(2);
    expect(jsonResponse.summary.imported).toBe(1);
    expect(jsonResponse.summary.updated).toBe(1);
    expect(jsonResponse.summary.errors).toBe(0);

    // Verify insert and update calls
    expect(mockInsert).toHaveBeenCalledTimes(1);
    expect(mockUpdate).toHaveBeenCalledTimes(1);
  });

  // Test Case 6: FootballDataService Error Handling
  it("should handle FootballDataService errors gracefully", async () => {
    mockGetBetisMatchesForSeasons.mockRejectedValueOnce(new Error("FootballDataService API error"));

    const response = await POST(mockRequest as NextRequest);
    const jsonResponse = (response as any).data;

    expect(response.status).toBe(500);
    expect(jsonResponse.success).toBe(false);
    expect(jsonResponse.message).toBe("Error durante la sincronización");
    expect(jsonResponse.error).toBe("FootballDataService API error");
  });

  // Test Case 7: Supabase Insert Error Handling
  it("should handle Supabase insert errors", async () => {
    const mockNewMatch = {
      id: 1003,
      utcDate: "2025-08-01T18:00:00Z",
      status: "FINISHED",
      matchday: 1,
      homeTeam: { id: 90, name: "Real Betis Balompié" },
      awayTeam: { id: 100, name: "Opponent C" },
      competition: { name: "La Liga" },
      score: { fullTime: { home: 2, away: 1 } },
    };

    mockGetBetisMatchesForSeasons.mockResolvedValueOnce([mockNewMatch]);

    const mockInsertError = jest.fn(() => Promise.resolve({ error: { message: "Supabase insert failed" } }));

    mockSupabaseFrom.mockImplementation((table: string) => {
      if (table === "matches") {
        return {
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({ data: null, error: null })),
            })),
          })),
          insert: mockInsertError,
          update: jest.fn(() => ({
            eq: jest.fn(() => Promise.resolve({ error: null })),
          })),
        };
      }
      return {
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ data: null, error: null })),
          })),
        })),
      };
    });

    const response = await POST(mockRequest as NextRequest);
    const jsonResponse = (response as any).data;

    expect(response.status).toBe(200);
    expect(jsonResponse.success).toBe(true);
    expect(jsonResponse.message).toContain("1 errores");
    expect(jsonResponse.summary.imported).toBe(0);
    expect(jsonResponse.summary.errors).toBe(1);
    expect(mockInsertError).toHaveBeenCalledTimes(1);
  });

  // Test Case 8: Supabase Update Error Handling
  it("should handle Supabase update errors", async () => {
    const mockExistingMatch = {
      id: 1004,
      utcDate: "2025-08-05T20:00:00Z",
      status: "SCHEDULED",
      matchday: 2,
      homeTeam: { id: 101, name: "Opponent D" },
      awayTeam: { id: 90, name: "Real Betis Balompié" },
      competition: { name: "La Liga" },
      score: { fullTime: { home: null, away: null } },
    };

    mockGetBetisMatchesForSeasons.mockResolvedValueOnce([mockExistingMatch]);

    const mockUpdateError = jest.fn(() => ({
      eq: jest.fn(() => Promise.resolve({ error: { message: "Supabase update failed" } })),
    }));

    mockSupabaseFrom.mockImplementation((table: string) => {
      if (table === "matches") {
        return {
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({ data: { id: "existing_db_id_1004" }, error: null })),
            })),
          })),
          insert: jest.fn(() => Promise.resolve({ error: null })),
          update: mockUpdateError,
        };
      }
      return {
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ data: null, error: null })),
          })),
        })),
      };
    });

    const response = await POST(mockRequest as NextRequest);
    const jsonResponse = (response as any).data;

    expect(response.status).toBe(200);
    expect(jsonResponse.success).toBe(true);
    expect(jsonResponse.message).toContain("1 errores");
    expect(jsonResponse.summary.updated).toBe(0);
    expect(jsonResponse.summary.errors).toBe(1);
    expect(mockUpdateError).toHaveBeenCalledTimes(1);
  });

  // Test Case 9: Edge Case - Null Scores for Finished Match
  it("should handle finished matches with null scores", async () => {
    const mockMatchWithNullScores = {
      id: 1005,
      utcDate: "2025-08-01T18:00:00Z",
      status: "FINISHED",
      matchday: 1,
      homeTeam: { id: 90, name: "Real Betis Balompié" },
      awayTeam: { id: 100, name: "Opponent E" },
      competition: { name: "La Liga" },
      score: { fullTime: { home: null, away: null } },
    };

    mockGetBetisMatchesForSeasons.mockResolvedValueOnce([mockMatchWithNullScores]);

    const mockInsert = jest.fn(() => Promise.resolve({ error: null }));
    mockSupabaseFrom.mockImplementation((table: string) => {
      if (table === "matches") {
        return {
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({ data: null, error: null })),
            })),
          })),
          insert: mockInsert,
          update: jest.fn(() => ({
            eq: jest.fn(() => Promise.resolve({ error: null })),
          })),
        };
      }
      return {
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ data: null, error: null })),
          })),
        })),
      };
    });

    const response = await POST(mockRequest as NextRequest);
    const jsonResponse = (response as any).data;

    expect(response.status).toBe(200);
    expect(jsonResponse.success).toBe(true);
    expect(jsonResponse.message).toContain("Sincronización completada");
    expect(jsonResponse.summary.imported).toBe(1);
    expect(jsonResponse.summary.updated).toBe(0);
    expect(jsonResponse.summary.errors).toBe(0);

    // Verify that the match was inserted without a result or scores
    expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
      result: undefined,
      home_score: undefined,
      away_score: undefined,
      status: "FINISHED",
    }));
  });

  // Test Case 10: Edge Case - Unfinished Match
  it("should handle unfinished matches (status not FINISHED)", async () => {
    const mockUnfinishedMatch = {
      id: 1006,
      utcDate: "2025-08-01T18:00:00Z",
      status: "SCHEDULED", // Not FINISHED
      matchday: 1,
      homeTeam: { id: 90, name: "Real Betis Balompié" },
      awayTeam: { id: 100, name: "Opponent F" },
      competition: { name: "La Liga" },
      score: { fullTime: { home: null, away: null } },
    };

    mockGetBetisMatchesForSeasons.mockResolvedValueOnce([mockUnfinishedMatch]);

    const mockInsert = jest.fn(() => Promise.resolve({ error: null }));
    mockSupabaseFrom.mockImplementation((table: string) => {
      if (table === "matches") {
        return {
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({ data: null, error: null })),
            })),
          })),
          insert: mockInsert,
          update: jest.fn(() => ({
            eq: jest.fn(() => Promise.resolve({ error: null })),
          })),
        };
      }
      return {
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ data: null, error: null })),
          })),
        })),
      };
    });

    const response = await POST(mockRequest as NextRequest);
    const jsonResponse = (response as any).data;

    expect(response.status).toBe(200);
    expect(jsonResponse.success).toBe(true);
    expect(jsonResponse.message).toContain("Sincronización completada");
    expect(jsonResponse.summary.imported).toBe(1);
    expect(jsonResponse.summary.updated).toBe(0);
    expect(jsonResponse.summary.errors).toBe(0);

    // Verify that the match was inserted without a result or scores
    expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
      result: undefined,
      home_score: undefined,
      away_score: undefined,
      status: "SCHEDULED",
    }));
  });

  // Test Case 11: Edge Case - No Matches Returned
  it("should handle no matches returned by FootballDataService", async () => {
    mockGetBetisMatchesForSeasons.mockResolvedValueOnce([]);

    const response = await POST(mockRequest as NextRequest);
    const jsonResponse = (response as any).data;

    expect(response.status).toBe(200);
    expect(jsonResponse.success).toBe(true);
    expect(jsonResponse.message).toContain("Sincronización completada");
    expect(jsonResponse.summary.total).toBe(0);
    expect(jsonResponse.summary.imported).toBe(0);
    expect(jsonResponse.summary.updated).toBe(0);
    expect(jsonResponse.summary.errors).toBe(0);

    // Verify no Supabase operations were called
    expect(mockSupabaseFrom).not.toHaveBeenCalled();
  });
});
