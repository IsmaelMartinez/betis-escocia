import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'crests.football-data.org',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'logos.football-data.org',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.football-data.org',
        port: '',
        pathname: '/v4/teams/*/crest',
      },
    ],
  },
};

export default nextConfig;
