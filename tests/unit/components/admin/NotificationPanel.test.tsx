import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NotificationPanel from '@/components/admin/NotificationPanel';

// Hoist the mock functions
const mockPushNotifications = vi.hoisted(() => ({
  getNotificationPermissionState: vi.fn(),
  requestNotificationPermission: vi.fn(),
  subscribeToPushNotifications: vi.fn(),
  unsubscribeFromPushNotifications: vi.fn(),
  isSubscribedToPushNotifications: vi.fn(),
  sendTestNotification: vi.fn(),
}));

// Mock the push notifications utilities
vi.mock('@/lib/notifications/pushNotifications', () => mockPushNotifications);

// Mock fetch for API calls
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('NotificationPanel', () => {
  const defaultPermissionState = {
    permission: 'default' as NotificationPermission,
    supported: true,
    subscribed: false
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementations
    mockPushNotifications.getNotificationPermissionState.mockReturnValue(defaultPermissionState);
    mockPushNotifications.isSubscribedToPushNotifications.mockResolvedValue(false);
    
    // Mock successful API responses by default
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ enabled: false })
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Browser Compatibility', () => {
    it('should show unsupported message when push notifications are not supported', async () => {
      mockPushNotifications.getNotificationPermissionState.mockReturnValue({
        permission: 'default',
        supported: false,
        subscribed: false
      });

      render(<NotificationPanel />);

      await waitFor(() => {
        expect(screen.getByTestId('browser-compatibility')).toBeInTheDocument();
        expect(screen.getByText('Tu navegador no es compatible con las notificaciones push.')).toBeInTheDocument();
        expect(screen.getByText(/Prueba con Chrome, Firefox, Safari o Edge/)).toBeInTheDocument();
      });
    });

    it('should render notification panel when browser supports notifications', async () => {
      render(<NotificationPanel />);

      await waitFor(() => {
        expect(screen.getByTestId('notification-panel')).toBeInTheDocument();
        expect(screen.getByText('Notificaciones Push')).toBeInTheDocument();
        expect(screen.getByText('Recibe notificaciones instantáneas cuando hay nuevos RSVPs o mensajes de contacto.')).toBeInTheDocument();
      });
    });
  });

  describe('Permission States', () => {
    it('should show "Activar Notificaciones" button when permission is default', async () => {
      render(<NotificationPanel />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Activar Notificaciones/i })).toBeInTheDocument();
        expect(screen.getByText('Inactivas')).toBeInTheDocument();
      });
    });

    it('should show blocked state when permission is denied', async () => {
      mockPushNotifications.getNotificationPermissionState.mockReturnValue({
        permission: 'denied',
        supported: true,
        subscribed: false
      });

      render(<NotificationPanel />);

      await waitFor(() => {
        expect(screen.getByText('Bloqueadas')).toBeInTheDocument();
        expect(screen.getByText('Las notificaciones están bloqueadas.')).toBeInTheDocument();
        expect(screen.getByText(/Puedes habilitarlas en la configuración del navegador/)).toBeInTheDocument();
      });
    });

    it('should show active state when permission is granted and subscribed', async () => {
      // Setup all mocks before rendering
      mockPushNotifications.getNotificationPermissionState.mockReturnValue({
        permission: 'granted',
        supported: true,
        subscribed: true
      });
      
      // Mock the async subscription check
      mockPushNotifications.isSubscribedToPushNotifications.mockImplementation(() => {
        console.log('isSubscribedToPushNotifications called');
        return Promise.resolve(true);
      });
      
      // Clear any previous fetch mocks and set specific response for preferences API
      mockFetch.mockReset();
      mockFetch.mockImplementation((url) => {
        console.log('Fetch called with URL:', url);
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true, enabled: true, userId: 'test-user' })
        });
      });

      render(<NotificationPanel />);

      // Wait a bit for useEffect to run
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Debug - let's see what calls are being made
      console.log('Fetch calls:', mockFetch.mock.calls.length);
      console.log('isSubscribed calls:', mockPushNotifications.isSubscribedToPushNotifications.mock.calls.length);
      
      // Wait for the component to complete its async initialization
      await waitFor(async () => {
        const activasElements = screen.queryAllByText('Activas');
        const inactivasElements = screen.queryAllByText('Inactivas');
        console.log('Activas elements:', activasElements.length, 'Inactivas elements:', inactivasElements.length);
        
        expect(activasElements.length).toBeGreaterThan(0);
      }, { timeout: 3000 });
      
      expect(screen.getByTestId('subscription-status')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should request permission when "Activar Notificaciones" is clicked', async () => {
      const user = userEvent.setup();
      mockPushNotifications.requestNotificationPermission.mockResolvedValue('granted');
      mockPushNotifications.subscribeToPushNotifications.mockResolvedValue(undefined);

      render(<NotificationPanel />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Activar Notificaciones/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /Activar Notificaciones/i }));

      expect(mockPushNotifications.requestNotificationPermission).toHaveBeenCalled();
    });

    it('should subscribe to notifications when permission is granted', async () => {
      const user = userEvent.setup();
      mockPushNotifications.getNotificationPermissionState.mockReturnValue({
        permission: 'granted',
        supported: true,
        subscribed: false
      });
      mockPushNotifications.subscribeToPushNotifications.mockResolvedValue(undefined);

      render(<NotificationPanel />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Suscribirse a Notificaciones/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /Suscribirse a Notificaciones/i }));

      expect(mockPushNotifications.subscribeToPushNotifications).toHaveBeenCalled();
    });

    it('should send test notification when test button is clicked', async () => {
      const user = userEvent.setup();
      mockPushNotifications.getNotificationPermissionState.mockReturnValue({
        permission: 'granted',
        supported: true,
        subscribed: true
      });
      mockPushNotifications.isSubscribedToPushNotifications.mockResolvedValue(true);
      mockPushNotifications.sendTestNotification.mockResolvedValue(undefined);
      
      // Mock user preference as enabled
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ enabled: true })
      });

      render(<NotificationPanel />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Probar Notificación/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /Probar Notificación/i }));

      expect(mockPushNotifications.sendTestNotification).toHaveBeenCalledWith({
        title: '🧪 Notificación de Prueba',
        body: 'Las notificaciones push están funcionando correctamente!',
        tag: 'test-notification'
      });

      await waitFor(() => {
        expect(screen.getByText('¡Notificación de prueba enviada! Revisa tu navegador.')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Enviada!/i })).toBeInTheDocument();
      });
    });

    it('should unsubscribe when deactivate button is clicked', async () => {
      const user = userEvent.setup();
      mockPushNotifications.getNotificationPermissionState.mockReturnValue({
        permission: 'granted',
        supported: true,
        subscribed: true
      });
      mockPushNotifications.isSubscribedToPushNotifications.mockResolvedValue(true);
      mockPushNotifications.unsubscribeFromPushNotifications.mockResolvedValue(true);
      
      // Mock user preference as enabled initially
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ enabled: true })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true })
        });

      render(<NotificationPanel />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Desactivar/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /Desactivar/i }));

      expect(mockPushNotifications.unsubscribeFromPushNotifications).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should display error message when permission request fails', async () => {
      const user = userEvent.setup();
      const errorMessage = 'Permission denied by user';
      mockPushNotifications.requestNotificationPermission.mockRejectedValue(new Error(errorMessage));

      render(<NotificationPanel />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Activar Notificaciones/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /Activar Notificaciones/i }));

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });

    it('should display error message when subscription fails', async () => {
      const user = userEvent.setup();
      const errorMessage = 'Subscription failed';
      mockPushNotifications.getNotificationPermissionState.mockReturnValue({
        permission: 'granted',
        supported: true,
        subscribed: false
      });
      mockPushNotifications.subscribeToPushNotifications.mockRejectedValue(new Error(errorMessage));

      render(<NotificationPanel />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Suscribirse a Notificaciones/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /Suscribirse a Notificaciones/i }));

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });

    it('should handle API errors when saving preferences', async () => {
      const user = userEvent.setup();
      mockPushNotifications.getNotificationPermissionState.mockReturnValue({
        permission: 'granted',
        supported: true,
        subscribed: false
      });
      mockPushNotifications.subscribeToPushNotifications.mockResolvedValue(undefined);
      
      // Mock API error
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ enabled: false })
        })
        .mockResolvedValueOnce({
          ok: false,
          json: () => Promise.resolve({ error: 'Database error' })
        });

      render(<NotificationPanel />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Suscribirse a Notificaciones/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /Suscribirse a Notificaciones/i }));

      // Should still show error even if subscription succeeds but preference save fails
      await waitFor(() => {
        expect(screen.getByText(/Database error/)).toBeInTheDocument();
      });
    });
  });

  describe('Loading States', () => {
    it('should show loading spinner when processing requests', async () => {
      const user = userEvent.setup();
      
      // Create a promise that we can control
      let resolvePermission: (value: NotificationPermission) => void;
      const permissionPromise = new Promise<NotificationPermission>((resolve) => {
        resolvePermission = resolve;
      });
      
      mockPushNotifications.requestNotificationPermission.mockReturnValue(permissionPromise);

      render(<NotificationPanel />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Activar Notificaciones/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /Activar Notificaciones/i }));

      // Should show loading state
      expect(screen.getByText('Procesando...')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Activar Notificaciones/i })).toBeDisabled();

      // Resolve the promise
      resolvePermission!('granted');
      
      await waitFor(() => {
        expect(screen.queryByText('Procesando...')).not.toBeInTheDocument();
      });
    });

    it('should show loading state when fetching user preferences', async () => {
      // Mock slow API response
      let resolveApiCall: (value: any) => void;
      const apiPromise = new Promise((resolve) => {
        resolveApiCall = resolve;
      });
      
      mockFetch.mockReturnValue(apiPromise);

      render(<NotificationPanel />);

      // Should show loading state initially
      expect(screen.getByText('Cargando...')).toBeInTheDocument();

      // Resolve the API call
      resolveApiCall!({
        ok: true,
        json: () => Promise.resolve({ enabled: false })
      });

      await waitFor(() => {
        expect(screen.queryByText('Cargando...')).not.toBeInTheDocument();
      });
    });
  });

  describe('Callback Props', () => {
    it('should call onPermissionChange when permission state changes', async () => {
      const onPermissionChange = vi.fn();
      mockPushNotifications.getNotificationPermissionState.mockReturnValue({
        permission: 'granted',
        supported: true,
        subscribed: false
      });

      render(<NotificationPanel onPermissionChange={onPermissionChange} />);

      await waitFor(() => {
        expect(onPermissionChange).toHaveBeenCalledWith('granted');
      });
    });

    it('should call onSubscriptionChange when subscription state changes', async () => {
      const onSubscriptionChange = vi.fn();
      mockPushNotifications.isSubscribedToPushNotifications.mockResolvedValue(true);

      render(<NotificationPanel onSubscriptionChange={onSubscriptionChange} />);

      await waitFor(() => {
        expect(onSubscriptionChange).toHaveBeenCalledWith(true);
      });
    });
  });

  describe('Help Text', () => {
    it('should show help text when notifications are active', async () => {
      mockPushNotifications.getNotificationPermissionState.mockReturnValue({
        permission: 'granted',
        supported: true,
        subscribed: true
      });
      mockPushNotifications.isSubscribedToPushNotifications.mockResolvedValue(true);
      
      // Mock user preference as enabled
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ enabled: true })
      });

      render(<NotificationPanel />);

      await waitFor(() => {
        expect(screen.getByText('✅ Recibirás notificaciones para:')).toBeInTheDocument();
        expect(screen.getByText('• Nuevas confirmaciones de asistencia (RSVPs)')).toBeInTheDocument();
        expect(screen.getByText('• Nuevos mensajes de contacto')).toBeInTheDocument();
      });
    });

    it('should show configuration help text when subscribed but disabled', async () => {
      mockPushNotifications.getNotificationPermissionState.mockReturnValue({
        permission: 'granted',
        supported: true,
        subscribed: true
      });
      mockPushNotifications.isSubscribedToPushNotifications.mockResolvedValue(true);
      
      // Mock user preference as disabled
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ enabled: false })
      });

      render(<NotificationPanel />);

      await waitFor(() => {
        expect(screen.getByText(/Las notificaciones están configuradas pero desactivadas/)).toBeInTheDocument();
      });
    });
  });
});