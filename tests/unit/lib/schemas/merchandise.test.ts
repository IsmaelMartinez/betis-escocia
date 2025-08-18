import { describe, it, expect } from 'vitest';
import { 
  merchandiseQuerySchema,
  createMerchandiseSchema,
  updateMerchandiseSchema,
  merchandiseIdSchema,
  type MerchandiseQueryParams,
  type CreateMerchandiseData,
  type UpdateMerchandiseData,
  type MerchandiseIdParams
} from '@/lib/schemas/merchandise';
import { ZodError } from 'zod';

describe('Merchandise Schema', () => {
  describe('merchandiseQuerySchema', () => {
    describe('Valid cases', () => {
      it('should parse empty query parameters', () => {
        const result = merchandiseQuerySchema.parse({});
        expect(result).toEqual({ featured: false, inStock: true }); // Default values
      });

      it('should parse category filter', () => {
        const result = merchandiseQuerySchema.parse({ category: 'clothing' });
        expect(result.category).toBe('clothing');
        expect(result.inStock).toBe(true); // Default
      });

      it('should transform featured string to boolean', () => {
        const resultTrue = merchandiseQuerySchema.parse({ featured: 'true' });
        expect(resultTrue.featured).toBe(true);
        
        const resultFalse = merchandiseQuerySchema.parse({ featured: 'false' });
        expect(resultFalse.featured).toBe(false);
        
        const resultOther = merchandiseQuerySchema.parse({ featured: 'other' });
        expect(resultOther.featured).toBe(false);
      });

      it('should transform inStock string to boolean with special handling', () => {
        const resultDefault = merchandiseQuerySchema.parse({});
        expect(resultDefault.inStock).toBe(true); // Default
        
        const resultTrue = merchandiseQuerySchema.parse({ inStock: 'true' });
        expect(resultTrue.inStock).toBe(true);
        
        const resultFalse = merchandiseQuerySchema.parse({ inStock: 'false' });
        expect(resultFalse.inStock).toBe(false);
        
        const resultOther = merchandiseQuerySchema.parse({ inStock: 'anything' });
        expect(resultOther.inStock).toBe(true); // Defaults to true unless 'false'
      });

      it('should parse complete query parameters', () => {
        const result = merchandiseQuerySchema.parse({
          category: 'accessories',
          featured: 'true',
          inStock: 'false'
        });
        
        expect(result).toEqual({
          category: 'accessories',
          featured: true,
          inStock: false
        });
      });
    });
  });

  describe('createMerchandiseSchema', () => {
    const validMerchandiseData: CreateMerchandiseData = {
      name: 'Camiseta Oficial Betis 2024',
      description: 'Camiseta oficial del Real Betis temporada 2024',
      price: 75.99,
      images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
      category: 'clothing',
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Verde', 'Blanco'],
      inStock: true,
      featured: true
    };

    describe('Valid cases', () => {
      it('should validate complete merchandise data', () => {
        const result = createMerchandiseSchema.parse(validMerchandiseData);
        expect(result.name).toBe('Camiseta Oficial Betis 2024');
        expect(result.price).toBe(75.99);
        expect(result.category).toBe('clothing');
        expect(result.sizes).toEqual(['S', 'M', 'L', 'XL']);
      });

      it('should validate minimal merchandise data with defaults', () => {
        const minimalData = {
          name: 'Bufanda Betis',
          description: 'Bufanda verde y blanco',
          price: 25.00,
          category: 'accessories' as const
        };
        
        const result = createMerchandiseSchema.parse(minimalData);
        expect(result.name).toBe('Bufanda Betis');
        expect(result.images).toEqual([]); // Default
        expect(result.sizes).toEqual([]); // Default
        expect(result.colors).toEqual([]); // Default
        expect(result.inStock).toBe(true); // Default
        expect(result.featured).toBe(false); // Default
      });

      it('should handle all valid categories', () => {
        const categories: CreateMerchandiseData['category'][] = ['clothing', 'accessories', 'collectibles'];
        
        categories.forEach(category => {
          const data = { ...validMerchandiseData, category };
          const result = createMerchandiseSchema.parse(data);
          expect(result.category).toBe(category);
        });
      });

      it('should trim name and description', () => {
        const dataWithSpaces = {
          ...validMerchandiseData,
          name: '  Camiseta Betis  ',
          description: '  Descripción del producto  '
        };
        
        const result = createMerchandiseSchema.parse(dataWithSpaces);
        expect(result.name).toBe('Camiseta Betis');
        expect(result.description).toBe('Descripción del producto');
      });

      it('should validate various price formats', () => {
        const prices = [1, 10.50, 99.99, 150];
        
        prices.forEach(price => {
          const data = { ...validMerchandiseData, price };
          const result = createMerchandiseSchema.parse(data);
          expect(result.price).toBe(price);
        });
      });

      it('should validate image URLs', () => {
        const validImageUrls = [
          'https://example.com/image.jpg',
          'http://localhost:3000/image.png',
          'https://cdn.example.com/products/shirt.webp'
        ];
        
        const data = { ...validMerchandiseData, images: validImageUrls };
        const result = createMerchandiseSchema.parse(data);
        expect(result.images).toEqual(validImageUrls);
      });
    });

    describe('Invalid cases', () => {
      it('should reject empty name', () => {
        const invalidData = { ...validMerchandiseData, name: '' };
        expect(() => createMerchandiseSchema.parse(invalidData)).toThrow(ZodError);
        
        try {
          createMerchandiseSchema.parse(invalidData);
        } catch (error) {
          expect(error).toBeInstanceOf(ZodError);
          const zodError = error as ZodError;
          expect(zodError.issues?.[0]?.message).toBe('Nombre es requerido');
        }
      });

      it('should reject name too long', () => {
        const invalidData = { ...validMerchandiseData, name: 'A'.repeat(101) };
        expect(() => createMerchandiseSchema.parse(invalidData)).toThrow(ZodError);
        
        try {
          createMerchandiseSchema.parse(invalidData);
        } catch (error) {
          expect(error).toBeInstanceOf(ZodError);
          const zodError = error as ZodError;
          expect(zodError.issues?.[0]?.message).toBe('Nombre demasiado largo');
        }
      });

      it('should reject empty description', () => {
        const invalidData = { ...validMerchandiseData, description: '' };
        expect(() => createMerchandiseSchema.parse(invalidData)).toThrow(ZodError);
        
        try {
          createMerchandiseSchema.parse(invalidData);
        } catch (error) {
          expect(error).toBeInstanceOf(ZodError);
          const zodError = error as ZodError;
          expect(zodError.issues?.[0]?.message).toBe('Descripción es requerida');
        }
      });

      it('should reject description too long', () => {
        const invalidData = { ...validMerchandiseData, description: 'A'.repeat(501) };
        expect(() => createMerchandiseSchema.parse(invalidData)).toThrow(ZodError);
        
        try {
          createMerchandiseSchema.parse(invalidData);
        } catch (error) {
          expect(error).toBeInstanceOf(ZodError);
          const zodError = error as ZodError;
          expect(zodError.issues?.[0]?.message).toBe('Descripción demasiado larga');
        }
      });

      it('should reject negative or zero prices', () => {
        const invalidPrices = [0, -1, -10.50];
        
        invalidPrices.forEach(price => {
          const invalidData = { ...validMerchandiseData, price };
          expect(() => createMerchandiseSchema.parse(invalidData)).toThrow(ZodError);
          
          try {
            createMerchandiseSchema.parse(invalidData);
          } catch (error) {
            expect(error).toBeInstanceOf(ZodError);
          const zodError = error as ZodError;
          expect(zodError.issues?.[0]?.message).toBe('El precio debe ser positivo');
          }
        });
      });

      it('should reject invalid category', () => {
        const invalidData = { ...validMerchandiseData, category: 'invalid' as any };
        expect(() => createMerchandiseSchema.parse(invalidData)).toThrow(ZodError);
        
        try {
          createMerchandiseSchema.parse(invalidData);
        } catch (error) {
          expect(error).toBeInstanceOf(ZodError);
          const zodError = error as ZodError;
          expect(zodError.issues?.[0]?.message).toBe('Categoría debe ser clothing, accessories o collectibles');
        }
      });

      it('should reject invalid image URLs', () => {
        const invalidData = { ...validMerchandiseData, images: ['not-a-url', 'also-invalid'] };
        expect(() => createMerchandiseSchema.parse(invalidData)).toThrow(ZodError);
        
        try {
          createMerchandiseSchema.parse(invalidData);
        } catch (error) {
          expect(error).toBeInstanceOf(ZodError);
          const zodError = error as ZodError;
          expect(zodError.issues?.[0]?.message).toBe('URL de imagen inválida');
        }
      });
    });
  });

  describe('updateMerchandiseSchema', () => {
    const validUpdateData: UpdateMerchandiseData = {
      name: 'Camiseta Actualizada',
      price: 80.00,
      inStock: false
    };

    describe('Valid cases', () => {
      it('should validate partial update data', () => {
        const result = updateMerchandiseSchema.parse(validUpdateData);
        expect(result.name).toBe('Camiseta Actualizada');
        expect(result.price).toBe(80.00);
        expect(result.inStock).toBe(false);
      });

      it('should validate empty update (all fields optional)', () => {
        const result = updateMerchandiseSchema.parse({});
        expect(Object.keys(result)).toHaveLength(0);
      });

      it('should validate single field updates', () => {
        const priceUpdate = updateMerchandiseSchema.parse({ price: 65.99 });
        expect(priceUpdate.price).toBe(65.99);
        
        const stockUpdate = updateMerchandiseSchema.parse({ inStock: true });
        expect(stockUpdate.inStock).toBe(true);
        
        const nameUpdate = updateMerchandiseSchema.parse({ name: 'Nuevo Nombre' });
        expect(nameUpdate.name).toBe('Nuevo Nombre');
      });
    });

    describe('Invalid cases', () => {
      it('should reject invalid data when provided', () => {
        const invalidData = { price: -50 };
        expect(() => updateMerchandiseSchema.parse(invalidData)).toThrow(ZodError);
        
        try {
          updateMerchandiseSchema.parse(invalidData);
        } catch (error) {
          expect(error).toBeInstanceOf(ZodError);
          const zodError = error as ZodError;
          expect(zodError.issues?.[0]?.message).toBe('El precio debe ser positivo');
        }
      });

      it('should reject empty name when provided', () => {
        const invalidData = { name: '' };
        expect(() => updateMerchandiseSchema.parse(invalidData)).toThrow(ZodError);
        
        try {
          updateMerchandiseSchema.parse(invalidData);
        } catch (error) {
          expect(error).toBeInstanceOf(ZodError);
          const zodError = error as ZodError;
          expect(zodError.issues?.[0]?.message).toBe('Nombre es requerido');
        }
      });

      it('should reject invalid category when provided', () => {
        const invalidData = { category: 'invalid' as any };
        expect(() => updateMerchandiseSchema.parse(invalidData)).toThrow(ZodError);
      });
    });
  });

  describe('merchandiseIdSchema', () => {
    describe('Valid cases', () => {
      it('should validate valid product ID', () => {
        const result = merchandiseIdSchema.parse({ id: 'product_123' });
        expect(result.id).toBe('product_123');
      });

      it('should validate numeric ID as string', () => {
        const result = merchandiseIdSchema.parse({ id: '12345' });
        expect(result.id).toBe('12345');
      });

      it('should validate UUID format IDs', () => {
        const uuid = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
        const result = merchandiseIdSchema.parse({ id: uuid });
        expect(result.id).toBe(uuid);
      });
    });

    describe('Invalid cases', () => {
      it('should reject empty ID', () => {
        expect(() => merchandiseIdSchema.parse({ id: '' })).toThrow(ZodError);
        
        try {
          merchandiseIdSchema.parse({ id: '' });
        } catch (error) {
          expect(error).toBeInstanceOf(ZodError);
          const zodError = error as ZodError;
          expect(zodError.issues?.[0]?.message).toBe('ID del producto requerido');
        }
      });

      it('should reject missing ID', () => {
        expect(() => merchandiseIdSchema.parse({})).toThrow(ZodError);
      });

      it('should reject non-string ID', () => {
        expect(() => merchandiseIdSchema.parse({ id: 123 })).toThrow(ZodError);
      });
    });
  });

  describe('Type inference', () => {
    it('should infer correct TypeScript types', () => {
      const queryParams: MerchandiseQueryParams = { category: 'clothing', featured: true };
      const createData: CreateMerchandiseData = {
        name: 'Test Product',
        description: 'Test Description',
        price: 50,
        category: 'accessories'
      };
      const updateData: UpdateMerchandiseData = { price: 60 };
      const idParams: MerchandiseIdParams = { id: 'test_id' };

      // These should not throw TypeScript errors
      expect(queryParams.category).toBe('clothing');
      expect(createData.name).toBe('Test Product');
      expect(updateData.price).toBe(60);
      expect(idParams.id).toBe('test_id');
    });
  });

  describe('Real-world scenarios', () => {
    it('should handle typical e-commerce product creation', () => {
      const productData = {
        name: 'Camiseta Real Betis 2024/25',
        description: 'Camiseta oficial primera equipación temporada 2024/25',
        price: 89.95,
        images: [
          'https://cdn.realbetis.com/shirt-front.jpg',
          'https://cdn.realbetis.com/shirt-back.jpg'
        ],
        category: 'clothing' as const,
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
        colors: ['Verde', 'Blanco'],
        inStock: true,
        featured: true
      };

      const result = createMerchandiseSchema.parse(productData);
      expect(result.name).toBe('Camiseta Real Betis 2024/25');
      expect(result.price).toBe(89.95);
      expect(result.sizes).toHaveLength(6);
    });

    it('should handle product stock updates', () => {
      const stockUpdate = { inStock: false };
      const result = updateMerchandiseSchema.parse(stockUpdate);
      expect(result.inStock).toBe(false);
    });

    it('should handle query filtering scenarios', () => {
      // Filter for featured clothing items in stock
      const queryParams = {
        category: 'clothing',
        featured: 'true',
        inStock: 'true'
      };

      const result = merchandiseQuerySchema.parse(queryParams);
      expect(result).toEqual({
        category: 'clothing',
        featured: true,
        inStock: true
      });
    });
  });
});