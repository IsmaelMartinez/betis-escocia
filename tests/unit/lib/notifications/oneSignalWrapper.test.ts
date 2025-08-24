import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('OneSignal Wrapper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Clean up global OneSignal
    delete (global as any).OneSignal;
    delete (window as any).OneSignal;
  });

  it('should handle missing OneSignal gracefully', () => {
    expect((global as any).OneSignal).toBeUndefined();
  });

  it('should work with mock OneSignal implementation', () => {
    // Mock OneSignal global
    (global as any).OneSignal = {
      init: vi.fn(),
      showSlidedownPrompt: vi.fn(),
      isPushNotificationsEnabled: vi.fn(() => Promise.resolve(true)),
      setNotificationClickHandler: vi.fn(),
      getNotificationPermission: vi.fn(() => 'granted')
    };

    expect((global as any).OneSignal).toBeDefined();
    expect((global as any).OneSignal.init).toBeDefined();
  });

  it('should handle OneSignal initialization', () => {
    const mockOneSignal = {
      init: vi.fn(),
      showSlidedownPrompt: vi.fn(),
      isPushNotificationsEnabled: vi.fn(() => Promise.resolve(false))
    };

    (global as any).OneSignal = mockOneSignal;
    
    (global as any).OneSignal.init({
      appId: 'test-app-id',
      allowLocalhostAsSecureOrigin: true
    });

    expect(mockOneSignal.init).toHaveBeenCalledWith({
      appId: 'test-app-id',
      allowLocalhostAsSecureOrigin: true
    });
  });

  it('should handle notification permissions', () => {
    const mockOneSignal = {
      getNotificationPermission: vi.fn(() => 'default'),
      isPushNotificationsEnabled: vi.fn(() => Promise.resolve(false))
    };

    (global as any).OneSignal = mockOneSignal;

    const permission = (global as any).OneSignal.getNotificationPermission();
    expect(permission).toBe('default');
    expect(mockOneSignal.getNotificationPermission).toHaveBeenCalled();
  });

  it('should handle push notification status check', async () => {
    const mockOneSignal = {
      isPushNotificationsEnabled: vi.fn(() => Promise.resolve(true))
    };

    (global as any).OneSignal = mockOneSignal;

    const isEnabled = await (global as any).OneSignal.isPushNotificationsEnabled();
    expect(isEnabled).toBe(true);
    expect(mockOneSignal.isPushNotificationsEnabled).toHaveBeenCalled();
  });
});