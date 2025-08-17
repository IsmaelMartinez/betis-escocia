import { createApiHandler } from '@/lib/apiUtils';
import { voteActionSchema } from '@/lib/schemas/voting';
import { 
  readVotingData, 
  writeVotingData, 
  type VotingOption, 
  type Voter
} from '@/lib/camiseta-voting-utils';

function readVotingDataForVote() {
  try {
    return readVotingData();
  } catch (error) {
    if (error instanceof Error && error.message === 'ENOENT') {
      throw new Error('No se encontraron datos de votación. La votación podría no estar inicializada.');
    }
    throw error;
  }
}

export const POST = createApiHandler({
  auth: 'none',
  schema: voteActionSchema.omit({ action: true }),
  handler: async (validatedData) => {
    const { designId, voter } = validatedData;
    
    try {
      const data = readVotingDataForVote();
      
      // Check if voting is active
      if (!data.voting.active) {
        throw new Error('La votación no está activa en este momento.');
      }
      
      // Check if voting period has ended
      const endDate = new Date(data.voting.endDate);
      if (new Date() > endDate) {
        throw new Error('El período de votación ha terminado.');
      }
      
      // Check if user already voted
      const alreadyVoted = data.voting.options.some((option: VotingOption) =>
        option.voters.some((v: Voter) => v.email === voter.email)
      );
      
      if (alreadyVoted) {
        throw new Error('Ya has votado anteriormente. Solo se permite un voto por persona.');
      }
      
      // Find the voting option
      const option = data.voting.options.find((opt: VotingOption) => opt.id === designId);
      if (!option) {
        throw new Error('El diseño seleccionado no existe. Por favor, recarga la página.');
      }
      
      // Add the vote
      option.votes += 1;
      option.voters.push({
        ...voter,
        votedAt: new Date().toISOString()
      });
      
      // Update totals
      data.voting.totalVotes += 1;
      data.stats.totalInteractions += 1;
      
      // Save data
      writeVotingData(data);
      
      return {
        success: true,
        message: 'Voto registrado correctamente',
        data: {
          totalVotes: data.voting.totalVotes,
          designVotes: option.votes,
          voterId: `vote_${Date.now()}`
        }
      };
      
    } catch (error) {
      // Handle file system errors
      if (error && typeof error === 'object' && 'code' in error) {
        if (error.code === 'ENOENT') {
          throw new Error('No se encontraron datos de votación. La votación podría no estar inicializada.');
        } else if (error.code === 'EACCES') {
          throw new Error('Error de permisos al acceder a los datos de votación.');
        } else if (error.code === 'ENOSPC') {
          throw new Error('Error de espacio de almacenamiento. Contacta al administrador.');
        }
      }
      
      // Re-throw validation errors and business logic errors
      throw error;
    }
  }
});