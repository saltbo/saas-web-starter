import type { MiddlewareHandler } from 'hono'
import type { AppEnv } from './context'

// Verifies the bearer token via the injected AuthVerifier and sets the user.
// Apply to the routes that require authentication.
export const requireAuth: MiddlewareHandler<AppEnv> = async (c, next) => {
  const header = c.req.header('authorization') ?? ''
  const token = header.startsWith('Bearer ') ? header.slice('Bearer '.length) : ''
  if (!token) return c.json({ error: 'Authentication required.' }, 401)

  try {
    c.set('user', await c.get('deps').authVerifier.verify(token))
  } catch {
    return c.json({ error: 'Invalid token.' }, 401)
  }

  await next()
}
