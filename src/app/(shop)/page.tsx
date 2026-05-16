"use client";

import React, { useState } from "react";
import Link from "next/link";
import Hero from "@/components/Hero";
import ProductCard from "@/components/ProductCard";
import VideoSection from "@/components/VideoSection";
import AboutHomeSection from "@/components/AboutHomeSection";
import BulkOrderBanner from "@/components/BulkOrderBanner";
import PressSection from "@/components/PressSection";
import { COLS, REVIEWS, B } from "@/lib/data";
import { useApp } from "@/context/AppContext";

export default function Home() {
  const [activeTab, setActiveTab] = useState("scrubs");
  const { products } = useApp();

  const TABS = [
    { id: "uniforms", label: "Uniforms & Scrubs", type: "uniforms" },
    { id: "linen", label: "Linen & Bedding", type: "linen" },
    { id: "surgical", label: "Surgical Wear", type: "surgical" },
    { id: "diagnostic", label: "Diagnostic & Caps", type: "diagnostic" },
    // { id: "jacket", label: "DRIFT Jacket", type: "jacket" },
    // { id: "underscrub", label: "Underscrubs", type: "underscrub" },
  ];

  const tabProducts = (() => {
    const tab = TABS.find((t) => t.id === activeTab);
    if (!tab) return [];
    let p = products.filter((x) => x.type === tab.type);
    return p.slice(0, 8);
  })();

  const newArr = products.filter((p) => p.badge && ["New", "New Launch"].includes(p.badge)).slice(0, 4);

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
            ["#dde3f0", "👨‍⚕️", "Uniforms & Scrubs"],
            ["#f0dde4", "🥼", "Linen & Bedding"],
            ["#ddf0e8", "🧥", "Surgical Wear"],
            ["#f0f0f0", "🩺", "Diagnostic & Caps"],
            ["#f8f8f8", "🛏️", "Bedding Supplies"],
          ].map(([bg, em, nm]) => (
            <Link href="/products" className="cat-c" key={nm as string}>
              <div className="cat-img" style={{ background: bg as string }}>
                {em}
              </div>
              <div className="cat-l">
                {nm}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* COLOURS */}
      <div className="clr-sec">
        <div className="clr-in">
          <div className="clr-t">Shop By Colours</div>
          <div className="clr-s">4 shades across all categories</div>
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
          <div className="promo-em">👕</div>
          <div className="promo-ey">Bestseller</div>
          <div className="promo-tt">Flexy Fit 'V' Scrub</div>
          <div className="promo-bd">Available in Dark Blue, Light Blue, Maroon & Wine. Sizes M to XXL.</div>
          <Link href="/products?cat=scrubs" className="btn-t">
            Shop Flexy Fit Scrub →
          </Link>
        </div>
        <div className="promo-h" style={{ background: "#2d6a4f" }}>
          <div className="promo-em">🥼</div>
          <div className="promo-ey">New Collection</div>
          <div className="promo-tt">Green OT Gown</div>
          <div className="promo-bd">Free size. 100% Cotton. Ideal for OT & surgical environments.</div>
          <Link href="/products?cat=surgical" className="btn-d">
            Shop Green OT Gown →
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

      {/* Reviews */}
      <div className="rev-sec">
        <div className="rev-in">
          <div className="sec-hd">
            <div>
              <div className="sec-t">What Doctors Are Saying</div>
              <div className="sec-s">Trusted by 50,000+ healthcare professionals</div>
            </div>
            <div className="rev-stats-top" style={{ display: "none" }}>
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
