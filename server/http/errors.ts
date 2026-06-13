import type { Context } from 'hono'
import { HTTPException } from 'hono/http-exception'

// One place to map thrown errors to a consistent JSON shape. Routes throw
// HTTPException for expected failures; anything else is an unexpected 500.
export function onError(err: Error, c: Context) {
  if (err instanceof HTTPException) return c.json({ error: err.message }, err.status)
  console.error('Unhandled error:', err)
  return c.json({ error: 'Internal server error.' }, 500)
}
