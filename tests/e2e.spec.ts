import { test, expect } from '@playwright/test';

test.describe('Medvarn Store E2E User Flow Verification', () => {

  test('1. Homepage Doctor Review Reels Section ("What Doctors Say")', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Verify Section Eyebrow & Title
    const eyebrow = page.locator('.vid-ey');
    await expect(eyebrow).toContainText('What Doctors Say');

    // Verify 2 Reel Cards exist
    const cards = page.locator('.vid-reel-card-portrait');
    await expect(cards).toHaveCount(2);

    // Verify Reel Card 1 Title (No TM symbol)
    const title1 = page.locator('.vid-reel-caption-title').nth(0);
    await expect(title1).toContainText("FlexiFit Women's V-Neck Scrub Suit");

    // Verify Reel Card 2 Title (No TM symbol)
    const title2 = page.locator('.vid-reel-caption-title').nth(1);
    await expect(title2).toContainText("Classic Solitaire Scrub Suit");

    console.log('✅ Doctor Review Reels section verified successfully!');
  });

  test('2. Product Catalog Page (/products)', async ({ page }) => {
    await page.goto('http://localhost:3000/products');
    await page.waitForLoadState('networkidle');

    // Check page title or product grid
    const bodyText = await page.innerText('body');
    expect(bodyText).toContain('Scrubs');
    console.log('✅ Catalog page verified successfully!');
  });

  test('3. Shopping Cart Page (/cart)', async ({ page }) => {
    await page.goto('http://localhost:3000/cart');
    await page.waitForLoadState('networkidle');

    const bodyText = await page.innerText('body');
    expect(bodyText.toLowerCase()).toContain('cart');
    console.log('✅ Cart page verified successfully!');
  });

  test('4. Admin Analytics Dashboard (/admin/analytics)', async ({ page }) => {
    await page.goto('http://localhost:3000/admin/analytics');
    await page.waitForLoadState('networkidle');

    // Check Header & Active Visitors indicator
    const bodyText = await page.innerText('body');
    expect(bodyText).toContain('Website Analytics');
    expect(bodyText).toContain('Active Visitors Now');

    // Verify Overview metric cards exist
    expect(bodyText).toContain('UNIQUE VISITORS');
    expect(bodyText).toContain('TOTAL SESSIONS');
    expect(bodyText).toContain('PAGE VIEWS');
    expect(bodyText).toContain('ORDERS PLACED');

    console.log('✅ Admin Analytics dashboard verified successfully!');
  });

});
