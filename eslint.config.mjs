// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    ignores: [
      "node_modules/**", 
      ".next/**", 
      "out/**", 
      "build/**", 
      "next-env.d.ts",
      "coverage/**",
      "html/**",
      ".storybook-static/**",
      "storybook-static/**",
      "public/mockServiceWorker.js"
    ]
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"), 
  ...storybook.configs["flat/recommended"],
  {
    files: ["tests/**/*", "**/*.test.ts", "**/*.test.tsx", "**/*.spec.ts", "**/*.spec.tsx"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@next/next/no-assign-module-variable": "off",
      "@next/next/no-img-element": "off"
    }
  },
  {
    files: ["*.config.js", "*.config.ts", "*.config.mjs", "playwright.config.ts"],
    rules: {
      "@typescript-eslint/no-require-imports": "off"
    }
  }
];

export default eslintConfig;
