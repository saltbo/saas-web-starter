import { createNoteInputSchema } from '@shared/types'
import { defineHandler } from 'void'
import { z } from 'zod'
import { createNote, listNotes } from '../../server/notes'

export const GET = defineHandler.withValidator({
  query: z.object({
    limit: z.coerce.number().int().min(1).max(100).default(20),
    cursor: z.string().optional(),
  }),
})(async (c, { query }) => listNotes(c.get('principal').sub, query.limit, query.cursor))

export const POST = defineHandler.withValidator({ body: createNoteInputSchema })(async (c, { body }) => {
  const item = await createNote(c.get('principal').sub, body)
  return c.json({ item }, 201)
})
