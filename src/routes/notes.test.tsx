import type { Note } from '@shared/types'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import '@/i18n'
import { server } from '@/test/msw'
import NotesPage from './notes'

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

// Component test: real api client + react-query, API mocked at the network edge
// (MSW) with a small in-memory store so the post-mutation refetch converges.
function mockNotesBackend(initial: Note[] = []) {
  const store = [...initial]
  server.use(
    http.get('/api/notes', () => HttpResponse.json({ items: store, nextCursor: null })),
    http.post('/api/notes', async ({ request }) => {
      const body = (await request.json()) as { text: string }
      const item: Note = { id: String(store.length + 1), text: body.text.trim(), createdAt: '2026-01-01T00:00:00.000Z' }
      store.unshift(item)
      return HttpResponse.json({ item }, { status: 201 })
    }),
  )
}

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

describe('NotesPage', () => {
  it('creates a note and shows it in the list [spec: notes/create]', async () => {
    mockNotesBackend()
    render(<NotesPage />, { wrapper })

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'first note' } })
    fireEvent.click(screen.getByRole('button', { name: 'Add' }))

    await waitFor(() => expect(screen.getByText('first note')).toBeInTheDocument())
  })
})
