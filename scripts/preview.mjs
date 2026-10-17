import { preview } from 'vite'

const server = await preview({ preview: { host: '127.0.0.1', port: 0, strictPort: true } })
const address = server.httpServer?.address()
if (!address || typeof address === 'string') throw new Error('Void preview did not bind a TCP port.')
const origin = `http://127.0.0.1:${address.port}`
const health = await fetch(`${origin}/api/health`)
if (!health.ok) throw new Error(`Void production preview failed its health check (${health.status}).`)
process.send?.({ origin })

process.on('message', async (message) => {
  if (message === 'close') {
    await server.close()
    process.disconnect?.()
  }
})
