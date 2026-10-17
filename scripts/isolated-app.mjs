import { fork, spawn } from 'node:child_process'
import { createWriteStream } from 'node:fs'
import { cp, mkdir, mkdtemp, rm, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { startOidcServer } from '../e2e/oidc-server.mjs'

const projectRoot = path.resolve(import.meta.dirname, '..')
const excluded = new Set([
  'node_modules',
  '.git',
  '.void',
  '.void-wrangler.jsonc',
  '.wrangler',
  '.pi',
  'dist',
  'coverage',
  'artifacts',
  'test-results',
  'playwright-report',
  'blob-report',
  '.dev.vars',
])

function run(args, cwd, env, output) {
  return new Promise((resolve, reject) => {
    const pnpmCli = process.env.npm_execpath
    if (!pnpmCli) throw new Error('Run the isolated test suite through pnpm.')
    const child = spawn(process.execPath, [pnpmCli, ...args], {
      cwd,
      env: { ...process.env, ...env, PATH: `${path.dirname(process.execPath)}${path.delimiter}${process.env.PATH}` },
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    for (const stream of [child.stdout, child.stderr])
      stream.on('data', (data) => {
        process.stdout.write(data)
        output.write(data)
      })
    child.once('error', reject)
    child.once('exit', (code, signal) => (signal ? reject(new Error(`pnpm exited on ${signal}.`)) : resolve(code ?? 1)))
  })
}

export async function runIsolatedApp(kind, command, args) {
  const runRoot = await mkdtemp(path.join(tmpdir(), `saas-void-${kind}-`))
  const workspace = path.join(runRoot, 'app')
  const artifactDir = path.join(projectRoot, 'artifacts', kind, path.basename(runRoot))
  await mkdir(artifactDir, { recursive: true })
  const output = createWriteStream(path.join(artifactDir, 'app.log'))
  let oidc
  let previewProcess
  try {
    await cp(projectRoot, workspace, {
      recursive: true,
      filter: (source) => {
        const relative = path.relative(projectRoot, source)
        const first = relative.split(path.sep)[0]
        return !excluded.has(first) && !first.startsWith('.env') && !first.startsWith('.dev.vars')
      },
    })
    await symlink(path.join(projectRoot, 'node_modules'), path.join(workspace, 'node_modules'), 'dir')
    oidc = await startOidcServer()
    await writeFile(path.join(workspace, '.env'), `OIDC_ISSUER=${oidc.issuer}\nOIDC_CLIENT_ID=e2e-client\n`)
    const env = {
      VOID_INSPECTOR_PORT: 'false',
      VOID_REMOTE: '0',
      CI: 'true',
      OIDC_ISSUER: oidc.issuer,
      OIDC_CLIENT_ID: 'e2e-client',
    }
    for (const task of [['build'], ['exec', 'void', 'db', 'migrate']]) {
      const code = await run(task, workspace, env, output)
      if (code !== 0) throw new Error(`${task.join(' ')} failed (${code}). Evidence: ${artifactDir}`)
    }

    previewProcess = fork(path.join(projectRoot, 'scripts/preview.mjs'), [], {
      cwd: workspace,
      env: { ...process.env, ...env },
      stdio: ['ignore', 'pipe', 'pipe', 'ipc'],
    })
    for (const stream of [previewProcess.stdout, previewProcess.stderr])
      stream.on('data', (data) => {
        process.stdout.write(data)
        output.write(data)
      })
    const origin = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Void production preview did not become ready.')), 60000)
      previewProcess.once('error', (error) => {
        clearTimeout(timeout)
        reject(error)
      })
      previewProcess.once('exit', (code) => {
        clearTimeout(timeout)
        reject(new Error(`Void preview exited before ready (${code}).`))
      })
      previewProcess.once('message', (message) => {
        clearTimeout(timeout)
        if (typeof message?.origin !== 'string') reject(new Error('Void preview returned an invalid origin.'))
        else resolve(message.origin)
      })
    })
    await writeFile(
      path.join(artifactDir, 'runtime.json'),
      JSON.stringify({ workspace, origin, issuer: oidc.issuer }, null, 2),
    )
    const exit = await run(
      [...command, ...args],
      projectRoot,
      {
        ...env,
        E2E_BASE_URL: origin,
        E2E_ARTIFACT_DIR: path.join(artifactDir, 'playwright'),
        TEST_OIDC_ISSUER: oidc.issuer,
        TEST_PRIVATE_JWK: JSON.stringify(oidc.privateJwk),
      },
      output,
    )
    if (exit !== 0) throw new Error(`${kind} failed (${exit}). Evidence: ${artifactDir}`)
  } finally {
    if (previewProcess && previewProcess.exitCode === null && previewProcess.signalCode === null) {
      await new Promise((resolve) => {
        const timeout = setTimeout(() => previewProcess.kill('SIGKILL'), 10000)
        previewProcess.once('exit', () => {
          clearTimeout(timeout)
          resolve()
        })
        if (previewProcess.connected) previewProcess.send('close')
        else previewProcess.kill('SIGTERM')
      })
    }
    await oidc?.close()
    await rm(runRoot, { recursive: true, force: true })
    await new Promise((resolve) => output.end(resolve))
  }
}
