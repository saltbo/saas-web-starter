/// <reference types="@cloudflare/vitest-pool-workers/types" />

// Adds the test-only migrations binding to the generated Cloudflare.Env
// (DB / ASSETS come from worker-configuration.d.ts).
declare namespace Cloudflare {
  interface Env {
    TEST_MIGRATIONS: import('@cloudflare/vitest-pool-workers').D1Migration[]
  }
}
