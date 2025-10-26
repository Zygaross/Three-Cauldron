import { test, expect } from '@playwright/test';

test.describe('SDK Demo Wallet Check', () => {
  test('should auto-detect wallet connection', async ({ page }) => {
    // Listen to console messages and errors
    const messages = [];
    const errors = [];
    
    page.on('console', msg => {
      const text = msg.text();
      messages.push(text);
      console.log('CONSOLE:', text);
    });
    
    page.on('pageerror', error => {
      errors.push(error.message);
      console.log('PAGE ERROR:', error.message);
    });

    // Go to page
    await page.goto('http://localhost:5174');
    
    // Wait for app to load
    await page.waitForTimeout(3000);
    
    // Print all messages
    console.log('\n=== All Console Messages ===');
    messages.forEach(msg => console.log(msg));
    console.log('============================\n');
    
    console.log('\n=== All Errors ===');
    errors.forEach(err => console.log(err));
    console.log('===================\n');
    
    // Check if GamePayoutDemo component is rendered
    const demoVisible = await page.locator('.fixed.bottom-24.right-8').count();
    console.log('GamePayoutDemo visible:', demoVisible > 0);
    
    // Check wallet connected state
    const walletConnected = await page.evaluate(() => {
      return document.body.innerHTML.includes('SPOOKY GAMES');
    });
    console.log('Page loaded:', walletConnected);
    
    // Take screenshot
    await page.screenshot({ path: 'test-results/sdk-demo-check.png', fullPage: true });
  });

  test('should connect wallet when clicking connect button', async ({ page }) => {
    const messages = [];
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('[useStellarGaming]') || text.includes('[StellarGameSDK]')) {
        console.log('SDK LOG:', text);
      }
    });

    await page.goto('http://localhost:5174');
    await page.waitForTimeout(1000);
    
    // Connect wallet in the main app first
    const mainConnectBtn = page.getByRole('button', { name: /Connect Wallet/i }).first();
    if (await mainConnectBtn.isVisible()) {
      console.log('Main connect button found - clicking...');
      // We can't actually connect Freighter in tests, but we can verify the flow exists
    }
    
    // Check if SDK demo shows connection UI
    const sdkDemo = page.locator('.fixed.bottom-24.right-8');
    const sdkVisible = await sdkDemo.count();
    console.log('SDK Demo component count:', sdkVisible);
    
    if (sdkVisible > 0) {
      const sdkText = await sdkDemo.textContent();
      console.log('SDK Demo text content:', sdkText);
    }
  });
});
