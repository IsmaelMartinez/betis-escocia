import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Supabase using vi.hoisted
const mockSupabase = vi.hoisted(() => ({
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })),
        single: vi.fn(() => Promise.resolve({ data: null, error: null })),
      })),
    })),
    insert: vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn(() => Promise.resolve({ data: { enabled: true }, error: null })),
      })),
    })),
    update: vi.fn(() => ({
      eq: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: { enabled: true }, error: null })),
        })),
      })),
    })),
    upsert: vi.fn(() => Promise.resolve({ data: { enabled: true }, error: null })),
  })),
}));

vi.mock('@/lib/supabase', () => ({
  supabase: mockSupabase,
  getAuthenticatedSupabaseClient: vi.fn(() => mockSupabase),
}));

import { getUserNotificationPreferenceDb, setUserNotificationPreferenceDb } from '@/lib/notifications/preferencesDb';

describe('Notifications PreferencesDb', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getUserNotificationPreferenceDb', () => {
    it('should return true for existing enabled preference', async () => {
      const mockSelect = vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ 
            data: { enabled: true }, 
            error: null 
          })),
        })),
      }));
      (mockSupabase.from as any).mockReturnValue({ select: mockSelect });

      const result = await getUserNotificationPreferenceDb('user-123', 'mock-token');
      
      expect(result).toBe(true);
      expect(mockSupabase.from).toHaveBeenCalledWith('notification_preferences');
    });

    it('should return false for existing disabled preference', async () => {
      const mockSelect = vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ 
            data: { enabled: false }, 
            error: null 
          })),
        })),
      }));
      (mockSupabase.from as any).mockReturnValue({ select: mockSelect });

      const result = await getUserNotificationPreferenceDb('user-123', 'mock-token');
      
      expect(result).toBe(false);
    });

    it('should return false by default when no preference exists', async () => {
      const mockSelect = vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ 
            data: null, 
            error: { code: 'PGRST116', message: 'No rows returned' }
          })),
        })),
      }));
      (mockSupabase.from as any).mockReturnValue({ select: mockSelect });

      const result = await getUserNotificationPreferenceDb('user-123', 'mock-token');
      
      expect(result).toBe(false);
    });

    it('should handle database errors gracefully', async () => {
      const mockSelect = vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ 
            data: null, 
            error: { code: 'OTHER_ERROR', message: 'Database error' }
          })),
        })),
      }));
      (mockSupabase.from as any).mockReturnValue({ select: mockSelect });

      const result = await getUserNotificationPreferenceDb('user-123', 'mock-token');
      
      expect(result).toBe(false); // Default to false on error
    });

    it('should handle missing user ID', async () => {
      const result = await getUserNotificationPreferenceDb('', 'mock-token');
      
      expect(result).toBe(false);
      expect(mockSupabase.from).not.toHaveBeenCalled();
    });
  });

  describe('setUserNotificationPreferenceDb', () => {
    it('should successfully set preference to enabled', async () => {
      const mockUpsert = vi.fn(() => Promise.resolve({ 
        data: { enabled: true }, 
        error: null 
      }));
      (mockSupabase.from as any).mockReturnValue({ upsert: mockUpsert });

      const result = await setUserNotificationPreferenceDb('user-123', true, 'mock-token');
      
      expect(result).toBe(true);
      expect(mockSupabase.from).toHaveBeenCalledWith('notification_preferences');
    });

    it('should successfully set preference to disabled', async () => {
      const mockUpsert = vi.fn(() => Promise.resolve({ 
        data: { enabled: false }, 
        error: null 
      }));
      (mockSupabase.from as any).mockReturnValue({ upsert: mockUpsert });

      const result = await setUserNotificationPreferenceDb('user-123', false, 'mock-token');
      
      expect(result).toBe(true);
    });

    it('should handle upsert errors', async () => {
      const mockUpsert = vi.fn(() => Promise.resolve({ 
        data: null, 
        error: { code: 'OTHER_ERROR', message: 'Database error' }
      }));
      (mockSupabase.from as any).mockReturnValue({ upsert: mockUpsert });

      try {
        await setUserNotificationPreferenceDb('user-123', true, 'mock-token');
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect((error as Error).message).toBe('Failed to save notification preference');
      }
    });

    it('should handle missing user ID', async () => {
      try {
        await setUserNotificationPreferenceDb('', true, 'mock-token');
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect((error as Error).message).toBe('User ID is required');
      }
      expect(mockSupabase.from).not.toHaveBeenCalled();
    });

    it('should handle missing token', async () => {
      const mockUpsert = vi.fn(() => Promise.resolve({ 
        data: { enabled: true }, 
        error: null 
      }));
      (mockSupabase.from as any).mockReturnValue({ upsert: mockUpsert });

      const result = await setUserNotificationPreferenceDb('user-123', true);
      
      expect(result).toBe(true);
      expect(mockSupabase.from).toHaveBeenCalledWith('notification_preferences');
    });
  });

  describe('Data Validation', () => {
    it('should handle invalid user ID format', async () => {
      const mockSelect = vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ 
            data: null, 
            error: { code: 'PGRST116', message: 'No rows returned' }
          })),
        })),
      }));
      (mockSupabase.from as any).mockReturnValue({ select: mockSelect });

      const result = await getUserNotificationPreferenceDb('invalid-user-id!@#', 'mock-token');
      
      expect(result).toBe(false); // Should default to false
    });

    it('should handle very long user IDs', async () => {
      const longUserId = 'a'.repeat(1000);
      const mockSelect = vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ 
            data: null, 
            error: { code: 'PGRST116', message: 'No rows returned' }
          })),
        })),
      }));
      (mockSupabase.from as any).mockReturnValue({ select: mockSelect });

      const result = await getUserNotificationPreferenceDb(longUserId, 'mock-token');
      
      expect(result).toBe(false);
    });

    it('should handle special characters in user ID', async () => {
      const specialUserId = 'user-123-àáâäæãåā';
      const mockSelect = vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ 
            data: { enabled: true }, 
            error: null 
          })),
        })),
      }));
      (mockSupabase.from as any).mockReturnValue({ select: mockSelect });

      const result = await getUserNotificationPreferenceDb(specialUserId, 'mock-token');
      
      expect(result).toBe(true);
    });
  });

  describe('Performance and Edge Cases', () => {
    it('should handle concurrent requests', async () => {
      const mockSelect = vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ 
            data: { enabled: true }, 
            error: null 
          })),
        })),
      }));
      (mockSupabase.from as any).mockReturnValue({ select: mockSelect });

      const requests = Array(5).fill(0).map(() => 
        getUserNotificationPreferenceDb('user-123', 'mock-token')
      );
      
      const results = await Promise.all(requests);
      
      results.forEach(result => expect(result).toBe(true));
    });

    it('should handle network timeouts gracefully', async () => {
      const mockSelect = vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => 
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Timeout')), 100)
            )
          ),
        })),
      }));
      (mockSupabase.from as any).mockReturnValue({ select: mockSelect });

      const result = await getUserNotificationPreferenceDb('user-123', 'mock-token');
      
      expect(result).toBe(false); // Should default to false on error
    });
  });
});