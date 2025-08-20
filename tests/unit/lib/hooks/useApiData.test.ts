import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useApiData } from '@/lib/hooks/useApiData';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('useApiData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockClear();
  });

  it('should return loading state initially', () => {
    mockFetch.mockImplementationOnce(() => new Promise(() => {})); // Never resolves
    
    const { result } = renderHook(() => useApiData('/api/test'));

    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('should fetch data successfully', async () => {
    const mockData = { success: true, data: { message: 'Hello World' } };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockData)
    });

    const { result } = renderHook(() => useApiData('/api/test'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBeNull();
    expect(mockFetch).toHaveBeenCalledWith('/api/test');
  });

  it('should handle fetch errors', async () => {
    const mockError = new Error('Network error');
    mockFetch.mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useApiData('/api/test'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe(mockError);
  });

  it('should handle HTTP errors', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found'
    });

    const { result } = renderHook(() => useApiData('/api/test'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('HTTP error! status: 404');
  });

  it('should refetch data when refetch is called', async () => {
    const mockData1 = { success: true, data: { count: 1 } };
    const mockData2 = { success: true, data: { count: 2 } };
    
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData1)
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData2)
      });

    const { result } = renderHook(() => useApiData('/api/test'));

    await waitFor(() => {
      expect(result.current.data).toEqual(mockData1);
    });

    result.current.refetch();

    await waitFor(() => {
      expect(result.current.data).toEqual(mockData2);
    });

    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('should not fetch data when disabled', () => {
    const { result } = renderHook(() => useApiData('/api/test', { enabled: false }));

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('should fetch with custom options', async () => {
    const mockData = { success: true };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockData)
    });

    const customOptions = {
      method: 'POST',
      body: JSON.stringify({ test: true }),
      headers: { 'Content-Type': 'application/json' }
    };

    renderHook(() => useApiData('/api/test', { fetchOptions: customOptions }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/test', customOptions);
    });
  });

  it('should handle JSON parsing errors', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.reject(new Error('Invalid JSON'))
    });

    const { result } = renderHook(() => useApiData('/api/test'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error?.message).toBe('Invalid JSON');
  });

  it('should handle empty responses', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(null)
    });

    const { result } = renderHook(() => useApiData('/api/test'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });
});