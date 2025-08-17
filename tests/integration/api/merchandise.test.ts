import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST, PUT, DELETE } from '@/app/api/merchandise/route';

describe('/api/merchandise', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET /api/merchandise', () => {
    it('should return merchandise items with success response', async () => {
      const request = new NextRequest('http://localhost:3000/api/merchandise');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data).toHaveProperty('items');
      expect(data).toHaveProperty('categories');
      expect(data).toHaveProperty('totalItems');
      expect(Array.isArray(data.items)).toBe(true);
      expect(Array.isArray(data.categories)).toBe(true);
      expect(typeof data.totalItems).toBe('number');
    });

    it('should filter items by category when category parameter is provided', async () => {
      // Test with a category that should exist
      const request = new NextRequest('http://localhost:3000/api/merchandise?category=collectibles');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      
      if (data.items.length > 0) {
        expect(data.items.every((item: any) => item.category === 'collectibles')).toBe(true);
      }
      expect(data.totalItems).toBe(data.items.length);
    });

    it('should filter items by featured status when featured=true', async () => {
      const request = new NextRequest('http://localhost:3000/api/merchandise?featured=true');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      
      if (data.items.length > 0) {
        expect(data.items.every((item: any) => item.featured === true)).toBe(true);
      }
    });

    it('should handle inStock parameter correctly', async () => {
      // Test inStock=false to include all items
      const request = new NextRequest('http://localhost:3000/api/merchandise?inStock=false');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.totalItems).toBe(data.items.length);
    });

    it('should handle category=all parameter', async () => {
      const request = new NextRequest('http://localhost:3000/api/merchandise?category=all');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should validate basic response structure', async () => {
      const request = new NextRequest('http://localhost:3000/api/merchandise');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      
      // Check that each item has required fields if items exist
      if (data.items.length > 0) {
        const firstItem = data.items[0];
        expect(firstItem).toHaveProperty('id');
        expect(firstItem).toHaveProperty('name');
        expect(firstItem).toHaveProperty('description');
        expect(firstItem).toHaveProperty('price');
        expect(firstItem).toHaveProperty('category');
        expect(firstItem).toHaveProperty('inStock');
        expect(firstItem).toHaveProperty('featured');
      }
    });
  });

  describe('POST /api/merchandise', () => {
    it('should validate required fields', async () => {
      const invalidItem = { name: 'Test' }; // Missing required fields

      const request = new NextRequest('http://localhost:3000/api/merchandise', {
        method: 'POST',
        body: JSON.stringify(invalidItem),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Datos de entrada inválidos');
    });

    it('should validate price is greater than zero', async () => {
      const invalidItem = { 
        name: 'Test', 
        description: 'Test description',
        price: -5, // Negative price to bypass required field check
        category: 'clothing'
      };

      const request = new NextRequest('http://localhost:3000/api/merchandise', {
        method: 'POST',
        body: JSON.stringify(invalidItem),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Datos de entrada inválidos');
    });

    it('should validate category', async () => {
      const invalidItem = { 
        name: 'Test',
        description: 'Test description',
        price: 10.99,
        category: 'invalid_category'
      };

      const request = new NextRequest('http://localhost:3000/api/merchandise', {
        method: 'POST',
        body: JSON.stringify(invalidItem),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Datos de entrada inválidos');
    });

    it('should handle malformed request body', async () => {
      const request = new NextRequest('http://localhost:3000/api/merchandise', {
        method: 'POST',
        body: 'invalid json',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Error al procesar datos de entrada');
    });
  });

  describe('PUT /api/merchandise', () => {
    it('should require item ID in query parameters', async () => {
      const updateData = { name: 'Updated Name' };

      const request = new NextRequest('http://localhost:3000/api/merchandise', {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Datos de entrada inválidos');
    });

    it('should return 500 for non-existent item', async () => {
      const updateData = { name: 'Updated Name' };

      const request = new NextRequest('http://localhost:3000/api/merchandise?id=non_existent_id', {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Error interno del servidor');
    });

    it('should handle malformed update data', async () => {
      const request = new NextRequest('http://localhost:3000/api/merchandise?id=coll_001', {
        method: 'PUT',
        body: 'invalid json',
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Error al procesar datos de entrada');
    });
  });

  describe('DELETE /api/merchandise', () => {
    it('should require item ID in query parameters', async () => {
      const request = new NextRequest('http://localhost:3000/api/merchandise', {
        method: 'DELETE',
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Datos de entrada inválidos');
    });

    it('should return 500 for non-existent item', async () => {
      const request = new NextRequest('http://localhost:3000/api/merchandise?id=non_existent_id', {
        method: 'DELETE',
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Error interno del servidor');
    });
  });
});