"use client";

import Link from "next/link";
import { fmt } from "@/lib/data";
import { useApp } from "@/context/AppContext";

interface MegaMenuProps {
  items: {
    title: string;
    items: { label: string; href: string }[];
  }[];
  label: string;
  onNavigate?: () => void;
}

export default function MegaMenu({ items, label, onNavigate }: MegaMenuProps) {
  const { products } = useApp();

  // Find a featured product related to this menu for the 4th column
  const featuredProduct = products.find(p =>
    p.name.toLowerCase().includes(label.toLowerCase()) ||
    (label === "MEN" && p.gen?.toLowerCase().includes("men")) ||
    (label === "WOMEN" && p.gen?.toLowerCase().includes("women"))
  ) || products[0];

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

        {/* Featured Column */}
        <div className="mcol" style={{ borderRight: "none" }}>
          <div className="mcol-hd">FEATURED</div>
          {featuredProduct && (
            <Link href={`/product/${featuredProduct.slug || featuredProduct.id}`} onClick={onNavigate} className="m-feat-card">
              <div className="m-feat-img">
                {featuredProduct.imgs?.[0] && <img src={featuredProduct.imgs[0]} alt={featuredProduct.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
              </div>
              <div className="m-feat-info">
                <span className="m-feat-name">{featuredProduct.name}</span>
                <span className="m-feat-price">{fmt(featuredProduct.price)}</span>
              </div>
            </Link>
          )}
        </div>
      </div>

      <style jsx>{`
        .m-deep-list { list-style: none; padding: 0; margin: 0; }
        .m-parent-li { margin-bottom: 12px; }
        .m-sub-a { font-size: 14px !important; color: #64748b !important; font-weight: 600 !important; transition: all 0.2s; text-decoration: none; display: block; }
        .m-sub-a:hover { color: #008080 !important; padding-left: 5px; }
        
        .m-feat-card { display: block; background: #fff; border: 1px solid #f1f5f9; border-radius: 12px; overflow: hidden; text-decoration: none; transition: transform 0.3s; margin-top: 5px; }
        .m-feat-card:hover { transform: translateY(-5px); box-shadow: 0 12px 24px rgba(0,0,0,0.05); }
        .m-feat-img { height: 160px; background: #f8fafc; overflow: hidden; }
        .m-feat-info { padding: 12px; display: flex; flexDirection: column; gap: 4px; }
        .m-feat-name { font-size: 13px; font-weight: 700; color: #1e293b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block; }
        .m-feat-price { font-size: 14px; font-weight: 900; color: #008080; }
      `}</style>
    </div>
  );
}
