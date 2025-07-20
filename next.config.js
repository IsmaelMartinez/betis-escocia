/** @type {import('next').NextConfig} */
const nextConfig = {
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
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://connect.facebook.net https://*.vercel.live https://*.vercel.app https://*.clerk.accounts.dev https://*.clerk.dev https://www.google.com https://www.gstatic.com https://www.recaptcha.net https://recaptcha.net https://js.hcaptcha.com https://hcaptcha.com https://challenges.cloudflare.com https://cdn.jsdelivr.net https://unpkg.com blob:; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; media-src 'self'; font-src 'self'; connect-src 'self' https://*.supabase.co https://api.supabase.io https://*.vercel.live https://*.vercel.app https://*.clerk.accounts.dev https://*.clerk.dev https://api.clerk.com https://www.google.com https://www.recaptcha.net https://recaptcha.net https://hcaptcha.com https://api.hcaptcha.com https://challenges.cloudflare.com https://clerk.com https://clerk-telemetry.com https://*.clerk-telemetry.com; worker-src blob:; object-src 'none'; frame-ancestors 'none'; form-action 'self'; base-uri 'self';"
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
