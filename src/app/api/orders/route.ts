import { createApiHandler } from '@/lib/apiUtils';
import { promises as fs } from 'fs';
import path from 'path';
import { createOrderSchema, updateOrderSchema, orderQuerySchema, orderIdSchema } from '@/lib/schemas/orders';

interface Order {
  id: string;
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  totalPrice: number;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    contactMethod: 'email' | 'whatsapp';
  };
  orderDetails: {
    size?: string;
    message: string;
  };
  isPreOrder: boolean;
  status: 'pending' | 'confirmed' | 'fulfilled' | 'cancelled';
  timestamp: string;
  fulfillmentDate?: string;
}

const ordersFile = path.join(process.cwd(), 'data', 'orders.json');

async function getOrders(): Promise<Order[]> {
  try {
    await fs.access(ordersFile);
    const data = await fs.readFile(ordersFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading orders data:', error);
    // Orders file not found or other error, return empty array
    return [];
  }
}

async function saveOrders(orders: Order[]): Promise<void> {
  await fs.mkdir(path.dirname(ordersFile), { recursive: true });
  await fs.writeFile(ordersFile, JSON.stringify(orders, null, 2));
}

export const GET = createApiHandler({
  auth: 'none',
  handler: async (_, context) => {
    const orders = await getOrders();
    const { searchParams } = new URL(context.request.url);
    
    // Validate query parameters
    const queryParams = orderQuerySchema.parse({
      productId: searchParams.get('productId'),
      status: searchParams.get('status')
    });
    const { productId, status } = queryParams;

    let filteredOrders = orders;

    if (productId) {
      filteredOrders = filteredOrders.filter(order => order.productId === productId);
    }

    if (status) {
      filteredOrders = filteredOrders.filter(order => order.status === status);
    }

    // Sort by timestamp, newest first
    filteredOrders.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return filteredOrders;
  }
});

export const POST = createApiHandler({
  auth: 'none',
  schema: createOrderSchema,
  handler: async (validatedData, context) => {
    const orders = await getOrders();
    
    const newOrder: Order = {
      id: Date.now().toString(),
      productId: validatedData.productId,
      productName: validatedData.productName,
      price: validatedData.price,
      quantity: validatedData.quantity,
      totalPrice: validatedData.totalPrice,
      customerInfo: {
        name: validatedData.customerInfo.name,
        email: validatedData.customerInfo.email,
        phone: validatedData.customerInfo.phone || '',
        contactMethod: validatedData.customerInfo.contactMethod
      },
      orderDetails: {
        size: validatedData.orderDetails?.size || '',
        message: validatedData.orderDetails?.message || ''
      },
      isPreOrder: validatedData.isPreOrder,
      status: 'pending',
      timestamp: validatedData.timestamp || new Date().toISOString()
    };

    orders.push(newOrder);
    await saveOrders(orders);

    return {
      success: true,
      message: 'Pedido creado exitosamente',
      data: newOrder
    };
  }
});

export const PUT = createApiHandler({
  auth: 'none', // Should be admin later
  schema: updateOrderSchema,
  handler: async (validatedData, context) => {
    const { searchParams } = new URL(context.request.url);
    const { id: orderId } = orderIdSchema.parse({ id: searchParams.get('id') });
    
    const orders = await getOrders();
    const orderIndex = orders.findIndex(order => order.id === orderId);

    if (orderIndex === -1) {
      throw new Error('Pedido no encontrado');
    }

    // Update allowed fields
    const updatedOrder = { ...orders[orderIndex] };
    
    if (validatedData.status !== undefined) {
      updatedOrder.status = validatedData.status;
    }
    if (validatedData.fulfillmentDate !== undefined) {
      updatedOrder.fulfillmentDate = validatedData.fulfillmentDate;
    }

    orders[orderIndex] = updatedOrder;
    await saveOrders(orders);

    return {
      success: true,
      message: 'Pedido actualizado exitosamente',
      data: updatedOrder
    };
  }
});

export const DELETE = createApiHandler({
  auth: 'none', // Should be admin later
  handler: async (_, context) => {
    const { searchParams } = new URL(context.request.url);
    const { id: orderId } = orderIdSchema.parse({ id: searchParams.get('id') });

    const orders = await getOrders();
    const orderIndex = orders.findIndex(order => order.id === orderId);

    if (orderIndex === -1) {
      throw new Error('Pedido no encontrado');
    }

    orders.splice(orderIndex, 1);
    await saveOrders(orders);

    return { 
      success: true,
      message: 'Pedido eliminado correctamente' 
    };
  }
});
