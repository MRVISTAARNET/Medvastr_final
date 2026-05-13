"use client";

import React, { useState } from "react";
import Link from "next/link";
import Hero from "@/components/Hero";
import ProductCard from "@/components/ProductCard";
import VideoSection from "@/components/VideoSection";
import AboutHomeSection from "@/components/AboutHomeSection";
import PressSection from "@/components/PressSection";
import { PRODUCTS, COLS, REVIEWS, B } from "@/lib/data";

export default function Home() {
  const [activeTab, setActiveTab] = useState("scrubs");

  const TABS = [
    { id: "scrubs", label: "Classic Scrubs", type: "scrubs", fab: "Classic" },
    { id: "ecoflex", label: "ecoflex™ Scrubs", type: "scrubs", fab: "ecoflex™" },
    { id: "stethoscope", label: "Stethoscope", type: "stethoscope" },
    { id: "labcoat", label: "Lab Coats", type: "labcoat" },
    { id: "jacket", label: "DRIFT Jacket", type: "jacket" },
    { id: "underscrub", label: "Underscrubs", type: "underscrub" },
  ];

  const tabProducts = (() => {
    const tab = TABS.find((t) => t.id === activeTab);
    if (!tab) return [];
    let p = PRODUCTS.filter((x) => x.type === tab.type);
    if (tab.fab) p = p.filter((x) => x.fab === tab.fab);
    return p.slice(0, 8);
  })();

  const newArr = PRODUCTS.filter((p) => ["New", "New Launch"].includes(p.badge)).slice(0, 4);

  return (
    <div className="page">
      <Hero onShop={() => (window.location.href = "/products")} />

      <div className="trust">
        <div className="trust-in">
          {[
            ["🚚", "Free Delivery", "Orders above ₹999"],
            ["🔄", "Easy Returns", "7-day hassle-free"],
            ["🔒", "Secure Payment", "100% safe"],
            ["📞", "24/7 Support", B.phone],
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
            ["#dde3f0", "👨‍⚕️", "Men's Scrubs"],
            ["#f0dde4", "👩‍⚕️", "Women's Scrubs"],
            ["#ddf0e8", "🥼", "Classic Scrubs"],
            ["#ddedf5", "💪", "ecoflex™ Scrubs"],
            ["#f0f0f0", "🩺", "Stethoscope"],
            ["#dde3f0", "🧥", "DRIFT Jacket", true],
            ["#f8f8f8", "🥼", "Lab Coats"],
            ["#f0dde4", "👕", "Underscrubs"],
          ].map(([bg, em, nm, isN]) => (
            <Link href="/products" className="cat-c" key={nm as string}>
              <div className="cat-img" style={{ background: bg as string }}>
                {em}
              </div>
              <div className="cat-l">
                {nm}
                {isN && <span className="pn">NEW</span>}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* COLOURS */}
      <div className="clr-sec">
        <div className="clr-in">
          <div className="clr-t">Shop By Colours</div>
          <div className="clr-s">16 shades across all categories</div>
          <div className="clr-row">
            {COLS.map((c, i) => (
              <Link href="/products" className="clr-sw" key={i}>
                <div className="sw-c" style={{ background: c.h }} />
                <div className="sw-l">{c.n}</div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* BESTSELLING */}
      <div className="sec">
        <div className="sec-hd">
          <div>
            <div className="sec-t">Bestselling Scrubs</div>
            <div className="sec-s">Most loved by healthcare professionals across India</div>
          </div>
          <Link href={`/products?cat=${TABS.find((t) => t.id === activeTab)?.type || "all"}`} className="va">
            View All {TABS.find((t) => t.id === activeTab)?.label || "Scrubs"} →
          </Link>
        </div>

        <div className="tabs">
          {TABS.map((t) => (
            <div key={t.id} className={`tab${activeTab === t.id ? " on" : ""}`} onClick={() => setActiveTab(t.id)}>
              {t.label}
            </div>
          ))}
        </div>

        {tabProducts.length > 0 ? (
          <div className="pg-4">
            {tabProducts.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "48px 20px", color: "var(--lt)" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: "var(--ink2)", marginBottom: 8 }}>Coming Soon</div>
            <div style={{ fontSize: 14 }}>More products in this category will be available soon.</div>
            <Link href="/products" className="btn-t" style={{ marginTop: 16 }}>
              Browse All Products →
            </Link>
          </div>
        )}
      </div>

      {/* PROMO */}
      <div className="promo-duo">
        <div className="promo-h" style={{ background: "#091220" }}>
          <div className="promo-em">🩺</div>
          <div className="promo-ey">New Collection</div>
          <div className="promo-tt">6sense Stethoscope</div>
          <div className="promo-bd">30-day free trial. Dual-head design. 10,000+ doctors.</div>
          <Link href="/products?cat=stethoscope" className="btn-t">
            Shop Stethoscope →
          </Link>
        </div>
        <div className="promo-h" style={{ background: "var(--g)" }}>
          <div className="promo-em">🧥</div>
          <div className="promo-ey">New Launch 2026</div>
          <div className="promo-tt">The DRIFT Jacket</div>
          <div className="promo-bd">Anti-distraction. Lab tested. India's first medical outerwear.</div>
          <Link href="/products?cat=jacket" className="btn-d">
            Shop DRIFT Jacket →
          </Link>
        </div>
      </div>

      {/* NEW ARRIVALS */}
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
        <div className="pg-4">
          {newArr.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      </div>

      <div className="feat-strip">
        {[
          ["🧪", "Lab Tested", "Quality certified"],
          ["⏰", "12-Hour Ready", "Long-shift comfort"],
          ["🛡️", "Anti-Distraction", "Built for focus"],
          ["👜", "Up to 9 Pockets", "Everything you need"],
          ["⚗️", "ecoflex™", "4-way stretch"],
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
      <PressSection />

      {/* Community */}
      <div className="comm-sec">
        <div className="comm-in">
          <div className="comm-hd">
            <h2 className="comm-t">50,000+ Healthcare Heroes Choose Medvastr</h2>
            <p className="comm-s">Real stories from real doctors, nurses and healthcare professionals</p>
          </div>
          <div className="comm-cards">
            {[
              {
                emo: "👨‍⚕️",
                q: "Switched to Medvastr 6 months ago and never looked back. The ecoflex fabric moves with me through every surgery.",
                au: "Dr. Anil Kumar",
                ro: "Cardiac Surgeon, AIIMS Delhi",
                tag: "ecoflex™ User",
              },
              {
                emo: "👩‍⚕️",
                q: "As a female surgeon, finding scrubs that fit properly was always a challenge. Medvastr finally solved that.",
                au: "Dr. Meera Patel",
                ro: "Neurosurgeon, KEM Hospital Mumbai",
                tag: "Women's Slim Fit",
              },
              {
                emo: "👩‍⚕️",
                q: "After switching my team of 40 nurses to Medvastr bulk orders, complaints about uniforms dropped to zero.",
                au: "Sr. Nurse Priya Nair",
                ro: "Head of Nursing, Apollo Chennai",
                tag: "Bulk Order 50+ Pieces",
              },
            ].map((x, i) => (
              <div className="comm-card" key={i}>
                <div className="comm-av">{x.emo}</div>
                <div className="comm-q">"{x.q}"</div>
                <div className="comm-au">{x.au}</div>
                <div className="comm-ro">{x.ro}</div>
                <div className="comm-pill">✓ {x.tag}</div>
              </div>
            ))}
          </div>
          <div className="comm-stats">
            {[
              ["50,000+", "Happy Customers"],
              ["4.8 ★", "Average Rating"],
              ["200+", "Cities Delivered"],
              ["₹2Cr+", "Products Sold"],
            ].map(([n, l]) => (
              <div className="cst" key={l}>
                <span className="cst-n">{n}</span>
                <div className="cst-l">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <AboutHomeSection />

      {/* Reviews */}
      <div className="rev-sec">
        <div className="rev-in">
          <div className="sec-hd">
            <div>
              <div className="sec-t">What Doctors Are Saying</div>
              <div className="sec-s">Trusted by 50,000+ healthcare professionals</div>
            </div>
            <div className="rev-stats-top" style={{ display: "flex", gap: 34, flexWrap: "wrap" }}>
              {[
                ["50K+", "Customers"],
                ["4.8★", "Rating"],
                ["200+", "Cities"],
              ].map(([n, l]) => (
                <div key={l} style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontFamily: "var(--serif)",
                      fontSize: 25,
                      fontWeight: 700,
                      color: "var(--ink)",
                      letterSpacing: "-.03em",
                    }}
                  >
                    {n}
                  </div>
                  <div style={{ fontSize: 11.5, color: "var(--lt)", marginTop: 2 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="rev-g">
            {REVIEWS.map((r, i) => (
              <div className="rv" key={i}>
                <div className="rv-stars">{"★".repeat(r.r)}</div>
                <div className="rv-txt">"{r.txt}"</div>
                <div className="rv-auth">
                  <div className="rv-av">{r.av}</div>
                  <div>
                    <div className="rv-nm">{r.name}</div>
                    <div className="rv-rl">{r.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="nl-sec">
        <div style={{ maxWidth: 1560, margin: "0 auto" }}>
          <div className="nl-t">Get 10% Off Your First Order</div>
          <div className="nl-s">Subscribe for exclusive deals, new arrivals and healthcare style tips.</div>
          <div className="nl-form">
            <input className="nl-inp" type="email" placeholder="Enter your email address" />
            <button className="nl-go">Subscribe</button>
          </div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,.26)", marginTop: 13 }}>
            Use code <strong style={{ color: "var(--g2)" }}>MEDVASTR10</strong> at checkout.
          </div>
        </div>
      </div>
    </div>
  );
}
