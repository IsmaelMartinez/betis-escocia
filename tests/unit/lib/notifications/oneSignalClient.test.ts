import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  sendAdminNotification,
  createRSVPNotificationPayload,
  createContactNotificationPayload,
  createTestNotificationPayload,
  type OneSignalNotificationPayload 
} from '@/lib/notifications/oneSignalClient';
import * as logger from '@/lib/logger';

// Mock the logger
vi.mock('@/lib/logger', () => ({
  log: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  }
}));

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('OneSignal Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset environment variables
    delete process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;
    delete process.env.ONESIGNAL_REST_API_KEY;
    delete process.env.MOCK_PUSH;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('sendAdminNotification', () => {
    const testPayload: OneSignalNotificationPayload = {
      title: 'Test Notification',
      body: 'This is a test notification',
      url: '/admin',
      data: { type: 'test' }
    };

    describe('Configuration Validation', () => {
      it('should fail when required environment variables are missing', async () => {
        const result = await sendAdminNotification(testPayload);

        expect(result.success).toBe(false);
        expect(result.error).toContain('OneSignal configuration incomplete');
        expect(result.error).toContain('NEXT_PUBLIC_ONESIGNAL_APP_ID');
        expect(result.error).toContain('ONESIGNAL_REST_API_KEY');
        expect(logger.log.warn).toHaveBeenCalledWith(
          'OneSignal notification skipped due to missing configuration',
          expect.objectContaining({
            missingVars: ['NEXT_PUBLIC_ONESIGNAL_APP_ID', 'ONESIGNAL_REST_API_KEY']
          })
        );
      });

      it('should fail when only APP_ID is missing', async () => {
        process.env.ONESIGNAL_REST_API_KEY = 'test-api-key';

        const result = await sendAdminNotification(testPayload);

        expect(result.success).toBe(false);
        expect(result.error).toContain('NEXT_PUBLIC_ONESIGNAL_APP_ID');
        expect(result.error).not.toContain('ONESIGNAL_REST_API_KEY');
      });

      it('should fail when only REST_API_KEY is missing (not in mock mode)', async () => {
        process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID = 'test-app-id';

        const result = await sendAdminNotification(testPayload);

        expect(result.success).toBe(false);
        expect(result.error).toContain('ONESIGNAL_REST_API_KEY');
        expect(result.error).not.toContain('NEXT_PUBLIC_ONESIGNAL_APP_ID');
      });
    });

    describe('Mock Mode', () => {
      beforeEach(() => {
        process.env.MOCK_PUSH = '1';
      });

      it('should succeed in mock mode with complete configuration', async () => {
        process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID = 'test-app-id';
        process.env.ONESIGNAL_REST_API_KEY = 'test-api-key';

        const result = await sendAdminNotification(testPayload);

        expect(result.success).toBe(true);
        expect(result.notificationId).toMatch(/^mock-\d+$/);
        expect(logger.log.info).toHaveBeenCalledWith(
          'Mock push notification sent',
          expect.objectContaining({
            title: testPayload.title,
            body: testPayload.body,
            mockMode: true
          })
        );
        expect(mockFetch).not.toHaveBeenCalled();
      });

      it('should succeed in mock mode with incomplete configuration', async () => {
        // Missing both env vars but in mock mode
        const result = await sendAdminNotification(testPayload);

        expect(result.success).toBe(true);
        expect(result.notificationId).toBe('mock-notification-id');
        expect(logger.log.info).toHaveBeenCalledWith(
          'Mock push notification (config incomplete)',
          expect.objectContaining({
            title: testPayload.title,
            body: testPayload.body,
            missingVars: ['NEXT_PUBLIC_ONESIGNAL_APP_ID']
          })
        );
      });

      it('should not make API calls in mock mode', async () => {
        process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID = 'test-app-id';
        process.env.ONESIGNAL_REST_API_KEY = 'test-api-key';

        await sendAdminNotification(testPayload);

        expect(mockFetch).not.toHaveBeenCalled();
      });
    });

    describe('API Integration', () => {
      beforeEach(() => {
        process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID = 'test-app-id';
        process.env.ONESIGNAL_REST_API_KEY = 'test-api-key';
        process.env.MOCK_PUSH = '0';
      });

      it('should send notification successfully', async () => {
        const mockResponse = {
          id: 'notification-123',
          recipients: 2
        };

        mockFetch.mockResolvedValueOnce(new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }));

        const result = await sendAdminNotification(testPayload);

        expect(result.success).toBe(true);
        expect(result.notificationId).toBe('notification-123');
        expect(mockFetch).toHaveBeenCalledTimes(1);

        expect(logger.log.info).toHaveBeenCalledWith(
          'OneSignal notification sent successfully',
          expect.objectContaining({
            notificationId: 'notification-123',
            recipients: 2,
            title: testPayload.title,
            body: testPayload.body
          })
        );
      });

      it('should handle API errors gracefully', async () => {
        const errorResponse = {
          errors: ['Invalid app_id parameter']
        };

        mockFetch.mockResolvedValueOnce(new Response(JSON.stringify(errorResponse), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }));

        const result = await sendAdminNotification(testPayload);

        expect(result.success).toBe(false);
        expect(result.error).toContain('OneSignal API error: 400');
        expect(logger.log.error).toHaveBeenCalledWith(
          'Failed to send OneSignal notification',
          expect.objectContaining({
            error: expect.stringContaining('OneSignal API error')
          })
        );
      });

      it('should handle network errors gracefully', async () => {
        mockFetch.mockRejectedValueOnce(new Error('Network connection failed'));

        const result = await sendAdminNotification(testPayload);

        expect(result.success).toBe(false);
        expect(result.error).toBe('Network connection failed');
        expect(logger.log.error).toHaveBeenCalledWith(
          'Failed to send OneSignal notification',
          expect.objectContaining({
            error: 'Network connection failed'
          })
        );
      });

      it('should use default values for optional payload fields', async () => {
        const minimalPayload = {
          title: 'Test',
          body: 'Test body'
        };

        mockFetch.mockResolvedValueOnce(new Response(JSON.stringify({ id: 'test-123', recipients: 1 }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }));

        await sendAdminNotification(minimalPayload);

        expect(mockFetch).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Helper Functions', () => {
    describe('createRSVPNotificationPayload', () => {
      it('should create correct payload for single attendee', () => {
        const payload = createRSVPNotificationPayload('Juan Pérez', 1, '2025-08-25');

        expect(payload).toEqual({
          title: '🎉 Nuevo RSVP - Peña Bética',
          body: 'Juan Pérez confirmó asistencia para 25/8/2025',
          url: '/admin',
          data: {
            type: 'rsvp',
            userName: 'Juan Pérez',
            attendeeCount: 1,
            matchDate: '2025-08-25'
          }
        });
      });

      it('should create correct payload for multiple attendees', () => {
        const payload = createRSVPNotificationPayload('María García', 3, '2025-08-25');

        expect(payload).toEqual({
          title: '🎉 Nuevo RSVP - Peña Bética',
          body: 'María García (+2) confirmó asistencia para 25/8/2025',
          url: '/admin',
          data: {
            type: 'rsvp',
            userName: 'María García',
            attendeeCount: 3,
            matchDate: '2025-08-25'
          }
        });
      });

      it('should handle missing match date', () => {
        const payload = createRSVPNotificationPayload('Carlos López', 1);

        expect(payload.body).toBe('Carlos López confirmó asistencia');
        expect(payload.data).toEqual({
          type: 'rsvp',
          userName: 'Carlos López',
          attendeeCount: 1,
          matchDate: undefined
        });
      });
    });

    describe('createContactNotificationPayload', () => {
      it('should create correct contact notification payload', () => {
        const payload = createContactNotificationPayload(
          'Ana Martín',
          'Consulta sobre membresía',
          'membership'
        );

        expect(payload).toEqual({
          title: '📬 Nuevo Contacto - Peña Bética',
          body: 'Ana Martín: Consulta sobre membresía',
          url: '/admin',
          data: {
            type: 'contact',
            userName: 'Ana Martín',
            subject: 'Consulta sobre membresía',
            contactType: 'membership'
          }
        });
      });

      it('should use default contact type when not provided', () => {
        const payload = createContactNotificationPayload('Pedro Sánchez', 'Pregunta general');

        expect(payload.data?.contactType).toBe('general');
      });
    });

    describe('createTestNotificationPayload', () => {
      it('should create correct test notification payload', () => {
        const payload = createTestNotificationPayload();

        expect(payload).toEqual({
          title: '🧪 Notificación de Prueba',
          body: 'Sistema de notificaciones funcionando correctamente',
          url: '/admin',
          data: {
            type: 'test',
            timestamp: expect.any(String)
          }
        });

        // Verify timestamp is a valid ISO string
        expect(() => new Date(payload.data?.timestamp)).not.toThrow();
      });
    });
  });
});