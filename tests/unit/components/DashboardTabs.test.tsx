import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DashboardTabs from '@/components/DashboardTabs';

// Mock Clerk components
vi.mock('@clerk/nextjs', () => ({
  UserProfile: () => <div data-testid="user-profile">User Profile</div>,
  useAuth: () => ({
    getToken: vi.fn(() => Promise.resolve('mock-token')),
    userId: 'user_123',
    isLoaded: true,
    isSignedIn: true
  })
}));

// Mock child components
vi.mock('@/components/admin/UserManagement', () => ({
  default: () => <div data-testid="user-management">User Management</div>
}));

vi.mock('@/components/admin/MatchesList', () => ({
  default: () => <div data-testid="matches-list">Matches List</div>
}));

vi.mock('@/components/admin/ContactSubmissionsList', () => ({
  default: () => <div data-testid="contact-submissions">Contact Submissions</div>
}));

vi.mock('@/components/DashboardDisplay', () => ({
  default: () => <div data-testid="dashboard-display">Dashboard Display</div>
}));

vi.mock('@/components/TriviaScoreDisplay', () => ({
  default: () => <div data-testid="trivia-score">Trivia Score</div>
}));

vi.mock('@/components/user/GDPRTabContent', () => ({
  default: () => <div data-testid="gdpr-content">GDPR Content</div>
}));

describe('DashboardTabs', () => {
  const mockProps = {
    user: {
      id: 'user_123',
      firstName: 'Test',
      lastName: 'User',
      emailAddresses: [{ emailAddress: 'test@example.com' }],
      createdAt: Date.now(),
      lastSignInAt: Date.now()
    },
    rsvps: [],
    contactSubmissions: [],
    counts: {
      rsvpCount: 5,
      contactCount: 3,
      totalSubmissions: 8
    },
    userName: 'Test User'
  };

  it('should render all tab buttons', () => {
    render(<DashboardTabs {...mockProps} />);

    expect(screen.getByRole('button', { name: /mi dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /mi perfil/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /tus datos gdpr/i })).toBeInTheDocument();
  });

  it('should show dashboard tab by default', () => {
    render(<DashboardTabs {...mockProps} />);

    expect(screen.getByTestId('dashboard-display')).toBeInTheDocument();
    expect(screen.queryByTestId('user-profile')).not.toBeInTheDocument();
    expect(screen.queryByTestId('gdpr-content')).not.toBeInTheDocument();
  });

  it('should switch to profile tab when clicked', async () => {
    const user = userEvent.setup();
    render(<DashboardTabs {...mockProps} />);

    const profileTab = screen.getByRole('button', { name: /mi perfil/i });
    await user.click(profileTab);

    expect(screen.getByTestId('user-profile')).toBeInTheDocument();
    expect(screen.queryByTestId('dashboard-display')).not.toBeInTheDocument();
  });

  it('should switch to privacy tab when clicked', async () => {
    const user = userEvent.setup();
    render(<DashboardTabs {...mockProps} />);

    const privacyTab = screen.getByRole('button', { name: /tus datos gdpr/i });
    await user.click(privacyTab);

    expect(screen.getByTestId('gdpr-content')).toBeInTheDocument();
    expect(screen.queryByTestId('dashboard-display')).not.toBeInTheDocument();
  });

  it('should maintain active state on selected tab', async () => {
    const user = userEvent.setup();
    render(<DashboardTabs {...mockProps} />);

    const profileTab = screen.getByRole('button', { name: /mi perfil/i });
    await user.click(profileTab);

    // Check that the profile tab has the active styling
    expect(profileTab).toHaveClass('border-b-2 border-betis-green text-betis-green');
    
    // Check that dashboard tab doesn't have the active styling
    const dashboardTab = screen.getByRole('button', { name: /mi dashboard/i });
    expect(dashboardTab).toHaveClass('text-gray-500 hover:text-gray-700');
  });

  it('should have proper accessibility attributes', () => {
    render(<DashboardTabs {...mockProps} />);

    // Check that all tab buttons are present
    const buttons = screen.getAllByRole('button');
    const tabButtons = buttons.filter(button => 
      button.textContent?.includes('Mi Dashboard') ||
      button.textContent?.includes('Mi Perfil') ||
      button.textContent?.includes('Tus Datos GDPR')
    );
    expect(tabButtons).toHaveLength(3);

    // Verify the buttons are clickable
    tabButtons.forEach(button => {
      expect(button).toBeEnabled();
    });
  });
});