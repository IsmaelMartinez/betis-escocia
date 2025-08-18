import { describe, it, expect } from 'vitest';
import { 
  voterSchema,
  preOrderDataSchema,
  voteActionSchema,
  preOrderActionSchema,
  votingRequestSchema,
  camisetaVotingSchema,
  type VoterData,
  type PreOrderData,
  type VoteAction,
  type PreOrderAction,
  type VotingRequest,
  type CamisetaVotingInput
} from '@/lib/schemas/voting';
import { ZodError } from 'zod';

describe('Voting Schema', () => {
  describe('voterSchema', () => {
    const validVoterData: VoterData = {
      name: 'Carlos Ruiz',
      email: 'carlos.ruiz@example.com'
    };

    describe('Valid cases', () => {
      it('should validate complete voter data', () => {
        const result = voterSchema.parse(validVoterData);
        expect(result).toEqual({
          name: 'Carlos Ruiz',
          email: 'carlos.ruiz@example.com'
        });
      });

      it('should trim and transform inputs correctly', () => {
        const dataWithSpaces = {
          name: '  Carlos Ruiz  ',
          email: 'carlos.ruiz@example.com'
        };
        
        const result = voterSchema.parse(dataWithSpaces);
        expect(result.name).toBe('Carlos Ruiz');
        expect(result.email).toBe('carlos.ruiz@example.com');
      });
    });

    describe('Invalid cases', () => {
      it('should reject name too short', () => {
        const invalidData = { ...validVoterData, name: 'A' };
        expect(() => voterSchema.parse(invalidData)).toThrow(ZodError);
        
        try {
          voterSchema.parse(invalidData);
        } catch (error) {
          expect(error).toBeInstanceOf(ZodError);
          const zodError = error as ZodError;
          expect(zodError.issues?.[0]?.message).toBe('El nombre debe tener al menos 2 caracteres');
        }
      });

      it('should reject name too long', () => {
        const invalidData = { ...validVoterData, name: 'A'.repeat(51) };
        expect(() => voterSchema.parse(invalidData)).toThrow(ZodError);
        
        try {
          voterSchema.parse(invalidData);
        } catch (error) {
          expect(error).toBeInstanceOf(ZodError);
          const zodError = error as ZodError;
          expect(zodError.issues?.[0]?.message).toBe('El nombre es demasiado largo');
        }
      });

      it('should reject invalid email format', () => {
        const invalidData = { ...validVoterData, email: 'invalid-email' };
        expect(() => voterSchema.parse(invalidData)).toThrow(ZodError);
        
        try {
          voterSchema.parse(invalidData);
        } catch (error) {
          expect(error).toBeInstanceOf(ZodError);
          const zodError = error as ZodError;
          expect(zodError.issues?.[0]?.message).toBe('Email inválido');
        }
      });
    });
  });

  describe('preOrderDataSchema', () => {
    const validPreOrderData: PreOrderData = {
      name: 'Ana López',
      email: 'ana.lopez@example.com',
      phone: '+34-123-456-789',
      size: 'M',
      quantity: 2,
      preferredDesign: 'Design A',
      message: 'Por favor, confirmad cuando esté disponible'
    };

    describe('Valid cases', () => {
      it('should validate complete pre-order data', () => {
        const result = preOrderDataSchema.parse(validPreOrderData);
        expect(result.name).toBe('Ana López');
        expect(result.email).toBe('ana.lopez@example.com');
        expect(result.size).toBe('M');
        expect(result.quantity).toBe(2);
      });

      it('should validate pre-order without optional fields', () => {
        const minimalData = {
          name: 'Ana López',
          email: 'ana.lopez@example.com',
          size: 'M' as const,
          quantity: 1
        };
        
        const result = preOrderDataSchema.parse(minimalData);
        expect(result.name).toBe('Ana López');
        expect(result.size).toBe('M');
        expect(result.quantity).toBe(1);
      });

      it('should handle all valid sizes', () => {
        const sizes: PreOrderData['size'][] = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
        
        sizes.forEach(size => {
          const data = { ...validPreOrderData, size };
          const result = preOrderDataSchema.parse(data);
          expect(result.size).toBe(size);
        });
      });

      it('should handle quantities from 1 to 10', () => {
        for (let quantity = 1; quantity <= 10; quantity++) {
          const data = { ...validPreOrderData, quantity };
          const result = preOrderDataSchema.parse(data);
          expect(result.quantity).toBe(quantity);
        }
      });

      it('should handle empty phone and message', () => {
        const data = { ...validPreOrderData, phone: '', message: '' };
        const result = preOrderDataSchema.parse(data);
        expect(result.phone).toBe('');
        expect(result.message).toBe('');
      });
    });

    describe('Invalid cases', () => {
      it('should reject invalid size', () => {
        const invalidData = { ...validPreOrderData, size: 'XXXL' as any };
        expect(() => preOrderDataSchema.parse(invalidData)).toThrow(ZodError);
        
        try {
          preOrderDataSchema.parse(invalidData);
        } catch (error) {
          expect(error).toBeInstanceOf(ZodError);
          const zodError = error as ZodError;
          expect(zodError.issues?.[0]?.message).toBe('Talla inválida');
        }
      });

      it('should reject quantity 0 or negative', () => {
        const invalidQuantities = [0, -1, -5];
        
        invalidQuantities.forEach(quantity => {
          const invalidData = { ...validPreOrderData, quantity };
          expect(() => preOrderDataSchema.parse(invalidData)).toThrow(ZodError);
          
          try {
            preOrderDataSchema.parse(invalidData);
          } catch (error) {
            expect(error).toBeInstanceOf(ZodError);
          const zodError = error as ZodError;
          expect(zodError.issues?.[0]?.message).toBe('La cantidad debe ser positiva');
          }
        });
      });

      it('should reject quantity above 10', () => {
        const invalidData = { ...validPreOrderData, quantity: 11 };
        expect(() => preOrderDataSchema.parse(invalidData)).toThrow(ZodError);
        
        try {
          preOrderDataSchema.parse(invalidData);
        } catch (error) {
          expect(error).toBeInstanceOf(ZodError);
          const zodError = error as ZodError;
          expect(zodError.issues?.[0]?.message).toBe('Cantidad máxima es 10');
        }
      });

      it('should reject message too long', () => {
        const invalidData = { ...validPreOrderData, message: 'A'.repeat(501) };
        expect(() => preOrderDataSchema.parse(invalidData)).toThrow(ZodError);
        
        try {
          preOrderDataSchema.parse(invalidData);
        } catch (error) {
          expect(error).toBeInstanceOf(ZodError);
          const zodError = error as ZodError;
          expect(zodError.issues?.[0]?.message).toBe('Mensaje demasiado largo');
        }
      });
    });
  });

  describe('voteActionSchema', () => {
    const validVoteAction: VoteAction = {
      action: 'vote',
      designId: 'design_123',
      voter: {
        name: 'Pedro Martín',
        email: 'pedro.martin@example.com'
      }
    };

    describe('Valid cases', () => {
      it('should validate complete vote action', () => {
        const result = voteActionSchema.parse(validVoteAction);
        expect(result.action).toBe('vote');
        expect(result.designId).toBe('design_123');
        expect(result.voter.name).toBe('Pedro Martín');
      });
    });

    describe('Invalid cases', () => {
      it('should reject wrong action type', () => {
        const invalidData = { ...validVoteAction, action: 'preOrder' };
        expect(() => voteActionSchema.parse(invalidData)).toThrow(ZodError);
      });

      it('should reject empty design ID', () => {
        const invalidData = { ...validVoteAction, designId: '' };
        expect(() => voteActionSchema.parse(invalidData)).toThrow(ZodError);
        
        try {
          voteActionSchema.parse(invalidData);
        } catch (error) {
          expect(error).toBeInstanceOf(ZodError);
          const zodError = error as ZodError;
          expect(zodError.issues?.[0]?.message).toBe('ID del diseño requerido');
        }
      });

      it('should reject invalid voter data', () => {
        const invalidData = { ...validVoteAction, voter: { name: 'A', email: 'invalid' } };
        expect(() => voteActionSchema.parse(invalidData)).toThrow(ZodError);
      });
    });
  });

  describe('preOrderActionSchema', () => {
    const validPreOrderAction: PreOrderAction = {
      action: 'preOrder',
      orderData: {
        name: 'Laura Sánchez',
        email: 'laura.sanchez@example.com',
        size: 'L',
        quantity: 1
      }
    };

    describe('Valid cases', () => {
      it('should validate complete pre-order action', () => {
        const result = preOrderActionSchema.parse(validPreOrderAction);
        expect(result.action).toBe('preOrder');
        expect(result.orderData.name).toBe('Laura Sánchez');
        expect(result.orderData.size).toBe('L');
      });
    });

    describe('Invalid cases', () => {
      it('should reject wrong action type', () => {
        const invalidData = { ...validPreOrderAction, action: 'vote' };
        expect(() => preOrderActionSchema.parse(invalidData)).toThrow(ZodError);
      });

      it('should reject invalid order data', () => {
        const invalidData = { 
          ...validPreOrderAction, 
          orderData: { ...validPreOrderAction.orderData, quantity: -1 }
        };
        expect(() => preOrderActionSchema.parse(invalidData)).toThrow(ZodError);
      });
    });
  });

  describe('votingRequestSchema (discriminated union)', () => {
    describe('Valid cases', () => {
      it('should validate vote request', () => {
        const voteRequest: VotingRequest = {
          action: 'vote',
          designId: 'design_456',
          voter: {
            name: 'Miguel Torres',
            email: 'miguel.torres@example.com'
          }
        };
        
        const result = votingRequestSchema.parse(voteRequest);
        expect(result.action).toBe('vote');
        expect(result.designId).toBe('design_456');
      });

      it('should validate pre-order request', () => {
        const preOrderRequest: VotingRequest = {
          action: 'preOrder',
          orderData: {
            name: 'Sofia García',
            email: 'sofia.garcia@example.com',
            size: 'S',
            quantity: 3
          }
        };
        
        const result = votingRequestSchema.parse(preOrderRequest);
        expect(result.action).toBe('preOrder');
        expect(result.orderData.name).toBe('Sofia García');
      });
    });

    describe('Invalid cases', () => {
      it('should reject mixed action properties', () => {
        const invalidRequest = {
          action: 'vote',
          designId: 'design_123',
          orderData: { name: 'Test', email: 'test@example.com', size: 'M', quantity: 1 }
        };
        
        expect(() => votingRequestSchema.parse(invalidRequest)).toThrow(ZodError);
      });

      it('should reject invalid action type', () => {
        const invalidRequest = {
          action: 'invalid',
          designId: 'design_123'
        };
        
        expect(() => votingRequestSchema.parse(invalidRequest)).toThrow(ZodError);
      });
    });
  });

  describe('camisetaVotingSchema (legacy)', () => {
    const validLegacyVoting: CamisetaVotingInput = {
      name: 'Roberto Díaz',
      email: 'roberto.diaz@example.com',
      vote: 'A',
      comments: 'Me gusta este diseño'
    };

    describe('Valid cases', () => {
      it('should validate complete legacy voting data', () => {
        const result = camisetaVotingSchema.parse(validLegacyVoting);
        expect(result.name).toBe('Roberto Díaz');
        expect(result.email).toBe('roberto.diaz@example.com');
        expect(result.vote).toBe('A');
        expect(result.comments).toBe('Me gusta este diseño');
      });

      it('should validate legacy voting without comments', () => {
        const { comments, ...dataWithoutComments } = validLegacyVoting;
        const result = camisetaVotingSchema.parse(dataWithoutComments);
        expect(result.vote).toBe('A');
        expect(result.comments).toBeUndefined();
      });

      it('should handle all valid vote options', () => {
        const voteOptions: CamisetaVotingInput['vote'][] = ['A', 'B', 'C'];
        
        voteOptions.forEach(vote => {
          const data = { ...validLegacyVoting, vote };
          const result = camisetaVotingSchema.parse(data);
          expect(result.vote).toBe(vote);
        });
      });

      it('should handle empty comments', () => {
        const data = { ...validLegacyVoting, comments: '' };
        const result = camisetaVotingSchema.parse(data);
        expect(result.comments).toBe('');
      });
    });

    describe('Invalid cases', () => {
      it('should reject invalid vote option', () => {
        const invalidData = { ...validLegacyVoting, vote: 'D' as any };
        expect(() => camisetaVotingSchema.parse(invalidData)).toThrow(ZodError);
        
        try {
          camisetaVotingSchema.parse(invalidData);
        } catch (error) {
          expect(error).toBeInstanceOf(ZodError);
          const zodError = error as ZodError;
          expect(zodError.issues?.[0]?.message).toBe('Debe seleccionar una opción válida (A, B, o C)');
        }
      });

      it('should reject comments too long', () => {
        const invalidData = { ...validLegacyVoting, comments: 'A'.repeat(301) };
        expect(() => camisetaVotingSchema.parse(invalidData)).toThrow(ZodError);
        
        try {
          camisetaVotingSchema.parse(invalidData);
        } catch (error) {
          expect(error).toBeInstanceOf(ZodError);
          const zodError = error as ZodError;
          expect(zodError.issues?.[0]?.message).toBe('Comentarios no pueden exceder 300 caracteres');
        }
      });

      it('should reject missing required fields', () => {
        const { vote, ...invalidData } = validLegacyVoting;
        expect(() => camisetaVotingSchema.parse(invalidData)).toThrow(ZodError);
      });
    });
  });
});