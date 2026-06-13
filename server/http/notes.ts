import { zValidator } from '@hono/zod-validator'
import { createNote, listNotes } from '@server/usecases/notes'
import type { Hono } from 'hono'
import { z } from 'zod'
import type { AppEnv } from './context'

const createNoteSchema = z.object({ text: z.string().trim().min(1).max(500) })

export function registerNoteRoutes(routes: Hono<AppEnv>) {
  routes.get('/notes', async (c) => {
    return c.json({ items: await listNotes(c.get('deps')) })
  })

  routes.post('/notes', zValidator('json', createNoteSchema), async (c) => {
    try {
      const item = await createNote(c.get('deps'), c.req.valid('json'))
      return c.json({ item }, 201)
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : 'Failed to create note.' }, 400)
    }
  })
}
