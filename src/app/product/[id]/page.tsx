"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { PRODUCTS, SIZES, fmt, cn } from "@/lib/data";
import { useApp } from "@/context/AppContext";
import ProductCard from "@/components/ProductCard";

export default function ProductDetailPage() {
  const { id } = useParams();
  const { addToCart, wishlist, toggleWishlist, toast } = useApp();

  const p = PRODUCTS.find((x) => x.id === parseInt(id as string));
  const [ci, setCi] = useState(0);
  const [sz, setSz] = useState("M");
  const [qty, setQty] = useState(1);

  if (!p) return <div className="page sec">Product not found.</div>;

  const wished = wishlist.includes(p.id);

  const related = PRODUCTS.filter((x) => x.type === p.type && x.id !== p.id).slice(0, 4);

  return (
    <div className="page">
      <div className="sec">
        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12.5, color: "var(--lt)", marginBottom: 28 }}>
          <span style={{ cursor: "pointer", color: "var(--t)" }}>Home</span>
          <span>›</span>
          <span style={{ cursor: "pointer", color: "var(--t)" }}>{p.type.charAt(0).toUpperCase() + p.type.slice(1)}</span>
          <span>›</span>
          <strong style={{ color: "var(--ink)" }}>{p.name}</strong>
        </div>

        <div className="pdp-grid" style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 60 }}>
          {/* Gallery */}
          <div className="pdp-gal">
            <div
              className="pdp-main-img"
              style={{
                background: p.bg,
                aspectRatio: "1/1.1",
                borderRadius: 24,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 160,
                border: "1.5px solid var(--bdr)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {p.emo}
              {p.badge && (
                <div
                  className={`pc-badge pb-${p.badge.toLowerCase().replace(" ", "")}`}
                  style={{ top: 24, left: 24, padding: "6px 14px", fontSize: 11 }}
                >
                  {p.badge}
                </div>
              )}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginTop: 14 }}>
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  style={{
                    background: p.bg,
                    aspectRatio: "1",
                    borderRadius: 12,
                    border: i === 1 ? "2px solid var(--t)" : "1.5px solid var(--bdr)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 40,
                    opacity: i === 1 ? 1 : 0.4,
                  }}
                >
                  {p.emo}
                </div>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="pdp-info">
            <div style={{ fontSize: 11, fontWeight: 800, color: "var(--lt)", letterSpacing: 2.5, textTransform: "uppercase", marginBottom: 8 }}>
              {p.fab || "Premium"} Collection
            </div>
            <h1 style={{ fontFamily: "var(--serif)", fontSize: 44, fontWeight: 700, color: "var(--ink)", marginBottom: 12, lineHeight: 1.1, letterSpacing: "-.03em" }}>
              {p.name}
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 14, fontWeight: 600 }}>
                <span className="stars">{"★".repeat(Math.floor(p.rating))}</span>
                {p.rating}
              </div>
              <div style={{ fontSize: 13, color: "var(--lt)" }}>{p.rev.toLocaleString()} Verified Reviews</div>
              <div style={{ width: 1.5, height: 14, background: "var(--bdr)" }} />
              <div style={{ fontSize: 13, color: "var(--t)", fontWeight: 700 }}>✓ In Stock</div>
            </div>

            <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 32 }}>
              <span style={{ fontSize: 32, fontWeight: 800, color: "var(--ink)" }}>{fmt(p.price)}</span>
              {p.origPrice && <span style={{ fontSize: 18, color: "var(--lt)", textDecoration: "line-through" }}>{fmt(p.origPrice)}</span>}
              <span style={{ fontSize: 12, color: "var(--lt)" }}>Inclusive of all taxes</span>
            </div>

            <div style={{ background: "var(--warm)", border: "1.5px solid var(--bdr)", borderRadius: 16, padding: 24, marginBottom: 32 }}>
              {/* COLOUR */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>
                    Colour: <span style={{ color: "var(--ink)" }}>{cn(p.clrs[ci])}</span>
                  </label>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {p.clrs.map((c, i) => (
                    <div
                      key={i}
                      onClick={() => setCi(i)}
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        background: c,
                        border: "3px solid white",
                        outline: ci === i ? "2px solid var(--ink)" : "1.5px solid transparent",
                        cursor: "pointer",
                        transition: "all .15s",
                        transform: ci === i ? "scale(1.1)" : "none",
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* SIZE */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Size</label>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "var(--t)", cursor: "pointer", textDecoration: "underline" }}>Size Guide</span>
                </div>
                <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                  {SIZES.map((s) => (
                    <div
                      key={s}
                      onClick={() => setSz(s)}
                      style={{
                        height: 42,
                        minWidth: 50,
                        padding: "0 14px",
                        borderRadius: 8,
                        background: sz === s ? "var(--ink)" : "white",
                        color: sz === s ? "white" : "var(--ink)",
                        border: "1.5px solid var(--bdr)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: "pointer",
                        transition: "all .16s",
                      }}
                    >
                      {s}
                    </div>
                  ))}
                </div>
              </div>

              {/* ACTIONS */}
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", border: "1.5px solid var(--bdr)", borderRadius: 8, background: "white", overflow: "hidden" }}>
                  <button onClick={() => setQty((q) => Math.max(1, q - 1))} style={{ width: 44, height: 52, fontSize: 18 }}>–</button>
                  <span style={{ minWidth: 40, textAlign: "center", fontWeight: 700 }}>{qty}</span>
                  <button onClick={() => setQty((q) => q + 1)} style={{ width: 44, height: 52, fontSize: 18 }}>+</button>
                </div>
                <button
                  className="btn-p"
                  style={{ flex: 1, height: 54, fontSize: 15, borderRadius: 8 }}
                  onClick={() => {
                    addToCart(p, ci, sz);
                    toast(`${p.short} added to your bag!`, "ok");
                  }}
                >
                  Add to Bag — {fmt(p.price * qty)}
                </button>
                <button
                  onClick={() => toggleWishlist(p.id)}
                  style={{
                    width: 54,
                    height: 54,
                    borderRadius: 8,
                    border: "1.5px solid var(--bdr)",
                    background: "white",
                    fontSize: 20,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {wished ? "❤️" : "🤍"}
                </button>
              </div>
            </div>

            {/* DETAILS ACCORDION (Simplified) */}
            <div style={{ borderTop: "1.5px solid var(--bdr)", paddingTop: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, cursor: "pointer" }}>
                <h3 style={{ fontSize: 14, fontWeight: 700 }}>Product Description</h3>
                <span>–</span>
              </div>
              <p style={{ fontSize: 14, color: "var(--ink2)", lineHeight: 1.8, marginBottom: 20 }}>{p.desc}</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                {[
                  ["Fabric", p.fabD],
                  ["Stretch", p.stretch],
                  ["Pockets", `${p.pockets} Functional`],
                  ["Fit", p.fit],
                  ["Weight", p.wt],
                  ["Care", p.care],
                ].map(([l, v]) => (
                  <div key={l} style={{ padding: "12px 14px", background: "var(--cool)", borderRadius: 8 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "var(--lt)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 2 }}>{l}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RELATED */}
        <div style={{ marginTop: 80 }}>
          <div className="sec-hd">
            <div>
              <div className="sec-t">Complete the Look</div>
              <div className="sec-s">Perfect pairings for your {p.short}</div>
            </div>
          </div>
          <div className="pg-4">
            {related.map((rp) => (
              <ProductCard key={rp.id} p={rp} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
