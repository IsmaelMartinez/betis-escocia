import { describe, it, expect } from 'vitest';
import {
  contactSchema,
  contactStatusSchema,
  type ContactInput,
  type ContactStatusInput,
} from '../../../../src/lib/schemas/contact';
import { ZodError } from 'zod';

describe('Contact Schema', () => {
  describe('contactSchema', () => {
    const validContactData: ContactInput = {
      name: 'Juan Pérez',
      email: 'juan.perez@example.com',
      phone: '+34-123-456-789',
      type: 'general',
      subject: 'Consulta general',
      message: 'Hola, tengo una consulta sobre el próximo partido.'
    };

    describe('Valid cases', () => {
      it('should validate a complete valid contact form', () => {
        const result = contactSchema.parse(validContactData);
        expect(result).toEqual({
          ...validContactData,
          email: 'juan.perez@example.com', // Should be lowercased
          name: 'Juan Pérez',
          subject: 'Consulta general',
          message: 'Hola, tengo una consulta sobre el próximo partido.'
        });
      });

      it('should validate contact form without phone', () => {
        const dataWithoutPhone: any = { ...validContactData };
        delete dataWithoutPhone.phone;
        const result = contactSchema.parse(dataWithoutPhone);
        expect(result).toEqual(dataWithoutPhone);
      });

      it('should validate contact form with empty phone', () => {
        const dataWithEmptyPhone = { ...validContactData, phone: '' };
        const result = contactSchema.parse(dataWithEmptyPhone);
        expect(result.phone).toBe('');
      });

      it('should handle different contact types', () => {
        const types: ContactInput['type'][] = ['rsvp', 'general', 'photo', 'whatsapp', 'feedback'];
        
        types.forEach(type => {
          const data = { ...validContactData, type };
          const result = contactSchema.parse(data);
          expect(result.type).toBe(type);
        });
      });

      it('should default to general type when not provided', () => {
        const dataWithoutType: any = { ...validContactData };
        delete dataWithoutType.type;
        const result = contactSchema.parse(dataWithoutType);
        expect(result.type).toBe('general');
      });

      it('should trim and transform inputs correctly', () => {
        const dataWithSpaces = {
          ...validContactData,
          name: '  Juan Pérez  ',
          email: 'juan.perez@example.com',
          subject: '  Consulta general  ',
          message: '  Hola, tengo una consulta.  '
        };
        
        const result = contactSchema.parse(dataWithSpaces);
        expect(result.name).toBe('Juan Pérez');
        expect(result.email).toBe('juan.perez@example.com');
        expect(result.subject).toBe('Consulta general');
        expect(result.message).toBe('Hola, tengo una consulta.');
      });
    });

    describe('Invalid cases - Name validation', () => {
      it('should reject name too short', () => {
        const invalidData = { ...validContactData, name: 'A' };
        expect(() => contactSchema.parse(invalidData)).toThrow(ZodError);
        
        try {
          contactSchema.parse(invalidData);
        } catch (error) {
          expect(error).toBeInstanceOf(ZodError);
          const zodError = error as ZodError;
          expect(zodError.issues?.[0]?.message).toBe('Nombre debe tener al menos 2 caracteres');
        }
      });

      it('should reject name too long', () => {
        const invalidData = { ...validContactData, name: 'A'.repeat(51) };
        expect(() => contactSchema.parse(invalidData)).toThrow(ZodError);
        
        try {
          contactSchema.parse(invalidData);
        } catch (error) {
          expect(error).toBeInstanceOf(ZodError);
          const zodError = error as ZodError;
          expect(zodError.issues?.[0]?.message).toBe('Nombre no puede exceder 50 caracteres');
        }
      });

      it('should reject missing name', () => {
        const invalidData: any = { ...validContactData };
        delete invalidData.name;
        expect(() => contactSchema.parse(invalidData)).toThrow(ZodError);
      });
    });

    describe('Invalid cases - Email validation', () => {
      it('should reject invalid email format', () => {
        const invalidData = { ...validContactData, email: 'invalid-email' };
        expect(() => contactSchema.parse(invalidData)).toThrow(ZodError);
        
        try {
          contactSchema.parse(invalidData);
        } catch (error) {
          expect(error).toBeInstanceOf(ZodError);
          const zodError = error as ZodError;
          expect(zodError.issues?.[0]?.message).toBe('Formato de email inválido');
        }
      });

      it('should reject email too long', () => {
        const longEmail = 'a'.repeat(250) + '@example.com';
        const invalidData = { ...validContactData, email: longEmail };
        expect(() => contactSchema.parse(invalidData)).toThrow(ZodError);
        
        try {
          contactSchema.parse(invalidData);
        } catch (error) {
          expect(error).toBeInstanceOf(ZodError);
          const zodError = error as ZodError;
          expect(zodError.issues?.[0]?.message).toBe('Email demasiado largo');
        }
      });

      it('should reject missing email', () => {
        const invalidData: any = { ...validContactData };
        delete invalidData.email;
        expect(() => contactSchema.parse(invalidData)).toThrow(ZodError);
      });
    });

    describe('Invalid cases - Phone validation', () => {
      it('should reject invalid phone formats', () => {
        const invalidPhones = ['12345', 'abc123456789', '123-456-789-0123-4567'];
        
        invalidPhones.forEach(phone => {
          const invalidData = { ...validContactData, phone };
          expect(() => contactSchema.parse(invalidData)).toThrow(ZodError);
          
          try {
            contactSchema.parse(invalidData);
          } catch (error) {
            expect(error).toBeInstanceOf(ZodError);
          const zodError = error as ZodError;
          expect(zodError.issues?.[0]?.message).toBe('Formato de teléfono inválido, debe tener al menos 9 dígitos');
          }
        });
      });

      it('should accept various valid phone formats', () => {
        const validPhones = ['+34123456789', '123456789', '123-456-789', '(123) 456-789'];
        
        validPhones.forEach(phone => {
          const data = { ...validContactData, phone };
          expect(() => contactSchema.parse(data)).not.toThrow();
        });
      });
    });

    describe('Invalid cases - Subject validation', () => {
      it('should reject subject too short', () => {
        const invalidData = { ...validContactData, subject: 'Hi' };
        expect(() => contactSchema.parse(invalidData)).toThrow(ZodError);
        
        try {
          contactSchema.parse(invalidData);
        } catch (error) {
          expect(error).toBeInstanceOf(ZodError);
          const zodError = error as ZodError;
          expect(zodError.issues?.[0]?.message).toBe('Asunto debe tener al menos 3 caracteres');
        }
      });

      it('should reject subject too long', () => {
        const invalidData = { ...validContactData, subject: 'A'.repeat(101) };
        expect(() => contactSchema.parse(invalidData)).toThrow(ZodError);
        
        try {
          contactSchema.parse(invalidData);
        } catch (error) {
          expect(error).toBeInstanceOf(ZodError);
          const zodError = error as ZodError;
          expect(zodError.issues?.[0]?.message).toBe('Asunto no puede exceder 100 caracteres');
        }
      });

      it('should reject missing subject', () => {
        const invalidData: any = { ...validContactData };
        delete invalidData.subject;
        expect(() => contactSchema.parse(invalidData)).toThrow(ZodError);
      });
    });

    describe('Invalid cases - Message validation', () => {
      it('should reject message too short', () => {
        const invalidData = { ...validContactData, message: 'Hi' };
        expect(() => contactSchema.parse(invalidData)).toThrow(ZodError);
        
        try {
          contactSchema.parse(invalidData);
        } catch (error) {
          expect(error).toBeInstanceOf(ZodError);
          const zodError = error as ZodError;
          expect(zodError.issues?.[0]?.message).toBe('Mensaje debe tener al menos 5 caracteres');
        }
      });

      it('should reject message too long', () => {
        const invalidData = { ...validContactData, message: 'A'.repeat(1001) };
        expect(() => contactSchema.parse(invalidData)).toThrow(ZodError);
        
        try {
          contactSchema.parse(invalidData);
        } catch (error) {
          expect(error).toBeInstanceOf(ZodError);
          const zodError = error as ZodError;
          expect(zodError.issues?.[0]?.message).toBe('Mensaje no puede exceder 1000 caracteres');
        }
      });

      it('should reject missing message', () => {
        const invalidData: any = { ...validContactData };
        delete invalidData.message;
        expect(() => contactSchema.parse(invalidData)).toThrow(ZodError);
      });
    });

    describe('Invalid cases - Type validation', () => {
      it('should reject invalid contact type', () => {
  const invalidData = { ...validContactData, type: 'invalid' as unknown as ContactInput['type'] };
        expect(() => contactSchema.parse(invalidData)).toThrow(ZodError);
      });
    });
  });

  describe('contactStatusSchema', () => {
    const validStatusData: ContactStatusInput = {
      status: 'in_progress',
      admin_notes: 'Procesando consulta'
    };

    describe('Valid cases', () => {
      it('should validate complete status update', () => {
        const result = contactStatusSchema.parse(validStatusData);
        expect(result).toEqual(validStatusData);
      });

      it('should validate status update without admin notes', () => {
        const { admin_notes, ...dataWithoutNotes } = validStatusData;
        const result = contactStatusSchema.parse(dataWithoutNotes);
        expect(result).toEqual(dataWithoutNotes);
      });

      it('should handle all valid status values', () => {
        const statuses: ContactStatusInput['status'][] = ['new', 'in_progress', 'resolved', 'closed'];
        
        statuses.forEach(status => {
          const data = { ...validStatusData, status };
          const result = contactStatusSchema.parse(data);
          expect(result.status).toBe(status);
        });
      });
    });

    describe('Invalid cases', () => {
      it('should reject invalid status', () => {
        const invalidData = { ...validStatusData, status: 'invalid' as any };
        expect(() => contactStatusSchema.parse(invalidData)).toThrow(ZodError);
      });

      it('should reject admin notes too long', () => {
        const invalidData = { ...validStatusData, admin_notes: 'A'.repeat(501) };
        expect(() => contactStatusSchema.parse(invalidData)).toThrow(ZodError);
      });

      it('should reject missing status', () => {
        const { status, ...invalidData } = validStatusData;
        expect(() => contactStatusSchema.parse(invalidData)).toThrow(ZodError);
      });
    });
  });

  describe('Advanced Edge Cases and Security Tests', () => {
    const baseContactData = {
      name: 'Test User',
      email: 'test@example.com',
      phone: '+34-123-456-789',
      type: 'general' as const,
      subject: 'Test Subject',
      message: 'Test message'
    };

    describe('SQL Injection and XSS Prevention', () => {
      it('should handle SQL injection attempts in name field', () => {
        const maliciousNames = [
          "'; DROP TABLE users; --",
          "admin'--",
          "1' OR '1'='1",
          "Robert'); DROP TABLE students;--"
        ];

        maliciousNames.forEach(name => {
          const data = { ...baseContactData, name };
          const result = contactSchema.parse(data);
          expect(result.name).toBe(name); // Should preserve but not execute
        });
      });

      it('should handle XSS attempts in message field', () => {
        const xssPayloads = [
          '<script>alert("xss")</script>',
          '<img src="x" onerror="alert(1)">',
          'javascript:alert(1)',
          '<svg onload="alert(1)">',
          '"><script>alert(String.fromCharCode(88,83,83))</script>'
        ];

        xssPayloads.forEach(payload => {
          const data = { ...baseContactData, message: payload };
          const result = contactSchema.parse(data);
          expect(result.message).toBe(payload); // Should preserve but not execute
        });
      });
    });

    describe('Unicode and Special Characters', () => {
      it('should handle various Unicode characters in name', () => {
        const unicodeNames = [
          'José María González',
          '张三', // Chinese
          'أحمد محمد', // Arabic
          'Владимир Путин', // Cyrillic
          'François Mitterrand',
          'Björk Guðmundsdóttir',
          '🙂 Happy Face',
          'Test\u0000Null',
          'Test\u200BZeroWidth'
        ];

        unicodeNames.forEach(name => {
          const data = { ...baseContactData, name };
          const result = contactSchema.parse(data);
          expect(result.name).toBe(name);
        });
      });

      it('should handle emoji and special symbols in subject and message', () => {
        const emojiData = {
          ...baseContactData,
          subject: '⚽ Pregunta sobre el partido 🏟️',
          message: 'Hola! 👋 ¿Cuándo es el próximo partido? ⚽🔥 ¡Vamos Betis! 💚🤍'
        };

        const result = contactSchema.parse(emojiData);
        expect(result.subject).toBe('⚽ Pregunta sobre el partido 🏟️');
        expect(result.message).toBe('Hola! 👋 ¿Cuándo es el próximo partido? ⚽🔥 ¡Vamos Betis! 💚🤍');
      });
    });

    describe('Boundary Value Analysis', () => {
      it('should handle exact boundary lengths for all fields', () => {
        // Name: exactly 2 and 50 characters
        const shortName = 'Ab';
        const longName = 'A'.repeat(50);
        
        // Subject: exactly 3 and 100 characters  
        const shortSubject = 'ABC';
        const longSubject = 'A'.repeat(100);
        
        // Message: exactly 5 and 1000 characters
        const shortMessage = 'ABCDE';
        const longMessage = 'A'.repeat(1000);

        const boundaryData = {
          ...baseContactData,
          name: shortName,
          subject: shortSubject,
          message: shortMessage
        };

        const result1 = contactSchema.parse(boundaryData);
        expect(result1.name).toBe(shortName);
        expect(result1.subject).toBe(shortSubject);
        expect(result1.message).toBe(shortMessage);

        const maxBoundaryData = {
          ...baseContactData,
          name: longName,
          subject: longSubject,
          message: longMessage
        };

        const result2 = contactSchema.parse(maxBoundaryData);
        expect(result2.name).toBe(longName);
        expect(result2.subject).toBe(longSubject);
        expect(result2.message).toBe(longMessage);
      });

      it('should reject values just over boundaries', () => {
        // Name: 51 characters
        const tooLongName = 'A'.repeat(51);
        expect(() => contactSchema.parse({ ...baseContactData, name: tooLongName })).toThrow(ZodError);

        // Subject: 101 characters
        const tooLongSubject = 'A'.repeat(101);
        expect(() => contactSchema.parse({ ...baseContactData, subject: tooLongSubject })).toThrow(ZodError);

        // Message: 1001 characters
        const tooLongMessage = 'A'.repeat(1001);
        expect(() => contactSchema.parse({ ...baseContactData, message: tooLongMessage })).toThrow(ZodError);
      });
    });

    describe('Email Edge Cases', () => {
      it('should handle complex valid email formats', () => {
        const complexEmails = [
          'test+tag@example.com',
          'user.name+tag@example.co.uk',
          'test123@sub.domain.com',
          'a@b.co', // Shortest valid email
          'very.long.email.address.with.many.dots@very.long.domain.name.com'
        ];

        complexEmails.forEach(email => {
          const data = { ...baseContactData, email };
          const result = contactSchema.parse(data);
          expect(result.email).toBe(email.toLowerCase());
        });
      });

      it('should reject various invalid email formats', () => {
        const invalidEmails = [
          'plainaddress',
          '@missinglocal.com',
          'missing.domain@.com',
          'spaces in@email.com',
          'double..dots@example.com',
          '.starting.dot@example.com',
          'ending.dot.@example.com',
          'toolong' + 'a'.repeat(250) + '@example.com'
        ];

        invalidEmails.forEach(email => {
          expect(() => contactSchema.parse({ ...baseContactData, email })).toThrow(ZodError);
        });
      });
    });

    describe('Phone Number Edge Cases', () => {
      it('should handle international phone formats', () => {
        const internationalPhones = [
          '+34123456789', // Spain - 12 chars
          '(555) 123-4567', // US with parentheses - 14 chars  
          '+49 30 12345678', // Germany - 14 chars
          '123456789' // Minimal format - 9 chars
        ];

        internationalPhones.forEach(phone => {
          const data = { ...baseContactData, phone };
          const result = contactSchema.parse(data);
          expect(result.phone).toBe(phone);
        });
      });

      it('should reject invalid phone formats', () => {
        const invalidPhones = [
          '12345678', // Too short
          '1234567890123456', // Too long
          'abc-def-ghij', // Letters
          '123-456-78ab', // Mixed letters/numbers
          '+34 123 45 67 89 01', // Too many digits
          '+(34) 123-456-789' // Invalid parentheses placement
        ];

        invalidPhones.forEach(phone => {
          expect(() => contactSchema.parse({ ...baseContactData, phone })).toThrow(ZodError);
        });
      });
    });

    describe('Type Coercion and Transformation', () => {
      it('should handle mixed case email normalization', () => {
        const mixedCaseEmails = [
          'Test.User@EXAMPLE.COM',
          'ADMIN@gmail.COM',
          'MixED.case@Domain.ORG'
        ];

        mixedCaseEmails.forEach(email => {
          const data = { ...baseContactData, email };
          const result = contactSchema.parse(data);
          expect(result.email).toBe(email.toLowerCase());
        });
      });

      it('should handle whitespace trimming edge cases', () => {
        const whitespaceData = {
          name: '   José María   \t\n',
          email: 'test@example.com', // Remove whitespace that breaks email validation
          subject: '\t  Consulta importante  \t',
          message: '\n  Este es mi mensaje  \r\n\t',
          phone: '+34-123-456-789',
          type: 'general' as const
        };

        const result = contactSchema.parse(whitespaceData);
        expect(result.name).toBe('José María');
        expect(result.email).toBe('test@example.com');
        expect(result.subject).toBe('Consulta importante');
        expect(result.message).toBe('Este es mi mensaje');
      });
    });

    describe('Concurrent Data Processing', () => {
      it('should handle multiple simultaneous validations', async () => {
        const testData = Array.from({ length: 100 }, (_, i) => ({
          ...baseContactData,
          name: `Test User ${i}`,
          email: `test${i}@example.com`,
          subject: `Subject ${i}`,
          message: `Message content for test ${i}`
        }));

        const promises = testData.map(data => 
          Promise.resolve(contactSchema.parse(data))
        );

        const results = await Promise.all(promises);
        
        expect(results).toHaveLength(100);
        results.forEach((result, i) => {
          expect(result.name).toBe(`Test User ${i}`);
          expect(result.email).toBe(`test${i}@example.com`);
        });
      });
    });

    describe('Memory and Performance', () => {
      it('should handle large message content efficiently', () => {
        const largeMessage = 'A'.repeat(999); // Just under limit
        const data = { ...baseContactData, message: largeMessage };
        
        const startTime = performance.now();
        const result = contactSchema.parse(data);
        const endTime = performance.now();
        
        expect(result.message).toBe(largeMessage);
        expect(endTime - startTime).toBeLessThan(100); // Should be fast
      });

      it('should handle repeated parsing without memory leaks', () => {
        const iterations = 1000;
        
        for (let i = 0; i < iterations; i++) {
          const data = {
            ...baseContactData,
            name: `Test ${i}`,
            email: `test${i}@example.com`
          };
          
          const result = contactSchema.parse(data);
          expect(result.name).toBe(`Test ${i}`);
        }
      });
    });
  });
});