import { defineConfig, devices } from '@playwright/test'

const PORT = 5173
const baseURL = `http://localhost:${PORT}`

// E2E runs against the real stack: vite dev serves the SPA + the Worker against
// an isolated local D1 (E2E_PERSIST), reset and migrated by `e2e:server` on each
// boot. The suite is stateful (drives onboarding), so it runs serially.
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'pnpm e2e:server',
    url: `${baseURL}/api/health`,
    timeout: 120_000,
    reuseExistingServer: !process.env.CI,
  },
})
