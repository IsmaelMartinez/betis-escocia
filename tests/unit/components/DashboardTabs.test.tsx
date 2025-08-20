import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DashboardTabs from '@/components/DashboardTabs';

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

describe('DashboardTabs', () => {
  it('should render all tab buttons', () => {
    render(<DashboardTabs />);

    expect(screen.getByRole('tab', { name: /usuarios/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /partidos/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /contactos/i })).toBeInTheDocument();
  });

  it('should show users tab by default', () => {
    render(<DashboardTabs />);

    expect(screen.getByTestId('user-management')).toBeInTheDocument();
    expect(screen.queryByTestId('matches-list')).not.toBeInTheDocument();
    expect(screen.queryByTestId('contact-submissions')).not.toBeInTheDocument();
  });

  it('should switch to matches tab when clicked', async () => {
    const user = userEvent.setup();
    render(<DashboardTabs />);

    const matchesTab = screen.getByRole('tab', { name: /partidos/i });
    await user.click(matchesTab);

    expect(screen.getByTestId('matches-list')).toBeInTheDocument();
    expect(screen.queryByTestId('user-management')).not.toBeInTheDocument();
  });

  it('should switch to contacts tab when clicked', async () => {
    const user = userEvent.setup();
    render(<DashboardTabs />);

    const contactsTab = screen.getByRole('tab', { name: /contactos/i });
    await user.click(contactsTab);

    expect(screen.getByTestId('contact-submissions')).toBeInTheDocument();
    expect(screen.queryByTestId('user-management')).not.toBeInTheDocument();
  });

  it('should maintain active state on selected tab', async () => {
    const user = userEvent.setup();
    render(<DashboardTabs />);

    const matchesTab = screen.getByRole('tab', { name: /partidos/i });
    await user.click(matchesTab);

    expect(matchesTab).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: /usuarios/i })).toHaveAttribute('aria-selected', 'false');
  });

  it('should have proper accessibility attributes', () => {
    render(<DashboardTabs />);

    const tabList = screen.getByRole('tablist');
    expect(tabList).toBeInTheDocument();

    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(3);

    tabs.forEach(tab => {
      expect(tab).toHaveAttribute('aria-selected');
    });
  });
});