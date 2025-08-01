
import { EmailService, RSVPEmailData, ContactEmailData } from "@/lib/emailService";

let emailService: EmailService;

// Mock the global fetch function
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe("EmailService", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = {
      ...originalEnv,
      ADMIN_EMAIL: "admin@example.com",
      FROM_EMAIL: "noreply@example.com",
      EMAIL_API_KEY: "test_api_key",
      NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
    };
    emailService = new EmailService();
  });

  afterEach(() => {
    process.env = originalEnv;
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
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ id: "email_id_123" }),
      });

      const result = await emailService.sendRSVPNotification(rsvpData);

      expect(result).toBe(true);
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: "Bearer test_api_key",
          "Content-Type": "application/json",
        },
        body: expect.any(String), // We'll check the content of the body in a separate test if needed
      });
    });

    it("should return false if API key is not configured", async () => {
      process.env.EMAIL_API_KEY = undefined;
      const emailServiceWithoutKey = new EmailService(); // Create new instance for this test
      const result = await emailServiceWithoutKey.sendRSVPNotification(rsvpData);
      expect(result).toBe(false);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("should return false and log error if email sending fails", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
      });
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

      const result = await emailService.sendRSVPNotification(rsvpData);

      expect(result).toBe(false);
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Failed to send RSVP notification email:",
        expect.any(Error)
      );
      consoleErrorSpy.mockRestore();
    });

    it("should return false and log error if fetch throws an exception", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

      const result = await emailService.sendRSVPNotification(rsvpData);

      expect(result).toBe(false);
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Failed to send RSVP notification email:",
        expect.any(Error)
      );
      consoleErrorSpy.mockRestore();
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
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ id: "email_id_456" }),
      });

      const result = await emailService.sendContactNotification(contactData);

      expect(result).toBe(true);
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: "Bearer test_api_key",
          "Content-Type": "application/json",
        },
        body: expect.any(String),
      });
    });

    it("should return false if API key is not configured", async () => {
      process.env.EMAIL_API_KEY = undefined;
      const emailServiceWithoutKey = new EmailService(); // Create new instance for this test
      const result = await emailServiceWithoutKey.sendContactNotification(contactData);
      expect(result).toBe(false);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("should return false and log error if email sending fails", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
      });
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

      const result = await emailService.sendContactNotification(contactData);

      expect(result).toBe(false);
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Failed to send contact notification email:",
        expect.any(Error)
      );
      consoleErrorSpy.mockRestore();
    });

    it("should return false and log error if fetch throws an exception", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

      const result = await emailService.sendContactNotification(contactData);

      expect(result).toBe(false);
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Failed to send contact notification email:",
        expect.any(Error)
      );
      consoleErrorSpy.mockRestore();
    });
  });

  describe("sendTestEmail", () => {
    it("should call sendContactNotification with test data", async () => {
      const sendContactNotificationSpy = jest.spyOn(emailService, "sendContactNotification");
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ id: "email_id_789" }),
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
