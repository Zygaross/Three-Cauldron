import { test, expect } from '@playwright/test';

// Basic E2E sanity for the Spooky Poker game build
// Opens the built game from public path served by Vite dev server

test('Spooky Poker loads and can start a game', async ({ page }) => {
  // Open the built dist entry under public/
  await page.goto('/games/spooky-poker/dist/index.html');

  // Should see the role selection screen first
  await expect(page.getByText("Choose Your Fate", { exact: false })).toBeVisible();
  await expect(page.getByRole('button', { name: /Player 1/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /Player 2/i })).toBeVisible();

  // Pick Player 1
  await page.getByRole('button', { name: /Player 1/i }).click();

  // If no saved game, there will be a prompt to start a new one
  const summonBtn = page.getByRole('button', { name: /Summon New Game/i });
  if (await summonBtn.isVisible()) {
    await summonBtn.click();
  }

  // Verify core UI pieces are present
  await expect(page.getByText("HALLOWEEN HOLD'EM", { exact: false })).toBeVisible();
  await expect(page.getByText('THE CURSED CARDS', { exact: false })).toBeVisible();

  // Verify action buttons
  await expect(page.getByRole('button', { name: /FOLD/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /CHECK/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /CALL/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /RAISE/i })).toBeVisible();

  // Try an action that should always be safe: attempt CHECK or CALL depending on availability
  const checkBtn = page.getByRole('button', { name: /CHECK/i });
  if (await checkBtn.isEnabled()) {
    await checkBtn.click();
  }
});
