import { createApiHandler } from '@/lib/apiUtils';
import { preOrderActionSchema } from '@/lib/schemas/voting';
import { 
  readVotingData, 
  writeVotingData, 
  type PreOrder
} from '@/lib/camiseta-voting-utils';

function readVotingDataForPreOrder() {
  try {
    return readVotingData();
  } catch (error) {
    if (error instanceof Error && error.message === 'ENOENT') {
      throw new Error('No se encontraron datos de pre-pedidos. El sistema podría no estar inicializado.');
    }
    throw error;
  }
}

export const POST = createApiHandler({
  auth: 'none',
  schema: preOrderActionSchema.omit({ action: true }),
  handler: async (validatedData) => {
    const { orderData } = validatedData;
    
    try {
      const data = readVotingDataForPreOrder();
      
      // Check if pre-orders are active
      if (!data.preOrders.active) {
        throw new Error('Los pre-pedidos no están activos en este momento.');
      }
      
      // Check if pre-order period has ended
      const endDate = new Date(data.preOrders.endDate);
      if (new Date() > endDate) {
        throw new Error('El período de pre-pedidos ha terminado.');
      }
      
      // Check if user already has a pre-order
      const existingOrder = data.preOrders.orders.find((order: PreOrder) => 
        order.email === orderData.email
      );
      
      if (existingOrder) {
        throw new Error('Ya tienes un pre-pedido registrado. Solo se permite un pre-pedido por persona.');
      }
      
      // Generate unique order ID
      const orderId = `preorder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Create the new order
      const newOrder: PreOrder = {
        id: orderId,
        ...orderData,
        submittedAt: new Date().toISOString(),
        status: 'pending'
      };
      
      // Add the pre-order
      data.preOrders.orders.push(newOrder);
      data.preOrders.totalOrders += 1;
      data.stats.totalInteractions += 1;
      
      // Save data
      writeVotingData(data);
      
      return {
        success: true,
        message: 'Pre-pedido registrado correctamente',
        data: {
          orderId: newOrder.id,
          totalOrders: data.preOrders.totalOrders,
          minimumOrders: data.preOrders.minimumOrders,
          progressPercentage: Math.round((data.preOrders.totalOrders / data.preOrders.minimumOrders) * 100)
        }
      };
      
    } catch (error) {
      // Handle file system errors
      if (error && typeof error === 'object' && 'code' in error) {
        if (error.code === 'ENOENT') {
          throw new Error('No se encontraron datos de pre-pedidos. El sistema podría no estar inicializado.');
        } else if (error.code === 'EACCES') {
          throw new Error('Error de permisos al acceder a los datos de pre-pedidos.');
        } else if (error.code === 'ENOSPC') {
          throw new Error('Error de espacio de almacenamiento. Contacta al administrador.');
        }
      }
      
      // Re-throw validation errors and business logic errors
      throw error;
    }
  }
});