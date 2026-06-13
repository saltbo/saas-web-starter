import { HttpResponse, http } from 'msw'
import { describe, expect, it } from 'vitest'
import { server } from '@/test/msw'
import { createNote, listNotes } from './api'

describe('notes api', () => {
  it('returns the page, with and without a cursor', async () => {
    const page = { items: [{ id: '1', text: 'a', createdAt: 'x' }], nextCursor: null }
    server.use(http.get('/api/notes', () => HttpResponse.json(page)))
    expect(await listNotes()).toEqual(page)
    expect(await listNotes('cursor-1')).toEqual(page)
  })

  it('throws on a failed list', async () => {
    server.use(http.get('/api/notes', () => new HttpResponse(null, { status: 500 })))
    await expect(listNotes()).rejects.toThrow('Failed to load notes')
  })

  it('throws on a failed create', async () => {
    server.use(http.post('/api/notes', () => new HttpResponse(null, { status: 500 })))
    await expect(createNote({ text: 'x' })).rejects.toThrow('Failed to create note')
  })
})
