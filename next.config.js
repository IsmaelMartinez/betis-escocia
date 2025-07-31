/** @type {import('next').NextConfig} */
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
  // experimental: {
  //   optimizePackageImports: ['lucide-react'],
  // },
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
