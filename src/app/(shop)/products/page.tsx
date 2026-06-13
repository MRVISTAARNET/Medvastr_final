"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { COLS, fmt } from "@/lib/data";
import { useApp } from "@/context/AppContext";

function ProductsContent() {
  const searchParams = useSearchParams();
  const initCat = searchParams.get("cat") || "all";
  const initColor = searchParams.get("color") || "";
  const initGen = searchParams.get("gender")?.toLowerCase() || searchParams.get("gen")?.toLowerCase() || "all";
  const { products, banners } = useApp();

  const [cat, setCat] = useState(initCat);
  const [gen, setGen] = useState(initGen);
  const [sort, setSort] = useState("default");
  const [minP, setMinP] = useState("");
  const [maxP, setMaxP] = useState("");
  const [colorFilter, setColorFilter] = useState(initColor);
  const [pg, setPg] = useState(1);
  const [mobF, setMobF] = useState(false);

  useEffect(() => {
    setCat(initCat);
    setColorFilter(initColor);
    setGen(initGen);
    setPg(1);
  }, [initCat, initColor, initGen]);

  const PER = 9;

  let f = products.filter((p) => {
    if (cat !== "all" && p.type !== cat) return false;
    if (gen !== "all" && p.gen !== "unisex" && p.gen !== gen) return false;
    if (minP && p.price < parseInt(minP)) return false;
    if (maxP && p.price > parseInt(maxP)) return false;
    if (colorFilter) {
      const colorMatch = (p as any).clrNms?.some((nm: string) =>
        nm.toLowerCase().includes(colorFilter.toLowerCase())
      ) || (p as any).clrs?.some((hex: string) =>
        hex.toLowerCase() === colorFilter.toLowerCase()
      );
      if (!colorMatch) return false;
    }
    return true;
  });

  if (sort === "pa") f = [...f].sort((a, b) => a.price - b.price);
  else if (sort === "pd") f = [...f].sort((a, b) => b.price - a.price);
  else if (sort === "rt") f = [...f].sort((a, b) => (b.rating || 0) - (a.rating || 0));
  else if (sort === "nw") f = [...f].sort((a, b) => b.id - a.id);

  const pages = Math.ceil(f.length / PER);
  const paged = f.slice((pg - 1) * PER, pg * PER);

  const reset = () => {
    setCat("all");
    setGen("all");
    setSort("default");
    setMinP("");
    setMaxP("");
    setColorFilter("");
    setPg(1);
  };

  const hasFilters = cat !== "all" || gen !== "all" || minP || maxP || colorFilter;

  const typeConfigs: Record<string, { ico: string; l: string }> = {
    scrubs: { ico: "🥼", l: "Scrubs" },
    stethoscope: { ico: "🩺", l: "Stethoscope" },
    labcoat: { ico: "🥼", l: "Lab Coats" },
    jacket: { ico: "🧥", l: "DRIFT Jacket" },
    underscrub: { ico: "👕", l: "Underscrubs" },
    accessories: { ico: "🧢", l: "Accessories" }
  };

  const uniqueTypes = Array.from(new Set(products.map(p => p.type)));

  const dynamicCats = uniqueTypes.map((t: string) => ({
    id: t,
    ico: typeConfigs[t]?.ico || '🏷️',
    l: typeConfigs[t]?.l || t.charAt(0).toUpperCase() + t.slice(1),
    n: products.filter(p => p.type === t).length
  }));

  const cats = [
    { id: "all", ico: "🏷️", l: "All Products", n: products.length },
    ...dynamicCats
  ];

  let activeCatLabel = cats.find((c: any) => c.id === cat)?.l || (gen !== 'all' ? (gen.charAt(0).toUpperCase() + gen.slice(1) + " Collection") : "All Products");

  let staticBannerBase: string | null = null;
  let staticBannerTitle = "";

  const S3 = "https://medvastr-assets.s3.ap-south-1.amazonaws.com";
  if (gen === 'men') {
    staticBannerBase = `${S3}/men-banner`;
    staticBannerTitle = "Men's Collection";
  } else if (gen === 'women') {
    staticBannerBase = `${S3}/women-banner`;
    staticBannerTitle = "Women's Collection";
  } else if (cat === 'surgical' || cat === 'surgical-wear') {
    staticBannerBase = `${S3}/surgical-banner`;
    staticBannerTitle = "Surgical Wear";
    activeCatLabel = "Surgical Wear";
  }

  const descMap: Record<string, string> = {
    "Men's Collection": "Engineered for excellence, our men's scrub collection combines high-performance fabric with a professional fit that lasts throughout the longest shifts.",
    "Women's Collection": "Designed for the modern healthcare hero, our women's collection offers a perfect blend of style, comfort, and functionality with our signature stretch fabric.",
    "Surgical Wear": "Premium protection meets flexibility. Our surgical wear is crafted to meet the highest clinical standards while ensuring maximum comfort in the operating room.",
    "All Products": "Explore our complete range of premium medical apparel, from high-performance scrubs to essential clinical accessories designed for healthcare professionals."
  };

  const activeDesc = descMap[staticBannerTitle || activeCatLabel] || descMap["All Products"];

  return (
    <div className="page" style={{ background: '#ffffff' }}>
      {staticBannerBase && (
        <SmartBanner base={staticBannerBase} title={staticBannerTitle} />
      )}
      <div className="sec" style={{ paddingBottom: 60 }}>
        {/* Breadcrumb */}
        <div className="breadcrumb" style={{ marginBottom: 25 }}>
          <Link href="/">Home</Link>
          <span className="sep">/</span>
          <span className="active">{activeCatLabel}</span>
        </div>

        <div className="catalog-header" style={{ marginBottom: 40 }}>
          <h1 className="catalog-title">{activeCatLabel}</h1>
          <p className="catalog-subtitle" style={{ maxWidth: 800, lineHeight: 1.6, color: '#64748b' }}>
            {activeDesc}
          </p>
        </div>

        <div className="products-layout">
          <button className="mob-filter-btn" onClick={() => setMobF(true)}>
            <span style={{ fontSize: 18 }}>⚙️</span> Show Filters
          </button>

          {/* SIDEBAR */}
          <div className={`sidebar${mobF ? " mob-on" : ""}`}>
            <div className="sb-header">
              <div className="sb-title">Filters</div>
              <div style={{ display: "flex", gap: 10 }}>
                {mobF && (
                  <button className="mob-filter-close" onClick={() => setMobF(false)}>✕</button>
                )}
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
                  <div
                    key={c.n}
                    className={`clr-chip${colorFilter === c.n ? ' on' : ''}`}
                    onClick={() => {
                      setColorFilter(prev => prev === c.n ? '' : c.n);
                      setPg(1);
                    }}
                    style={{ cursor: 'pointer', border: colorFilter === c.n ? '2px solid var(--teal)' : '2px solid transparent', borderRadius: 8, padding: '4px 8px', background: colorFilter === c.n ? '#f0fafa' : 'transparent' }}
                  >
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
                  {colorFilter && (
                    <span className="af-tag">
                      🎨 {colorFilter}
                      <span
                        className="af-x"
                        onClick={() => { setColorFilter(''); setPg(1); }}
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
        .breadcrumb { display: flex; align-items: center; gap: 8px; font-size: 12px; color: #94a3b8; margin: 10px 0 20px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; }
        .breadcrumb a { color: #94a3b8; text-decoration: none; transition: color 0.3s; }
        .breadcrumb a:hover { color: #1e293b; }
        .breadcrumb .sep { opacity: 0.3; }
        .breadcrumb .active { color: #1e293b; font-weight: 600; }

        .catalog-header { margin-bottom: 40px; padding-bottom: 30px; border-bottom: 1px solid #f1f5f9; }
        .catalog-title { font-size: 42px; font-weight: 800; color: #0f172a; margin-bottom: 12px; letter-spacing: -0.05em; }
        .catalog-subtitle { font-size: 16px; color: #475569; font-weight: 400; max-width: 700px; line-height: 1.7; }

        .products-layout { display: grid; grid-template-columns: 240px 1fr; gap: 60px; align-items: start; }
        
        .sidebar { background: #ffffff; border-right: 1px solid #f1f5f9; padding-right: 40px; position: sticky; top: 120px; }
        .sb-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
        .sb-title { font-size: 12px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 2px; }
        
        .sb-section { margin-bottom: 40px; }
        .sb-lbl { font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 1.5px; color: #1e293b; margin-bottom: 20px; display: block; border-bottom: 2px solid #0f172a; width: fit-content; padding-bottom: 4px; }
        
        .sb-chips { display: flex; flex-direction: column; gap: 4px; }
        .sb-chip { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #f8fafc; cursor: pointer; transition: all 0.2s; font-size: 14px; color: #64748b; font-weight: 500; }
        .sb-chip:hover { color: #0f172a; border-bottom-color: #e2e8f0; }
        .sb-chip.on { color: #008080; border-bottom-color: #008080; font-weight: 700; }
        .sb-chip-left { display: flex; align-items: center; gap: 12px; }
        .sb-chip-cnt { font-size: 10px; color: #cbd5e1; font-weight: 400; }
        .sb-chip.on .sb-chip-cnt { color: #008080; }

        .sb-gender-row { display: flex; flex-direction: column; gap: 4px; }
        .sb-gender-btn { padding: 12px 0; font-size: 14px; font-weight: 500; color: #64748b; cursor: pointer; transition: all 0.2s; border-bottom: 1px solid #f8fafc; text-align: left; }
        .sb-gender-btn:hover { color: #0f172a; }
        .sb-gender-btn.on { color: #008080; border-bottom-color: #008080; font-weight: 700; }

        .sb-price-btns { display: flex; flex-direction: column; gap: 4px; }
        .sb-price-btn { padding: 12px 0; font-size: 14px; font-weight: 500; color: #64748b; cursor: pointer; transition: all 0.2s; border-bottom: 1px solid #f8fafc; text-align: left; }
        .sb-price-btn.on { color: #008080; border-bottom-color: #008080; font-weight: 700; }

        .clr-chips { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; padding-top: 5px; }
        .clr-card { width: 30px; height: 30px; border-radius: 50%; border: 1px solid #e2e8f0; cursor: pointer; transition: all 0.3s; position: relative; padding: 3px; }
        .clr-card:hover { transform: translateY(-3px); border-color: #008080; }
        .clr-card.on { border-color: #0f172a; background: #f8fafc; transform: scale(1.1); }
        .clr-in { width: 100%; height: 100%; border-radius: 50%; }

        .mob-filter-btn { display: none; width: 100%; padding: 16px; background: #0f172a; border: none; border-radius: 4px; font-weight: 700; color: white; margin-bottom: 30px; align-items: center; justify-content: center; gap: 12px; cursor: pointer; letter-spacing: 1px; text-transform: uppercase; font-size: 12px; }
        .mob-filter-close { width: 40px; height: 40px; border-radius: 50%; background: #f1f5f9; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; }

        @media (max-width: 1024px) {
          .products-layout { grid-template-columns: 1fr; gap: 0; }
          .sidebar { position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 10000; border: none; padding: 40px; display: none; overflow-y: auto; }
          .sidebar.mob-on { display: block; }
          .mob-filter-btn { display: flex; }
        }
      `}</style>
    </div>
  );
}

// Auto-tries .png → .jpg → .jpeg so any format uploaded to S3 works
function SmartBanner({ base, title }: { base: string; title: string }) {
  const EXTS = ['.png', '.jpg', '.jpeg'];
  const [idx, setIdx] = React.useState(0);
  const src = idx < EXTS.length ? base + EXTS[idx] : null;

  if (!src) return null;

  return (
    <div
      className="cat-banner"
      style={{
        width: '100%',
        marginBottom: 30,
        borderRadius: 24,
        overflow: 'hidden',
        minHeight: '220px',
        maxHeight: '280px',
        backgroundImage: `url(${src})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
        display: 'flex',
        alignItems: 'center',
        padding: '0 50px',
        position: 'relative',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
      }}
    >
      <img src={src} alt="" style={{ display: 'none' }} onError={() => setIdx(i => i + 1)} />
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
