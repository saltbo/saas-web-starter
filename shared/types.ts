// The API contract shared by the server and the SPA. Plain, framework-free DTOs.

export interface Note {
  id: string
  text: string
  createdAt: string
}

export interface CreateNoteInput {
  text: string
}

// Public runtime config the SPA fetches from GET /api/configz. The backend env is
// the single source of truth; only PUBLIC values may be exposed here.
export interface ClientConfig {
  oidc: {
    issuer: string
    clientId: string
  }
}
