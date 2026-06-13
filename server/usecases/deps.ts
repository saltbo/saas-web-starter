import type { NotesRepo } from './ports'

// The dependency bundle injected into usecases; assembled in composition.ts.
export interface Deps {
  notesRepo: NotesRepo
}
