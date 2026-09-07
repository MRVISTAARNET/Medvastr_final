# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: embroidery.spec.ts >> Custom Embroidery Feature End-to-End Test Flow >> Custom Embroidery Widget & Modal Full Interactive Flow
- Location: tests\embroidery.spec.ts:5:7

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/products
Call log:
  - navigating to "http://localhost:3000/products", waiting until "load"

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Custom Embroidery Feature End-to-End Test Flow', () => {
  4  | 
  5  |   test('Custom Embroidery Widget & Modal Full Interactive Flow', async ({ page }) => {
  6  |     // 1. Visit product page
> 7  |     await page.goto('http://localhost:3000/products');
     |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/products
  8  |     await page.waitForTimeout(1000);
  9  | 
  10 |     // Click first product card
  11 |     const firstProduct = page.locator('.product-card, a[href*="/product/"]').first();
  12 |     if (await firstProduct.count() > 0) {
  13 |       await firstProduct.click();
  14 |       await page.waitForTimeout(1000);
  15 |     } else {
  16 |       await page.goto('http://localhost:3000/product/1');
  17 |     }
  18 | 
  19 |     // 2. Verify "Custom Embroidery" card exists on PDP
  20 |     const embroideryHeader = page.locator('text=Custom Embroidery');
  21 |     await expect(embroideryHeader.first()).toBeVisible({ timeout: 5000 });
  22 |     console.log('✅ Custom Embroidery card visible on PDP');
  23 | 
  24 |     // 3. Click "Add Embroidery" radio option
  25 |     const addEmbroideryOption = page.locator('label:has-text("Add Embroidery")');
  26 |     await addEmbroideryOption.click();
  27 |     await page.waitForTimeout(500);
  28 | 
  29 |     // 4. Verify Modal opens with "Add Your Identity" heading
  30 |     const modalHeading = page.locator('h2:has-text("Add Your Identity")');
  31 |     await expect(modalHeading).toBeVisible();
  32 |     console.log('✅ Custom Embroidery modal opened successfully!');
  33 | 
  34 |     // 5. Select "Embroidery Bundle" card
  35 |     const bundleCard = page.locator('text=Embroidery Bundle').first();
  36 |     await bundleCard.click();
  37 |     await page.waitForTimeout(500);
  38 | 
  39 |     // 6. Verify transition to Configuration screen
  40 |     const addTextHeader = page.locator('h3:has-text("Add Text")');
  41 |     await expect(addTextHeader).toBeVisible();
  42 | 
  43 |     // 7. Enter Line 1 (Name) and Line 2 (Designation)
  44 |     const line1Input = page.locator('input[placeholder="Line 1 (Name)"]');
  45 |     await line1Input.fill('Dr. Vicky');
  46 | 
  47 |     const line2Input = page.locator('input[placeholder="Line 2 (Designation)"]');
  48 |     if (await line2Input.count() > 0) {
  49 |       await line2Input.fill('Cardiologist');
  50 |     }
  51 | 
  52 |     // 8. Verify character counter
  53 |     await expect(page.locator('text=9/22')).toBeVisible();
  54 | 
  55 |     // 9. Select font style: Aa Script
  56 |     const scriptFontBtn = page.locator('button:has-text("Aa Script")');
  57 |     await scriptFontBtn.click();
  58 | 
  59 |     // 10. Select Classic Icon (Caduceus or Heart)
  60 |     const caduceusBtn = page.locator('button[title="Caduceus"]').first();
  61 |     if (await caduceusBtn.count() > 0) {
  62 |       await caduceusBtn.click();
  63 |     }
  64 | 
  65 |     // 11. Click PROCEED
  66 |     const proceedBtn = page.locator('button:has-text("PROCEED")');
  67 |     await proceedBtn.click();
  68 |     await page.waitForTimeout(500);
  69 | 
  70 |     // 12. Verify Modal closed and PDP shows "Custom Embroidery Configured"
  71 |     await expect(page.locator('text=Custom Embroidery Configured')).toBeVisible();
  72 |     console.log('✅ Custom Embroidery complete flow verified with Playwright!');
  73 |   });
  74 | 
  75 | });
  76 | 
```