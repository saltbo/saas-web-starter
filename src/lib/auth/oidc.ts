import { UserManager, WebStorageStateStore } from 'oidc-client-ts'

// The verified bearer token the API expects (the OIDC id_token: aud = client id).
export const TOKEN_KEY = 'auth_token'

let manager: UserManager | null = null

// Constructed lazily so the app loads even before OIDC env is configured (and so
// E2E, which injects a token directly, never touches the provider).
function getManager(): UserManager {
  if (!manager) {
    manager = new UserManager({
      authority: import.meta.env.VITE_OIDC_ISSUER,
      client_id: import.meta.env.VITE_OIDC_CLIENT_ID,
      redirect_uri: `${window.location.origin}/callback`,
      response_type: 'code',
      scope: 'openid profile email',
      userStore: new WebStorageStateStore({ store: window.localStorage }),
    })
  }
  return manager
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export async function login(): Promise<void> {
  await getManager().signinRedirect()
}

export async function completeLogin(): Promise<void> {
  const user = await getManager().signinRedirectCallback()
  const token = user.id_token ?? user.access_token
  if (token) localStorage.setItem(TOKEN_KEY, token)
}

export async function logout(): Promise<void> {
  localStorage.removeItem(TOKEN_KEY)
  await getManager().removeUser()
}
