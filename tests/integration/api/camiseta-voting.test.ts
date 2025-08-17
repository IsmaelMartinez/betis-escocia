import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/camiseta-voting/route';

// Mock fetch for internal redirects
global.fetch = vi.fn();

describe('/api/camiseta-voting - Legacy Compatibility', () => {
  const mockFetch = vi.mocked(global.fetch);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET /api/camiseta-voting (Legacy)', () => {
    it('should redirect to status endpoint and return data', async () => {
      const mockStatusData = {
        success: true,
        data: {
          voting: {
            active: true,
            totalVotes: 5,
            options: [
              { id: 'design_1', votes: 3, percentage: 60 },
              { id: 'design_2', votes: 2, percentage: 40 }
            ]
          },
          preOrders: {
            active: true,
            totalOrders: 10,
            minimumOrders: 20,
            progressPercentage: 50
          }
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockStatusData),
        clone: function() { return this; },
        status: 200,
        statusText: 'OK'
      } as Response);

      const mockRequest = new NextRequest('http://localhost/api/camiseta-voting');
      const response = await GET(mockRequest);
      const data = await response.json();

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const fetchCall = mockFetch.mock.calls[0];
      const firstArg = fetchCall[0];
      const urlToCheck = typeof firstArg === 'string' ? firstArg : (firstArg as Request).url;
      expect(urlToCheck).toContain('/api/camiseta-voting/status');
      expect(data.success).toBe(true);
      expect(data.data.voting.totalVotes).toBe(5);
    });

    it('should handle status endpoint errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const mockRequest = new NextRequest('http://localhost/api/camiseta-voting');
      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Error al cargar los datos de votación');
    });
  });

  describe('POST /api/camiseta-voting (Legacy)', () => {
    it('should redirect vote action to vote endpoint', async () => {
      const mockVoteResponse = {
        success: true,
        message: 'Voto registrado correctamente',
        data: { totalVotes: 1 }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockVoteResponse),
        clone: function() { return this; },
        status: 200,
        statusText: 'OK'
      } as Response);

      const mockRequest = new NextRequest('http://localhost/api/camiseta-voting', {
        method: 'POST',
        body: JSON.stringify({
          action: 'vote',
          designId: 'design_1',
          voter: {
            name: 'Test User',
            email: 'test@example.com'
          }
        })
      });

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const fetchCall = mockFetch.mock.calls[0];
      const firstArg = fetchCall[0];
      const urlToCheck = typeof firstArg === 'string' ? firstArg : (firstArg as Request).url;
      expect(urlToCheck).toContain('/api/camiseta-voting/vote');
      expect(data.success).toBe(true);
      expect(data.message).toBe('Voto registrado correctamente');
    });

    it('should redirect pre-order action to pre-order endpoint', async () => {
      const mockPreOrderResponse = {
        success: true,
        message: 'Pre-pedido registrado correctamente',
        data: { orderId: 'preorder_123', totalOrders: 1 }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockPreOrderResponse),
        clone: function() { return this; },
        status: 200,
        statusText: 'OK'
      } as Response);

      const mockRequest = new NextRequest('http://localhost/api/camiseta-voting', {
        method: 'POST',
        body: JSON.stringify({
          action: 'preOrder',
          orderData: {
            name: 'Test Customer',
            email: 'customer@example.com',
            size: 'L',
            quantity: 2
          }
        })
      });

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const fetchCall = mockFetch.mock.calls[0];
      const firstArg = fetchCall[0];
      const urlToCheck = typeof firstArg === 'string' ? firstArg : (firstArg as Request).url;
      expect(urlToCheck).toContain('/api/camiseta-voting/pre-order');
      expect(data.success).toBe(true);
      expect(data.data.orderId).toBe('preorder_123');
    });

    it('should handle validation errors for invalid actions', async () => {
      const mockRequest = new NextRequest('http://localhost/api/camiseta-voting', {
        method: 'POST',
        body: JSON.stringify({
          action: 'invalid_action',
          data: {}
        })
      });

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Datos de entrada inválidos');
    });

    it('should handle errors from target endpoints', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({
          success: false,
          error: 'Ya has votado anteriormente'
        }),
        clone: function() { return this; }
      } as Response);

      const mockRequest = new NextRequest('http://localhost/api/camiseta-voting', {
        method: 'POST',
        body: JSON.stringify({
          action: 'vote',
          designId: 'design_1',
          voter: {
            name: 'Test User',
            email: 'test@example.com'
          }
        })
      });

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Ya has votado anteriormente');
    });

    it('should handle network errors during redirection', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const mockRequest = new NextRequest('http://localhost/api/camiseta-voting', {
        method: 'POST',
        body: JSON.stringify({
          action: 'vote',
          designId: 'design_1',
          voter: {
            name: 'Test User',
            email: 'test@example.com'
          }
        })
      });

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Network error');
    });

    it('should handle missing required fields in validation', async () => {
      const mockRequest = new NextRequest('http://localhost/api/camiseta-voting', {
        method: 'POST',
        body: JSON.stringify({
          action: 'vote',
          // Missing designId and voter
        })
      });

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Datos de entrada inválidos');
    });
  });
});