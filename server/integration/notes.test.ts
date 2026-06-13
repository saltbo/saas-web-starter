import { env } from 'cloudflare:test'
import { app } from '@server/app'
import { describe, expect, it } from 'vitest'

function request(path: string, init?: RequestInit) {
  const headers = new Headers(init?.headers)
  if (init?.body && !headers.has('content-type')) headers.set('content-type', 'application/json')
  return app.fetch(new Request(`http://app.test${path}`, { ...init, headers }), env)
}

describe('notes api', () => {
  it('starts empty, then lists a created note [spec: notes/create]', async () => {
    expect(await (await request('/api/notes')).json()).toEqual({ items: [] })

    const created = await request('/api/notes', { method: 'POST', body: JSON.stringify({ text: '  hello   world ' }) })
    expect(created.status).toBe(201)
    const createdBody = (await created.json()) as { item: { text: string } }
    expect(createdBody.item).toMatchObject({ text: 'hello world' })

    const list = (await (await request('/api/notes')).json()) as { items: Array<{ text: string }> }
    expect(list.items.map((note) => note.text)).toEqual(['hello world'])
  })

  it('rejects an empty note [spec: notes/validate]', async () => {
    const response = await request('/api/notes', { method: 'POST', body: JSON.stringify({ text: '   ' }) })
    expect(response.status).toBe(400)
  })
})
