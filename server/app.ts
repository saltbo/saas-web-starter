import type { Env } from '@server/env'
import { Hono } from 'hono'
import { createDeps } from './composition'
import { registerConfigRoutes } from './http/config'
import type { AppEnv } from './http/context'
import { requireAuth } from './http/middleware'
import { registerNoteRoutes } from './http/notes'

const routes = new Hono<AppEnv>()

routes.use('*', async (c, next) => {
  c.set('deps', createDeps(c.env))
  await next()
})

// Public.
routes.get('/health', (c) => c.json({ ok: true, name: 'saas-web-starter' }))
registerConfigRoutes(routes)

// Everything below requires a valid bearer token.
routes.use('*', requireAuth)

routes.get('/me', (c) => c.json({ user: c.get('user') }))
registerNoteRoutes(routes)

const app = new Hono<{ Bindings: Env }>().route('/api', routes)

export { app }
