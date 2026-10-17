import { sqliteTable, text } from 'void/schema-d1'

export const notes = sqliteTable('notes', {
  id: text('id').primaryKey(),
  ownerId: text('owner_id').notNull(),
  text: text('text').notNull(),
  createdAt: text('created_at').notNull(),
})

export type NoteRow = typeof notes.$inferSelect
