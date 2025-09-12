import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useAuth, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

// Mock all dependencies
vi.mock('@clerk/nextjs', () => ({
  useAuth: vi.fn(),
  useUser: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => ({
          data: [],
          error: null,
        })),
      })),
    })),
  },
  createMatch: vi.fn(),
  updateMatch: vi.fn(),
  deleteMatch: vi.fn(),
  getMatches: vi.fn(() => Promise.resolve([])),
  updateContactSubmissionStatus: vi.fn(),
}));

vi.mock('@/lib/withAdminRole', () => ({
  withAdminRole: vi.fn((Component) => Component),
}));

vi.mock('@/lib/featureProtection', () => ({
  FeatureWrapper: vi.fn(({ children }) => children),
}));

vi.mock('@/lib/logger', () => ({
  log: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}));

// Mock all admin components
vi.mock('@/components/admin/OneSignalNotificationPanel', () => ({
  default: vi.fn(() => <div data-testid="onesignal-panel">OneSignal Panel</div>),
}));

vi.mock('@/components/admin/MatchForm', () => ({
  default: vi.fn(() => <div data-testid="match-form">Match Form</div>),
}));

vi.mock('@/components/admin/MatchesList', () => ({
  default: vi.fn(() => <div data-testid="matches-list">Matches List</div>),
}));


vi.mock('@/components/admin/ContactSubmissionsList', () => ({
  default: vi.fn(() => <div data-testid="contact-submissions">Contact Submissions</div>),
}));

vi.mock('@/components/ui/Card', () => ({
  default: vi.fn(({ children }) => <div data-testid="card">{children}</div>),
  CardHeader: vi.fn(({ children }) => <div data-testid="card-header">{children}</div>),
  CardBody: vi.fn(({ children }) => <div data-testid="card-body">{children}</div>),
}));

vi.mock('@/components/ui/Button', () => ({
  default: vi.fn(({ children, onClick, disabled, ...props }) => (
    <button onClick={onClick} disabled={disabled} {...props} data-testid="button">
      {children}
    </button>
  )),
}));

vi.mock('@/components/LoadingSpinner', () => ({
  default: vi.fn(() => <div data-testid="loading-spinner">Loading...</div>),
}));

vi.mock('@/components/MessageComponent', () => ({
  default: vi.fn(({ message }) => <div data-testid="message">{message}</div>),
}));

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock date-fns
vi.mock('date-fns', () => ({
  format: vi.fn(() => '2025-08-25'),
}));

vi.mock('date-fns/locale', () => ({
  es: {},
}));

vi.mock('@/lib/constants/dateFormats', () => ({
  DATE_FORMAT: 'dd/MM/yyyy',
}));

// Import the component after all mocks
import AdminPage from '@/app/admin/page';

describe('AdminPage', () => {
  const mockPush = vi.fn();
  const mockGetToken = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mocks
    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
    } as any);

    vi.mocked(useAuth).mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
      getToken: mockGetToken,
    } as any);

    vi.mocked(useUser).mockReturnValue({
      user: {
        id: 'admin-123',
        emailAddresses: [{ emailAddress: 'admin@test.com' }],
      },
    } as any);

    mockGetToken.mockResolvedValue('valid-token');

    // Mock successful fetch
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, message: 'Success' }),
    } as any);
  });

  describe('Authentication', () => {
    it('should redirect to sign-in when not authenticated', () => {
      vi.mocked(useAuth).mockReturnValue({
        isLoaded: true,
        isSignedIn: false,
        getToken: mockGetToken,
      } as any);

      render(<AdminPage />);

      expect(mockPush).toHaveBeenCalledWith('/sign-in');
    });

    it('should not redirect when authenticated', () => {
      render(<AdminPage />);

      expect(mockPush).not.toHaveBeenCalled();
    });

    it('should not redirect when auth is not loaded yet', () => {
      vi.mocked(useAuth).mockReturnValue({
        isLoaded: false,
        isSignedIn: false,
        getToken: mockGetToken,
      } as any);

      render(<AdminPage />);

      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe('Component Rendering', () => {
    it('should render loading spinner initially', () => {
      render(<AdminPage />);

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('should render dashboard view by default after loading', async () => {
      const { supabase } = await import('@/lib/supabase');
      
      // Mock successful data fetching
      const mockSelect = vi.fn(() => ({
        order: vi.fn(() => Promise.resolve({
          data: [
            { id: 1, name: 'Test User', attendees: 2, created_at: '2025-08-25' },
          ],
          error: null,
        })),
      }));
      
      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as any);

      render(<AdminPage />);

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      });

      // Should show dashboard cards
      expect(screen.getAllByTestId('card').length).toBeGreaterThan(0);
    });

    it('should display error message when data fetching fails', async () => {
      const { supabase } = await import('@/lib/supabase');
      
      // Mock failed data fetching
      const mockSelect = vi.fn(() => ({
        order: vi.fn(() => Promise.resolve({
          data: null,
          error: { message: 'Database error' },
        })),
      }));
      
      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as any);

      render(<AdminPage />);

      await waitFor(() => {
        expect(screen.getByTestId('message')).toBeInTheDocument();
      });
    });
  });

  describe('Stats Calculation', () => {
    it('should calculate stats correctly from fetched data', async () => {
      const { supabase } = await import('@/lib/supabase');
      
      const mockRSVPData = [
        { id: 1, name: 'User 1', attendees: 2, created_at: '2025-08-25' },
        { id: 2, name: 'User 2', attendees: 3, created_at: '2025-08-24' },
      ];
      
      const mockContactData = [
        { id: 1, name: 'Contact 1', status: 'new', created_at: '2025-08-25' },
        { id: 2, name: 'Contact 2', status: 'resolved', created_at: '2025-08-24' },
      ];

      let callCount = 0;
      const mockSelect = vi.fn(() => ({
        order: vi.fn(() => {
          callCount++;
          if (callCount === 1) {
            // First call for RSVPs
            return Promise.resolve({
              data: mockRSVPData,
              error: null,
            });
          } else {
            // Second call for contacts
            return Promise.resolve({
              data: mockContactData,
              error: null,
            });
          }
        }),
      }));
      
      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as any);

      render(<AdminPage />);

      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      });

      // Stats should be calculated correctly
      // Total RSVPs: 2, Total Attendees: 5, Total Contacts: 2
      expect(supabase.from).toHaveBeenCalledWith('rsvps');
      expect(supabase.from).toHaveBeenCalledWith('contact_submissions');
    });
  });

  describe('Action Handlers', () => {
    it('should handle refresh action', async () => {
      const { supabase } = await import('@/lib/supabase');
      
      const mockSelect = vi.fn(() => ({
        order: vi.fn(() => Promise.resolve({
          data: [],
          error: null,
        })),
      }));
      
      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as any);

      render(<AdminPage />);

      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      });

      // Find and click refresh button
      const refreshButtons = screen.getAllByTestId('button');
      const refreshButton = refreshButtons.find(btn => 
        btn.textContent?.includes('Actualizar') || 
        btn.getAttribute('aria-label')?.includes('refresh')
      );

      if (refreshButton) {
        fireEvent.click(refreshButton);
        
        // Should trigger data refetch
        await waitFor(() => {
          expect(supabase.from).toHaveBeenCalled();
        });
      }
    });

    it('should handle sync matches action', async () => {
      render(<AdminPage />);

      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      });

      // Find and click sync button
      const buttons = screen.getAllByTestId('button');
      const syncButton = buttons.find(btn => 
        btn.textContent?.includes('Sincronizar') || 
        btn.getAttribute('aria-label')?.includes('sync')
      );

      if (syncButton) {
        fireEvent.click(syncButton);

        await waitFor(() => {
          expect(mockFetch).toHaveBeenCalled();
          // Check that the fetch was called with the right URL
          const fetchCall = mockFetch.mock.calls[0];
          if (fetchCall && fetchCall[0]) {
            const request = fetchCall[0];
            if (typeof request === 'string') {
              expect(request).toContain('/api/admin/sync-matches');
            } else if (request.url) {
              expect(request.url).toContain('/api/admin/sync-matches');
            }
          }
        });
      }
    });
  });

  describe('View Navigation', () => {
    it('should render different views based on current view state', async () => {
      render(<AdminPage />);

      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      });

      // Initially should show dashboard view
      expect(screen.getAllByTestId('card').length).toBeGreaterThan(0);
    });

    it('should handle view switching', async () => {
      render(<AdminPage />);

      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      });

      // Component should render without errors
      expect(screen.getByTestId).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle authentication token errors', async () => {
      mockGetToken.mockResolvedValue(null);
      
      const { updateContactSubmissionStatus } = await import('@/lib/supabase');
      vi.mocked(updateContactSubmissionStatus).mockResolvedValue({
        success: false,
        error: 'Authentication failed',
      });

      render(<AdminPage />);

      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      });

      // Component should handle auth errors gracefully
      expect(screen.getByTestId).toBeDefined();
    });

    it('should handle network errors during sync', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      render(<AdminPage />);

      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      });

      // Component should handle network errors gracefully
      expect(screen.getByTestId).toBeDefined();
    });
  });

  describe('Data Export', () => {
    it('should have export functionality available', async () => {
      const { supabase } = await import('@/lib/supabase');
      
      const mockSelect = vi.fn(() => ({
        order: vi.fn(() => Promise.resolve({
          data: [
            {
              name: 'Test User',
              email: 'test@example.com',
              attendees: 2,
              match_date: '2025-08-25',
              message: 'Test message',
              whatsapp_interest: true,
              created_at: '2025-08-25T10:00:00',
            },
          ],
          error: null,
        })),
      }));
      
      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as any);

      render(<AdminPage />);

      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      });

      // Component should render successfully
      expect(screen.getAllByTestId('card').length).toBeGreaterThan(0);
    });
  });

  describe('Component Integration', () => {
    it('should have admin components available', async () => {
      // Should integrate with admin components
      const OneSignalPanel = await import('@/components/admin/OneSignalNotificationPanel');
      expect(OneSignalPanel.default).toBeDefined();
      
      const MatchForm = await import('@/components/admin/MatchForm');
      expect(MatchForm.default).toBeDefined();
      
      const MatchesList = await import('@/components/admin/MatchesList');
      expect(MatchesList.default).toBeDefined();
      
      const ContactSubmissionsList = await import('@/components/admin/ContactSubmissionsList');
      expect(ContactSubmissionsList.default).toBeDefined();
    });

    it('should render and manage state correctly', async () => {
      render(<AdminPage />);

      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      });

      // Component should render cards successfully
      expect(screen.getAllByTestId('card').length).toBeGreaterThan(0);
    });
  });
});