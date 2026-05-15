import { NextRequest, NextResponse } from "next/server";
import { ZodError, ZodSchema } from "zod";
import { checkAdminRole } from "@/lib/auth/adminApiProtection";
import { getAuth } from "@clerk/nextjs/server";
import { log } from "@/lib/utils/logger";

export type AuthRequirement = "admin" | "user" | "optional" | "none";

export interface ApiContext {
  request: NextRequest;
  params?: Promise<Record<string, string>>;
  user?: {
    id: string;
    isAdmin: boolean;
  };
  userId?: string;
}

export interface ApiHandlerConfig<TInput = unknown, TOutput = unknown> {
  auth?: AuthRequirement;
  schema?: ZodSchema<TInput>;
  handler: (data: TInput, context: ApiContext) => Promise<TOutput>;
}

export class BusinessLogicError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400,
  ) {
    super(message);
    this.name = "BusinessLogicError";
  }
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  details?: string[];
}

export function createSuccessResponse<T>(
  data?: T,
  message?: string,
): NextResponse<ApiResponse<T>> {
  return NextResponse.json({
    success: true,
    ...(data !== undefined && { data }),
    ...(message && { message }),
  });
}

export function createErrorResponse(
  error: string,
  status: number,
  details?: string[],
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error,
      ...(details && { details }),
    },
    { status },
  );
}

export function handleZodError(error: ZodError): NextResponse<ApiResponse> {
  const errorMessages = error.issues.map((issue) => {
    const path = issue.path.join(".");
    switch (issue.code) {
      case "too_small":
        return `${path}: El valor es demasiado corto`;
      case "too_big":
        return `${path}: El valor es demasiado largo`;
      case "invalid_type":
        return `${path}: Tipo de dato inválido`;
      default:
        return issue.message;
    }
  });

  return createErrorResponse("Datos de entrada inválidos", 400, errorMessages);
}

async function handleAuthentication(
  request: NextRequest,
  authRequirement: AuthRequirement,
): Promise<{ context: ApiContext; error?: NextResponse }> {
  const context: ApiContext = { request };

  if (authRequirement === "none") {
    return { context };
  }

  if (authRequirement === "optional") {
    const { userId } = getAuth(request);
    if (userId) {
      context.user = { id: userId, isAdmin: false };
      context.userId = userId;
    }
    return { context };
  }

  if (authRequirement === "admin") {
    const { user, isAdmin, error } = await checkAdminRole();
    if (!isAdmin || !user) {
      return {
        context,
        error: createErrorResponse(
          error || "Acceso de administrador requerido",
          !user ? 401 : 403,
        ),
      };
    }
    context.user = { id: user.id, isAdmin: true };
    context.userId = user.id;
    return { context };
  }

  if (authRequirement === "user") {
    const { userId } = getAuth(request);
    if (!userId) {
      return {
        context,
        error: createErrorResponse("Autenticación requerida", 401),
      };
    }
    context.user = { id: userId, isAdmin: false };
    context.userId = userId;
    return { context };
  }

  return { context };
}

export function createApiHandler<TInput = unknown, TOutput = unknown>(
  config: ApiHandlerConfig<TInput, TOutput>,
) {
  return async (
    request: NextRequest,
    routeContext?: { params: Promise<Record<string, string>> },
  ): Promise<NextResponse> => {
    try {
      const { context, error: authError } = await handleAuthentication(
        request,
        config.auth || "none",
      );

      if (authError) {
        return authError;
      }

      if (routeContext && routeContext.params) {
        context.params = routeContext.params;
      }

      let validatedData: TInput;

      if (config.schema) {
        try {
          if (request.method === "GET") {
            const url = new URL(request.url);
            const queryParams = Object.fromEntries(url.searchParams.entries());
            validatedData = config.schema.parse(queryParams);
          } else if (
            request.method === "POST" ||
            request.method === "PUT" ||
            request.method === "PATCH" ||
            request.method === "DELETE"
          ) {
            const body = await request.json();
            validatedData = config.schema.parse(body);
          } else {
            validatedData = {} as TInput;
          }
        } catch (error) {
          if (error instanceof ZodError) {
            return handleZodError(error);
          }
          return createErrorResponse("Error al procesar datos de entrada", 400);
        }
      } else {
        validatedData = {} as TInput;
      }

      const result = await config.handler(validatedData, context);

      if (result && typeof result === "object" && "success" in result) {
        return NextResponse.json(result);
      }
      return createSuccessResponse(result);
    } catch (error) {
      log.error("API Handler Error:", error);

      if (error instanceof ZodError) {
        return handleZodError(error);
      }
      if (error instanceof BusinessLogicError) {
        return createErrorResponse(error.message, error.statusCode);
      }
      if (error instanceof Error) {
        return createErrorResponse(error.message, 400);
      }
      return createErrorResponse("Error interno del servidor", 500);
    }
  };
}

export function getQueryParams<T>(
  request: NextRequest,
  schema?: ZodSchema<T>,
): { params: T; error?: NextResponse } {
  try {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());

    if (schema) {
      const validatedParams = schema.parse(params);
      return { params: validatedParams };
    }

    return { params: params as T };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        params: {} as T,
        error: handleZodError(error),
      };
    }
    return {
      params: {} as T,
      error: createErrorResponse("Parámetros de consulta inválidos", 400),
    };
  }
}
