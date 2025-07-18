import { MetadataRoute } from 'next';
import { isFeatureEnabled } from '@/lib/flags';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://betis-escocia.vercel.app';

  const navigationItems = [
    { href: '/', priority: 1, changeFrequency: 'weekly' as const },
    { href: '/rsvp', feature: 'show-rsvp', priority: 0.8, changeFrequency: 'monthly' as const },
    { href: '/clasificacion', feature: 'show-clasificacion', priority: 0.8, changeFrequency: 'monthly' as const },
    { href: '/partidos', feature: 'show-partidos', priority: 0.9, changeFrequency: 'daily' as const },
    { href: '/coleccionables', feature: 'show-coleccionables', priority: 0.8, changeFrequency: 'monthly' as const },
    { href: '/galeria', feature: 'show-galeria', priority: 0.8, changeFrequency: 'monthly' as const },
    { href: '/historia', feature: 'show-history', priority: 0.8, changeFrequency: 'monthly' as const },
    { href: '/nosotros', feature: 'show-nosotros', priority: 0.8, changeFrequency: 'monthly' as const },
    { href: '/unete', feature: 'show-unete', priority: 0.9, changeFrequency: 'monthly' as const },
    { href: '/contacto', feature: 'show-contacto', priority: 0.9, changeFrequency: 'monthly' as const },
    { href: '/porra', feature: 'show-porra', priority: 0.8, changeFrequency: 'monthly' as const },
    { href: '/redes-sociales', feature: 'show-redes-sociales', priority: 0.8, changeFrequency: 'monthly' as const },
    { href: '/admin', feature: 'show-admin', priority: 0.1, changeFrequency: 'yearly' as const },
  ];

  const enabledPages = navigationItems
    .filter((item) => !item.feature || isFeatureEnabled(item.feature))
    .map((item) => ({
      url: `${baseUrl}${item.href}`,
      lastModified: new Date(),
      changeFrequency: item.changeFrequency,
      priority: item.priority,
    }));

  return enabledPages;
}
