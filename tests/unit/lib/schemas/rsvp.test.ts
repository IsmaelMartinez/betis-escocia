import { describe, it, expect } from 'vitest';
import { 
  rsvpSchema, 
  rsvpQuerySchema, 
  rsvpDeleteSchema, 
  gdprSchema,
  type RSVPInput, 
  type RSVPQueryInput, 
  type RSVPDeleteInput,
  type GDPRInput 
} from '@/lib/schemas/rsvp';
import { ZodError } from 'zod';

describe('RSVP Schema', () => {
  describe('rsvpSchema', () => {
    const validRSVPData: RSVPInput = {
      name: 'María García',
      email: 'maria.garcia@example.com',
      attendees: 2,
      message: 'Esperamos con ganas el partido!',
      whatsappInterest: true,
      matchId: 123,
      userId: 'user_123'
    };

    describe('Valid cases', () => {
      it('should validate complete RSVP form', () => {
        const result = rsvpSchema.parse(validRSVPData);
        expect(result).toEqual({
          ...validRSVPData,
          email: 'maria.garcia@example.com' // Should be lowercased
        });
      });

      it('should validate RSVP without optional fields', () => {
        const minimalData = {
          name: 'María García',
          email: 'maria.garcia@example.com',
          attendees: 1
        };
        
        const result = rsvpSchema.parse(minimalData);
        expect(result.name).toBe('María García');
        expect(result.email).toBe('maria.garcia@example.com');
        expect(result.attendees).toBe(1);
        expect(result.whatsappInterest).toBe(false); // Default value
      });

      it('should handle empty message as optional', () => {
        const dataWithEmptyMessage = { ...validRSVPData, message: '' };
        const result = rsvpSchema.parse(dataWithEmptyMessage);
        expect(result.message).toBe('');
      });

      it('should trim and transform inputs correctly', () => {
        const dataWithSpaces = {
          ...validRSVPData,
          name: '  María García  ',
          email: 'maria.garcia@example.com',
          message: '  Esperamos el partido!  '
        };
        
        const result = rsvpSchema.parse(dataWithSpaces);
        expect(result.name).toBe('María García');
        expect(result.email).toBe('maria.garcia@example.com');
        expect(result.message).toBe('Esperamos el partido!');
      });

      it('should accept attendees from 1 to 10', () => {
        for (let i = 1; i <= 10; i++) {
          const data = { ...validRSVPData, attendees: i };
          expect(() => rsvpSchema.parse(data)).not.toThrow();
        }
      });
    });

    describe('Invalid cases - Name validation', () => {
      it('should reject name too short', () => {
        const invalidData = { ...validRSVPData, name: 'A' };
        expect(() => rsvpSchema.parse(invalidData)).toThrow(ZodError);
        
        try {
          rsvpSchema.parse(invalidData);
        } catch (error) {
          expect(error).toBeInstanceOf(ZodError);
          const zodError = error as ZodError;
          expect(zodError.issues?.[0]?.message).toBe('Nombre debe tener al menos 2 caracteres');
        }
      });

      it('should reject name too long', () => {
        const invalidData = { ...validRSVPData, name: 'A'.repeat(51) };
        expect(() => rsvpSchema.parse(invalidData)).toThrow(ZodError);
        
        try {
          rsvpSchema.parse(invalidData);
        } catch (error) {
          expect(error).toBeInstanceOf(ZodError);
          const zodError = error as ZodError;
          expect(zodError.issues?.[0]?.message).toBe('Nombre no puede exceder 50 caracteres');
        }
      });
    });

    describe('Invalid cases - Email validation', () => {
      it('should reject invalid email format', () => {
        const invalidData = { ...validRSVPData, email: 'invalid-email' };
        expect(() => rsvpSchema.parse(invalidData)).toThrow(ZodError);
        
        try {
          rsvpSchema.parse(invalidData);
        } catch (error) {
          expect(error).toBeInstanceOf(ZodError);
          const zodError = error as ZodError;
          expect(zodError.issues?.[0]?.message).toBe('Formato de email inválido');
        }
      });

      it('should reject email too long', () => {
        const longEmail = 'a'.repeat(250) + '@example.com';
        const invalidData = { ...validRSVPData, email: longEmail };
        expect(() => rsvpSchema.parse(invalidData)).toThrow(ZodError);
        
        try {
          rsvpSchema.parse(invalidData);
        } catch (error) {
          expect(error).toBeInstanceOf(ZodError);
          const zodError = error as ZodError;
          expect(zodError.issues?.[0]?.message).toBe('Email demasiado largo');
        }
      });
    });

    describe('Invalid cases - Attendees validation', () => {
      it('should reject attendees less than 1', () => {
        const invalidData = { ...validRSVPData, attendees: 0 };
        expect(() => rsvpSchema.parse(invalidData)).toThrow(ZodError);
        
        try {
          rsvpSchema.parse(invalidData);
        } catch (error) {
          expect(error).toBeInstanceOf(ZodError);
          const zodError = error as ZodError;
          expect(zodError.issues?.[0]?.message).toBe('Número de asistentes debe ser al menos 1');
        }
      });

      it('should reject attendees more than 10', () => {
        const invalidData = { ...validRSVPData, attendees: 11 };
        expect(() => rsvpSchema.parse(invalidData)).toThrow(ZodError);
        
        try {
          rsvpSchema.parse(invalidData);
        } catch (error) {
          expect(error).toBeInstanceOf(ZodError);
          const zodError = error as ZodError;
          expect(zodError.issues?.[0]?.message).toBe('Número de asistentes no puede exceder 10');
        }
      });

      it('should reject non-integer attendees', () => {
        const invalidData = { ...validRSVPData, attendees: 2.5 };
        expect(() => rsvpSchema.parse(invalidData)).toThrow(ZodError);
        
        try {
          rsvpSchema.parse(invalidData);
        } catch (error) {
          expect(error).toBeInstanceOf(ZodError);
          const zodError = error as ZodError;
          expect(zodError.issues?.[0]?.message).toBe('Número de asistentes debe ser un entero');
        }
      });
    });

    describe('Invalid cases - Message validation', () => {
      it('should reject message too long', () => {
        const invalidData = { ...validRSVPData, message: 'A'.repeat(501) };
        expect(() => rsvpSchema.parse(invalidData)).toThrow(ZodError);
        
        try {
          rsvpSchema.parse(invalidData);
        } catch (error) {
          expect(error).toBeInstanceOf(ZodError);
          const zodError = error as ZodError;
          expect(zodError.issues?.[0]?.message).toBe('Mensaje no puede exceder 500 caracteres');
        }
      });
    });

    describe('Invalid cases - Match ID validation', () => {
      it('should reject negative match ID', () => {
        const invalidData = { ...validRSVPData, matchId: -1 };
        expect(() => rsvpSchema.parse(invalidData)).toThrow(ZodError);
      });

      it('should reject non-integer match ID', () => {
        const invalidData = { ...validRSVPData, matchId: 123.45 };
        expect(() => rsvpSchema.parse(invalidData)).toThrow(ZodError);
      });
    });
  });

  describe('rsvpQuerySchema', () => {
    describe('Valid cases', () => {
      it('should parse valid match ID string', () => {
        const result = rsvpQuerySchema.parse({ match: '123' });
        expect(result.match).toBe(123);
      });

      it('should handle missing match parameter', () => {
        const result = rsvpQuerySchema.parse({});
        expect(result.match).toBeUndefined();
      });
    });

    describe('Invalid cases', () => {
      it('should handle non-numeric match parameter', () => {
        // This will parse 'abc' as NaN, which is valid according to the schema
        const result = rsvpQuerySchema.parse({ match: 'abc' });
        expect(isNaN(result.match!)).toBe(true);
      });
    });
  });

  describe('rsvpDeleteSchema', () => {
    describe('Valid cases', () => {
      it('should validate deletion with ID', () => {
        const result = rsvpDeleteSchema.parse({ id: '123' });
        expect(result.id).toBe(123);
      });

      it('should validate deletion with email', () => {
        const result = rsvpDeleteSchema.parse({ email: 'test@example.com' });
        expect(result.email).toBe('test@example.com');
      });

      it('should validate deletion with both ID and email', () => {
        const result = rsvpDeleteSchema.parse({ id: '123', email: 'test@example.com' });
        expect(result.id).toBe(123);
        expect(result.email).toBe('test@example.com');
      });
    });

    describe('Invalid cases', () => {
      it('should reject empty object', () => {
        expect(() => rsvpDeleteSchema.parse({})).toThrow(ZodError);
        
        try {
          rsvpDeleteSchema.parse({});
        } catch (error) {
          expect(error).toBeInstanceOf(ZodError);
          const zodError = error as ZodError;
          expect(zodError.issues?.[0]?.message).toBe('Either id or email must be provided');
        }
      });

      it('should reject invalid email format', () => {
        expect(() => rsvpDeleteSchema.parse({ email: 'invalid-email' })).toThrow(ZodError);
      });

      it('should reject non-numeric ID', () => {
        expect(() => rsvpDeleteSchema.parse({ id: 'abc' })).toThrow(ZodError);
      });
    });
  });

  describe('gdprSchema', () => {
    describe('Valid cases', () => {
      it('should validate access request', () => {
        const result = gdprSchema.parse({ requestType: 'access' });
        expect(result.requestType).toBe('access');
      });

      it('should validate deletion request', () => {
        const result = gdprSchema.parse({ requestType: 'deletion' });
        expect(result.requestType).toBe('deletion');
      });
    });

    describe('Invalid cases', () => {
      it('should reject invalid request type', () => {
        expect(() => gdprSchema.parse({ requestType: 'invalid' })).toThrow(ZodError);
        
        try {
          gdprSchema.parse({ requestType: 'invalid' });
        } catch (error) {
          expect(error).toBeInstanceOf(ZodError);
          const zodError = error as ZodError;
          expect(zodError.issues?.[0]?.message).toBe('Request type is required');
        }
      });

      it('should reject missing request type', () => {
        expect(() => gdprSchema.parse({})).toThrow(ZodError);
        
        try {
          gdprSchema.parse({});
        } catch (error) {
          expect(error).toBeInstanceOf(ZodError);
          const zodError = error as ZodError;
          expect(zodError.issues?.[0]?.message).toBe('Request type is required');
        }
      });
    });
  });
});