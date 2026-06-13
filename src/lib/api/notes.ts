import type { CreateNoteInput, Note } from '@shared/types'
import { apiRequest, jsonBody } from './client'

export async function listNotes() {
  return apiRequest<{ items: Note[] }>('/api/notes', 'Failed to load notes.')
}

export async function createNote(input: CreateNoteInput) {
  return apiRequest<{ item: Note }>('/api/notes', 'Failed to create note.', jsonBody(input))
}
