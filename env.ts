import { defineEnv, url } from 'void/env'
import { z } from 'zod'

export default defineEnv({
  OIDC_ISSUER: url(),
  OIDC_CLIENT_ID: z.string().min(1),
})
