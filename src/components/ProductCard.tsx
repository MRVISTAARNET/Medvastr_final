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
  forceColor?: string;
}

export default function ProductCard({ p, forceColor }: PCardProps) {
  const { addToCart, wishlist, toggleWishlist } = useApp();
  const router = useRouter();
  const initialCi = useMemo(() => {
    if (forceColor && p.clrs) {
      const idx = p.clrs.indexOf(forceColor);
      return idx !== -1 ? idx : 0;
    }
    if ((p as any).displayColorHex && p.clrs) {
      const idx = p.clrs.indexOf((p as any).displayColorHex);
      return idx !== -1 ? idx : 0;
    }
    return 0;
  }, [p, forceColor]);

  const [ci, setCi] = useState(initialCi); // Color Index
  const [ii, setIi] = useState(0); // Image Index within color
  const wished = wishlist.includes(p.id);

  const productPath = useMemo(() => {
    const base = `/product/${p.slug || p.id}`;
    if (p.clrNms && p.clrNms[ci]) {
      return `${base}?color=${encodeURIComponent(p.clrNms[ci])}`;
    }
    return base;
  }, [p, ci]);

  const colorImages = useMemo(() => getImagesForColor(p, ci), [p, ci]);
  const displayImg = colorImages[ii] || colorImages[0] || "";

  const defaultSize = useMemo(() => {
    const sizes = getSizesForColor(p, ci);
    return sizes[0] || p.sizes?.[0] || "M";
  }, [p, ci]);

  const discount = p.origPrice ? Math.round(((p.origPrice - p.price) / p.origPrice) * 100) : 0;

  // Handle color change - reset image index
  const handleColorChange = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    e.preventDefault();
    setCi(index);
    setIi(0);
  };

  // Handle image navigation
  const nextImg = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIi((prev) => (prev + 1) % colorImages.length);
  };

  const prevImg = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIi((prev) => (prev - 1 + colorImages.length) % colorImages.length);
  };

  const [hover, setHover] = useState(false);

  return (
    <div
      className="pc-modern h-full flex flex-col"
      onClick={() => router.push(productPath)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ cursor: "pointer" }}
    >
      {/* Image Container */}
      <div className="pc-image-wrapper group">
        <div className="pc-img-link w-full h-full block relative">
          {displayImg ? (
            <>
              <Image
                src={displayImg}
                alt={p.name}
                fill
                className={`pc-img-main transition-opacity duration-500 opacity-100`}
                sizes="(max-width: 768px) 50vw, 300px"
                priority={false}
              />
              {/* Only show hover flip if we are at the first image and have a second one */}
              {ii === 0 && colorImages[1] && (
                <Image
                  src={colorImages[1]}
                  alt={p.name}
                  fill
                  className={`pc-img-main absolute inset-0 transition-opacity duration-500 ${hover ? 'opacity-100' : 'opacity-0'}`}
                  sizes="(max-width: 768px) 50vw, 300px"
                />
              )}
            </>
          ) : (
            <div className="pc-emo-placeholder w-full h-full flex items-center justify-center bg-slate-50">
              <span className="text-slate-300 text-xs font-bold tracking-widest text-center px-4 uppercase">Medvastr</span>
            </div>
          )}
        </div>

        {/* Image Dots Indicator (1/4 or dots) */}
        {colorImages.length > 1 && (
          <div className="pc-img-dots">
            {colorImages.map((_, idx) => (
              <div
                key={idx}
                className={`pc-dot ${ii === idx ? "active" : ""}`}
                onClick={(e) => { e.stopPropagation(); setIi(idx); }}
              />
            ))}
          </div>
        )}

        {/* Hover Navigation Arrows */}
        {colorImages.length > 1 && (
          <>
            <button className="pc-nav-btn prev" onClick={prevImg}>‹</button>
            <button className="pc-nav-btn next" onClick={nextImg}>›</button>
          </>
        )}

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

        {/* Quick Labels (Badges) - Simple & Clean */}
        <div className="pc-badges">
          {p.badge && p.badge.split(',').map((b, i) => (
            <div key={i} className={`pc-badge badge-simple`}>{b.trim()}</div>
          ))}
        </div>
      </div>

      {/* Info Section */}
      <div className="pc-info flex-grow flex flex-col justify-between">
        <div>
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

          <Link href={productPath} className="pc-product-name" onClick={(e) => e.stopPropagation()}>
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
                  onClick={(e) => handleColorChange(e, i)}
                />
              ))}
              {p.clrs.length > 5 && <span className="pc-swatch-more">+{p.clrs.length - 5}</span>}
            </div>
          )}
        </div>

        <div className="pc-foot-actions">
          <button className="pc-quick-add" onClick={(e) => { e.stopPropagation(); addToCart(p, ci, defaultSize); }}>
            Quick Add
          </button>
        </div>
      </div>
    </div>
  );
}
