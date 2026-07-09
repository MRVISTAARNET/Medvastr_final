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
import MarqueeTicker from "@/components/MarqueeTicker";
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

  const tabProducts = (() => {
    const tab = TABS.find((t) => t.id === activeTab);
    if (!tab) return [];
    // Only show products in this tab that are also tagged as Bestseller
    return products.filter((x) =>
      tab.types.includes(x.type || "") &&
      (x.badge || "").toLowerCase().includes("bestseller")
    ).slice(0, 8);
  })();

  const newArr = products.filter((p) =>
    (p.badge || "").includes("New") ||
    (p.badge || "").includes("New Launch")
  ).slice(0, 8);

  const flexiBestsellers = products.filter(p => p.name.toLowerCase().includes("flexi fit v scrub") && (p.badge || "").toLowerCase().includes("bestseller")).slice(0, 8);
  const flexiFallback = flexiBestsellers.length === 0 ? products.filter(p => p.type === "scrubs" && (p.badge || "").toLowerCase().includes("bestseller")).slice(0, 8) : [];
  const hasFlexi = flexiBestsellers.length > 0 || flexiFallback.length > 0;

  const tshirtBestsellers = products.filter(p => (p.name.toLowerCase().includes("t-shirt") || p.name.toLowerCase().includes("tshirt") || p.type === "tshirts") && (p.badge || "").toLowerCase().includes("bestseller")).slice(0, 8);
  const tshirtFallback = tshirtBestsellers.length === 0 ? products.filter(p => p.type === "tshirts" && (p.badge || "").toLowerCase().includes("bestseller")).slice(0, 8) : [];
  const hasTshirts = tshirtBestsellers.length > 0 || tshirtFallback.length > 0;

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
        <div className="sec-hd">
          <div>
            <div className="sec-t">Shop By Category</div>
            <div className="sec-s">Everything a medical professional needs, all in one place</div>
          </div>
          <Link href="/products" className="va">
            View All Categories →
          </Link>
        </div>
        <div className="cat-g">
          {[
            { nm: "Scrub Suit", href: "/products?type=scrubs", img: "cat-scrub-suit.jpg" },
            { nm: "Cotton Crew T-Shirt", href: "/products?type=tshirts", img: "cat-tshirt.jpg" },
            { nm: "Full Sleeve Under Scrub", href: "/products?type=underscrub", img: "cat-under-scrub.jpg" },
            { nm: "Surgical Gown", href: "/products?cat=surgical-surgeon-gown", img: "cat-gown.jpg" },
            { nm: "Surgical Cap", href: "/products?cat=surgical-surgeon-cap", img: "cat-cap.jpg" },
            { nm: "Bulk Orders", href: "/bulk-orders", img: "cat-bulk.jpg" },
          ].map(c => (
            <Link href={c.href} className="cat-c" key={c.nm}>
              <div className="cat-img-box">
                <img
                  src={`https://d2tnzshqdaedbc.cloudfront.net/${c.img}`}
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
        <div className="sec">
          <div className="sec-hd">
            <div>
              <div className="sec-t">Shop Flexi-Fit V Scrub</div>
              <div className="sec-s">Classic comfort and durability for peak performance</div>
            </div>
            <Link href="/products?type=scrubs" className="va">
              Shop All Scrubs →
            </Link>
          </div>

          <div className="prod-grid">
            {flexiBestsellers.map((p) => (
                <ProductCard key={p.id} p={p} />
              ))
            }
            {/* Fallback if no specific products found: show top scrubs */}
            {flexiBestsellers.length === 0 &&
              flexiFallback.map(p => (
                <ProductCard key={p.id} p={p} />
              ))
            }
          </div>
        </div>
      )}

      {/* BESTSELLING SECTION 2: COTTON CREW TSHIRT */}
      {hasTshirts && (
        <div className="sec">
          <div className="sec-hd">
            <div>
              <div className="sec-t">Shop Cotton Crew T-Shirt</div>
              <div className="sec-s">Premium essentials for your everyday routine</div>
            </div>
            <Link href="/products?type=tshirts" className="va">
              Shop All T-Shirts →
            </Link>
          </div>

          <div className="prod-grid">
            {tshirtBestsellers.map((p) => (
                <ProductCard key={p.id} p={p} />
              ))
            }
            {/* Fallback: show top tshirts */}
            {tshirtBestsellers.length === 0 &&
              tshirtFallback.map(p => (
                <ProductCard key={p.id} p={p} />
              ))
            }
          </div>
        </div>
      )}


      {/* NEW ARRIVALS */}
      {newArr.length > 0 && (
        <div className="sec">
          <div className="sec-hd">
            <div>
              <div className="sec-t">New Arrivals</div>
              <div className="sec-s">Fresh additions to the Medvastr collection</div>
            </div>
            <Link href="/products" className="va">
              View All New Arrivals →
            </Link>
          </div>
          <div className="prod-grid">
            {newArr.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        </div>
      )}

      {/* FEATURE STRIP */}

      <div className="feat-strip">
        {[
          ["🧪", "Lab Tested", "Quality certified"],
          ["⏰", "12-Hour Ready", "Long-shift comfort"],
          ["🛡️", "Anti-Distraction", "Built for focus"],
          ["👜", "Up to 5 Pockets", "Everything you need"],
          ["🚀", "200+ Washes", "Colour stays vivid"],
        ].map(([ico, t, s]) => (
          <div className="fit" key={t}>
            <span className="fit-ico">{ico}</span>
            <span>
              <span className="fit-t">{t}</span>
              <span className="fit-s">{s}</span>
            </span>
          </div>
        ))}
      </div>

      <VideoSection />
      <div style={{ margin: '60px 0' }}>
        <MarqueeTicker />
      </div>

      <BulkOrderBanner />
      <AboutHomeSection />

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
                <div className="rv" key={r.id || i}>
                  <div className="rv-stars">{"★".repeat(Math.min(r.rating || 5, 5))}</div>
                  <div className="rv-txt">"{r.body}"</div>
                  {r.productName && (
                    <div style={{ fontSize: 12, color: 'var(--teal)', fontWeight: 600, marginBottom: 8 }}>
                      📦 {r.productName}
                    </div>
                  )}
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
                <div className="rv" key={i}>
                  <div className="rv-stars">{"★".repeat(r.r)}</div>
                  <div className="rv-txt">"{r.txt}"</div>
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

      <div className="nl-sec">
        <div style={{ maxWidth: 1560, margin: "0 auto" }}>
          <div className="nl-t">Get 10% Off Your First Order</div>
          <div className="nl-s">Subscribe for exclusive deals, new arrivals and healthcare style tips.</div>
          <form
            className="nl-form"
            onSubmit={async (e) => {
              e.preventDefault();
              const input = (e.currentTarget.querySelector('.nl-inp') as HTMLInputElement);
              const email = input.value;
              if (!email) return;

              try {
                const res = await fetch(`${API_BASE}/newsletter/subscribe`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email })
                });
                const data = await res.json();
                if (data.success) {
                  toast("Thank you! Check your email for your discount code.", "ok");
                  input.value = "";
                } else {
                  toast(data.message || "Failed to subscribe", "bad");
                }
              } catch (e) {
                toast("Something went wrong. Please try again later.", "bad");
              }
            }}
          >
            <input className="nl-inp" type="email" placeholder="Enter your email address" required />
            <button className="nl-go" type="submit">Subscribe</button>
          </form>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,.26)", marginTop: 13 }}>
            Use code <strong style={{ color: "var(--g2)" }}>MEDVASTR10</strong> at checkout.
          </div>
        </div>
      </div>
    </div>
  );
}
