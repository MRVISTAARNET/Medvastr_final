# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests\e2e.spec.ts >> Medvarn Store E2E User Flow Verification >> 4. Admin Analytics Dashboard (/admin/analytics)
- Location: tests\e2e.spec.ts:31:7

# Error details

```
Error: expect(received).toBeGreaterThan(expected)

Expected: > 50
Received:   21
```

# Page snapshot

```yaml
- generic [active] [ref=f1e1]:
  - generic [ref=f1e2]: Verifying Security...
  - button "Open Next.js Dev Tools" [ref=f1e10] [cursor=pointer]
  - alert [ref=f1e14]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Medvarn Store E2E User Flow Verification', () => {
  4  | 
  5  |   test('1. Homepage & Doctor Reels Verification', async ({ page }) => {
  6  |     await page.goto('http://localhost:3000');
  7  |     await expect(page.locator('.vid-ey')).toContainText('What Doctors Say');
  8  |     const cards = page.locator('.vid-reel-card-portrait');
  9  |     await expect(cards).toHaveCount(2);
  10 |     await expect(page.locator('.vid-reel-caption-title').nth(0)).toContainText("FlexiFit Women's V-Neck Scrub Suit");
  11 |     await expect(page.locator('.vid-reel-caption-title').nth(1)).toContainText("Classic Solitaire Scrub Suit");
  12 |     console.log('✅ 1. Homepage & Video Reels verified!');
  13 |   });
  14 | 
  15 |   test('2. Product Catalog Page (/products)', async ({ page }) => {
  16 |     await page.goto('http://localhost:3000/products');
  17 |     await page.waitForTimeout(1000);
  18 |     const bodyText = await page.innerText('body');
  19 |     expect(bodyText.length).toBeGreaterThan(100);
  20 |     console.log('✅ 2. Catalog page verified!');
  21 |   });
  22 | 
  23 |   test('3. Shopping Cart Page (/cart)', async ({ page }) => {
  24 |     await page.goto('http://localhost:3000/cart');
  25 |     await page.waitForTimeout(1000);
  26 |     const cartText = await page.innerText('body');
  27 |     expect(cartText.toLowerCase()).toContain('bag');
  28 |     console.log('✅ 3. Shopping Cart page verified!');
  29 |   });
  30 | 
  31 |   test('4. Admin Analytics Dashboard (/admin/analytics)', async ({ page }) => {
  32 |     await page.goto('http://localhost:3000/admin/login');
  33 |     await page.evaluate(() => {
  34 |       localStorage.setItem('token', 'mock_admin_token');
  35 |       localStorage.setItem('adminToken', 'mock_admin_token');
  36 |     });
  37 |     await page.goto('http://localhost:3000/admin/analytics');
  38 |     await page.waitForTimeout(1500);
  39 | 
  40 |     const bodyText = await page.innerText('body');
> 41 |     expect(bodyText.length).toBeGreaterThan(50);
     |                             ^ Error: expect(received).toBeGreaterThan(expected)
  42 |     console.log('✅ 4. Admin Analytics Dashboard verified!');
  43 |   });
  44 | 
  45 | });
  46 | 
```