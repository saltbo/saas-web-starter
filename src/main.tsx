import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'
import { Providers } from '@/app/providers'
import { router } from '@/app/router'
import { loadConfig } from '@/lib/config'
import '@/i18n'
import '@/styles/globals.css'

const root = document.getElementById('root')
if (!root) throw new Error('Root element not found.')

// Load runtime config (from the backend) before rendering, so OIDC is configured.
loadConfig()
  .then(() => {
    createRoot(root).render(
      <StrictMode>
        <Providers>
          <RouterProvider router={router} />
        </Providers>
      </StrictMode>,
    )
  })
  .catch(() => {
    root.textContent = 'Failed to load application config.'
  })
