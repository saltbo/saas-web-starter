import { defineHandler } from 'void'

export const GET = defineHandler((c) => c.json({ error: { code: 'not_found', message: 'API route not found.' } }, 404))
export const POST = GET
export const PUT = GET
export const PATCH = GET
export const DELETE = GET
export const OPTIONS = GET
