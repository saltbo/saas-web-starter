import { app } from '@server/app'
import type { Env } from '@server/env'
import { describe, expect, it } from 'vitest'

// The DB throws on any query, so these tests prove routing + validation resolve
// before persistence is touched.
const env = {
  DB: new Proxy(
    {},
    {
      get() {
        throw new Error('Unexpected database access in http wiring test.')
      },
    },
  ),
} as unknown as Env

function request(path: string, init?: RequestInit) {
  const headers = new Headers(init?.headers)
  if (init?.body) headers.set('content-type', 'application/json')
  return app.fetch(new Request(`http://app.test${path}`, { ...init, headers }), env)
}

describe('http wiring', () => {
  it('serves the health check', async () => {
    const response = await request('/api/health')
    expect(response.status).toBe(200)
    expect(await response.json()).toMatchObject({ ok: true })
  })

  it('validates note creation before reaching the db [spec: notes/validate]', async () => {
    const response = await request('/api/notes', { method: 'POST', body: JSON.stringify({ text: '' }) })
    expect(response.status).toBe(400)
  })
})
