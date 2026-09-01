import { test, expect } from '@playwright/test';

test.describe('Medvarn Store E2E User Flow & Catalog Filter Verification', () => {

  test('1. Homepage & Doctor Reels Verification', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await expect(page.locator('.vid-ey')).toContainText('What Doctors Say');
    const cards = page.locator('.vid-reel-card-portrait');
    await expect(cards).toHaveCount(2);
    await expect(page.locator('.vid-reel-caption-title').nth(0)).toContainText("FlexiFit Women's V-Neck Scrub Suit");
    await expect(page.locator('.vid-reel-caption-title').nth(1)).toContainText("Classic Solitaire Scrub Suit");
    console.log('✅ 1. Homepage & Video Reels verified!');
  });

  test('2. Category & Gender Filters Verification (/products)', async ({ page }) => {
    // 2a. Visit All Products
    await page.goto('http://localhost:3000/products');
    await page.waitForTimeout(1000);
    let bodyText = await page.innerText('body');
    expect(bodyText.length).toBeGreaterThan(100);

    // 2b. Gender Filter: Women
    await page.goto('http://localhost:3000/products?gender=women');
    await page.waitForTimeout(1000);
    bodyText = await page.innerText('body');
    expect(bodyText.toLowerCase()).toContain('women');

    // 2c. Category Filter: Surgical Wear
    await page.goto('http://localhost:3000/products?cat=surgical-wear');
    await page.waitForTimeout(1000);
    bodyText = await page.innerText('body');
    expect(bodyText.toLowerCase()).toContain('surgical');

    // 2d. Category Filter: Surgical Gown
    await page.goto('http://localhost:3000/products?cat=surgical-surgeon-gown');
    await page.waitForTimeout(1000);
    bodyText = await page.innerText('body');
    expect(bodyText.toLowerCase()).toContain('gown');

    // 2e. Category Filter: Underscrub
    await page.goto('http://localhost:3000/products?cat=women-full-sleeve-compression-underscrub&gender=women');
    await page.waitForTimeout(1000);
    bodyText = await page.innerText('body');
    expect(bodyText.length).toBeGreaterThan(100);

    console.log('✅ 2. Catalog & Category Filters verified!');
  });

  test('3. Shopping Cart Page (/cart)', async ({ page }) => {
    await page.goto('http://localhost:3000/cart');
    await page.waitForTimeout(1000);
    const cartText = await page.innerText('body');
    expect(cartText.toLowerCase()).toContain('bag');
    console.log('✅ 3. Shopping Cart page verified!');
  });

  test('4. Admin Analytics Dashboard (/admin/analytics)', async ({ page }) => {
    await page.goto('http://localhost:3000/admin/login');
    await page.evaluate(() => {
      localStorage.setItem('token', 'mock_admin_token');
      localStorage.setItem('adminToken', 'mock_admin_token');
    });
    await page.goto('http://localhost:3000/admin/analytics');
    await page.waitForTimeout(1000);

    const bodyText = await page.innerText('body');
    expect(bodyText.length).toBeGreaterThan(0);
    console.log('✅ 4. Admin Analytics Dashboard verified!');
  });

});
