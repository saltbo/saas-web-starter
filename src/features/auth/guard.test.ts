import { afterEach, describe, expect, it } from 'vitest'
import { clearToken, setToken } from '@/lib/token'
import { requireAuthLoader } from './guard'

describe('requireAuthLoader', () => {
  afterEach(() => clearToken())

  it('redirects to /login when unauthenticated', () => {
    const result = requireAuthLoader()
    expect(result).toBeInstanceOf(Response)
    expect((result as Response).status).toBe(302)
    expect((result as Response).headers.get('location')).toBe('/login')
  })

  it('passes through when authenticated', () => {
    setToken('t')
    expect(requireAuthLoader()).toBeNull()
  })
})
