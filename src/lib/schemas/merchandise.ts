import { z } from 'zod';

// Merchandise query parameters schema
export const merchandiseQuerySchema = z.object({
  category: z.string().optional(),
  featured: z.string().optional().transform(val => val === 'true'),
  inStock: z.string().optional().transform(val => val !== 'false') // Default to true
});

// Merchandise creation schema
export const createMerchandiseSchema = z.object({
  name: z.string().min(1, 'Nombre es requerido').max(100, 'Nombre demasiado largo').trim(),
  description: z.string().min(1, 'Descripción es requerida').max(500, 'Descripción demasiado larga').trim(),
  price: z.number().positive('El precio debe ser positivo'),
  images: z.array(z.string().url('URL de imagen inválida')).default([]),
  category: z.enum(['clothing', 'accessories', 'collectibles'], {
    message: 'Categoría debe ser clothing, accessories o collectibles'
  }),
  sizes: z.array(z.string()).default([]),
  colors: z.array(z.string()).default([]),
  inStock: z.boolean().default(true),
  featured: z.boolean().default(false)
});

// Merchandise update schema
export const updateMerchandiseSchema = z.object({
  name: z.string().min(1, 'Nombre es requerido').max(100, 'Nombre demasiado largo').trim().optional(),
  description: z.string().min(1, 'Descripción es requerida').max(500, 'Descripción demasiado larga').trim().optional(),
  price: z.number().positive('El precio debe ser positivo').optional(),
  images: z.array(z.string().url('URL de imagen inválida')).optional(),
  category: z.enum(['clothing', 'accessories', 'collectibles']).optional(),
  sizes: z.array(z.string()).optional(),
  colors: z.array(z.string()).optional(),
  inStock: z.boolean().optional(),
  featured: z.boolean().optional()
});

// Merchandise ID parameter schema
export const merchandiseIdSchema = z.object({
  id: z.string().min(1, 'ID del producto requerido')
});

// Export TypeScript types
export type MerchandiseQueryParams = z.infer<typeof merchandiseQuerySchema>;
export type CreateMerchandiseData = z.infer<typeof createMerchandiseSchema>;
export type UpdateMerchandiseData = z.infer<typeof updateMerchandiseSchema>;
export type MerchandiseIdParams = z.infer<typeof merchandiseIdSchema>;