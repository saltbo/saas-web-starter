import { createLocalJWKSet, createRemoteJWKSet, errors, type JWTPayload, jwtVerify } from 'jose'
import { z } from 'zod'
import { InvalidCredentialError } from './errors'

export interface AuthConfig {
  issuer: string
  clientId: string
  jwks?: string
}

export interface AuthUser {
  sub: string
  email: string | null
  name: string | null
}

type JwksResolver = Parameters<typeof jwtVerify>[1]

// Remote JWKS sets are cached per issuer for the lifetime of the isolate.
const remoteCache = new Map<string, JwksResolver>()

function toUser(payload: JWTPayload): AuthUser {
  if (!payload.sub) throw new InvalidCredentialError('Credential has no subject.')
  return {
    sub: payload.sub,
    email: typeof payload.email === 'string' ? payload.email : null,
    name: typeof payload.name === 'string' ? payload.name : null,
  }
}

async function resolveJwks(config: AuthConfig): Promise<JwksResolver> {
  if (config.jwks) {
    try {
      return createLocalJWKSet(JSON.parse(config.jwks))
    } catch (cause) {
      throw new Error('Invalid OIDC signing-key configuration.', { cause })
    }
  }

  const cached = remoteCache.get(config.issuer)
  if (cached) return cached

  const discoveryUrl = new URL('.well-known/openid-configuration', `${config.issuer.replace(/\/$/, '')}/`)
  const response = await fetch(discoveryUrl)
  if (!response.ok) throw new Error(`OIDC discovery failed: ${response.status}`)
  const { jwks_uri } = z.object({ jwks_uri: z.url() }).parse(await response.json())
  let jwksUrl: URL
  try {
    jwksUrl = new URL(jwks_uri)
  } catch (cause) {
    throw new Error('OIDC discovery returned an invalid signing-key URL.', { cause })
  }
  const resolver = createRemoteJWKSet(jwksUrl)
  remoteCache.set(config.issuer, resolver)
  return resolver
}

export function createAuthVerifier(config: AuthConfig) {
  return {
    async verify(token: string) {
      const jwks = await resolveJwks(config)
      try {
        const { payload } = await jwtVerify(token, jwks, { issuer: config.issuer, audience: config.clientId })
        return toUser(payload)
      } catch (error) {
        if (
          error instanceof errors.JWTClaimValidationFailed ||
          error instanceof errors.JWTExpired ||
          error instanceof errors.JWSInvalid ||
          error instanceof errors.JWTInvalid ||
          error instanceof errors.JWSSignatureVerificationFailed ||
          error instanceof errors.JWKSNoMatchingKey ||
          error instanceof errors.JOSEAlgNotAllowed
        ) {
          throw new InvalidCredentialError()
        }
        throw error
      }
    },
  }
}
