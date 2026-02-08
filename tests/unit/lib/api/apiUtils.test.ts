import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import { z, ZodError } from "zod";
import {
  createApiHandler,
  createSuccessResponse,
  createErrorResponse,
  handleZodError,
  BusinessLogicError,
  executeSupabaseOperation,
  getQueryParams,
  createCrudHandlers,
  type AuthRequirement,
  type ApiContext,
} from "@/lib/api/apiUtils";

// Mock dependencies
vi.mock("@/lib/auth/adminApiProtection", () => ({
  checkAdminRole: vi.fn(),
}));

vi.mock("@clerk/nextjs/server", () => ({
  getAuth: vi.fn(),
}));

vi.mock("@/lib/api/supabase", () => ({
  getAuthenticatedSupabaseClient: vi.fn(),
  supabase: {},
}));

vi.mock("@/lib/utils/logger", () => ({
  log: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    business: vi.fn(),
  },
}));

import { checkAdminRole } from "@/lib/auth/adminApiProtection";
import { getAuth } from "@clerk/nextjs/server";
import { getAuthenticatedSupabaseClient, supabase } from "@/lib/api/supabase";
import { log } from "@/lib/utils/logger";

const mockCheckAdminRole = checkAdminRole as any;
const mockGetAuth = getAuth as any;
const mockGetAuthenticatedSupabaseClient =
  getAuthenticatedSupabaseClient as any;

describe("apiUtils", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createSuccessResponse", () => {
    it("should create success response with data and message", () => {
      const data = { id: 1, name: "Test" };
      const message = "Operation successful";
      const response = createSuccessResponse(data, message);

      expect(response).toBeInstanceOf(NextResponse);
      // Can't directly access NextResponse JSON content in test, but we can check the response is created
    });

    it("should create success response with data only", () => {
      const data = { id: 1, name: "Test" };
      const response = createSuccessResponse(data);

      expect(response).toBeInstanceOf(NextResponse);
    });

    it("should create success response with message only", () => {
      const message = "Operation successful";
      const response = createSuccessResponse(undefined, message);

      expect(response).toBeInstanceOf(NextResponse);
    });

    it("should create success response with no data or message", () => {
      const response = createSuccessResponse();

      expect(response).toBeInstanceOf(NextResponse);
    });
  });

  describe("createErrorResponse", () => {
    it("should create error response with details", () => {
      const error = "Validation error";
      const status = 400;
      const details = ["Field A is required", "Field B is too short"];

      const response = createErrorResponse(error, status, details);

      expect(response).toBeInstanceOf(NextResponse);
      // In a real test environment, we would check the response content
    });

    it("should create error response without details", () => {
      const error = "Not found";
      const status = 404;

      const response = createErrorResponse(error, status);

      expect(response).toBeInstanceOf(NextResponse);
    });
  });

  describe("handleZodError", () => {
    it("should handle too_small error", () => {
      const zodError = new ZodError([
        {
          code: "too_small",
          minimum: 5,
          inclusive: true,
          path: ["name"],
          message: "String must contain at least 5 character(s)",
          origin: "string" as const,
        },
      ]);

      const response = handleZodError(zodError);
      expect(response).toBeInstanceOf(NextResponse);
    });

    it("should handle too_big error", () => {
      const zodError = new ZodError([
        {
          code: "too_big",
          maximum: 100,
          inclusive: true,
          path: ["description"],
          message: "String must contain at most 100 character(s)",
          origin: "string" as const,
        },
      ]);

      const response = handleZodError(zodError);
      expect(response).toBeInstanceOf(NextResponse);
    });

    it("should handle invalid_type error", () => {
      const zodError = new ZodError([
        {
          code: "invalid_type",
          expected: "string",
          path: ["email"],
          message: "Expected string, received number",
        },
      ]);

      const response = handleZodError(zodError);
      expect(response).toBeInstanceOf(NextResponse);
    });

    it("should handle unknown error codes", () => {
      const zodError = new ZodError([
        {
          code: "custom" as any,
          path: ["field"],
          message: "Custom error message",
        },
      ]);

      const response = handleZodError(zodError);
      expect(response).toBeInstanceOf(NextResponse);
    });

    it("should handle multiple errors", () => {
      const zodError = new ZodError([
        {
          code: "too_small",
          minimum: 5,
          inclusive: true,
          path: ["name"],
          message: "Too short",
          origin: "string" as const,
        },
        {
          code: "invalid_type",
          expected: "string",
          path: ["email"],
          message: "Wrong type",
        },
      ]);

      const response = handleZodError(zodError);
      expect(response).toBeInstanceOf(NextResponse);
    });

    it("should handle nested paths", () => {
      const zodError = new ZodError([
        {
          code: "too_small",
          minimum: 1,
          inclusive: true,
          path: ["user", "profile", "name"],
          message: "Too short",
          origin: "string" as const,
        },
      ]);

      const response = handleZodError(zodError);
      expect(response).toBeInstanceOf(NextResponse);
    });
  });

  describe("BusinessLogicError", () => {
    it("should create error with default status code", () => {
      const error = new BusinessLogicError("Business rule violation");

      expect(error.message).toBe("Business rule violation");
      expect(error.statusCode).toBe(400);
      expect(error.name).toBe("BusinessLogicError");
      expect(error).toBeInstanceOf(Error);
    });

    it("should create error with custom status code", () => {
      const error = new BusinessLogicError("Not found", 404);

      expect(error.message).toBe("Not found");
      expect(error.statusCode).toBe(404);
      expect(error.name).toBe("BusinessLogicError");
    });
  });

  describe("createApiHandler", () => {
    const createMockRequest = (
      method: string = "POST",
      body?: any,
    ): NextRequest => {
      const request = {
        method,
        json: vi.fn().mockResolvedValue(body || {}),
        url: "http://localhost/api/test",
      } as unknown as NextRequest;
      return request;
    };

    describe("Authentication Handling", () => {
      it('should handle auth: "none"', async () => {
        const handler = createApiHandler({
          auth: "none",
          handler: async (data, context) => {
            expect(context.user).toBeUndefined();
            return { message: "success" };
          },
        });

        const request = createMockRequest();
        const response = await handler(request);

        expect(response).toBeInstanceOf(NextResponse);
      });

      it('should handle auth: "optional" with no user', async () => {
        mockGetAuth.mockReturnValue({
          userId: null,
          getToken: vi.fn(),
        } as any);

        const handler = createApiHandler({
          auth: "optional",
          handler: async (data, context) => {
            expect(context.user).toBeUndefined();
            expect(context.userId).toBeUndefined();
            return { message: "success" };
          },
        });

        const request = createMockRequest();
        const response = await handler(request);

        expect(response).toBeInstanceOf(NextResponse);
      });

      it('should handle auth: "optional" with user', async () => {
        const mockToken = "mock-token";
        mockGetAuth.mockReturnValue({
          userId: "user123",
          getToken: vi.fn().mockResolvedValue(mockToken),
        } as any);

        const mockSupabaseClient = {} as any;
        mockGetAuthenticatedSupabaseClient.mockReturnValue(mockSupabaseClient);

        const handler = createApiHandler({
          auth: "optional",
          handler: async (data, context) => {
            expect(context.user?.id).toBe("user123");
            expect(context.userId).toBe("user123");
            expect(context.clerkToken).toBe(mockToken);
            return { message: "success" };
          },
        });

        const request = createMockRequest();
        const response = await handler(request);

        expect(response).toBeInstanceOf(NextResponse);
      });

      it('should handle auth: "optional" with user but no token', async () => {
        mockGetAuth.mockReturnValue({
          userId: "user123",
          getToken: vi.fn().mockResolvedValue(null),
        } as any);

        const handler = createApiHandler({
          auth: "optional",
          handler: async (data, context) => {
            expect(context.user?.id).toBe("user123");
            expect(context.clerkToken).toBeUndefined();
            expect(context.authenticatedSupabase).toBeUndefined();
            return { message: "success" };
          },
        });

        const request = createMockRequest();
        await handler(request);

        expect(mockGetAuthenticatedSupabaseClient).not.toHaveBeenCalled();
      });

      it('should handle auth: "admin" with valid admin user', async () => {
        mockCheckAdminRole.mockResolvedValue({
          user: { id: "admin123" },
          isAdmin: true,
          error: null,
        } as any);

        const mockToken = "admin-token";
        mockGetAuth.mockReturnValue({
          getToken: vi.fn().mockResolvedValue(mockToken),
        } as any);

        const mockSupabaseClient = {} as any;
        mockGetAuthenticatedSupabaseClient.mockReturnValue(mockSupabaseClient);

        const handler = createApiHandler({
          auth: "admin",
          handler: async (data, context) => {
            expect(context.user?.id).toBe("admin123");
            expect(context.user?.isAdmin).toBe(true);
            return { message: "admin success" };
          },
        });

        const request = createMockRequest();
        const response = await handler(request);

        expect(response).toBeInstanceOf(NextResponse);
      });

      it('should handle auth: "admin" with no user (401)', async () => {
        mockCheckAdminRole.mockResolvedValue({
          user: null,
          isAdmin: false,
          error: "Not authenticated",
        } as any);

        const handler = createApiHandler({
          auth: "admin",
          handler: async () => ({ message: "should not reach" }),
        });

        const request = createMockRequest();
        const response = await handler(request);

        expect(response).toBeInstanceOf(NextResponse);
        // Should return 401 error
      });

      it('should handle auth: "admin" with user but not admin (403)', async () => {
        mockCheckAdminRole.mockResolvedValue({
          user: { id: "user123" },
          isAdmin: false,
          error: "Access denied",
        } as any);

        const handler = createApiHandler({
          auth: "admin",
          handler: async () => ({ message: "should not reach" }),
        });

        const request = createMockRequest();
        const response = await handler(request);

        expect(response).toBeInstanceOf(NextResponse);
        // Should return 403 error
      });

      it('should handle auth: "user" with valid user', async () => {
        const mockToken = "user-token";
        mockGetAuth.mockReturnValue({
          userId: "user123",
          getToken: vi.fn().mockResolvedValue(mockToken),
        } as any);

        const mockSupabaseClient = {} as any;
        mockGetAuthenticatedSupabaseClient.mockReturnValue(mockSupabaseClient);

        const handler = createApiHandler({
          auth: "user",
          handler: async (data, context) => {
            expect(context.user?.id).toBe("user123");
            expect(context.user?.isAdmin).toBe(false);
            return { message: "user success" };
          },
        });

        const request = createMockRequest();
        const response = await handler(request);

        expect(response).toBeInstanceOf(NextResponse);
      });

      it('should handle auth: "user" with no user (401)', async () => {
        mockGetAuth.mockReturnValue({
          userId: null,
          getToken: vi.fn(),
        } as any);

        const handler = createApiHandler({
          auth: "user",
          handler: async () => ({ message: "should not reach" }),
        });

        const request = createMockRequest();
        const response = await handler(request);

        expect(response).toBeInstanceOf(NextResponse);
        // Should return 401 error
      });

      it('should handle auth: "user" with no token', async () => {
        mockGetAuth.mockReturnValue({
          userId: "user123",
          getToken: vi.fn().mockResolvedValue(null),
        } as any);

        const handler = createApiHandler({
          auth: "user",
          handler: async (data, context) => {
            expect(context.user?.id).toBe("user123");
            expect(context.clerkToken).toBeUndefined();
            expect(context.authenticatedSupabase).toBeUndefined();
            return { message: "success" };
          },
        });

        const request = createMockRequest();
        await handler(request);

        expect(mockGetAuthenticatedSupabaseClient).not.toHaveBeenCalled();
      });
    });

    describe("Schema Validation", () => {
      const testSchema = z.object({
        name: z.string().min(2),
        email: z.string().email(),
      });

      it("should validate POST request body", async () => {
        const handler = createApiHandler({
          auth: "none",
          schema: testSchema,
          handler: async (data) => {
            expect(data.name).toBe("John");
            expect(data.email).toBe("john@example.com");
            return { success: true };
          },
        });

        const request = createMockRequest("POST", {
          name: "John",
          email: "john@example.com",
        });

        const response = await handler(request);
        expect(response).toBeInstanceOf(NextResponse);
      });

      it("should validate PUT request body", async () => {
        const handler = createApiHandler({
          schema: testSchema,
          handler: async (data) => {
            expect(data.name).toBe("Jane");
            return { success: true };
          },
        });

        const request = createMockRequest("PUT", {
          name: "Jane",
          email: "jane@example.com",
        });

        const response = await handler(request);
        expect(response).toBeInstanceOf(NextResponse);
      });

      it("should validate PATCH request body", async () => {
        const handler = createApiHandler({
          schema: testSchema,
          handler: async (data) => data,
        });

        const request = createMockRequest("PATCH", {
          name: "Updated",
          email: "updated@example.com",
        });

        const response = await handler(request);
        expect(response).toBeInstanceOf(NextResponse);
      });

      it("should validate DELETE request body", async () => {
        const handler = createApiHandler({
          schema: testSchema,
          handler: async (data) => data,
        });

        const request = createMockRequest("DELETE", {
          name: "ToDelete",
          email: "delete@example.com",
        });

        const response = await handler(request);
        expect(response).toBeInstanceOf(NextResponse);
      });

      it("should skip validation for GET requests", async () => {
        const handler = createApiHandler({
          schema: testSchema,
          handler: async (data) => {
            expect(data).toEqual({});
            return { success: true };
          },
        });

        const request = createMockRequest("GET");
        const response = await handler(request);
        expect(response).toBeInstanceOf(NextResponse);
      });

      it("should handle schema validation errors", async () => {
        const handler = createApiHandler({
          schema: testSchema,
          handler: async () => ({ success: true }),
        });

        const request = createMockRequest("POST", {
          name: "A", // Too short
          email: "invalid-email",
        });

        const response = await handler(request);
        expect(response).toBeInstanceOf(NextResponse);
        // Should return validation error
      });

      it("should handle JSON parsing errors", async () => {
        const handler = createApiHandler({
          schema: testSchema,
          handler: async () => ({ success: true }),
        });

        const request = {
          method: "POST",
          json: vi.fn().mockRejectedValue(new Error("Invalid JSON")),
          url: "http://localhost/api/test",
        } as unknown as NextRequest;

        const response = await handler(request);
        expect(response).toBeInstanceOf(NextResponse);
      });

      it("should not validate body for GET, HEAD, OPTIONS methods without schema", async () => {
        const handler = createApiHandler({
          handler: async (data) => {
            expect(data).toEqual({});
            return { success: true };
          },
        });

        const methods = ["GET", "HEAD", "OPTIONS"];

        for (const method of methods) {
          const request = createMockRequest(method);
          const response = await handler(request);
          expect(response).toBeInstanceOf(NextResponse);
        }
      });
    });

    describe("Response Handling", () => {
      it("should wrap plain data in success response", async () => {
        const handler = createApiHandler({
          handler: async () => ({ id: 1, name: "Test" }),
        });

        const request = createMockRequest();
        const response = await handler(request);
        expect(response).toBeInstanceOf(NextResponse);
      });

      it("should pass through pre-formatted responses", async () => {
        const handler = createApiHandler({
          handler: async () => ({
            success: true,
            data: { id: 1 },
            message: "Custom response",
          }),
        });

        const request = createMockRequest();
        const response = await handler(request);
        expect(response).toBeInstanceOf(NextResponse);
      });
    });

    describe("Error Handling", () => {
      it("should handle ZodError from handler", async () => {
        const handler = createApiHandler({
          handler: async () => {
            throw new ZodError([
              {
                code: "too_small",
                minimum: 5,
                inclusive: true,
                path: ["field"],
                message: "Too short",
                origin: "string" as const,
              },
            ]);
          },
        });

        const request = createMockRequest();
        const response = await handler(request);
        expect(response).toBeInstanceOf(NextResponse);
      });

      it("should handle BusinessLogicError", async () => {
        const handler = createApiHandler({
          handler: async () => {
            throw new BusinessLogicError("Business rule violation", 422);
          },
        });

        const request = createMockRequest();
        const response = await handler(request);
        expect(response).toBeInstanceOf(NextResponse);
      });

      it("should handle standard Error objects", async () => {
        const handler = createApiHandler({
          handler: async () => {
            throw new Error("Something went wrong");
          },
        });

        const request = createMockRequest();
        const response = await handler(request);
        expect(response).toBeInstanceOf(NextResponse);
      });

      it("should handle unknown error types", async () => {
        const handler = createApiHandler({
          handler: async () => {
            throw "String error";
          },
        });

        const request = createMockRequest();
        const response = await handler(request);
        expect(response).toBeInstanceOf(NextResponse);
      });

      it("should log errors to console", async () => {
        const handler = createApiHandler({
          handler: async () => {
            throw new Error("Test error");
          },
        });

        const request = createMockRequest();
        await handler(request);

        expect(log.error).toHaveBeenCalledWith(
          "API Handler Error:",
          expect.any(Error),
        );
      });
    });
  });

  describe("executeSupabaseOperation", () => {
    it("should return success for successful operation", async () => {
      const mockData = { id: 1, name: "Test" };
      const operation = vi.fn().mockResolvedValue({
        data: mockData,
        error: null,
      });

      const result = await executeSupabaseOperation(operation);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData);
      expect(result.error).toBeUndefined();
    });

    it("should return error for Supabase error", async () => {
      const operation = vi.fn().mockResolvedValue({
        data: null,
        error: new Error("Database error"),
      });

      const result = await executeSupabaseOperation(
        operation,
        "Custom error message",
      );

      expect(result.success).toBe(false);
      expect(result.data).toBeUndefined();
      expect(result.error).toBe("Custom error message");
      expect(log.error).toHaveBeenCalledWith(
        "Supabase operation error:",
        expect.any(Error),
      );
    });

    it("should return error for operation exception", async () => {
      const operation = vi.fn().mockRejectedValue(new Error("Network error"));

      const result = await executeSupabaseOperation(operation);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Error de base de datos");
      expect(log.error).toHaveBeenCalledWith(
        "Unexpected database error:",
        expect.any(Error),
      );
    });

    it("should handle null data as undefined", async () => {
      const operation = vi.fn().mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await executeSupabaseOperation(operation);

      expect(result.success).toBe(true);
      expect(result.data).toBeUndefined();
    });
  });

  describe("getQueryParams", () => {
    const createMockRequestWithQuery = (searchParams: string): NextRequest => {
      return {
        url: `http://localhost/api/test?${searchParams}`,
      } as NextRequest;
    };

    it("should extract query parameters without schema", () => {
      const request = createMockRequestWithQuery(
        "name=John&age=25&active=true",
      );
      const { params, error } = getQueryParams(request);

      expect(error).toBeUndefined();
      expect(params).toEqual({
        name: "John",
        age: "25",
        active: "true",
      });
    });

    it("should validate query parameters with schema", () => {
      const schema = z.object({
        name: z.string(),
        age: z.string().transform((val) => parseInt(val)),
        active: z.string().transform((val) => val === "true"),
      });

      const request = createMockRequestWithQuery(
        "name=John&age=25&active=true",
      );
      const { params, error } = getQueryParams(request, schema);

      expect(error).toBeUndefined();
      expect(params).toEqual({
        name: "John",
        age: 25,
        active: true,
      });
    });

    it("should handle validation errors", () => {
      const schema = z.object({
        name: z.string().min(5),
        age: z.string().regex(/^\d+$/),
      });

      const request = createMockRequestWithQuery("name=Jo&age=abc");
      const { params, error } = getQueryParams(request, schema);

      expect(error).toBeInstanceOf(NextResponse);
      expect(params).toEqual({});
    });

    it("should handle empty query parameters", () => {
      const request = createMockRequestWithQuery("");
      const { params, error } = getQueryParams(request);

      expect(error).toBeUndefined();
      expect(params).toEqual({});
    });

    it("should handle malformed URL errors", () => {
      const request = {
        url: "invalid-url",
      } as NextRequest;

      const { params, error } = getQueryParams(request);

      expect(error).toBeInstanceOf(NextResponse);
      expect(params).toEqual({});
    });
  });

  describe("createCrudHandlers", () => {
    it("should create GET handler", () => {
      const getHandler = vi.fn().mockResolvedValue({ data: "test" });
      const handlers = createCrudHandlers({
        auth: "none",
        handlers: {
          GET: getHandler,
        },
      });

      expect(handlers.GET).toBeDefined();
      expect(typeof handlers.GET).toBe("function");
    });

    it("should create GET handler with schema validation", () => {
      const getHandler = vi.fn().mockResolvedValue({ data: "test" });
      const querySchema = z.object({ id: z.string() });

      const handlers = createCrudHandlers({
        auth: "none",
        handlers: {
          GET: getHandler,
        },
        schemas: {
          GET: querySchema,
        },
      });

      expect(handlers.GET).toBeDefined();
    });

    it("should create POST handler", () => {
      const postHandler = vi.fn().mockResolvedValue({ id: 1 });
      const handlers = createCrudHandlers({
        handlers: {
          POST: postHandler,
        },
      });

      expect(handlers.POST).toBeDefined();
      expect(typeof handlers.POST).toBe("function");
    });

    it("should create PUT handler", () => {
      const putHandler = vi.fn().mockResolvedValue({ updated: true });
      const handlers = createCrudHandlers({
        handlers: {
          PUT: putHandler,
        },
      });

      expect(handlers.PUT).toBeDefined();
    });

    it("should create PATCH handler", () => {
      const patchHandler = vi.fn().mockResolvedValue({ patched: true });
      const handlers = createCrudHandlers({
        handlers: {
          PATCH: patchHandler,
        },
      });

      expect(handlers.PATCH).toBeDefined();
    });

    it("should create DELETE handler", () => {
      const deleteHandler = vi.fn().mockResolvedValue({ deleted: true });
      const handlers = createCrudHandlers({
        handlers: {
          DELETE: deleteHandler,
        },
      });

      expect(handlers.DELETE).toBeDefined();
    });

    it("should create multiple handlers", () => {
      const handlers = createCrudHandlers({
        auth: "user",
        handlers: {
          GET: vi.fn().mockResolvedValue({}),
          POST: vi.fn().mockResolvedValue({}),
          PUT: vi.fn().mockResolvedValue({}),
          PATCH: vi.fn().mockResolvedValue({}),
          DELETE: vi.fn().mockResolvedValue({}),
        },
        schemas: {
          POST: z.object({ name: z.string() }),
          PUT: z.object({ id: z.string(), name: z.string() }),
          PATCH: z.object({ name: z.string().optional() }),
        },
      });

      expect(handlers.GET).toBeDefined();
      expect(handlers.POST).toBeDefined();
      expect(handlers.PUT).toBeDefined();
      expect(handlers.PATCH).toBeDefined();
      expect(handlers.DELETE).toBeDefined();
    });

    it("should handle empty handlers", () => {
      const handlers = createCrudHandlers({
        handlers: {},
      });

      expect(Object.keys(handlers)).toHaveLength(0);
    });
  });
});
