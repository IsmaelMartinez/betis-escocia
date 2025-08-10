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
    environmentOptions: {
      url: 'http://localhost/',
    },
    include: ['tests/unit/app/**/*.test.{ts,tsx}'], // Modified this line
    setupFiles: ['.storybook/vitest.setup.ts'],
  },
});