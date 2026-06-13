import { HttpResponse, http } from 'msw'
import { beforeEach, describe, expect, it } from 'vitest'
import { getToken, setToken } from '@/lib/token'
import { server } from '@/test/msw'
import { rpc } from './rpc'

describe('rpc client', () => {
  beforeEach(() => localStorage.clear())

  it('attaches the bearer token', async () => {
    setToken('tok')
    let sent: string | null = null
    server.use(
      http.get('/api/configz', ({ request }) => {
        sent = request.headers.get('authorization')
        return HttpResponse.json({ oidc: { issuer: 'i', clientId: 'c' } })
      }),
    )

    await rpc.configz.$get()
    expect(sent).toBe('Bearer tok')
  })

  it('clears the token on 401', async () => {
    setToken('tok')
    server.use(http.get('/api/me', () => new HttpResponse(null, { status: 401 })))

    await rpc.me.$get()

    // The 401 branch also redirects to /login (window.location.href), which jsdom
    // can't navigate; clearing the token is the deterministic, assertable effect.
    expect(getToken()).toBeNull()
  })
})
