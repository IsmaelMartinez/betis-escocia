import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { createOrderSchema, updateOrderSchema, orderQuerySchema, orderIdSchema } from '@/lib/schemas/orders';
import { ZodError } from 'zod';

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

export async function GET(request: NextRequest) {
  try {
    const orders = await getOrders();
    const { searchParams } = new URL(request.url);
    
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

    return NextResponse.json(filteredOrders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    
    // Handle Zod validation errors
    if (error instanceof ZodError) {
      const errorMessages = error.issues.map(issue => issue.message);
      return NextResponse.json({
        error: 'Parámetros de consulta inválidos',
        details: errorMessages
      }, { status: 400 });
    }
    
    // Provide more specific error messages
    let errorMessage = 'Error al cargar los pedidos';
    
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === 'ENOENT') {
        errorMessage = 'No se encontraron pedidos previos';
      } else if (error.code === 'EACCES') {
        errorMessage = 'Error de permisos al acceder a los datos de pedidos';
      }
    } else if (error instanceof SyntaxError) {
      errorMessage = 'Error en el formato de los datos de pedidos';
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const orderData = await request.json();
    
    // Validate input using Zod schema
    const validatedData = createOrderSchema.parse(orderData);

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

    console.log('New order created:', {
      id: newOrder.id,
      product: newOrder.productName,
      customer: newOrder.customerInfo.name,
      isPreOrder: newOrder.isPreOrder
    });

    return NextResponse.json(newOrder, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    
    // Handle Zod validation errors
    if (error instanceof ZodError) {
      const errorMessages = error.issues.map(issue => issue.message);
      return NextResponse.json({
        error: 'Datos del pedido inválidos',
        details: errorMessages
      }, { status: 400 });
    }
    
    // Provide more specific error messages
    let errorMessage = 'Error interno al procesar tu pedido';
    
    if (error instanceof SyntaxError) {
      errorMessage = 'Los datos del pedido no son válidos. Por favor, revisa la información.';
    } else if (error && typeof error === 'object' && 'code' in error && (error.code === 'ENOENT' || error.code === 'EACCES')) {
      errorMessage = 'Error de almacenamiento. Por favor, inténtalo de nuevo.';
    } else if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string' && error.message.includes('space')) {
      errorMessage = 'Error de espacio de almacenamiento. Contacta al administrador.';
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const updateData = await request.json();
    const { searchParams } = new URL(request.url);
    
    // Validate order ID parameter
    const { id: orderId } = orderIdSchema.parse({ id: searchParams.get('id') });
    
    // Validate update data
    const validatedData = updateOrderSchema.parse(updateData);

    const orders = await getOrders();
    const orderIndex = orders.findIndex(order => order.id === orderId);

    if (orderIndex === -1) {
      return NextResponse.json(
        { error: 'Pedido no encontrado' },
        { status: 404 }
      );
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

    console.log('Order updated:', {
      id: updatedOrder.id,
      status: updatedOrder.status,
      fulfillmentDate: updatedOrder.fulfillmentDate
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order:', error);
    
    // Handle Zod validation errors
    if (error instanceof ZodError) {
      const errorMessages = error.issues.map(issue => issue.message);
      return NextResponse.json({
        error: 'Datos de actualización inválidos',
        details: errorMessages
      }, { status: 400 });
    }
    
    // Provide more specific error messages
    let errorMessage = 'Error al actualizar el estado del pedido';
    
    if (error instanceof SyntaxError) {
      errorMessage = 'Los datos de actualización no son válidos';
    } else if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === 'ENOENT') {
        errorMessage = 'No se encontraron los datos del pedido';
      } else if (error.code === 'EACCES') {
        errorMessage = 'Error de permisos al actualizar el pedido';
      }
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Validate order ID parameter
    const { id: orderId } = orderIdSchema.parse({ id: searchParams.get('id') });

    const orders = await getOrders();
    const orderIndex = orders.findIndex(order => order.id === orderId);

    if (orderIndex === -1) {
      return NextResponse.json(
        { error: 'Pedido no encontrado' },
        { status: 404 }
      );
    }

    const deletedOrder = orders.splice(orderIndex, 1)[0];
    await saveOrders(orders);

    console.log('Order deleted:', {
      id: deletedOrder.id,
      product: deletedOrder.productName,
      customer: deletedOrder.customerInfo.name
    });

    return NextResponse.json({ message: 'Pedido eliminado correctamente' });
  } catch (error) {
    console.error('Error deleting order:', error);
    
    // Handle Zod validation errors
    if (error instanceof ZodError) {
      const errorMessages = error.issues.map(issue => issue.message);
      return NextResponse.json({
        error: 'Parámetros inválidos',
        details: errorMessages
      }, { status: 400 });
    }
    
    // Provide more specific error messages
    let errorMessage = 'Error al eliminar el pedido';
    
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === 'ENOENT') {
        errorMessage = 'No se encontraron los datos del pedido a eliminar';
      } else if (error.code === 'EACCES') {
        errorMessage = 'Error de permisos al eliminar el pedido';
      }
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
