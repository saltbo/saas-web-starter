import { setupServer } from 'msw/node'

// Per-test handlers are registered with server.use(...). The base server starts
// with none, so any unhandled request fails loudly (onUnhandledFrame: 'error').
export const server = setupServer()
