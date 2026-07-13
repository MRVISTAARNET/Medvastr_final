"use client";

import Link from "next/link";
import { useApp } from "@/context/AppContext";

interface MegaMenuProps {
  items: {
    title: string;
    items: { label: string; href: string }[];
  }[];
  label: string;
  onNavigate?: () => void;
}

const NAVY = "#0f2044";
const WINE = "#3D274E";
const MAROON = "#5A1D2B";
const LIGHT_BLUE = "#add8e6";

const MENU_COLORS = [
  { name: "Navy Blue", hex: NAVY },
  { name: "Wine", hex: WINE },
  { name: "Maroon", hex: MAROON },
  { name: "Light Blue", hex: LIGHT_BLUE },
];

export default function MegaMenu({ items, label, onNavigate }: MegaMenuProps) {
  return (
    <div className="mega">
      <div className="mega-in" style={{ gridTemplateColumns: `repeat(${items.length + 1}, 1fr)` }}>
        {items.map((col, idx) => (
          <div key={idx} className="mcol">
            <div className="mcol-hd">{col.title}</div>
            <ul className="m-deep-list">
              {col.items.map((item, i) => (
                <li key={i} className="m-parent-li">
                  <Link href={item.href} className="m-sub-a" onClick={onNavigate}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Dynamic 4th Column */}
        <div className="mcol" style={{ borderRight: "none" }}>
          {(label === "MEN" || label === "WOMEN") ? (
            <>
              <div className="mcol-hd">SHOP BY COLOUR</div>
              <div className="m-clr-grid">
                {MENU_COLORS.map((c) => (
                  <Link
                    key={c.name}
                    href={`/products?color=${encodeURIComponent(c.name)}&gender=${label.toLowerCase()}`}
                    className="m-clr-card"
                    onClick={onNavigate}
                  >
                    <div className="m-clr-dot" style={{ background: c.hex }} />
                    <span className="m-clr-nm">{c.name}</span>
                  </Link>
                ))}
              </div>
            </>
          ) : label === "BULK ORDERS" ? (
            <>
              <div className="mcol-hd">BULK SERVICES</div>
              <div className="m-desc-box">
                <p>Medvastr provides high-quality institutional uniforms and linen for hospitals, clinics, and medical colleges across India.</p>
                <p style={{ marginTop: '10px', fontSize: '12px', opacity: 0.8 }}>Contact us for customized volume discounts and branding options.</p>
                <Link href="/contact" className="m-contact-btn" onClick={onNavigate}>
                  Get a Quote →
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="mcol-hd">OUR PROMISE</div>
              <div className="m-desc-box">
                <p>Designed for professionals who demand excellence. Our surgical and lab wear combines maximum protection with all-day comfort.</p>
                <div style={{ marginTop: '15px', color: '#008080', fontWeight: 'bold', fontSize: '13px' }}>
                  ✓ Fluid Resistant<br />
                  ✓ Breathable Fabric<br />
                  ✓ Durable & Long-lasting
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        .m-deep-list { list-style: none; padding: 0; margin: 0; }
        .m-parent-li { margin-bottom: 12px; }
        .m-sub-a { font-size: 14px !important; color: #64748b !important; font-weight: 600 !important; transition: all 0.2s; text-decoration: none; display: block; }
        .m-sub-a:hover { color: #008080 !important; padding-left: 5px; }
        
        .m-clr-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px; }
        .m-clr-card { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 12px; border: 1px solid #f1f5f9; border-radius: 8px; text-decoration: none; transition: background 0.2s; }
        .m-clr-card:hover { background: #f8fafc; border-color: #e2e8f0; }
        .m-clr-dot { width: 30px; height: 30px; border-radius: 50%; box-shadow: inset 0 2px 4px rgba(0,0,0,0.1); }
        .m-clr-nm { font-size: 11px; font-weight: 700; color: #1e293b; text-align: center; }

        .m-desc-box { font-size: 13px; line-height: 1.6; color: #64748b; margin-top: 5px; }
        .m-contact-btn { display: inline-block; margin-top: 20px; padding: 10px 18px; background: #008080; color: white !important; border-radius: 30px; font-weight: 700; font-size: 12px; text-decoration: none; transition: opacity 0.2s; }
        .m-contact-btn:hover { opacity: 0.9; }
      `}</style>
    </div>
  );
}
