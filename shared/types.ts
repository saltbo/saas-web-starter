// The API contract shared by the server and the SPA. Plain, framework-free DTOs.

export interface Note {
  id: string
  text: string
  createdAt: string
}

export interface CreateNoteInput {
  text: string
}
