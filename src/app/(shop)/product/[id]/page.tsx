"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { PRODUCTS, SIZES, fmt, cn } from "@/lib/data";
import { useApp } from "@/context/AppContext";
import ProductCard from "@/components/ProductCard";

export default function ProductDetailPage() {
  const { id } = useParams();
  const { products, addToCart, wishlist, toggleWishlist, toast } = useApp();

  const p = products.find((x) => x.id === parseInt(id as string));
  const [ci, setCi] = useState(0);
  const [sz, setSz] = useState("M");
  const [qty, setQty] = useState(1);

  if (!p) return <div className="page sec">Product not found.</div>;

  const wished = wishlist.includes(p.id);
  const related = products.filter((x) => x.type === p.type && x.id !== p.id).slice(0, 4);

  return (
    <div className="page">
      <div className="sec">
        {/* Breadcrumb */}
        <div className="pdp-bc">
          <span onClick={() => (window.location.href = "/")}>Home</span>
          <span>›</span>
          <span onClick={() => (window.location.href = "/products")}>{p.type}</span>
          <span>›</span>
          <strong>{p.name}</strong>
        </div>

        <div className="pdp-grid">
          {/* Gallery */}
          <div className="pdp-gal">
            <div className="pdp-main-img" style={{ background: p.bg }}>
              <span className="pdp-emo-main">{p.emo}</span>
              {p.badge && (
                <div className={`pc-badge pb-${p.badge.toLowerCase().replace(" ", "")} pdp-badge`}>
                  {p.badge}
                </div>
              )}
            </div>
            <div className="pdp-thumbs">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className={`pdp-thumb${i === 1 ? " on" : ""}`} style={{ background: p.bg }}>
                  {p.emo}
                </div>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="pdp-info">
            <div className="pdp-tag">{p.fab || "Premium"} Collection</div>
            <h1 className="pdp-h">{p.name}</h1>
            
            <div className="pdp-meta">
              <div className="pdp-stars">
                <span className="stars">{"★".repeat(Math.floor(p.rating))}</span>
                {p.rating}
              </div>
              <div className="pdp-rev-c">{p.rev.toLocaleString()} Verified Reviews</div>
              <div className="pdp-stock">✓ In Stock</div>
            </div>

            <div className="pdp-price-row">
              <span className="pdp-price">{fmt(p.price)}</span>
              {p.origPrice && <span className="pdp-orig">{fmt(p.origPrice)}</span>}
              <span className="pdp-tax">Inclusive of all taxes</span>
            </div>

            <div className="pdp-box">
              {/* COLOUR */}
              <div className="pdp-opt">
                <label className="pdp-opt-l">
                  Colour: <span>{cn(p.clrs[ci])}</span>
                </label>
                <div className="pdp-clrs">
                  {p.clrs.map((c, i) => (
                    <div
                      key={i}
                      onClick={() => setCi(i)}
                      className={`pdp-clr-sw${ci === i ? " on" : ""}`}
                      style={{ background: c }}
                    />
                  ))}
                </div>
              </div>

              {/* SIZE */}
              <div className="pdp-opt">
                <div className="pdp-opt-hd">
                  <label className="pdp-opt-l">Size</label>
                  <span className="pdp-sg">Size Guide</span>
                </div>
                <div className="pdp-sizes">
                  {SIZES.map((s) => (
                    <div
                      key={s}
                      onClick={() => setSz(s)}
                      className={`pdp-sz-sw${sz === s ? " on" : ""}`}
                    >
                      {s}
                    </div>
                  ))}
                </div>
              </div>

              {/* ACTIONS */}
              <div className="pdp-acts">
                <div className="pdp-qty">
                  <button onClick={() => setQty((q) => Math.max(1, q - 1))}>–</button>
                  <span>{qty}</span>
                  <button onClick={() => setQty((q) => q + 1)}>+</button>
                </div>
                <button
                  className="btn-p pdp-add"
                  onClick={() => {
                    addToCart(p, ci, sz);
                    toast(`${p.short} added to your bag!`, "ok");
                  }}
                >
                  Add to Bag — {fmt(p.price * qty)}
                </button>
                <button
                  className={`pdp-wish${wished ? " on" : ""}`}
                  onClick={() => toggleWishlist(p.id)}
                >
                  {wished ? "❤️" : "🤍"}
                </button>
              </div>
            </div>

            {/* DETAILS */}
            <div className="pdp-desc-sec">
              <div className="pdp-desc-hd">
                <h3>Product Description</h3>
                <span>–</span>
              </div>
              <p className="pdp-desc-p">{p.desc}</p>
              <div className="pdp-specs">
                {[
                  ["Fabric", p.fabD],
                  ["Stretch", p.stretch],
                  ["Pockets", `${p.pockets} Functional`],
                  ["Fit", p.fit],
                  ["Weight", p.wt],
                  ["Care", p.care],
                ].map(([l, v]) => (
                  <div key={l} className="pdp-spec">
                    <div className="pdp-spec-l">{l}</div>
                    <div className="pdp-spec-v">{v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RELATED */}
        <div className="pdp-rel">
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
