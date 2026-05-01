import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.{test,spec}.{js,ts}'],
    exclude: ['node_modules', 'dist', '.nuxt'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['server/utils/**/*.ts', 'server/api/fixed/**/*.ts'],
      exclude: ['server/api/vulnerable/**/*.ts'],
    },
    testTimeout: 10000,
    hookTimeout: 10000,
  },
});
