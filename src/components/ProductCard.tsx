"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Product, fmt } from "@/lib/data";
import { useApp } from "@/context/AppContext";
import { getImagesForColor, getSizesForColor } from "@/lib/productUtils";

interface PCardProps {
  p: Product;
}

export default function ProductCard({ p }: PCardProps) {
  const { addToCart, wishlist, toggleWishlist } = useApp();
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
    <div className="pc-modern">
      {/* Image Container */}
      <div className="pc-image-wrapper">
        <Link href={productPath} className="pc-img-link">
          {displayImg ? (
            <Image src={displayImg} alt={p.name} fill className="pc-img-main" sizes="(max-width: 768px) 100vw, 300px" />
          ) : (
            <div className="pc-emo-placeholder" style={{ background: p.bg }}>
              <span className="pc-emo-icon">{p.emo}</span>
            </div>
          )}
        </Link>

        {/* Wishlist */}
        <button
          className={`pc-wishlist ${wished ? "active" : ""}`}
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(p.id);
          }}
        >
          {wished ? "❤️" : "🤍"}
        </button>

        {/* Quick Labels (Badges) */}
        <div className="pc-badges">
          {p.badge && <div className={`pc-badge badge-${p.badge.toLowerCase().replace(/\s/g, "")}`}>{p.badge}</div>}
          {discount > 0 && <div className="pc-badge badge-sale">-{discount}%</div>}
        </div>
      </div>

      {/* Info Section */}
      <div className="pc-info">
        <div className="pc-top">
          <span className="pc-cat">{p.type}</span>
          <div className="pc-rating">
            <span className="pc-star">★</span> {p.rating.toFixed(1)}
          </div>
        </div>

        <Link href={productPath} className="pc-name">
          {p.name}
        </Link>

        {/* Dynamic Color Swatches */}
        {p.clrs && p.clrs.length > 0 && (
          <div className="pc-clrs">
            {p.clrs.slice(0, 5).map((c, i) => (
              <div
                key={i}
                className={`pc-clr-dot ${ci === i ? "active" : ""}`}
                style={{ background: c }}
                onClick={(e) => { e.preventDefault(); setCi(i); }}
              />
            ))}
            {p.clrs.length > 5 && <span className="pc-clr-more">+{p.clrs.length - 5}</span>}
          </div>
        )}

        <div className="pc-bottom">
          <div className="pc-price-wrap">
            <span className="pc-price">{fmt(p.price)}</span>
            {p.origPrice && <span className="pc-old-price">{fmt(p.origPrice)}</span>}
          </div>
          <button className="pc-add-btn" onClick={() => addToCart(p, ci, defaultSize)}>
            + Add
          </button>
        </div>
      </div>
    </div>
  );
}
