/**
 * Database-based Notification Preferences Management
 * 
 * This module handles storing and retrieving user notification preferences
 * using Supabase database instead of JSON file storage.
 */

import { supabase, getAuthenticatedSupabaseClient } from '@/lib/supabase';

export interface NotificationPreferenceDb {
  id: number;
  user_id: string;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Get notification preference for a user from database
 */
export async function getUserNotificationPreferenceDb(userId: string, clerkToken?: string): Promise<boolean> {
  if (!userId) {
    return false;
  }

  try {
    const client = clerkToken ? getAuthenticatedSupabaseClient(clerkToken) : supabase;
    
    const { data, error } = await client
      .from('notification_preferences')
      .select('enabled')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No record found - default to false
        return false;
      }
      console.error('[NotificationPreferencesDb] Error getting user preference:', error);
      return false;
    }

    return data?.enabled ?? false;
  } catch (error) {
    console.error('[NotificationPreferencesDb] Error getting user preference:', error);
    return false;
  }
}

/**
 * Set notification preference for a user in database
 */
export async function setUserNotificationPreferenceDb(
  userId: string, 
  enabled: boolean, 
  clerkToken?: string
): Promise<boolean> {
  if (!userId) {
    throw new Error('User ID is required');
  }

  try {
    const client = clerkToken ? getAuthenticatedSupabaseClient(clerkToken) : supabase;
    
    // Use upsert to insert or update preference
    const { error } = await client
      .from('notification_preferences')
      .upsert(
        {
          user_id: userId,
          enabled,
          updated_at: new Date().toISOString()
        },
        {
          onConflict: 'user_id'
        }
      );

    if (error) {
      console.error('[NotificationPreferencesDb] Error setting user preference:', error);
      throw new Error('Failed to save notification preference');
    }

    console.log(`[NotificationPreferencesDb] Updated preference for user ${userId}: ${enabled}`);
    return true;
  } catch (error) {
    console.error('[NotificationPreferencesDb] Error setting user preference:', error);
    throw new Error('Failed to save notification preference');
  }
}

/**
 * Get all users with notifications enabled from database (for admin purposes)
 */
export async function getUsersWithNotificationsEnabledDb(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('notification_preferences')
      .select('user_id')
      .eq('enabled', true);

    if (error) {
      console.error('[NotificationPreferencesDb] Error getting enabled users:', error);
      return [];
    }

    return data?.map(pref => pref.user_id) ?? [];
  } catch (error) {
    console.error('[NotificationPreferencesDb] Error getting enabled users:', error);
    return [];
  }
}

/**
 * Delete user preference from database (for cleanup)
 */
export async function deleteUserNotificationPreferenceDb(
  userId: string, 
  clerkToken?: string
): Promise<boolean> {
  if (!userId) {
    throw new Error('User ID is required');
  }

  try {
    const client = clerkToken ? getAuthenticatedSupabaseClient(clerkToken) : supabase;
    
    const { error } = await client
      .from('notification_preferences')
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.error('[NotificationPreferencesDb] Error deleting user preference:', error);
      throw new Error('Failed to delete notification preference');
    }

    console.log(`[NotificationPreferencesDb] Deleted preference for user ${userId}`);
    return true;
  } catch (error) {
    console.error('[NotificationPreferencesDb] Error deleting user preference:', error);
    throw new Error('Failed to delete notification preference');
  }
}

/**
 * Get notification preferences statistics (for admin dashboard)
 */
export async function getNotificationPreferencesStats(): Promise<{
  totalUsers: number;
  enabledUsers: number;
  disabledUsers: number;
}> {
  try {
    const { data, error } = await supabase
      .from('notification_preferences')
      .select('enabled');

    if (error) {
      console.error('[NotificationPreferencesDb] Error getting preferences stats:', error);
      return { totalUsers: 0, enabledUsers: 0, disabledUsers: 0 };
    }

    const totalUsers = data?.length ?? 0;
    const enabledUsers = data?.filter(pref => pref.enabled).length ?? 0;
    const disabledUsers = totalUsers - enabledUsers;

    return {
      totalUsers,
      enabledUsers,
      disabledUsers
    };
  } catch (error) {
    console.error('[NotificationPreferencesDb] Error getting preferences stats:', error);
    return { totalUsers: 0, enabledUsers: 0, disabledUsers: 0 };
  }
}