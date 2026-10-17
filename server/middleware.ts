import { defineMiddleware } from 'void'
import { env } from 'void/env'
import { type AuthUser, createAuthVerifier } from './auth'
import { InvalidCredentialError } from './errors'

declare module 'void' {
  interface CloudContextVariables {
    principal: AuthUser
    requestId: string
    traceId: string
  }
}

export const requireAuth = defineMiddleware(async (c, next) => {
  const header = c.req.header('authorization') ?? ''
  const token = header.startsWith('Bearer ') ? header.slice('Bearer '.length) : ''
  if (!token) return c.json({ error: { code: 'authentication_required', message: 'Authentication required.' } }, 401)

  try {
    c.set(
      'principal',
      await createAuthVerifier({ issuer: env.OIDC_ISSUER, clientId: env.OIDC_CLIENT_ID }).verify(token),
    )
  } catch (error) {
    if (error instanceof InvalidCredentialError) {
      return c.json({ error: { code: error.code, message: error.message } }, error.status)
    }
    throw error
  }
  c.header('Cache-Control', 'no-store')
  await next()
})
