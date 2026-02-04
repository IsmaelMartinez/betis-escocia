import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act } from '@testing-library/react';
import BackgroundMatchSync from '@/components/BackgroundMatchSync';

// Mock logger
vi.mock('@/lib/logger', () => ({
  log: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  }
}));

describe('BackgroundMatchSync', () => {
  let mockFetch: ReturnType<typeof vi.fn>;
  let originalSessionStorage: Storage;

  beforeEach(() => {
    vi.useFakeTimers();

    // Mock fetch
    mockFetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, summary: { updated: 0, checked: 0 } })
      })
    );
    global.fetch = mockFetch;

    // Mock sessionStorage
    originalSessionStorage = window.sessionStorage;
    const store: Record<string, string> = {};
    Object.defineProperty(window, 'sessionStorage', {
      writable: true,
      value: {
        getItem: vi.fn((key: string) => store[key] || null),
        setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
        removeItem: vi.fn((key: string) => { delete store[key]; }),
        clear: vi.fn(() => { Object.keys(store).forEach(k => delete store[k]); }),
        length: 0,
        key: vi.fn()
      }
    });

    // Clear cookies
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: ''
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    Object.defineProperty(window, 'sessionStorage', {
      writable: true,
      value: originalSessionStorage
    });
  });

  it('renders nothing visible', () => {
    const { container } = render(<BackgroundMatchSync />);
    expect(container.firstChild).toBeNull();
  });

  it('triggers sync after 2 second delay on first visit', async () => {
    render(<BackgroundMatchSync />);

    // Sync should not have been called yet
    expect(mockFetch).not.toHaveBeenCalled();

    // Advance past the 2 second delay
    await act(async () => {
      vi.advanceTimersByTime(2000);
    });

    // Allow the async fetch to resolve
    await act(async () => {
      await Promise.resolve();
    });

    expect(mockFetch).toHaveBeenCalledWith('/api/sync-outdated-matches', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
  });

  it('does not trigger sync if sessionStorage flag is already set', async () => {
    (window.sessionStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue('true');

    render(<BackgroundMatchSync />);

    await act(async () => {
      vi.advanceTimersByTime(3000);
    });

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('does not trigger sync if cookie indicates recent sync', async () => {
    const recentTimestamp = Date.now() - 30 * 60 * 1000; // 30 minutes ago
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: `last-match-sync=${recentTimestamp}`
    });

    render(<BackgroundMatchSync />);

    await act(async () => {
      vi.advanceTimersByTime(3000);
    });

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('triggers sync if cookie indicates old sync', async () => {
    const oldTimestamp = Date.now() - 2 * 60 * 60 * 1000; // 2 hours ago
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: `last-match-sync=${oldTimestamp}`
    });

    render(<BackgroundMatchSync />);

    await act(async () => {
      vi.advanceTimersByTime(2000);
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(mockFetch).toHaveBeenCalled();
  });

  it('handles fetch errors silently', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    render(<BackgroundMatchSync />);

    await act(async () => {
      vi.advanceTimersByTime(2000);
    });

    await act(async () => {
      await Promise.resolve();
    });

    // Component should not throw
    expect(mockFetch).toHaveBeenCalled();
  });

  it('sets sessionStorage flag after triggering sync', async () => {
    render(<BackgroundMatchSync />);

    await act(async () => {
      vi.advanceTimersByTime(2000);
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(window.sessionStorage.setItem).toHaveBeenCalledWith('match-sync-triggered', 'true');
  });

  it('cleans up timeout on unmount', () => {
    const { unmount } = render(<BackgroundMatchSync />);

    // Unmount before timeout fires
    unmount();

    // Advance past delay — fetch should not be called
    vi.advanceTimersByTime(3000);
    expect(mockFetch).not.toHaveBeenCalled();
  });
});
