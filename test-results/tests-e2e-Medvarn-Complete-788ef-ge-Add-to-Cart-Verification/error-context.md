# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests\e2e.spec.ts >> Medvarn Complete Purchase Flow E2E Verification >> 2. Product Detail Page & Add to Cart Verification
- Location: tests\e2e.spec.ts:15:7

# Error details

```
Error: expect(received).toContain(expected) // indexOf

Expected substring: "FlexiFit"
Received string:    "✓ Free shipping on orders above ₹999
✓ Bulk discounts for hospitals & clinics
✓ Call us: 8976488911
✓ Code MEDVARN10 — 10% off first order
✓ Free shipping on orders above ₹999
✓ Bulk discounts for hospitals & clinics
✓ Call us: 8976488911
✓ Code MEDVARN10 — 10% off first order
WOMEN
▾
MEN
▾
SURGICAL WEAR
▾
BULK ORDERS
▾
BLOGS
CONTACT US
Search
Login
Cart
Loading product...
Medvarn - Stay informed. Stay comfortable.
→·
Product Manufactured For, Packed & Marketed By Medvarn.·
Corporate Office·
F 81-B, Express Zone, Malad East, Mumbai – 400063·
Company
About Us
Blog
Size Guide
Bulk Orders
Support
Contact Us
Track Order
Shipping & Returns
Privacy & Terms
Quick Links
Scrub Suit
Cotton Crew T-Shirt
Full Sleeve Under Scrub
Surgical Gown
Surgical Cap
Connect With Us
📞
8976488911
✉️
info@medvarn.com
© 2026 Medvarn. All rights reserved.
Made by MrVistaarNet ❤️
UPI
VISA
MC
AMEX
COD
EMI
Shopping Bag
0 items in your bag
✕
🛍️
Your bag is empty
Explore our premium medical apparel collection and start adding items.
Continue Shopping"
```

# Page snapshot

```yaml
- generic [active] [ref=f1e1]:
  - generic [ref=f1e3]:
    - generic [ref=f1e4]: ✓ Free shipping on orders above ₹999
    - generic [ref=f1e5]: ✓ Bulk discounts for hospitals & clinics
    - generic [ref=f1e6]: "✓ Call us: 8976488911"
    - generic [ref=f1e7]: ✓ Code MEDVARN10 — 10% off first order
    - generic [ref=f1e8]: ✓ Free shipping on orders above ₹999
    - generic [ref=f1e9]: ✓ Bulk discounts for hospitals & clinics
    - generic [ref=f1e10]: "✓ Call us: 8976488911"
    - generic [ref=f1e11]: ✓ Code MEDVARN10 — 10% off first order
  - generic [ref=f1e13]:
    - link [ref=f1e15] [cursor=pointer]:
      - /url: /
      - img "Medvarn" [ref=f1e17]
    - generic [ref=f1e19]:
      - link "WOMEN ▾" [ref=f1e21] [cursor=pointer]:
        - /url: /products?gender=women
        - generic [ref=f1e22]: WOMEN
        - generic [ref=f1e23]: ▾
      - link "MEN ▾" [ref=f1e25] [cursor=pointer]:
        - /url: /products?gender=men
        - generic [ref=f1e26]: MEN
        - generic [ref=f1e27]: ▾
      - link "SURGICAL WEAR ▾" [ref=f1e29] [cursor=pointer]:
        - /url: /products?cat=surgical-wear
        - generic [ref=f1e30]: SURGICAL WEAR
        - generic [ref=f1e31]: ▾
      - link "BULK ORDERS ▾" [ref=f1e33] [cursor=pointer]:
        - /url: /bulk-orders
        - generic [ref=f1e34]: BULK ORDERS
        - generic [ref=f1e35]: ▾
      - link "BLOGS" [ref=f1e36] [cursor=pointer]:
        - /url: /blog
      - link "CONTACT US" [ref=f1e38] [cursor=pointer]:
        - /url: /contact
    - generic [ref=f1e40]:
      - button "Search" [ref=f1e41] [cursor=pointer]
      - button "Login" [ref=f1e46] [cursor=pointer]
      - button "Cart" [ref=f1e51] [cursor=pointer]
  - main [ref=f1e58]:
    - generic [ref=f1e59]: Loading product...
  - contentinfo [ref=f1e61]:
    - generic [ref=f1e63]:
      - generic [ref=f1e64]: Medvarn - Stay informed. Stay comfortable.
      - generic [ref=f1e66]:
        - textbox "Enter Email Address" [ref=f1e67]
        - button "→" [ref=f1e68] [cursor=pointer]
    - generic [ref=f1e69]:
      - generic [ref=f1e70]:
        - link [ref=f1e71] [cursor=pointer]:
          - /url: /
          - img "Medvarn" [ref=f1e73]
        - paragraph [ref=f1e74]: Product Manufactured For, Packed & Marketed By Medvarn.
        - generic [ref=f1e75]:
          - strong [ref=f1e76]: Corporate Office
          - paragraph [ref=f1e77]: F 81-B, Express Zone, Malad East, Mumbai – 400063
        - generic [ref=f1e78]:
          - link "Instagram" [ref=f1e79] [cursor=pointer]:
            - /url: https://www.instagram.com/medvarn/
          - link "Facebook" [ref=f1e82] [cursor=pointer]:
            - /url: https://www.facebook.com/medvarn/
          - link "WhatsApp" [ref=f1e85] [cursor=pointer]:
            - /url: https://wa.me/918976488911?text=Hi!%20I%20have%20a%20question%20about%20Medvarn%20scrubs.
      - generic [ref=f1e88]:
        - generic [ref=f1e89]: Company
        - list [ref=f1e90]:
          - listitem [ref=f1e91]:
            - link "About Us" [ref=f1e92] [cursor=pointer]:
              - /url: /about
          - listitem [ref=f1e93]:
            - link "Blog" [ref=f1e94] [cursor=pointer]:
              - /url: /blog
          - listitem [ref=f1e95]:
            - link "Size Guide" [ref=f1e96] [cursor=pointer]:
              - /url: /sizeguide
          - listitem [ref=f1e97]:
            - link "Bulk Orders" [ref=f1e98] [cursor=pointer]:
              - /url: /bulk-orders
      - generic [ref=f1e99]:
        - generic [ref=f1e100]: Support
        - list [ref=f1e101]:
          - listitem [ref=f1e102]:
            - link "Contact Us" [ref=f1e103] [cursor=pointer]:
              - /url: /contact
          - listitem [ref=f1e104]:
            - link "Track Order" [ref=f1e105] [cursor=pointer]:
              - /url: /track
          - listitem [ref=f1e106]:
            - link "Shipping & Returns" [ref=f1e107] [cursor=pointer]:
              - /url: /refund
          - listitem [ref=f1e108]:
            - link "Privacy & Terms" [ref=f1e109] [cursor=pointer]:
              - /url: /privacy
      - generic [ref=f1e110]:
        - generic [ref=f1e111]: Quick Links
        - list [ref=f1e112]:
          - listitem [ref=f1e113]:
            - link "Scrub Suit" [ref=f1e114] [cursor=pointer]:
              - /url: /products?type=scrubs
          - listitem [ref=f1e115]:
            - link "Cotton Crew T-Shirt" [ref=f1e116] [cursor=pointer]:
              - /url: /products?type=tshirts
          - listitem [ref=f1e117]:
            - link "Full Sleeve Under Scrub" [ref=f1e118] [cursor=pointer]:
              - /url: /products?type=underscrub
          - listitem [ref=f1e119]:
            - link "Surgical Gown" [ref=f1e120] [cursor=pointer]:
              - /url: /products?cat=surgical-surgeon-gown
          - listitem [ref=f1e121]:
            - link "Surgical Cap" [ref=f1e122] [cursor=pointer]:
              - /url: /products?cat=surgical-surgeon-cap
      - generic [ref=f1e123]:
        - generic [ref=f1e124]: Connect With Us
        - list [ref=f1e125]:
          - listitem [ref=f1e126]:
            - generic [ref=f1e127] [cursor=pointer]: 📞
            - link "8976488911" [ref=f1e129] [cursor=pointer]:
              - /url: tel:8976488911
          - listitem [ref=f1e130]:
            - generic [ref=f1e131] [cursor=pointer]: ✉️
            - link "info@medvarn.com" [ref=f1e132] [cursor=pointer]:
              - /url: mailto:info@medvarn.com
    - generic [ref=f1e133]:
      - generic [ref=f1e134]:
        - text: © 2026 Medvarn. All rights reserved.
        - generic [ref=f1e135]:
          - text: Made by
          - link "MrVistaarNet" [ref=f1e136] [cursor=pointer]:
            - /url: https://mrvistaarnet.com
          - text: ❤️
      - generic [ref=f1e137]:
        - generic [ref=f1e138]: UPI
        - generic [ref=f1e139]: Visa
        - generic [ref=f1e140]: MC
        - generic [ref=f1e141]: Amex
        - generic [ref=f1e142]: COD
        - generic [ref=f1e143]: EMI
  - generic [ref=f1e144]:
    - generic [ref=f1e145]:
      - generic [ref=f1e146]:
        - heading "Shopping Bag" [level=3] [ref=f1e147]
        - generic [ref=f1e148]: 0 items in your bag
      - button "Close Shopping Bag" [ref=f1e149] [cursor=pointer]: ✕
    - generic [ref=f1e151]:
      - generic [ref=f1e152]: 🛍️
      - generic [ref=f1e153]: Your bag is empty
      - generic [ref=f1e154]: Explore our premium medical apparel collection and start adding items.
      - button "Continue Shopping" [ref=f1e155] [cursor=pointer]
  - link "Chat on WhatsApp" [ref=f1e156] [cursor=pointer]:
    - /url: https://wa.me/918976488911?text=Hi!%20I%20have%20a%20question%20about%20Medvarn%20scrubs.
  - button "Open Next.js Dev Tools" [ref=f1e164] [cursor=pointer]
  - alert [ref=f1e168]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Medvarn Complete Purchase Flow E2E Verification', () => {
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
  15 |   test('2. Product Detail Page & Add to Cart Verification', async ({ page }) => {
  16 |     // Navigate directly to catalog or product page
  17 |     await page.goto('http://localhost:3000/products');
  18 |     await page.waitForTimeout(1000);
  19 | 
  20 |     // Direct product detail test
  21 |     await page.goto('http://localhost:3000/product/flexi-fit-v-scrub');
  22 |     await page.waitForTimeout(1000);
  23 | 
  24 |     const bodyText = await page.innerText('body');
> 25 |     expect(bodyText).toContain('FlexiFit');
     |                      ^ Error: expect(received).toContain(expected) // indexOf
  26 | 
  27 |     // Check Add to Cart button exists
  28 |     const addToCartBtn = page.locator('button:has-text("Add to Cart"), button:has-text("ADD TO CART")').first();
  29 |     await expect(addToCartBtn).toBeVisible();
  30 | 
  31 |     console.log('✅ 2. Product Detail Page & Add to Cart button verified!');
  32 |   });
  33 | 
  34 |   test('3. Shopping Cart & Checkout Page Structure', async ({ page }) => {
  35 |     await page.goto('http://localhost:3000/cart');
  36 |     await page.waitForTimeout(1000);
  37 | 
  38 |     const cartText = await page.innerText('body');
  39 |     expect(cartText.toLowerCase()).toContain('cart');
  40 | 
  41 |     // Navigate to checkout
  42 |     await page.goto('http://localhost:3000/checkout');
  43 |     await page.waitForTimeout(1000);
  44 | 
  45 |     const checkoutText = await page.innerText('body');
  46 |     expect(checkoutText.toLowerCase()).toContain('checkout');
  47 | 
  48 |     console.log('✅ 3. Shopping Cart & Checkout Page Structure verified!');
  49 |   });
  50 | 
  51 |   test('4. Admin Portal Access & Analytics Dashboard Structure', async ({ page }) => {
  52 |     // Set localStorage mock admin auth
  53 |     await page.goto('http://localhost:3000/admin/login');
  54 |     await page.evaluate(() => {
  55 |       localStorage.setItem('token', 'mock_admin_jwt_token');
  56 |       localStorage.setItem('adminToken', 'mock_admin_jwt_token');
  57 |     });
  58 | 
  59 |     await page.goto('http://localhost:3000/admin/analytics');
  60 |     await page.waitForTimeout(1500);
  61 | 
  62 |     const bodyText = await page.innerText('body');
  63 |     // Verify admin dashboard loads either login or analytics panel cleanly
  64 |     expect(bodyText.length).toBeGreaterThan(50);
  65 |     console.log('✅ 4. Admin Portal & Analytics structure verified!');
  66 |   });
  67 | 
  68 | });
  69 | 
```