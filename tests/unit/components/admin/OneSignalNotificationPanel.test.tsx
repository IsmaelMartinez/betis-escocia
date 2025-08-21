import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import OneSignalNotificationPanel from '@/components/admin/OneSignalNotificationPanel';

// Mock fetch globally
const mockFetch = vi.fn();
Object.defineProperty(globalThis, 'fetch', {
  value: mockFetch,
  writable: true,
  configurable: true,
});

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
    mockFetch.mockReset();
    
    // Reset OneSignal permission state
    mockOneSignal.Notifications.permission = 'default';
    
    // Default successful preference fetch
    mockFetch.mockResolvedValueOnce(new Response(JSON.stringify({
      success: true,
      data: { enabled: false }
    }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
  });

  describe('Basic Rendering', () => {
    it('should render with correct title', () => {
      render(<OneSignalNotificationPanel />);

      expect(screen.getByText('Notificaciones Push')).toBeInTheDocument();
      expect(screen.getByTestId('onesignal-notification-panel')).toBeInTheDocument();
    });

    it('should have proper accessibility attributes', () => {
      render(<OneSignalNotificationPanel />);

      const toggle = screen.getByRole('checkbox');
      expect(toggle).toHaveAttribute('id', 'notification-toggle');
      
      const label = screen.getByLabelText('Recibir notificaciones de actividad');
      expect(label).toBeInTheDocument();
    });

    it('should show notification description', () => {
      render(<OneSignalNotificationPanel />);

      expect(screen.getByText(/RSVP, mensajes de contacto y actividad administrativa/)).toBeInTheDocument();
    });

    it('should show feature description', () => {
      render(<OneSignalNotificationPanel />);

      expect(screen.getByText(/Las notificaciones push te permiten recibir alertas en tiempo real/)).toBeInTheDocument();
    });
  });

  describe('Component Structure', () => {
    it('should render checkbox element', () => {
      render(<OneSignalNotificationPanel />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).toHaveAttribute('type', 'checkbox');
    });

    it('should show status section', () => {
      render(<OneSignalNotificationPanel />);

      expect(screen.getByText('Estado:')).toBeInTheDocument();
    });

    it('should accept custom className', () => {
      const { container } = render(<OneSignalNotificationPanel className="custom-class" />);
      
      // Component should render without errors with custom props
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Mock Integration', () => {
    it('should work with mocked OneSignal', () => {
      render(<OneSignalNotificationPanel />);
      
      // Component should render successfully with mocked dependencies
      expect(screen.getByTestId('onesignal-notification-panel')).toBeInTheDocument();
    });

    it('should work with mocked Clerk user', () => {
      render(<OneSignalNotificationPanel />);
      
      // Component should render successfully with mocked user
      expect(screen.getByRole('checkbox')).toBeInTheDocument();
    });

    it('should work with mocked fetch', () => {
      render(<OneSignalNotificationPanel />);
      
      // Component should render successfully with mocked fetch
      expect(screen.getByText('Notificaciones Push')).toBeInTheDocument();
    });
  });
});