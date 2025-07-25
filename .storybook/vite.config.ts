import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@/lib/flagsmith': path.resolve(__dirname, '../src/lib/flagsmith/__mocks__'),
    },
  },
});
