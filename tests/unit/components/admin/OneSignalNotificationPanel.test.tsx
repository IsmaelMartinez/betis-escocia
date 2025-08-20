import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import OneSignalNotificationPanel from '@/components/admin/OneSignalNotificationPanel';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock OneSignal SDK v5 API
const mockOneSignal = {
  init: vi.fn(),
  login: vi.fn(),
  User: {
    addTag: vi.fn(),
  },
  Notifications: {
    permission: 'default',
    requestPermission: vi.fn(),
  },
};

// Mock dynamic import of react-onesignal
vi.mock('react-onesignal', () => ({
  default: mockOneSignal
}));

// Mock Clerk user context
const mockUser = {
  id: 'user_123',
  primaryEmailAddress: { emailAddress: 'admin@test.com' }
};

vi.mock('@clerk/nextjs', () => ({
  useUser: vi.fn(() => ({ user: mockUser }))
}));

// Mock environment variables
beforeEach(() => {
  process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID = 'test-app-id';
  process.env.NODE_ENV = 'test';
});

describe('OneSignalNotificationPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockClear();
    
    // Reset OneSignal permission state
    mockOneSignal.Notifications.permission = 'default';
    
    // Default successful preference fetch
    mockFetch.mockResolvedValueOnce(new Response(JSON.stringify({
      success: true,
      data: { enabled: false }
    }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initial Rendering', () => {
    it('should render with correct title and loading state', () => {
      render(<OneSignalNotificationPanel />);

      expect(screen.getByText('Notificaciones Push')).toBeInTheDocument();
      expect(screen.getByTestId('onesignal-notification-panel')).toBeInTheDocument();
      expect(screen.getAllByText('Cargando...')).toHaveLength(2); // Loading spinner and status
    });

    it('should have proper accessibility attributes', () => {
      render(<OneSignalNotificationPanel />);

      const toggle = screen.getByRole('checkbox');
      expect(toggle).toHaveAttribute('id', 'notification-toggle');
      
      const label = screen.getByLabelText('Recibir notificaciones de actividad');
      expect(label).toBeInTheDocument();
    });
  });

  describe('Preference Loading', () => {
    it('should load and display current preference on mount', async () => {
      render(<OneSignalNotificationPanel />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1);
      });

      await waitFor(() => {
        expect(screen.getByText('Desactivado')).toBeInTheDocument();
      });

      const toggle = screen.getByRole('checkbox');
      expect(toggle).not.toBeChecked();
    });

    it('should display enabled state when preference is true', async () => {
      mockFetch.mockClear(); // Clear the default mock from beforeEach
      mockFetch.mockResolvedValueOnce(new Response(JSON.stringify({
        success: true,
        data: { enabled: true }
      }), { status: 200, headers: { 'Content-Type': 'application/json' } }));

      render(<OneSignalNotificationPanel />);

      await waitFor(() => {
        const toggle = screen.getByRole('checkbox');
        expect(toggle).toBeChecked();
      });
    });

    it('should handle API errors gracefully', async () => {
      mockFetch.mockResolvedValueOnce(new Response(JSON.stringify({
        success: false,
        error: 'Database error'
      }), { status: 500, headers: { 'Content-Type': 'application/json' } }));

      render(<OneSignalNotificationPanel />);

      await waitFor(() => {
        expect(screen.getByText('Database error')).toBeInTheDocument();
      });
    });
  });

  describe('Toggle Functionality', () => {
    it('should initialize OneSignal when enabling notifications', async () => {
      const user = userEvent.setup();
      
      // Mock OneSignal initialization
      mockOneSignal.init.mockResolvedValueOnce(undefined);
      mockOneSignal.login.mockResolvedValueOnce(undefined);
      mockOneSignal.User.addTag.mockResolvedValueOnce(undefined);
      mockOneSignal.Notifications.permission = 'granted';

      // Mock preference update
      mockFetch
        .mockResolvedValueOnce(new Response(JSON.stringify({
          success: true,
          data: { enabled: false }
        }), { status: 200 })) // Initial load
        .mockResolvedValueOnce(new Response(JSON.stringify({
          success: true,
          data: { enabled: true }
        }), { status: 200 })); // Update

      render(<OneSignalNotificationPanel />);

      await waitFor(() => {
        expect(screen.getByRole('checkbox')).not.toBeChecked();
      });

      const toggle = screen.getByRole('checkbox');
      await user.click(toggle);

      await waitFor(() => {
        expect(mockOneSignal.init).toHaveBeenCalledWith({
          appId: 'test-app-id',
          allowLocalhostAsSecureOrigin: true
        });
      });

      expect(mockOneSignal.login).toHaveBeenCalledWith('user_123');
      expect(mockOneSignal.User.addTag).toHaveBeenCalledWith('user_type', 'admin');
    });

    it('should request permission when needed', async () => {
      const user = userEvent.setup();
      
      // Mock OneSignal with permission default initially
      mockOneSignal.init.mockResolvedValueOnce(undefined);
      mockOneSignal.login.mockResolvedValueOnce(undefined);
      mockOneSignal.User.addTag.mockResolvedValueOnce(undefined);
      mockOneSignal.Notifications.permission = false; // Permission not granted initially
      mockOneSignal.Notifications.requestPermission.mockResolvedValueOnce(true);

      // Mock preference update
      mockFetch
        .mockResolvedValueOnce(new Response(JSON.stringify({
          success: true,
          data: { enabled: false }
        }), { status: 200 }))
        .mockResolvedValueOnce(new Response(JSON.stringify({
          success: true,
          data: { enabled: true }
        }), { status: 200 }));

      render(<OneSignalNotificationPanel />);

      await waitFor(() => {
        const toggle = screen.getByRole('checkbox');
        expect(toggle).not.toBeChecked();
      });

      const toggle = screen.getByRole('checkbox');
      await user.click(toggle);

      // Wait for the delayed permission request (setTimeout 1000ms in component)
      await waitFor(() => {
        expect(mockOneSignal.Notifications.requestPermission).toHaveBeenCalled();
      }, { timeout: 2000 });
    });

    it('should handle permission denied gracefully', async () => {
      const user = userEvent.setup();
      
      mockOneSignal.init.mockResolvedValueOnce(undefined);
      mockOneSignal.login.mockResolvedValueOnce(undefined);
      mockOneSignal.User.addTag.mockResolvedValueOnce(undefined);
      mockOneSignal.Notifications.permission = false;
      mockOneSignal.Notifications.requestPermission.mockResolvedValueOnce(false); // Permission denied

      mockFetch.mockResolvedValueOnce(new Response(JSON.stringify({
        success: true,
        data: { enabled: false }
      }), { status: 200 }));

      render(<OneSignalNotificationPanel />);

      await waitFor(() => {
        const toggle = screen.getByRole('checkbox');
        expect(toggle).not.toBeChecked();
      });

      const toggle = screen.getByRole('checkbox');
      await user.click(toggle);

      await waitFor(() => {
        expect(screen.getByText('Se requieren permisos de notificación para recibir alertas.')).toBeInTheDocument();
      }, { timeout: 2000 });
    });

    it('should update preference in database', async () => {
      const user = userEvent.setup();
      
      mockOneSignal.init.mockResolvedValueOnce(undefined);
      mockOneSignal.login.mockResolvedValueOnce(undefined);
      mockOneSignal.User.addTag.mockResolvedValueOnce(undefined);
      mockOneSignal.Notifications.permission = 'granted';

      mockFetch
        .mockResolvedValueOnce(new Response(JSON.stringify({
          success: true,
          data: { enabled: false }
        }), { status: 200 }))
        .mockResolvedValueOnce(new Response(JSON.stringify({
          success: true,
          data: { enabled: true }
        }), { status: 200 }));

      render(<OneSignalNotificationPanel />);

      await waitFor(() => {
        const toggle = screen.getByRole('checkbox');
        expect(toggle).not.toBeChecked();
      });

      const toggle = screen.getByRole('checkbox');
      await user.click(toggle);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(2); // Initial load + update
      });
    });
  });

  describe('Status Display', () => {
    it('should show active status when enabled and permission granted', async () => {
      mockOneSignal.Notifications.permission = 'granted';
      
      mockFetch.mockResolvedValueOnce(new Response(JSON.stringify({
        success: true,
        data: { enabled: true }
      }), { status: 200 }));

      render(<OneSignalNotificationPanel />);

      await waitFor(() => {
        expect(screen.getByText('Activo')).toBeInTheDocument();
      });
    });

    it('should show permission needed when enabled but permission denied', async () => {
      mockOneSignal.Notifications.permission = 'denied';
      
      mockFetch.mockResolvedValueOnce(new Response(JSON.stringify({
        success: true,
        data: { enabled: true }
      }), { status: 200 }));

      render(<OneSignalNotificationPanel />);

      await waitFor(() => {
        expect(screen.getByText('Permisos necesarios')).toBeInTheDocument();
      });
    });
  });

  describe('Test Notification', () => {
    beforeEach(async () => {
      // Setup component with enabled notifications and granted permission
      mockOneSignal.Notifications.permission = 'granted';
      
      mockFetch.mockResolvedValueOnce(new Response(JSON.stringify({
        success: true,
        data: { enabled: true }
      }), { status: 200 }));

      render(<OneSignalNotificationPanel />);

      await waitFor(() => {
        expect(screen.getByRole('checkbox')).toBeChecked();
      });
    });

    it('should show test button when notifications are active', () => {
      expect(screen.getByText('Enviar Notificación de Prueba')).toBeInTheDocument();
    });

    it('should send test notification when button clicked', async () => {
      const user = userEvent.setup();
      
      mockFetch.mockResolvedValueOnce(new Response(JSON.stringify({
        success: true,
        data: { notificationId: 'test-123' }
      }), { status: 200 }));

      const testButton = screen.getByText('Enviar Notificación de Prueba');
      await user.click(testButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/admin/notifications/test', {
          method: 'POST'
        });
      });
    });

    it('should handle test notification errors', async () => {
      const user = userEvent.setup();
      
      mockFetch.mockResolvedValueOnce(new Response(JSON.stringify({
        success: false,
        error: 'OneSignal API error'
      }), { status: 500 }));

      const testButton = screen.getByText('Enviar Notificación de Prueba');
      await user.click(testButton);

      await waitFor(() => {
        expect(screen.getByText('OneSignal API error')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should display OneSignal initialization errors', async () => {
      const user = userEvent.setup();
      
      mockOneSignal.init.mockRejectedValueOnce(new Error('OneSignal init failed'));

      mockFetch.mockResolvedValueOnce(new Response(JSON.stringify({
        success: true,
        data: { enabled: false }
      }), { status: 200 }));

      render(<OneSignalNotificationPanel />);

      await waitFor(() => {
        const toggle = screen.getByRole('checkbox');
        expect(toggle).not.toBeChecked();
      });

      const toggle = screen.getByRole('checkbox');
      await user.click(toggle);

      await waitFor(() => {
        expect(screen.getByText('Error initializing push notifications: OneSignal init failed')).toBeInTheDocument();
      });
    });

    it('should display preference update errors', async () => {
      const user = userEvent.setup();
      
      mockFetch
        .mockResolvedValueOnce(new Response(JSON.stringify({
          success: true,
          data: { enabled: false }
        }), { status: 200 }))
        .mockResolvedValueOnce(new Response(JSON.stringify({
          success: false,
          error: 'Database update failed'
        }), { status: 500 }));

      render(<OneSignalNotificationPanel />);

      await waitFor(() => {
        const toggle = screen.getByRole('checkbox');
        expect(toggle).not.toBeChecked();
      });

      const toggle = screen.getByRole('checkbox');
      await user.click(toggle);

      await waitFor(() => {
        expect(screen.getByText('Database update failed')).toBeInTheDocument();
      });
    });
  });

  describe('Loading States', () => {
    it('should show loading state during preference fetch', () => {
      // Don't resolve the fetch promise immediately
      mockFetch.mockImplementationOnce(() => new Promise(() => {}));

      render(<OneSignalNotificationPanel />);

      expect(screen.getAllByText('Cargando...')).toHaveLength(2); // Loading spinner and status
    });

    it('should disable toggle during loading', async () => {
      const user = userEvent.setup();
      
      // Mock slow preference update
      mockFetch
        .mockResolvedValueOnce(new Response(JSON.stringify({
          success: true,
          data: { enabled: false }
        }), { status: 200 }))
        .mockImplementationOnce(() => new Promise(() => {})); // Never resolves

      render(<OneSignalNotificationPanel />);

      await waitFor(() => {
        const toggle = screen.getByRole('checkbox');
        expect(toggle).not.toBeChecked();
      });

      const toggle = screen.getByRole('checkbox');
      await user.click(toggle);

      // Toggle should be disabled during loading
      expect(toggle).toBeDisabled();
    });
  });
});