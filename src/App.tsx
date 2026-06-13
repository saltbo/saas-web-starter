import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { type FormEvent, useState } from 'react'
import { createNote, listNotes } from '@/lib/api'

export function App() {
  const queryClient = useQueryClient()
  const [text, setText] = useState('')

  const notes = useQuery({ queryKey: ['notes'], queryFn: async () => (await listNotes()).items })

  const add = useMutation({
    mutationFn: createNote,
    onSuccess: () => {
      setText('')
      void queryClient.invalidateQueries({ queryKey: ['notes'] })
    },
  })

  function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (text.trim()) add.mutate({ text })
  }

  return (
    <main>
      <h1>Notes</h1>
      <form onSubmit={onSubmit}>
        <input
          aria-label="note"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Write a note"
        />
        <button type="submit" disabled={add.isPending}>
          Add
        </button>
      </form>
      <ul>
        {(notes.data ?? []).map((note) => (
          <li key={note.id}>{note.text}</li>
        ))}
      </ul>
    </main>
  )
}
