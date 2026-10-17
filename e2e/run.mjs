import { runIsolatedApp } from '../scripts/isolated-app.mjs'

await runIsolatedApp(
  'e2e',
  ['exec', 'playwright', 'test'],
  process.argv.slice(2).filter((argument) => argument !== '--'),
)
