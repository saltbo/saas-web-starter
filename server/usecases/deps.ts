import type { AuthVerifier, NotesRepo } from './ports'

// The dependency bundle injected into usecases/middleware; assembled in composition.ts.
export interface Deps {
  notesRepo: NotesRepo
  authVerifier: AuthVerifier
}
