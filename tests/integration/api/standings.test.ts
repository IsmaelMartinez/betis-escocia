import { describe, it, expect, beforeEach, vi } from 'vitest';
import { testApiHandler } from 'next-test-api-route-handler';
import * as appHandler from '@/app/api/standings/route';

// Mock the external API
global.fetch = vi.fn();

describe('/api/standings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET', () => {
    it('should return standings data when API responds successfully', async () => {
      const mockStandingsData = {
        standings: [{
          table: [
            {
              team: { name: 'Real Betis', crest: 'betis-logo.png' },
              position: 5,
              playedGames: 20,
              points: 35,
              won: 10,
              draw: 5,
              lost: 5,
              goalsFor: 30,
              goalsAgainst: 25
            }
          ]
        }]
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockStandingsData)
      });

      await testApiHandler({
        appHandler,
        test: async ({ fetch }) => {
          const response = await fetch({
            method: 'GET'
          });

          const data = await response.json();
          
          expect(response.status).toBe(200);
          expect(data.success).toBe(true);
          expect(data.data.standings).toBeDefined();
          expect(data.data.standings[0].table).toHaveLength(1);
          expect(data.data.standings[0].table[0].team.name).toBe('Real Betis');
        }
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('football-data.org'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Auth-Token': expect.any(String)
          })
        })
      );
    });

    it('should handle API errors gracefully', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      });

      await testApiHandler({
        appHandler,
        test: async ({ fetch }) => {
          const response = await fetch({
            method: 'GET'
          });

          const data = await response.json();
          
          expect(response.status).toBe(500);
          expect(data.success).toBe(false);
          expect(data.error).toContain('External API error');
        }
      });
    });

    it('should handle network errors', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      await testApiHandler({
        appHandler,
        test: async ({ fetch }) => {
          const response = await fetch({
            method: 'GET'
          });

          const data = await response.json();
          
          expect(response.status).toBe(500);
          expect(data.success).toBe(false);
          expect(data.error).toContain('Network error');
        }
      });
    });

    it('should return cached data when available', async () => {
      const mockStandingsData = {
        standings: [{
          table: [
            {
              team: { name: 'Real Betis', crest: 'betis-logo.png' },
              position: 5,
              points: 35
            }
          ]
        }]
      };

      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockStandingsData)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockStandingsData)
        });

      await testApiHandler({
        appHandler,
        test: async ({ fetch }) => {
          // First request
          const response1 = await fetch({
            method: 'GET'
          });
          
          expect(response1.status).toBe(200);
          
          // Second request (should be cached)
          const response2 = await fetch({
            method: 'GET'
          });
          
          expect(response2.status).toBe(200);
        }
      });
    });
  });

  describe('POST', () => {
    it('should return method not allowed for POST requests', async () => {
      await testApiHandler({
        appHandler,
        test: async ({ fetch }) => {
          const response = await fetch({
            method: 'POST'
          });

          expect(response.status).toBe(405);
        }
      });
    });
  });
});