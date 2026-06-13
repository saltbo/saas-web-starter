import type { AuthConfig } from '@server/config'
import type { AuthUser, AuthVerifier } from '@server/usecases/ports'
import { createLocalJWKSet, createRemoteJWKSet, type JWTPayload, jwtVerify } from 'jose'

type JwksResolver = Parameters<typeof jwtVerify>[1]

// Remote JWKS sets are cached per issuer for the lifetime of the isolate.
const remoteCache = new Map<string, JwksResolver>()

function toUser(payload: JWTPayload): AuthUser {
  if (!payload.sub) throw new Error('Token has no subject.')
  return {
    sub: payload.sub,
    email: typeof payload.email === 'string' ? payload.email : null,
    name: typeof payload.name === 'string' ? payload.name : null,
  }
}

async function resolveJwks(config: AuthConfig): Promise<JwksResolver> {
  if (config.jwks) return createLocalJWKSet(JSON.parse(config.jwks))

  const cached = remoteCache.get(config.issuer)
  if (cached) return cached

  const discoveryUrl = new URL('.well-known/openid-configuration', `${config.issuer.replace(/\/$/, '')}/`)
  const response = await fetch(discoveryUrl)
  if (!response.ok) throw new Error(`OIDC discovery failed: ${response.status}`)
  const { jwks_uri } = (await response.json()) as { jwks_uri: string }
  const resolver = createRemoteJWKSet(new URL(jwks_uri))
  remoteCache.set(config.issuer, resolver)
  return resolver
}

export function createAuthVerifier(config: AuthConfig): AuthVerifier {
  // Dev-only: accept any bearer token and return a fixed user. Gated behind
  // OIDC_DEV_USER so it can never be on by accident — NEVER set it in production.
  if (config.devUser) {
    const user = JSON.parse(config.devUser) as AuthUser
    return {
      async verify(token) {
        if (!token) throw new Error('Missing token.')
        console.warn('[auth] OIDC_DEV_USER is set — bearer tokens are NOT verified. Dev/E2E only.')
        return user
      },
    }
  }

  return {
    async verify(token) {
      const jwks = await resolveJwks(config)
      const { payload } = await jwtVerify(token, jwks, { issuer: config.issuer, audience: config.clientId })
      return toUser(payload)
    },
  }
}
