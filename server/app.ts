import type { Env } from '@server/env'
import { Hono } from 'hono'
import { createDeps } from './composition'
import type { AppEnv } from './http/context'
import { registerNoteRoutes } from './http/notes'

const routes = new Hono<AppEnv>()

routes.use('*', async (c, next) => {
  c.set('deps', createDeps(c.env))
  await next()
})

routes.get('/health', (c) => c.json({ ok: true, name: 'saas-web-starter' }))

registerNoteRoutes(routes)

const app = new Hono<{ Bindings: Env }>().route('/api', routes)

export { app }
