"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { COLS, fmt } from "@/lib/data";
import { useApp } from "@/context/AppContext";

function ProductsContent() {
  const searchParams = useSearchParams();
  const initCat = searchParams.get("cat") || "all";
  const initColor = searchParams.get("color") || "";
  const initGen = searchParams.get("gender")?.toLowerCase() || "all";
  const initSize = searchParams.get("size") || "";
  const { products, banners } = useApp();

  const [cat, setCat] = useState(initCat);
  const [gen, setGen] = useState(initGen);
  const [sort, setSort] = useState("default");
  const [minP, setMinP] = useState("");
  const [maxP, setMaxP] = useState("");
  const [colorFilter, setColorFilter] = useState(initColor);
  const [sizeFilter, setSizeFilter] = useState(initSize);
  const [pg, setPg] = useState(1);
  const [mobF, setMobF] = useState(false);

  useEffect(() => {
    setCat(initCat);
    setColorFilter(initColor);
    setSizeFilter(initSize);
    setGen(initGen);
    setPg(1);
  }, [initCat, initColor, initSize, initGen]);

  const PER = 9;

  let f = products.filter((p) => {
    if (cat !== "all" && p.type !== cat) return false;
    // Case-insensitive gender comparison — fixes men/women redirect bug
    const pGen = (p.gen || "").toLowerCase();
    if (gen !== "all" && pGen !== "unisex" && pGen !== gen.toLowerCase()) return false;
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
    if (sizeFilter) {
      const sizeMatch = (p as any).sizes?.some((s: string) =>
        s.toUpperCase() === sizeFilter.toUpperCase()
      ) || (p as any).variants?.some((v: any) =>
        v.size?.toUpperCase() === sizeFilter.toUpperCase()
      );
      if (!sizeMatch) return false;
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
    setSizeFilter("");
    setPg(1);
  };

  const hasFilters = cat !== "all" || gen !== "all" || minP || maxP || colorFilter || sizeFilter;

  const typeConfigs: Record<string, { ico: string; l: string; d: string }> = {
    scrubs: {
      ico: "🥼",
      l: "Premium Scrubs",
      d: "Our signature scrubs are engineered with specialized fabric that is anti-microbial, moisture-wicking, and features a four-way stretch for maximum comfort during long shifts."
    },
    stethoscope: {
      ico: "🩺",
      l: "Diagnostic Tools",
      d: "Precision-engineered stethoscopes and diagnostic tools designed for healthcare professionals who demand accuracy and durability."
    },
    jacket: {
      ico: "🧥",
      l: "Performance Jackets",
      d: "Stay warm and professional in chilly hospital environments with our DRIFT jackets, featuring breathable insulation and a sleek fit."
    },
    underscrub: {
      ico: "👕",
      l: "Elite Underscrubs",
      d: "Specifically designed to be worn under your scrubs, these moisture-wicking layers provide extra warmth and comfort without the bulk."
    },
    surgical: {
      ico: "✂️",
      l: "Surgical Wear",
      d: "High-performance surgical gowns and apparel designed to meet the rigorous standards of the operating room environment."
    },
    accessories: {
      ico: "🧢",
      l: "Essential Accessories",
      d: "Complete your professional look with our range of high-quality caps, compression socks, and other healthcare essentials."
    }
  };

  const uniqueTypes = Array.from(new Set(products.map((p) => p.type)));

  const allBaseTypes = Object.keys(typeConfigs);
  const extraTypes = uniqueTypes.filter(t => !typeConfigs[t]);
  const allTypesToRender = [...allBaseTypes, ...extraTypes];

  const dynamicCats = allTypesToRender.map((t: string) => ({
    id: t,
    ico: typeConfigs[t]?.ico || '🏷️',
    l: typeConfigs[t]?.l || t.charAt(0).toUpperCase() + t.slice(1),
    n: products.filter(p => p.type === t).length
  }));

  const cats = [
    { id: "all", ico: "🏷️", l: "Complete Collection", n: products.length },
    ...dynamicCats
  ].filter(c => c.n > 0);

  let rawCatLabel = cat !== 'all' ? cat.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : null;
  let activeCatLabel = cats.find((c: any) => c.id === cat)?.l || rawCatLabel || (gen !== 'all' ? (gen.charAt(0).toUpperCase() + gen.slice(1) + " Collection") : "All Products");

  let staticBannerBase: string | null = null;
  let staticBannerTitle = "";

  const S3 = "https://d2tnzshqdaedbc.cloudfront.net";
  const catKey = cat.toLowerCase();
  const genKey = gen.toLowerCase();

  const isSurgical = ["surgical-wear", "surgeon-cap", "surgeon-gown", "gowns", "caps"].includes(catKey);

  // Normalize cat for banner filenames
  let bannerCat = catKey;
  if (catKey.includes('t-shirt')) bannerCat = catKey.replace('t-shirt', 'tshirt');
  if (catKey.includes('under-scrub')) bannerCat = 'full-sleeve-compression-under-scrub';
  if (catKey === 'scrubs') bannerCat = 'scrub-suit';

  // 100% DYNAMIC BANNER LOGIC (Ecommerce Priority System)
  if (isSurgical) {
    staticBannerBase = `${S3}/surgical-wear-banner`;
    staticBannerTitle = genKey !== "all" ? `${genKey.charAt(0).toUpperCase() + genKey.slice(1)}'s ${activeCatLabel}` : activeCatLabel;
  } else if (catKey !== "all" && genKey !== "all") {
    // Try Gender-Specific Category Banners (Men's Scrubs, etc)
    staticBannerBase = `${S3}/${genKey}-${bannerCat}-banner`;
    staticBannerTitle = `${genKey.charAt(0).toUpperCase() + genKey.slice(1)}'s ${activeCatLabel}`;
  } else if (catKey !== "all") {
    // Try General Category Banners
    staticBannerBase = `${S3}/${bannerCat}-banner`;
    staticBannerTitle = activeCatLabel;
  } else if (genKey !== "all") {
    // Gender Landing (Men's Collection)
    staticBannerBase = `${S3}/${genKey}-banner`;
    staticBannerTitle = `${gen.charAt(0).toUpperCase() + gen.slice(1)}'s Collection`;
  }
  else {
    // The mother of all banners
    staticBannerBase = `${S3}/all-products-banner`;
    staticBannerTitle = "The Medvastr Collection";
  }

  // DYNAMIC DESCRIPTION
  const genericDesc = `Experience the perfect blend of style, comfort, and professional utility with our ${activeCatLabel.toLowerCase()}. Every piece is designed specifically for healthcare heroes.`;

  const descMap: Record<string, string> = {
    "Men's Collection": "Engineered for excellence and performance, our men's collection combines rugged durability with a professional fit that respects the demands of your profession.",
    "Women's Collection": "Designed for the modern healthcare hero, our women's collection offers a perfect blend of sophisticated style, functional design, and ultimate comfortable movement.",
    "The Medvastr Collection": "Explore our complete range of premium medical apparel and equipment, each piece reflecting our decade-long commitment to those who care for others.",
    "Surgical Wear": "Engineered for the highest standards of safety and comfort in the operating room. Our surgical collection is designed to provide maximum barrier protection while allowing for unrestricted movement."
  };

  const activeDesc = typeConfigs[cat]?.d || descMap[staticBannerTitle] || genericDesc;
  return (
    <div className="page" style={{ background: '#ffffff' }}>
      {staticBannerBase && (
        <SmartBanner
          key={staticBannerBase}
          base={staticBannerBase}
          title={staticBannerTitle}
        />
      )}
      <div className="sec" style={{ paddingBottom: 60 }}>
        {/* Breadcrumb */}
        <div className="breadcrumb" style={{ marginBottom: 35 }}>
          <Link href="/">Home</Link>
          <span className="sep">/</span>
          <Link href="/products">Shop</Link>
          {gen !== "all" && (
            <>
              <span className="sep">/</span>
              <Link href={`/products?gender=${gen}`}>{gen.charAt(0).toUpperCase() + gen.slice(1)}</Link>
            </>
          )}
          {cat !== "all" && (
            <>
              <span className="sep">/</span>
              <span className="active">{activeCatLabel}</span>
            </>
          )}
        </div>

        <div className="catalog-header" style={{ marginBottom: 50 }}>
          <h2 className="catalog-title" style={{ fontSize: '28px', marginBottom: '15px' }}>{staticBannerTitle}</h2>
          <div style={{ width: '60px', height: '4px', background: '#008080', marginBottom: '25px', borderRadius: '2px' }}></div>
          <p className="catalog-subtitle" style={{ maxWidth: '800px', fontSize: '19px', lineHeight: '1.7', color: '#475569', margin: 0, fontWeight: 400 }}>
            {activeDesc}
          </p>
        </div>

        <button className="mob-filter-btn" onClick={() => setMobF(true)}>
          <span style={{ fontSize: 18 }}>⚙️</span> Show Filters
        </button>

        <div className="products-layout">
          {/* SIDEBAR */}
          <div className={`sidebar-v3${mobF ? " mob-on" : ""}`}>
            <div className="sb3-header">
              <div className="sb3-title-wrap">
                <span className="sb3-title">FILTERS</span>
                {hasFilters && <span className="sb3-count">{[cat !== "all", gen !== "all", !!(minP || maxP), !!colorFilter, !!sizeFilter].filter(Boolean).length}</span>}
              </div>
              <button className="sb3-clear" onClick={reset}>Clear All</button>
              {mobF && <button className="sb3-mob-close" onClick={() => setMobF(false)}>✕</button>}
            </div>

            <div className="sb3-body">
              {/* CATEGORIES */}
              <div className="sb3-section">
                <div className="sb3-sec-hd">CATEGORIES</div>
                <div className="sb3-list">
                  {cats.map((c) => (
                    <div
                      key={c.id}
                      className={`sb3-item${cat === c.id ? " active" : ""}`}
                      onClick={() => { setCat(c.id); setPg(1); if (mobF) setMobF(false); }}
                    >
                      <div className="sb3-check-box" />
                      <span className="sb3-label">{c.l}</span>
                      <span className="sb3-num">{c.n}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* GENDER */}
              <div className="sb3-section">
                <div className="sb3-sec-hd">GENDER</div>
                <div className="sb3-list">
                  {[
                    ["all", "All"],
                    ["men", "Men"],
                    ["women", "Women"],
                    ["unisex", "Unisex"],
                  ].map(([v, l]) => (
                    <div
                      key={v}
                      className={`sb3-item${gen === v ? " active" : ""}`}
                      onClick={() => { setGen(v); setPg(1); if (mobF) setMobF(false); }}
                    >
                      <div className="sb3-check-box" />
                      <span className="sb3-label">{l}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* PRICE */}
              <div className="sb3-section">
                <div className="sb3-sec-hd">PRICE</div>
                <div className="sb3-list">
                  {[
                    ["Under ₹1000", "", "999"],
                    ["₹1000 - ₹2000", "1000", "2000"],
                    ["₹2000 - ₹3000", "2000", "3000"],
                    ["Above ₹3000", "3000", ""],
                  ].map(([l, mn, mx]) => (
                    <div
                      key={l}
                      className={`sb3-item${minP === mn && maxP === mx ? " active" : ""}`}
                      onClick={() => { setMinP(mn); setMaxP(mx); setPg(1); if (mobF) setMobF(false); }}
                    >
                      <div className="sb3-check-box" />
                      <span className="sb3-label">{l}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* COLORS */}
              <div className="sb3-section">
                <div className="sb3-sec-hd">COLOURS</div>
                <div className="sb3-color-grid">
                  {COLS.map((c) => (
                    <div
                      key={c.n}
                      className={`sb3-color-item${colorFilter === c.n ? " active" : ""}`}
                      onClick={() => { setColorFilter((prev: string) => prev === c.n ? '' : c.n); setPg(1); }}
                    >
                      <div className="sb3-color-dot" style={{ background: c.h }} />
                      <span className="sb3-color-name">{c.n}</span>
                      {colorFilter === c.n && (
                        <span style={{ marginLeft: 'auto', color: '#008080', fontWeight: 900, fontSize: 15 }}>✓</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* SIZES */}
              <div className="sb3-section">
                <div className="sb3-sec-hd">SIZE</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
                  {["XS", "S", "M", "L", "XL", "2XL"].map((s) => (
                    <button
                      key={s}
                      onClick={() => { setSizeFilter((prev: string) => prev === s ? '' : s); setPg(1); }}
                      style={{
                        padding: '6px 14px', borderRadius: 8, fontSize: 13, fontWeight: 700,
                        border: sizeFilter === s ? '2px solid #008080' : '1.5px solid #e2e8f0',
                        background: sizeFilter === s ? '#008080' : 'white',
                        color: sizeFilter === s ? 'white' : '#475569',
                        cursor: 'pointer', transition: 'all 0.15s',
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* SORT */}
              <div className="sb3-section">
                <div className="sb3-sec-hd">SORT BY</div>
                <select className="sb3-select" value={sort} onChange={(e) => setSort(e.target.value)}>
                  <option value="default">Default</option>
                  <option value="pa">Price: Low to High</option>
                  <option value="pd">Price: High to Low</option>
                  <option value="rt">⭐ Ratings</option>
                  <option value="nw">Newest Arrival</option>
                </select>
              </div>
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

        .mob-filter-btn { display: none; align-items: center; gap: 8px; background: #0f172a; color: white; border: none; padding: 12px 20px; border-radius: 8px; font-size: 14px; font-weight: 700; cursor: pointer; margin-bottom: 20px; }

        .products-layout { display: grid; grid-template-columns: 280px 1fr; gap: 40px; align-items: start; }
        .products-right { min-width: 0; }
        .pg-3 { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 24px; }
        
        /* MODERN SIDEBAR V3 */
        .sidebar-v3 { background: white; position: sticky; top: 120px; }
        .sb3-header { display: flex; align-items: center; justify-content: space-between; padding-bottom: 25px; border-bottom: 1px solid #f1f5f9; margin-bottom: 30px; }
        .sb3-title-wrap { display: flex; align-items: center; gap: 10px; }
        .sb3-title { font-size: 15px; font-weight: 900; color: #0f172a; letter-spacing: 1.5px; }
        .sb3-count { background: #ef4444; color: white; min-width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 900; }
        .sb3-clear { background: none; border: none; font-size: 12px; font-weight: 600; color: #64748b; cursor: pointer; text-decoration: underline; text-underline-offset: 4px; }
        .sb3-clear:hover { color: #ef4444; }

        .sb3-section { margin-bottom: 40px; }
        .sb3-sec-hd { font-size: 13px; font-weight: 900; color: #0f172a; margin-bottom: 20px; letter-spacing: 1.2px; }
        
        .sb3-list { display: flex; flex-direction: column; gap: 14px; }
        .sb3-item { display: flex; align-items: center; gap: 14px; cursor: pointer; transition: all 0.2s; }
        .sb3-check-box { width: 18px; height: 18px; border: 1.5px solid #cbd5e1; border-radius: 4px; transition: all 0.2s; position: relative; }
        .sb3-item.active .sb3-check-box { background: #008080; border-color: #008080; }
        .sb3-item.active .sb3-check-box::after { content: '✓'; position: absolute; color: white; font-size: 10px; left: 50%; top: 50%; transform: translate(-50%, -50%); }
        .sb3-label { font-size: 14px; font-weight: 500; color: #475569; transition: color 0.2s; }
        .sb3-item:hover .sb3-label { color: #008080; }
        .sb3-item.active .sb3-label { color: #0f172a; font-weight: 700; }
        .sb3-num { font-size: 12px; color: #94a3b8; margin-left: auto; font-weight: 500; }

        .sb3-color-grid { display: grid; grid-template-columns: 1fr; gap: 12px; }
        .sb3-color-item { display: flex; align-items: center; gap: 12px; cursor: pointer; }
        .sb3-color-dot { width: 14px; height: 14px; border-radius: 50%; border: 1px solid #e2e8f0; }
        .sb3-color-name { font-size: 14px; color: #475569; font-weight: 500; }
        .sb3-color-item.active .sb3-color-name { color: #0f172a; font-weight: 700; }

        .sb3-select { width: 100%; border: 1px solid #e2e8f0; padding: 12px 15px; border-radius: 4px; font-size: 14px; font-weight: 600; color: #334155; appearance: none; background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E") no-repeat right 15px center; background-size: 16px; cursor: pointer; transition: border 0.3s; }
        .sb3-select:focus { border-color: #008080; }

        /* SQUARE PRODUCT CARDS */
        .prod-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 30px; }
        .p-card { background: white; display: flex; flex-direction: column; overflow: hidden; position: relative; transition: transform 0.4s cubic-bezier(0.165, 0.84, 0.44, 1); border: 1.5px solid #f8fafc; }
        .p-card:hover { transform: translateY(-8px); border-color: #f1f5f9; box-shadow: 0 20px 40px rgba(0,0,0,0.05); }
        .p-img-box { position: relative; width: 100%; aspect-ratio: 1/1; overflow: hidden; background: #f9fafb; }
        .p-img-box img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s; }
        .p-card:hover .p-img-box img { transform: scale(1.08); }
        
        .p-info { padding: 20px 0; display: flex; flex-direction: column; gap: 8px; }
        .p-nm { font-size: 15px; font-weight: 800; color: #1e293b; line-height: 1.4; text-decoration: none; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; transition: color 0.2s; }
        .p-nm:hover { color: #008080; }
        .p-cat { font-size: 12px; color: #94a3b8; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px; }
        .p-footer { display: flex; align-items: center; justify-content: space-between; margin-top: 5px; }
        .p-prc { font-size: 18px; font-weight: 900; color: #0f172a; }
        
        .btn-add-p { background: none; border: 2px solid #0f172a; color: #0f172a; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; transition: all 0.2s; cursor: pointer; }
        .btn-add-p:hover { background: #0f172a; color: white; }

        @media (max-width: 1024px) {
          .mob-filter-btn { display: flex !important; }
          .products-layout { grid-template-columns: 1fr; }
          .sidebar-v3 { position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 10000; border-radius: 0; display: none; overflow-y: auto; padding: 40px 25px; }
          .sidebar-v3.mob-on { display: block; }
          .sb3-mob-close { display: block !important; position: absolute; right: 25px; top: 40px; background: none; border: none; font-size: 24px; }
        }
      `}</style>
    </div >
  );
}

// SmartBanner: always hides text, tries jpg/png/webp so your S3 upload always works
function SmartBanner({ base, title }: { base: string; title: string; }) {
  const [src, setSrc] = React.useState(base + ".jpg");
  const [failed, setFailed] = React.useState(false);

  React.useEffect(() => {
    setSrc(base + ".jpg");
    setFailed(false);
  }, [base]);

  const tryNext = () => {
    if (src.endsWith(".jpg")) { setSrc(base + ".png"); }
    else if (src.endsWith(".png")) { setSrc(base + ".webp"); }
    else { setFailed(true); }
  };

  if (failed) return null;

  return (
    <div
      className="cat-banner"
      style={{
        width: '100%',
        marginBottom: 30,
        borderRadius: 24,
        overflow: 'hidden',
        aspectRatio: '1600 / 600',
        position: 'relative',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        background: '#f1f5f9',
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={title}
        onError={tryNext}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />
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
