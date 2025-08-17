import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/camiseta-voting/status/route';
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

describe('/api/camiseta-voting/status', () => {
  const mockVotingData = {
    voting: {
      active: true,
      totalVotes: 10,
      endDate: "2026-07-31T23:59:59.000Z",
      options: [
        {
          id: "design_1",
          name: "Dinnae seek mair – there's nae mair tae be foun'",
          description: "Lema clásico de la peña en escocés",
          image: "/images/coleccionables/camiseta-1.png",
          votes: 7,
          voters: [
            { name: "User 1", email: "user1@example.com", votedAt: "2025-01-15T10:00:00.000Z" },
            { name: "User 2", email: "user2@example.com", votedAt: "2025-01-15T11:00:00.000Z" }
          ]
        },
        {
          id: "design_2",
          name: "\"No busques más que no hay\"",
          description: "Lema clásico de la peña",
          image: "/images/coleccionables/camiseta-2.png",
          votes: 3,
          voters: [
            { name: "User 3", email: "user3@example.com", votedAt: "2025-01-15T12:00:00.000Z" }
          ]
        }
      ]
    },
    preOrders: {
      active: true,
      totalOrders: 15,
      endDate: "2026-08-15T23:59:59.000Z",
      minimumOrders: 20,
      orders: [
        {
          id: "preorder_123",
          name: "Customer 1",
          email: "customer1@example.com",
          size: "L",
          quantity: 2,
          submittedAt: "2025-01-15T10:00:00.000Z",
          status: "pending"
        }
      ]
    },
    stats: {
      lastUpdated: "2025-01-15T12:00:00.000Z",
      totalInteractions: 25
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET /api/camiseta-voting/status', () => {
    it('should return sanitized voting status', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(mockVotingData));

      const mockRequest = new NextRequest('http://localhost/api/camiseta-voting/status');
      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      
      const responseData = data.data;
      
      // Check voting data (sanitized)
      expect(responseData.voting.active).toBe(true);
      expect(responseData.voting.totalVotes).toBe(10);
      expect(responseData.voting.options).toHaveLength(2);
      
      // Check that voter details are removed for privacy
      expect(responseData.voting.options[0].voters).toBeUndefined();
      expect(responseData.voting.options[0].votes).toBe(7);
      expect(responseData.voting.options[0].percentage).toBe(70); // 7/10 * 100
      
      expect(responseData.voting.options[1].votes).toBe(3);
      expect(responseData.voting.options[1].percentage).toBe(30); // 3/10 * 100
      
      // Check pre-order data (sanitized)
      expect(responseData.preOrders.active).toBe(true);
      expect(responseData.preOrders.totalOrders).toBe(15);
      expect(responseData.preOrders.minimumOrders).toBe(20);
      expect(responseData.preOrders.progressPercentage).toBe(75); // 15/20 * 100
      expect(responseData.preOrders.isGoalReached).toBe(false);
      
      // Check that order details are not exposed
      expect(responseData.preOrders.orders).toBeUndefined();
      
      // Check stats
      expect(responseData.stats.totalInteractions).toBe(25);
      expect(responseData.stats.lastUpdated).toBeDefined();
    });

    it('should return initial data when file does not exist', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);
      vi.mocked(fs.writeFileSync).mockImplementation(() => {});

      const mockRequest = new NextRequest('http://localhost/api/camiseta-voting/status');
      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      
      const responseData = data.data;
      expect(responseData.voting.active).toBe(true);
      expect(responseData.voting.totalVotes).toBe(0);
      expect(responseData.preOrders.totalOrders).toBe(0);
      expect(fs.writeFileSync).toHaveBeenCalled();
    });

    it('should calculate time remaining correctly for active periods', async () => {
      // Mock future dates
      const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
      const mockDataWithFutureDates = {
        ...mockVotingData,
        voting: {
          ...mockVotingData.voting,
          endDate: futureDate.toISOString()
        },
        preOrders: {
          ...mockVotingData.preOrders,
          endDate: futureDate.toISOString()
        }
      };

      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(mockDataWithFutureDates));

      const mockRequest = new NextRequest('http://localhost/api/camiseta-voting/status');
      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      const responseData = data.data;
      
      expect(responseData.voting.timeRemaining).toBeGreaterThan(0);
      expect(responseData.preOrders.timeRemaining).toBeGreaterThan(0);
    });

    it('should mark periods as inactive when end dates have passed', async () => {
      // Mock past dates
      const pastDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
      const mockDataWithPastDates = {
        ...mockVotingData,
        voting: {
          ...mockVotingData.voting,
          active: true, // Still marked as active in data
          endDate: pastDate.toISOString()
        },
        preOrders: {
          ...mockVotingData.preOrders,
          active: true, // Still marked as active in data
          endDate: pastDate.toISOString()
        }
      };

      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(mockDataWithPastDates));

      const mockRequest = new NextRequest('http://localhost/api/camiseta-voting/status');
      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      const responseData = data.data;
      
      // Should be marked as inactive due to past end dates
      expect(responseData.voting.active).toBe(false);
      expect(responseData.preOrders.active).toBe(false);
      expect(responseData.voting.timeRemaining).toBe(0);
      expect(responseData.preOrders.timeRemaining).toBe(0);
    });

    it('should calculate percentage correctly with zero votes', async () => {
      const mockDataWithZeroVotes = {
        ...mockVotingData,
        voting: {
          ...mockVotingData.voting,
          totalVotes: 0,
          options: mockVotingData.voting.options.map(option => ({
            ...option,
            votes: 0,
            voters: []
          }))
        }
      };

      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(mockDataWithZeroVotes));

      const mockRequest = new NextRequest('http://localhost/api/camiseta-voting/status');
      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      const responseData = data.data;
      
      expect(responseData.voting.options[0].percentage).toBe(0);
      expect(responseData.voting.options[1].percentage).toBe(0);
    });

    it('should mark goal as reached when pre-orders meet minimum', async () => {
      const mockDataGoalReached = {
        ...mockVotingData,
        preOrders: {
          ...mockVotingData.preOrders,
          totalOrders: 25, // Exceeds minimum of 20
        }
      };

      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(mockDataGoalReached));

      const mockRequest = new NextRequest('http://localhost/api/camiseta-voting/status');
      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      const responseData = data.data;
      
      expect(responseData.preOrders.isGoalReached).toBe(true);
      expect(responseData.preOrders.progressPercentage).toBe(125); // 25/20 * 100
    });

    it('should handle file system errors gracefully', async () => {
      const error = new Error('Permission denied');
      (error as any).code = 'EACCES';
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockImplementation(() => { throw error; });

      const mockRequest = new NextRequest('http://localhost/api/camiseta-voting/status');
      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Error de permisos al acceder a los datos de votación.');
    });

    it('should handle JSON syntax errors', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue('invalid json {');

      const mockRequest = new NextRequest('http://localhost/api/camiseta-voting/status');
      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Error en el formato de los datos de votación.');
    });
  });
});