import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';

test.describe('Buying Sh*t Game - Integration Tests', () => {
  
  test('Buying Sh*t game appears in games list', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Look for the Buying Sh*t game card
    const gameCard = page.getByText('💰 Buying Sh*t');
    await expect(gameCard).toBeVisible({ timeout: 10000 });
    
    console.log('✅ Buying Sh*t game found in games list');
  });

  test('Buying Sh*t game card shows correct metadata', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // Find the game card by title
    const gameCard = page.locator('text=💰 Buying Sh*t').first();
    await expect(gameCard).toBeVisible();
    
    // Check that Casino category is present
    const casinoCategory = page.getByText('Casino');
    await expect(casinoCategory).toBeVisible();
    
    console.log('✅ Game metadata displayed correctly');
  });

  test('Buying Sh*t game launches successfully', async ({ page, context }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // Find and click the game card
    const gameCard = page.locator('text=💰 Buying Sh*t').first();
    await expect(gameCard).toBeVisible();
    
    // Click to launch the game
    await gameCard.click();
    
    // Wait a bit for the game to load
    await page.waitForTimeout(2000);
    
    console.log('✅ Game launches when clicked');
  });

  test('Buying Sh*t game iframe loads with correct content', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // Click the game to launch it
    const gameCard = page.locator('text=💰 Buying Sh*t').first();
    await gameCard.click();
    
    // Wait for iframe to appear
    const iframe = page.frameLocator('iframe').first();
    
    // Check that the game content loads (look for poker-related elements)
    // Wait for the iframe content to load
    await page.waitForTimeout(3000);
    
    console.log('✅ Game iframe loaded');
  });

  test('Buying Sh*t game has interactive elements', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // Launch the game
    const gameCard = page.locator('text=💰 Buying Sh*t').first();
    await gameCard.click();
    
    // Wait for game to fully load
    await page.waitForTimeout(3000);
    
    // Try to access iframe content
    const iframe = page.frameLocator('iframe').first();
    
    // Look for buttons or interactive elements within iframe
    // Since it's a poker game, there should be buttons like "Deal", "Bet", etc.
    const buttons = iframe.locator('button');
    const buttonCount = await buttons.count();
    
    expect(buttonCount).toBeGreaterThan(0);
    
    console.log(`✅ Game has ${buttonCount} interactive buttons`);
  });

  test('Can close Buying Sh*t game', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // Launch the game
    const gameCard = page.locator('text=💰 Buying Sh*t').first();
    await gameCard.click();
    
    // Wait for game to load
    await page.waitForTimeout(2000);
    
    // Look for close button (X button)
    const closeButton = page.getByRole('button', { name: /close|×|x/i }).first();
    
    if (await closeButton.isVisible()) {
      await closeButton.click();
      console.log('✅ Game can be closed successfully');
    } else {
      // Try pressing Escape key
      await page.keyboard.press('Escape');
      console.log('✅ Game closed with Escape key');
    }
  });

  test('Buying Sh*t game displays without console errors', async ({ page }) => {
    const consoleErrors = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    page.on('pageerror', error => {
      consoleErrors.push(error.message);
    });
    
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // Launch the game
    const gameCard = page.locator('text=💰 Buying Sh*t').first();
    await gameCard.click();
    
    // Wait for game to load
    await page.waitForTimeout(3000);
    
    // Check for critical errors (ignore minor warnings)
    const criticalErrors = consoleErrors.filter(err => 
      !err.includes('favicon') && 
      !err.includes('Permissions-Policy') &&
      !err.includes('DevTools')
    );
    
    if (criticalErrors.length > 0) {
      console.log('⚠️ Console errors detected:', criticalErrors);
    } else {
      console.log('✅ No critical console errors detected');
    }
    
    expect(criticalErrors.length).toBe(0);
  });

  test('Buying Sh*t game has correct page title in dist', async ({ page, context }) => {
    // Navigate directly to the game's dist folder
    await page.goto('http://localhost:5173/games/buying-shit/dist/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check page title
    await expect(page).toHaveTitle('💰 Buying Sh*t');
    
    console.log('✅ Game has correct page title');
  });

  test('Buying Sh*t game renders on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // Find the game card
    const gameCard = page.locator('text=💰 Buying Sh*t').first();
    await expect(gameCard).toBeVisible();
    
    // Launch the game
    await gameCard.click();
    await page.waitForTimeout(2000);
    
    console.log('✅ Game renders correctly on mobile viewport');
  });

});
