import { defineConfig } from 'void/config'

export default defineConfig({
  target: 'cloudflare',
  inference: { appType: 'void', scanDirs: ['routes', 'middleware', 'server', 'src'] },
  worker: { compatibility_date: '2026-06-03', compatibility_flags: ['nodejs_compat'] },
  cloudflare: { name: 'saas-web-starter' },
  routing: {
    // Let Void serve the shell only for unmatched client paths. The asset layer
    // must preserve intentional API 404s rather than replacing them with HTML.
    notFound: 'none',
    // Use the canonical asset URL so browser navigations retain /callback and
    // other client paths instead of following an /index.html -> / redirect.
    fallbacks: { '/*': '/' },
    headers: {
      '/*': ['Referrer-Policy: no-referrer', 'X-Content-Type-Options: nosniff', 'X-Frame-Options: DENY'],
    },
  },
})
