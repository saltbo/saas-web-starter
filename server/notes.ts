import { notes } from '@schema'
import type { CreateNoteInput, NotesPage } from '@shared/types'
import { and, db, desc, eq, lt, or } from 'void/db'
import { z } from 'zod'
import { InvalidCursorError } from './errors'
import { normalizeNoteText } from './note'

const cursorSchema = z.tuple([z.iso.datetime(), z.uuid()])

export async function listNotes(ownerId: string, limit: number, cursor?: string): Promise<NotesPage> {
  const parsed = cursor ? cursorSchema.safeParse(cursor.split('|')) : undefined
  if (parsed && !parsed.success) throw new InvalidCursorError()
  const after = parsed?.data
  const keyset = after
    ? or(lt(notes.createdAt, after[0]), and(eq(notes.createdAt, after[0]), lt(notes.id, after[1])))
    : undefined
  const rows = await db
    .select({ id: notes.id, text: notes.text, createdAt: notes.createdAt })
    .from(notes)
    .where(and(eq(notes.ownerId, ownerId), keyset))
    .orderBy(desc(notes.createdAt), desc(notes.id))
    .limit(limit + 1)
  const items = rows.slice(0, limit)
  const last = items.at(-1)
  return { items, nextCursor: rows.length > limit && last ? `${last.createdAt}|${last.id}` : null }
}

export async function createNote(ownerId: string, input: CreateNoteInput) {
  const item = {
    id: crypto.randomUUID(),
    text: normalizeNoteText(input.text),
    createdAt: new Date().toISOString(),
  }
  await db.insert(notes).values({ ...item, ownerId })
  return item
}
