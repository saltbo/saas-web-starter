# Product specs

Behaviour-first product specs in Gherkin `.feature` files — the source of truth for
**what the product does**, independent of implementation. Plain `.feature` files,
no Cucumber runner; tests trace back to scenarios by id.

## Convention

- One `.feature` file per capability.
- Each scenario carries two tags: the id `@<capability>/<slug>` and the layer that
  proves it (`@domain` / `@usecase` / `@web` / `@api` / `@e2e`):

  ```gherkin
  @notes/create @web
  Scenario: Create and list a note
    Given an empty notes list
    When the user submits a note
    Then the note appears in the list
  ```

- The id never changes once written (rename = new id).
- Verify each scenario at the **cheapest layer that can prove it** — most land in
  usecase/web/api; reserve `@e2e` for genuinely cross-stack, hermetic journeys.

## Traceability

Each scenario's home test carries `[spec: <id>]` in its name, so you can trace a
scenario to the test that proves it (and back):

```ts
it('creates and lists a note [spec: notes/create]', …)
```

## Escalation

If a non-technical audience ever needs to *run* the Gherkin, wire `playwright-bdd`
(compiles `.feature` → Playwright, keeps the native runner). These are already real
`.feature` files, so that step is drop-in.
