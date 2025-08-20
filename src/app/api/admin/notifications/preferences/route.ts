import { createApiHandler } from '@/lib/apiUtils';
import { 
  getUserNotificationPreferenceDb, 
  setUserNotificationPreferenceDb 
} from '@/lib/notifications/preferencesDb';
import { log } from '@/lib/logger';
import { z } from 'zod';

// Schema for preference update
const preferenceSchema = z.object({
  enabled: z.boolean()
});

// GET - Get current admin user's notification preference
export const GET = createApiHandler({
  auth: 'admin',
  handler: async (validatedData, context) => {
    const { user, clerkToken } = context;

    try {
      const enabled = await getUserNotificationPreferenceDb(user.id, clerkToken);
      
      log.info('Admin notification preference retrieved', {
        enabled
      }, { userId: user.id });

      return {
        success: true,
        data: { enabled }
      };
    } catch (error) {
      log.error('Failed to get admin notification preference', {
        error: error instanceof Error ? error.message : String(error)
      }, { userId: user.id });

      return {
        success: false,
        error: 'Error al obtener las preferencias de notificación'
      };
    }
  }
});

// PUT - Update admin user's notification preference
export const PUT = createApiHandler({
  auth: 'admin',
  schema: preferenceSchema,
  handler: async (validatedData, context) => {
    const { user, clerkToken } = context;
    const { enabled } = validatedData;

    try {
      const success = await setUserNotificationPreferenceDb(
        user.id, 
        enabled, 
        clerkToken
      );

      if (!success) {
        throw new Error('Database operation failed');
      }

      log.info('Admin notification preference updated', {
        enabled,
        previousValue: await getUserNotificationPreferenceDb(user.id, clerkToken)
      }, { userId: user.id });

      return {
        success: true,
        data: { enabled },
        message: enabled 
          ? 'Notificaciones activadas correctamente' 
          : 'Notificaciones desactivadas correctamente'
      };
    } catch (error) {
      log.error('Failed to update admin notification preference', {
        enabled,
        error: error instanceof Error ? error.message : String(error)
      }, { userId: user.id });

      return {
        success: false,
        error: 'Error al actualizar las preferencias de notificación'
      };
    }
  }
});