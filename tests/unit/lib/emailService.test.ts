import { EmailService, RSVPEmailData, ContactEmailData } from "@/lib/emailService";

// Mock the Resend SDK
const mockSend = jest.fn();
jest.mock('resend', () => {
  return {
    Resend: jest.fn().mockImplementation(() => ({
      emails: {
        send: mockSend,
      },
    })),
  };
});

let emailService: EmailService;

describe("EmailService", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock console methods to keep test output clean
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    
    process.env = {
      ...originalEnv,
      ADMIN_EMAIL: "admin@example.com",
      FROM_EMAIL: "noreply@example.com",
      EMAIL_API_KEY: "re_test_api_key",
      NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
    };
    emailService = new EmailService();
  });

  afterEach(() => {
    process.env = originalEnv;
    // Restore console methods
    jest.restoreAllMocks();
  });

  describe("sendRSVPNotification", () => {
    const rsvpData: RSVPEmailData = {
      name: "John Doe",
      email: "john.doe@example.com",
      attendees: 2,
      matchDate: "2025-12-25T19:00:00.000Z",
      message: "Looking forward to it!",
      whatsappInterest: true,
    };

    it("should send an RSVP notification email successfully", async () => {
      mockSend.mockResolvedValueOnce({
        data: { id: "email_id_123" },
        error: null,
      });

      const result = await emailService.sendRSVPNotification(rsvpData);

      expect(result).toBe(true);
      expect(mockSend).toHaveBeenCalledTimes(1);
      expect(mockSend).toHaveBeenCalledWith({
        from: "noreply@example.com",
        to: ["admin@example.com"],
        subject: expect.stringContaining("🎉 Nuevo RSVP: John Doe"),
        html: expect.any(String),
        text: expect.any(String),
      });
    });

    it("should return false if API key is not configured", async () => {
      // Create EmailService without API key
      const originalKey = process.env.EMAIL_API_KEY;
      delete process.env.EMAIL_API_KEY;
      const emailServiceWithoutKey = new EmailService();
      
      const result = await emailServiceWithoutKey.sendRSVPNotification(rsvpData);
      
      expect(result).toBe(false);
      expect(mockSend).not.toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalledWith('EMAIL_API_KEY is not set. Email notifications will be disabled.');
      
      // Restore the original key
      process.env.EMAIL_API_KEY = originalKey;
    });

    it("should return false and log error if email sending fails", async () => {
      mockSend.mockResolvedValueOnce({
        data: null,
        error: { message: "Invalid email address" },
      });

      const result = await emailService.sendRSVPNotification(rsvpData);

      expect(result).toBe(false);
      expect(mockSend).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith(
        "Failed to send RSVP notification email:",
        expect.any(Error)
      );
    });

    it("should return false and log error if resend throws an exception", async () => {
      mockSend.mockRejectedValueOnce(new Error("Network error"));

      const result = await emailService.sendRSVPNotification(rsvpData);

      expect(result).toBe(false);
      expect(mockSend).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith(
        "Failed to send RSVP notification email:",
        expect.any(Error)
      );
    });
  });

  describe("sendContactNotification", () => {
    const contactData: ContactEmailData = {
      name: "Jane Doe",
      email: "jane.doe@example.com",
      phone: "123-456-7890",
      type: "General Inquiry",
      subject: "Test Subject",
      message: "This is a test message.",
    };

    it("should send a contact notification email successfully", async () => {
      mockSend.mockResolvedValueOnce({
        data: { id: "email_id_456" },
        error: null,
      });

      const result = await emailService.sendContactNotification(contactData);

      expect(result).toBe(true);
      expect(mockSend).toHaveBeenCalledTimes(1);
      expect(mockSend).toHaveBeenCalledWith({
        from: "noreply@example.com",
        to: ["admin@example.com"],
        subject: expect.stringContaining("📧 Nuevo contacto: Test Subject"),
        html: expect.any(String),
        text: expect.any(String),
      });
    });

    it("should return false if API key is not configured", async () => {
      // Create EmailService without API key
      const originalKey = process.env.EMAIL_API_KEY;
      delete process.env.EMAIL_API_KEY;
      const emailServiceWithoutKey = new EmailService();
      
      const result = await emailServiceWithoutKey.sendContactNotification(contactData);
      
      expect(result).toBe(false);
      expect(mockSend).not.toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalledWith('EMAIL_API_KEY is not set. Email notifications will be disabled.');
      
      // Restore the original key
      process.env.EMAIL_API_KEY = originalKey;
    });

    it("should return false and log error if email sending fails", async () => {
      mockSend.mockResolvedValueOnce({
        data: null,
        error: { message: "Invalid email address" },
      });

      const result = await emailService.sendContactNotification(contactData);

      expect(result).toBe(false);
      expect(mockSend).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith(
        "Failed to send contact notification email:",
        expect.any(Error)
      );
    });

    it("should return false and log error if resend throws an exception", async () => {
      mockSend.mockRejectedValueOnce(new Error("Network error"));

      const result = await emailService.sendContactNotification(contactData);

      expect(result).toBe(false);
      expect(mockSend).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith(
        "Failed to send contact notification email:",
        expect.any(Error)
      );
    });
  });

  describe("sendTestEmail", () => {
    it("should call sendContactNotification with test data", async () => {
      const sendContactNotificationSpy = jest.spyOn(emailService, "sendContactNotification");
      mockSend.mockResolvedValueOnce({
        data: { id: "email_id_789" },
        error: null,
      });

      const result = await emailService.sendTestEmail();

      expect(result).toBe(true);
      expect(sendContactNotificationSpy).toHaveBeenCalledTimes(1);
      expect(sendContactNotificationSpy).toHaveBeenCalledWith(expect.objectContaining({
        name: "Sistema de Prueba",
        email: "test@betis-escocia.com",
        type: "test",
        subject: "Prueba del Sistema de Notificaciones",
        message: "Este es un email de prueba para verificar que las notificaciones están funcionando correctamente.",
      }));
    });
  });
});
