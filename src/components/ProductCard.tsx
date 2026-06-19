"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Product, fmt } from "@/lib/data";
import { useApp } from "@/context/AppContext";
import { getImagesForColor, getSizesForColor } from "@/lib/productUtils";

interface PCardProps {
  p: Product;
}

export default function ProductCard({ p }: PCardProps) {
  const { addToCart, wishlist, toggleWishlist } = useApp();
  const router = useRouter();
  const [ci, setCi] = useState(0);
  const wished = wishlist.includes(p.id);
  const productPath = `/product/${p.slug || p.id}`;

  const displayImg = useMemo(() => {
    const imgs = getImagesForColor(p, ci);
    return imgs[0] || "";
  }, [p, ci]);

  const defaultSize = useMemo(() => {
    const sizes = getSizesForColor(p, ci);
    return sizes[0] || p.sizes?.[0] || "M";
  }, [p, ci]);

  const discount = p.origPrice ? Math.round(((p.origPrice - p.price) / p.origPrice) * 100) : 0;

  return (
    <div className="pc-modern" onClick={() => router.push(productPath)} style={{ cursor: "pointer" }}>
      {/* Image Container */}
      <div className="pc-image-wrapper">
        <div className="pc-img-link" style={{ width: '100%', height: '100%', display: 'block' }}>
          {displayImg ? (
            <Image src={displayImg} alt={p.name} fill className="pc-img-main" sizes="(max-width: 768px) 100vw, 300px" />
          ) : (
            <div className="pc-emo-placeholder" style={{ background: '#f8fafc', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#cbd5e1', fontSize: '14px', fontWeight: 700, letterSpacing: '1px' }}>MEDVASTR</span>
            </div>
          )}
        </div>

        {/* Wishlist */}
        <button
          className={`pc-wishlist ${wished ? "active" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            toggleWishlist(p.id);
          }}
        >
          {wished ? "❤️" : "🤍"}
        </button>

        {/* Quick Labels (Badges) */}
        <div className="pc-badges">
          {p.badge && p.badge.split(',').map((b, i) => (
            <div key={i} className={`pc-badge badge-${b.trim().toLowerCase().replace(/\s/g, "")}`}>{b.trim()}</div>
          ))}
          {discount > 0 && <div className="pc-badge badge-sale">-{discount}%</div>}
        </div>
      </div>

      {/* Info Section - Matching Screenshot */}
      <div className="pc-info">
        <div className="pc-top-meta">
          <div className="pc-brand-box">
            <span className="pc-brand-name">Medvastr</span>
            <span className="pc-info-icon">ⓘ</span>
          </div>
          <div className="pc-rating-box">
            <span className="pc-star-avg">★</span>
            <span className="pc-rating-val">{p.rating.toFixed(1)}</span>
          </div>
        </div>

        <Link href={productPath} className="pc-product-name">
          {p.name}
        </Link>

        <div className="pc-price-line">
          <span className="pc-curr-price">{fmt(p.price)}</span>
          {p.origPrice && <span className="pc-was-price">{fmt(p.origPrice)}</span>}
        </div>

        {/* Dynamic Color Swatches */}
        {p.clrs && p.clrs.length > 0 && (
          <div className="pc-swatches">
            {p.clrs.slice(0, 5).map((c, i) => (
              <div
                key={i}
                className={`pc-swatch ${ci === i ? "active" : ""}`}
                style={{ background: c }}
                onClick={(e) => { e.stopPropagation(); e.preventDefault(); setCi(i); }}
              />
            ))}
            {p.clrs.length > 1 && <span className="pc-swatch-more">+{p.clrs.length - 1} more</span>}
          </div>
        )}

        <div className="pc-foot-actions">
          <button className="pc-quick-add" onClick={(e) => { e.stopPropagation(); addToCart(p, ci, defaultSize); }}>
            + Quick Add
          </button>
        </div>
      </div>
    </div>
  );
}
