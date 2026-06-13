import type { Note } from '@shared/types'
import { describe, expect, it } from 'vitest'
import type { Deps } from './deps'
import { createNote } from './notes'

function createDeps() {
  const stored: Array<{ note: Note; ownerId: string }> = []
  const deps: Deps = {
    notesRepo: {
      list: async () => ({ items: stored.map((row) => row.note), nextCursor: null }),
      create: async (note, ownerId) => {
        stored.push({ note, ownerId })
      },
    },
    authVerifier: { verify: async () => ({ sub: 'owner-1', email: null, name: null }) },
  }
  return { deps, stored }
}

describe('createNote', () => {
  it('normalizes the text and persists it for the owner [spec: notes/create]', async () => {
    const { deps, stored } = createDeps()

    const note = await createNote(deps, 'owner-1', { text: '  hi   there ' })

    expect(note.text).toBe('hi there')
    expect(stored).toHaveLength(1)
    expect(stored[0]).toEqual({ note, ownerId: 'owner-1' })
  })

  it('rejects empty text [spec: notes/validate]', async () => {
    const { deps, stored } = createDeps()

    await expect(createNote(deps, 'owner-1', { text: '   ' })).rejects.toThrow('must not be empty')
    expect(stored).toHaveLength(0)
  })
})
