import type { StorybookConfig } from '@storybook/nextjs';

const config: StorybookConfig = {
  "stories": [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  "addons": [
    "@storybook/addon-docs",
    "@storybook/addon-onboarding",
    "msw-storybook-addon"
  ],
  "framework": {
    "name": "@storybook/nextjs",
    "options": {}
  },
  "webpackFinal": async (config) => {
    if (config.resolve) {
      config.resolve.alias = {
        ...config.resolve.alias,
        "@clerk/nextjs": require.resolve("../__mocks__/@clerk/nextjs.ts"),
        "next/image": require.resolve("../__mocks__/next/image.tsx"),
      };
    }
    return config;
  },
  "staticDirs": [
    "../public"
  ]
};
export default config;