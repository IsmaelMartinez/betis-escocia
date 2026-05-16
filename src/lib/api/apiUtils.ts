import { NextRequest, NextResponse } from "next/server";
import { ZodError, ZodSchema } from "zod";
import { log } from "@/lib/utils/logger";

interface ApiContext {
  request: NextRequest;
  params?: Promise<Record<string, string>>;
}

interface ApiHandlerConfig<TInput = unknown, TOutput = unknown> {
  schema?: ZodSchema<TInput>;
  handler: (data: TInput, context: ApiContext) => Promise<TOutput>;
}

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  details?: string[];
}

function createErrorResponse(
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

function handleZodError(error: ZodError): NextResponse<ApiResponse> {
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

export function createApiHandler<TInput = unknown, TOutput = unknown>(
  config: ApiHandlerConfig<TInput, TOutput>,
) {
  return async (
    request: NextRequest,
    routeContext?: { params: Promise<Record<string, string>> },
  ): Promise<NextResponse> => {
    try {
      const context: ApiContext = { request };

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
          } else {
            const body = await request.json();
            validatedData = config.schema.parse(body);
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
      return NextResponse.json({
        success: true,
        ...(result !== undefined && result !== null && { data: result }),
      });
    } catch (error) {
      log.error("API Handler Error:", error);

      if (error instanceof ZodError) {
        return handleZodError(error);
      }
      if (error instanceof Error) {
        return createErrorResponse(error.message, 400);
      }
      return createErrorResponse("Error interno del servidor", 500);
    }
  };
}
