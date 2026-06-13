/**
 * Architecture enforcement for the hono-cf-clean-arch layout.
 *
 *   pnpm add -D dependency-cruiser
 *   package.json: "lint:arch": "depcruise server/ shared/ src/ --config .dependency-cruiser.cjs"
 *   (keep the trailing slashes — bare directory names can resolve to 0 modules)
 *
 * tsConfig points at server/tsconfig.json: it inherits the path aliases + jsx from
 * the root base and has a non-empty `include`, so module resolution works for both
 * halves (the root base uses `files: []` and can't be loaded directly).
 */

/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      severity: 'error',
      from: {},
      to: { circular: true },
    },

    // ---- server: the dependency rule ----
    {
      name: 'domain-stays-pure',
      comment: 'domain/ may only import domain/ and shared/. No frameworks, no I/O.',
      severity: 'error',
      from: { path: '^server/domain' },
      to: { pathNot: '^server/domain|^shared' },
    },
    {
      name: 'usecases-no-infrastructure',
      comment: 'usecases/ must not reach outward to adapters, http, db, or composition.',
      severity: 'error',
      from: { path: '^server/usecases' },
      to: { path: '^server/(adapters|http|db)|^server/composition' },
    },
    {
      name: 'usecases-no-framework-packages',
      comment: 'usecases/ must not import delivery or persistence frameworks.',
      severity: 'error',
      from: { path: '^server/usecases' },
      to: { path: 'node_modules/(hono|drizzle-orm|zod)' },
    },
    {
      name: 'adapters-not-into-delivery',
      comment: 'adapters/ implement ports; they never know about http/ or composition.',
      severity: 'error',
      from: { path: '^server/adapters' },
      to: { path: '^server/(http|composition)' },
    },
    {
      name: 'drizzle-only-in-repos',
      // When the project uses better-auth (or similar: owns its own tables AND is
      // consumed directly by the delivery layer), keep it at server/auth.ts and
      // extend pathNot with `|^server/auth` as a named exception.
      comment: 'Persistence is confined to adapters/repos/ and db/.',
      severity: 'error',
      from: { path: '^server', pathNot: '^server/(adapters/repos|db)' },
      to: { path: 'node_modules/drizzle-orm|^server/db/schema' },
    },
    {
      name: 'http-not-into-adapters',
      comment: 'http/ gets dependencies from context, never constructs adapters.',
      severity: 'error',
      from: { path: '^server/http' },
      to: { path: '^server/adapters' },
    },

    // ---- the two halves meet only through shared/ ----
    {
      name: 'shared-is-a-leaf',
      comment: 'shared/ is the contract; it imports nothing from server/ or src/.',
      severity: 'error',
      from: { path: '^shared' },
      to: { path: '^server|^src' },
    },
    {
      name: 'frontend-not-into-server',
      comment:
        'The SPA talks to the server over HTTP at runtime. Only type-only imports are allowed (Hono RPC AppType).',
      severity: 'error',
      from: { path: '^src' },
      to: { path: '^server', dependencyTypesNot: ['type-only'] },
    },
    {
      name: 'server-not-into-frontend',
      comment: 'The server never reaches into the SPA; the two halves meet only through shared/.',
      severity: 'error',
      from: { path: '^server' },
      to: { path: '^src' },
    },

    // ---- frontend: keep the SPA from turning into a ball of mud ----
    {
      name: 'frontend-lib-is-a-leaf',
      comment: 'src/lib is cross-cutting infrastructure; it must not import features, routes, app, or components.',
      severity: 'error',
      from: { path: '^src/lib' },
      to: { path: '^src/(features|routes|app|components)' },
    },
    {
      name: 'frontend-components-no-features',
      comment: 'Shared components are composed by features/routes/app, never the reverse.',
      severity: 'error',
      from: { path: '^src/components' },
      to: { path: '^src/(features|routes|app)' },
    },
    {
      name: 'frontend-features-are-isolated',
      comment: 'A feature must not import another feature; share via lib/ or shared/.',
      severity: 'error',
      from: { path: '^src/features/([^/]+)/' },
      to: { path: '^src/features/([^/]+)/', pathNot: '^src/features/$1/' },
    },
    {
      name: 'frontend-routes-are-leaves',
      comment: 'Route pages are mounted by app/router; features, components, and lib never import them.',
      severity: 'error',
      from: { path: '^src/(features|components|lib)' },
      to: { path: '^src/routes' },
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    // Tests are exempt; so is generated code (openapi-ts clients etc.).
    exclude: { path: ['\\.(test|spec)\\.[jt]sx?$', '\\.gen\\.[jt]s$'] },
    tsConfig: { fileName: 'server/tsconfig.json' },
    tsPreCompilationDeps: true,
  },
}
