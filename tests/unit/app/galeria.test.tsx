import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock feature flags
vi.mock('@/lib/featureProtection', () => ({
  withFeatureFlag: (Component: any) => Component
}));

// Mock components
vi.mock('@/components/InstagramEmbed', () => ({
  default: ({ showHeader }: { showHeader?: boolean }) => (
    <div data-testid="instagram-embed">Instagram Embed {showHeader && 'with header'}</div>
  )
}));

vi.mock('@/components/FacebookPagePlugin', () => ({
  default: ({ showHeader, height }: { showHeader?: boolean; height?: number }) => (
    <div data-testid="facebook-page-plugin">
      Facebook Plugin {showHeader && 'with header'} height: {height}
    </div>
  )
}));

describe('Galeria Page', () => {
  it('should render the main heading', async () => {
    const GaleriaPage = (await import('@/app/galeria/page')).default;
    render(<GaleriaPage />);

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText('Galería Social')).toBeInTheDocument();
  });

  it('should render page description', async () => {
    const GaleriaPage = (await import('@/app/galeria/page')).default;
    render(<GaleriaPage />);

    expect(screen.getByText(/Discover our vibrant community through Instagram and Facebook/)).toBeInTheDocument();
    expect(screen.getByText(/See the latest photos, updates, and match day moments/)).toBeInTheDocument();
  });

  it('should render social media promotion section', async () => {
    const GaleriaPage = (await import('@/app/galeria/page')).default;
    render(<GaleriaPage />);

    expect(screen.getByText('Share Your Betis Moments!')).toBeInTheDocument();
    expect(screen.getByText(/Tag us in your photos wearing peña merchandise/)).toBeInTheDocument();
  });

  it('should render social media handles and hashtags', async () => {
    const GaleriaPage = (await import('@/app/galeria/page')).default;
    render(<GaleriaPage />);

    expect(screen.getByText('@rbetisescocia')).toBeInTheDocument();
    expect(screen.getByText('Peña Bética Escocesa')).toBeInTheDocument();
    expect(screen.getByText('#PenaBetiscaEscocesa')).toBeInTheDocument();
    expect(screen.getByText('#BetisEdinburgh')).toBeInTheDocument();
  });

  it('should render live social media feeds section', async () => {
    const GaleriaPage = (await import('@/app/galeria/page')).default;
    render(<GaleriaPage />);

    expect(screen.getByText(/Live Social Media Feeds/)).toBeInTheDocument();
    expect(screen.getByText(/See the latest content from our Instagram and Facebook feeds/)).toBeInTheDocument();
  });

  it('should render external social media links', async () => {
    const GaleriaPage = (await import('@/app/galeria/page')).default;
    render(<GaleriaPage />);

    const instagramLink = screen.getByRole('link', { name: /Follow on Instagram/ });
    const facebookLink = screen.getByRole('link', { name: /Follow on Facebook/ });

    expect(instagramLink).toHaveAttribute('href', 'https://instagram.com/rbetisescocia');
    expect(instagramLink).toHaveAttribute('target', '_blank');
    expect(facebookLink).toHaveAttribute('href', 'https://facebook.com/penabetiscaescocesa');
    expect(facebookLink).toHaveAttribute('target', '_blank');
  });

  it('should render Instagram and Facebook embeds', async () => {
    const GaleriaPage = (await import('@/app/galeria/page')).default;
    render(<GaleriaPage />);

    expect(screen.getByTestId('instagram-embed')).toBeInTheDocument();
    expect(screen.getByTestId('facebook-page-plugin')).toBeInTheDocument();
  });

  it('should render call to action section', async () => {
    const GaleriaPage = (await import('@/app/galeria/page')).default;
    render(<GaleriaPage />);

    expect(screen.getByText('Ready to Share Your Betis Pride?')).toBeInTheDocument();
    expect(screen.getByText(/Join hundreds of béticos sharing their match day experiences/)).toBeInTheDocument();
  });

  it('should render action links', async () => {
    const GaleriaPage = (await import('@/app/galeria/page')).default;
    render(<GaleriaPage />);

    const merchandiseLink = screen.getByRole('link', { name: /View Our Merchandise/ });
    const rsvpLink = screen.getByRole('link', { name: /Join Us at Polwarth/ });
    const socialLink = screen.getByRole('link', { name: /Social Media Guide/ });

    expect(merchandiseLink).toHaveAttribute('href', '/coleccionables');
    expect(rsvpLink).toHaveAttribute('href', '/rsvp');
    expect(socialLink).toHaveAttribute('href', '/redes-sociales');
  });

  it('should render community statistics', async () => {
    const GaleriaPage = (await import('@/app/galeria/page')).default;
    render(<GaleriaPage />);

    expect(screen.getByText('700+')).toBeInTheDocument();
    expect(screen.getByText('Total Followers')).toBeInTheDocument();
    
    expect(screen.getByText('150+')).toBeInTheDocument();
    expect(screen.getByText('Photos Shared')).toBeInTheDocument();
    expect(screen.getByText('This Month')).toBeInTheDocument();
    
    expect(screen.getByText('25+')).toBeInTheDocument();
    expect(screen.getByText('Active Members')).toBeInTheDocument();
    expect(screen.getByText('Edinburgh Area')).toBeInTheDocument();
  });

  it('should render social media guidelines', async () => {
    const GaleriaPage = (await import('@/app/galeria/page')).default;
    render(<GaleriaPage />);

    expect(screen.getByText(/Social Media Guidelines/)).toBeInTheDocument();
    expect(screen.getByText(/What to Post:/)).toBeInTheDocument();
    expect(screen.getByText(/Tags to Use:/)).toBeInTheDocument();
  });

  it('should render posting guidelines', async () => {
    const GaleriaPage = (await import('@/app/galeria/page')).default;
    render(<GaleriaPage />);

    expect(screen.getByText(/Match day photos at Polwarth Tavern/)).toBeInTheDocument();
    expect(screen.getByText(/Merchandise collection photos/)).toBeInTheDocument();
    expect(screen.getByText(/Community events and gatherings/)).toBeInTheDocument();
    expect(screen.getByText(/Real Betis celebration moments/)).toBeInTheDocument();
    expect(screen.getByText(/Edinburgh Betis fan meetups/)).toBeInTheDocument();
  });

  it('should render hashtag guidelines', async () => {
    const GaleriaPage = (await import('@/app/galeria/page')).default;
    render(<GaleriaPage />);

    // Check for hashtags in guidelines section - using getAllByText since they appear multiple times
    expect(screen.getAllByText(/#PenaBetiscaEscocesa/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/#BetisEdinburgh/).length).toBeGreaterThan(0);
    expect(screen.getByText('• #RealBetis')).toBeInTheDocument();
    expect(screen.getByText('• #PolwarthTavern')).toBeInTheDocument();
    expect(screen.getByText('• @rbetisescocia')).toBeInTheDocument();
  });

  it('should have proper accessibility structure with headings', async () => {
    const GaleriaPage = (await import('@/app/galeria/page')).default;
    render(<GaleriaPage />);

    // Should have hierarchical heading structure
    const headings = screen.getAllByRole('heading');
    expect(headings.length).toBeGreaterThan(0);
    
    // Should have a main heading (h1)
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1).toBeInTheDocument();
    expect(h1).toHaveTextContent('Galería Social');
  });

  it('should render camera icon', async () => {
    const GaleriaPage = (await import('@/app/galeria/page')).default;
    render(<GaleriaPage />);

    // Camera icon should be present (rendered by lucide-react)
    const cameraIcon = screen.getByText('Galería Social').previousElementSibling;
    expect(cameraIcon).toBeInTheDocument();
  });
});