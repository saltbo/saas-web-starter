# saas-web-starter

A **Void SPA + API starter** for Cloudflare Workers: client-rendered React,
file-based API routes, automatically managed D1, and an isolated test harness.
Notes demonstrate authenticated creation, owner isolation and cursor pagination.

## Stack

- [Void](https://void.cloud): Vite plugin, file API routes, typed fetch, environment
  validation, D1 provisioning, migrations and deployment
- React 19 SPA, React Router 7, TanStack Query; **no SSR or server-rendered Pages**
- Vite 8, Tailwind v4, shadcn/ui, i18next and light/dark/system theme
- OIDC Authorization Code + PKCE (`oidc-client-ts`), stateless Access Token
  verification (`jose`)
- Biome, dependency-cruiser, TypeScript 6, Vitest, MSW and Playwright

## Quick start

Use Node **24.21.0 or later** and pnpm 10.30.2.

```sh
pnpm install
```

Create a root `.env` with your provider's public configuration:

```dotenv
OIDC_ISSUER=https://your-issuer.example.com
OIDC_CLIENT_ID=your-client-id
```

Register `http://localhost:5173/callback` as an allowed redirect URI with the
provider. Then run:

```sh
pnpm db:migrate:local
pnpm dev
```

Open `http://localhost:5173`. Void infers D1 from `void/db`, manages its local
state under `.void/`, and provisions the production resource when deployed.
You do not need to create a database or edit a Wrangler configuration manually.
Local state and `.env` are ignored by Git.

## Project structure

```text
void.config.ts         Void app identity, deployment and SPA asset policy
env.ts                 runtime-validated environment schema
vite.config.ts         React + Tailwind + voidPlugin()
index.html             static HTML with an empty React mount point
routes/api/            Void file routes; named GET/POST handlers
middleware/            ordered request boundary and API authentication
server/                focused JWT, note rules and persistence helpers
shared/                runtime wire schemas and inferred DTOs
db/
  schema.ts            SQLite tables through void/schema-d1
  migrations/          checked-in SQL and Drizzle snapshots
src/
  main.tsx             browser createRoot() entry
  app/                 providers, browser router and shell
  routes/              client pages (not Void server routes)
  features/            auth and notes capabilities with public exports
  shared/              typed transport, config, theme, i18n and UI primitives
scripts/               isolated integration/production-preview bootstrap
e2e/                   critical browser journeys and local OIDC provider
spec/                  behavior specifications and required proof layers
.void/                 generated types and local state (ignored)
```

Void owns the Worker entry and API registration. There is no hand-built Hono
application, Worker fetch dispatcher, DI composition root, or repository/port
hierarchy. `server/notes.ts` queries `db` from `void/db` using the schema imported
through `@schema`; pure note-text rules remain independent of the framework.

The frontend is a normal browser SPA. Void's `routing.fallbacks` serves
`index.html` only for unmatched client paths. An explicit API catch-all returns
JSON 404s; `routing.notFound: 'none'` prevents Cloudflare's asset layer from
replacing those responses with the SPA shell. There is no `pages/`, SSR entry,
server loader, page action, or hydration. React Router owns browser navigation
and TanStack Query owns remote state.

## Typed API calls

Void generates route, method, input and output types from `routes/api/*.ts`.
Use `defineHandler.withValidator()` with the shared runtime input schema:

```ts
// routes/api/example.ts
import { defineHandler } from 'void'
import { z } from 'zod'

export const POST = defineHandler.withValidator({
  body: z.object({ text: z.string().min(1) }),
})(async (_c, { body }) => ({ text: body.text }))
```

Call it with `fetch` from `void/client`. Application calls attach the in-memory
Bearer token through `apiOptions()` and validate returned data through
`decodeApiResponse()`. Notes demonstrate the complete flow. There is no Hono
RPC client or type-only link to a manually assembled `AppType`.

`pnpm install` runs `void prepare`; development and builds also refresh `.void/`.
The TypeScript configuration extends Void's generated configuration.

## Authentication and errors

Sign-in remains OIDC Authorization Code + PKCE. The SPA fetches the public issuer
and client ID from `GET /api/configz`; the same browser bundle can run in every
environment. Redirect transaction state uses session storage, while tokens stay
in memory. Protected API routes verify the **Access Token**, issuer, audience,
signature and expiry using OIDC discovery and JWKS. No ID Token substitution,
password accounts, server sessions or test authentication bypasses are added.

The global auth middleware protects all API routes except `/api/configz` and
`/api/health`. Application failures have stable error codes; input validation uses
Void's native validation response. Unexpected errors reach the centralized
request boundary with their stack and correlation IDs. Logs contain request
metadata, and successful mutations emit audit events without request bodies.

## Database changes

Edit `db/schema.ts`, then generate and review migrations:

```sh
pnpm db:generate
pnpm db:migrate:local
```

Commit SQL and snapshots under `db/migrations/`. The existing notes schema and
migration history are retained at Void's canonical location. Void applies the
checked-in migrations during deployment. It owns resource IDs through the
`void.lock.json` it generates on first deployment; commit that lock when created.

## Verification

```sh
pnpm verify             # lint, architecture, types, behavior, tests, coverage, build
pnpm test:fast          # unit and component tests
pnpm test:integration   # real generated Worker + D1 + JWT verification
pnpm test:coverage      # per-file fast-suite coverage
pnpm test:behavior      # spec-derived traceability and proof requirements
pnpm e2e               # hermetic Playwright production-preview journeys
```

Unit coverage enforces **95% per file for business rules**, **90% for the other
owned pure/browser logic**. Infrastructure behavior is proved by the real Worker
integration suite; workerd is not V8-instrumented. Architecture checks keep
browser code away from server/database imports and retain feature boundaries.

Both integration and E2E bootstrap from a fresh temporary project copy, exclude
developer `.env` and runtime state, create a local OIDC provider on a dynamic
port, build the actual application, run `void db migrate`, and start Vite's Void
production preview on a dynamic port. They remove the temporary workspace on
success or failure and retain logs/reports under `artifacts/`. They never reuse
`pnpm dev` state. No custom test Worker or hand-authored Wrangler config is used.

E2E additionally gates browser support, accessibility and dialog focus, CSP and
injection resistance, performance budgets and reviewed visual baselines.
Required spec traceability, integration behavior and critical E2E coverage remain
100%.

## Deploy

For your own Cloudflare account:

```sh
pnpm exec void secret put OIDC_ISSUER
pnpm exec void secret put OIDC_CLIENT_ID
pnpm deploy
```

Void authenticates with Cloudflare when needed, builds, provisions D1, applies
migrations and deploys. Register the deployed `/callback` URL with your OIDC
provider. Local `.env` values are never uploaded as production secrets.

CI runs the verification and browser gates. Continuous deployment remains
opt-in through `ENABLE_DEPLOY=true`, `CLOUDFLARE_API_TOKEN` and
`CLOUDFLARE_ACCOUNT_ID`; set the app's OIDC secrets before enabling it. The deploy
workflow uses `void deploy --platform cloudflare`, including its resource and
migration lifecycle.

Commits follow Conventional Commits; Husky runs staged-file checks and validates
commit messages.
