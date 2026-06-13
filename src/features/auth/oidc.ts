import { UserManager, WebStorageStateStore } from 'oidc-client-ts'
import { getConfig } from '@/lib/config'
import { clearToken, getToken, setToken } from '@/lib/token'

let manager: UserManager | null = null

// Constructed lazily from the runtime config (GET /api/configz), so OIDC settings
// live only on the backend and E2E (which injects a token) never touches the provider.
function getManager(): UserManager {
  if (!manager) {
    const { issuer, clientId } = getConfig().oidc
    manager = new UserManager({
      authority: issuer,
      client_id: clientId,
      redirect_uri: `${window.location.origin}/callback`,
      response_type: 'code',
      scope: 'openid profile email',
      userStore: new WebStorageStateStore({ store: window.localStorage }),
    })
  }
  return manager
}

export function isAuthenticated(): boolean {
  return getToken() !== null
}

export async function login(): Promise<void> {
  await getManager().signinRedirect()
}

export async function completeLogin(): Promise<void> {
  const user = await getManager().signinRedirectCallback()
  const token = user.id_token ?? user.access_token
  if (token) setToken(token)
}

export async function logout(): Promise<void> {
  clearToken()
  await getManager().removeUser()
}
