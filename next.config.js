/** @type {import('next').NextConfig} */

// Content Security Policy configuration
const cspDirectives = {
  "default-src": "'self'",
  "script-src":
    "'self' 'unsafe-inline' 'unsafe-eval' https://connect.facebook.net https://vercel.live https://va.vercel-scripts.com https://vercel.app https://*.clerk.accounts.dev https://*.clerk.dev https://www.google.com https://www.gstatic.com https://www.recaptcha.net https://recaptcha.net https://js.hcaptcha.com https://hcaptcha.com https://challenges.cloudflare.com https://cdn.jsdelivr.net https://unpkg.com https://cdn.onesignal.com https://api.onesignal.com",
  "style-src":
    "'self' 'unsafe-inline' https://www.google.com https://www.gstatic.com https://hcaptcha.com https://challenges.cloudflare.com https://onesignal.com",
  "img-src": "'self' data: https: blob:",
  "font-src": "'self' data: https://www.gstatic.com https://fonts.gstatic.com",
  "connect-src":
    "'self' https://*.supabase.co https://api.supabase.io https://vercel.live https://vercel.app https://*.clerk.accounts.dev https://*.clerk.dev https://api.clerk.com https://www.google.com https://www.recaptcha.net https://recaptcha.net https://hcaptcha.com https://api.hcaptcha.com https://challenges.cloudflare.com https://clerk.com https://onesignal.com https://*.onesignal.com https://api.onesignal.com",
  "frame-src":
    "'self' https://www.facebook.com https://*.clerk.accounts.dev https://*.clerk.dev https://www.google.com https://www.recaptcha.net https://recaptcha.net https://hcaptcha.com https://newassets.hcaptcha.com https://challenges.cloudflare.com https://vercel.live https://*.vercel.live",
  "worker-src": "'self' blob:",
  "child-src": "'self' blob:",
  "object-src": "'none'",
  "base-uri": "'self'",
  "form-action": "'self'",
  "frame-ancestors": "'none'",
};

const cspHeader = Object.entries(cspDirectives)
  .map(([directive, value]) => `${directive} ${value}`)
  .join("; ");

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.clerk.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: cspHeader,
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
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
    removeConsole: process.env.NODE_ENV === "production",
  },
  productionBrowserSourceMaps: true,
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "date-fns",
      "@clerk/nextjs",
      "@supabase/supabase-js",
    ],
  },
};

const { withSentryConfig } = require("@sentry/nextjs");

module.exports = withSentryConfig(nextConfig, {
  // For all available options, see: https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger amount of data to Sentry
  widenClientFileUpload: true,

  // Transpiles SDK to be compatible with older browsers.
  // Remove this if you only support modern browsers
  transpileClientSDK: true,

  // Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can't be configured when a custom `server.dev.url` is set in the Sentry config.
  tunnelRoute: "/monitoring-tunnel",

  // Hides source maps from generated client bundles.
  hideSourceMaps: true,

  // Automatically tree-shake Sentry SDKs to optimize bundle size.
  autoInstrumentServerFunctions: true,
  autoInstrumentClientFunctions: true,

  // For all available options, see: https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/
});
