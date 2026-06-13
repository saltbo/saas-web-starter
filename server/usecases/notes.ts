import { normalizeNoteText } from '@server/domain/note'
import type { CreateNoteInput, Note } from '@shared/types'
import type { Deps } from './deps'

// Listing is a pure forward to the repo (scoped by owner), so the route calls
// deps.notesRepo.list directly. createNote has orchestration, so it stays a usecase.
export async function createNote(deps: Deps, ownerId: string, input: CreateNoteInput): Promise<Note> {
  const note: Note = {
    id: crypto.randomUUID(),
    text: normalizeNoteText(input.text),
    createdAt: new Date().toISOString(),
  }
  await deps.notesRepo.create(note, ownerId)
  return note
}
