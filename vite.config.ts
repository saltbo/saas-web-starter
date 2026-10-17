import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vite'
import { voidPlugin } from 'void'

export default defineConfig({
  plugins: [react(), tailwindcss(), voidPlugin()],
  resolve: {
    alias: { '@': path.resolve(import.meta.dirname, 'src'), '@shared': path.resolve(import.meta.dirname, 'shared') },
  },
  server: { watch: { ignored: ['**/artifacts/**'] } },
})
