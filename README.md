# saas-web-starter

A clean-architecture starter for full-stack apps on Cloudflare: **Hono API on
Workers + React SPA (served as static assets) + D1**, with the test and tooling
harness wired up. A single `notes` resource is the worked example of every layer.

## Stack

- Hono on Cloudflare Workers, D1 (drizzle-orm, generated migrations)
- React 19 + react-query + react-router 7 (lazy routes), Vite (`@cloudflare/vite-plugin`)
- Tailwind v4 + shadcn/ui, sonner toasts, i18n (i18next), light/dark/system theme
- Biome, dependency-cruiser (architecture enforcement), TypeScript
- Vitest (unit / jsdom+MSW / workerd+D1), Playwright E2E
- Gherkin `.feature` product specs

## Quick start

```bash
pnpm install
pnpm dev            # vite dev: SPA + Worker + local D1
```

Create the D1 and set its id in `wrangler.toml`:

```bash
wrangler d1 create saas-web-starter   # paste database_id into wrangler.toml
pnpm db:migrate:local                 # apply migrations to the local D1
```

## Adding a capability

Copy the `notes` slice end to end:

1. `shared/types.ts` — the DTOs.
2. `server/db/schema.ts` — the table; `pnpm db:generate` for the migration.
3. `server/domain/` — pure rules (if any).
4. `server/usecases/ports.ts` + a usecase module — orchestration over a repo port.
5. `server/adapters/repos/` — the drizzle repo.
6. `server/composition.ts` — wire the repo into `createDeps`.
7. `server/http/` — the routes; mount in `server/app.ts`.
8. `src/lib/api/` + UI; tests at the cheapest layer; a `spec/*.feature` scenario.

## Scripts

`pnpm test` (unit+web+api) · `pnpm e2e` · `pnpm lint` · `pnpm lint:arch` ·
`pnpm typecheck` · `pnpm build` · `pnpm db:generate` · `pnpm cf-typegen`
