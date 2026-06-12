"use client";

import { B } from "@/lib/data";

type AnnItem = { text: string; bold?: boolean; suffix?: string };

const ITEMS: AnnItem[] = [
  { text: "In bulk orders Free Delivery Available", bold: true },
  { text: "Bulk discounts for hospitals & clinics" },
  { text: "200+ wash guarantee" },
  { text: `Call us: ${B.phone1}` },
  { text: "Code MEDVASTR10 — 10% off first order" },
];

export default function Announcement() {
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
