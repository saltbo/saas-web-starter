import { zValidator } from '@hono/zod-validator'
import { createNote } from '@server/usecases/notes'
import { Hono } from 'hono'
import { z } from 'zod'
import type { AppEnv } from './context'

const createNoteSchema = z.object({ text: z.string().trim().min(1).max(500) })
const listQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  cursor: z.string().optional(),
})

// Notes are scoped to the authenticated user (c.get('user').sub). Chained so the
// route types flow into AppType for the SPA's RPC client.
export const notesRoutes = new Hono<AppEnv>()
  .get('/notes', zValidator('query', listQuerySchema), async (c) => {
    const { limit, cursor } = c.req.valid('query')
    return c.json(await c.get('deps').notesRepo.list(c.get('user').sub, { limit, cursor }))
  })
  .post('/notes', zValidator('json', createNoteSchema), async (c) => {
    const item = await createNote(c.get('deps'), c.get('user').sub, c.req.valid('json'))
    return c.json({ item }, 201)
  })
