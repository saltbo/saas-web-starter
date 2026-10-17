/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    { name: 'no-circular', severity: 'error', from: {}, to: { circular: true } },
    {
      name: 'business-rule-stays-pure', severity: 'error',
      from: { path: '^server/note\\.ts$' }, to: { pathNot: '^server/note\\.ts$' },
    },
    {
      name: 'database-has-one-owner', severity: 'error',
      comment: 'Void database access belongs to the notes server module and schema.',
      from: { path: '^(server|routes|middleware|src)/', pathNot: '^server/notes\\.ts$' },
      to: { path: '^db/|node_modules/.*(?:void/(?:_db|schema-d1)|drizzle-orm)' },
    },
    {
      name: 'shared-is-a-leaf', severity: 'error', from: { path: '^shared' },
      to: { path: '^(server|src|routes|middleware|db)/' },
    },
    {
      name: 'browser-not-into-backend', severity: 'error', from: { path: '^src' },
      to: { path: '^(server|routes|middleware|db)/|^env\\.ts$' },
    },
    {
      name: 'backend-not-into-browser', severity: 'error', from: { path: '^(server|routes|middleware|db)/' },
      to: { path: '^src/' },
    },
    {
      name: 'frontend-shared-is-a-leaf', severity: 'error', from: { path: '^src/shared' },
      to: { path: '^src/(features|routes|app)' },
    },
    {
      name: 'frontend-features-do-not-compose-pages', severity: 'error', from: { path: '^src/features' },
      to: { path: '^src/(routes|app)' },
    },
    {
      name: 'cross-feature-imports-use-public-entry', severity: 'error', from: { path: '^src/features/([^/]+)/' },
      to: { path: '^src/features/', pathNot: ['^src/features/$1/', '^src/features/[^/]+/index\\.tsx?$'] },
    },
    {
      name: 'composition-imports-feature-public-entry', severity: 'error', from: { path: '^src/(app|routes)' },
      to: { path: '^src/features/[^/]+/', pathNot: '^src/features/[^/]+/index\\.tsx?$' },
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules|^\\.void/' },
    exclude: { path: ['\\.(test|spec)\\.[jt]sx?$', '^\\.void/'] },
    tsConfig: { fileName: 'tsconfig.json' },
    tsPreCompilationDeps: true,
  },
}
