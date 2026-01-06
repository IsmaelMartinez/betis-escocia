import { describe, it, expect } from 'vitest';
import { contactSchema } from '../../../../src/lib/schemas/contact';
import { rsvpSchema } from '../../../../src/lib/schemas/rsvp';
import { triviaScoreSchema } from '../../../../src/lib/schemas/trivia';
import { userUpdateSchema, matchSchema } from '../../../../src/lib/schemas/admin';
import { ZodError } from 'zod';

describe('Cross-Schema Integration Tests', () => {
  describe('User Journey Integration', () => {
    it('should validate complete user contact and RSVP flow', () => {
      const userEmail = 'juan.perez@example.com';
      const userName = 'Juan Pérez';

      // Step 1: User fills contact form
      const contactData = {
        name: userName,
        email: userEmail,
        subject: 'Información sobre eventos',
        message: 'Hola, me gustaría saber más sobre los eventos de la peña.'
      };

      const contactResult = contactSchema.parse(contactData);
      expect(contactResult.name).toBe(userName);
      expect(contactResult.email).toBe(userEmail);

      // Step 2: User makes RSVP for event
      const rsvpData = {
        name: userName,
        email: userEmail,
        attendees: 2,
        message: 'Confirmo asistencia con mi pareja',
        whatsappInterest: false
      };

      const rsvpResult = rsvpSchema.parse(rsvpData);
      expect(rsvpResult.name).toBe(userName);
      expect(rsvpResult.email).toBe(userEmail);
      expect(rsvpResult.attendees).toBe(2);
    });

    it('should validate trivia participation flow', () => {
      // User completes trivia
      const triviaData = {
        score: 80 // Score out of 100
      };

      const triviaResult = triviaScoreSchema.parse(triviaData);
      expect(triviaResult.score).toBe(80);
    });
  });

  describe('Admin Management Integration', () => {
    it('should validate admin user management and match creation', () => {
      // Admin creates match
      const matchData = {
        date_time: new Date().toISOString(),
        opponent: 'Sevilla FC',
        competition: 'La Liga',
        home_away: 'home' as const
      };

      const matchResult = matchSchema.parse(matchData);
      expect(matchResult.opponent).toBe('Sevilla FC');
      expect(matchResult.competition).toBe('La Liga');

      // Admin updates user
      const userUpdate = {
        userId: 'user_123',
        role: 'user' as const,
        banned: false
      };

      const userResult = userUpdateSchema.parse(userUpdate);
      expect(userResult.role).toBe('user');
      expect(userResult.banned).toBe(false);
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle validation errors consistently across schemas', () => {
      // Test consistent email validation
      const invalidEmail = 'not-an-email';

      expect(() => contactSchema.parse({
        name: 'Test User',
        email: invalidEmail,
        subject: 'Test',
        message: 'Test message'
      })).toThrow(ZodError);

      expect(() => rsvpSchema.parse({
        name: 'Test User',
        email: invalidEmail,
        attendees: 1,
        whatsappInterest: false
      })).toThrow(ZodError);

      // Trivia schema only has score field, no email validation needed
      expect(() => triviaScoreSchema.parse({
        score: -1 // Invalid score should fail
      })).toThrow(ZodError);
    });

    it('should handle required field validation consistently', () => {
      // Test required name validation
      expect(() => contactSchema.parse({
        name: '',
        email: 'test@example.com',
        subject: 'Test',
        message: 'Test message'
      })).toThrow(ZodError);

      expect(() => rsvpSchema.parse({
        name: '',
        email: 'test@example.com',
        attendees: 1,
        whatsappInterest: false
      })).toThrow(ZodError);
    });
  });
});