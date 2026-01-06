import { describe, it, expect } from "vitest";
import { contactSchema } from "../../../../src/lib/schemas/contact";
import { rsvpSchema } from "../../../../src/lib/schemas/rsvp";
import { matchSchema } from "../../../../src/lib/schemas/admin";
import { ZodError } from "zod";

describe("Internationalization and Localization Tests", () => {
  describe("Spanish Language Support", () => {
    it("should handle Spanish names and addresses correctly", () => {
      const spanishNames = [
        "José María García-López",
        "María del Carmen Rodríguez",
        "Francisco Javier Martínez",
        "Ana Belén González-Pérez",
        "Ángel de la Cruz Fernández",
        "Pilar Núñez de la Rosa",
        "José Ángel Vázquez-Montes",
      ];

      spanishNames.forEach((name) => {
        const contactData = {
          name,
          email: "spanish@example.com",
          subject: "Consulta sobre la peña",
          message: "Hola, me interesa unirme a la peña bética en Edimburgo.",
        };

        const result = contactSchema.parse(contactData);
        expect(result.name).toBe(name);
        expect(result.message).toContain("peña bética");
      });
    });

    it("should handle Spanish content in messages and subjects", () => {
      const spanishContent = [
        {
          subject: "Información sobre próximos partidos",
          message:
            "Me gustaría saber más sobre dónde ver los partidos del Betis en Edimburgo.",
        },
        {
          subject: "Membresía en la peña bética",
          message:
            "Hola, soy nuevo en Edimburgo y me encantaría unirme a otros béticos para ver los partidos.",
        },
        {
          subject: "Evento en Polwarth Tavern",
          message: "¡Visca er Betis! ¿Cuándo es el próximo evento?",
        },
      ];

      spanishContent.forEach(({ subject, message }) => {
        const contactData = {
          name: "Usuario Español",
          email: "usuario@example.com",
          subject,
          message,
        };

        const result = contactSchema.parse(contactData);
        expect(result.subject).toBe(subject);
        expect(result.message).toBe(message);
      });
    });

    it("should handle Spanish error messages correctly", () => {
      const invalidData = {
        name: "", // Empty name should fail
        email: "invalid-email",
        subject: "",
        message: "",
      };

      expect(() => contactSchema.parse(invalidData)).toThrow(ZodError);
    });
  });

  describe("RSVP Spanish Language Support", () => {
    it("should handle Spanish names in RSVP", () => {
      const spanishRsvpData = {
        name: "José María Rodríguez",
        email: "jose@example.com",
        attendees: 2,
        message:
          "Llegaremos un poco tarde, ¡pero allí estaremos! ¡Viva er Betis!",
        whatsappInterest: false,
      };

      const result = rsvpSchema.parse(spanishRsvpData);
      expect(result.name).toBe("José María Rodríguez");
      expect(result.message).toContain("Viva er Betis");
    });

    it("should handle multilingual RSVP messages", () => {
      const multilingualRsvps = [
        {
          name: "Scottish Bético",
          email: "scottish@example.com",
          attendees: 1,
          message: "Can't wait to watch the match with fellow Béticos!",
          whatsappInterest: false,
        },
        {
          name: "Bético Internacional",
          email: "international@example.com",
          attendees: 3,
          message: "¡Qué ganas de ver al Betis con otros aficionados!",
          whatsappInterest: false,
        },
      ];

      multilingualRsvps.forEach((rsvpData) => {
        const result = rsvpSchema.parse(rsvpData);
        expect(result.name).toBe(rsvpData.name);
        expect(result.message).toBe(rsvpData.message);
      });
    });
  });

  describe("Admin Schema Internationalization", () => {
    it("should handle international match data", () => {
      const matchData = {
        date_time: new Date().toISOString(),
        opponent: "Celtic FC",
        competition: "Europa League",
        home_away: "home" as const,
      };

      const result = matchSchema.parse(matchData);
      expect(result.opponent).toBe("Celtic FC");
      expect(result.competition).toBe("Europa League");
      expect(result.home_away).toBe("home");
    });
  });
});
