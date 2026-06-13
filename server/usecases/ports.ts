import type { Note } from '@shared/types'

// Interfaces for everything beyond the process boundary. Implemented in adapters/.
export interface NotesRepo {
  list(): Promise<Note[]>
  create(note: Note): Promise<void>
}
