import path from 'node:path'
import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vitest/config'

const alias = { '@': path.resolve(import.meta.dirname, 'src'), '@shared': path.resolve(import.meta.dirname, 'shared') }

export default defineConfig({
  test: {
    // The generated production Worker, D1 and HTTP boundary run in workerd through
    // the integration runner. V8 owns pure rules and browser logic only.
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary'],
      include: [
        'server/note.ts',
        'server/errors.ts',
        'shared/**',
        'src/features/**',
        'src/shared/api/**',
        'src/shared/config/**',
        'src/shared/observability/**',
        'src/shared/persistence/**',
      ],
      exclude: [
        '**/*.test.{ts,tsx}',
        '**/*.d.ts',
        '**/index.ts',
        // Preserve the starter's existing ownership: reusable UI/configuration
        // glue is exercised by component/E2E tests, not per-file unit coverage.
        'src/shared/i18n/**',
        'src/shared/lib/**',
        'src/shared/query/**',
        'src/shared/theme/**',
        'src/shared/ui/**',
      ],
      thresholds: {
        perFile: true,
        lines: 90,
        functions: 90,
        branches: 90,
        statements: 90,
        'server/note.ts': { statements: 95, branches: 95, functions: 95, lines: 95 },
      },
    },
    projects: [
      {
        test: { name: 'unit', environment: 'node', include: ['server/*.test.ts', 'shared/**/*.test.ts'] },
        resolve: { alias },
      },
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
      {
        test: {
          name: 'integration',
          environment: 'node',
          include: ['server/integration/**/*.test.ts'],
          testTimeout: 15000,
        },
        resolve: { alias },
      },
    ],
  },
})
