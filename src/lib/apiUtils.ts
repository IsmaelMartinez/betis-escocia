/**
 * Unified API utilities for consistent request handling, validation, and responses
 * Eliminates repetitive patterns across API routes while maintaining type safety
 */

import { NextRequest, NextResponse } from 'next/server';
import { ZodError, ZodSchema } from 'zod';
import { checkAdminRole } from '@/lib/adminApiProtection';
import { getAuth } from '@clerk/nextjs/server';
import { getAuthenticatedSupabaseClient, supabase, type SupabaseClient } from '@/lib/supabase';

// Authentication types
export type AuthRequirement = 'admin' | 'user' | 'optional' | 'none';

// API context provided to handlers
export interface ApiContext {
  request: NextRequest;
  user?: {
    id: string;
    isAdmin: boolean;
  };
  userId?: string;
  authenticatedSupabase?: SupabaseClient;
  supabase: SupabaseClient; // Authenticated or anonymous Supabase client
}

// API handler configuration
export interface ApiHandlerConfig<TInput = unknown, TOutput = unknown> {
  auth?: AuthRequirement;
  schema?: ZodSchema<TInput>;
  handler: (data: TInput, context: ApiContext) => Promise<TOutput>;
}

// Standardized API response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  details?: string[];
}

/**
 * Create standardized API responses
 */
export function createSuccessResponse<T>(data?: T, message?: string): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ 
    success: true, 
    ...(data !== undefined && { data }),
    ...(message && { message })
  });
}

export function createErrorResponse(
  error: string, 
  status: number, 
  details?: string[]
): NextResponse<ApiResponse> {
  return NextResponse.json({ 
    success: false, 
    error,
    ...(details && { details })
  }, { status });
}

/**
 * Handle Zod validation errors with Spanish user-friendly messages
 */
export function handleZodError(error: ZodError): NextResponse<ApiResponse> {
  const errorMessages = error.issues.map(issue => {
    // Map common Zod error codes to Spanish messages
    const path = issue.path.join('.');
    switch (issue.code) {
      case 'too_small':
        return `${path}: El valor es demasiado corto`;
      case 'too_big':
        return `${path}: El valor es demasiado largo`;
      case 'invalid_type':
        return `${path}: Tipo de dato inválido`;
      default:
        return issue.message;
    }
  });
  
  return createErrorResponse('Datos de entrada inválidos', 400, errorMessages);
}

/**
 * Handle authentication based on requirements
 */
async function handleAuthentication(
  request: NextRequest, 
  authRequirement: AuthRequirement
): Promise<{ context: ApiContext; error?: NextResponse }> {
  const context: ApiContext = {
    request,
    supabase: supabase // Default to anonymous client
  };

  if (authRequirement === 'none') {
    return { context };
  }

  if (authRequirement === 'optional') {
    // Optional auth - include user info if available
    const { userId, getToken } = getAuth(request);
    
    if (userId) {
      const token = await getToken({ template: 'supabase' });
      context.user = { id: userId, isAdmin: false };
      context.userId = userId;
      context.authenticatedSupabase = token ? getAuthenticatedSupabaseClient(token) : undefined;
      context.supabase = token ? getAuthenticatedSupabaseClient(token) : supabase;
    }
    
    return { context };
  }

  if (authRequirement === 'admin') {
    const { user, isAdmin, error } = await checkAdminRole();
    
    if (!isAdmin || !user) {
      return {
        context,
        error: createErrorResponse(
          error || 'Acceso de administrador requerido', 
          !user ? 401 : 403
        )
      };
    }

    // Get authenticated Supabase client for admin
    const { getToken } = getAuth(request);
    const token = await getToken({ template: 'supabase' });
    
    context.user = { id: user.id, isAdmin: true };
    context.userId = user.id;
    context.authenticatedSupabase = token ? getAuthenticatedSupabaseClient(token) : undefined;
    context.supabase = token ? getAuthenticatedSupabaseClient(token) : supabase;
    
    return { context };
  }

  if (authRequirement === 'user') {
    const { userId, getToken } = getAuth(request);
    
    if (!userId) {
      return {
        context,
        error: createErrorResponse('Autenticación requerida', 401)
      };
    }

    // Get authenticated Supabase client for user
    const token = await getToken({ template: 'supabase' });
    
    context.user = { id: userId, isAdmin: false };
    context.userId = userId;
    context.authenticatedSupabase = token ? getAuthenticatedSupabaseClient(token) : undefined;
    context.supabase = token ? getAuthenticatedSupabaseClient(token) : supabase;
    
    return { context };
  }

  return { context };
}

/**
 * Create a standardized API handler with automatic auth, validation, and error handling
 */
export function createApiHandler<TInput = unknown, TOutput = unknown>(
  config: ApiHandlerConfig<TInput, TOutput>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      // Handle authentication
      const { context, error: authError } = await handleAuthentication(
        request, 
        config.auth || 'none'
      );
      
      if (authError) {
        return authError;
      }

      // Parse and validate request body if needed
      let validatedData: TInput;
      
      if (config.schema && (request.method === 'POST' || request.method === 'PUT' || request.method === 'PATCH' || request.method === 'DELETE')) {
        try {
          const body = await request.json();
          validatedData = config.schema.parse(body);
        } catch (error) {
          if (error instanceof ZodError) {
            return handleZodError(error);
          }
          return createErrorResponse('Error al procesar datos de entrada', 400);
        }
      } else {
        validatedData = {} as TInput;
      }

      // Call the actual handler
      const result = await config.handler(validatedData, context);
      
      // Return successful response
      if (result && typeof result === 'object' && 'success' in result) {
        // Handler returned a pre-formatted response
        return NextResponse.json(result);
      } else {
        // Handler returned data, wrap in success response
        return createSuccessResponse(result);
      }

    } catch (error) {
      console.error('API Handler Error:', error);
      
      // Handle specific error types
      if (error instanceof ZodError) {
        return handleZodError(error);
      }
      
      // Generic server error
      return createErrorResponse('Error interno del servidor', 500);
    }
  };
}

/**
 * Create handlers for different HTTP methods with the same configuration
 */
export function createCrudHandlers<TInput = unknown, TOutput = unknown>(config: {
  auth?: AuthRequirement;
  handlers: {
    GET?: (context: ApiContext) => Promise<TOutput>;
    POST?: ApiHandlerConfig<TInput, TOutput>['handler'];
    PUT?: ApiHandlerConfig<TInput, TOutput>['handler'];
    PATCH?: ApiHandlerConfig<TInput, TOutput>['handler'];
    DELETE?: (context: ApiContext) => Promise<TOutput>;
  };
  schemas?: {
    GET?: ZodSchema<unknown>;
    POST?: ZodSchema<TInput>;
    PUT?: ZodSchema<TInput>;
    PATCH?: ZodSchema<TInput>;
    DELETE?: ZodSchema<unknown>;
  };
}) {
  const handlers: Record<string, (request: NextRequest) => Promise<NextResponse>> = {};

  if (config.handlers.GET) {
    handlers.GET = createApiHandler({
      auth: config.auth,
      schema: config.schemas?.GET,
      handler: (validatedData, context) => {
        // For GET requests, pass query params as validated data if schema provided
        if (config.schemas?.GET) {
          const { searchParams } = new URL(context.request.url);
          const params = Object.fromEntries(searchParams.entries());
          config.schemas.GET.parse(params); // Validate params
          // Pass validated params in a way that doesn't modify ApiContext type
          return config.handlers.GET!(context);
        }
        return config.handlers.GET!(context);
      }
    });
  }

  if (config.handlers.POST) {
    handlers.POST = createApiHandler({
      auth: config.auth,
      schema: config.schemas?.POST,
      handler: config.handlers.POST
    });
  }

  if (config.handlers.PUT) {
    handlers.PUT = createApiHandler({
      auth: config.auth,
      schema: config.schemas?.PUT,
      handler: config.handlers.PUT
    });
  }

  if (config.handlers.PATCH) {
    handlers.PATCH = createApiHandler({
      auth: config.auth,
      schema: config.schemas?.PATCH,
      handler: config.handlers.PATCH
    });
  }

  if (config.handlers.DELETE) {
    handlers.DELETE = createApiHandler({
      auth: config.auth,
      schema: config.schemas?.DELETE,
      handler: (validatedData, context) => {
        // For DELETE requests, always pass context only (validation handled separately)
        return config.handlers.DELETE!(context);
      }
    });
  }

  return handlers;
}

/**
 * Database operation utilities with standardized error handling
 */
export async function executeSupabaseOperation<T>(
  operation: () => Promise<{ data: T | null; error: Error | null }>,
  errorMessage: string = 'Error de base de datos'
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const { data, error } = await operation();
    
    if (error) {
      console.error('Supabase operation error:', error);
      return { success: false, error: errorMessage };
    }
    
    return { success: true, data: data || undefined };
  } catch (error) {
    console.error('Unexpected database error:', error);
    return { success: false, error: errorMessage };
  }
}

/**
 * Utility for handling query parameters with validation
 */
export function getQueryParams<T>(
  request: NextRequest, 
  schema?: ZodSchema<T>
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
        error: handleZodError(error)
      };
    }
    
    return {
      params: {} as T,
      error: createErrorResponse('Parámetros de consulta inválidos', 400)
    };
  }
}