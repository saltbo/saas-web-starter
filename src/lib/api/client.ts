import { getToken, TOKEN_KEY } from '@/lib/auth/oidc'

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function apiError(response: Response, fallbackMessage: string): Promise<ApiError> {
  try {
    const payload = (await response.clone().json()) as { error?: string; code?: string }
    return new ApiError(payload.error || fallbackMessage, response.status, payload.code)
  } catch {
    return new ApiError(fallbackMessage, response.status)
  }
}

export async function apiRequest<T>(path: string, fallbackMessage: string, init?: RequestInit): Promise<T> {
  const token = getToken()
  const response = await fetch(path, {
    ...init,
    headers: {
      ...(init?.body ? { 'content-type': 'application/json' } : {}),
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  })

  if (response.status === 401) {
    localStorage.removeItem(TOKEN_KEY)
    window.location.href = '/login'
    throw new ApiError('Authentication required.', 401)
  }

  if (!response.ok) {
    throw await apiError(response, fallbackMessage)
  }

  return response.json() as Promise<T>
}

export function jsonBody(input: unknown): RequestInit {
  return { method: 'POST', body: JSON.stringify(input) }
}
