import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/camiseta-voting/pre-order/route';
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

describe('/api/camiseta-voting/pre-order', () => {
  const mockVotingData = {
    voting: {
      active: true,
      totalVotes: 0,
      endDate: "2026-07-31T23:59:59.000Z",
      options: []
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

  describe('POST /api/camiseta-voting/pre-order', () => {
    beforeEach(() => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(mockVotingData));
      vi.mocked(fs.writeFileSync).mockImplementation(() => {});
    });

    it('should successfully register a pre-order', async () => {
      const mockRequest = new NextRequest('http://localhost/api/camiseta-voting/pre-order', {
        method: 'POST',
        body: JSON.stringify({
          orderData: {
            name: 'Test Customer',
            email: 'customer@example.com',
            phone: '1234567890',
            size: 'L',
            quantity: 2,
            preferredDesign: 'design_1',
            message: 'Looking forward to it!'
          }
        })
      });

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Pre-pedido registrado correctamente');
      expect(data.data.totalOrders).toBe(1);
      expect(data.data.orderId).toMatch(/^preorder_/);
      expect(fs.writeFileSync).toHaveBeenCalled();
    });

    it('should prevent duplicate pre-orders by the same email', async () => {
      const preOrderDataWithOrder = {
        ...mockVotingData,
        preOrders: {
          ...mockVotingData.preOrders,
          totalOrders: 1,
          orders: [{
            id: 'preorder_123',
            name: 'Existing Customer',
            email: 'customer@example.com',
            size: 'M',
            quantity: 1,
            submittedAt: '2025-01-15T10:00:00.000Z',
            status: 'pending'
          }]
        }
      };

      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(preOrderDataWithOrder));

      const mockRequest = new NextRequest('http://localhost/api/camiseta-voting/pre-order', {
        method: 'POST',
        body: JSON.stringify({
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

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Ya tienes un pre-pedido registrado. Solo se permite un pre-pedido por persona.');
    });

    it('should return error for inactive pre-orders', async () => {
      const inactivePreOrderData = {
        ...mockVotingData,
        preOrders: {
          ...mockVotingData.preOrders,
          active: false
        }
      };

      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(inactivePreOrderData));

      const mockRequest = new NextRequest('http://localhost/api/camiseta-voting/pre-order', {
        method: 'POST',
        body: JSON.stringify({
          orderData: {
            name: 'Test Customer',
            email: 'customer@example.com',
            size: 'L',
            quantity: 1
          }
        })
      });

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Los pre-pedidos no están activos en este momento.');
    });

    it('should return error when pre-order period has ended', async () => {
      const expiredPreOrderData = {
        ...mockVotingData,
        preOrders: {
          ...mockVotingData.preOrders,
          endDate: "2020-01-01T00:00:00.000Z" // Past date
        }
      };

      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(expiredPreOrderData));

      const mockRequest = new NextRequest('http://localhost/api/camiseta-voting/pre-order', {
        method: 'POST',
        body: JSON.stringify({
          orderData: {
            name: 'Test Customer',
            email: 'customer@example.com',
            size: 'L',
            quantity: 1
          }
        })
      });

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('El período de pre-pedidos ha terminado.');
    });

    it('should handle validation errors', async () => {
      const mockRequest = new NextRequest('http://localhost/api/camiseta-voting/pre-order', {
        method: 'POST',
        body: JSON.stringify({
          orderData: {
            name: 'T', // Too short name
            email: 'invalid-email', // Invalid email format
            size: 'INVALID', // Invalid size
            quantity: 0 // Invalid quantity
          }
        })
      });

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Datos de entrada inválidos');
    });

    it('should generate unique order ID and calculate progress', async () => {
      const mockRequest = new NextRequest('http://localhost/api/camiseta-voting/pre-order', {
        method: 'POST',
        body: JSON.stringify({
          orderData: {
            name: 'Test Customer',
            email: 'unique@example.com',
            size: 'S',
            quantity: 1
          }
        })
      });

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.orderId).toMatch(/^preorder_\d+_[a-z0-9]+$/);
      expect(data.data.progressPercentage).toBe(5); // 1/20 * 100
      expect(data.data.minimumOrders).toBe(20);
    });

    it('should handle pre-orders with optional fields', async () => {
      const mockRequest = new NextRequest('http://localhost/api/camiseta-voting/pre-order', {
        method: 'POST',
        body: JSON.stringify({
          orderData: {
            name: 'Minimal Customer',
            email: 'minimal@example.com',
            size: 'M',
            quantity: 1
          }
        })
      });

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should handle file not found error', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);

      const mockRequest = new NextRequest('http://localhost/api/camiseta-voting/pre-order', {
        method: 'POST',
        body: JSON.stringify({
          orderData: {
            name: 'Test Customer',
            email: 'test@example.com',
            size: 'L',
            quantity: 1
          }
        })
      });

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('No se encontraron datos de pre-pedidos. El sistema podría no estar inicializado.');
    });

    it('should handle file system errors', async () => {
      const error = new Error('No space left on device');
      (error as any).code = 'ENOSPC';
      vi.mocked(fs.writeFileSync).mockImplementation(() => { throw error; });

      const mockRequest = new NextRequest('http://localhost/api/camiseta-voting/pre-order', {
        method: 'POST',
        body: JSON.stringify({
          orderData: {
            name: 'Test Customer',
            email: 'test@example.com',
            size: 'L',
            quantity: 1
          }
        })
      });

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Error de espacio de almacenamiento. Contacta al administrador.');
    });
  });
});