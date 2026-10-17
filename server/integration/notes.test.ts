import { importJWK, SignJWT } from 'jose'
import { beforeEach, describe, expect, it } from 'vitest'

const origin = process.env.E2E_BASE_URL
const issuer = process.env.TEST_OIDC_ISSUER
const privateJwk = process.env.TEST_PRIVATE_JWK
if (!origin || !issuer || !privateJwk) throw new Error('Run integration tests with pnpm test:integration.')
const key = await importJWK(JSON.parse(privateJwk), 'ES256')
let subject: string
beforeEach(() => {
  subject = crypto.randomUUID()
})

async function bearer(claims: { sub?: string; email?: string } = {}) {
  const token = await new SignJWT({ email: claims.email ?? 'user@test' })
    .setProtectedHeader({ alg: 'ES256', kid: 'e2e' })
    .setSubject(claims.sub ?? subject)
    .setIssuer(issuer!)
    .setAudience('e2e-client')
    .setExpirationTime('5m')
    .sign(key)
  return `Bearer ${token}`
}

async function request(path: string, init?: RequestInit & { auth?: boolean; sub?: string }) {
  const headers = new Headers(init?.headers)
  if (init?.body && !headers.has('content-type')) headers.set('content-type', 'application/json')
  if (init?.auth) headers.set('authorization', await bearer({ sub: init.sub }))
  return fetch(`${origin}${path}`, { ...init, headers })
}

describe('config', () => {
  it('serves public runtime config without a token', async () => {
    const response = await request('/api/configz')
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ oidc: { issuer, clientId: 'e2e-client' } })
  })
})

describe('auth', () => {
  it.each([
    'GET',
    'POST',
  ])('keeps missing %s API routes out of the SPA fallback [spec: delivery/api-boundary]', async (method) => {
    const response = await request('/api/does-not-exist', { auth: true, method })
    expect(response.status).toBe(404)
    expect(response.headers.get('content-type')).toContain('application/json')
    expect(await response.json()).toEqual({ error: { code: 'not_found', message: 'API route not found.' } })
  })
  it('rejects requests without a token [spec: auth/require-token]', async () => {
    const response = await request('/api/notes')
    expect(response.status).toBe(401)
    expect(await response.json()).toEqual({
      error: { code: 'authentication_required', message: 'Authentication required.' },
    })
    expect((await request('/api/me')).status).toBe(401)
  })

  it('rejects an invalid token [spec: auth/require-token]', async () => {
    const response = await request('/api/me', { headers: { authorization: 'Bearer not-a-jwt' } })
    expect(response.status).toBe(401)
    expect(await response.json()).toEqual({ error: { code: 'invalid_credential', message: 'Invalid credential.' } })
  })

  it('accepts a valid token and returns the user [spec: auth/me]', async () => {
    const response = await request('/api/me', { auth: true })
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ user: { sub: subject, email: 'user@test', name: null } })
  })
})

describe('notes api', () => {
  it('starts empty, then lists a created note [spec: notes/create]', async () => {
    expect(await (await request('/api/notes', { auth: true })).json()).toEqual({ items: [], nextCursor: null })

    const created = await request('/api/notes', {
      method: 'POST',
      auth: true,
      body: JSON.stringify({ text: '  hello   world ' }),
    })
    expect(created.status).toBe(201)
    const createdBody = (await created.json()) as { item: { text: string } }
    expect(createdBody.item).toMatchObject({ text: 'hello world' })

    const list = (await (await request('/api/notes', { auth: true })).json()) as { items: Array<{ text: string }> }
    expect(list.items.map((note) => note.text)).toEqual(['hello world'])
  })

  it('scopes notes to their owner [spec: notes/owner-scope]', async () => {
    await request('/api/notes', { method: 'POST', auth: true, sub: 'user-1', body: JSON.stringify({ text: 'mine' }) })

    const others = (await (await request('/api/notes', { auth: true, sub: 'user-2' })).json()) as { items: unknown[] }
    expect(others.items).toEqual([])
  })

  it('paginates with a cursor [spec: notes/paginate]', async () => {
    for (const text of ['a', 'b', 'c']) {
      await request('/api/notes', { method: 'POST', auth: true, body: JSON.stringify({ text }) })
    }

    const seen: string[] = []
    let cursor: string | null = null
    for (let page = 0; page < 5; page++) {
      const path = cursor ? `/api/notes?limit=2&cursor=${encodeURIComponent(cursor)}` : '/api/notes?limit=2'
      const body = (await (await request(path, { auth: true })).json()) as {
        items: Array<{ text: string }>
        nextCursor: string | null
      }
      seen.push(...body.items.map((note) => note.text))
      cursor = body.nextCursor
      if (!cursor) break
    }

    expect(seen.sort()).toEqual(['a', 'b', 'c'])
  })

  it('rejects an empty note [spec: notes/validate]', async () => {
    const response = await request('/api/notes', { method: 'POST', auth: true, body: JSON.stringify({ text: '   ' }) })
    expect(response.status).toBe(400)
  })

  it('rejects a malformed cursor instead of starting over [spec: notes/invalid-cursor]', async () => {
    const response = await request('/api/notes?cursor=broken', { auth: true })
    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({
      error: { code: 'invalid_cursor', message: 'Invalid pagination cursor.' },
    })
  })
})
