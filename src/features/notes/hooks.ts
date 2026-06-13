import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createNote, listNotes } from './api'

const notesKey = ['notes'] as const

export function useNotes() {
  return useQuery({ queryKey: notesKey, queryFn: listNotes })
}

export function useCreateNote() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createNote,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: notesKey }),
  })
}
