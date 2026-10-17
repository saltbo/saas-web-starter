import { describe, expect, it } from 'vitest'

const origin = process.env.E2E_BASE_URL
if (!origin) throw new Error('Run integration tests with pnpm test:integration.')

describe('Void application delivery', () => {
  it('serves an empty SPA mount point on direct client links [spec: delivery/spa-shell]', async () => {
    const home = await fetch(`${origin}/`, { headers: { accept: 'text/html' } })
    expect(home.status).toBe(200)
    const shell = await home.text()
    expect(shell).toMatch(/<div id="root"><\/div>/)
    expect(shell).not.toContain('Create note')
    expect(shell).not.toContain('Sign in')
    expect(shell).not.toContain('__VOID_PAGE__')
    for (const route of ['/about', '/login', '/callback', '/unknown-client-route']) {
      const response = await fetch(`${origin}${route}?probe=preserved`, {
        redirect: 'manual',
        headers: { accept: 'text/html', 'sec-fetch-mode': 'navigate', 'sec-fetch-dest': 'document' },
      })
      expect(response.status).toBe(200)
      expect(response.headers.get('location')).toBeNull()
      expect(await response.text()).toBe(shell)
    }
  })

  it('preserves security headers and correlation IDs [spec: delivery/request-context]', async () => {
    const response = await fetch(`${origin}/api/health`, {
      headers: { 'x-request-id': 'integration-request', 'x-trace-id': 'integration-trace' },
    })
    expect(response.headers.get('x-request-id')).toBe('integration-request')
    expect(response.headers.get('x-trace-id')).toBe('integration-trace')
    expect(response.headers.get('content-security-policy')).toContain("script-src 'self'")
    expect(response.headers.get('x-content-type-options')).toBe('nosniff')
    expect(response.headers.get('x-frame-options')).toBe('DENY')
    expect(await response.json()).toEqual({ ok: true, name: 'saas-web-starter' })

    const generated = await fetch(`${origin}/api/health`, { headers: { 'x-request-id': 'invalid id' } })
    expect(generated.headers.get('x-request-id')).toMatch(/^[0-9a-f-]{36}$/)
  })
})
