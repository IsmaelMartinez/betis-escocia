import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

const dirname =
  typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
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
    env: {
      NEXT_PUBLIC_SUPABASE_URL: 'https://test-supabase-url.com',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
      SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
    },
    // Include all unit and integration tests, exclude E2E tests
    include: [
      'tests/unit/**/*.test.{ts,tsx}',
      'tests/integration/**/*.test.{ts,tsx}',
      'tests/helpers/**/*.test.{ts,tsx}',
    ],
    // Explicitly exclude E2E tests and other non-Vitest files
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/cypress/**',
      'e2e/**',
      '**/*.e2e-spec.ts',
      'playwright/**',
      'playwright.config.ts',
      'tests/canary/**', // Exclude canary tests as they're placeholders
    ],
    setupFiles: ['tests/setup.ts'], // Use main test setup instead of Storybook-specific
    // Coverage configuration
    coverage: {
      provider: 'v8', // Use built-in v8 coverage (faster than c8)
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      exclude: [
        // Build and dependency directories
        'coverage/**',
        'dist/**',
        'node_modules/**',
        '.next/**',
        'storybook-static/**',
        
        // Configuration files
        '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',
        '**/.{eslint,mocha,prettier}rc.{js,cjs,yml}',
        'tailwind.config.js',
        'postcss.config.mjs',
        'next.config.js',
        'sentry.*.config.ts',
        
        // Test files and directories
        'playwright/**',
        'e2e/**',
        'tests/**', // Exclude all test files from coverage
        '__mocks__/**',
        
        // Development and documentation
        '.storybook/**',
        'scripts/**',
        'sql/**',
        'docs/**',
        'public/**',
        'tasks/**',
        
        // TypeScript declaration files
        '**/*.d.ts',
        
        // Stories and development files
        '**/*.stories.{js,jsx,ts,tsx}',
        'src/stories/**',
        
        // Specific project exclusions
        'src/instrumentation*.ts', // Sentry instrumentation
        'src/middleware.ts', // Already well-tested, complex to mock
      ],
      include: [
        'src/**/*.{js,jsx,ts,tsx}',
      ],
      all: true,
      // Coverage thresholds matching existing Jest setup
      thresholds: {
        global: {
          lines: 80,
          functions: 80,
          branches: 80,
          statements: 80,
        },
      },
      // Additional coverage options
      clean: true,
      cleanOnRerun: true,
    },
    // Test execution settings
    testTimeout: 10000, // 10 seconds timeout for tests
    hookTimeout: 10000, // 10 seconds timeout for hooks
    // Reporter configuration  
    reporters: ['json', 'html'],
  },
});