import { clientConfigSchema } from '@shared/types'
import { HttpResponse, http } from 'msw'
import { afterEach, describe, expect, it } from 'vitest'
import { fetch as voidFetch } from 'void/client'
import { z } from 'zod'
import { server } from '@/test/msw'
import {
  ApiClientError,
  ApiProtocolError,
  apiOptions,
  clearAccessToken,
  decodeApiResponse,
  getAccessToken,
  setAccessToken,
} from './client'

const config = { oidc: { issuer: 'https://issuer.test', clientId: 'client' } }
const request = () => decodeApiResponse(voidFetch('/api/configz', apiOptions()), clientConfigSchema)

describe('Void typed fetch boundary', () => {
  afterEach(clearAccessToken)

  it('attaches only the in-memory access token', async () => {
    let sent: string | null = null
    server.use(
      http.get('/api/configz', ({ request }) => {
        sent = request.headers.get('authorization')
        return HttpResponse.json(config)
      }),
    )
    expect(await request()).toEqual(config)
    expect(sent).toBeNull()
    setAccessToken('tok')
    expect(await request()).toEqual(config)
    expect(sent).toBe('Bearer tok')
  })

  it('surfaces stable API errors and clears credentials on 401', async () => {
    setAccessToken('tok')
    server.use(
      http.get('/api/configz', () =>
        HttpResponse.json({ error: { code: 'invalid_credential', message: 'Invalid credential.' } }, { status: 401 }),
      ),
    )
    await expect(request()).rejects.toMatchObject({ status: 401, code: 'invalid_credential' })
    expect(getAccessToken()).toBeNull()
  })

  it('decodes Void validation errors', async () => {
    server.use(
      http.get('/api/configz', () => HttpResponse.json({ error: 'Validation failed', issues: [] }, { status: 400 })),
    )
    await expect(request()).rejects.toBeInstanceOf(ApiClientError)
    await expect(request()).rejects.toMatchObject({ code: 'invalid_request', status: 400 })
  })

  it('rejects malformed success and error payloads', async () => {
    server.use(http.get('/api/configz', () => HttpResponse.json({ value: 1 })))
    await expect(request()).rejects.toBeInstanceOf(ApiProtocolError)
    server.use(http.get('/api/configz', () => HttpResponse.json({ message: 'no stable code' }, { status: 500 })))
    await expect(request()).rejects.toBeInstanceOf(ApiProtocolError)
  })

  it('propagates transport failures and rejects empty tokens', async () => {
    expect(() => setAccessToken('')).toThrow('must not be empty')
    const error = new TypeError('network unavailable')
    await expect(decodeApiResponse(Promise.reject(error), z.object({}))).rejects.toBe(error)
    server.use(http.get('/api/configz', () => HttpResponse.error()))
    await expect(request()).rejects.toThrow()
  })
})
