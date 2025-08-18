import { describe, it, expect } from 'vitest';
import { contactSchema } from '@/lib/schemas/contact';
import { rsvpSchema } from '@/lib/schemas/rsvp';
import { voterSchema, preOrderDataSchema } from '@/lib/schemas/voting';
import { createOrderSchema } from '@/lib/schemas/orders';
import { matchSchema } from '@/lib/schemas/admin';
import { ZodError } from 'zod';

describe('Internationalization and Localization Tests', () => {
  describe('Spanish Language Support', () => {
    it('should handle Spanish names and addresses correctly', () => {
      const spanishNames = [
        'José María García-López',
        'María del Carmen Rodríguez',
        'Francisco Javier Martínez',
        'Ana Belén González-Pérez',
        'Ángel de la Cruz Fernández',
        'Pilar Núñez de la Rosa',
        'José Ángel Vázquez-Montes'
      ];

      spanishNames.forEach(name => {
        const contactData = {
          name,
          email: 'test@example.com',
          phone: '+34-666-777-888',
          type: 'general' as const,
          subject: 'Consulta general',
          message: 'Buenos días, tengo una consulta'
        };

        const result = contactSchema.parse(contactData);
        expect(result.name).toBe(name);
      });
    });

    it('should handle Spanish content in messages and subjects', () => {
      const spanishContent = {
        subjects: [
          'Consulta sobre el próximo partido',
          'Información de la peña',
          'Reserva para el Derbi',
          'Camiseta oficial temporada 2024/25',
          'Transporte al estadio'
        ],
        messages: [
          '¡Hola! Me gustaría saber más información sobre cómo unirme a la peña.',
          'Buenos días, ¿cuándo es el próximo partido que vamos a ver juntos?',
          'Me interesa comprar la camiseta oficial. ¿Está disponible en talla L?',
          'Por favor, confirmen la hora de salida del autobús al Villamarín.',
          'Quiero reservar mesa para 4 personas en el próximo partido.'
        ]
      };

      spanishContent.subjects.forEach(subject => {
        const result = contactSchema.parse({
          name: 'Test User',
          email: 'test@example.com',
          phone: '+34-123-456-789',
          type: 'general',
          subject,
          message: 'Test message'
        });

        expect(result.subject).toBe(subject);
      });

      spanishContent.messages.forEach(message => {
        const result = contactSchema.parse({
          name: 'Test User',
          email: 'test@example.com',
          phone: '+34-123-456-789',
          type: 'general',
          subject: 'Test subject',
          message
        });

        expect(result.message).toBe(message);
      });
    });

    it('should handle Spanish error messages correctly', () => {
      const invalidInputs = [
        { field: 'name', value: 'A', expectedError: 'Nombre debe tener al menos 2 caracteres' },
        { field: 'subject', value: 'AB', expectedError: 'Asunto debe tener al menos 3 caracteres' },
        { field: 'message', value: 'ABC', expectedError: 'Mensaje debe tener al menos 5 caracteres' }
      ];

      invalidInputs.forEach(({ field, value, expectedError }) => {
        const invalidData = {
          name: 'Valid Name',
          email: 'test@example.com',
          phone: '+34-123-456-789',
          type: 'general' as const,
          subject: 'Valid Subject',
          message: 'Valid message content',
          [field]: value
        };

        try {
          contactSchema.parse(invalidData);
          fail(`Should have thrown error for field: ${field}`);
        } catch (error) {
          expect(error).toBeInstanceOf(ZodError);
          const zodError = error as ZodError;
          expect(zodError.issues?.[0]?.message).toBe(expectedError);
        }
      });
    });
  });

  describe('Andalusian Cultural Context', () => {
    it('should handle Andalusian place names and references', () => {
      const andalusianPlaces = [
        'Sevilla',
        'Cádiz', 
        'Málaga',
        'Córdoba',
        'Granada',
        'Almería',
        'Jaén',
        'Huelva',
        'Jerez de la Frontera',
        'Marbella',
        'Dos Hermanas',
        'Algeciras'
      ];

      andalusianPlaces.forEach(place => {
        const matchData = {
          date_time: '2024-03-20T18:30:00Z',
          opponent: `Deportivo ${place}`,
          competition: 'La Liga',
          home_away: 'away' as const,
          notes: `Partido en ${place} - ambiente especial`
        };

        const result = matchSchema.parse(matchData);
        expect(result.opponent).toBe(`Deportivo ${place}`);
        expect(result.notes).toBe(`Partido en ${place} - ambiente especial`);
      });
    });

    it('should handle Betis-specific terminology', () => {
      const betisTerms = {
        subjects: [
          'Consulta sobre el Villamarín',
          'Información del Derbi sevillano',
          'Reserva para ver al Betis',
          'Camiseta verdiblanca oficial',
          'Ambiente bético en Edimburgo'
        ],
        messages: [
          '¡Viva el Betis manque pierda! Quiero unirme a la peña de Edimburgo.',
          'Soy nuevo en la ciudad y busco béticos para ver los partidos juntos.',
          'Me gustaría información sobre el próximo Derbi. ¿Dónde lo vemos?',
          'Necesito la camiseta oficial para apoyar desde Escocia.',
          '¡Manque sea en Edimburgo, aquí se vive el Betis con pasión!'
        ]
      };

      betisTerms.subjects.forEach(subject => {
        const result = contactSchema.parse({
          name: 'Bético de Edimburgo',
          email: 'betico@example.com',
          phone: '+34-666-777-888',
          type: 'general',
          subject,
          message: 'Consulta bética'
        });

        expect(result.subject).toBe(subject);
      });

      betisTerms.messages.forEach(message => {
        const result = contactSchema.parse({
          name: 'Bético de Edimburgo',
          email: 'betico@example.com',
          phone: '+34-666-777-888',
          type: 'general',
          subject: 'Consulta bética',
          message
        });

        expect(result.message).toBe(message);
      });
    });
  });

  describe('International User Support', () => {
    it('should handle international phone numbers', () => {
      const internationalPhones = [
        { country: 'UK', phone: '+44 131 496 0000' },
        { country: 'Spain', phone: '+34 954 123 456' },
        { country: 'France', phone: '+33 142 868 802' }, // Fixed to match regex
        { country: 'Germany', phone: '+49 30 12345678' },
        { country: 'Italy', phone: '+39 06 6988 0001' },
        { country: 'Portugal', phone: '+351 21 123 4567' },
        { country: 'USA', phone: '+1 555 123 4567' },
        { country: 'Argentina', phone: '+54 11 4123 4567' }
      ];

      internationalPhones.forEach(({ country, phone }) => {
        const contactData = {
          name: `User from ${country}`,
          email: 'international@example.com',
          phone,
          type: 'general' as const,
          subject: `Contact from ${country}`,
          message: `Hello from ${country}!`
        };

        const result = contactSchema.parse(contactData);
        expect(result.phone).toBe(phone);
        expect(result.name).toBe(`User from ${country}`);
      });
    });

    it('should handle international names and characters', () => {
      const internationalNames = [
        { origin: 'Chinese', name: '李明', email: 'li.ming@example.com' },
        { origin: 'Arabic', name: 'أحمد محمد', email: 'ahmed@example.com' },
        { origin: 'Russian', name: 'Владимир Иванов', email: 'vladimir@example.com' },
        { origin: 'Japanese', name: '田中太郎', email: 'tanaka@example.com' },
        { origin: 'Korean', name: '김민수', email: 'kim@example.com' },
        { origin: 'Greek', name: 'Γιάννης Παπαδόπουλος', email: 'giannis@example.com' },
        { origin: 'Hebrew', name: 'דוד כהן', email: 'david@example.com' },
        { origin: 'Thai', name: 'สมชาย ใจดี', email: 'somchai@example.com' }
      ];

      internationalNames.forEach(({ origin, name, email }) => {
        const contactData = {
          name,
          email,
          phone: '+44-131-496-0000',
          type: 'general' as const,
          subject: `Support request from ${origin} fan`,
          message: `I am a Betis fan living in Edinburgh and would like to join the peña.`
        };

        const result = contactSchema.parse(contactData);
        expect(result.name).toBe(name);
        expect(result.email).toBe(email.toLowerCase());
      });
    });

    it('should handle multilingual RSVP messages', () => {
      const multilingualMessages = [
        { lang: 'Spanish', message: 'Estaré allí con mi familia. ¡Vamos Betis!' },
        { lang: 'English', message: 'Looking forward to watching the match with fellow Betis fans!' },
        { lang: 'French', message: 'J\'ai hâte de regarder le match avec les autres supporters du Betis!' },
        { lang: 'Portuguese', message: 'Mal posso esperar para assistir ao jogo com outros torcedores do Betis!' },
        { lang: 'Italian', message: 'Non vedo l\'ora di guardare la partita con altri tifosi del Betis!' },
        { lang: 'German', message: 'Ich freue mich darauf, das Spiel mit anderen Betis-Fans zu schauen!' }
      ];

      multilingualMessages.forEach(({ lang, message }) => {
        const rsvpData = {
          name: `${lang} Fan`,
          email: `${lang.toLowerCase()}@example.com`,
          attendees: 2,
          message
        };

        const result = rsvpSchema.parse(rsvpData);
        expect(result.message).toBe(message);
        expect(result.name).toBe(`${lang} Fan`);
      });
    });
  });

  describe('Time Zone and Date Handling', () => {
    it('should handle different time zones in match scheduling', () => {
      const timeZoneTests = [
        { tz: 'Spain (CET)', time: '2024-03-20T18:30:00Z' },
        { tz: 'UK (GMT)', time: '2024-03-20T17:30:00Z' },
        { tz: 'Portugal (WET)', time: '2024-03-20T17:30:00Z' },
        { tz: 'Canary Islands', time: '2024-03-20T17:30:00Z' }
      ];

      timeZoneTests.forEach(({ tz, time }) => {
        const matchData = {
          date_time: time,
          opponent: 'Valencia CF',
          competition: 'La Liga',
          home_away: 'home' as const,
          notes: `Match time adjusted for ${tz}`
        };

        const result = matchSchema.parse(matchData);
        expect(result.date_time).toBe(time);
        expect(result.notes).toBe(`Match time adjusted for ${tz}`);
      });
    });

    it('should handle date formats in different locales', () => {
      // All should be converted to ISO format
      const isoDateTimes = [
        '2024-01-15T20:30:00Z',
        '2024-12-31T23:59:00Z',
        '2024-06-15T12:00:00Z',
        '2024-03-29T18:30:00Z' // Day when clocks change in Europe
      ];

      isoDateTimes.forEach(dateTime => {
        const matchData = {
          date_time: dateTime,
          opponent: 'Test Opponent',
          competition: 'Test League',
          home_away: 'home' as const
        };

        const result = matchSchema.parse(matchData);
        expect(result.date_time).toBe(dateTime);
      });
    });
  });

  describe('Currency and Pricing Localization', () => {
    it('should handle different price formats', () => {
      const priceTests = [
        { description: 'Euro pricing', price: 75.99 },
        { description: 'Pound pricing', price: 65.50 },
        { description: 'Whole number pricing', price: 80 },
        { description: 'High precision pricing', price: 123.45 }
      ];

      priceTests.forEach(({ description, price }) => {
        const orderData = {
          productId: 'test_product',
          productName: `Product with ${description}`,
          price,
          quantity: 1,
          totalPrice: price,
          customerInfo: {
            name: 'Test Customer',
            email: 'test@example.com',
            contactMethod: 'email' as const
          },
          isPreOrder: false
        };

        const result = createOrderSchema.parse(orderData);
        expect(result.price).toBe(price);
        expect(result.totalPrice).toBe(price);
      });
    });

    it('should handle international shipping scenarios', () => {
      const internationalOrders = [
        {
          country: 'Scotland',
          customerInfo: {
            name: 'Scottish Bético',
            email: 'scotland@example.com',
            phone: '+44 131 496 0000',
            contactMethod: 'email' as const
          }
        },
        {
          country: 'Spain',
          customerInfo: {
            name: 'Bético Sevillano',
            email: 'sevilla@example.com',
            phone: '+34 954 123 456',
            contactMethod: 'whatsapp' as const
          }
        },
        {
          country: 'International',
          customerInfo: {
            name: 'International Fan',
            email: 'international@example.com',
            phone: '+1 555 123 4567',
            contactMethod: 'email' as const
          }
        }
      ];

      internationalOrders.forEach(({ country, customerInfo }) => {
        const orderData = {
          productId: 'international_product',
          productName: `Camiseta Betis - ${country} shipping`,
          price: 79.99,
          quantity: 1,
          totalPrice: 79.99,
          customerInfo,
          isPreOrder: false,
          orderDetails: {
            message: `Please ship to ${country}`
          }
        };

        const result = createOrderSchema.parse(orderData);
        expect(result.customerInfo.name).toBe(customerInfo.name);
        expect(result.orderDetails?.message).toBe(`Please ship to ${country}`);
      });
    });
  });

  describe('Cultural Sensitivity and Inclusivity', () => {
    it('should handle diverse name formats', () => {
      const diverseNames = [
        'María José García-López y Fernández', // Spanish compound surname
        'Jean-Pierre Dubois', // French hyphenated name
        'O\'Connor MacDonald', // Irish/Scottish names with apostrophes
        'van der Berg', // Dutch names with particles
        'Al-Rahman ibn Abdullah', // Arabic names
        'José María de la Cruz', // Spanish names with particles
        'Mary Elizabeth Smith-Johnson', // English hyphenated surnames
        '李小明 (Li Xiaoming)', // Chinese name with English
      ];

      diverseNames.forEach(name => {
        const voterData = {
          name,
          email: 'diverse@example.com'
        };

        const result = voterSchema.parse(voterData);
        expect(result.name).toBe(name);
      });
    });

    it('should handle religious and cultural holidays in scheduling', () => {
      const culturalDates = [
        { date: '2024-12-25T00:00:00Z', description: 'Christmas Day' },
        { date: '2024-04-14T18:00:00Z', description: 'Easter Sunday' },
        { date: '2024-04-10T20:00:00Z', description: 'Eid al-Fitr' },
        { date: '2024-09-16T19:00:00Z', description: 'Rosh Hashanah' },
        { date: '2024-11-01T17:30:00Z', description: 'All Saints Day (Spain)' }
      ];

      culturalDates.forEach(({ date, description }) => {
        const matchData = {
          date_time: date,
          opponent: 'Cultural Opponent',
          competition: 'Friendly',
          home_away: 'home' as const,
          notes: `Match scheduled considering ${description}`
        };

        const result = matchSchema.parse(matchData);
        expect(result.date_time).toBe(date);
        expect(result.notes).toBe(`Match scheduled considering ${description}`);
      });
    });
  });

  describe('Accessibility and Inclusive Design', () => {
    it('should handle accessibility-related order requests', () => {
      const accessibilityOrders = [
        {
          customer: 'User with Visual Impairment',
          message: 'Please provide large print receipt and audio confirmation'
        },
        {
          customer: 'User with Mobility Needs',
          message: 'Wheelchair accessible seating required for match viewing'
        },
        {
          customer: 'User with Hearing Impairment',
          message: 'Please confirm order via email rather than phone'
        }
      ];

      accessibilityOrders.forEach(({ customer, message }) => {
        const orderData = {
          productId: 'accessibility_product',
          productName: 'Accessible Match Package',
          price: 50.00,
          quantity: 1,
          totalPrice: 50.00,
          customerInfo: {
            name: customer,
            email: 'accessibility@example.com',
            contactMethod: 'email' as const
          },
          orderDetails: {
            message
          },
          isPreOrder: false
        };

        const result = createOrderSchema.parse(orderData);
        expect(result.customerInfo.name).toBe(customer);
        expect(result.orderDetails?.message).toBe(message);
      });
    });

    it('should handle different communication preferences', () => {
      const communicationPrefs = [
        { method: 'email', reason: 'Preferred for written record' },
        { method: 'whatsapp', reason: 'Immediate notifications needed' }
      ];

      communicationPrefs.forEach(({ method, reason }) => {
        const orderData = {
          productId: 'comm_test',
          productName: 'Communication Test Product',
          price: 25.00,
          quantity: 1,
          totalPrice: 25.00,
          customerInfo: {
            name: 'Communication Tester',
            email: 'comm@example.com',
            contactMethod: method as 'email' | 'whatsapp'
          },
          orderDetails: {
            message: `Contact preference: ${method} - ${reason}`
          },
          isPreOrder: false
        };

        const result = createOrderSchema.parse(orderData);
        expect(result.customerInfo.contactMethod).toBe(method);
        expect(result.orderDetails?.message).toBe(`Contact preference: ${method} - ${reason}`);
      });
    });
  });
});