import { HTTPException } from 'hono/http-exception'
import { defineMiddleware } from 'void'
import { env } from 'void/env'
import { ExpectedError } from '../server/errors'

const requestIdPattern = /^[a-zA-Z0-9._:-]{1,128}$/
const incomingId = (value: string | undefined) => (value && requestIdPattern.test(value) ? value : undefined)

export default defineMiddleware(async (c, next) => {
  const startedAt = performance.now()
  const issuerUrl = URL.parse(env.OIDC_ISSUER)
  if (!issuerUrl) throw new Error('Invalid OIDC issuer configuration.')
  const requestId = incomingId(c.req.header('x-request-id')) ?? crypto.randomUUID()
  const traceId = incomingId(c.req.header('x-trace-id')) ?? requestId
  c.set('requestId', requestId)
  c.set('traceId', traceId)
  await next()

  const error = c.error
  const unexpectedError = error && !(error instanceof ExpectedError) && !(error instanceof HTTPException)
  if (error instanceof ExpectedError) {
    c.res = c.json({ error: { code: error.code, message: error.message } }, error.status)
  } else if (unexpectedError) {
    c.res = c.json({ error: { code: 'internal_error', message: 'Internal server error.' } }, 500)
  }

  c.header('x-request-id', requestId)
  c.header('x-trace-id', traceId)
  c.header(
    'content-security-policy',
    `default-src 'self'; base-uri 'self'; connect-src 'self' ${issuerUrl.origin}; font-src 'self'; form-action 'self'; frame-ancestors 'none'; img-src 'self' data:; object-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'`,
  )

  const entry = {
    event: 'http_request',
    requestId,
    traceId,
    method: c.req.method,
    path: c.req.path,
    status: c.res.status,
    durationMs: Math.round((performance.now() - startedAt) * 100) / 100,
    authMethod: c.get('principal') ? 'bearer' : null,
    userAgent: c.req.header('user-agent') ?? null,
    contentType: c.req.header('content-type') ?? null,
    error: unexpectedError ? { name: error.name, message: error.message, stack: error.stack } : null,
  }
  if (unexpectedError) console.error(JSON.stringify(entry))
  else console.info(JSON.stringify(entry))

  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(c.req.method) && c.res.status < 400) {
    console.info(
      JSON.stringify({
        event: 'audit',
        requestId,
        traceId,
        actorId: c.get('principal')?.sub ?? null,
        action: c.req.method.toLowerCase(),
        resource: c.req.path,
        status: c.res.status,
      }),
    )
  }
})
