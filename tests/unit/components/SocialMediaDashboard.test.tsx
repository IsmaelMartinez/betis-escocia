import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SocialMediaDashboard from '@/components/SocialMediaDashboard';

// Mock feature flags
vi.mock('@/lib/featureFlags', () => ({
  hasFeature: vi.fn((feature) => feature === 'show-social-media')
}));

// Mock social media components
vi.mock('@/components/FacebookPagePlugin', () => ({
  default: () => <div data-testid="facebook-plugin">Facebook Plugin</div>
}));

vi.mock('@/components/InstagramEmbed', () => ({
  default: () => <div data-testid="instagram-embed">Instagram Embed</div>
}));

describe('SocialMediaDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render when feature is enabled', () => {
    vi.mocked(require('@/lib/featureFlags').hasFeature).mockReturnValue(true);
    
    render(<SocialMediaDashboard />);

    expect(screen.getByText(/redes sociales/i)).toBeInTheDocument();
    expect(screen.getByTestId('facebook-plugin')).toBeInTheDocument();
    expect(screen.getByTestId('instagram-embed')).toBeInTheDocument();
  });

  it('should not render when feature is disabled', () => {
    vi.mocked(require('@/lib/featureFlags').hasFeature).mockReturnValue(false);
    
    const { container } = render(<SocialMediaDashboard />);

    expect(container.firstChild).toBeNull();
  });

  it('should have proper section structure', () => {
    vi.mocked(require('@/lib/featureFlags').hasFeature).mockReturnValue(true);
    
    render(<SocialMediaDashboard />);

    const section = screen.getByRole('region', { name: /redes sociales/i });
    expect(section).toBeInTheDocument();
    expect(section).toHaveClass('space-y-8');
  });

  it('should render social media platforms in correct order', () => {
    vi.mocked(require('@/lib/featureFlags').hasFeature).mockReturnValue(true);
    
    render(<SocialMediaDashboard />);

    const facebook = screen.getByTestId('facebook-plugin');
    const instagram = screen.getByTestId('instagram-embed');
    
    expect(facebook.nextElementSibling).toBe(instagram);
  });

  it('should have responsive layout classes', () => {
    vi.mocked(require('@/lib/featureFlags').hasFeature).mockReturnValue(true);
    
    render(<SocialMediaDashboard />);

    const container = screen.getByRole('region').firstChild;
    expect(container).toHaveClass('grid', 'grid-cols-1', 'lg:grid-cols-2');
  });

  it('should handle loading states gracefully', () => {
    vi.mocked(require('@/lib/featureFlags').hasFeature).mockReturnValue(true);
    
    // Mock components with loading states
    vi.mocked(require('@/components/FacebookPagePlugin')).default = () => (
      <div data-testid="facebook-loading">Loading Facebook...</div>
    );
    
    render(<SocialMediaDashboard />);

    expect(screen.getByTestId('facebook-loading')).toBeInTheDocument();
  });
});