import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.spec.ts'],
    exclude: ['src/**/*.e2e-spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      all: true,
      exclude: ['**/main.ts', '**/*.module.ts', '**/*.schema.ts', '**/*.dto.ts'],
    },
  },
});