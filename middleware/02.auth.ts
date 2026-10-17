import { defineMiddleware } from 'void'
import { requireAuth } from '../server/middleware'

const publicApi = new Set(['/api/configz', '/api/health'])

export default defineMiddleware(async (c, next) => {
  if (c.req.path.startsWith('/api/') && !publicApi.has(c.req.path)) return requireAuth(c, next)
  await next()
})
