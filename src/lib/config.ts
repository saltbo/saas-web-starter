import type { ClientConfig } from '@shared/types'
import { rpc } from '@/lib/rpc'

// The SPA's runtime config comes from the backend (GET /api/configz), so there is
// one set of env vars (on the worker) and the same bundle runs in every environment.
let config: ClientConfig | null = null

export async function loadConfig(): Promise<ClientConfig> {
  const response = await rpc.configz.$get()
  if (!response.ok) throw new Error(`Failed to load config: ${response.status}`)
  config = await response.json()
  return config
}

export function getConfig(): ClientConfig {
  if (!config) throw new Error('Config not loaded — call loadConfig() at startup.')
  return config
}
