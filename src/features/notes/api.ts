import { type CreateNoteInput, createNoteResponseSchema, notesPageSchema } from '@shared/types'
import { fetch } from 'void/client'
import { apiOptions, decodeApiResponse } from '@/shared/api/client'

export async function listNotes(cursor?: string) {
  return decodeApiResponse(fetch('/api/notes', { ...apiOptions(), query: cursor ? { cursor } : {} }), notesPageSchema)
}

export async function createNote(input: CreateNoteInput) {
  return (
    await decodeApiResponse(
      fetch('/api/notes', { ...apiOptions(), method: 'POST', body: input }),
      createNoteResponseSchema,
    )
  ).item
}
