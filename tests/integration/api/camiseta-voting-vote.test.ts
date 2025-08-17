import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/camiseta-voting/vote/route';
import fs from 'fs';
import path from 'path';

// Mock fs module
vi.mock('fs');

// Mock path module for better control
vi.mock('path', async () => {
  const actual = await vi.importActual('path');
  return {
    ...actual,
    join: vi.fn((...args: string[]) => args.join('/')), 
    dirname: vi.fn((filePath: string) => filePath.split('/').slice(0, -1).join('/'))
  };
});

describe('/api/camiseta-voting/vote', () => {
  const mockVotingData = {
    voting: {
      active: true,
      totalVotes: 0,
      endDate: "2026-07-31T23:59:59.000Z",
      options: [
        {
          id: "design_1",
          name: "Dinnae seek mair – there's nae mair tae be foun'",
          description: "Lema clásico de la peña en escocés",
          image: "/images/coleccionables/camiseta-1.png",
          votes: 0,
          voters: []
        },
        {
          id: "design_2",
          name: "\"No busques más que no hay\"",
          description: "Lema clásico de la peña",
          image: "/images/coleccionables/camiseta-2.png",
          votes: 0,
          voters: []
        }
      ]
    },
    preOrders: {
      active: true,
      totalOrders: 0,
      endDate: "2026-08-15T23:59:59.000Z",
      minimumOrders: 20,
      orders: []
    },
    stats: {
      lastUpdated: "2025-01-15T12:00:00.000Z",
      totalInteractions: 0
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('POST /api/camiseta-voting/vote', () => {
    beforeEach(() => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(mockVotingData));
      vi.mocked(fs.writeFileSync).mockImplementation(() => {});
    });

    it('should successfully register a vote', async () => {
      const mockRequest = new NextRequest('http://localhost/api/camiseta-voting/vote', {
        method: 'POST',
        body: JSON.stringify({
          designId: 'design_1',
          voter: {
            name: 'Test User',
            email: 'test@example.com'
          }
        })
      });

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Voto registrado correctamente');
      expect(data.data.totalVotes).toBe(1);
      expect(fs.writeFileSync).toHaveBeenCalled();
    });

    it('should prevent duplicate voting by the same email', async () => {
      const votingDataWithVote = {
        ...mockVotingData,
        voting: {
          ...mockVotingData.voting,
          totalVotes: 1,
          options: [
            {
              ...mockVotingData.voting.options[0],
              votes: 1,
              voters: [{
                name: 'Test User',
                email: 'test@example.com',
                votedAt: '2025-01-15T10:00:00.000Z'
              }]
            },
            mockVotingData.voting.options[1]
          ]
        }
      };

      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(votingDataWithVote));

      const mockRequest = new NextRequest('http://localhost/api/camiseta-voting/vote', {
        method: 'POST',
        body: JSON.stringify({
          designId: 'design_2',
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
      expect(data.error).toBe('Ya has votado anteriormente. Solo se permite un voto por persona.');
    });

    it('should return error for invalid design ID', async () => {
      const mockRequest = new NextRequest('http://localhost/api/camiseta-voting/vote', {
        method: 'POST',
        body: JSON.stringify({
          designId: 'invalid_design',
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
      expect(data.error).toBe('El diseño seleccionado no existe. Por favor, recarga la página.');
    });

    it('should return error for inactive voting', async () => {
      const inactiveVotingData = {
        ...mockVotingData,
        voting: {
          ...mockVotingData.voting,
          active: false
        }
      };

      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(inactiveVotingData));

      const mockRequest = new NextRequest('http://localhost/api/camiseta-voting/vote', {
        method: 'POST',
        body: JSON.stringify({
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
      expect(data.error).toBe('La votación no está activa en este momento.');
    });

    it('should return error when voting period has ended', async () => {
      const expiredVotingData = {
        ...mockVotingData,
        voting: {
          ...mockVotingData.voting,
          endDate: "2020-01-01T00:00:00.000Z" // Past date
        }
      };

      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(expiredVotingData));

      const mockRequest = new NextRequest('http://localhost/api/camiseta-voting/vote', {
        method: 'POST',
        body: JSON.stringify({
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
      expect(data.error).toBe('El período de votación ha terminado.');
    });

    it('should handle validation errors', async () => {
      const mockRequest = new NextRequest('http://localhost/api/camiseta-voting/vote', {
        method: 'POST',
        body: JSON.stringify({
          designId: '', // Invalid empty design ID
          voter: {
            name: 'T', // Too short name
            email: 'invalid-email' // Invalid email format
          }
        })
      });

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Datos de entrada inválidos');
    });

    it('should handle file not found error', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);

      const mockRequest = new NextRequest('http://localhost/api/camiseta-voting/vote', {
        method: 'POST',
        body: JSON.stringify({
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
      expect(data.error).toBe('No se encontraron datos de votación. La votación podría no estar inicializada.');
    });

    it('should handle file system errors', async () => {
      const error = new Error('Permission denied');
      (error as any).code = 'EACCES';
      vi.mocked(fs.writeFileSync).mockImplementation(() => { throw error; });

      const mockRequest = new NextRequest('http://localhost/api/camiseta-voting/vote', {
        method: 'POST',
        body: JSON.stringify({
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
      expect(data.error).toBe('Error de permisos al acceder a los datos de votación.');
    });
  });
});