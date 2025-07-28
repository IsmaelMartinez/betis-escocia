import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@/lib/flagsmith': path.resolve(__dirname, '../src/lib/flagsmith/__mocks__'),
      '@clerk/nextjs': path.resolve(__dirname, '../src/lib/clerk/__mocks__/index.tsx'),
      '@clerk/nextjs/server': path.resolve(__dirname, '../src/lib/clerk/__mocks__/index.tsx'),
      '@clerk/nextjs/testing': path.resolve(__dirname, '../src/lib/clerk/__mocks__/index.tsx'),
    },
  },
  optimizeDeps: {
    include: ['@storybook/blocks', '@storybook/test'],
  },
});
