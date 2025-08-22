import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';

// Create a comprehensive mock implementation
const mockFetch = vi.fn();

// Override the global fetch
Object.defineProperty(globalThis, 'fetch', {
  value: mockFetch,
  writable: true,
  configurable: true,
});

// Import after mocking
const { useApiData } = await import('@/lib/hooks/useApiData');

describe.skip('useApiData - Advanced Testing (Features not yet implemented)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useApiData('/api/test'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBeTruthy();
      expect(result.current.data).toBeNull();
    });

    it('should handle 404 responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: vi.fn().mockResolvedValue({ error: 'Not found' })
      } as any);

      const { result } = renderHook(() => useApiData('/api/test'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBeTruthy();
      expect(result.current.data).toBeNull();
    });

    it('should handle 500 server errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: vi.fn().mockResolvedValue({ error: 'Internal server error' })
      } as any);

      const { result } = renderHook(() => useApiData('/api/test'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBeTruthy();
      expect(result.current.data).toBeNull();
    });

    it('should handle malformed JSON responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: vi.fn().mockRejectedValue(new Error('Invalid JSON'))
      } as any);

      const { result } = renderHook(() => useApiData('/api/test'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBeTruthy();
    });
  });

  describe('Retry Logic', () => {
    it('should retry failed requests with exponential backoff', async () => {
      let attemptCount = 0;
      mockFetch.mockImplementation(() => {
        attemptCount++;
        if (attemptCount < 3) {
          return Promise.reject(new Error('Network error'));
        }
        return Promise.resolve({
          ok: true,
          status: 200,
          json: vi.fn().mockResolvedValue({ success: true })
        });
      });

      const { result } = renderHook(() => 
        useApiData('/api/test', { retry: { attempts: 3, delay: 10 } })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      }, { timeout: 5000 });

      expect(attemptCount).toBe(3);
      expect(result.current.data).toEqual({ success: true });
      expect(result.current.error).toBeNull();
    });

    it('should give up after max retry attempts', async () => {
      mockFetch.mockRejectedValue(new Error('Persistent network error'));

      const { result } = renderHook(() => 
        useApiData('/api/test', { retry: { attempts: 2, delay: 10 } })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      }, { timeout: 5000 });

      expect(mockFetch).toHaveBeenCalledTimes(3); // Initial + 2 retries
      expect(result.current.error).toBeTruthy();
      expect(result.current.data).toBeNull();
    });
  });

  describe('Caching and Stale-While-Revalidate', () => {
    it('should serve cached data while revalidating in background', async () => {
      // First request - fresh data
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({ version: 1 })
      } as any);

      const { result: result1 } = renderHook(() => 
        useApiData('/api/cached-test', {})
      );

      await waitFor(() => {
        expect(result1.current.loading).toBe(false);
      });

      expect(result1.current.data).toEqual({ version: 1 });

      // Second request - should serve cached data immediately
      const { result: result2 } = renderHook(() => 
        useApiData('/api/cached-test', {})
      );

      // Should immediately have cached data
      expect(result2.current.loading).toBe(false);
      expect(result2.current.data).toEqual({ version: 1 });
    });

    it('should invalidate cache after expiry time', async () => {
      // Mock timer functions
      vi.useFakeTimers();

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: vi.fn().mockResolvedValue({ version: 1 })
        } as any)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: vi.fn().mockResolvedValue({ version: 2 })
        } as any);

      const { result, rerender } = renderHook(() => 
        useApiData('/api/cached-test-expiry', {})
      );

      await waitFor(() => {
        expect(result.current.data).toEqual({ version: 1 });
      });

      // Fast forward past cache time
      vi.advanceTimersByTime(1100);

      // Re-render to trigger new request
      rerender();

      await waitFor(() => {
        expect(result.current.data).toEqual({ version: 2 });
      });

      expect(mockFetch).toHaveBeenCalledTimes(2);
      vi.useRealTimers();
    });
  });

  describe('Request Cancellation', () => {
    it('should cancel pending requests when component unmounts', async () => {
      const abortSpy = vi.spyOn(AbortController.prototype, 'abort');
      
      mockFetch.mockImplementationOnce(
        () => new Promise(resolve => setTimeout(resolve, 1000))
      );

      const { unmount } = renderHook(() => useApiData('/api/test'));

      // Unmount before request completes
      unmount();

      expect(abortSpy).toHaveBeenCalled();
      abortSpy.mockRestore();
    });

    it('should cancel previous request when URL changes', async () => {
      const abortSpy = vi.spyOn(AbortController.prototype, 'abort');
      
      mockFetch.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 1000))
      );

      const { rerender } = renderHook(
        ({ url }) => useApiData(url),
        { initialProps: { url: '/api/test1' } }
      );

      // Change URL before first request completes
      rerender({ url: '/api/test2' });

      expect(abortSpy).toHaveBeenCalled();
      abortSpy.mockRestore();
    });
  });

  describe('Performance and Memory Management', () => {
    it('should not create memory leaks with repeated requests', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({ data: 'test' })
      } as any);

      const { result, rerender } = renderHook(
        ({ counter }) => useApiData(`/api/test?v=${counter}`),
        { initialProps: { counter: 1 } }
      );

      // Make multiple requests rapidly
      for (let i = 2; i <= 10; i++) {
        rerender({ counter: i });
        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });
      }

      // Should have made 10 requests without memory issues
      expect(mockFetch).toHaveBeenCalledTimes(10);
    });

    it('should handle concurrent requests to same endpoint', async () => {
      let resolveCount = 0;
      mockFetch.mockImplementation(() => {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve({
              ok: true,
              status: 200,
              json: vi.fn().mockResolvedValue({ id: ++resolveCount })
            });
          }, 50);
        });
      });

      // Start multiple hooks for same endpoint
      const hooks = Array(5).fill(0).map(() => 
        renderHook(() => useApiData('/api/concurrent-test'))
      );

      // Wait for all to complete
      await Promise.all(hooks.map(({ result }) =>
        waitFor(() => expect(result.current.loading).toBe(false))
      ));

      // Should have deduped requests (only 1 actual network call)
      expect(mockFetch).toHaveBeenCalledTimes(1);
      
      // All hooks should have the same data
      const allData = hooks.map(({ result }) => result.current.data);
      expect(new Set(allData.map(d => JSON.stringify(d))).size).toBe(1);
    });
  });

  describe('Conditional Fetching', () => {
    it('should support dynamic skipping based on conditions', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({ data: 'test' })
      } as any);

      const { result, rerender } = renderHook(
        ({ shouldSkip }) => useApiData('/api/test', { skip: shouldSkip }),
        { initialProps: { shouldSkip: true } }
      );

      // Should not fetch when skipped
      expect(result.current.loading).toBe(false);
      expect(mockFetch).not.toHaveBeenCalled();

      // Should fetch when skip is removed
      rerender({ shouldSkip: false });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(result.current.data).toEqual({ data: 'test' });
    });
  });

  describe('Data Transformation', () => {
    it('should support custom data transformers', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({ items: [1, 2, 3] })
      } as any);

      const { result } = renderHook(() => 
        useApiData('/api/test', {
          transform: <T>(data: unknown): T => ({ count: (data as any).items.length }) as T
        })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toEqual({ count: 3 });
    });

    it('should handle transformer errors gracefully', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({ items: [1, 2, 3] })
      } as any);

      const { result } = renderHook(() => 
        useApiData('/api/test', {
          transform: () => { throw new Error('Transform error'); }
        })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBeTruthy();
      expect(result.current.data).toBeNull();
    });
  });
});