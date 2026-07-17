"use client";

import { useApp } from "@/context/AppContext";
import { B } from "@/lib/data";

type AnnItem = { text: string; bold?: boolean; suffix?: string };

export default function Announcement() {
  const { storeSettings } = useApp();
  
  // Build dynamic promo item based on settings
  let promoItem: AnnItem = { text: `Free shipping on orders above ₹${storeSettings?.SHIPPING_FREE_THRESHOLD || 999}`, bold: true };
  
  if (storeSettings?.SHIPPING_PROMO_FREE_UNTIL) {
    const promoDate = new Date(storeSettings.SHIPPING_PROMO_FREE_UNTIL);
    if (new Date() < promoDate) {
      promoItem = { text: `🚚 FREE SHIPPING ON ALL ORDERS until ${promoDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}!`, bold: true };
    }
  }

  const ITEMS: AnnItem[] = [
    promoItem,
    { text: "Bulk discounts for hospitals & clinics" },
    { text: `Call us: ${B.phone1}` },
    { text: "Code MEDVASTR10 — 10% off first order" },
  ];

  const doubled = [...ITEMS, ...ITEMS];

  return (
    <div id="ann">
      <div className="ann-t">
        {doubled.map((item, i) => (
          <span key={i} className="ann-i">
            ✓{" "}
            {item.bold ? (
              <>
                <b>{item.text}</b>
                {item.suffix}
              </>
            ) : (
              item.text
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
