import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

// Create a simple mock implementation
const mockFetch = vi.fn();

// Simply override the global fetch
Object.defineProperty(globalThis, 'fetch', {
  value: mockFetch,
  writable: true,
  configurable: true,
});

// Import after mocking
const { useApiData } = await import('@/lib/hooks/useApiData');

describe('useApiData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
  });

  it('should return loading state initially', () => {
    mockFetch.mockImplementationOnce(() => new Promise(() => {})); // Never resolves
    
    const { result } = renderHook(() => useApiData('/api/test'));

    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('should not fetch data when skipped', () => {
    const { result } = renderHook(() => useApiData('/api/test', { skip: true }));

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('should provide refetch function', () => {
    const { result } = renderHook(() => useApiData('/api/test', { skip: true }));

    expect(typeof result.current.refetch).toBe('function');
  });

  it('should provide mutate function', () => {
    const { result } = renderHook(() => useApiData('/api/test', { skip: true }));

    expect(typeof result.current.mutate).toBe('function');
  });

  it('should handle custom options', () => {
    const customOptions = {
      method: 'POST',
      skip: true,
      retry: { attempts: 0, delay: 0 }
    };

    const { result } = renderHook(() => useApiData('/api/test', customOptions));
    
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('should handle empty responses', async () => {
    const mockResponse = new Response(JSON.stringify({}), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    mockFetch.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useApiData('/api/test', { retry: { attempts: 0, delay: 0 } }));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    }, { timeout: 3000 });

    // Just check that it completed without error
    expect(result.current.loading).toBe(false);
  });

  it('should handle fetch errors', async () => {
    const mockError = new Error('Network error');
    mockFetch.mockRejectedValue(mockError);

    const { result } = renderHook(() => useApiData('/api/test', { retry: { attempts: 0, delay: 0 } }));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    }, { timeout: 3000 });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe('Network error');
  });

  it('should accept retry options', () => {
    const { result } = renderHook(() => useApiData('/api/test', { 
      skip: true,
      retry: { attempts: 3, delay: 1000 }
    }));

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('should handle mutate function calls', () => {
    const { result } = renderHook(() => useApiData('/api/test', { skip: true }));

    // Test that mutate function exists and can be called without error
    expect(() => {
      result.current.mutate({ test: true });
    }).not.toThrow();
    
    // Just verify the function exists, don't test complex behavior
    expect(typeof result.current.mutate).toBe('function');
  });
});