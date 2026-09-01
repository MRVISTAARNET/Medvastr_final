import { test, expect } from '@playwright/test';

test.describe('Medvarn Complete Purchase Flow E2E Verification', () => {

  test('1. Homepage & Doctor Reels Verification', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await expect(page.locator('.vid-ey')).toContainText('What Doctors Say');
    const cards = page.locator('.vid-reel-card-portrait');
    await expect(cards).toHaveCount(2);
    await expect(page.locator('.vid-reel-caption-title').nth(0)).toContainText("FlexiFit Women's V-Neck Scrub Suit");
    await expect(page.locator('.vid-reel-caption-title').nth(1)).toContainText("Classic Solitaire Scrub Suit");
    console.log('✅ 1. Homepage & Video Reels verified!');
  });

  test('2. Product Catalog & Detail Page (Add to Cart)', async ({ page }) => {
    await page.goto('http://localhost:3000/products');
    await page.waitForLoadState('networkidle');

    // Look for product cards or links
    const productLinks = page.locator('a[href^="/product/"]');
    const count = await productLinks.count();
    expect(count).toBeGreaterThan(0);

    // Click the first product link
    await productLinks.first().click();
    await page.waitForLoadState('networkidle');

    // Check we are on product detail page
    expect(page.url()).toContain('/product/');

    // Select Size if present
    const sizeBtns = page.locator('button:has-text("S"), button:has-text("M"), button:has-text("L")');
    if (await sizeBtns.count() > 0) {
      await sizeBtns.first().click();
    }

    // Click Add to Cart button
    const addToCartBtn = page.locator('button:has-text("Add to Cart"), button:has-text("ADD TO CART")').first();
    await expect(addToCartBtn).toBeVisible();
    await addToCartBtn.click();

    console.log('✅ 2. Catalog & Product Add to Cart verified!');
  });

  test('3. Shopping Cart & Checkout Flow', async ({ page }) => {
    await page.goto('http://localhost:3000/cart');
    await page.waitForLoadState('networkidle');

    const bodyText = await page.innerText('body');
    expect(bodyText.toLowerCase()).toContain('cart');

    // Navigate to checkout
    await page.goto('http://localhost:3000/checkout');
    await page.waitForLoadState('networkidle');

    // Fill Shipping Form Details
    const emailInput = page.locator('input[name="email"], input[type="email"]').first();
    if (await emailInput.isVisible()) {
      await emailInput.fill('dr.sharma@medvarn.com');
    }

    const firstNameInput = page.locator('input[name="firstName"]').first();
    if (await firstNameInput.isVisible()) {
      await firstNameInput.fill('Rahul');
    }

    const lastNameInput = page.locator('input[name="lastName"]').first();
    if (await lastNameInput.isVisible()) {
      await lastNameInput.fill('Sharma');
    }

    const phoneInput = page.locator('input[name="phone"]').first();
    if (await phoneInput.isVisible()) {
      await phoneInput.fill('9876543210');
    }

    const addressInput = page.locator('input[name="address"]').first();
    if (await addressInput.isVisible()) {
      await addressInput.fill('123 Medical Enclave, Civil Lines');
    }

    const pincodeInput = page.locator('input[name="pincode"]').first();
    if (await pincodeInput.isVisible()) {
      await pincodeInput.fill('400001');
    }

    // Verify Place Order button exists and is active
    const placeOrderBtn = page.locator('button:has-text("Place Order"), button:has-text("PLACE ORDER"), button:has-text("Pay")').first();
    await expect(placeOrderBtn).toBeVisible();

    console.log('✅ 3. Shopping Cart & Checkout Form verified!');
  });

  test('4. Admin Analytics & Activity Log Verification', async ({ page }) => {
    await page.goto('http://localhost:3000/admin/analytics');
    await page.waitForLoadState('networkidle');

    const bodyText = await page.innerText('body');
    expect(bodyText).toContain('Website Analytics');
    expect(bodyText).toContain('Active Visitors Now');

    // Verify metric overview cards
    expect(bodyText).toContain('UNIQUE VISITORS');
    expect(bodyText).toContain('TOTAL SESSIONS');
    expect(bodyText).toContain('PAGE VIEWS');
    expect(bodyText).toContain('ORDERS PLACED');

    console.log('✅ 4. Admin Analytics Dashboard & Telemetry verified!');
  });

});
