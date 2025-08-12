/**
 * Notification Preferences Management
 * 
 * This module handles storing and retrieving user notification preferences.
 * Initially uses JSON file storage, will be migrated to database.
 */

import { promises as fs } from 'fs';
import path from 'path';

export interface NotificationPreference {
  userId: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

interface NotificationPreferences {
  [userId: string]: NotificationPreference;
}

const PREFERENCES_FILE = path.join(process.cwd(), 'data', 'notification-preferences.json');

/**
 * Ensure the data directory exists
 */
async function ensureDataDirectory(): Promise<void> {
  const dataDir = path.dirname(PREFERENCES_FILE);
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

/**
 * Load preferences from JSON file
 */
async function loadPreferences(): Promise<NotificationPreferences> {
  await ensureDataDirectory();
  
  try {
    const data = await fs.readFile(PREFERENCES_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    // File doesn't exist or is invalid, return empty object
    console.log('[NotificationPreferences] Creating new preferences file');
    return {};
  }
}

/**
 * Save preferences to JSON file
 */
async function savePreferences(preferences: NotificationPreferences): Promise<void> {
  await ensureDataDirectory();
  
  try {
    await fs.writeFile(PREFERENCES_FILE, JSON.stringify(preferences, null, 2), 'utf8');
  } catch (error) {
    console.error('[NotificationPreferences] Error saving preferences:', error);
    throw new Error('Failed to save notification preferences');
  }
}

/**
 * Get notification preference for a user
 */
export async function getUserNotificationPreference(userId: string): Promise<boolean> {
  if (!userId) {
    return false;
  }

  try {
    const preferences = await loadPreferences();
    const userPref = preferences[userId];
    
    // Default to false if no preference exists
    return userPref?.enabled ?? false;
  } catch (error) {
    console.error('[NotificationPreferences] Error getting user preference:', error);
    return false;
  }
}

/**
 * Set notification preference for a user
 */
export async function setUserNotificationPreference(userId: string, enabled: boolean): Promise<boolean> {
  if (!userId) {
    throw new Error('User ID is required');
  }

  try {
    const preferences = await loadPreferences();
    const now = new Date().toISOString();
    
    preferences[userId] = {
      userId,
      enabled,
      createdAt: preferences[userId]?.createdAt ?? now,
      updatedAt: now
    };
    
    await savePreferences(preferences);
    
    console.log(`[NotificationPreferences] Updated preference for user ${userId}: ${enabled}`);
    return true;
  } catch (error) {
    console.error('[NotificationPreferences] Error setting user preference:', error);
    throw new Error('Failed to save notification preference');
  }
}

/**
 * Get all users with notifications enabled (for admin purposes)
 */
export async function getUsersWithNotificationsEnabled(): Promise<string[]> {
  try {
    const preferences = await loadPreferences();
    
    return Object.values(preferences)
      .filter(pref => pref.enabled)
      .map(pref => pref.userId);
  } catch (error) {
    console.error('[NotificationPreferences] Error getting enabled users:', error);
    return [];
  }
}

/**
 * Delete user preference (for cleanup)
 */
export async function deleteUserNotificationPreference(userId: string): Promise<boolean> {
  if (!userId) {
    throw new Error('User ID is required');
  }

  try {
    const preferences = await loadPreferences();
    
    if (preferences[userId]) {
      delete preferences[userId];
      await savePreferences(preferences);
      console.log(`[NotificationPreferences] Deleted preference for user ${userId}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('[NotificationPreferences] Error deleting user preference:', error);
    throw new Error('Failed to delete notification preference');
  }
}