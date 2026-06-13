import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getToken } from '@/lib/token'

const signinRedirect = vi.fn()
const signinRedirectCallback = vi.fn()
const removeUser = vi.fn()

vi.mock('oidc-client-ts', () => ({
  // Classes (not arrow fns) so `new UserManager(...)` in the module under test works.
  UserManager: class {
    signinRedirect = signinRedirect
    signinRedirectCallback = signinRedirectCallback
    removeUser = removeUser
  },
  WebStorageStateStore: class {},
}))
vi.mock('@/lib/config', () => ({ getConfig: () => ({ oidc: { issuer: 'https://issuer.test', clientId: 'c' } }) }))

import { completeLogin, isAuthenticated, login, logout } from './oidc'

describe('auth/oidc', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('isAuthenticated reflects the stored token', () => {
    expect(isAuthenticated()).toBe(false)
    localStorage.setItem('auth_token', 't')
    expect(isAuthenticated()).toBe(true)
  })

  it('login triggers the provider redirect', async () => {
    await login()
    expect(signinRedirect).toHaveBeenCalledOnce()
  })

  it('completeLogin stores the id_token', async () => {
    signinRedirectCallback.mockResolvedValue({ id_token: 'jwt', access_token: 'a' })
    await completeLogin()
    expect(getToken()).toBe('jwt')
  })

  it('completeLogin falls back to the access_token', async () => {
    signinRedirectCallback.mockResolvedValue({ access_token: 'a' })
    await completeLogin()
    expect(getToken()).toBe('a')
  })

  it('completeLogin stores nothing when no token is returned', async () => {
    signinRedirectCallback.mockResolvedValue({})
    await completeLogin()
    expect(getToken()).toBeNull()
  })

  it('logout clears the token and removes the user', async () => {
    localStorage.setItem('auth_token', 't')
    await logout()
    expect(getToken()).toBeNull()
    expect(removeUser).toHaveBeenCalledOnce()
  })
})
