import type { Env } from '@server/env'
import { app } from './app'

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url)
    if (url.pathname.startsWith('/api/')) {
      return app.fetch(request, env, ctx)
    }
    return env.ASSETS.fetch(request)
  },
}
