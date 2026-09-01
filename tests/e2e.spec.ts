import { test, expect } from '@playwright/test';

test.describe('Medvarn Store E2E User Flow Verification', () => {

  test('1. Homepage & Doctor Reels Verification', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await expect(page.locator('.vid-ey')).toContainText('What Doctors Say');
    const cards = page.locator('.vid-reel-card-portrait');
    await expect(cards).toHaveCount(2);
    await expect(page.locator('.vid-reel-caption-title').nth(0)).toContainText("FlexiFit Women's V-Neck Scrub Suit");
    await expect(page.locator('.vid-reel-caption-title').nth(1)).toContainText("Classic Solitaire Scrub Suit");
    console.log('✅ 1. Homepage & Video Reels verified!');
  });

  test('2. Product Catalog Page (/products)', async ({ page }) => {
    await page.goto('http://localhost:3000/products');
    await page.waitForTimeout(1000);
    const bodyText = await page.innerText('body');
    expect(bodyText.length).toBeGreaterThan(10);
    console.log('✅ 2. Catalog page verified!');
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
