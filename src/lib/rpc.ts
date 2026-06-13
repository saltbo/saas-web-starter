import type { AppType } from '@server/app'
import { hc } from 'hono/client'
import { clearToken, getToken } from '@/lib/token'

// The single typed API client (Hono RPC). The AppType import is type-only — the SPA
// talks to the server over HTTP at runtime, this just shares the route types.
// Feature modules call `rpc`; components and hooks never fetch() directly.
const authFetch: typeof fetch = async (input, init) => {
  const token = getToken()
  const headers = new Headers(init?.headers)
  if (token) headers.set('authorization', `Bearer ${token}`)

  const response = await fetch(input, { ...init, headers })
  if (response.status === 401) {
    clearToken()
    window.location.href = '/login'
  }
  return response
}

export const rpc = hc<AppType>('/', { fetch: authFetch }).api
