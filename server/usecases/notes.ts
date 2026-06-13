import { normalizeNoteText } from '@server/domain/note'
import type { CreateNoteInput, Note } from '@shared/types'
import type { Deps } from './deps'

export async function listNotes(deps: Deps): Promise<Note[]> {
  return deps.notesRepo.list()
}

export async function createNote(deps: Deps, input: CreateNoteInput): Promise<Note> {
  const note: Note = {
    id: crypto.randomUUID(),
    text: normalizeNoteText(input.text),
    createdAt: new Date().toISOString(),
  }
  await deps.notesRepo.create(note)
  return note
}
