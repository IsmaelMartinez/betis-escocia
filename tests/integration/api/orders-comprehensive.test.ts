import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock fs/promises module
const mockReadFile = vi.fn();
const mockWriteFile = vi.fn();
const mockMkdir = vi.fn();
const mockAccess = vi.fn();

vi.mock('fs/promises', () => ({
  readFile: mockReadFile,
  writeFile: mockWriteFile,
  mkdir: mockMkdir,
  access: mockAccess
}));

vi.mock('path', async (importOriginal) => {
  const actual = await importOriginal<typeof import('path')>();
  return {
    ...actual,
    join: vi.fn(() => '/test/path/orders.json'),
    dirname: vi.fn(() => '/test/path')
  };
});

const sampleOrder = {
  id: '1234567890',
  productId: 'merch_001',
  productName: 'Camiseta Oficial',
  price: 25.99,
  quantity: 2,
  totalPrice: 51.98,
  customerInfo: {
    name: 'Juan Pérez',
    email: 'juan@example.com',
    phone: '+34123456789',
    contactMethod: 'email' as const
  },
  orderDetails: {
    size: 'L',
    message: 'Para el partido del domingo'
  },
  isPreOrder: false,
  status: 'pending' as const,
  timestamp: '2024-12-15T10:30:00.000Z',
  fulfillmentDate: '2024-12-20T10:00:00.000Z'
};

const sampleOrders = [
  sampleOrder,
  {
    ...sampleOrder,
    id: '1234567891',
    productId: 'merch_002',
    productName: 'Bufanda Oficial',
    status: 'confirmed' as const,
    timestamp: '2024-12-14T15:20:00.000Z'
  },
  {
    ...sampleOrder,
    id: '1234567892',
    productId: 'merch_003', 
    productName: 'Llavero',
    status: 'fulfilled' as const,
    isPreOrder: true,
    timestamp: '2024-12-13T09:15:00.000Z'
  }
];

describe('Orders API - Comprehensive Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Setup default successful mocks
    mockAccess.mockResolvedValue(undefined);
    mockReadFile.mockResolvedValue(JSON.stringify(sampleOrders));
    mockWriteFile.mockResolvedValue(undefined);
    mockMkdir.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('GET /api/orders', () => {
    it('should return all orders without filters', async () => {
      const { GET } = await import('@/app/api/orders/route');
      const request = new NextRequest('http://localhost:3000/api/orders');
      
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(3);
      expect(mockReadFile).toHaveBeenCalledOnce();
    });

    it('should handle empty orders file', async () => {
      mockReadFile.mockResolvedValue('[]');

      const { GET } = await import('@/app/api/orders/route');
      const request = new NextRequest('http://localhost:3000/api/orders');
      
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toHaveLength(0);
    });

    it('should handle file not found error', async () => {
      mockAccess.mockRejectedValue(new Error('File not found'));
      
      const { GET } = await import('@/app/api/orders/route');
      const request = new NextRequest('http://localhost:3000/api/orders');
      
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toHaveLength(0);
    });

    it('should filter orders by productId', async () => {
      const { GET } = await import('@/app/api/orders/route');
      const request = new NextRequest('http://localhost:3000/api/orders?productId=merch_001');
      
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toHaveLength(1);
      expect(data.data[0].productId).toBe('merch_001');
    });

    it('should filter orders by status', async () => {
      const { GET } = await import('@/app/api/orders/route');
      const request = new NextRequest('http://localhost:3000/api/orders?status=confirmed');
      
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toHaveLength(1);
      expect(data.data[0].status).toBe('confirmed');
    });

    it('should combine multiple filters', async () => {
      const { GET } = await import('@/app/api/orders/route');
      const request = new NextRequest('http://localhost:3000/api/orders?productId=merch_003&status=fulfilled');
      
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toHaveLength(1);
      expect(data.data[0].productId).toBe('merch_003');
      expect(data.data[0].status).toBe('fulfilled');
    });

    it('should return orders sorted by timestamp (newest first)', async () => {
      const { GET } = await import('@/app/api/orders/route');
      const request = new NextRequest('http://localhost:3000/api/orders');
      
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data[0].timestamp).toBe('2024-12-15T10:30:00.000Z'); // Newest
      expect(data.data[2].timestamp).toBe('2024-12-13T09:15:00.000Z'); // Oldest
    });

    it('should validate invalid query parameters', async () => {
      const { GET } = await import('@/app/api/orders/route');
      const request = new NextRequest('http://localhost:3000/api/orders?status=invalid_status');
      
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should handle malformed JSON in orders file', async () => {
      mockReadFile.mockResolvedValue('invalid json');

      const { GET } = await import('@/app/api/orders/route');
      const request = new NextRequest('http://localhost:3000/api/orders');
      
      const response = await GET(request);

      expect(response.status).toBe(500);
    });
  });

  describe('POST /api/orders', () => {
    const validOrderData = {
      productId: 'merch_004',
      productName: 'Nueva Camiseta',
      price: 30.00,
      quantity: 1,
      totalPrice: 30.00,
      customerInfo: {
        name: 'María González',
        email: 'maria@example.com',
        phone: '+34987654321',
        contactMethod: 'whatsapp' as const
      },
      orderDetails: {
        size: 'M',
        message: 'Urgente por favor'
      },
      isPreOrder: false,
      timestamp: '2024-12-16T12:00:00.000Z'
    };

    it('should create new order successfully', async () => {
      const { POST } = await import('@/app/api/orders/route');
      const request = new NextRequest('http://localhost:3000/api/orders', {
        method: 'POST',
        body: JSON.stringify(validOrderData),
        headers: { 'Content-Type': 'application/json' }
      });
      
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Pedido creado exitosamente');
      expect(data.data.productId).toBe('merch_004');
      expect(data.data.status).toBe('pending');
      expect(mockWriteFile).toHaveBeenCalledOnce();
    });

    it('should validate required fields', async () => {
      const invalidData = {
        productId: '', // Invalid empty productId
        productName: 'Test Product',
        price: 0, // Invalid price
        quantity: 0, // Invalid quantity
        totalPrice: -10 // Invalid negative price
      };

      const { POST } = await import('@/app/api/orders/route');
      const request = new NextRequest('http://localhost:3000/api/orders', {
        method: 'POST',
        body: JSON.stringify(invalidData),
        headers: { 'Content-Type': 'application/json' }
      });
      
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('validation');
    });

    it('should validate customer info', async () => {
      const invalidCustomerData = {
        ...validOrderData,
        customerInfo: {
          name: '', // Invalid empty name
          email: 'invalid-email', // Invalid email format
          contactMethod: 'invalid' // Invalid contact method
        }
      };

      const { POST } = await import('@/app/api/orders/route');
      const request = new NextRequest('http://localhost:3000/api/orders', {
        method: 'POST',
        body: JSON.stringify(invalidCustomerData),
        headers: { 'Content-Type': 'application/json' }
      });
      
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should handle optional fields properly', async () => {
      const minimalOrderData = {
        productId: 'merch_005',
        productName: 'Minimal Product',
        price: 15.99,
        quantity: 1,
        totalPrice: 15.99,
        customerInfo: {
          name: 'Test User',
          email: 'test@example.com',
          contactMethod: 'email' as const
        },
        isPreOrder: true
        // No phone, orderDetails, or timestamp
      };

      const { POST } = await import('@/app/api/orders/route');
      const request = new NextRequest('http://localhost:3000/api/orders', {
        method: 'POST',
        body: JSON.stringify(minimalOrderData),
        headers: { 'Content-Type': 'application/json' }
      });
      
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.customerInfo.phone).toBe('');
      expect(data.data.orderDetails.size).toBe('');
      expect(data.data.orderDetails.message).toBe('');
      expect(data.data.timestamp).toBeDefined();
    });

    it('should generate unique order ID', async () => {
      vi.spyOn(Date, 'now').mockReturnValue(1234567890123);

      const { POST } = await import('@/app/api/orders/route');
      const request = new NextRequest('http://localhost:3000/api/orders', {
        method: 'POST',
        body: JSON.stringify(validOrderData),
        headers: { 'Content-Type': 'application/json' }
      });
      
      const response = await POST(request);
      const data = await response.json();

      expect(data.data.id).toBe('1234567890123');
      
      Date.now.mockRestore();
    });

    it('should handle file write errors', async () => {
      mockWriteFile.mockRejectedValue(new Error('Write permission denied'));

      const { POST } = await import('@/app/api/orders/route');
      const request = new NextRequest('http://localhost:3000/api/orders', {
        method: 'POST',
        body: JSON.stringify(validOrderData),
        headers: { 'Content-Type': 'application/json' }
      });
      
      const response = await POST(request);

      expect(response.status).toBe(500);
    });

    it('should handle directory creation failure gracefully', async () => {
      mockMkdir.mockRejectedValue(new Error('Cannot create directory'));

      const { POST } = await import('@/app/api/orders/route');
      const request = new NextRequest('http://localhost:3000/api/orders', {
        method: 'POST',
        body: JSON.stringify(validOrderData),
        headers: { 'Content-Type': 'application/json' }
      });
      
      const response = await POST(request);

      expect(response.status).toBe(500);
    });
  });

  describe('PUT /api/orders', () => {
    const updateData = {
      status: 'confirmed' as const,
      fulfillmentDate: '2024-12-25T10:00:00.000Z'
    };

    it('should update existing order successfully', async () => {
      const { PUT } = await import('@/app/api/orders/route');
      const request = new NextRequest('http://localhost:3000/api/orders?id=1234567890', {
        method: 'PUT',
        body: JSON.stringify(updateData),
        headers: { 'Content-Type': 'application/json' }
      });
      
      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Pedido actualizado exitosamente');
      expect(data.data.status).toBe('confirmed');
      expect(data.data.fulfillmentDate).toBe('2024-12-25T10:00:00.000Z');
      expect(mockWriteFile).toHaveBeenCalledOnce();
    });

    it('should handle order not found', async () => {
      const { PUT } = await import('@/app/api/orders/route');
      const request = new NextRequest('http://localhost:3000/api/orders?id=nonexistent', {
        method: 'PUT',
        body: JSON.stringify(updateData),
        headers: { 'Content-Type': 'application/json' }
      });
      
      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('no encontrado');
    });

    it('should require order ID parameter', async () => {
      const { PUT } = await import('@/app/api/orders/route');
      const request = new NextRequest('http://localhost:3000/api/orders', { // Missing ID
        method: 'PUT',
        body: JSON.stringify(updateData),
        headers: { 'Content-Type': 'application/json' }
      });
      
      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should validate update data schema', async () => {
      const invalidUpdateData = {
        status: 'invalid_status',
        fulfillmentDate: 'invalid_date'
      };

      const { PUT } = await import('@/app/api/orders/route');
      const request = new NextRequest('http://localhost:3000/api/orders?id=1234567890', {
        method: 'PUT',
        body: JSON.stringify(invalidUpdateData),
        headers: { 'Content-Type': 'application/json' }
      });
      
      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should only update specified fields', async () => {
      const partialUpdateData = {
        status: 'fulfilled' as const
        // No fulfillmentDate
      };

      const { PUT } = await import('@/app/api/orders/route');
      const request = new NextRequest('http://localhost:3000/api/orders?id=1234567890', {
        method: 'PUT',
        body: JSON.stringify(partialUpdateData),
        headers: { 'Content-Type': 'application/json' }
      });
      
      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.status).toBe('fulfilled');
      expect(data.data.fulfillmentDate).toBe('2024-12-20T10:00:00.000Z'); // Original value preserved
    });

    it('should handle file write errors during update', async () => {
      mockWriteFile.mockRejectedValue(new Error('Write failed'));

      const { PUT } = await import('@/app/api/orders/route');
      const request = new NextRequest('http://localhost:3000/api/orders?id=1234567890', {
        method: 'PUT',
        body: JSON.stringify(updateData),
        headers: { 'Content-Type': 'application/json' }
      });
      
      const response = await PUT(request);

      expect(response.status).toBe(500);
    });
  });

  describe('DELETE /api/orders', () => {
    it('should delete existing order successfully', async () => {
      const { DELETE } = await import('@/app/api/orders/route');
      const request = new NextRequest('http://localhost:3000/api/orders?id=1234567890', {
        method: 'DELETE'
      });
      
      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Pedido eliminado correctamente');
      expect(mockWriteFile).toHaveBeenCalledOnce();
    });

    it('should handle order not found for deletion', async () => {
      const { DELETE } = await import('@/app/api/orders/route');
      const request = new NextRequest('http://localhost:3000/api/orders?id=nonexistent', {
        method: 'DELETE'
      });
      
      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('no encontrado');
    });

    it('should require order ID parameter for deletion', async () => {
      const { DELETE } = await import('@/app/api/orders/route');
      const request = new NextRequest('http://localhost:3000/api/orders', { // Missing ID
        method: 'DELETE'
      });
      
      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should handle file write errors during deletion', async () => {
      mockWriteFile.mockRejectedValue(new Error('Write failed'));

      const { DELETE } = await import('@/app/api/orders/route');
      const request = new NextRequest('http://localhost:3000/api/orders?id=1234567890', {
        method: 'DELETE'
      });
      
      const response = await DELETE(request);

      expect(response.status).toBe(500);
    });
  });

  describe('Edge Cases and Integration Scenarios', () => {
    it('should handle concurrent order creation', async () => {
      // Simulate multiple simultaneous requests
      const orderPromises = Array.from({ length: 3 }, (_, i) => {
        const orderData = {
          productId: `merch_concurrent_${i}`,
          productName: `Concurrent Product ${i}`,
          price: 10.00,
          quantity: 1,
          totalPrice: 10.00,
          customerInfo: {
            name: `User ${i}`,
            email: `user${i}@example.com`,
            contactMethod: 'email' as const
          },
          isPreOrder: false
        };

        return new Promise(async (resolve) => {
          const { POST } = await import('@/app/api/orders/route');
          const request = new NextRequest('http://localhost:3000/api/orders', {
            method: 'POST',
            body: JSON.stringify(orderData),
            headers: { 'Content-Type': 'application/json' }
          });
          
          const response = await POST(request);
          resolve(response);
        });
      });

      const responses = await Promise.all(orderPromises);
      
      responses.forEach((response: any) => {
        expect(response.status).toBe(200);
      });
    });

    it('should handle large order datasets efficiently', async () => {
      const largeOrderArray = Array.from({ length: 1000 }, (_, i) => ({
        ...sampleOrder,
        id: `order_${i}`,
        productId: `product_${i % 10}`
      }));
      
      mockReadFile.mockResolvedValue(JSON.stringify(largeOrderArray));

      const { GET } = await import('@/app/api/orders/route');
      const request = new NextRequest('http://localhost:3000/api/orders?productId=product_5');
      
      const startTime = Date.now();
      const response = await GET(request);
      const endTime = Date.now();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toHaveLength(100); // 1000 / 10 = 100 orders with product_5
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should validate malformed request bodies', async () => {
      const { POST } = await import('@/app/api/orders/route');
      const request = new NextRequest('http://localhost:3000/api/orders', {
        method: 'POST',
        body: 'invalid json',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const response = await POST(request);

      expect(response.status).toBe(400);
    });

    it('should handle missing Content-Type header', async () => {
      const validOrderData = {
        productId: 'test',
        productName: 'Test Product',
        price: 10,
        quantity: 1,
        totalPrice: 10,
        customerInfo: {
          name: 'Test',
          email: 'test@example.com',
          contactMethod: 'email'
        },
        isPreOrder: false
      };

      const { POST } = await import('@/app/api/orders/route');
      const request = new NextRequest('http://localhost:3000/api/orders', {
        method: 'POST',
        body: JSON.stringify(validOrderData)
        // No Content-Type header
      });
      
      const response = await POST(request);
      
      // Should still work as JSON parsing is attempted
      expect([200, 400]).toContain(response.status);
    });

    it('should handle special characters in order data', async () => {
      const specialCharOrderData = {
        productId: 'merch_special_ñáéíóú',
        productName: 'Camiseta Ñoño & López',
        price: 25.99,
        quantity: 1,
        totalPrice: 25.99,
        customerInfo: {
          name: 'José María Ñoño',
          email: 'josé@example.es',
          contactMethod: 'email' as const
        },
        orderDetails: {
          message: 'Con mucho cariño ♥️'
        },
        isPreOrder: false
      };

      const { POST } = await import('@/app/api/orders/route');
      const request = new NextRequest('http://localhost:3000/api/orders', {
        method: 'POST',
        body: JSON.stringify(specialCharOrderData),
        headers: { 'Content-Type': 'application/json' }
      });
      
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.productName).toBe('Camiseta Ñoño & López');
      expect(data.data.customerInfo.name).toBe('José María Ñoño');
    });
  });

  describe('Data Consistency and Validation', () => {
    it('should maintain data integrity after multiple operations', async () => {
      // Create order
      const createData = {
        productId: 'integrity_test',
        productName: 'Integrity Test Product',
        price: 20.00,
        quantity: 2,
        totalPrice: 40.00,
        customerInfo: {
          name: 'Test User',
          email: 'integrity@example.com',
          contactMethod: 'email' as const
        },
        isPreOrder: false
      };

      const { POST, PUT, GET } = await import('@/app/api/orders/route');
      
      // Create
      const createRequest = new NextRequest('http://localhost:3000/api/orders', {
        method: 'POST',
        body: JSON.stringify(createData),
        headers: { 'Content-Type': 'application/json' }
      });
      
      const createResponse = await POST(createRequest);
      expect(createResponse.status).toBe(200);
      
      // Update
      const updateRequest = new NextRequest('http://localhost:3000/api/orders?id=1234567890', {
        method: 'PUT',
        body: JSON.stringify({ status: 'confirmed' }),
        headers: { 'Content-Type': 'application/json' }
      });
      
      const updateResponse = await PUT(updateRequest);
      expect(updateResponse.status).toBe(200);
      
      // Verify
      const getRequest = new NextRequest('http://localhost:3000/api/orders');
      const getResponse = await GET(getRequest);
      const getData = await getResponse.json();
      
      expect(getResponse.status).toBe(200);
      expect(getData.data.length).toBeGreaterThan(0);
    });

    it('should validate price consistency', async () => {
      const inconsistentPriceData = {
        productId: 'price_test',
        productName: 'Price Test Product', 
        price: 10.00,
        quantity: 3,
        totalPrice: 25.00, // Should be 30.00 (10 * 3)
        customerInfo: {
          name: 'Test User',
          email: 'price@example.com',
          contactMethod: 'email' as const
        },
        isPreOrder: false
      };

      const { POST } = await import('@/app/api/orders/route');
      const request = new NextRequest('http://localhost:3000/api/orders', {
        method: 'POST',
        body: JSON.stringify(inconsistentPriceData),
        headers: { 'Content-Type': 'application/json' }
      });
      
      const response = await POST(request);
      
      // Schema validation should catch this inconsistency
      expect(response.status).toBe(400);
    });
  });
});