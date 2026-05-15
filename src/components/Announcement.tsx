"use client";

import { B } from "@/lib/data";

export default function Announcement() {
  const items = [
    "✓ <b>Free Delivery</b> on orders above ₹999",
    // "✓ COD Available | Easy EMI",
    // "✓ Earn Rewards on every purchase",
    // "✓ 30-Day Free Trial on Stethoscopes",
    "✓ Bulk discounts for hospitals & clinics",
    "✓ 200+ wash guarantee",
    // "✓ <b>NEW:</b> DRIFT Jacket Available",
    `✓ Call us: ${B.phone}`,
    "✓ Code MEDVASTR10 — 10% off first order",
  ];

  return (
    <div id="ann">
      <div className="ann-t">
        {[...items, ...items].map((t, i) => (
          <span
            key={i}
            className="ann-i"
            dangerouslySetInnerHTML={{ __html: t }}
          />
        ))}
      </div>
    </div>
  );
}
