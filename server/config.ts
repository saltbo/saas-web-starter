import { z } from 'zod'
import type { Env } from './env'

// Runtime validation of auth env. Throws a clear error if misconfigured, instead
// of failing deep inside token verification.
const authConfigSchema = z.object({
  OIDC_ISSUER: z.string().url(),
  OIDC_CLIENT_ID: z.string().min(1),
  // Optional: inline JWKS (tests use a local key set instead of remote discovery).
  OIDC_JWKS: z.string().optional(),
  // Optional dev-only escape hatch (see adapters/auth/verifier). NEVER set in prod.
  OIDC_DEV_USER: z.string().optional(),
})

export interface AuthConfig {
  issuer: string
  clientId: string
  jwks?: string
  devUser?: string
}

export function getAuthConfig(env: Env): AuthConfig {
  const parsed = authConfigSchema.safeParse(env)
  if (!parsed.success) {
    const detail = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ')
    throw new Error(`Invalid auth configuration: ${detail}`)
  }
  const { OIDC_ISSUER, OIDC_CLIENT_ID, OIDC_JWKS, OIDC_DEV_USER } = parsed.data
  return { issuer: OIDC_ISSUER, clientId: OIDC_CLIENT_ID, jwks: OIDC_JWKS, devUser: OIDC_DEV_USER }
}
