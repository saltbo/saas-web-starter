// The bearer token store (the OIDC id_token, aud = client id). Cross-cutting infra
// used by both the RPC client (request header) and the auth feature (login/logout).
const TOKEN_KEY = 'auth_token'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}
