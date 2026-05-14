import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';

vi.mock('next/server', () => {
  class MockNextRequest {
    url: string;
    nextUrl: URL;
    method: string;
    headers: Headers;

    constructor(url: string, init?: RequestInit) {
      this.url = url;
      this.nextUrl = new URL(url);
      this.method = init?.method || 'GET';
      this.headers = new Headers(init?.headers);
    }
  }

  return {
    NextRequest: MockNextRequest,
    NextResponse: {
      json: (data: unknown, init?: { status?: number }) => ({
        json: () => Promise.resolve(data),
        status: init?.status || 200,
      }),
    },
  };
});

// unstable_cache wraps a function and returns it; for unit tests we just
// pass the function through so each invocation actually exercises the
// underlying service call (the cache itself is exercised in integration).
vi.mock('next/cache', () => ({
  unstable_cache: (fn: (...args: unknown[]) => unknown) => fn,
}));

import { NextRequest } from 'next/server';

vi.mock('axios');

const standingsResult = {
  table: [
    {
      position: 1,
      team: { id: 90, name: 'Real Betis', crest: 'betis.png' },
      playedGames: 10,
      won: 7,
      draw: 2,
      lost: 1,
      points: 23,
      goalsFor: 20,
      goalsAgainst: 8,
      goalDifference: 12,
    },
    {
      position: 2,
      team: { id: 81, name: 'Barcelona', crest: 'barca.png' },
      playedGames: 10,
      won: 6,
      draw: 3,
      lost: 1,
      points: 21,
      goalsFor: 18,
      goalsAgainst: 6,
      goalDifference: 12,
    },
  ],
};

const getLaLigaStandingsMock = vi.fn(() => Promise.resolve(standingsResult as unknown));

vi.mock('@/services/footballDataService', () => ({
  FootballDataService: class {
    getLaLigaStandings() {
      return getLaLigaStandingsMock();
    }
  },
}));

vi.mock('@/lib/utils/logger', () => ({
  log: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

describe('Standings API', () => {
  const mockAxios = vi.mocked(axios);

  beforeEach(() => {
    getLaLigaStandingsMock.mockReset();
    getLaLigaStandingsMock.mockResolvedValue(standingsResult as never);
    mockAxios.create = vi.fn(() => ({}) as never);
  });

  describe('GET /api/standings', () => {
    it('returns standings from Football-Data via the cache wrapper', async () => {
      const { GET } = await import('@/app/api/standings/route');
      const request = new NextRequest('http://localhost:3000/api/standings');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.standings.table).toHaveLength(2);
      expect(data.data.standings.table[0].team.name).toBe('Real Betis');
      expect(typeof data.data.lastUpdated).toBe('string');
    });

    it('returns 400 when the upstream API returns no standings', async () => {
      getLaLigaStandingsMock.mockResolvedValue(null as never);

      const { GET } = await import('@/app/api/standings/route');
      const request = new NextRequest('http://localhost:3000/api/standings');

      const response = await GET(request);

      expect(response.status).toBe(400);
    });

    it('completes within a reasonable time', async () => {
      const startTime = Date.now();
      const { GET } = await import('@/app/api/standings/route');
      const request = new NextRequest('http://localhost:3000/api/standings');

      await GET(request);

      expect(Date.now() - startTime).toBeLessThan(5000);
    });
  });
});
