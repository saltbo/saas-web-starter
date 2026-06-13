import type { Env } from '@server/env'
import type { Deps } from '@server/usecases/deps'

export type AppEnv = {
  Bindings: Env
  Variables: {
    deps: Deps
  }
}
