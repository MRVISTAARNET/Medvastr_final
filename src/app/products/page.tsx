"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { PRODUCTS, COLS, fmt } from "@/lib/data";

function ProductsContent() {
  const searchParams = useSearchParams();
  const initCat = searchParams.get("cat") || "all";

  const [cat, setCat] = useState(initCat);
  const [gen, setGen] = useState("all");
  const [sort, setSort] = useState("default");
  const [minP, setMinP] = useState("");
  const [maxP, setMaxP] = useState("");
  const [pg, setPg] = useState(1);
  const [mobF, setMobF] = useState(false); // Mobile Filter Open

  useEffect(() => {
    setCat(initCat);
    setPg(1);
  }, [initCat]);

  const PER = 9;

  let f = PRODUCTS.filter((p) => {
    if (cat !== "all" && p.type !== cat) return false;
    if (gen !== "all" && p.gen !== "unisex" && p.gen !== gen) return false;
    if (minP && p.price < parseInt(minP)) return false;
    if (maxP && p.price > parseInt(maxP)) return false;
    return true;
  });

  if (sort === "pa") f = [...f].sort((a, b) => a.price - b.price);
  else if (sort === "pd") f = [...f].sort((a, b) => b.price - a.price);
  else if (sort === "rt") f = [...f].sort((a, b) => b.rating - a.rating);
  else if (sort === "nw") f = [...f].sort((a, b) => b.id - a.id);

  const pages = Math.ceil(f.length / PER);
  const paged = f.slice((pg - 1) * PER, pg * PER);

  const reset = () => {
    setCat("all");
    setGen("all");
    setSort("default");
    setMinP("");
    setMaxP("");
    setPg(1);
  };

  const cats = [
    { id: "all", ico: "🏷️", l: "All Products", n: PRODUCTS.length },
    { id: "scrubs", ico: "🥼", l: "Scrubs", n: PRODUCTS.filter((p) => p.type === "scrubs").length },
    { id: "stethoscope", ico: "🩺", l: "Stethoscope", n: PRODUCTS.filter((p) => p.type === "stethoscope").length },
    { id: "labcoat", ico: "🥼", l: "Lab Coats", n: PRODUCTS.filter((p) => p.type === "labcoat").length },
    { id: "jacket", ico: "🧥", l: "DRIFT Jacket", n: PRODUCTS.filter((p) => p.type === "jacket").length },
    { id: "underscrub", ico: "👕", l: "Underscrubs", n: PRODUCTS.filter((p) => p.type === "underscrub").length },
    { id: "accessories", ico: "🧢", l: "Accessories", n: PRODUCTS.filter((p) => p.type === "accessories").length },
  ];

  const activeCatLabel = cats.find((c) => c.id === cat)?.l || "All Products";
  const hasFilters = cat !== "all" || gen !== "all" || minP || maxP;

  return (
    <div className="page">
      <div className="sec">
        {/* Breadcrumb */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            fontSize: 12.5,
            color: "var(--lt)",
            marginBottom: 22,
            flexWrap: "wrap",
          }}
        >
          <span style={{ cursor: "pointer", color: "var(--t)", fontWeight: 500 }}>Home</span>
          <span style={{ color: "var(--bdr)" }}>›</span>
          <strong style={{ color: "var(--ink)" }}>All Products</strong>
          {cat !== "all" && (
            <>
              <span style={{ color: "var(--bdr)" }}>›</span>
              <strong style={{ color: "var(--t)" }}>{activeCatLabel}</strong>
            </>
          )}
        </div>

        <div className="sec-hd">
          <div>
            <div className="sec-t">{activeCatLabel}</div>
            <div className="sec-s">{f.length} products crafted for healthcare professionals</div>
          </div>
          <button className="mob-filter-btn" onClick={() => setMobF(true)}>
            ⚙️ Filters
          </button>
        </div>

        <div className="products-layout">
          {/* SIDEBAR */}
          <div className={`sidebar${mobF ? " mob-on" : ""}`}>
            <div className="sb-header">
              <div className="sb-title">
                <span className="sb-title-ico">⚙️</span>
                Filter Products
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                {hasFilters && (
                  <button className="sb-clear" onClick={reset}>
                    ✕ Clear
                  </button>
                )}
                <button className="mob-filter-close" onClick={() => setMobF(false)}>✕</button>
              </div>
            </div>

            <div className="sb-section">
              <div className="sb-lbl">
                <span className="sb-lbl-ico">📦</span>Category
              </div>
              <div className="sb-chips">
                {cats.map((c) => (
                  <div
                    key={c.id}
                    className={`sb-chip${cat === c.id ? " on" : ""}`}
                    onClick={() => {
                      setCat(c.id);
                      setPg(1);
                      setMobF(false);
                    }}
                  >
                    <div className="sb-chip-left">
                      <span className="sb-chip-ico">{c.ico}</span>
                      <span>{c.l}</span>
                    </div>
                    <span className="sb-chip-cnt">{c.n}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="sb-section">
              <div className="sb-lbl">
                <span className="sb-lbl-ico">👤</span>Gender
              </div>
              <div className="sb-gender-row">
                {[
                  ["all", "All 🏥"],
                  ["men", "Men 👨‍⚕️"],
                  ["women", "Women 👩‍⚕️"],
                  ["unisex", "Unisex ♾️"],
                ].map(([v, l]) => (
                  <div
                    key={v}
                    className={`sb-gender-btn${gen === v ? " on" : ""}`}
                    onClick={() => {
                      setGen(v);
                      setPg(1);
                    }}
                  >
                    {l}
                  </div>
                ))}
              </div>
            </div>

            <div className="sb-section">
              <div className="sb-lbl">
                <span className="sb-lbl-ico">💰</span>Price Range
              </div>
              <div className="sb-price-btns">
                {[
                  ["Under ₹1000", "", "999"],
                  ["₹1k – ₹2k", "1000", "2000"],
                  ["₹2k – ₹3k", "2000", "3000"],
                  ["₹3k+", "3000", ""],
                ].map(([l, mn, mx]) => (
                  <div
                    key={l}
                    className={`sb-price-btn${minP === mn && maxP === mx ? " on" : ""}`}
                    onClick={() => {
                      setMinP(mn);
                      setMaxP(mx);
                      setPg(1);
                    }}
                  >
                    {l}
                  </div>
                ))}
              </div>
            </div>

            <div className="sb-section">
              <div className="sb-lbl">
                <span className="sb-lbl-ico">🎨</span>Colours
              </div>
              <div className="clr-chips">
                {COLS.map((c) => (
                  <div key={c.n} className="clr-chip">
                    <div className="clr-dot-sm" style={{ background: c.h }} />
                    <span className="clr-name">{c.n}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="sb-section">
              <div className="sb-lbl">
                <span className="sb-lbl-ico">↕️</span>Sort By
              </div>
              <select className="sort-sel" value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="default">Default — Featured</option>
                <option value="pa">Price: Low → High</option>
                <option value="pd">Price: High → Low</option>
                <option value="rt">⭐ Top Rated</option>
                <option value="nw">🆕 Newest First</option>
              </select>
            </div>
            
            <button className="btn-p" style={{ width: '100%', marginTop: 20 }} onClick={() => setMobF(false)}>Apply Filters</button>
          </div>

          {/* PRODUCTS AREA */}
          <div className="products-right">
            <div className="prod-top">
              <div className="prod-count">
                Showing <strong>{paged.length}</strong> of <strong>{f.length}</strong> products
              </div>
              {hasFilters && (
                <div className="active-filters">
                  {cat !== "all" && (
                    <span className="af-tag">
                      {activeCatLabel}
                      <span
                        className="af-x"
                        onClick={() => {
                          setCat("all");
                          setPg(1);
                        }}
                      >
                        ✕
                      </span>
                    </span>
                  )}
                  {gen !== "all" && (
                    <span className="af-tag">
                      {gen.charAt(0).toUpperCase() + gen.slice(1)}
                      <span
                        className="af-x"
                        onClick={() => {
                          setGen("all");
                          setPg(1);
                        }}
                      >
                        ✕
                      </span>
                    </span>
                  )}
                  {(minP || maxP) && (
                    <span className="af-tag">
                      ₹{minP || "0"}–{maxP ? "₹" + maxP : "max"}
                      <span
                        className="af-x"
                        onClick={() => {
                          setMinP("");
                          setMaxP("");
                          setPg(1);
                        }}
                      >
                        ✕
                      </span>
                    </span>
                  )}
                </div>
              )}
            </div>

            {paged.length === 0 ? (
              <div style={{ textAlign: "center", padding: "76px 20px", color: "var(--lt)" }}>
                <div style={{ fontSize: 52, marginBottom: 16 }}>🔍</div>
                <div
                  style={{
                    fontFamily: "var(--serif)",
                    fontSize: 26,
                    fontWeight: 700,
                    color: "var(--ink)",
                    marginBottom: 9,
                    letterSpacing: "-.02em",
                  }}
                >
                  No products found
                </div>
                <div style={{ marginBottom: 22, fontSize: 14 }}>Try adjusting your filters or clearing them</div>
                <button className="btn-t" onClick={reset}>
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="pg-3">
                {paged.map((p) => (
                  <ProductCard key={p.id} p={p} />
                ))}
              </div>
            )}

            {pages > 1 && (
              <div className="pag" style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 40 }}>
                <button
                  className="pgb"
                  disabled={pg === 1}
                  onClick={() => setPg((p) => p - 1)}
                  style={{ width: 40, height: 40, border: "1.5px solid var(--bdr)", borderRadius: 8 }}
                >
                  ‹
                </button>
                {Array.from({ length: pages }, (_, i) => (
                  <button
                    key={i}
                    className={`pgb${pg === i + 1 ? " on" : ""}`}
                    onClick={() => setPg(i + 1)}
                    style={{
                      width: 40,
                      height: 40,
                      border: "1.5px solid var(--bdr)",
                      borderRadius: 8,
                      background: pg === i + 1 ? "var(--ink)" : "white",
                      color: pg === i + 1 ? "white" : "var(--ink)",
                    }}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  className="pgb"
                  disabled={pg === pages}
                  onClick={() => setPg((p) => p + 1)}
                  style={{ width: 40, height: 40, border: "1.5px solid var(--bdr)", borderRadius: 8 }}
                >
                  ›
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .mob-filter-btn {
          display: none;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: var(--wh);
          border: 1.5px solid var(--bdr);
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
        }
        .mob-filter-close {
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--warm);
          border-radius: 50%;
          font-size: 14px;
        }
        @media (max-width: 1024px) {
          .mob-filter-btn { display: flex; }
          .sidebar {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: var(--wh);
            z-index: 2000;
            padding: 20px;
            overflow-y: auto;
            display: none;
          }
          .sidebar.mob-on { display: block; }
          .sb-header {
             display: flex;
             justify-content: space-between;
             align-items: center;
             margin-bottom: 25px;
             padding-bottom: 15px;
             border-bottom: 1px solid var(--bdr);
          }
        }
      `}</style>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div>Loading products...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
