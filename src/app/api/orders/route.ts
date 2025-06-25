import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

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
  } catch {
    // Orders file not found, return empty array
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
    const productId = searchParams.get('productId');
    const status = searchParams.get('status');

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
    return NextResponse.json(
      { error: 'Error al obtener los pedidos' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const orderData = await request.json();
    
    // Validate required fields
    if (!orderData.productId || !orderData.productName || !orderData.customerInfo?.name || !orderData.customerInfo?.email) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios' },
        { status: 400 }
      );
    }

    const orders = await getOrders();
    
    const newOrder: Order = {
      id: Date.now().toString(),
      productId: orderData.productId,
      productName: orderData.productName,
      price: orderData.price,
      quantity: orderData.quantity,
      totalPrice: orderData.totalPrice,
      customerInfo: {
        name: orderData.customerInfo.name,
        email: orderData.customerInfo.email,
        phone: orderData.customerInfo.phone || '',
        contactMethod: orderData.customerInfo.contactMethod || 'email'
      },
      orderDetails: {
        size: orderData.orderDetails?.size || '',
        message: orderData.orderDetails?.message || ''
      },
      isPreOrder: orderData.isPreOrder || false,
      status: 'pending',
      timestamp: orderData.timestamp || new Date().toISOString()
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
    return NextResponse.json(
      { error: 'Error al crear el pedido' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const updateData = await request.json();
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('id');

    if (!orderId) {
      return NextResponse.json(
        { error: 'ID del pedido requerido' },
        { status: 400 }
      );
    }

    const orders = await getOrders();
    const orderIndex = orders.findIndex(order => order.id === orderId);

    if (orderIndex === -1) {
      return NextResponse.json(
        { error: 'Pedido no encontrado' },
        { status: 404 }
      );
    }

    // Update allowed fields
    const allowedFields = ['status', 'fulfillmentDate'];
    const updatedOrder = { ...orders[orderIndex] };

    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        if (field === 'status') {
          updatedOrder.status = updateData[field];
        } else if (field === 'fulfillmentDate') {
          updatedOrder.fulfillmentDate = updateData[field];
        }
      }
    });

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
    return NextResponse.json(
      { error: 'Error al actualizar el pedido' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('id');

    if (!orderId) {
      return NextResponse.json(
        { error: 'ID del pedido requerido' },
        { status: 400 }
      );
    }

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
    return NextResponse.json(
      { error: 'Error al eliminar el pedido' },
      { status: 500 }
    );
  }
}
