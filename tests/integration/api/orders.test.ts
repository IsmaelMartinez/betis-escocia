import { describe, it, expect, beforeEach, vi } from 'vitest';
import { testApiHandler } from 'next-test-api-route-handler';
import * as appHandler from '@/app/api/orders/route';

// Mock Supabase
const mockSupabase = {
  from: vi.fn(() => ({
    insert: vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn()
      }))
    }))
  }))
};

vi.mock('@/lib/supabase', () => ({
  supabase: mockSupabase
}));

describe('/api/orders', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST', () => {
    it('should create order with valid data', async () => {
      const mockInsertResult = {
        data: { 
          id: 1, 
          name: 'Test User', 
          email: 'test@example.com',
          product: 'Camiseta Betis',
          size: 'M',
          quantity: 1,
          created_at: '2024-01-01T00:00:00.000Z'
        },
        error: null
      };

      (mockSupabase.from as any).mockReturnValue({
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve(mockInsertResult))
          }))
        }))
      });

      await testApiHandler({
        appHandler,
        test: async ({ fetch }) => {
          const response = await fetch({
            method: 'POST',
            body: JSON.stringify({
              name: 'Test User',
              email: 'test@example.com',
              phone: '123456789',
              product: 'Camiseta Betis',
              size: 'M',
              quantity: 1
            }),
            headers: {
              'Content-Type': 'application/json'
            }
          });

          const data = await response.json();
          
          expect(response.status).toBe(200);
          expect(data.success).toBe(true);
          expect(data.message).toBe('Pedido creado correctamente');
          expect(data.data.id).toBe(1);
        }
      });
    });

    it('should validate required fields', async () => {
      await testApiHandler({
        appHandler,
        test: async ({ fetch }) => {
          const response = await fetch({
            method: 'POST',
            body: JSON.stringify({
              email: 'test@example.com'
              // Missing required fields
            }),
            headers: {
              'Content-Type': 'application/json'
            }
          });

          const data = await response.json();
          
          expect(response.status).toBe(400);
          expect(data.success).toBe(false);
          expect(data.error).toContain('Required');
        }
      });
    });

    it('should validate email format', async () => {
      await testApiHandler({
        appHandler,
        test: async ({ fetch }) => {
          const response = await fetch({
            method: 'POST',
            body: JSON.stringify({
              name: 'Test User',
              email: 'invalid-email',
              product: 'Camiseta Betis',
              size: 'M',
              quantity: 1
            }),
            headers: {
              'Content-Type': 'application/json'
            }
          });

          const data = await response.json();
          
          expect(response.status).toBe(400);
          expect(data.success).toBe(false);
          expect(data.error).toContain('Invalid email');
        }
      });
    });

    it('should validate quantity is positive', async () => {
      await testApiHandler({
        appHandler,
        test: async ({ fetch }) => {
          const response = await fetch({
            method: 'POST',
            body: JSON.stringify({
              name: 'Test User',
              email: 'test@example.com',
              product: 'Camiseta Betis',
              size: 'M',
              quantity: 0
            }),
            headers: {
              'Content-Type': 'application/json'
            }
          });

          const data = await response.json();
          
          expect(response.status).toBe(400);
          expect(data.success).toBe(false);
          expect(data.error).toContain('Number must be greater than 0');
        }
      });
    });

    it('should handle database errors', async () => {
      (mockSupabase.from as any).mockReturnValue({
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({
              data: null,
              error: { message: 'Database connection failed' }
            }))
          }))
        }))
      });

      await testApiHandler({
        appHandler,
        test: async ({ fetch }) => {
          const response = await fetch({
            method: 'POST',
            body: JSON.stringify({
              name: 'Test User',
              email: 'test@example.com',
              phone: '123456789',
              product: 'Camiseta Betis',
              size: 'M',
              quantity: 1
            }),
            headers: {
              'Content-Type': 'application/json'
            }
          });

          const data = await response.json();
          
          expect(response.status).toBe(500);
          expect(data.success).toBe(false);
          expect(data.error).toContain('Error creating order');
        }
      });
    });

    it('should reject invalid JSON', async () => {
      await testApiHandler({
        appHandler,
        test: async ({ fetch }) => {
          const response = await fetch({
            method: 'POST',
            body: 'invalid json',
            headers: {
              'Content-Type': 'application/json'
            }
          });

          const data = await response.json();
          
          expect(response.status).toBe(400);
          expect(data.success).toBe(false);
          expect(data.error).toContain('Invalid JSON');
        }
      });
    });
  });

  describe('GET', () => {
    it('should return method not allowed for GET requests', async () => {
      await testApiHandler({
        appHandler,
        test: async ({ fetch }) => {
          const response = await fetch({
            method: 'GET'
          });

          expect(response.status).toBe(405);
        }
      });
    });
  });
});