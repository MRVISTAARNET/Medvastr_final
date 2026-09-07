import { test, expect } from '@playwright/test';

test.describe('Custom Embroidery Feature End-to-End Test Flow', () => {

  test('Custom Embroidery Widget & Modal Full Interactive Flow', async ({ page }) => {
    // 1. Visit product page
    await page.goto('http://localhost:3000/products');
    await page.waitForTimeout(1000);

    // Click first product card
    const firstProduct = page.locator('.product-card, a[href*="/product/"]').first();
    if (await firstProduct.count() > 0) {
      await firstProduct.click();
      await page.waitForTimeout(1000);
    } else {
      await page.goto('http://localhost:3000/product/1');
    }

    // 2. Verify "Custom Embroidery" card exists on PDP
    const embroideryHeader = page.locator('text=Custom Embroidery');
    await expect(embroideryHeader.first()).toBeVisible({ timeout: 5000 });
    console.log('✅ Custom Embroidery card visible on PDP');

    // 3. Click "Add Embroidery" radio option
    const addEmbroideryOption = page.locator('label:has-text("Add Embroidery")');
    await addEmbroideryOption.click();
    await page.waitForTimeout(500);

    // 4. Verify Modal opens with "Add Your Identity" heading
    const modalHeading = page.locator('h2:has-text("Add Your Identity")');
    await expect(modalHeading).toBeVisible();
    console.log('✅ Custom Embroidery modal opened successfully!');

    // 5. Select "Embroidery Bundle" card
    const bundleCard = page.locator('text=Embroidery Bundle').first();
    await bundleCard.click();
    await page.waitForTimeout(500);

    // 6. Verify transition to Configuration screen
    const addTextHeader = page.locator('h3:has-text("Add Text")');
    await expect(addTextHeader).toBeVisible();

    // 7. Enter Line 1 (Name) and Line 2 (Designation)
    const line1Input = page.locator('input[placeholder="Line 1 (Name)"]');
    await line1Input.fill('Dr. Vicky');

    const line2Input = page.locator('input[placeholder="Line 2 (Designation)"]');
    if (await line2Input.count() > 0) {
      await line2Input.fill('Cardiologist');
    }

    // 8. Verify character counter
    await expect(page.locator('text=9/22')).toBeVisible();

    // 9. Select font style: Aa Script
    const scriptFontBtn = page.locator('button:has-text("Aa Script")');
    await scriptFontBtn.click();

    // 10. Select Classic Icon (Caduceus or Heart)
    const caduceusBtn = page.locator('button[title="Caduceus"]').first();
    if (await caduceusBtn.count() > 0) {
      await caduceusBtn.click();
    }

    // 11. Click PROCEED
    const proceedBtn = page.locator('button:has-text("PROCEED")');
    await proceedBtn.click();
    await page.waitForTimeout(500);

    // 12. Verify Modal closed and PDP shows "Custom Embroidery Configured"
    await expect(page.locator('text=Custom Embroidery Configured')).toBeVisible();
    console.log('✅ Custom Embroidery complete flow verified with Playwright!');
  });

});
