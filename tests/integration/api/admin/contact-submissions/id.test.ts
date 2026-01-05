// Mock Clerk before any other imports
import { getAuth as mockGetAuth } from "@clerk/nextjs/server"; // Import the mocked getAuth
vi.mock("@clerk/nextjs/server", () => ({
  getAuth: vi.fn(() => ({
    userId: "admin_user_id", // Mock an admin user ID for authenticated tests
    getToken: vi.fn(() => Promise.resolve("mock-clerk-token")),
  })),
}));

import { describe, it, expect, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";
import { PUT } from "@/app/api/admin/contact-submissions/[id]/route";
import { supabase } from "@/lib/supabase";

// Mock supabase client
vi.mock("@/lib/supabase", () => {
  const mockFrom = vi.fn();
  return {
    supabase: {
      from: mockFrom,
    },
    getAuthenticatedSupabaseClient: vi.fn(() => ({
      from: vi.fn(() => ({
        update: vi.fn(() => ({
          eq: vi.fn(() => ({
            select: vi.fn(() => ({
              maybeSingle: vi.fn(),
            })),
          })),
        })),
      })),
    })),
  };
});

// Mock logger
vi.mock("@/lib/logger", () => ({
  log: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    business: vi.fn(),
  },
}));

// Mock API utils
vi.mock("@/lib/apiUtils", () => ({
  createApiHandler: vi.fn((config) => {
    return async (request: any, routeContext: any) => {
      try {
        let validatedData;

        if (
          config.schema &&
          (request.method === "POST" ||
            request.method === "PUT" ||
            request.method === "PATCH")
        ) {
          const body = await request.json();
          validatedData = config.schema.parse(body);
        } else {
          validatedData = {};
        }

        // Simulate getAuth behavior here to construct the context
        const context = {
          request,
          user: request.user, // Assume user is attached to request by test
          authenticatedSupabase: request.authenticatedSupabase, // Assume authenticatedSupabase is attached to request by test
          supabase: undefined,
          params: routeContext?.params,
        };

        // If the route requires admin auth and no user is present, simulate unauthorized
        if (config.auth === "admin" && !context.user) {
          return {
            json: () =>
              Promise.resolve({ success: false, error: "Unauthorized" }),
            status: 401,
          };
        }

        const result = await config.handler(validatedData, context);

        return {
          json: () => Promise.resolve(result),
          status: 200,
        };
      } catch (error: any) {
        const errorResult: any = {
          success: false,
          error: "Error interno del servidor",
        };

        if (error && typeof error === "object" && "issues" in error) {
          // Zod validation error
          errorResult.error = "Datos de entrada inválidos";
          errorResult.details = error.issues.map(
            (issue: any) => `${issue.path.join(".")}: ${issue.message}`,
          );
          return {
            json: () => Promise.resolve(errorResult),
            status: 400,
          };
        } else if (error.message === "Invalid ID") {
          errorResult.error = "Invalid ID";
          return {
            json: () => Promise.resolve(errorResult),
            status: 400,
          };
        } else if (error.message === "Submission not found or not authorized") {
          errorResult.error = "Submission not found or not authorized";
          return {
            json: () => Promise.resolve(errorResult),
            status: 404,
          };
        } else if (error.message === "Failed to update status") {
          errorResult.error = "Failed to update status";
          return {
            json: () => Promise.resolve(errorResult),
            status: 500,
          };
        } else if (
          error.message === "Parámetros de ruta no encontrados" ||
          error.message === "El ID no fue proporcionado en la ruta"
        ) {
          errorResult.error = error.message;
          return {
            json: () => Promise.resolve(errorResult),
            status: 400,
          };
        }

        return {
          json: () => Promise.resolve(errorResult),
          status: 500,
        };
      }
    };
  }),
}));

// Mock Next.js server functions
vi.mock("next/server", () => ({
  NextRequest: vi.fn(),
  NextResponse: {
    json: vi.fn((data, init) => ({
      json: () => Promise.resolve(data),
      status: init?.status || 200,
    })),
  },
}));

describe("Contact Submissions API - PUT", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it("should successfully update a contact submission status", async () => {
    const mockId = 123;
    const mockMaybeSingle = vi.fn(() =>
      Promise.resolve({
        data: { id: mockId, status: "resolved" },
        error: null,
      }),
    );
    const mockSelect = vi.fn(() => ({ maybeSingle: mockMaybeSingle }));
    const mockEq = vi.fn(() => ({ select: mockSelect }));
    const mockUpdate = vi.fn(() => ({ eq: mockEq }));
    const mockFrom = vi.fn(() => ({ update: mockUpdate }));

    const mockRequest = {
      method: "PUT",
      url: `http://localhost:3000/api/admin/contact-submissions/${mockId}`,
      json: () => Promise.resolve({ status: "resolved" }),
      user: { id: "admin_user_id" }, // Add user for authentication
      authenticatedSupabase: {
        from: mockFrom,
      },
    } as unknown as NextRequest;

    const response = await PUT(mockRequest, {
      params: Promise.resolve({ id: String(mockId) }),
    });
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({
      success: true,
      data: { id: mockId, status: "resolved" },
    });
    expect(mockFrom).toHaveBeenCalledWith("contact_submissions");
    expect(mockUpdate).toHaveBeenCalledWith({
      status: "resolved",
      updated_by: "admin_user_id",
    });
    expect(mockEq).toHaveBeenCalledWith("id", mockId);
    expect(mockSelect).toHaveBeenCalled();
    expect(mockMaybeSingle).toHaveBeenCalled();
  });

  it("should return 400 for invalid ID", async () => {
    const mockId = "abc"; // Invalid ID
    const mockRequest = {
      method: "PUT",
      url: `http://localhost:3000/api/admin/contact-submissions/${mockId}`,
      json: () => Promise.resolve({ status: "resolved" }),
      user: { id: "admin_user_id" }, // Add user for authentication
      authenticatedSupabase: undefined, // Not used in this path
    } as unknown as NextRequest;

    const response = await PUT(mockRequest, {
      params: Promise.resolve({ id: String(mockId) }),
    });
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json).toEqual({
      success: false,
      error: "Invalid ID",
    });
  });

  it("should return 500 for Supabase update error", async () => {
    const mockId = 123;
    const mockRequest = {
      method: "PUT",
      url: `http://localhost:3000/api/admin/contact-submissions/${mockId}`,
      json: () => Promise.resolve({ status: "resolved" }),
      user: { id: "admin_user_id" }, // Add user for authentication
      authenticatedSupabase: {
        from: vi.fn(() => ({
          update: vi.fn(() => ({
            eq: vi.fn(() => ({
              select: vi.fn(() => ({
                maybeSingle: vi.fn(() =>
                  Promise.resolve({
                    data: null,
                    error: { message: "Database error" },
                  }),
                ),
              })),
            })),
          })),
        })),
      },
    } as unknown as NextRequest;

    const response = await PUT(mockRequest, {
      params: Promise.resolve({ id: String(mockId) }),
    });
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json).toEqual({
      success: false,
      error: "Failed to update status",
    });
  });

  it("should return 404 if submission not found or not authorized", async () => {
    const mockId = 123;
    const mockRequest = {
      method: "PUT",
      url: `http://localhost:3000/api/admin/contact-submissions/${mockId}`,
      json: () => Promise.resolve({ status: "resolved" }),
      user: { id: "admin_user_id" }, // Add user for authentication
      authenticatedSupabase: {
        from: vi.fn(() => ({
          update: vi.fn(() => ({
            eq: vi.fn(() => ({
              select: vi.fn(() => ({
                maybeSingle: vi.fn(() =>
                  Promise.resolve({ data: null, error: null }),
                ),
              })),
            })),
          })),
        })),
      },
    } as unknown as NextRequest;

    const response = await PUT(mockRequest, {
      params: Promise.resolve({ id: String(mockId) }),
    });
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json).toEqual({
      success: false,
      error: "Submission not found or not authorized",
    });
  });

  it("should return 400 for invalid status", async () => {
    const mockId = 123;
    const mockRequest = {
      method: "PUT",
      url: `http://localhost:3000/api/admin/contact-submissions/${mockId}`,
      json: () => Promise.resolve({ status: "invalid_status" }), // Invalid status
      user: { id: "admin_user_id" }, // Add user for authentication
      authenticatedSupabase: undefined, // Not used in this path
    } as unknown as NextRequest;

    const response = await PUT(mockRequest, {
      params: Promise.resolve({ id: String(mockId) }),
    });
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json).toEqual({
      success: false,
      error: "Datos de entrada inválidos",
      details: expect.arrayContaining([
        'status: Invalid option: expected one of "new"|"in progress"|"resolved"',
      ]),
    });
  });

  it("should return 401 if user is not authenticated (not admin)", async () => {
    // Mock getAuth to return no user ID
    const { getAuth } = await import("@clerk/nextjs/server");
    vi.mocked(getAuth).mockReturnValueOnce({
      userId: null, // No authenticated user
      getToken: vi.fn(() => Promise.resolve(null)),
    } as any);

    const mockId = 123;
    const mockRequest = {
      method: "PUT",
      url: `http://localhost:3000/api/admin/contact-submissions/${mockId}`,
      json: () => Promise.resolve({ status: "resolved" }),
      user: undefined, // No user for unauthorized test
      authenticatedSupabase: undefined, // No authenticatedSupabase for unauthorized test
    } as unknown as NextRequest;

    const response = await PUT(mockRequest, {
      params: Promise.resolve({ id: String(mockId) }),
    });
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json).toEqual({
      success: false,
      error: "Unauthorized",
    });
  });
});
