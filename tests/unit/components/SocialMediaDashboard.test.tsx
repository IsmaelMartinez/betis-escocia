import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SocialMediaDashboard from '@/components/SocialMediaDashboard';

// Mock navigator.clipboard
const mockWriteText = vi.fn(() => Promise.resolve());

// Define navigator globally for the test
Object.defineProperty(global, 'navigator', {
  value: {
    clipboard: {
      writeText: mockWriteText,
    },
  },
  writable: true,
});

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
    mockWriteText.mockClear();
  });

  it('should render social media stats cards', () => {
    render(<SocialMediaDashboard />);

    expect(screen.getByText('Instagram')).toBeInTheDocument();
    expect(screen.getByText('Facebook')).toBeInTheDocument();
    expect(screen.getByText('280+')).toBeInTheDocument();
    expect(screen.getByText('420+')).toBeInTheDocument();
  });

  it('should render hashtags section', () => {
    render(<SocialMediaDashboard />);

    expect(screen.getByText('Follow & Tag Us')).toBeInTheDocument();
    expect(screen.getByText('#PenaBetiscaEscocesa')).toBeInTheDocument();
    expect(screen.getByText('#BetisEdinburgh')).toBeInTheDocument();
  });

  it('should hide hashtags when showHashtags is false', () => {
    render(<SocialMediaDashboard showHashtags={false} />);

    expect(screen.queryByText('Follow & Tag Us')).not.toBeInTheDocument();
    expect(screen.queryByText('#PenaBetiscaEscocesa')).not.toBeInTheDocument();
  });

  it('should render feed toggle buttons', () => {
    render(<SocialMediaDashboard />);

    expect(screen.getByText('Both Feeds')).toBeInTheDocument();
    expect(screen.getByText('Instagram Only')).toBeInTheDocument();
    expect(screen.getByText('Facebook Only')).toBeInTheDocument();
  });

  it('should render both feeds by default', () => {
    render(<SocialMediaDashboard />);

    expect(screen.getByTestId('facebook-plugin')).toBeInTheDocument();
    expect(screen.getByTestId('instagram-embed')).toBeInTheDocument();
  });

  it('should switch to Instagram only when clicked', async () => {
    const user = userEvent.setup();
    render(<SocialMediaDashboard />);

    const instagramButton = screen.getByText('Instagram Only');
    await user.click(instagramButton);

    expect(screen.getByTestId('instagram-embed')).toBeInTheDocument();
    expect(screen.queryByTestId('facebook-plugin')).not.toBeInTheDocument();
  });

  it('should switch to Facebook only when clicked', async () => {
    const user = userEvent.setup();
    render(<SocialMediaDashboard />);

    const facebookButton = screen.getByText('Facebook Only');
    await user.click(facebookButton);

    expect(screen.getByTestId('facebook-plugin')).toBeInTheDocument();
    expect(screen.queryByTestId('instagram-embed')).not.toBeInTheDocument();
  });

  it('should render clickable hashtag buttons', () => {
    render(<SocialMediaDashboard />);

    const hashtagButton = screen.getByText('#PenaBetiscaEscocesa');
    
    // Ensure the button is clickable and has the right attributes
    expect(hashtagButton).toBeInTheDocument();
    expect(hashtagButton.tagName).toBe('BUTTON');
    expect(hashtagButton).toHaveAttribute('title', 'Click to copy');
  });

  it('should render community engagement CTA', () => {
    render(<SocialMediaDashboard />);

    expect(screen.getByText('Join Our Digital Community!')).toBeInTheDocument();
    expect(screen.getByText('Follow on Instagram')).toBeInTheDocument();
    expect(screen.getByText('Like on Facebook')).toBeInTheDocument();
  });
});