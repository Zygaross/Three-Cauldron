import { test, expect } from '@playwright/test';

test('Verify Buying Sh*t game - Visual Check', async ({ page }) => {
  // Navigate to the platform
  await page.goto('http://localhost:5173');
  await page.waitForLoadState('networkidle');
  
  // Wait a bit for everything to load
  await page.waitForTimeout(2000);
  
  // Take full page screenshot
  await page.screenshot({ path: 'buying-shit-test-01-landing.png', fullPage: true });
  console.log('✅ Screenshot 1: Landing page saved');
  
  // Scroll down to see games
  await page.evaluate(() => window.scrollTo(0, 1000));
  await page.waitForTimeout(1000);
  
  await page.screenshot({ path: 'buying-shit-test-02-games-section.png', fullPage: true });
  console.log('✅ Screenshot 2: Games section saved');
  
  // Check if the game text exists on the page
  const pageContent = await page.content();
  const hasBuyingShit = pageContent.includes('Buying Sh*t') || pageContent.includes('buying-shit');
  console.log(`Game text found on page: ${hasBuyingShit}`);
  
  // Try to find and click the game
  try {
    const gameCard = page.locator('text=💰 Buying Sh*t').or(page.locator('text=Buying Sh*t')).first();
    await gameCard.waitFor({ state: 'visible', timeout: 5000 });
    
    console.log('✅ Game card found!');
    await gameCard.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    
    await page.screenshot({ path: 'buying-shit-test-03-game-card.png' });
    console.log('✅ Screenshot 3: Game card visible');
    
    // Click the game
    await gameCard.click();
    await page.waitForTimeout(3000);
    
    await page.screenshot({ path: 'buying-shit-test-04-game-clicked.png', fullPage: true });
    console.log('✅ Screenshot 4: After clicking game');
    
  } catch (error) {
    console.log('❌ Could not find game card:', error.message);
    await page.screenshot({ path: 'buying-shit-test-ERROR.png', fullPage: true });
  }
  
  // Test direct access to game
  console.log('\n🎮 Testing direct game access...');
  await page.goto('http://localhost:5173/games/buying-shit/dist/');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);
  
  await page.screenshot({ path: 'buying-shit-test-05-direct-access.png', fullPage: true });
  console.log('✅ Screenshot 5: Direct game access');
  
  // Check title
  const title = await page.title();
  console.log(`Page title: "${title}"`);
  expect(title).toContain('Buying Sh*t');
  
  // Check for game elements (buttons, cards, etc.)
  const buttons = await page.locator('button').count();
  console.log(`Number of buttons in game: ${buttons}`);
  
  console.log('\n✅✅✅ Test complete! Check the root directory for screenshots.');
});
