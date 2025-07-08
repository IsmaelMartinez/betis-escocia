import { MetadataRoute } from 'next'
import { getEnabledNavigationItems } from '@/lib/featureFlags'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://betis-escocia.vercel.app'
  const enabledNavigation = getEnabledNavigationItems()
  
  // Static pages that are always available
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1,
    },
  ]
  
  // Dynamic pages based on feature flags
  const dynamicPages = enabledNavigation
    .filter(item => item.href !== '/') // Don't duplicate home page
    .map(item => ({
      url: `${baseUrl}${item.href}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: item.href === '/unete' || item.href === '/contacto' ? 0.9 : 0.8,
    }))
  
  // Special pages with different priorities
  const specialPages = [
    {
      url: `${baseUrl}/partidos`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
  ]
  
  return [
    ...staticPages,
    ...dynamicPages,
    ...specialPages,
  ]
}
