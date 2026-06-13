import type { Note } from '@shared/types'

// Interfaces for everything beyond the process boundary. Implemented in adapters/.
export interface NotesRepo {
  list(): Promise<Note[]>
  create(note: Note): Promise<void>
}

export interface AuthUser {
  sub: string
  email: string | null
  name: string | null
}

export interface AuthVerifier {
  /** Verifies a bearer token and returns the user, or throws if invalid. */
  verify(token: string): Promise<AuthUser>
}
