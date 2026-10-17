import { runIsolatedApp } from './isolated-app.mjs'

await runIsolatedApp('integration', ['exec', 'vitest', 'run', '--project', 'integration'], process.argv.slice(2))
