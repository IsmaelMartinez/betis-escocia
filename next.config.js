/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          
        ],
      },
    ];
  },
  // Security improvements
  poweredByHeader: false,
  reactStrictMode: true,
  // Disable Vercel Analytics and Speed Insights for local production builds
  // These are typically enabled for Vercel deployments and might not be necessary or correctly configured for local builds.
  // To enable them, remove these lines and ensure your Vercel project is configured correctly.
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  productionBrowserSourceMaps: false,
  // experimental: {
  //   optimizePackageImports: ['lucide-react'],
  // },
};
          

module.exports = nextConfig;