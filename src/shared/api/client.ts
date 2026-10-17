import { apiErrorSchema } from '@shared/types'
import { FetchError } from 'void/client'
import type { z } from 'zod'

let accessToken: string | null = null

export function getAccessToken(): string | null {
  return accessToken
}

export function setAccessToken(token: string): void {
  if (!token) throw new Error('Access Token must not be empty.')
  accessToken = token
}

export function clearAccessToken(): void {
  accessToken = null
}

export class ApiClientError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message)
    this.name = 'ApiClientError'
  }
}

export class ApiProtocolError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options)
    this.name = 'ApiProtocolError'
  }
}

export function apiOptions() {
  const headers = new Headers()
  if (accessToken) headers.set('authorization', `Bearer ${accessToken}`)
  return { headers, retry: 0 }
}

export async function decodeApiResponse<T>(operation: Promise<unknown>, schema: z.ZodType<T>): Promise<T> {
  let payload: unknown
  try {
    payload = await operation
  } catch (error) {
    if (!(error instanceof FetchError) || error.status === undefined) throw error
    if (error.status === 401) clearAccessToken()
    const parsed = apiErrorSchema.safeParse(error.data)
    if (!parsed.success) {
      throw new ApiProtocolError(`API error response does not match the contract for status ${error.status}.`, {
        cause: error,
      })
    }
    throw new ApiClientError(error.status, parsed.data.error.code, parsed.data.error.message)
  }
  const parsed = schema.safeParse(payload)
  if (!parsed.success) {
    throw new ApiProtocolError('API success response does not match the runtime contract.', { cause: parsed.error })
  }
  return parsed.data
}
