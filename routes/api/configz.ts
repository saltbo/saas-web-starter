import { defineHandler } from 'void'
import { env } from 'void/env'

export const GET = defineHandler(() => ({
  oidc: { issuer: env.OIDC_ISSUER, clientId: env.OIDC_CLIENT_ID },
}))
