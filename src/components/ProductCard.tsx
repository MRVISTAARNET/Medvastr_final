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

  return (
    <div className="pc">
      <Link href={productPath} className="pc-img" style={{ background: displayImg ? "#fff" : p.bg }}>
        {displayImg ? (
          <img
            src={displayImg}
            alt={p.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div className="pc-emo">{p.emo}</div>
        )}
        {p.badge && (
          <div
            className={`pc-badge pb-${p.badge.toLowerCase().replace(" ", "")}`}
            style={p.badge === "Bestseller" ? { background: "var(--ink)" } : {}}
          >
            {p.badge}
          </div>
        )}
        <button className="qa">Quick View</button>
      </Link>

      <button
        className="wic"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleWishlist(p.id);
        }}
        title="Add to Wishlist"
      >
        {wished ? "❤️" : "🤍"}
      </button>

      <div className="pc-b">
        <div className="pc-fab">{p.fab || "Premium"}</div>
        <Link href={productPath} className="pc-nm">
          {p.name}
        </Link>
        <div className="pc-rat">
          <span className="stars">{"★".repeat(Math.floor(p.rating))}</span>
          <span>
            {p.rating} ({p.rev.toLocaleString()})
          </span>
        </div>
        <div className="pc-clrs">
          {p.clrs.map((c, i) => (
            <div
              key={i}
              className={`cdot${ci === i ? " on" : ""}`}
              style={{ background: c }}
              onMouseEnter={() => setCi(i)}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setCi(i);
              }}
            />
          ))}
        </div>
        <div className="pc-price">
          <span className="pnow">{fmt(p.price)}</span>
          {p.origPrice && <span className="pwas">{fmt(p.origPrice)}</span>}
          {p.origPrice && (
            <span className="poff">
              {Math.round(((p.origPrice - p.price) / p.origPrice) * 100)}% OFF
            </span>
          )}
        </div>
        <button className="pc-add" onClick={() => addToCart(p, ci, defaultSize)}>
          Add to Cart
        </button>
      </div>
    </div>
  );
}
