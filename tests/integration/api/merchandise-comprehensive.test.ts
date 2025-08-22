import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { mkdir, writeFile, readFile } from 'fs/promises';
import { join } from 'path';

// Mock fs/promises module
vi.mock('fs/promises', () => ({
  default: {
    mkdir: vi.fn(),
    writeFile: vi.fn(),
    readFile: vi.fn()
  },
  mkdir: vi.fn(),
  writeFile: vi.fn(),
  readFile: vi.fn()
}));

const mockMkdir = vi.mocked(mkdir);
const mockWriteFile = vi.mocked(writeFile);
const mockReadFile = vi.mocked(readFile);

const sampleMerchandiseData = {
  items: [
    {
      id: 'merch_001',
      name: 'Bufanda Peña Bética Escocesa',
      description: 'Bufanda oficial de la peña',
      price: 15.99,
      images: ['/images/merch/bufanda-1.jpg'],
      category: 'accessories',
      sizes: [],
      colors: ['Verde y Blanco'],
      inStock: true,
      featured: true
    },
    {
      id: 'merch_002',
      name: 'Camiseta Peña',
      description: 'Camiseta con el lema oficial',
      price: 22.50,
      images: ['/images/merch/camiseta-1.jpg'],
      category: 'clothing',
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Verde', 'Blanco'],
      inStock: false,
      featured: false
    },
    {
      id: 'merch_003',
      name: 'Llavero Betis-Escocia',
      description: 'Llavero metálico',
      price: 5.99,
      images: ['/images/merch/llavero-1.jpg'],
      category: 'accessories',
      sizes: [],
      colors: ['Metálico'],
      inStock: true,
      featured: true
    }
  ],
  categories: ['accessories', 'clothing'],
  totalItems: 3
};

describe('Merchandise API - Comprehensive Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('GET /api/merchandise', () => {
    beforeEach(() => {
      mockReadFile.mockResolvedValue(JSON.stringify(sampleMerchandiseData));
    });

    it('should return all merchandise items without filters', async () => {
      const { GET } = await import('@/app/api/merchandise/route');
      const request = new NextRequest('http://localhost:3000/api/merchandise');
      
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.items).toHaveLength(3);
      expect(data.categories).toEqual(['accessories', 'clothing']);
      expect(data.totalItems).toBe(3);
    });

    it('should filter by category', async () => {
      const { GET } = await import('@/app/api/merchandise/route');
      const request = new NextRequest('http://localhost:3000/api/merchandise?category=accessories');
      
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.items).toHaveLength(2);
      expect(data.items.every((item: any) => item.category === 'accessories')).toBe(true);
    });

    it('should filter by featured items', async () => {
      const { GET } = await import('@/app/api/merchandise/route');
      const request = new NextRequest('http://localhost:3000/api/merchandise?featured=true');
      
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.items).toHaveLength(2);
      expect(data.items.every((item: any) => item.featured === true)).toBe(true);
    });

    it('should filter by in-stock items', async () => {
      const { GET } = await import('@/app/api/merchandise/route');
      const request = new NextRequest('http://localhost:3000/api/merchandise?inStock=true');
      
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.items).toHaveLength(2);
      expect(data.items.every((item: any) => item.inStock === true)).toBe(true);
    });

    it('should combine multiple filters', async () => {
      const { GET } = await import('@/app/api/merchandise/route');
      const request = new NextRequest('http://localhost:3000/api/merchandise?category=accessories&featured=true&inStock=true');
      
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.items).toHaveLength(1);
      expect(data.items[0].id).toBe('merch_003');
    });

    it('should return empty results for non-existent category', async () => {
      const { GET } = await import('@/app/api/merchandise/route');
      const request = new NextRequest('http://localhost:3000/api/merchandise?category=nonexistent');
      
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.items).toHaveLength(0);
      expect(data.totalItems).toBe(0);
    });

    it('should handle file read errors gracefully', async () => {
      mockReadFile.mockRejectedValue(new Error('File not found'));

      const { GET } = await import('@/app/api/merchandise/route');
      const request = new NextRequest('http://localhost:3000/api/merchandise');
      
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.items).toBeDefined();
      expect(Array.isArray(data.items)).toBe(true);
    });
  });

  describe('POST /api/merchandise', () => {
    beforeEach(() => {
      mockReadFile.mockResolvedValue(JSON.stringify(sampleMerchandiseData));
      mockMkdir.mockResolvedValue(undefined);
      mockWriteFile.mockResolvedValue(undefined);
    });

    it('should create a new merchandise item', async () => {
      const { POST } = await import('@/app/api/merchandise/route');
      
      const newItem = {
        name: 'Nuevo Producto',
        description: 'Descripción del nuevo producto',
        price: 29.99,
        images: ['/images/merch/nuevo-1.jpg'],
        category: 'clothing',
        sizes: ['M', 'L'],
        colors: ['Azul'],
        inStock: true,
        featured: false
      };

      const request = new NextRequest('http://localhost:3000/api/merchandise', {
        method: 'POST',
        body: JSON.stringify(newItem),
        headers: { 'Content-Type': 'application/json' }
      });
      
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Producto añadido correctamente');
      expect(data.data.name).toBe(newItem.name);
      expect(data.data.id).toMatch(/^merch_\d+_/);
      expect(mockWriteFile).toHaveBeenCalled();
    });

    it('should add new category to categories list', async () => {
      const { POST } = await import('@/app/api/merchandise/route');
      
      const newItem = {
        name: 'Producto Deportivo',
        description: 'Descripción',
        price: 19.99,
        images: ['/images/merch/deporte-1.jpg'],
        category: 'sports', // New category
        sizes: [],
        colors: ['Verde'],
        inStock: true,
        featured: true
      };

      const request = new NextRequest('http://localhost:3000/api/merchandise', {
        method: 'POST',
        body: JSON.stringify(newItem),
        headers: { 'Content-Type': 'application/json' }
      });
      
      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(mockWriteFile).toHaveBeenCalled();
      
      // Verify the data written includes new category
      const writtenData = JSON.parse(mockWriteFile.mock.calls[0][1] as string);
      expect(writtenData.categories).toContain('sports');
    });

    it('should validate required fields', async () => {
      const { POST } = await import('@/app/api/merchandise/route');
      
      const invalidItem = {
        name: '', // Empty name should fail
        description: 'Descripción',
        price: -5, // Negative price should fail
        images: [],
        category: 'clothing'
      };

      const request = new NextRequest('http://localhost:3000/api/merchandise', {
        method: 'POST',
        body: JSON.stringify(invalidItem),
        headers: { 'Content-Type': 'application/json' }
      });
      
      const response = await POST(request);

      expect(response.status).toBe(400);
    });

    it('should handle file system errors gracefully', async () => {
      mockWriteFile.mockRejectedValue(new Error('Disk full'));

      const { POST } = await import('@/app/api/merchandise/route');
      
      const newItem = {
        name: 'Test Item',
        description: 'Test description',
        price: 10.99,
        images: ['/test.jpg'],
        category: 'test',
        sizes: [],
        colors: ['Test'],
        inStock: true,
        featured: false
      };

      const request = new NextRequest('http://localhost:3000/api/merchandise', {
        method: 'POST',
        body: JSON.stringify(newItem),
        headers: { 'Content-Type': 'application/json' }
      });
      
      const response = await POST(request);

      expect(response.status).toBe(400);
    });
  });

  describe('PUT /api/merchandise', () => {
    beforeEach(() => {
      mockReadFile.mockResolvedValue(JSON.stringify(sampleMerchandiseData));
      mockWriteFile.mockResolvedValue(undefined);
    });

    it('should update existing merchandise item', async () => {
      const { PUT } = await import('@/app/api/merchandise/route');
      
      const updateData = {
        name: 'Bufanda Actualizada',
        price: 17.99,
        inStock: false
      };

      const request = new NextRequest('http://localhost:3000/api/merchandise?id=merch_001', {
        method: 'PUT',
        body: JSON.stringify(updateData),
        headers: { 'Content-Type': 'application/json' }
      });
      
      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Producto actualizado correctamente');
      expect(data.data.name).toBe('Bufanda Actualizada');
      expect(data.data.price).toBe(17.99);
      expect(data.data.inStock).toBe(false);
      expect(mockWriteFile).toHaveBeenCalled();
    });

    it('should return error for non-existent item', async () => {
      const { PUT } = await import('@/app/api/merchandise/route');
      
      const updateData = { name: 'Updated Name' };

      const request = new NextRequest('http://localhost:3000/api/merchandise?id=nonexistent', {
        method: 'PUT',
        body: JSON.stringify(updateData),
        headers: { 'Content-Type': 'application/json' }
      });
      
      const response = await PUT(request);

      expect(response.status).toBe(400);
    });

    it('should validate update data', async () => {
      const { PUT } = await import('@/app/api/merchandise/route');
      
      const invalidData = { price: -10 }; // Invalid negative price

      const request = new NextRequest('http://localhost:3000/api/merchandise?id=merch_001', {
        method: 'PUT',
        body: JSON.stringify(invalidData),
        headers: { 'Content-Type': 'application/json' }
      });
      
      const response = await PUT(request);

      expect(response.status).toBe(400);
    });

    it('should require item ID parameter', async () => {
      const { PUT } = await import('@/app/api/merchandise/route');
      
      const updateData = { name: 'Updated Name' };

      const request = new NextRequest('http://localhost:3000/api/merchandise', {
        method: 'PUT',
        body: JSON.stringify(updateData),
        headers: { 'Content-Type': 'application/json' }
      });
      
      const response = await PUT(request);

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/merchandise', () => {
    beforeEach(() => {
      mockReadFile.mockResolvedValue(JSON.stringify(sampleMerchandiseData));
      mockWriteFile.mockResolvedValue(undefined);
    });

    it('should delete existing merchandise item', async () => {
      const { DELETE } = await import('@/app/api/merchandise/route');
      
      const request = new NextRequest('http://localhost:3000/api/merchandise?id=merch_001', {
        method: 'DELETE'
      });
      
      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Producto eliminado correctamente');
      expect(mockWriteFile).toHaveBeenCalled();

      // Verify the item was removed
      const writtenData = JSON.parse(mockWriteFile.mock.calls[0][1] as string);
      expect(writtenData.items.find((item: any) => item.id === 'merch_001')).toBeUndefined();
      expect(writtenData.totalItems).toBe(2);
    });

    it('should return error for non-existent item', async () => {
      const { DELETE } = await import('@/app/api/merchandise/route');
      
      const request = new NextRequest('http://localhost:3000/api/merchandise?id=nonexistent', {
        method: 'DELETE'
      });
      
      const response = await DELETE(request);

      expect(response.status).toBe(400);
    });

    it('should require item ID parameter', async () => {
      const { DELETE } = await import('@/app/api/merchandise/route');
      
      const request = new NextRequest('http://localhost:3000/api/merchandise', {
        method: 'DELETE'
      });
      
      const response = await DELETE(request);

      expect(response.status).toBe(400);
    });

    it('should handle file system errors during deletion', async () => {
      mockWriteFile.mockRejectedValue(new Error('Write permission denied'));

      const { DELETE } = await import('@/app/api/merchandise/route');
      
      const request = new NextRequest('http://localhost:3000/api/merchandise?id=merch_001', {
        method: 'DELETE'
      });
      
      const response = await DELETE(request);

      expect(response.status).toBe(400);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle malformed JSON in data file', async () => {
      mockReadFile.mockResolvedValue('invalid json content');

      const { GET } = await import('@/app/api/merchandise/route');
      const request = new NextRequest('http://localhost:3000/api/merchandise');
      
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.items)).toBe(true);
    });

    it('should handle empty data file', async () => {
      mockReadFile.mockResolvedValue('');

      const { GET } = await import('@/app/api/merchandise/route');
      const request = new NextRequest('http://localhost:3000/api/merchandise');
      
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should handle directory creation errors', async () => {
      mockMkdir.mockRejectedValue(new Error('Permission denied'));
      mockReadFile.mockResolvedValue(JSON.stringify(sampleMerchandiseData));
      mockWriteFile.mockResolvedValue(undefined);

      const { POST } = await import('@/app/api/merchandise/route');
      
      const newItem = {
        name: 'Test Item',
        description: 'Test description',
        price: 10.99,
        images: ['/test.jpg'],
        category: 'test',
        sizes: [],
        colors: ['Test'],
        inStock: true,
        featured: false
      };

      const request = new NextRequest('http://localhost:3000/api/merchandise', {
        method: 'POST',
        body: JSON.stringify(newItem),
        headers: { 'Content-Type': 'application/json' }
      });
      
      const response = await POST(request);

      // Should still succeed despite directory creation error
      expect(response.status).toBe(200);
    });
  });

  describe('Data Consistency and Validation', () => {
    beforeEach(() => {
      mockReadFile.mockResolvedValue(JSON.stringify(sampleMerchandiseData));
      mockWriteFile.mockResolvedValue(undefined);
    });

    it('should maintain data consistency after multiple operations', async () => {
      const { POST, PUT, DELETE } = await import('@/app/api/merchandise/route');

      // Create item
      const createRequest = new NextRequest('http://localhost:3000/api/merchandise', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test Item',
          description: 'Test description',
          price: 10.99,
          images: ['/test.jpg'],
          category: 'test',
          sizes: [],
          colors: ['Test'],
          inStock: true,
          featured: false
        }),
        headers: { 'Content-Type': 'application/json' }
      });
      
      const createResponse = await POST(createRequest);
      expect(createResponse.status).toBe(200);

      // Update totalItems count should be maintained
      const writtenData = JSON.parse(mockWriteFile.mock.calls[0][1] as string);
      expect(writtenData.totalItems).toBe(writtenData.items.length);
    });

    it('should validate image URLs format', async () => {
      const { POST } = await import('@/app/api/merchandise/route');
      
      const itemWithInvalidImages = {
        name: 'Test Item',
        description: 'Test description', 
        price: 10.99,
        images: ['not-a-valid-url', 'also-invalid'],
        category: 'test',
        sizes: [],
        colors: ['Test'],
        inStock: true,
        featured: false
      };

      const request = new NextRequest('http://localhost:3000/api/merchandise', {
        method: 'POST',
        body: JSON.stringify(itemWithInvalidImages),
        headers: { 'Content-Type': 'application/json' }
      });
      
      const response = await POST(request);

      expect(response.status).toBe(400);
    });

    it('should validate price ranges', async () => {
      const { POST } = await import('@/app/api/merchandise/route');
      
      const itemWithExcessivePrice = {
        name: 'Expensive Item',
        description: 'Very expensive',
        price: 99999.99, // Should be within reasonable range
        images: ['/test.jpg'],
        category: 'luxury',
        sizes: [],
        colors: ['Gold'],
        inStock: true,
        featured: false
      };

      const request = new NextRequest('http://localhost:3000/api/merchandise', {
        method: 'POST',
        body: JSON.stringify(itemWithExcessivePrice),
        headers: { 'Content-Type': 'application/json' }
      });
      
      const response = await POST(request);

      expect(response.status).toBe(400);
    });
  });
});