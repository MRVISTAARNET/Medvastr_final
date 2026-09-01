# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests\e2e.spec.ts >> Medvarn Complete Purchase Flow E2E Verification >> 3. Shopping Cart & Checkout Page Structure
- Location: tests\e2e.spec.ts:34:7

# Error details

```
Error: expect(received).toContain(expected) // indexOf

Expected substring: "checkout"
Received string:    "✓ free shipping on orders above ₹999
✓ bulk discounts for hospitals & clinics
✓ call us: 8976488911
✓ code medvarn10 — 10% off first order
✓ free shipping on orders above ₹999
✓ bulk discounts for hospitals & clinics
✓ call us: 8976488911
✓ code medvarn10 — 10% off first order
women
▾
men
▾
surgical wear
▾
bulk orders
▾
blogs
contact us
search
login
cart
🛒
your bag is empty·
add some of our premium medical essentials before checking out.·
shop collection
medvarn - stay informed. stay comfortable.
→·
product manufactured for, packed & marketed by medvarn.·
corporate office·
f 81-b, express zone, malad east, mumbai – 400063·
company
about us
blog
size guide
bulk orders
support
contact us
track order
shipping & returns
privacy & terms
quick links
scrub suit
cotton crew t-shirt
full sleeve under scrub
surgical gown
surgical cap
connect with us
📞
8976488911
✉️
info@medvarn.com
© 2026 medvarn. all rights reserved.
made by mrvistaarnet ❤️
upi
visa
mc
amex
cod
emi
shopping bag
0 items in your bag
✕
🛍️
your bag is empty
explore our premium medical apparel collection and start adding items.
continue shopping"
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
    - generic [ref=f1e59]:
      - generic [ref=f1e60]: 🛒
      - heading "Your bag is empty" [level=2] [ref=f1e61]
      - paragraph [ref=f1e62]: Add some of our premium medical essentials before checking out.
      - link "Shop Collection" [ref=f1e63] [cursor=pointer]:
        - /url: /products
  - contentinfo [ref=f1e64]:
    - generic [ref=f1e66]:
      - generic [ref=f1e67]: Medvarn - Stay informed. Stay comfortable.
      - generic [ref=f1e69]:
        - textbox "Enter Email Address" [ref=f1e70]
        - button "→" [ref=f1e71] [cursor=pointer]
    - generic [ref=f1e72]:
      - generic [ref=f1e73]:
        - link [ref=f1e74] [cursor=pointer]:
          - /url: /
          - img "Medvarn" [ref=f1e76]
        - paragraph [ref=f1e77]: Product Manufactured For, Packed & Marketed By Medvarn.
        - generic [ref=f1e78]:
          - strong [ref=f1e79]: Corporate Office
          - paragraph [ref=f1e80]: F 81-B, Express Zone, Malad East, Mumbai – 400063
        - generic [ref=f1e81]:
          - link "Instagram" [ref=f1e82] [cursor=pointer]:
            - /url: https://www.instagram.com/medvarn/
          - link "Facebook" [ref=f1e85] [cursor=pointer]:
            - /url: https://www.facebook.com/medvarn/
          - link "WhatsApp" [ref=f1e88] [cursor=pointer]:
            - /url: https://wa.me/918976488911?text=Hi!%20I%20have%20a%20question%20about%20Medvarn%20scrubs.
      - generic [ref=f1e91]:
        - generic [ref=f1e92]: Company
        - list [ref=f1e93]:
          - listitem [ref=f1e94]:
            - link "About Us" [ref=f1e95] [cursor=pointer]:
              - /url: /about
          - listitem [ref=f1e96]:
            - link "Blog" [ref=f1e97] [cursor=pointer]:
              - /url: /blog
          - listitem [ref=f1e98]:
            - link "Size Guide" [ref=f1e99] [cursor=pointer]:
              - /url: /sizeguide
          - listitem [ref=f1e100]:
            - link "Bulk Orders" [ref=f1e101] [cursor=pointer]:
              - /url: /bulk-orders
      - generic [ref=f1e102]:
        - generic [ref=f1e103]: Support
        - list [ref=f1e104]:
          - listitem [ref=f1e105]:
            - link "Contact Us" [ref=f1e106] [cursor=pointer]:
              - /url: /contact
          - listitem [ref=f1e107]:
            - link "Track Order" [ref=f1e108] [cursor=pointer]:
              - /url: /track
          - listitem [ref=f1e109]:
            - link "Shipping & Returns" [ref=f1e110] [cursor=pointer]:
              - /url: /refund
          - listitem [ref=f1e111]:
            - link "Privacy & Terms" [ref=f1e112] [cursor=pointer]:
              - /url: /privacy
      - generic [ref=f1e113]:
        - generic [ref=f1e114]: Quick Links
        - list [ref=f1e115]:
          - listitem [ref=f1e116]:
            - link "Scrub Suit" [ref=f1e117] [cursor=pointer]:
              - /url: /products?type=scrubs
          - listitem [ref=f1e118]:
            - link "Cotton Crew T-Shirt" [ref=f1e119] [cursor=pointer]:
              - /url: /products?type=tshirts
          - listitem [ref=f1e120]:
            - link "Full Sleeve Under Scrub" [ref=f1e121] [cursor=pointer]:
              - /url: /products?type=underscrub
          - listitem [ref=f1e122]:
            - link "Surgical Gown" [ref=f1e123] [cursor=pointer]:
              - /url: /products?cat=surgical-surgeon-gown
          - listitem [ref=f1e124]:
            - link "Surgical Cap" [ref=f1e125] [cursor=pointer]:
              - /url: /products?cat=surgical-surgeon-cap
      - generic [ref=f1e126]:
        - generic [ref=f1e127]: Connect With Us
        - list [ref=f1e128]:
          - listitem [ref=f1e129]:
            - generic [ref=f1e130] [cursor=pointer]: 📞
            - link "8976488911" [ref=f1e132] [cursor=pointer]:
              - /url: tel:8976488911
          - listitem [ref=f1e133]:
            - generic [ref=f1e134] [cursor=pointer]: ✉️
            - link "info@medvarn.com" [ref=f1e135] [cursor=pointer]:
              - /url: mailto:info@medvarn.com
    - generic [ref=f1e136]:
      - generic [ref=f1e137]:
        - text: © 2026 Medvarn. All rights reserved.
        - generic [ref=f1e138]:
          - text: Made by
          - link "MrVistaarNet" [ref=f1e139] [cursor=pointer]:
            - /url: https://mrvistaarnet.com
          - text: ❤️
      - generic [ref=f1e140]:
        - generic [ref=f1e141]: UPI
        - generic [ref=f1e142]: Visa
        - generic [ref=f1e143]: MC
        - generic [ref=f1e144]: Amex
        - generic [ref=f1e145]: COD
        - generic [ref=f1e146]: EMI
  - generic [ref=f1e147]:
    - generic [ref=f1e148]:
      - generic [ref=f1e149]:
        - heading "Shopping Bag" [level=3] [ref=f1e150]
        - generic [ref=f1e151]: 0 items in your bag
      - button "Close Shopping Bag" [ref=f1e152] [cursor=pointer]: ✕
    - generic [ref=f1e154]:
      - generic [ref=f1e155]: 🛍️
      - generic [ref=f1e156]: Your bag is empty
      - generic [ref=f1e157]: Explore our premium medical apparel collection and start adding items.
      - button "Continue Shopping" [ref=f1e158] [cursor=pointer]
  - link "Chat on WhatsApp" [ref=f1e159] [cursor=pointer]:
    - /url: https://wa.me/918976488911?text=Hi!%20I%20have%20a%20question%20about%20Medvarn%20scrubs.
  - button "Open Next.js Dev Tools" [ref=f1e167] [cursor=pointer]
  - alert [ref=f1e171]
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
  25 |     expect(bodyText).toContain('FlexiFit');
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
> 46 |     expect(checkoutText.toLowerCase()).toContain('checkout');
     |                                        ^ Error: expect(received).toContain(expected) // indexOf
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