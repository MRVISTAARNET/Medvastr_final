"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from 'next/dynamic';
import Hero from "@/components/Hero";
import ProductCard from "@/components/ProductCard";

// Dynamically import "below the fold" sections to drastically reduce bundle size and LCP times
const VideoSection = dynamic(() => import("@/components/VideoSection"));
const AboutHomeSection = dynamic(() => import("@/components/AboutHomeSection"));
const BulkOrderBanner = dynamic(() => import("@/components/BulkOrderBanner"));
import { COLS, B } from "@/lib/data";
import { useApp } from "@/context/AppContext";
import { API_BASE } from "@/lib/api";

export default function Home() {
  const { products, banners, colors, toast } = useApp();
  const promoBanners = banners.filter((b: any) => b.isActive && (b.position === "PROMO" || b.position === "HOME_MIDDLE"));
  const TABS = [
    { id: "scrubs", label: "Uniforms & Scrubs", types: ["scrubs"] },
    { id: "tshirts", label: "T-Shirts", types: ["tshirts", "tshirt", "cotton-crew-tshirt"] },
    { id: "underscrubs", label: "Under Scrubs", types: ["underscrubs", "underscrub"] },
    { id: "linen", label: "Linen & Bedding", types: ["linen", "bedding", "blanket", "dress"] },
    { id: "surgical", label: "Surgical Wear", types: ["surgical", "surgical-gown", "surgical-cap", "gown", "cap"] },
    { id: "diagnostic", label: "Diagnostic & Caps", types: ["diagnostic"] },
  ];

  const [activeTab, setActiveTab] = useState("scrubs");
  const [liveReviews, setLiveReviews] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${API_BASE}/products/reviews/public?size=20`)
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          // Only show 4-5 star reviews on homepage
          const highRating = (d.data?.content || []).filter((r: any) => r.rating >= 4);
          setLiveReviews(highRating.slice(0, 6));
        }
      })
      .catch(() => { });
  }, []);

  // Flatten products into color variants to display all colors as individual cards
  const flattenedProducts = React.useMemo(() => {
    const list: any[] = [];
    products.forEach((p) => {
      if (p.clrs && p.clrs.length > 0) {
        p.clrs.forEach((colorHex: string, idx: number) => {
          list.push({
            ...p,
            variantId: `${p.id}-${idx}`,
            displayColorHex: colorHex,
            displayColorName: p.clrNms?.[idx] || "",
            displayImage: p.clrImgs?.[colorHex]?.[0] || p.imgs?.[0],
            allColors: p.clrs,
          });
        });
      } else {
        list.push({ ...p, variantId: p.id });
      }
    });
    return list;
  }, [products]);

  const tabProducts = (() => {
    const tab = TABS.find((t) => t.id === activeTab);
    if (!tab) return [];
    // Only show products in this tab that are also tagged as Bestseller
    return flattenedProducts.filter((x) =>
      tab.types.includes(x.type || "") &&
      (x.badge || "").toLowerCase().includes("bestseller")
    ).slice(0, 8);
  })();

  const newArr = flattenedProducts.filter((p) =>
    (p.badge || "").includes("New") ||
    (p.badge || "").includes("New Launch")
  ).slice(0, 8);

  const flexiBestsellers = flattenedProducts.filter(p => p.name.toLowerCase().includes("flexi fit") || p.name.toLowerCase().includes("flexi-fit") || (p.type === "scrubs" && (p.badge || "").toLowerCase().includes("bestseller"))).slice(0, 10);
  const flexiFallback = flexiBestsellers.length === 0 ? flattenedProducts.filter(p => p.type === "scrubs").slice(0, 10) : [];
  const hasFlexi = flexiBestsellers.length > 0 || flexiFallback.length > 0;

  const solitaireList = flattenedProducts.filter(p => p.name.toLowerCase().includes("solitaire") || p.name.toLowerCase().includes("classic") || (p.badge || "").toLowerCase().includes("classic") || (p.badge || "").toLowerCase().includes("new") || (p.badge || "").toLowerCase().includes("solitaire")).slice(0, 10);
  const solitaireFallback = solitaireList.length === 0 ? flattenedProducts.filter(p => p.type === "scrubs").slice(0, 10) : [];
  const finalSolitaire = solitaireList.length > 0 ? solitaireList : solitaireFallback;

  return (
    <div className="page">
      <Hero onShop={() => (window.location.href = "/products")} />

      <div className="trust">
        <div className="trust-in">
          {[
            ["🚚", "Free Delivery", "Orders above ₹999"],
            ["🔄", "Easy Returns", "7-day hassle-free"],
            ["🔒", "Secure Payment", "100% safe"],
            ["📞", "24/7 Support", B.phone1],
            ["💳", "COD Available", "Pay at doorstep"],
            ["⭐", "Earn Rewards", "Every purchase"],
          ].map(([ico, t, s], i) => (
            <div className="trit" key={i}>
              <div className="trit-ico">{ico}</div>
              <div>
                <div className="trit-t">{t}</div>
                <div className="trit-s">{s}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CATEGORIES */}
      <div className="sec">
        <div className="sec-hd" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <div className="sec-t">Shop By Categories</div>
            <div className="sec-s">Everything a medical professional needs, all in one place</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => {
                  const el = document.getElementById("cat-grid-row");
                  if (el) el.scrollBy({ left: -260, behavior: "smooth" });
                }}
                aria-label="Scroll Categories Left"
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  border: "1.5px solid #cbd5e1",
                  background: "#ffffff",
                  color: "#0f172a",
                  fontSize: "18px",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s ease",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                }}
              >
                ‹
              </button>
              <button
                onClick={() => {
                  const el = document.getElementById("cat-grid-row");
                  if (el) el.scrollBy({ left: 260, behavior: "smooth" });
                }}
                aria-label="Scroll Categories Right"
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  border: "1.5px solid #cbd5e1",
                  background: "#ffffff",
                  color: "#0f172a",
                  fontSize: "18px",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s ease",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                }}
              >
                ›
              </button>
            </div>
            <Link href="/products" className="va">
              View All Categories →
            </Link>
          </div>
        </div>
        <div className="cat-g" id="cat-grid-row" style={{ paddingTop: "8px", paddingBottom: "12px", marginTop: "-4px" }}>
          {[
            { nm: "Scrub Suit", href: "/products?type=scrubs", img: "/cat-scrub-suit.jpg" },
            { nm: "Cotton Crew T-Shirt", href: "/products?type=tshirts", img: "/cat-tshirt.jpg" },
            { nm: "Full Sleeve Under Scrub", href: "/products?type=underscrub", img: "/cat-under-scrub.jpg" },
            { nm: "Surgical Gown", href: "/products?cat=surgical-surgeon-gown", img: "/cat-gown.jpg" },
            { nm: "Surgical Cap", href: "/products?cat=surgical-surgeon-cap", img: "/cat-cap.jpg" },
            { nm: "Bulk Orders", href: "/bulk-orders", img: "/cat-bulk.jpg" },
          ].map(c => (
            <Link href={c.href} className="cat-c" key={c.nm}>
              <div className="cat-img-box">
                <img
                  src={c.img.startsWith("/") ? c.img : `https://d2tnzshqdaedbc.cloudfront.net/${c.img}`}
                  alt={c.nm}
                  onError={(e) => { (e.target as any).src = "https://placehold.co/400x400/f1f5f9/64748b?text=" + c.nm }}
                />
              </div>
              <div className="cat-l">{c.nm}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* COLOURS */}
      <div className="clr-sec">
        <div className="clr-in">
          <div className="clr-t">Shop By Colours</div>
          <div className="clr-s">
            {colors.filter(c => products.some(p => p.clrNms?.some(pc => pc.toLowerCase() === (c.name || '').toLowerCase()))).length} shades across all categories
          </div>
          <div className="clr-row" style={{ flexWrap: 'wrap', justifyContent: 'flex-start' }}>
            {colors.filter(c => products.some(p => p.clrNms?.some(pc => pc.toLowerCase() === (c.name || '').toLowerCase()))).map((c, i) => (
              <Link href={`/products?color=${encodeURIComponent(c.name)}`} className="clr-sw" key={i}>
                <div className="sw-c" style={{ background: c.hexCode }} />
                <div className="sw-l">{c.name}</div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* BESTSELLING SECTION 1: FLEXI FIT V SCRUB */}
      {hasFlexi && (
        <ProductRowSlider
          title="Shop Flexi-Fit V Scrub"
          subtitle="Classic comfort and durability for peak performance"
          linkHref="/products?type=scrubs"
          linkText="Shop All Scrubs"
          products={flexiBestsellers.length > 0 ? flexiBestsellers : flexiFallback}
        />
      )}

      {/* SECTION 2: CLASSIC SOLITAIRE SCRUBS */}
      {solitaireList.length > 0 && (
        <ProductRowSlider
          title="Shop Classic Solitaire Scrubs"
          subtitle="Premium elegance and tailored fit for medical professionals"
          linkHref="/products?type=scrubs"
          linkText="Shop Solitaire Collection"
          products={solitaireList}
        />
      )}

      <BulkOrderBanner />

      {/* Reviews — Live from API */}
      <div className="rev-sec">
        <div className="rev-in">
          <div className="sec-hd">
            <div>
              <div className="sec-t">What Our Customers Say</div>
              <div className="sec-s">Real stories and feedback from healthcare professionals across India</div>
            </div>
          </div>
          <div className="rev-g">
            {liveReviews.length > 0 ? (
              liveReviews.map((r: any, i) => (
                <div className="rv-card" key={r.id || i}>
                  <div className="rv-bubble">
                    <div className="rv-stars">{"★".repeat(Math.min(r.rating || 5, 5))}</div>
                    <div className="rv-txt">"{r.body}"</div>
                    {r.productName && (
                      <div className="rv-prd-tag">
                        📦 {r.productName}
                      </div>
                    )}
                  </div>
                  <div className="rv-auth">
                    <div className="rv-av">{(r.userName || 'U')[0].toUpperCase()}</div>
                    <div>
                      <div className="rv-nm">{r.userName || 'Verified Customer'}</div>
                      <div className="rv-rl">Verified Purchase</div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              // Fallback placeholder cards if no live reviews yet
              [
                { r: 5, txt: "Best scrubs I've worn in 8 years of practice. The fabric quality is truly exceptional.", nm: 'Dr. Priya S.', role: 'Cardiologist, Mumbai', av: 'P' },
                { r: 5, txt: "Finally, scrubs that look professional and feel comfortable for 12-hour shifts!", nm: 'Dr. Rohan M.', role: 'Resident Surgeon, Delhi', av: 'R' },
                { r: 5, txt: "Ordered for our entire department. The colour consistency and stitching is perfect.", nm: 'Sr. Fatima K.', role: 'Head Nurse, Hyderabad', av: 'F' },
              ].map((r: any, i) => (
                <div className="rv-card" key={i}>
                  <div className="rv-bubble">
                    <div className="rv-stars">{"★".repeat(r.r)}</div>
                    <div className="rv-txt">"{r.txt}"</div>
                  </div>
                  <div className="rv-auth">
                    <div className="rv-av">{r.av}</div>
                    <div>
                      <div className="rv-nm">{r.nm}</div>
                      <div className="rv-rl">{r.role}</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <VideoSection />

      <AboutHomeSection />


    </div>
  );
}

function ProductRowSlider({
  title,
  subtitle,
  linkHref,
  linkText,
  products,
}: {
  title: string;
  subtitle: string;
  linkHref: string;
  linkText: string;
  products: any[];
}) {
  const rowRef = React.useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (rowRef.current) {
      const amount = direction === "left" ? -340 : 340;
      rowRef.current.scrollBy({ left: amount, behavior: "smooth" });
    }
  };

  return (
    <div className="sec">
      <div className="sec-hd" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "20px" }}>
        <div>
          <div className="sec-t">{title}</div>
          <div className="sec-s">{subtitle}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={() => scroll("left")}
              aria-label="Scroll Left"
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "50%",
                border: "1.5px solid #cbd5e1",
                background: "#ffffff",
                color: "#0f172a",
                fontSize: "18px",
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s ease",
                boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
              }}
            >
              ‹
            </button>
            <button
              onClick={() => scroll("right")}
              aria-label="Scroll Right"
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "50%",
                border: "1.5px solid #cbd5e1",
                background: "#ffffff",
                color: "#0f172a",
                fontSize: "18px",
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s ease",
                boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
              }}
            >
              ›
            </button>
          </div>
          <Link href={linkHref} className="va">
            {linkText} →
          </Link>
        </div>
      </div>

      <div
        ref={rowRef}
        className="product-row-slider-grid hide-scrollbar"
      >
        {products.map((p) => (
          <ProductCard key={p.variantId || p.id} p={p} forceColor={p.displayColorHex} />
        ))}
      </div>
    </div>
  );
}
