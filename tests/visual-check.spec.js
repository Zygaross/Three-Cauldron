import { test, expect } from '@playwright/test';

test('Visual check - take screenshots', async ({ page }) => {
  await page.goto('http://localhost:5174');
  
  // Screenshot 1: Landing page
  await page.screenshot({ path: 'test-results/1-landing-page.png', fullPage: true });
  console.log('✅ Screenshot 1: Landing page saved');
  
  // Screenshot 2: Scroll to games
  await page.evaluate(() => window.scrollTo(0, 1000));
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'test-results/2-games-grid.png', fullPage: true });
  console.log('✅ Screenshot 2: Games grid saved');
  
  // Screenshot 3: Filter by RPG
  const categorySelect = page.locator('select').first();
  await categorySelect.selectOption('RPG');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'test-results/3-rpg-filtered.png', fullPage: true });
  console.log('✅ Screenshot 3: RPG filter saved');
  
  // Screenshot 4: Onboarding modal
  await page.goto('http://localhost:5174');
  const connectBtn = page.getByRole('button', { name: /Connect Wallet/i });
  await connectBtn.click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'test-results/4-onboarding-modal.png', fullPage: true });
  console.log('✅ Screenshot 4: Onboarding modal saved');
  
  console.log('\n📸 All screenshots saved to test-results/');
});
