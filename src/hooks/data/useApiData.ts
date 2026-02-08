/**
 * Universal Data Fetching Hook
 *
 * Standardizes loading, error, and data state management across components.
 * Eliminates repetitive fetch patterns while providing flexibility for different use cases.
 */

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { log } from "@/lib/utils/logger";

export interface UseApiDataOptions extends RequestInit {
  // Automatic refetch interval in milliseconds
  refetchInterval?: number;
  // Skip initial fetch (useful for conditional fetching)
  skip?: boolean;
  // Retry configuration
  retry?: {
    attempts: number;
    delay: number;
  };
  // Transform response data
  transform?: <T>(data: unknown) => T;
  // Custom error handler
  onError?: (error: Error) => void;
  // Custom success handler
  onSuccess?: (data: unknown) => void;
}

export interface UseApiDataResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  mutate: (newData: T | null) => void;
}

/**
 * Hook for fetching data from API endpoints with standardized state management
 */
export function useApiData<T = unknown>(
  url: string | null,
  options: UseApiDataOptions = {},
): UseApiDataResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(!options.skip);
  const [error, setError] = useState<string | null>(null);

  const retryCountRef = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const {
    refetchInterval,
    skip = false,
    retry = { attempts: 3, delay: 1000 },
    transform,
    onError,
    onSuccess,
    ...requestOptions
  } = options;

  const fetchData = useCallback(
    async (isRetry = false) => {
      if (!url || skip) return;

      try {
        // Cancel previous request
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }

        // Create new abort controller for this request
        abortControllerRef.current = new AbortController();

        if (!isRetry) {
          setLoading(true);
          setError(null);
        }

        const response = await fetch(url, {
          ...requestOptions,
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          const errorText = await response.text();
          let errorMessage = `Error ${response.status}`;

          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.error || errorData.message || errorMessage;
          } catch {
            // If not JSON, use the text response or default message
            errorMessage = errorText || errorMessage;
          }

          throw new Error(errorMessage);
        }

        const responseData = await response.json();

        // Extract data from standardized API response format
        const extractedData =
          responseData.success !== undefined ? responseData.data : responseData;

        // Transform data if transform function provided
        const finalData = transform
          ? transform<T>(extractedData)
          : extractedData;

        setData(finalData);
        setError(null);
        retryCountRef.current = 0; // Reset retry count on success

        if (onSuccess) {
          onSuccess(finalData);
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return; // Request was cancelled, don't update state
        }

        const errorMessage =
          err instanceof Error ? err.message : "Error desconocido";

        // Retry logic
        if (!isRetry && retryCountRef.current < retry.attempts) {
          retryCountRef.current++;
          setTimeout(() => {
            fetchData(true);
          }, retry.delay * retryCountRef.current); // Exponential backoff
          return;
        }

        setError(errorMessage);
        retryCountRef.current = 0;

        if (onError) {
          onError(err instanceof Error ? err : new Error(errorMessage));
        }

        log.error("API fetch error in useApiData", err as Error, { url });
      } finally {
        setLoading(false);
      }
    },
    [url, skip, retry, transform, onError, onSuccess, requestOptions],
  );

  // Manual refetch function
  const refetch = useCallback(async () => {
    retryCountRef.current = 0; // Reset retry count for manual refetch
    await fetchData(false);
  }, [fetchData]);

  // Optimistic update function
  const mutate = useCallback((newData: T | null) => {
    setData(newData);
  }, []);

  // Initial fetch effect
  useEffect(() => {
    if (!skip && url) {
      fetchData(false);
    }

    return () => {
      // Cancel any pending request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [url, skip, fetchData]);

  // Auto-refetch interval
  useEffect(() => {
    if (refetchInterval && !skip && url) {
      intervalRef.current = setInterval(() => {
        fetchData(false);
      }, refetchInterval);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [refetchInterval, skip, url, fetchData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    data,
    loading,
    error,
    refetch,
    mutate,
  };
}

/**
 * Specialized hook for paginated data fetching
 */
export function usePaginatedApiData<T = unknown>(
  baseUrl: string,
  options: UseApiDataOptions & {
    pageSize?: number;
    initialPage?: number;
  } = {},
) {
  const [currentPage, setCurrentPage] = useState(options.initialPage || 1);
  const { pageSize = 10, ...apiOptions } = options;

  const url = `${baseUrl}?page=${currentPage}&limit=${pageSize}`;

  const result = useApiData<{
    data: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }>(url, apiOptions);

  const nextPage = useCallback(() => {
    if (result.data?.pagination && currentPage < result.data.pagination.pages) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [currentPage, result.data?.pagination]);

  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  }, [currentPage]);

  const goToPage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  return {
    ...result,
    currentPage,
    nextPage,
    prevPage,
    goToPage,
    hasNextPage: result.data?.pagination
      ? currentPage < result.data.pagination.pages
      : false,
    hasPrevPage: currentPage > 1,
  };
}

/**
 * Hook for mutations (POST, PUT, DELETE) with optimistic updates
 */
export function useApiMutation<TData = unknown, TVariables = unknown>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: {
    onSuccess?: (data: TData, variables: TVariables) => void;
    onError?: (error: Error, variables: TVariables) => void;
    onMutate?: (variables: TVariables) => void;
  } = {},
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(
    async (variables: TVariables) => {
      try {
        setLoading(true);
        setError(null);

        if (options.onMutate) {
          options.onMutate(variables);
        }

        const data = await mutationFn(variables);

        if (options.onSuccess) {
          options.onSuccess(data, variables);
        }

        return data;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error en la mutación";
        setError(errorMessage);

        if (options.onError) {
          options.onError(
            err instanceof Error ? err : new Error(errorMessage),
            variables,
          );
        }

        throw err;
      } finally {
        setLoading(false);
      }
    },
    [mutationFn, options],
  );

  return {
    mutate,
    loading,
    error,
  };
}
