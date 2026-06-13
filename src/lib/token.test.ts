import { afterEach, describe, expect, it } from 'vitest'
import { clearToken, getToken, setToken } from './token'

describe('token store', () => {
  afterEach(() => localStorage.clear())

  it('round-trips and clears the token', () => {
    expect(getToken()).toBeNull()
    setToken('abc')
    expect(getToken()).toBe('abc')
    clearToken()
    expect(getToken()).toBeNull()
  })
})
