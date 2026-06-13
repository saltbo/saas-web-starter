import { expect, test } from '@playwright/test'

// Runs against the real stack (vite + Worker + isolated local D1, reset on boot).
// The worker runs in dev-auth (OIDC_DEV_USER, see e2e/dev.vars), so injecting any
// token both passes the SPA's auth guard and is accepted by the API.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('auth_token', 'e2e-token'))
})

test('create a note end to end [spec: notes/create]', async ({ page }) => {
  await page.goto('/')

  await page.getByRole('textbox').fill('an end-to-end note')
  await page.getByRole('button', { name: 'Add' }).click()

  await expect(page.getByText('an end-to-end note')).toBeVisible()
})
