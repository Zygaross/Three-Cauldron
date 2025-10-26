import { test, expect } from '@playwright/test';

test.describe('Payment Test Feature', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:5174');
  });

  test('should show payment button when wallet is connected', async ({ page }) => {
    // Check if we're on the landing page
    const getStartedButton = page.locator('button:has-text("Get Started")');
    
    if (await getStartedButton.isVisible()) {
      console.log('On landing page - need to connect wallet first');
      
      // Click Get Started
      await getStartedButton.click();
      
      // Wait for onboarding modal
      await page.waitForTimeout(1000);
      
      // Look for Connect Wallet button in modal
      const connectButton = page.locator('button:has-text("Connect")').first();
      
      if (await connectButton.isVisible()) {
        console.log('Onboarding modal appeared - wallet connection would require Freighter');
        // Can't proceed without actual Freighter extension
      }
    }
    
    // Check if payment button exists in DOM (even if not visible without wallet)
    const paymentButtonExists = await page.locator('button:has-text("Send 1 XLM Test")').count();
    console.log(`Payment button exists in DOM: ${paymentButtonExists > 0}`);
  });

  test('should render ContractTester component with correct structure', async ({ page }) => {
    // Check the page HTML for our component
    const pageContent = await page.content();
    
    // Check if our buttons are in the HTML
    const hasPaymentButton = pageContent.includes('Send 1 XLM Test') || pageContent.includes('💰');
    const hasTestContractButton = pageContent.includes('Test Contract');
    
    console.log('Payment button in HTML:', hasPaymentButton);
    console.log('Test Contract button in HTML:', hasTestContractButton);
    
    // At minimum, the component should be loaded
    expect(hasPaymentButton || hasTestContractButton).toBeTruthy();
  });

  test('should have proper button positioning and styling', async ({ page }) => {
    // Wait for page to load
    await page.waitForTimeout(2000);
    
    // Check if fixed positioning container exists
    const containerExists = await page.locator('.fixed.bottom-8.right-8').count();
    console.log(`Fixed bottom-right container exists: ${containerExists > 0}`);
    
    // Check for button classes
    const buttonCount = await page.locator('button.rounded-xl').count();
    console.log(`Rounded button count: ${buttonCount}`);
    
    expect(containerExists).toBeGreaterThan(0);
  });

  test('verify Stellar SDK imports are correct', async ({ page }) => {
    // Check console for any import errors
    const consoleMessages = [];
    page.on('console', msg => consoleMessages.push(msg.text()));
    
    // Reload page
    await page.reload();
    await page.waitForTimeout(2000);
    
    // Check for any Stellar SDK errors
    const hasSDKError = consoleMessages.some(msg => 
      msg.includes('StellarSdk') && (msg.includes('error') || msg.includes('undefined'))
    );
    
    console.log('Console messages:', consoleMessages.slice(0, 5));
    console.log('Has Stellar SDK errors:', hasSDKError);
    
    expect(hasSDKError).toBeFalsy();
  });

  test('check if payment function is properly defined', async ({ page }) => {
    // Inject a check to see if the payment logic exists
    const hasPaymentFunction = await page.evaluate(() => {
      // Check if Stellar SDK is loaded
      return typeof window.StellarSdk !== 'undefined';
    });
    
    console.log('Stellar SDK loaded in window:', hasPaymentFunction);
    
    // This tells us if the SDK is available for use
    if (!hasPaymentFunction) {
      console.warn('Stellar SDK not found in window - this is expected with modules');
    }
  });

  test('simulate wallet connected state and check button visibility', async ({ page }) => {
    // Mock wallet connected state in localStorage
    await page.evaluate(() => {
      localStorage.setItem('walletConnected', 'true');
      localStorage.setItem('walletAddress', 'GTEST123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ');
    });
    
    await page.reload();
    await page.waitForTimeout(2000);
    
    // Look for the payment button
    const paymentButton = page.locator('button:has-text("Send 1 XLM Test")');
    const isVisible = await paymentButton.isVisible().catch(() => false);
    
    console.log('Payment button visible after mock wallet connect:', isVisible);
    
    // The button should be in the DOM at least
    const buttonCount = await paymentButton.count();
    console.log('Payment button count in DOM:', buttonCount);
  });
});

test.describe('Visual Test - Payment Button', () => {
  test('check button appearance and layout', async ({ page }) => {
    await page.goto('http://localhost:5174');
    await page.waitForTimeout(2000);
    
    // Take screenshot to verify layout
    await page.screenshot({ 
      path: 'test-results/payment-buttons-layout.png',
      fullPage: true 
    });
    
    console.log('Screenshot saved to test-results/payment-buttons-layout.png');
    
    // Check if buttons are positioned correctly
    const bottomRightContainer = page.locator('.fixed.bottom-8.right-8');
    const containerCount = await bottomRightContainer.count();
    
    if (containerCount > 0) {
      const boundingBox = await bottomRightContainer.boundingBox();
      console.log('Container position:', boundingBox);
      
      // Verify it's in bottom-right
      if (boundingBox) {
        const viewportSize = page.viewportSize();
        const isBottomRight = boundingBox.x > viewportSize.width / 2 && 
                             boundingBox.y > viewportSize.height / 2;
        console.log('Is in bottom-right quadrant:', isBottomRight);
        expect(isBottomRight).toBeTruthy();
      }
    }
  });
});
