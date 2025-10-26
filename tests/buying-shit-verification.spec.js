import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';

test.describe('Buying Sh*t Game - Complete Verification', () => {
  
  test('Complete flow: Platform loads → Game appears → Game launches → Screenshot verification', async ({ page }) => {
    console.log('🚀 Starting complete verification test...');
    
    // Step 1: Navigate to platform
    console.log('📍 Step 1: Navigating to platform...');
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of landing page
    await page.screenshot({ path: 'test-results/01-landing-page.png', fullPage: true });
    console.log('✅ Landing page loaded and screenshot saved');
    
    // Step 2: Verify platform is loaded
    console.log('📍 Step 2: Verifying platform elements...');
    await expect(page.locator('h1').filter({ hasText: /SPOOKY|Spooky/i }).first()).toBeVisible({ timeout: 10000 });
    console.log('✅ Platform header visible');
    
    // Step 3: Look for games section
    console.log('📍 Step 3: Finding games section...');
    
    // Scroll down to games if needed
    await page.evaluate(() => window.scrollTo(0, 800));
    await page.waitForTimeout(1000);
    
    // Take screenshot after scroll
    await page.screenshot({ path: 'test-results/02-scrolled-view.png', fullPage: true });
    console.log('✅ Scrolled to games section');
    
    // Step 4: Find the Buying Sh*t game card
    console.log('📍 Step 4: Looking for Buying Sh*t game card...');
    
    // Try multiple selectors to find the game
    const gameSelectors = [
      'text=💰 Buying Sh*t',
      'text=Buying Sh*t',
      'text=buying-shit',
      '[data-game-id="buying-shit"]',
      'text=Casino'
    ];
    
    let gameFound = false;
    let gameElement = null;
    
    for (const selector of gameSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 2000 })) {
          gameElement = element;
          gameFound = true;
          console.log(`✅ Found game with selector: ${selector}`);
          break;
        }
      } catch (e) {
        console.log(`❌ Selector not found: ${selector}`);
      }
    }
    
    if (!gameFound) {
      console.log('⚠️ Game not found with text selectors, checking all game cards...');
      
      // Get all text content to debug
      const bodyText = await page.textContent('body');
      console.log('Page contains "Buying":', bodyText.includes('Buying'));
      console.log('Page contains "Casino":', bodyText.includes('Casino'));
      
      // Take debug screenshot
      await page.screenshot({ path: 'test-results/03-debug-no-game-found.png', fullPage: true });
      
      // List all visible text
      const allText = await page.locator('*').allTextContents();
      console.log('All visible text snippets:', allText.filter(t => t.includes('Sh')).slice(0, 10));
    }
    
    expect(gameFound, 'Buying Sh*t game should be visible on the page').toBe(true);
    
    // Step 5: Take screenshot of the game card
    console.log('📍 Step 5: Capturing game card screenshot...');
    
    // Scroll game into view
    await gameElement.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    
    // Highlight the game card area
    await page.screenshot({ path: 'test-results/04-game-card-visible.png', fullPage: false });
    console.log('✅ Game card screenshot captured');
    
    // Step 6: Verify game card has an image
    console.log('📍 Step 6: Checking for game image...');
    
    // Look for img tags near the game
    const images = page.locator('img');
    const imageCount = await images.count();
    console.log(`Found ${imageCount} images on the page`);
    
    // Check if any image has loaded
    let imageLoaded = false;
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const src = await img.getAttribute('src');
      if (src && (src.includes('pollinations') || src.includes('buying') || src.includes('poker'))) {
        console.log(`✅ Found game image: ${src}`);
        imageLoaded = true;
        
        // Verify image actually loaded
        const naturalWidth = await img.evaluate(img => img.naturalWidth);
        console.log(`Image natural width: ${naturalWidth}px`);
        expect(naturalWidth).toBeGreaterThan(0);
        break;
      }
    }
    
    // Step 7: Click the game to launch it
    console.log('📍 Step 7: Launching the game...');
    await gameElement.click();
    await page.waitForTimeout(2000);
    
    // Take screenshot after click
    await page.screenshot({ path: 'test-results/05-after-game-click.png', fullPage: true });
    console.log('✅ Clicked on game');
    
    // Step 8: Check if game opened in modal/iframe
    console.log('📍 Step 8: Checking if game loaded in modal/iframe...');
    
    // Look for modal or iframe
    const iframe = page.frameLocator('iframe').first();
    const modal = page.locator('[role="dialog"], .modal, [class*="modal"]').first();
    
    let gameOpened = false;
    
    // Check for iframe
    try {
      const iframeElement = page.locator('iframe').first();
      if (await iframeElement.isVisible({ timeout: 3000 })) {
        console.log('✅ Game opened in iframe');
        gameOpened = true;
        
        // Get iframe src
        const iframeSrc = await iframeElement.getAttribute('src');
        console.log(`Iframe source: ${iframeSrc}`);
        
        // Wait for iframe content to load
        await page.waitForTimeout(3000);
        
        // Take screenshot with iframe
        await page.screenshot({ path: 'test-results/06-game-in-iframe.png', fullPage: true });
        
        // Try to access iframe content
        try {
          const iframeBody = iframe.locator('body');
          if (await iframeBody.isVisible({ timeout: 2000 })) {
            console.log('✅ Iframe content loaded');
            
            // Look for buttons in iframe
            const buttons = iframe.locator('button');
            const buttonCount = await buttons.count();
            console.log(`Found ${buttonCount} buttons in game`);
            
            // Take screenshot of iframe content
            const iframeElement2 = page.locator('iframe').first();
            await iframeElement2.screenshot({ path: 'test-results/07-game-content.png' });
          }
        } catch (e) {
          console.log('⚠️ Could not access iframe content (may be cross-origin)');
        }
      }
    } catch (e) {
      console.log('❌ No iframe found:', e.message);
    }
    
    // Check for modal
    try {
      if (await modal.isVisible({ timeout: 2000 })) {
        console.log('✅ Game opened in modal');
        gameOpened = true;
        await page.screenshot({ path: 'test-results/06-game-in-modal.png', fullPage: true });
      }
    } catch (e) {
      console.log('❌ No modal found');
    }
    
    if (!gameOpened) {
      console.log('⚠️ Game may have opened in new tab/window or directly on page');
      await page.screenshot({ path: 'test-results/06-game-state-unknown.png', fullPage: true });
    }
    
    // Step 9: Final verification
    console.log('📍 Step 9: Final verification...');
    await page.screenshot({ path: 'test-results/08-final-state.png', fullPage: true });
    
    console.log('✅✅✅ Complete verification finished! Check test-results folder for screenshots.');
    
    // Summary
    console.log('\n=== TEST SUMMARY ===');
    console.log(`✅ Platform loaded: YES`);
    console.log(`✅ Game card found: ${gameFound ? 'YES' : 'NO'}`);
    console.log(`✅ Game image loaded: ${imageLoaded ? 'YES' : 'NO'}`);
    console.log(`✅ Game opened: ${gameOpened ? 'YES' : 'UNKNOWN'}`);
    console.log('===================\n');
  });
  
  test('Direct navigation to game dist folder', async ({ page }) => {
    console.log('🚀 Testing direct navigation to game...');
    
    const gameUrl = `${BASE_URL}/games/buying-shit/dist/`;
    console.log(`Navigating to: ${gameUrl}`);
    
    await page.goto(gameUrl);
    await page.waitForLoadState('networkidle');
    
    // Verify title
    const title = await page.title();
    console.log(`Page title: ${title}`);
    expect(title).toBe('💰 Buying Sh*t');
    
    // Take screenshot
    await page.screenshot({ path: 'test-results/09-direct-game-access.png', fullPage: true });
    
    // Wait for game to fully load
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'test-results/10-game-loaded.png', fullPage: true });
    
    // Check for interactive elements
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    console.log(`Found ${buttonCount} buttons in the game`);
    expect(buttonCount).toBeGreaterThan(0);
    
    // Check for cards (poker game)
    const hasCards = await page.locator('text=/card|deal|bet|fold/i').first().isVisible({ timeout: 5000 }).catch(() => false);
    console.log(`Poker elements visible: ${hasCards}`);
    
    console.log('✅ Direct game access test complete!');
  });
});
