import { createApiHandler } from '@/lib/apiUtils';
import { votingRequestSchema } from '@/lib/schemas/voting';

/**
 * Legacy camiseta-voting endpoint for backward compatibility
 * 
 * This endpoint now redirects to the new focused endpoints:
 * - POST with action: 'vote' -> /api/camiseta-voting/vote
 * - POST with action: 'preOrder' -> /api/camiseta-voting/pre-order  
 * - GET -> /api/camiseta-voting/status
 * 
 * @deprecated Use the specific endpoints directly for new implementations
 */

// GET: Redirect to status endpoint
export const GET = createApiHandler({
  auth: 'none',
  handler: async (_, context) => {
    // Internally redirect to status endpoint
    const baseUrl = context.request.url.replace('/api/camiseta-voting', '');
    const statusUrl = `${baseUrl}/api/camiseta-voting/status`;
    
    try {
      const response = await fetch(statusUrl);
      const data = await response.json();
      return data;
    } catch {
      throw new Error('Error al cargar los datos de votación');
    }
  }
});

// POST: Route to appropriate endpoint based on action
export const POST = createApiHandler({
  auth: 'none',
  schema: votingRequestSchema,
  handler: async (validatedData, context) => {
    const baseUrl = context.request.url.replace('/api/camiseta-voting', '');
    
    try {
      let targetUrl: string;
      let requestBody: unknown;
      
      if (validatedData.action === 'vote') {
        targetUrl = `${baseUrl}/api/camiseta-voting/vote`;
        requestBody = {
          designId: validatedData.designId,
          voter: validatedData.voter
        };
      } else if (validatedData.action === 'preOrder') {
        targetUrl = `${baseUrl}/api/camiseta-voting/pre-order`;
        requestBody = {
          orderData: validatedData.orderData
        };
      } else {
        throw new Error('Acción no válida');
      }
      
      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al procesar la solicitud');
      }
      
      return data;
      
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error interno al procesar la solicitud');
    }
  }
});