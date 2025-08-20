import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import OneSignalNotificationPanel from '@/components/admin/OneSignalNotificationPanel';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock OneSignal SDK
const mockOneSignal = {
  init: vi.fn(),
  sendTag: vi.fn(),
  getNotificationPermission: vi.fn(),
  showSlidedownPrompt: vi.fn(),
};

// Mock dynamic import of react-onesignal
vi.mock('react-onesignal', () => ({
  default: mockOneSignal
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
      mockOneSignal.sendTag.mockResolvedValueOnce(undefined);
      mockOneSignal.getNotificationPermission.mockResolvedValueOnce('granted');

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
          safari_web_id: 'test-app-id',
          notifyButton: { enable: false },
          allowLocalhostAsSecureOrigin: true
        });
      });

      expect(mockOneSignal.sendTag).toHaveBeenCalledWith('user_type', 'admin');
    });

    it('should request permission when needed', async () => {
      const user = userEvent.setup();
      
      // Mock OneSignal with permission denied initially
      mockOneSignal.init.mockResolvedValueOnce(undefined);
      mockOneSignal.sendTag.mockResolvedValueOnce(undefined);
      mockOneSignal.getNotificationPermission.mockResolvedValueOnce('default');
      mockOneSignal.showSlidedownPrompt.mockResolvedValueOnce(true);

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

      await waitFor(() => {
        expect(mockOneSignal.showSlidedownPrompt).toHaveBeenCalled();
      });
    });

    it('should handle permission denied gracefully', async () => {
      const user = userEvent.setup();
      
      mockOneSignal.init.mockResolvedValueOnce(undefined);
      mockOneSignal.sendTag.mockResolvedValueOnce(undefined);
      mockOneSignal.getNotificationPermission.mockResolvedValueOnce('default');
      mockOneSignal.showSlidedownPrompt.mockResolvedValueOnce(false);

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
        expect(screen.getByText('Las notificaciones push requieren permisos del navegador')).toBeInTheDocument();
      });
    });

    it('should update preference in database', async () => {
      const user = userEvent.setup();
      
      mockOneSignal.init.mockResolvedValueOnce(undefined);
      mockOneSignal.sendTag.mockResolvedValueOnce(undefined);
      mockOneSignal.getNotificationPermission.mockResolvedValueOnce('granted');

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
      mockFetch.mockResolvedValueOnce(new Response(JSON.stringify({
        success: true,
        data: { enabled: true }
      }), { status: 200 }));

      const { rerender } = render(<OneSignalNotificationPanel />);

      // Simulate permission denied state
      const component = screen.getByTestId('onesignal-notification-panel');
      fireEvent(component, new CustomEvent('permissionDenied'));

      rerender(<OneSignalNotificationPanel />);

      await waitFor(() => {
        expect(screen.getByText('Desactivado')).toBeInTheDocument();
      });
    });
  });

  describe('Test Notification', () => {
    beforeEach(async () => {
      // Setup component with enabled notifications and granted permission
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
        expect(mockFetch).toHaveBeenCalledTimes(2); // Initial load + test
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
        expect(screen.getByText('Error initializing push notifications')).toBeInTheDocument();
      });
    });

    it('should display preference update errors', async () => {
      const user = userEvent.setup();
      
      mockOneSignal.init.mockResolvedValueOnce(undefined);
      mockOneSignal.sendTag.mockResolvedValueOnce(undefined);
      mockOneSignal.getNotificationPermission.mockResolvedValueOnce('granted');

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
      
      // Mock slow OneSignal init
      mockOneSignal.init.mockImplementationOnce(() => new Promise(() => {}));

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

      // Toggle should be disabled during loading
      expect(toggle).toBeDisabled();
    });
  });
});