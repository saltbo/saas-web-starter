import { createBrowserRouter } from 'react-router'
import { Layout } from '@/components/app-shell/layout'
import { RouteError } from '@/routes/error'

// Route-level code splitting via react-router's `lazy` (data router).
export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <RouteError />,
    children: [
      { index: true, lazy: async () => ({ Component: (await import('@/routes/notes')).default }) },
      { path: 'about', lazy: async () => ({ Component: (await import('@/routes/about')).default }) },
      { path: '*', lazy: async () => ({ Component: (await import('@/routes/not-found')).default }) },
    ],
  },
])
