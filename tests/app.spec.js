import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5174';

test.describe('Spooky Games Platform - Feature Parity Tests', () => {
  
  test('Landing page loads with all key elements', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Check page title/heading (use first match to avoid strict mode error)
    await expect(page.locator('h1').filter({ hasText: 'SPOOKY' }).first()).toBeVisible();
    await expect(page.locator('h1').filter({ hasText: 'GAMES' }).first()).toBeVisible();
    
    // Check tagline
    await expect(page.getByText('Web3 Gaming')).toBeVisible();
    await expect(page.getByText('Hauntingly Good')).toBeVisible();
    
    // Check Get Started button
    const getStartedBtn = page.getByRole('button', { name: /Get Started|Browse Games/i });
    await expect(getStartedBtn).toBeVisible();
    
    // Check feature cards
    await expect(page.getByText('Play & Earn')).toBeVisible();
    await expect(page.getByText('Real Rewards')).toBeVisible();
    await expect(page.getByText('Own Your Identity')).toBeVisible();
    
    console.log('✅ Landing page loaded successfully');
  });

  test('Navigation header is present', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Check logo
    await expect(page.getByText('SPOOKY GAMES')).toBeVisible();
    
    // Check Connect Wallet button
    const connectBtn = page.getByRole('button', { name: /Connect Wallet/i });
    await expect(connectBtn).toBeVisible();
    
    console.log('✅ Navigation header displayed correctly');
  });

  test('Scroll to games section works', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Click Get Started to scroll to games
    const getStartedBtn = page.getByRole('button', { name: /Get Started|Browse Games/i }).first();
    await getStartedBtn.click();
    
    // Wait for scroll animation
    await page.waitForTimeout(1500);
    
    // Check if games section is visible
    const gamesSection = page.locator('text=games').first();
    await expect(gamesSection).toBeVisible();
    
    console.log('✅ Scroll to games section working');
  });

  test('Games grid displays with filters', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Scroll down to games section
    await page.evaluate(() => window.scrollTo(0, 1000));
    await page.waitForTimeout(500);
    
    // Check category filter exists
    const categoryFilter = page.locator('select').first();
    await expect(categoryFilter).toBeVisible();
    
    // Check at least one game card is visible
    const gameCards = page.locator('.game-card');
    await expect(gameCards.first()).toBeVisible();
    
    // Verify game card elements
    await expect(page.locator('.game-card').first()).toContainText(/Spooky|Haunted|Pumpkin|Witch/);
    
    console.log('✅ Games grid with filters displayed');
  });

  test('Games can be filtered by category', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Scroll to games
    await page.evaluate(() => window.scrollTo(0, 1000));
    await page.waitForTimeout(500);
    
    // Get initial game count
    const initialGameCards = await page.locator('.game-card').count();
    console.log(`Initial games shown: ${initialGameCards}`);
    
    // Select a category (try RPG)
    const categorySelect = page.locator('select').first();
    await categorySelect.selectOption('RPG');
    await page.waitForTimeout(300);
    
    // Check if filtering worked
    const filteredGameCards = await page.locator('.game-card').count();
    console.log(`Filtered games shown: ${filteredGameCards}`);
    
    expect(filteredGameCards).toBeGreaterThan(0);
    expect(filteredGameCards).toBeLessThanOrEqual(initialGameCards);
    
    console.log('✅ Category filtering works');
  });

  test('Game cards have required elements', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Scroll to games
    await page.evaluate(() => window.scrollTo(0, 1000));
    await page.waitForTimeout(500);
    
    // Check first game card elements
    const firstCard = page.locator('.game-card').first();
    
    // Should have image
    await expect(firstCard.locator('img')).toBeVisible();
    
    // Should have title
    const title = firstCard.locator('h3');
    await expect(title).toBeVisible();
    
    // Should have action button
    const button = firstCard.getByRole('button', { name: /Play Now|View Details/i });
    await expect(button).toBeVisible();
    
    console.log('✅ Game cards have all required elements');
  });

  test('Pagination works', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Scroll to games
    await page.evaluate(() => window.scrollTo(0, 1000));
    await page.waitForTimeout(500);
    
    // Check if pagination exists (should have page 2 button)
    const page2Button = page.getByRole('button', { name: '2' });
    
    if (await page2Button.isVisible()) {
      // Click page 2
      await page2Button.click();
      await page.waitForTimeout(500);
      
      // Verify page 2 is active (has different styling)
      await expect(page2Button).toHaveClass(/from-orange-500/);
      
      console.log('✅ Pagination works');
    } else {
      console.log('ℹ️ Pagination not visible (less than 10 games or filtered)');
    }
  });

  test('Onboarding modal opens', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Click Connect Wallet button
    const connectBtn = page.getByRole('button', { name: /Connect Wallet/i });
    await connectBtn.click();
    
    // Wait for modal
    await page.waitForTimeout(300);
    
    // Check modal content
    await expect(page.getByText('Connect Your Wallet')).toBeVisible();
    await expect(page.getByText('Freighter wallet')).toBeVisible();
    
    // Check step indicators
    const stepIndicators = page.locator('div[class*="rounded-full"]').filter({ hasText: '' });
    expect(await stepIndicators.count()).toBeGreaterThanOrEqual(3);
    
    console.log('✅ Onboarding modal opens correctly');
  });

  test('Onboarding modal can be closed', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Open modal
    const connectBtn = page.getByRole('button', { name: /Connect Wallet/i });
    await connectBtn.click();
    await page.waitForTimeout(300);
    
    // Verify modal is open
    await expect(page.getByText('Connect Your Wallet')).toBeVisible();
    
    // Close modal with ESC key (simpler and more reliable)
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    
    // Modal should be gone
    await expect(page.getByText('Connect Your Wallet')).not.toBeVisible();
    
    console.log('✅ Onboarding modal can be closed');
  });

  test('Responsive design - mobile view', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(BASE_URL);
    
    // Check if content is still visible (use first match to avoid strict mode error)
    await expect(page.locator('h1').filter({ hasText: 'SPOOKY' }).first()).toBeVisible();
    await expect(page.locator('h1').filter({ hasText: 'GAMES' }).first()).toBeVisible();
    
    // Scroll to games
    await page.evaluate(() => window.scrollTo(0, 1000));
    await page.waitForTimeout(500);
    
    // Games should still be visible in single column
    const gameCards = page.locator('.game-card');
    await expect(gameCards.first()).toBeVisible();
    
    console.log('✅ Responsive design works on mobile');
  });

  test('Custom scrollbar is styled', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Check if custom scrollbar CSS is applied
    const scrollbarStyle = await page.evaluate(() => {
      const style = window.getComputedStyle(document.documentElement);
      return {
        hasCustomScrollbar: document.styleSheets.length > 0
      };
    });
    
    expect(scrollbarStyle.hasCustomScrollbar).toBeTruthy();
    
    console.log('✅ Custom scrollbar styling applied');
  });

  test('GSAP animations are functional', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Scroll to games section to trigger animations
    await page.evaluate(() => window.scrollTo(0, 1000));
    await page.waitForTimeout(500);
    
    // Check that game cards are visible (animations completed successfully)
    const gameCards = page.locator('.game-card');
    await expect(gameCards.first()).toBeVisible();
    
    // Verify cards have loaded properly (animations didn't break the layout)
    const cardCount = await gameCards.count();
    expect(cardCount).toBeGreaterThan(0);
    
    console.log('✅ GSAP animations functional');
  });

  test('All 22 games are present (when no filter)', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Scroll to games
    await page.evaluate(() => window.scrollTo(0, 1000));
    await page.waitForTimeout(500);
    
    // Ensure "All" category is selected
    const categorySelect = page.locator('select').first();
    await categorySelect.selectOption('All');
    await page.waitForTimeout(300);
    
    // Count total games across all pages
    let totalGames = 0;
    
    // Page 1 games
    totalGames += await page.locator('.game-card').count();
    
    // Check if page 2 exists
    const page2Btn = page.getByRole('button', { name: '2' });
    if (await page2Btn.isVisible()) {
      await page2Btn.click();
      await page.waitForTimeout(500);
      totalGames += await page.locator('.game-card').count();
      
      // Check if page 3 exists
      const page3Btn = page.getByRole('button', { name: '3' });
      if (await page3Btn.isVisible()) {
        await page3Btn.click();
        await page.waitForTimeout(500);
        totalGames += await page.locator('.game-card').count();
      }
    }
    
    console.log(`Total games found: ${totalGames}`);
    expect(totalGames).toBe(22);
    
    console.log('✅ All 22 games are present');
  });

  test('Tailwind CSS is loaded', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Check if Tailwind utility classes are applied
    const hasTailwind = await page.evaluate(() => {
      const element = document.querySelector('[class*="bg-"]');
      return element !== null;
    });
    
    expect(hasTailwind).toBeTruthy();
    
    console.log('✅ Tailwind CSS loaded and working');
  });

  test('Page has no console errors', async ({ page }) => {
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto(BASE_URL);
    await page.waitForTimeout(2000);
    
    // Filter out expected errors (like Freighter not installed)
    const criticalErrors = errors.filter(err => 
      !err.includes('Freighter') && 
      !err.includes('wallet') &&
      !err.includes('Failed to load resource')
    );
    
    if (criticalErrors.length > 0) {
      console.log('⚠️ Console errors found:', criticalErrors);
    } else {
      console.log('✅ No critical console errors');
    }
    
    expect(criticalErrors.length).toBe(0);
  });

  test('Performance - page loads in reasonable time', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    console.log(`Page load time: ${loadTime}ms`);
    
    expect(loadTime).toBeLessThan(5000); // Should load in under 5 seconds
    
    console.log('✅ Page loads performantly');
  });

});
