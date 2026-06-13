import type { CreateNoteInput } from '@shared/types'
import { rpc } from '@/lib/rpc'

export async function listNotes(cursor?: string) {
  const response = await rpc.notes.$get({ query: cursor ? { cursor } : {} })
  if (!response.ok) throw new Error('Failed to load notes.')
  return response.json()
}

export async function createNote(input: CreateNoteInput) {
  const response = await rpc.notes.$post({ json: input })
  if (!response.ok) throw new Error('Failed to create note.')
  return (await response.json()).item
}
