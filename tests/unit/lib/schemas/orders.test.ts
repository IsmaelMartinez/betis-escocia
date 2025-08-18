import { describe, it, expect } from 'vitest';
import { 
  createOrderSchema,
  updateOrderSchema,
  orderQuerySchema,
  orderIdSchema,
  orderSchema,
  type CreateOrderData,
  type UpdateOrderData,
  type OrderQueryParams,
  type OrderIdParams,
  type OrderInput
} from '@/lib/schemas/orders';
import { ZodError } from 'zod';

describe('Orders Schema', () => {
  describe('createOrderSchema', () => {
    const validOrderData: CreateOrderData = {
      productId: 'product_123',
      productName: 'Camiseta Official Betis',
      price: 75.99,
      quantity: 2,
      totalPrice: 151.98,
      customerInfo: {
        name: 'Miguel Fernández',
        email: 'miguel.fernandez@example.com',
        phone: '+34-666-777-888',
        contactMethod: 'email'
      },
      orderDetails: {
        size: 'L',
        message: 'Por favor, envío rápido'
      },
      isPreOrder: false,
      timestamp: '2024-03-20T15:30:00Z'
    };

    describe('Valid cases', () => {
      it('should validate complete order data', () => {
        const result = createOrderSchema.parse(validOrderData);
        expect(result.productId).toBe('product_123');
        expect(result.quantity).toBe(2);
        expect(result.totalPrice).toBe(151.98);
        expect(result.customerInfo.name).toBe('Miguel Fernández');
        expect(result.customerInfo.email).toBe('miguel.fernandez@example.com');
      });

      it('should validate minimal order data with defaults', () => {
        const minimalData = {
          productId: 'product_456',
          productName: 'Bufanda Verde',
          price: 25.00,
          quantity: 1,
          totalPrice: 25.00,
          customerInfo: {
            name: 'Ana García',
            email: 'ana.garcia@example.com'
          }
        };
        
        const result = createOrderSchema.parse(minimalData);
        expect(result.productId).toBe('product_456');
        expect(result.customerInfo.contactMethod).toBe('email'); // Default
        expect(result.isPreOrder).toBe(false); // Default
      });

      it('should handle different contact methods', () => {
        const emailOrder = { ...validOrderData, customerInfo: { ...validOrderData.customerInfo, contactMethod: 'email' as const } };
        const whatsappOrder = { ...validOrderData, customerInfo: { ...validOrderData.customerInfo, contactMethod: 'whatsapp' as const } };
        
        const emailResult = createOrderSchema.parse(emailOrder);
        const whatsappResult = createOrderSchema.parse(whatsappOrder);
        
        expect(emailResult.customerInfo.contactMethod).toBe('email');
        expect(whatsappResult.customerInfo.contactMethod).toBe('whatsapp');
      });

      it('should handle pre-orders', () => {
        const preOrderData = { ...validOrderData, isPreOrder: true };
        const result = createOrderSchema.parse(preOrderData);
        expect(result.isPreOrder).toBe(true);
      });

      it('should handle orders without optional fields', () => {
        const dataWithoutOptionals = {
          productId: 'product_123',
          productName: 'Camiseta Official Betis',
          price: 75.99,
          quantity: 2,
          totalPrice: 151.98,
          customerInfo: {
            name: 'Carlos Ruiz',
            email: 'carlos.ruiz@example.com'
            // No phone
          },
          isPreOrder: false
          // No orderDetails, timestamp
        };
        
        const result = createOrderSchema.parse(dataWithoutOptionals);
        expect(result.customerInfo.name).toBe('Carlos Ruiz');
        expect(result.orderDetails).toBeUndefined();
        expect(result.timestamp).toBeUndefined();
      });

      it('should handle empty optional string fields', () => {
        const dataWithEmptyFields = {
          ...validOrderData,
          customerInfo: {
            ...validOrderData.customerInfo,
            phone: ''
          },
          orderDetails: {
            size: '',
            message: ''
          }
        };
        
        const result = createOrderSchema.parse(dataWithEmptyFields);
        expect(result.customerInfo.phone).toBe('');
        expect(result.orderDetails?.message).toBe('');
      });

      it('should trim customer info fields', () => {
        const dataWithSpaces = {
          ...validOrderData,
          productName: '  Camiseta Betis  ',
          customerInfo: {
            ...validOrderData.customerInfo,
            name: '  Laura Sánchez  ',
            email: 'laura.sanchez@example.com'
          }
        };
        
        const result = createOrderSchema.parse(dataWithSpaces);
        expect(result.productName).toBe('  Camiseta Betis  '); // productName is not trimmed in schema
        expect(result.customerInfo.name).toBe('Laura Sánchez');
        expect(result.customerInfo.email).toBe('laura.sanchez@example.com');
      });

      it('should handle various quantities up to maximum', () => {
        for (let quantity = 1; quantity <= 20; quantity++) {
          const data = { ...validOrderData, quantity, totalPrice: validOrderData.price * quantity };
          const result = createOrderSchema.parse(data);
          expect(result.quantity).toBe(quantity);
        }
      });
    });

    describe('Invalid cases - Product validation', () => {
      it('should reject empty product ID', () => {
        const invalidData = { ...validOrderData, productId: '' };
        expect(() => createOrderSchema.parse(invalidData)).toThrow(ZodError);
        
        try {
          createOrderSchema.parse(invalidData);
        } catch (error) {
          expect(error).toBeInstanceOf(ZodError);
          const zodError = error as ZodError;
          expect(zodError.issues?.[0]?.message).toBe('ID del producto es requerido');
        }
      });

      it('should reject empty product name', () => {
        const invalidData = { ...validOrderData, productName: '' };
        expect(() => createOrderSchema.parse(invalidData)).toThrow(ZodError);
        
        try {
          createOrderSchema.parse(invalidData);
        } catch (error) {
          expect(error).toBeInstanceOf(ZodError);
          const zodError = error as ZodError;
          expect(zodError.issues?.[0]?.message).toBe('Nombre del producto es requerido');
        }
      });

      it('should reject product name too long', () => {
        const invalidData = { ...validOrderData, productName: 'A'.repeat(101) };
        expect(() => createOrderSchema.parse(invalidData)).toThrow(ZodError);
        
        try {
          createOrderSchema.parse(invalidData);
        } catch (error) {
          expect(error).toBeInstanceOf(ZodError);
          const zodError = error as ZodError;
          expect(zodError.issues?.[0]?.message).toBe('Nombre del producto demasiado largo');
        }
      });
    });

    describe('Invalid cases - Price validation', () => {
      it('should reject negative prices', () => {
        const invalidPrices = [0, -1, -50.99];
        
        invalidPrices.forEach(price => {
          const invalidData = { ...validOrderData, price };
          expect(() => createOrderSchema.parse(invalidData)).toThrow(ZodError);
          
          try {
            createOrderSchema.parse(invalidData);
          } catch (error) {
            expect(error).toBeInstanceOf(ZodError);
          const zodError = error as ZodError;
          expect(zodError.issues?.[0]?.message).toBe('El precio debe ser positivo');
          }
        });
      });

      it('should reject negative total price', () => {
        const invalidData = { ...validOrderData, totalPrice: -100 };
        expect(() => createOrderSchema.parse(invalidData)).toThrow(ZodError);
        
        try {
          createOrderSchema.parse(invalidData);
        } catch (error) {
          expect(error).toBeInstanceOf(ZodError);
          const zodError = error as ZodError;
          expect(zodError.issues?.[0]?.message).toBe('El precio total debe ser positivo');
        }
      });
    });

    describe('Invalid cases - Quantity validation', () => {
      it('should reject quantity 0 or negative', () => {
        const invalidQuantities = [0, -1, -5];
        
        invalidQuantities.forEach(quantity => {
          const invalidData = { ...validOrderData, quantity };
          expect(() => createOrderSchema.parse(invalidData)).toThrow(ZodError);
          
          try {
            createOrderSchema.parse(invalidData);
          } catch (error) {
            expect(error).toBeInstanceOf(ZodError);
          const zodError = error as ZodError;
          expect(zodError.issues?.[0]?.message).toBe('La cantidad debe ser un número entero positivo');
          }
        });
      });

      it('should reject quantity above maximum', () => {
        const invalidData = { ...validOrderData, quantity: 21 };
        expect(() => createOrderSchema.parse(invalidData)).toThrow(ZodError);
        
        try {
          createOrderSchema.parse(invalidData);
        } catch (error) {
          expect(error).toBeInstanceOf(ZodError);
          const zodError = error as ZodError;
          expect(zodError.issues?.[0]?.message).toBe('Cantidad máxima es 20');
        }
      });

      it('should reject non-integer quantity', () => {
        const invalidData = { ...validOrderData, quantity: 2.5 };
        expect(() => createOrderSchema.parse(invalidData)).toThrow(ZodError);
      });
    });

    describe('Invalid cases - Customer info validation', () => {
      it('should reject customer name too short', () => {
        const invalidData = {
          ...validOrderData,
          customerInfo: { ...validOrderData.customerInfo, name: 'A' }
        };
        expect(() => createOrderSchema.parse(invalidData)).toThrow(ZodError);
        
        try {
          createOrderSchema.parse(invalidData);
        } catch (error) {
          expect(error).toBeInstanceOf(ZodError);
          const zodError = error as ZodError;
          expect(zodError.issues?.[0]?.message).toBe('El nombre debe tener al menos 2 caracteres');
        }
      });

      it('should reject invalid email format', () => {
        const invalidData = {
          ...validOrderData,
          customerInfo: { ...validOrderData.customerInfo, email: 'invalid-email' }
        };
        expect(() => createOrderSchema.parse(invalidData)).toThrow(ZodError);
        
        try {
          createOrderSchema.parse(invalidData);
        } catch (error) {
          expect(error).toBeInstanceOf(ZodError);
          const zodError = error as ZodError;
          expect(zodError.issues?.[0]?.message).toBe('Email inválido');
        }
      });

      it('should reject invalid phone format', () => {
        const invalidData = {
          ...validOrderData,
          customerInfo: { ...validOrderData.customerInfo, phone: '123' }
        };
        expect(() => createOrderSchema.parse(invalidData)).toThrow(ZodError);
        
        try {
          createOrderSchema.parse(invalidData);
        } catch (error) {
          expect(error).toBeInstanceOf(ZodError);
          const zodError = error as ZodError;
          expect(zodError.issues?.[0]?.message).toBe('Formato de teléfono inválido');
        }
      });

      it('should reject invalid contact method', () => {
        const invalidData = {
          ...validOrderData,
          customerInfo: { ...validOrderData.customerInfo, contactMethod: 'sms' as any }
        };
        expect(() => createOrderSchema.parse(invalidData)).toThrow(ZodError);
        
        try {
          createOrderSchema.parse(invalidData);
        } catch (error) {
          expect(error).toBeInstanceOf(ZodError);
          const zodError = error as ZodError;
          expect(zodError.issues?.[0]?.message).toBe('Método de contacto debe ser email o whatsapp');
        }
      });
    });

    describe('Invalid cases - Order details validation', () => {
      it('should reject size too long', () => {
        const invalidData = {
          ...validOrderData,
          orderDetails: { ...validOrderData.orderDetails, size: 'EXTRA-LARGE-PLUS' }
        };
        expect(() => createOrderSchema.parse(invalidData)).toThrow(ZodError);
        
        try {
          createOrderSchema.parse(invalidData);
        } catch (error) {
          expect(error).toBeInstanceOf(ZodError);
          const zodError = error as ZodError;
          expect(zodError.issues?.[0]?.message).toBe('Talla demasiado larga');
        }
      });

      it('should reject message too long', () => {
        const invalidData = {
          ...validOrderData,
          orderDetails: { ...validOrderData.orderDetails, message: 'A'.repeat(501) }
        };
        expect(() => createOrderSchema.parse(invalidData)).toThrow(ZodError);
        
        try {
          createOrderSchema.parse(invalidData);
        } catch (error) {
          expect(error).toBeInstanceOf(ZodError);
          const zodError = error as ZodError;
          expect(zodError.issues?.[0]?.message).toBe('Mensaje demasiado largo');
        }
      });
    });
  });

  describe('updateOrderSchema', () => {
    const validUpdateData: UpdateOrderData = {
      status: 'confirmed',
      fulfillmentDate: '2024-03-25T10:00:00Z'
    };

    describe('Valid cases', () => {
      it('should validate complete update data', () => {
        const result = updateOrderSchema.parse(validUpdateData);
        expect(result.status).toBe('confirmed');
        expect(result.fulfillmentDate).toBe('2024-03-25T10:00:00Z');
      });

      it('should validate partial updates', () => {
        const statusOnly = updateOrderSchema.parse({ status: 'fulfilled' });
        expect(statusOnly.status).toBe('fulfilled');
        expect(statusOnly.fulfillmentDate).toBeUndefined();
        
        const dateOnly = updateOrderSchema.parse({ fulfillmentDate: '2024-04-01T12:00:00Z' });
        expect(dateOnly.fulfillmentDate).toBe('2024-04-01T12:00:00Z');
        expect(dateOnly.status).toBeUndefined();
      });

      it('should validate empty update (all optional)', () => {
        const result = updateOrderSchema.parse({});
        expect(Object.keys(result)).toHaveLength(0);
      });

      it('should handle all valid status values', () => {
        const statuses: UpdateOrderData['status'][] = ['pending', 'confirmed', 'fulfilled', 'cancelled'];
        
        statuses.forEach(status => {
          const result = updateOrderSchema.parse({ status });
          expect(result.status).toBe(status);
        });
      });
    });

    describe('Invalid cases', () => {
      it('should reject invalid status', () => {
        expect(() => updateOrderSchema.parse({ status: 'shipped' as any })).toThrow(ZodError);
        
        try {
          updateOrderSchema.parse({ status: 'shipped' as any });
        } catch (error) {
          expect(error).toBeInstanceOf(ZodError);
          const zodError = error as ZodError;
          expect(zodError.issues?.[0]?.message).toBe('Estado inválido');
        }
      });

      it('should reject invalid datetime format for fulfillmentDate', () => {
        expect(() => updateOrderSchema.parse({ fulfillmentDate: '2024-03-25 10:00:00' })).toThrow(ZodError);
      });
    });
  });

  describe('orderQuerySchema', () => {
    describe('Valid cases', () => {
      it('should parse empty query', () => {
        const result = orderQuerySchema.parse({});
        expect(result).toEqual({});
      });

      it('should parse product ID filter', () => {
        const result = orderQuerySchema.parse({ productId: 'product_123' });
        expect(result.productId).toBe('product_123');
      });

      it('should parse status filter', () => {
        const result = orderQuerySchema.parse({ status: 'confirmed' });
        expect(result.status).toBe('confirmed');
      });

      it('should parse combined filters', () => {
        const result = orderQuerySchema.parse({ productId: 'product_456', status: 'fulfilled' });
        expect(result.productId).toBe('product_456');
        expect(result.status).toBe('fulfilled');
      });

      it('should handle all valid status filters', () => {
        const statuses: OrderQueryParams['status'][] = ['pending', 'confirmed', 'fulfilled', 'cancelled'];
        
        statuses.forEach(status => {
          const result = orderQuerySchema.parse({ status });
          expect(result.status).toBe(status);
        });
      });
    });

    describe('Invalid cases', () => {
      it('should reject invalid status filter', () => {
        expect(() => orderQuerySchema.parse({ status: 'invalid' as any })).toThrow(ZodError);
      });
    });
  });

  describe('orderIdSchema', () => {
    describe('Valid cases', () => {
      it('should validate order ID', () => {
        const result = orderIdSchema.parse({ id: 'order_123456' });
        expect(result.id).toBe('order_123456');
      });

      it('should handle various ID formats', () => {
        const ids = ['order_123', 'ord-456', '789', 'uuid-f47ac10b-58cc'];
        
        ids.forEach(id => {
          const result = orderIdSchema.parse({ id });
          expect(result.id).toBe(id);
        });
      });
    });

    describe('Invalid cases', () => {
      it('should reject empty ID', () => {
        expect(() => orderIdSchema.parse({ id: '' })).toThrow(ZodError);
        
        try {
          orderIdSchema.parse({ id: '' });
        } catch (error) {
          expect(error).toBeInstanceOf(ZodError);
          const zodError = error as ZodError;
          expect(zodError.issues?.[0]?.message).toBe('ID del pedido requerido');
        }
      });

      it('should reject missing ID', () => {
        expect(() => orderIdSchema.parse({})).toThrow(ZodError);
      });
    });
  });

  describe('orderSchema (legacy)', () => {
    const validLegacyOrder: OrderInput = {
      name: 'Roberto Díaz',
      email: 'roberto.diaz@example.com',
      phone: '+34-123-456-789',
      items: [
        {
          id: 'item_1',
          name: 'Camiseta Betis',
          price: 75.99,
          quantity: 2,
          size: 'L'
        },
        {
          id: 'item_2',
          name: 'Bufanda Betis',
          price: 25.00,
          quantity: 1
        }
      ],
      notes: 'Envío urgente por favor'
    };

    describe('Valid cases', () => {
      it('should validate complete legacy order', () => {
        const result = orderSchema.parse(validLegacyOrder);
        expect(result.name).toBe('Roberto Díaz');
        expect(result.items).toHaveLength(2);
        expect(result.items[0].quantity).toBe(2);
      });

      it('should validate order without optional fields', () => {
        const minimalOrder = {
          name: 'Ana López',
          email: 'ana.lopez@example.com',
          phone: '+34-987-654-321',
          items: [
            {
              id: 'item_1',
              name: 'Producto Test',
              price: 50,
              quantity: 1
            }
          ]
        };
        
        const result = orderSchema.parse(minimalOrder);
        expect(result.name).toBe('Ana López');
        expect(result.items).toHaveLength(1);
        expect(result.notes).toBeUndefined();
      });

      it('should handle empty notes', () => {
        const orderWithEmptyNotes = { ...validLegacyOrder, notes: '' };
        const result = orderSchema.parse(orderWithEmptyNotes);
        expect(result.notes).toBe('');
      });

      it('should validate items with various quantities', () => {
        const items = [
          { id: '1', name: 'Item 1', price: 10, quantity: 1 },
          { id: '2', name: 'Item 2', price: 20, quantity: 5 },
          { id: '3', name: 'Item 3', price: 30, quantity: 10 }
        ];
        
        const order = { ...validLegacyOrder, items };
        const result = orderSchema.parse(order);
        expect(result.items[2].quantity).toBe(10);
      });
    });

    describe('Invalid cases', () => {
      it('should reject empty items array', () => {
        const invalidOrder = { ...validLegacyOrder, items: [] };
        expect(() => orderSchema.parse(invalidOrder)).toThrow(ZodError);
        
        try {
          orderSchema.parse(invalidOrder);
        } catch (error) {
          expect(error).toBeInstanceOf(ZodError);
          const zodError = error as ZodError;
          expect(zodError.issues?.[0]?.message).toBe('Debe seleccionar al menos un artículo');
        }
      });

      it('should reject item with quantity above maximum', () => {
        const invalidItems = [
          { ...validLegacyOrder.items[0], quantity: 11 }
        ];
        const invalidOrder = { ...validLegacyOrder, items: invalidItems };
        expect(() => orderSchema.parse(invalidOrder)).toThrow(ZodError);
      });

      it('should reject item with zero or negative quantity', () => {
        const invalidQuantities = [0, -1];
        
        invalidQuantities.forEach(quantity => {
          const invalidItems = [
            { ...validLegacyOrder.items[0], quantity }
          ];
          const invalidOrder = { ...validLegacyOrder, items: invalidItems };
          expect(() => orderSchema.parse(invalidOrder)).toThrow(ZodError);
        });
      });

      it('should reject item with zero or negative price', () => {
        const invalidPrices = [0, -10.50];
        
        invalidPrices.forEach(price => {
          const invalidItems = [
            { ...validLegacyOrder.items[0], price }
          ];
          const invalidOrder = { ...validLegacyOrder, items: invalidItems };
          expect(() => orderSchema.parse(invalidOrder)).toThrow(ZodError);
        });
      });

      it('should reject notes too long', () => {
        const invalidOrder = { ...validLegacyOrder, notes: 'A'.repeat(501) };
        expect(() => orderSchema.parse(invalidOrder)).toThrow(ZodError);
        
        try {
          orderSchema.parse(invalidOrder);
        } catch (error) {
          expect(error).toBeInstanceOf(ZodError);
          const zodError = error as ZodError;
          expect(zodError.issues?.[0]?.message).toBe('Notas no pueden exceder 500 caracteres');
        }
      });
    });
  });

  describe('Type inference', () => {
    it('should infer correct TypeScript types', () => {
      const createData: CreateOrderData = {
        productId: 'test',
        productName: 'Test Product',
        price: 50,
        quantity: 1,
        totalPrice: 50,
        customerInfo: {
          name: 'Test User',
          email: 'test@example.com'
        }
      };
      
      const updateData: UpdateOrderData = { status: 'confirmed' };
      const queryParams: OrderQueryParams = { productId: 'test' };
      const idParams: OrderIdParams = { id: 'order_123' };
      const legacyOrder: OrderInput = {
        name: 'Test',
        email: 'test@example.com',
        phone: '+34-123-456-789',
        items: [{ id: '1', name: 'Item', price: 10, quantity: 1 }]
      };

      // These should not throw TypeScript errors
      expect(createData.productId).toBe('test');
      expect(updateData.status).toBe('confirmed');
      expect(queryParams.productId).toBe('test');
      expect(idParams.id).toBe('order_123');
      expect(legacyOrder.items).toHaveLength(1);
    });
  });

  describe('Real-world scenarios', () => {
    it('should handle typical order creation workflow', () => {
      const orderData = {
        productId: 'camiseta_betis_2024',
        productName: 'Camiseta Real Betis Temporada 2024/25',
        price: 89.95,
        quantity: 2,
        totalPrice: 179.90,
        customerInfo: {
          name: 'María González',
          email: 'maria.gonzalez@example.com',
          phone: '+34-611-222-333',
          contactMethod: 'whatsapp' as const
        },
        orderDetails: {
          size: 'L',
          message: 'Por favor, confirmar disponibilidad antes del envío'
        },
        isPreOrder: false
      };

      const result = createOrderSchema.parse(orderData);
      expect(result.productName).toBe('Camiseta Real Betis Temporada 2024/25');
      expect(result.totalPrice).toBe(179.90);
      expect(result.customerInfo.contactMethod).toBe('whatsapp');
    });

    it('should handle order status progression', () => {
      const statusUpdates: UpdateOrderData['status'][] = ['pending', 'confirmed', 'fulfilled'];
      
      statusUpdates.forEach(status => {
        const update = updateOrderSchema.parse({ status });
        expect(update.status).toBe(status);
      });
    });

    it('should handle order filtering and querying', () => {
      // Filter confirmed orders for a specific product
      const query = orderQuerySchema.parse({
        productId: 'camiseta_official',
        status: 'confirmed'
      });

      expect(query.productId).toBe('camiseta_official');
      expect(query.status).toBe('confirmed');
    });
  });
});