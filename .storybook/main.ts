import type { StorybookConfig } from '@storybook/nextjs';

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
      "@clerk/nextjs": require.resolve("../__mocks__/@clerk/nextjs.ts"),
      "next/image": require.resolve("../__mocks__/next/image.tsx"),
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