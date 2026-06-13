import type { Note } from '@shared/types'
import { describe, expect, it } from 'vitest'
import type { Deps } from './deps'
import { createNote } from './notes'

function createDeps() {
  const stored: Note[] = []
  const deps = {
    notesRepo: {
      list: async () => stored,
      create: async (note: Note) => {
        stored.push(note)
      },
    },
  } as Deps
  return { deps, stored }
}

describe('createNote', () => {
  it('normalizes the text and persists it [spec: notes/create]', async () => {
    const { deps, stored } = createDeps()

    const note = await createNote(deps, { text: '  hi   there ' })

    expect(note.text).toBe('hi there')
    expect(stored).toHaveLength(1)
    expect(stored[0]).toBe(note)
  })

  it('rejects empty text [spec: notes/validate]', async () => {
    const { deps, stored } = createDeps()

    await expect(createNote(deps, { text: '   ' })).rejects.toThrow('must not be empty')
    expect(stored).toHaveLength(0)
  })
})
