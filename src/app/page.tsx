"use client";

import React, { useState } from "react";
import Link from "next/link";
import Hero from "@/components/Hero";
import ProductCard from "@/components/ProductCard";
import VideoSection from "@/components/VideoSection";
import AboutHomeSection from "@/components/AboutHomeSection";
import BulkOrderBanner from "@/components/BulkOrderBanner";
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
  ];

  const activeProducts = PRODUCTS.filter((p) => {
    const tab = TABS.find((t) => t.id === activeTab);
    if (!tab) return false;
    if (tab.type === "scrubs") return p.category === "Scrubs" && p.fabric === tab.fab;
    if (tab.type === "stethoscope") return p.category === "Stethoscopes";
    if (tab.type === "labcoat") return p.category === "Lab Coats";
    if (tab.type === "jacket") return p.category === "Jackets";
    return false;
  }).slice(0, 4);

  const newArr = PRODUCTS.filter((p) => p.isNew).slice(0, 4);

  return (
    <div className="pg">
      <Hero />

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
            { n: "Men's Scrubs", e: "👨‍⚕️", c: "Scrubs", g: "Men", bg: "#eef2f8" },
            { n: "Women's Scrubs", e: "👩‍⚕️", c: "Scrubs", g: "Women", bg: "#f8f0f2" },
            { n: "Classic Scrubs", e: "🥼", c: "Scrubs", bg: "#e8f8f6" },
            { n: "Stethoscopes", e: "🩺", c: "Stethoscopes", bg: "#fdf3e0" },
          ].map((cat, i) => (
            <Link href={`/products?cat=${cat.c}${cat.g ? `&gen=${cat.g}` : ""}`} className="cat-c" key={i} style={{ background: cat.bg }}>
              <div className="cat-e">{cat.e}</div>
              <div className="cat-n">{cat.n}</div>
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
      <div className="sec" style={{ background: "var(--off)" }}>
        <div className="sec-hd">
          <div>
            <div className="sec-t">Bestselling Scrubs</div>
            <div className="sec-s">Most loved by healthcare professionals across India</div>
          </div>
          <Link href="/products" className="va">
            View All Bestsellers →
          </Link>
        </div>

        <div className="tabs">
          {TABS.map((t) => (
            <div key={t.id} className={`tab ${activeTab === t.id ? "on" : ""}`} onClick={() => setActiveTab(t.id)}>
              {t.label}
            </div>
          ))}
        </div>

        <div className="pg-4">
          {activeProducts.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      </div>

      {/* PROMO */}
      <div className="promo-grid">
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

      <BulkOrderBanner />
      <AboutHomeSection />

      {/* NEW HERO BANNER */}
      <div className="hero-banner-big">
        <div className="hbb-in">
          <div className="hbb-tag">★ TRUSTED BY THE BEST</div>
          <h2 className="hbb-h">50,000+ Healthcare Heroes Choose Medvastr</h2>
          <p className="hbb-p">From AIIMS surgeons to private clinic nurses, India's medical community trusts Medvastr for comfort that lasts a lifetime.</p>
          <div className="hbb-stats">
            <div><strong>50k+</strong> Users</div>
            <div><strong>200+</strong> Cities</div>
            <div><strong>4.9★</strong> Rating</div>
          </div>
        </div>
      </div>

      {/* Reviews (Refined) */}
      <div className="rev-sec">
        <div className="rev-in">
          <div className="rev-grid">
            {[
              { q: "The best scrubs I've owned in 10 years of practice. Fabric is incredible.", a: "Dr. Sandeep Shah", r: "Surgeon" },
              { q: "Finally a brand that understands Indian sizes and climate. Highly recommended.", a: "Dr. Anjali Rao", r: "Pediatrician" },
              { q: "Our entire hospital staff is now in Medvastr. The bulk order process was seamless.", a: "Sr. John D'Souza", r: "Hospital Admin" }
            ].map((r, i) => (
              <div className="rev-card" key={i}>
                <div className="rev-q">"{r.q}"</div>
                <div className="rev-a">{r.a}</div>
                <div className="rev-r">{r.r}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="trust-sec">
        <div className="trust-in">
          {B.map((b, i) => (
            <div key={i} className="trit">
              <span className="trit-ico">{b.i}</span>
              <span>
                <div className="trit-t">{b.t}</div>
                <div className="trit-s">{b.s}</div>
              </span>
            </div>
          ))}
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
