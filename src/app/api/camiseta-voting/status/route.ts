import { createApiHandler } from '@/lib/apiUtils';
import { 
  readVotingDataOrCreate, 
  sanitizeVotingData 
} from '@/lib/camiseta-voting-utils';

export const GET = createApiHandler({
  auth: 'none',
  handler: async () => {
    try {
      const data = readVotingDataOrCreate();
      return sanitizeVotingData(data);
      
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error) {
        if (error.code === 'EACCES') {
          throw new Error('Error de permisos al acceder a los datos de votación.');
        }
      }
      
      if (error instanceof SyntaxError) {
        throw new Error('Error en el formato de los datos de votación.');
      }
      
      throw new Error('Error al cargar los datos de votación.');
    }
  }
});