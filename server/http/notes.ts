import { zValidator } from '@hono/zod-validator'
import { createNote, listNotes } from '@server/usecases/notes'
import { Hono } from 'hono'
import { z } from 'zod'
import type { AppEnv } from './context'

const createNoteSchema = z.object({ text: z.string().trim().min(1).max(500) })

// Chained so the route types flow into AppType for the SPA's RPC client.
export const notesRoutes = new Hono<AppEnv>()
  .get('/notes', async (c) => c.json({ items: await listNotes(c.get('deps')) }))
  .post('/notes', zValidator('json', createNoteSchema), async (c) => {
    const item = await createNote(c.get('deps'), c.req.valid('json'))
    return c.json({ item }, 201)
  })
