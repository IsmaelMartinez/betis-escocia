import { createApiHandler } from '@/lib/apiUtils';
import { 
  sendAdminNotification, 
  createTestNotificationPayload 
} from '@/lib/notifications/oneSignalClient';
import { log } from '@/lib/logger';

// POST - Send test notification to admin user
export const POST = createApiHandler({
  auth: 'admin',
  handler: async (validatedData, context) => {
    const { user } = context;

    try {
      const payload = createTestNotificationPayload();
      const result = await sendAdminNotification(payload);

      if (result.success) {
        log.info('Test notification sent successfully', {
          notificationId: result.notificationId
        }, { userId: user.id });

        return {
          success: true,
          data: {
            notificationId: result.notificationId,
            message: 'Notificación de prueba enviada'
          }
        };
      } else {
        throw new Error(result.error || 'Failed to send notification');
      }
    } catch (error) {
      log.error('Failed to send test notification', {
        error: error instanceof Error ? error.message : String(error)
      }, { userId: user.id });

      return {
        success: false,
        error: 'Error al enviar la notificación de prueba'
      };
    }
  }
});