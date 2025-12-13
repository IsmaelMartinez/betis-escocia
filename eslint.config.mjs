// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";
import { createRequire } from "module";

// Next.js 16 uses a different ESLint config structure
const require = createRequire(import.meta.url);

// Import Next.js ESLint config
let nextConfig = [];
try {
  const nextPlugin = require("@next/eslint-plugin-next");
  const tsPlugin = require("@typescript-eslint/eslint-plugin");
  const tsParser = require("@typescript-eslint/parser");
  const reactPlugin = require("eslint-plugin-react");
  const reactHooksPlugin = require("eslint-plugin-react-hooks");
  
  nextConfig = [
    {
      plugins: {
        "@next/next": nextPlugin,
        "@typescript-eslint": tsPlugin,
        "react": reactPlugin,
        "react-hooks": reactHooksPlugin,
      },
      languageOptions: {
        parser: tsParser,
        parserOptions: {
          ecmaFeatures: {
            jsx: true,
          },
        },
      },
      rules: {
        ...nextPlugin.configs.recommended.rules,
        ...nextPlugin.configs["core-web-vitals"].rules,
        ...tsPlugin.configs.recommended.rules,
        ...reactHooksPlugin.configs.recommended.rules,
      },
    },
  ];
} catch (err) {
  // Fail fast if plugins aren't available
  console.error("Critical ESLint plugins could not be loaded. Please ensure all required dependencies are installed.");
  if (err && err.stack) {
    console.error(err.stack);
  } else {
    console.error(err);
  }
  throw err;
}

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
  ...nextConfig,
  ...storybook.configs["flat/recommended"],
  {
    files: ["tests/**/*", "**/*.test.ts", "**/*.test.tsx", "**/*.spec.ts", "**/*.spec.tsx"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@next/next/no-assign-module-variable": "off",
      "@next/next/no-img-element": "off",
      "react-hooks/refs": "off"
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
