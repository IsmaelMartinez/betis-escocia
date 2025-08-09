import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react'; // Added this line

const dirname =
  typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()], // Added this line
  resolve: {
    alias: {
      '@': path.resolve(dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    testEnvironmentOptions: {
      url: 'http://localhost/',
    },
    include: ['tests/unit/**/*.test.{ts,tsx}'],
    setupFiles: ['.storybook/vitest.setup.ts'],
    transformMode: {
      web: [/\.[jt]sx$/],
    },
  },
});