import { type FormEvent, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useCreateNote, useNotes } from '@/features/notes'

export default function NotesPage() {
  const { t } = useTranslation()
  const [text, setText] = useState('')
  const notes = useNotes()
  const add = useCreateNote()
  const items = notes.data?.pages.flatMap((page) => page.items) ?? []

  function onSubmit(event: FormEvent) {
    event.preventDefault()
    const value = text.trim()
    if (!value) return
    add.mutate(
      { text: value },
      {
        onSuccess: () => {
          setText('')
          toast.success(t('noteCreated'))
        },
        onError: (error) => toast.error(error instanceof Error ? error.message : 'Error'),
      },
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-heading text-xl font-semibold">{t('notesTitle')}</h1>

      <form onSubmit={onSubmit} className="flex gap-2">
        <Input
          aria-label={t('notePlaceholder')}
          placeholder={t('notePlaceholder')}
          value={text}
          onChange={(event) => setText(event.target.value)}
        />
        <Button type="submit" disabled={add.isPending}>
          {t('addNote')}
        </Button>
      </form>

      {notes.isLoading ? (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-9" />
          <Skeleton className="h-9" />
        </div>
      ) : items.length > 0 ? (
        <div className="flex flex-col gap-3">
          <ul className="flex flex-col gap-2">
            {items.map((note) => (
              <li key={note.id}>
                <Card size="sm">
                  <CardContent>{note.text}</CardContent>
                </Card>
              </li>
            ))}
          </ul>
          {notes.hasNextPage && (
            <Button variant="outline" onClick={() => notes.fetchNextPage()} disabled={notes.isFetchingNextPage}>
              {t('loadMore')}
            </Button>
          )}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">{t('notesEmpty')}</p>
      )}
    </div>
  )
}
