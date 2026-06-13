"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
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
            <img src={displayImg} alt={p.name} className="pc-img-main" loading="lazy" />
          ) : (
            <div className="pc-emo-placeholder" style={{ background: p.bg }}>
              <span className="pc-emo-icon">{p.emo}</span>
            </div>
          )}
        </Link>

        {/* Badges */}
        <div className="pc-badges">
          {p.badge && <div className={`pc-badge pc-badge-${p.badge.toLowerCase().replace(/\s/g, "")}`}>{p.badge}</div>}
          {discount > 0 && <div className="pc-discount-badge">{discount}% OFF</div>}
        </div>

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

        {/* Overlay */}
        <div className="pc-overlay">
          <Link href={productPath} className="pc-btn-view">
            View Details
          </Link>
          <button className="pc-btn-cart" onClick={() => addToCart(p, ci, defaultSize)}>
            Add to Bag
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="pc-info">
        <div className="pc-header">
          <span className="pc-brand">{p.brand || "Medvastr"}</span>
          <span className="pc-type-tag">{p.type}</span>
        </div>

        <Link href={productPath} className="pc-title">
          {p.name}
        </Link>

        <div className="pc-rating-section">
          <div className="pc-stars">
            {"★".repeat(Math.floor(p.rating))}
            {"☆".repeat(5 - Math.floor(p.rating))}
          </div>
          <span className="pc-rating-value">{p.rating.toFixed(1)}</span>
          <span className="pc-reviews">({p.rev.toLocaleString()})</span>
        </div>

        {p.fab && <p className="pc-fabric">{p.fab}</p>}


        {/* Colors */}
        {p.clrs && p.clrs.length > 0 && (
          <div className="pc-colors">
            {p.clrs.map((c, i) => (
              <button
                key={i}
                className={`pc-color ${ci === i ? "active" : ""}`}
                style={{ backgroundColor: c }}
                onClick={(e) => { e.preventDefault(); setCi(i); }}
                title={p.clrNms?.[i] || `Color ${i + 1}`}
              />
            ))}
          </div>
        )}

        <div className="pc-pricing">
          <span className="pc-price-current">{fmt(p.price)}</span>
          {p.origPrice && <span className="pc-price-original">{fmt(p.origPrice)}</span>}
        </div>

        {/* Quick Add */}
        <button className="pc-btn-primary" onClick={() => addToCart(p, ci, defaultSize)}>
          + Add to Bag
        </button>
      </div>
    </div>
  );
}
