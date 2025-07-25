import type { StorybookConfig } from "@storybook/nextjs-vite";

const config: StorybookConfig = {
  "stories": [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)",
    "../docs/**/*.mdx"
  ],
  "addons": [
    "@chromatic-com/storybook",
    "@storybook/addon-onboarding",
    "@storybook/addon-a11y",
    "@storybook/addon-vitest",
    "@storybook/addon-docs"
  ],
  "framework": {
    "name": "@storybook/nextjs-vite",
    "options": {
      builder: {
        viteConfigPath: './.storybook/vite.config.ts',
      },
    },
  },
  "staticDirs": [
    "../public"
  ],
  async viteFinal(config, { configType }) {
    // Ensure these are treated as external by Vite
    config.build = config.build || {};
    config.build.rollupOptions = config.build.rollupOptions || {};
    config.build.rollupOptions.external = [
      '@storybook/manager-api',
      '@storybook/theming',
      ...(config.build.rollupOptions.external || []),
    ];
    return config;
  },
};
export default config;