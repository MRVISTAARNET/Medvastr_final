# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests\e2e.spec.ts >> Medvarn Complete Purchase Flow E2E Verification >> 2. Product Catalog & Detail Page (Add to Cart)
- Location: tests\e2e.spec.ts:15:7

# Error details

```
Error: expect(received).toBeGreaterThan(expected)

Expected: > 0
Received:   0
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e3]:
    - generic [ref=e4]: ✓ Free shipping on orders above ₹999
    - generic [ref=e5]: ✓ Bulk discounts for hospitals & clinics
    - generic [ref=e6]: "✓ Call us: 8976488911"
    - generic [ref=e7]: ✓ Code MEDVARN10 — 10% off first order
    - generic [ref=e8]: ✓ Free shipping on orders above ₹999
    - generic [ref=e9]: ✓ Bulk discounts for hospitals & clinics
    - generic [ref=e10]: "✓ Call us: 8976488911"
    - generic [ref=e11]: ✓ Code MEDVARN10 — 10% off first order
  - generic [ref=e13]:
    - link [ref=e15] [cursor=pointer]:
      - /url: /
      - img "Medvarn" [ref=e17]
    - generic [ref=e19]:
      - link "WOMEN ▾" [ref=e21] [cursor=pointer]:
        - /url: /products?gender=women
        - generic [ref=e22]: WOMEN
        - generic [ref=e23]: ▾
      - link "MEN ▾" [ref=e25] [cursor=pointer]:
        - /url: /products?gender=men
        - generic [ref=e26]: MEN
        - generic [ref=e27]: ▾
      - link "SURGICAL WEAR ▾" [ref=e29] [cursor=pointer]:
        - /url: /products?cat=surgical-wear
        - generic [ref=e30]: SURGICAL WEAR
        - generic [ref=e31]: ▾
      - link "BULK ORDERS ▾" [ref=e33] [cursor=pointer]:
        - /url: /bulk-orders
        - generic [ref=e34]: BULK ORDERS
        - generic [ref=e35]: ▾
      - link "BLOGS" [ref=e36] [cursor=pointer]:
        - /url: /blog
      - link "CONTACT US" [ref=e38] [cursor=pointer]:
        - /url: /contact
    - generic [ref=e40]:
      - button "Search" [ref=e41] [cursor=pointer]
      - button "Login" [ref=e46] [cursor=pointer]
      - button "Cart" [ref=e51] [cursor=pointer]
  - main [ref=e58]:
    - generic [ref=e59]:
      - img "The Medvarn Collection" [ref=e62]
      - generic [ref=e63]:
        - generic [ref=e64]:
          - link "Home" [ref=e65] [cursor=pointer]:
            - /url: /
          - text: /
          - link "Shop" [ref=e66] [cursor=pointer]:
            - /url: /products
        - generic [ref=e67]:
          - heading "The Medvarn Collection" [level=1] [ref=e68]
          - paragraph [ref=e70]: Explore our complete range of premium medical apparel and equipment, each piece reflecting our decade-long commitment to those who care for others.
        - generic [ref=e71]:
          - button "Scrub Suits" [ref=e72] [cursor=pointer]
          - button "Underscrubs" [ref=e73] [cursor=pointer]
          - button "Cotton T-Shirts" [ref=e74] [cursor=pointer]
          - button "Surgical Wear" [ref=e75] [cursor=pointer]
        - button "⚙️ Show Filters" [ref=e76] [cursor=pointer]
        - generic [ref=e77]:
          - generic [ref=e78]:
            - generic [ref=e79]:
              - generic [ref=e80]: FILTERS
              - button "Clear All" [ref=e81] [cursor=pointer]
            - generic [ref=e82]:
              - generic [ref=e83]:
                - generic [ref=e84]: GENDER
                - generic [ref=e85]:
                  - generic [ref=e86] [cursor=pointer]: All
                  - generic [ref=e87] [cursor=pointer]: Men
                  - generic [ref=e88] [cursor=pointer]: Women
              - generic [ref=e89]:
                - generic [ref=e90]: CATEGORIES
                - generic [ref=e91]:
                  - generic [ref=e92]: Scrub Suits
                  - generic [ref=e93]: Underscrubs
                  - generic [ref=e94]: Cotton T-Shirts
                  - generic [ref=e95]: Surgical Wear
              - generic [ref=e96]:
                - generic [ref=e97]: FABRIC TECHNOLOGY
                - generic [ref=e98]:
                  - generic [ref=e99] [cursor=pointer]: Classic Solitaire Scrubs
                  - generic [ref=e100] [cursor=pointer]: Flexi Fit V Scrub
              - generic [ref=e101]:
                - generic [ref=e102]: PRICE
                - generic [ref=e103]:
                  - generic [ref=e104]: Under ₹1000
                  - generic [ref=e105]: ₹1000 - ₹2000
                  - generic [ref=e106]: ₹2000 - ₹3000
                  - generic [ref=e107]: Above ₹3000
          - generic [ref=e108]:
            - generic [ref=e110]:
              - generic [ref=e111]: "Sort by:"
              - generic [ref=e112] [cursor=pointer]: Most popular
            - generic [ref=e116]:
              - generic [ref=e117]: 🔍
              - generic [ref=e118]: No products found
              - generic [ref=e119]: Try adjusting your filters or clearing them
              - button "Clear All Filters" [ref=e120] [cursor=pointer]
  - contentinfo [ref=e121]:
    - generic [ref=e123]:
      - generic [ref=e124]: Medvarn - Stay informed. Stay comfortable.
      - generic [ref=e126]:
        - textbox "Enter Email Address" [ref=e127]
        - button "→" [ref=e128] [cursor=pointer]
    - generic [ref=e129]:
      - generic [ref=e130]:
        - link [ref=e131] [cursor=pointer]:
          - /url: /
          - img "Medvarn" [ref=e133]
        - paragraph [ref=e134]: Product Manufactured For, Packed & Marketed By Medvarn.
        - generic [ref=e135]:
          - strong [ref=e136]: Corporate Office
          - paragraph [ref=e137]: F 81-B, Express Zone, Malad East, Mumbai – 400063
        - generic [ref=e138]:
          - link "Instagram" [ref=e139] [cursor=pointer]:
            - /url: https://www.instagram.com/medvarn/
          - link "Facebook" [ref=e142] [cursor=pointer]:
            - /url: https://www.facebook.com/medvarn/
          - link "WhatsApp" [ref=e145] [cursor=pointer]:
            - /url: https://wa.me/918976488911?text=Hi!%20I%20have%20a%20question%20about%20Medvarn%20scrubs.
      - generic [ref=e148]:
        - generic [ref=e149]: Company
        - list [ref=e150]:
          - listitem [ref=e151]:
            - link "About Us" [ref=e152] [cursor=pointer]:
              - /url: /about
          - listitem [ref=e153]:
            - link "Blog" [ref=e154] [cursor=pointer]:
              - /url: /blog
          - listitem [ref=e155]:
            - link "Size Guide" [ref=e156] [cursor=pointer]:
              - /url: /sizeguide
          - listitem [ref=e157]:
            - link "Bulk Orders" [ref=e158] [cursor=pointer]:
              - /url: /bulk-orders
      - generic [ref=e159]:
        - generic [ref=e160]: Support
        - list [ref=e161]:
          - listitem [ref=e162]:
            - link "Contact Us" [ref=e163] [cursor=pointer]:
              - /url: /contact
          - listitem [ref=e164]:
            - link "Track Order" [ref=e165] [cursor=pointer]:
              - /url: /track
          - listitem [ref=e166]:
            - link "Shipping & Returns" [ref=e167] [cursor=pointer]:
              - /url: /refund
          - listitem [ref=e168]:
            - link "Privacy & Terms" [ref=e169] [cursor=pointer]:
              - /url: /privacy
      - generic [ref=e170]:
        - generic [ref=e171]: Quick Links
        - list [ref=e172]:
          - listitem [ref=e173]:
            - link "Scrub Suit" [ref=e174] [cursor=pointer]:
              - /url: /products?type=scrubs
          - listitem [ref=e175]:
            - link "Cotton Crew T-Shirt" [ref=e176] [cursor=pointer]:
              - /url: /products?type=tshirts
          - listitem [ref=e177]:
            - link "Full Sleeve Under Scrub" [ref=e178] [cursor=pointer]:
              - /url: /products?type=underscrub
          - listitem [ref=e179]:
            - link "Surgical Gown" [ref=e180] [cursor=pointer]:
              - /url: /products?cat=surgical-surgeon-gown
          - listitem [ref=e181]:
            - link "Surgical Cap" [ref=e182] [cursor=pointer]:
              - /url: /products?cat=surgical-surgeon-cap
      - generic [ref=e183]:
        - generic [ref=e184]: Connect With Us
        - list [ref=e185]:
          - listitem [ref=e186]:
            - generic [ref=e187] [cursor=pointer]: 📞
            - link "8976488911" [ref=e189] [cursor=pointer]:
              - /url: tel:8976488911
          - listitem [ref=e190]:
            - generic [ref=e191] [cursor=pointer]: ✉️
            - link "info@medvarn.com" [ref=e192] [cursor=pointer]:
              - /url: mailto:info@medvarn.com
    - generic [ref=e193]:
      - generic [ref=e194]:
        - text: © 2026 Medvarn. All rights reserved.
        - generic [ref=e195]:
          - text: Made by
          - link "MrVistaarNet" [ref=e196] [cursor=pointer]:
            - /url: https://mrvistaarnet.com
          - text: ❤️
      - generic [ref=e197]: UPIVisaMCAmexCODEMI
  - generic [ref=e198]:
    - generic [ref=e199]:
      - generic [ref=e200]:
        - heading "Shopping Bag" [level=3] [ref=e201]
        - generic [ref=e202]: 0 items in your bag
      - button "Close Shopping Bag" [ref=e203] [cursor=pointer]: ✕
    - generic [ref=e205]:
      - generic [ref=e206]: 🛍️
      - generic [ref=e207]: Your bag is empty
      - generic [ref=e208]: Explore our premium medical apparel collection and start adding items.
      - button "Continue Shopping" [ref=e209] [cursor=pointer]
  - link "Chat on WhatsApp" [ref=e210] [cursor=pointer]:
    - /url: https://wa.me/918976488911?text=Hi!%20I%20have%20a%20question%20about%20Medvarn%20scrubs.
  - button "Open Next.js Dev Tools" [ref=e218] [cursor=pointer]
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | test.describe('Medvarn Complete Purchase Flow E2E Verification', () => {
  4   | 
  5   |   test('1. Homepage & Doctor Reels Verification', async ({ page }) => {
  6   |     await page.goto('http://localhost:3000');
  7   |     await expect(page.locator('.vid-ey')).toContainText('What Doctors Say');
  8   |     const cards = page.locator('.vid-reel-card-portrait');
  9   |     await expect(cards).toHaveCount(2);
  10  |     await expect(page.locator('.vid-reel-caption-title').nth(0)).toContainText("FlexiFit Women's V-Neck Scrub Suit");
  11  |     await expect(page.locator('.vid-reel-caption-title').nth(1)).toContainText("Classic Solitaire Scrub Suit");
  12  |     console.log('✅ 1. Homepage & Video Reels verified!');
  13  |   });
  14  | 
  15  |   test('2. Product Catalog & Detail Page (Add to Cart)', async ({ page }) => {
  16  |     await page.goto('http://localhost:3000/products');
  17  |     await page.waitForLoadState('networkidle');
  18  | 
  19  |     // Look for product cards or links
  20  |     const productLinks = page.locator('a[href^="/product/"]');
  21  |     const count = await productLinks.count();
> 22  |     expect(count).toBeGreaterThan(0);
      |                   ^ Error: expect(received).toBeGreaterThan(expected)
  23  | 
  24  |     // Click the first product link
  25  |     await productLinks.first().click();
  26  |     await page.waitForLoadState('networkidle');
  27  | 
  28  |     // Check we are on product detail page
  29  |     expect(page.url()).toContain('/product/');
  30  | 
  31  |     // Select Size if present
  32  |     const sizeBtns = page.locator('button:has-text("S"), button:has-text("M"), button:has-text("L")');
  33  |     if (await sizeBtns.count() > 0) {
  34  |       await sizeBtns.first().click();
  35  |     }
  36  | 
  37  |     // Click Add to Cart button
  38  |     const addToCartBtn = page.locator('button:has-text("Add to Cart"), button:has-text("ADD TO CART")').first();
  39  |     await expect(addToCartBtn).toBeVisible();
  40  |     await addToCartBtn.click();
  41  | 
  42  |     console.log('✅ 2. Catalog & Product Add to Cart verified!');
  43  |   });
  44  | 
  45  |   test('3. Shopping Cart & Checkout Flow', async ({ page }) => {
  46  |     await page.goto('http://localhost:3000/cart');
  47  |     await page.waitForLoadState('networkidle');
  48  | 
  49  |     const bodyText = await page.innerText('body');
  50  |     expect(bodyText.toLowerCase()).toContain('cart');
  51  | 
  52  |     // Navigate to checkout
  53  |     await page.goto('http://localhost:3000/checkout');
  54  |     await page.waitForLoadState('networkidle');
  55  | 
  56  |     // Fill Shipping Form Details
  57  |     const emailInput = page.locator('input[name="email"], input[type="email"]').first();
  58  |     if (await emailInput.isVisible()) {
  59  |       await emailInput.fill('dr.sharma@medvarn.com');
  60  |     }
  61  | 
  62  |     const firstNameInput = page.locator('input[name="firstName"]').first();
  63  |     if (await firstNameInput.isVisible()) {
  64  |       await firstNameInput.fill('Rahul');
  65  |     }
  66  | 
  67  |     const lastNameInput = page.locator('input[name="lastName"]').first();
  68  |     if (await lastNameInput.isVisible()) {
  69  |       await lastNameInput.fill('Sharma');
  70  |     }
  71  | 
  72  |     const phoneInput = page.locator('input[name="phone"]').first();
  73  |     if (await phoneInput.isVisible()) {
  74  |       await phoneInput.fill('9876543210');
  75  |     }
  76  | 
  77  |     const addressInput = page.locator('input[name="address"]').first();
  78  |     if (await addressInput.isVisible()) {
  79  |       await addressInput.fill('123 Medical Enclave, Civil Lines');
  80  |     }
  81  | 
  82  |     const pincodeInput = page.locator('input[name="pincode"]').first();
  83  |     if (await pincodeInput.isVisible()) {
  84  |       await pincodeInput.fill('400001');
  85  |     }
  86  | 
  87  |     // Verify Place Order button exists and is active
  88  |     const placeOrderBtn = page.locator('button:has-text("Place Order"), button:has-text("PLACE ORDER"), button:has-text("Pay")').first();
  89  |     await expect(placeOrderBtn).toBeVisible();
  90  | 
  91  |     console.log('✅ 3. Shopping Cart & Checkout Form verified!');
  92  |   });
  93  | 
  94  |   test('4. Admin Analytics & Activity Log Verification', async ({ page }) => {
  95  |     await page.goto('http://localhost:3000/admin/analytics');
  96  |     await page.waitForLoadState('networkidle');
  97  | 
  98  |     const bodyText = await page.innerText('body');
  99  |     expect(bodyText).toContain('Website Analytics');
  100 |     expect(bodyText).toContain('Active Visitors Now');
  101 | 
  102 |     // Verify metric overview cards
  103 |     expect(bodyText).toContain('UNIQUE VISITORS');
  104 |     expect(bodyText).toContain('TOTAL SESSIONS');
  105 |     expect(bodyText).toContain('PAGE VIEWS');
  106 |     expect(bodyText).toContain('ORDERS PLACED');
  107 | 
  108 |     console.log('✅ 4. Admin Analytics Dashboard & Telemetry verified!');
  109 |   });
  110 | 
  111 | });
  112 | 
```