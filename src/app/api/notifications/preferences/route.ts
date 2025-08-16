import { createApiHandler } from '@/lib/apiUtils';
import { checkAdminRole } from '@/lib/adminApiProtection';
import { 
  getUserNotificationPreferenceDb, 
  setUserNotificationPreferenceDb 
} from '@/lib/notifications/preferencesDb';
import { notificationPreferencesSchema } from '@/lib/schemas/admin';
import { z } from 'zod';
import { log } from '@/lib/logger';

/**
 * API endpoint for managing user notification preferences
 */

type NotificationPreferencesResponse = {
  success: boolean;
  enabled: boolean;
  userId: string;
  message?: string;
};

async function getNotificationPreferences(context: { clerkToken?: string }): Promise<NotificationPreferencesResponse> {
  // Check if user has admin role
  const { user, isAdmin, error: authError } = await checkAdminRole();
  if (!isAdmin || !user) {
    throw new Error(authError || 'Admin access required');
  }

  // Get user preference from database
  const enabled = await getUserNotificationPreferenceDb(user.id, context.clerkToken);

  log.info('Retrieved notification preferences', { userId: user.id }, { enabled });

  return {
    success: true,
    enabled,
    userId: user.id
  };
}

async function setNotificationPreferences(
  data: z.infer<typeof notificationPreferencesSchema>,
  context: { clerkToken?: string }
): Promise<NotificationPreferencesResponse> {
  // Check if user has admin role
  const { user, isAdmin, error: authError } = await checkAdminRole();
  if (!isAdmin || !user) {
    throw new Error(authError || 'Admin access required');
  }

  const { enabled } = data;

  // Set user preference in database
  await setUserNotificationPreferenceDb(user.id, enabled, context.clerkToken);

  log.business('notification_preference_updated', { enabled }, { userId: user.id });

  return {
    success: true,
    enabled,
    userId: user.id,
    message: `Notifications ${enabled ? 'enabled' : 'disabled'} successfully`
  };
}

// GET - Get notification preference for current user
export const GET = createApiHandler({
  auth: 'admin',
  handler: async (validatedData, context) => {
    const { getToken } = await import('@clerk/nextjs/server').then(m => m.getAuth(context.request));
    const clerkToken = await getToken({ template: 'supabase' });
    return await getNotificationPreferences({ clerkToken: clerkToken || undefined });
  }
});

// POST - Set notification preference for current user
export const POST = createApiHandler({
  auth: 'admin',
  schema: notificationPreferencesSchema,
  handler: async (validatedData, context) => {
    const { getToken } = await import('@clerk/nextjs/server').then(m => m.getAuth(context.request));
    const clerkToken = await getToken({ template: 'supabase' });
    return await setNotificationPreferences(validatedData, { clerkToken: clerkToken || undefined });
  }
});

// PUT - Update notification preference for current user (same as POST for compatibility)
export const PUT = POST;