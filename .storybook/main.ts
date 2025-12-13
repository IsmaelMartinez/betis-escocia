import type { StorybookConfig } from '@storybook/nextjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config: StorybookConfig = {
  "stories": [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  "addons": [
    "@storybook/addon-docs", 
    "@storybook/addon-onboarding"
  ],
  "framework": {
    "name": "@storybook/nextjs",
    "options": {
      "nextConfigPath": "../next.config.mjs"
    }
  },
  "webpackFinal": async (config) => {
    // Ensure config.resolve exists
    if (!config.resolve) {
      config.resolve = {};
    }
    if (!config.resolve.alias) {
      config.resolve.alias = {};
    }
    
    config.resolve.alias = {
      ...config.resolve.alias,
      "@clerk/nextjs": path.resolve(__dirname, "../__mocks__/@clerk/nextjs.ts"),
      "next/image": path.resolve(__dirname, "../__mocks__/next/image.tsx"),
    };

    // Add fallbacks for Node modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "fs": false,
      "path": false,
      "os": false,
      "crypto": false,
      "stream": false,
      "http": false,
      "https": false,
      "zlib": false,
      "url": false
    };
    
    return config;
  },
  "staticDirs": [
    "../public"
  ]
};
export default config;
