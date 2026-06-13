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

  return (
    <div className="page" style={{ background: '#f8fafc' }}>
      {staticBannerBase && (
        <SmartBanner base={staticBannerBase} title={staticBannerTitle} />
      )}
      <div className="sec" style={{ paddingBottom: 60 }}>
        {/* Breadcrumb */}
        <div className="breadcrumb" style={{ marginBottom: staticBannerBase ? 20 : 30 }}>
          <Link href="/">Home</Link>
          <span className="sep">/</span>
          <span className="active">{activeCatLabel}</span>
        </div>

        {!staticBannerBase && (
          <div className="catalog-header">
            <h1 className="catalog-title">{activeCatLabel}</h1>
            <p className="catalog-subtitle">{f.length} items available</p>
          </div>
        )}

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
        .breadcrumb { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #64748b; margin: 15px 0 25px; font-weight: 500; }
        .breadcrumb a { color: #64748b; text-decoration: none; transition: color 0.2s; }
        .breadcrumb a:hover { color: #008080; }
        .breadcrumb .sep { opacity: 0.4; }
        .breadcrumb .active { color: #1e293b; font-weight: 700; }

        .catalog-header { margin-bottom: 35px; }
        .catalog-title { font-size: 36px; font-weight: 950; color: #0f172a; margin-bottom: 6px; letter-spacing: -0.04em; }
        .catalog-subtitle { font-size: 15px; color: #64748b; font-weight: 500; }

        .products-layout { display: grid; grid-template-columns: 260px 1fr; gap: 40px; align-items: start; }
        
        .sidebar { background: #ffffff; border: 1px solid #f1f5f9; border-radius: 20px; padding: 25px; position: sticky; top: 100px; box-shadow: 0 10px 40px rgba(0,0,0,0.02); }
        .sb-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; padding-bottom: 15px; border-bottom: 1px solid #f1f5f9; }
        .sb-title { font-size: 16px; font-weight: 900; color: #0f172a; text-transform: uppercase; letter-spacing: 1px; }
        
        .sb-section { margin-bottom: 30px; }
        .sb-lbl { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; color: #94a3b8; margin-bottom: 18px; display: block; opacity: 0.8; }
        
        .sb-chips { display: flex; flex-direction: column; gap: 6px; }
        .sb-chip { display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; border-radius: 12px; cursor: pointer; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); font-size: 14px; color: #475569; font-weight: 600; }
        .sb-chip:hover { background: #f8fafc; color: #008080; }
        .sb-chip.on { background: #f0f9f9; color: #008080; font-weight: 700; }
        .sb-chip-left { display: flex; align-items: center; gap: 10px; }
        .sb-chip-cnt { font-size: 10px; background: #f1f5f9; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; border-radius: 50%; color: #94a3b8; }
        .sb-chip.on .sb-chip-cnt { background: #008080; color: white; }

        .sb-gender-row { display: grid; grid-template-columns: 1fr; gap: 6px; }
        .sb-gender-btn { padding: 10px 14px; border-radius: 12px; font-size: 13px; font-weight: 600; color: #475569; cursor: pointer; transition: all 0.2s; background: #f8fafc; }
        .sb-gender-btn:hover { background: #f1f5f9; }
        .sb-gender-btn.on { background: #008080; color: #ffffff; box-shadow: 0 4px 12px rgba(0,128,128,0.25); }

        .sb-price-btns { display: flex; flex-direction: column; gap: 6px; }
        .sb-price-btn { padding: 10px 14px; border-radius: 12px; font-size: 13px; font-weight: 600; color: #475569; cursor: pointer; transition: all 0.2s; background: #f8fafc; }
        .sb-price-btn.on { background: #1e293b; color: #ffffff; }

        .clr-chips { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; }
        .clr-card { width: 34px; height: 34px; border-radius: 50%; border: 2px solid #f1f5f9; cursor: pointer; transition: all 0.2s; position: relative; padding: 2px; }
        .clr-card:hover { transform: scale(1.15); }
        .clr-card.on { border-color: #008080; box-shadow: 0 0 0 1px #008080; }
        .clr-in { width: 100%; height: 100%; border-radius: 50%; border: 1px solid rgba(0,0,0,0.05); }

        .mob-filter-btn { display: none; width: 100%; padding: 14px; background: #0f172a; border: none; border-radius: 12px; font-weight: 700; color: white; margin-bottom: 20px; align-items: center; justify-content: center; gap: 10px; cursor: pointer; }
        .mob-filter-close { width: 40px; height: 40px; border-radius: 50%; background: #f1f5f9; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; }

        @media (max-width: 1024px) {
          .products-layout { grid-template-columns: 1fr; }
          .sidebar { position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 10000; border-radius: 0; padding: 30px; display: none; }
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
