import type { Env } from '@server/env'
import type { Deps } from '@server/usecases/deps'
import type { AuthUser } from '@server/usecases/ports'

export type AppEnv = {
  Bindings: Env
  Variables: {
    deps: Deps
    user: AuthUser
  }
}
