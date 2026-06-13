import { QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'
import { loadConfig } from '@/lib/config'
import { queryClient } from '@/lib/query-client'
import { ThemeProvider } from '@/lib/theme'
import { router } from '@/routes/router'
import './i18n'
import './styles/globals.css'

const root = document.getElementById('root')
if (!root) throw new Error('Root element not found.')

// Load runtime config (from the backend) before rendering, so OIDC is configured.
loadConfig()
  .then(() => {
    createRoot(root).render(
      <StrictMode>
        <ThemeProvider>
          <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
          </QueryClientProvider>
        </ThemeProvider>
      </StrictMode>,
    )
  })
  .catch(() => {
    root.textContent = 'Failed to load application config.'
  })
