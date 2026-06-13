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
  const initGen = searchParams.get("gender")?.toLowerCase() || "all";
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

        <div className="catalog-header" style={{ marginBottom: 40, borderLeft: '4px solid #008080', paddingLeft: 20 }}>
          <p className="catalog-subtitle" style={{ maxWidth: 850, fontSize: 17, lineHeight: 1.8, color: '#334155', margin: 0, fontWeight: 500 }}>
            {activeDesc}
          </p>
        </div>

        <div className="products-layout">
          <button className="mob-filter-btn" onClick={() => setMobF(true)}>
            <span style={{ fontSize: 18 }}>⚙️</span> Show Filters
          </button>

          {/* SIDEBAR */}
          <div className={`sidebar${mobF ? " mob-on" : ""}`}>
            <div className="sb-top-hd">
              FILTERS
            </div>

            <div className="sb-inner">
              <div className="sb-header">
                <div style={{ display: "flex", gap: 10, width: '100%', justifyContent: 'flex-end' }}>
                  {hasFilters && (
                    <button className="sb-clear" onClick={reset}>
                      ✕ Reset All
                    </button>
                  )}
                  {mobF && (
                    <button className="mob-filter-close" onClick={() => setMobF(false)}>✕</button>
                  )}
                </div>
              </div>

              {/* CATEGORY */}
              <div className="sb-section">
                <div className="sb-lbl">📦 CATEGORY</div>
                <div className="sb-box-list">
                  {cats.map((c) => (
                    <div
                      key={c.id}
                      className={`sb-box-item${cat === c.id ? " on" : ""}`}
                      onClick={() => { setCat(c.id); setPg(1); if (mobF) setMobF(false); }}
                    >
                      <div className="sb-box-l">
                        <span style={{ fontSize: 16 }}>🏷️</span> {c.l}
                      </div>
                      <div className="sb-box-r">{c.n}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* GENDER */}
              <div className="sb-section">
                <div className="sb-lbl">👤 GENDER</div>
                <div className="sb-box-list">
                  {[
                    ["all", "All 🏥"],
                    ["men", "Men �‍⚕️"],
                    ["women", "Women 👩‍⚕️"],
                    ["unisex", "Unisex ♾️"],
                  ].map(([v, l]) => (
                    <div
                      key={v}
                      className={`sb-box-item${gen === v ? " on" : ""}`}
                      onClick={() => { setGen(v); setPg(1); if (mobF) setMobF(false); }}
                    >
                      <div className="sb-box-l">{l}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* PRICE */}
              <div className="sb-section">
                <div className="sb-lbl">🔥 PRICE RANGE</div>
                <div className="sb-box-list">
                  {[
                    ["Under ₹1000", "", "999"],
                    ["₹1k – ₹2k", "1000", "2000"],
                    ["₹2k – ₹3k", "2000", "3000"],
                    ["₹3k+", "3000", ""],
                  ].map(([l, mn, mx]) => (
                    <div
                      key={l}
                      className={`sb-box-item${minP === mn && maxP === mx ? " on" : ""}`}
                      onClick={() => { setMinP(mn); setMaxP(mx); setPg(1); if (mobF) setMobF(false); }}
                    >
                      <div className="sb-box-l">{l}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="sb-section">
                <div className="sb-lbl">🎨 COLOURS</div>
                <div className="clr-swatch-g">
                  {COLS.map((c) => (
                    <div
                      key={c.n}
                      className={`clr-swatch-c${colorFilter === c.n ? " on" : ""}`}
                      onClick={() => { setColorFilter(prev => prev === c.n ? '' : c.n); setPg(1); }}
                      title={c.n}
                    >
                      <div className="clr-swatch-in" style={{ background: c.h }} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="sb-section">
                <div className="sb-lbl">↕️ SORT PRODUCTS</div>
                <select className="sort-sel-v2" value={sort} onChange={(e) => setSort(e.target.value)}>
                  <option value="default">Default — Featured</option>
                  <option value="pa">Price: Low → High</option>
                  <option value="pd">Price: High → Low</option>
                  <option value="rt">⭐ Top Rated</option>
                  <option value="nw">🆕 Newest First</option>
                </select>
              </div>

              {mobF && (
                <button className="btn-p" style={{ width: '100%', marginTop: 20 }} onClick={() => setMobF(false)}>Show Items</button>
              )}
            </div>
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

        .catalog-header { margin-bottom: 40px; }
        .catalog-title { font-size: 32px; font-weight: 900; color: #0f172a; margin-bottom: 6px; letter-spacing: -0.03em; }

        .products-layout { display: grid; grid-template-columns: 280px 1fr; gap: 40px; align-items: start; }
        
        .sidebar { background: white; border: 1px solid #e2e8f0; border-radius: 20px; overflow: hidden; position: sticky; top: 100px; box-shadow: 0 10px 30px rgba(0,0,0,0.04); }
        .sb-top-hd { background: #0f172a; color: #1e293b; padding: 20px; font-size: 13px; font-weight: 900; letter-spacing: 2px; text-align: center; border-bottom: 1px solid #1e293b; }
        .sb-top-hd { color: #5eead4; } /* Teal text for header as in screenshot */
        
        .sb-inner { padding: 25px; }
        .sb-header { display: flex; justify-content: flex-end; margin-bottom: 20px; }
        .sb-clear { background: none; border: none; font-size: 11px; font-weight: 800; color: #ef4444; cursor: pointer; text-transform: uppercase; letter-spacing: 1px; }

        .sb-section { margin-bottom: 35px; border-top: 1px solid #f1f5f9; padding-top: 25px; }
        .sb-section:first-of-type { border-top: none; padding-top: 0; }
        
        .sb-lbl { font-size: 12px; font-weight: 900; color: #0f172a; margin-bottom: 20px; display: inline-block; border-bottom: 2px solid #0f172a; padding-bottom: 4px; text-transform: uppercase; letter-spacing: 1px; }
        
        .sb-box-list { display: flex; flex-direction: column; gap: 8px; }
        .sb-box-item { display: flex; justify-content: space-between; align-items: center; padding: 14px 18px; background: #ffffff; border: 1.5px solid #e2e8f0; border-radius: 14px; cursor: pointer; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); font-size: 15px; color: #64748b; font-weight: 600; }
        .sb-box-item:hover { border-color: #cbd5e1; background: #f8fafc; }
        .sb-box-item.on { background: #0f172a; border-color: #0f172a; color: #5eead4; box-shadow: 0 8px 20px rgba(15,23,42,0.15); }
        .sb-box-item.on .sb-box-r { background: #1e293b; color: #5eead4; }
        
        .sb-box-l { display: flex; align-items: center; }
        .sb-box-r { font-size: 11px; background: #f1f5f9; padding: 2px 8px; border-radius: 8px; color: #94a3b8; }

        .clr-swatch-g { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; }
        .clr-swatch-c { width: 36px; height: 36px; border-radius: 10px; border: 2px solid #e2e8f0; padding: 3px; cursor: pointer; transition: all 0.2s; }
        .clr-swatch-c:hover { transform: scale(1.1); border-color: #cbd5e1; }
        .clr-swatch-c.on { border-color: #008080; background: #f0fafa; }
        .clr-swatch-in { width: 100%; height: 100%; border-radius: 6px; }

        .sort-sel-v2 { width: 100%; padding: 14px; border: 1.5px solid #e2e8f0; border-radius: 14px; font-size: 14px; font-weight: 600; color: #334155; background: #ffffff; outline: none; transition: border-color 0.2s; }
        .sort-sel-v2:focus { border-color: #008080; }

        @media (max-width: 1024px) {
          .products-layout { grid-template-columns: 1fr; }
          .sidebar { position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 10000; border-radius: 0; display: none; overflow-y: auto; }
          .sidebar.mob-on { display: block; }
          .mob-filter-btn { display: flex !important; }
        }
      `}</style>
    </div >
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
