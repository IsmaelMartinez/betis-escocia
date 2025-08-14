import sitemap from '../../../src/app/sitemap';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getEnabledNavigationItems } from '@/lib/featureFlags';

// Mock the featureFlags module
vi.mock('@/lib/featureFlags', () => ({
  getEnabledNavigationItems: vi.fn(),
}));

describe('sitemap', () => {
  const baseUrl = 'https://betis-escocia.vercel.app';
  const mockDate = new Date('2025-01-01T12:00:00.000Z');

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock Date to ensure consistent lastModified values
    vi.useFakeTimers();
    vi.setSystemTime(mockDate);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should generate sitemap with only static pages when no dynamic navigation items are enabled', async () => {
    vi.mocked(getEnabledNavigationItems).mockResolvedValue([]);

    const result = await sitemap();

    expect(result).toEqual([
      {
        url: baseUrl,
        lastModified: mockDate,
        changeFrequency: 'weekly',
        priority: 1,
      },
      {
        url: `${baseUrl}/partidos`,
        lastModified: mockDate,
        changeFrequency: 'daily',
        priority: 0.9,
      },
    ]);
  });

  it('should generate sitemap with dynamic pages when navigation items are enabled', async () => {
    vi.mocked(getEnabledNavigationItems).mockResolvedValue([
      { href: '/', name: 'Home', nameEn: 'Home', feature: null }, // Should be filtered out as it's a static page
      { href: '/unete', name: 'Únete', nameEn: 'Join Us', feature: null },
      { href: '/contacto', name: 'Contacto', nameEn: 'Contact', feature: null },
      { href: '/galeria', name: 'Galería', nameEn: 'Gallery', feature: 'show-galeria' },
    ]);

    const result = await sitemap();

    expect(result).toEqual(expect.arrayContaining([
      {
        url: baseUrl,
        lastModified: mockDate,
        changeFrequency: 'weekly',
        priority: 1,
      },
      {
        url: `${baseUrl}/partidos`,
        lastModified: mockDate,
        changeFrequency: 'daily',
        priority: 0.9,
      },
      {
        url: `${baseUrl}/unete`,
        lastModified: mockDate,
        changeFrequency: 'monthly',
        priority: 0.9,
      },
      {
        url: `${baseUrl}/contacto`,
        lastModified: mockDate,
        changeFrequency: 'monthly',
        priority: 0.9,
      },
      {
        url: `${baseUrl}/galeria`,
        lastModified: mockDate,
        changeFrequency: 'monthly',
        priority: 0.8,
      },
    ]));
    expect(result.length).toBe(5); // Static + partidos + 3 dynamic
  });

  it('should handle different priorities for dynamic pages', async () => {
    vi.mocked(getEnabledNavigationItems).mockResolvedValue([
      { href: '/unete', name: 'Únete', nameEn: 'Join Us', feature: null },
      { href: '/galeria', name: 'Galería', nameEn: 'Gallery', feature: 'show-galeria' },
    ]);

    const result = await sitemap();

    const unetePage = result.find(page => page.url === `${baseUrl}/unete`);
    const galeriaPage = result.find(page => page.url === `${baseUrl}/galeria`);

    expect(unetePage?.priority).toBe(0.9);
    expect(galeriaPage?.priority).toBe(0.8);
  });
});