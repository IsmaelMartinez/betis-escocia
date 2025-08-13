import { z } from 'zod';

// Order creation schema
export const createOrderSchema = z.object({
  productId: z.string().min(1, 'ID del producto es requerido'),
  productName: z.string().min(1, 'Nombre del producto es requerido').max(100, 'Nombre del producto demasiado largo'),
  price: z.number().positive('El precio debe ser positivo'),
  quantity: z.number().int().positive('La cantidad debe ser un número entero positivo').max(20, 'Cantidad máxima es 20'),
  totalPrice: z.number().positive('El precio total debe ser positivo'),
  customerInfo: z.object({
    name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(50, 'El nombre es demasiado largo').trim(),
    email: z.string().email('Email inválido').max(254, 'Email demasiado largo').toLowerCase().trim(),
    phone: z.string().regex(/^[+]?[\d\s-()]{9,15}$/, 'Formato de teléfono inválido').optional().or(z.literal('')),
    contactMethod: z.enum(['email', 'whatsapp'], {
      message: 'Método de contacto debe ser email o whatsapp'
    }).default('email')
  }),
  orderDetails: z.object({
    size: z.string().max(10, 'Talla demasiado larga').optional(),
    message: z.string().max(500, 'Mensaje demasiado largo').optional()
  }).optional(),
  isPreOrder: z.boolean().default(false),
  timestamp: z.string().datetime().optional()
});

// Order update schema (for status and fulfillment date)
export const updateOrderSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'fulfilled', 'cancelled'], {
    message: 'Estado inválido'
  }).optional(),
  fulfillmentDate: z.string().datetime().optional()
});

// Order query parameters schema
export const orderQuerySchema = z.object({
  productId: z.string().optional(),
  status: z.enum(['pending', 'confirmed', 'fulfilled', 'cancelled']).optional()
});

// Order ID parameter schema
export const orderIdSchema = z.object({
  id: z.string().min(1, 'ID del pedido requerido')
});

// Legacy order form schema for backward compatibility
export const orderSchema = z.object({
  name: z.string()
    .min(2, 'Nombre debe tener al menos 2 caracteres')
    .max(50, 'Nombre no puede exceder 50 caracteres')
    .trim(),
  email: z.string()
    .email('Formato de email inválido')
    .max(254, 'Email demasiado largo')
    .toLowerCase()
    .trim(),
  phone: z.string()
    .regex(/^[+]?[\d\s-()]{9,15}$/, 'Formato de teléfono inválido')
    .trim(),
  items: z.array(z.object({
    id: z.string(),
    name: z.string(),
    price: z.number().positive(),
    quantity: z.number().int().positive().max(10),
    size: z.string().optional()
  })).min(1, 'Debe seleccionar al menos un artículo'),
  notes: z.string()
    .max(500, 'Notas no pueden exceder 500 caracteres')
    .trim()
    .optional()
    .or(z.literal(''))
});

// Export TypeScript types
export type CreateOrderData = z.infer<typeof createOrderSchema>;
export type UpdateOrderData = z.infer<typeof updateOrderSchema>;
export type OrderQueryParams = z.infer<typeof orderQuerySchema>;
export type OrderIdParams = z.infer<typeof orderIdSchema>;
export type OrderInput = z.infer<typeof orderSchema>;