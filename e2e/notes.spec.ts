import { expect, test } from '@playwright/test'

// Runs against the real stack (vite + Worker + isolated local D1, reset on boot).
test('create a note end to end [spec: notes/create]', async ({ page }) => {
  await page.goto('/')

  await page.getByLabel('note').fill('an end-to-end note')
  await page.getByRole('button', { name: 'Add' }).click()

  await expect(page.getByText('an end-to-end note')).toBeVisible()
})
