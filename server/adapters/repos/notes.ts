import type { createDb } from '@server/db/client'
import { notes } from '@server/db/schema'
import type { NotesRepo } from '@server/usecases/ports'
import { desc } from 'drizzle-orm'

type Db = ReturnType<typeof createDb>

export function createNotesRepo(db: Db): NotesRepo {
  return {
    async list() {
      return db.select().from(notes).orderBy(desc(notes.createdAt))
    },
    async create(note) {
      await db.insert(notes).values(note)
    },
  }
}
