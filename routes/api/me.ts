import { defineHandler } from 'void'

export const GET = defineHandler((c) => ({ user: c.get('principal') }))
