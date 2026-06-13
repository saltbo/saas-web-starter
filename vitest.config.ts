import path from 'node:path'
import { cloudflareTest, readD1Migrations } from '@cloudflare/vitest-pool-workers'
import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vitest/config'

const alias = {
  '@': path.resolve(__dirname, './src'),
  '@server': path.resolve(__dirname, './server'),
  '@shared': path.resolve(__dirname, './shared'),
}

export default defineConfig({
  test: {
    // Coverage is collected from the unit project only (`pnpm test:coverage`);
    // the workerd pool does not support the v8 provider.
    coverage: {
      include: ['server/**', 'shared/**'],
      exclude: ['server/api-tests/**', '**/*.test.ts', '**/*.d.ts'],
      reporter: ['text', 'text-summary'],
    },
    projects: [
      // Server fast suite: pure domain rules, usecases over fake ports, adapters
      // over stubbed fetch, http wiring. Runs in node.
      {
        test: {
          name: 'unit',
          environment: 'node',
          include: ['server/**/*.test.ts', 'shared/**/*.test.ts'],
          exclude: ['server/api-tests/**'],
        },
        resolve: { alias },
      },
      // Frontend suite: pure lib helpers, the api client, and component/hook tests
      // with the API mocked at the network boundary (MSW). Runs in jsdom.
      {
        plugins: [react()],
        test: {
          name: 'web',
          environment: 'jsdom',
          include: ['src/**/*.test.{ts,tsx}'],
          setupFiles: ['./src/test/setup.ts'],
        },
        resolve: { alias },
      },
      // API suite: full request flows through app.fetch inside workerd, with a real
      // D1 binding and the production migrations applied.
      {
        plugins: [
          cloudflareTest(async () => ({
            singleWorker: true,
            miniflare: {
              compatibilityDate: '2026-06-03',
              compatibilityFlags: ['nodejs_compat'],
              d1Databases: ['DB'],
              bindings: {
                TEST_MIGRATIONS: await readD1Migrations(path.join(__dirname, 'migrations')),
              },
            },
          })),
        ],
        test: {
          name: 'api',
          include: ['server/api-tests/**/*.test.ts'],
          setupFiles: ['./server/api-tests/apply-migrations.ts'],
        },
        resolve: { alias },
      },
    ],
  },
})
