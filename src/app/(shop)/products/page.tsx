"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import ExpandableDescription from "@/components/ExpandableDescription";
import { fmt } from "@/lib/data";
import { useApp } from "@/context/AppContext";
import { findCategoryBySlug, flattenCategoryTree, productMatchesCategory } from "@/lib/categoryUtils";

function ProductsContent() {
  const searchParams = useSearchParams();
  const initCat = searchParams.get("cat") || "all";
  const initColor = searchParams.get("color") || "";
  const initGen = searchParams.get("gender")?.toLowerCase() || "all";
  const initSize = searchParams.get("size") || "";
  const initFabric = searchParams.get("fabric") || "";
  const initFit = searchParams.get("fit") || "";
  const initType = searchParams.get("type") || "";
  const { products, banners, categoryTree, colors, sizes } = useApp();

  const [cat, setCat] = useState(initCat);
  const [gen, setGen] = useState(initGen);
  const [typeFilter, setTypeFilter] = useState(initType);
  const [sort, setSort] = useState("default");
  const [minP, setMinP] = useState(searchParams.get("minP") || "");
  const [maxP, setMaxP] = useState(searchParams.get("maxP") || "");
  const [colorFilter, setColorFilter] = useState(initColor);
  const [sizeFilter, setSizeFilter] = useState(initSize);
  const [fabricFilter, setFabricFilter] = useState(initFabric);
  const [fitFilter, setFitFilter] = useState(initFit);
  const [pg, setPg] = useState(1);
  const [mobF, setMobF] = useState(false);

  const router = useRouter();

  // Extract unique fabrics and fits respecting gender boundaries
  const genderFilteredProducts = products.filter(p => {
    const pGens = (p.gen || "men").toLowerCase().split(',').map((s: string) => s.trim());
    if (gen !== "all" && !pGens.includes(gen.toLowerCase())) return false;
    return true;
  });

  const fabrics = Array.from(new Set(
    genderFilteredProducts.map(p => p.fab).filter((f): f is string => !!f)
  )).sort();

  const fits = Array.from(new Set(
    genderFilteredProducts.map(p => p.fit).filter(Boolean)
  )).sort();

  useEffect(() => {
    setCat(initCat);
    setColorFilter(initColor);
    setSizeFilter(initSize);
    setFabricFilter(initFabric);
    setFitFilter(initFit);
    setGen(initGen);
    setTypeFilter(initType);
    setMinP(searchParams.get("minP") || "");
    setMaxP(searchParams.get("maxP") || "");
    setPg(1);
  }, [initCat, initColor, initSize, initFabric, initFit, initGen, initType, searchParams]);

  const updateURL = (params: Record<string, string | null>) => {
    const newParams = new URLSearchParams(searchParams.toString());
    Object.entries(params).forEach(([key, val]) => {
      if (val === null || val === "" || val === "all") newParams.delete(key);
      else newParams.set(key, val);
    });
    router.push(`/products?${newParams.toString()}`, { scroll: false });
  };

  const PER = 9;

  // 1. COLLECT ALL INDIVIDUAL VARIANT ENTRIES
  let flattened: any[] = [];
  products.forEach(p => {
    if (p.clrs && p.clrs.length > 0) {
      p.clrs.forEach((colorHex, idx) => {
        flattened.push({
          ...p,
          variantId: `${p.id}-${idx}`,
          displayColorHex: colorHex,
          displayColorName: p.clrNms?.[idx] || "",
          displayImage: p.clrImgs?.[colorHex]?.[0] || p.imgs?.[0],
          allColors: p.clrs // Keep this so they can still switch inside the PDP
        });
      });
    } else {
      flattened.push({ ...p, variantId: p.id });
    }
  });

  // 2. APPLY FILTERS TO FLATTENED LIST
  let f = flattened.filter((p) => {
    // Gender Filter
    const pGens = (p.gen || "men").toLowerCase().split(',').map((s: string) => s.trim());
    if (gen !== "all" && !pGens.includes(gen.toLowerCase())) return false;

    // Category Filter
    if (cat !== "all" && !productMatchesCategory(p, cat, categoryTree)) return false;

    // Type Filter (used by home page "Shop by Category" cards — e.g. ?type=scrubs)
    if (typeFilter) {
      const pType = p.type?.toLowerCase() || "";
      const tFilter = typeFilter.toLowerCase();
      if (tFilter === "underscrubs" || tFilter === "underscrub") {
        if (pType !== "underscrubs" && pType !== "underscrub") return false;
      } else if (tFilter === "tshirts" || tFilter === "tshirt") {
        if (pType !== "tshirts" && pType !== "tshirt" && pType !== "cotton-crew-tshirt") return false;
      } else if (pType !== tFilter) {
        return false;
      }
    }

    // Price Filter
    if (minP && p.price < parseInt(minP)) return false;
    if (maxP && p.price > parseInt(maxP)) return false;

    // Color Filter (Matches specific variant color)
    if (colorFilter) {
      if (p.displayColorName.toLowerCase() !== colorFilter.toLowerCase() &&
        p.displayColorHex.toLowerCase() !== colorFilter.toLowerCase()) {
        return false;
      }
    }

    // Size Filter
    if (sizeFilter) {
      const sizeMatch = (p as any).sizes?.some((s: string) => s.toUpperCase() === sizeFilter.toUpperCase()) ||
        (p as any).variants?.some((v: any) => v.size?.toUpperCase() === sizeFilter.toUpperCase());
      if (!sizeMatch) return false;
    }

    // Fabric Filter
    if (fabricFilter && p.fab?.toLowerCase() !== fabricFilter.toLowerCase()) return false;

    // Fit Filter
    if (fitFilter && p.fit?.toLowerCase() !== fitFilter.toLowerCase()) return false;

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
    setTypeFilter("");
    setSort("default");
    setMinP("");
    setMaxP("");
    setColorFilter("");
    setSizeFilter("");
    setFabricFilter("");
    setFitFilter("");
    setPg(1);
    router.push('/products', { scroll: false });
  };

  const hasFilters = cat !== "all" || gen !== "all" || minP || maxP || colorFilter || sizeFilter || fabricFilter || fitFilter || !!typeFilter;

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
    "surgical-cap": {
      ico: "🧢",
      l: "Surgical Cap",
      d: "Complete your professional look with our range of high-quality caps, compression socks, and other healthcare essentials."
    }
  };
  const catKey = cat.toLowerCase();
  const genKey = gen.toLowerCase();
  // isSurgical = only when browsing Surgical Wear parent tree
  // men-surgeon-gown / women-surgeon-cap belong to Men/Women trees, NOT Surgical Wear
  const isSurgical = catKey === "surgical-wear" ||
    catKey === "surgical-surgeon-gown" || catKey === "surgical-surgeon-cap";

  let activeRootSlugs = ["men", "women", "surgical-wear", "bulk-orders"];
  if (isSurgical) activeRootSlugs = ["surgical-wear"];
  else if (genKey === "men") activeRootSlugs = ["men"];
  else if (genKey === "women") activeRootSlugs = ["women"];

  const cats = [
    { id: "all", ico: "🏷️", l: "Complete Collection", n: products.length, depth: 0 },
    { id: "flexi-fit-v-scrub", ico: "🏷️", l: "Flexi Fit V Scrub", n: products.filter(p => productMatchesCategory(p, "flexi-fit-v-scrub", categoryTree)).length, depth: 0 },
    { id: "cotton-tshirt", ico: "🏷️", l: "Cotton Crew T-Shirt", n: products.filter(p => productMatchesCategory(p, "cotton-tshirt", categoryTree)).length, depth: 0 },
    { id: "full-sleeve", ico: "🏷️", l: "Full Sleeve Compression Underscrub", n: products.filter(p => productMatchesCategory(p, "full-sleeve", categoryTree)).length, depth: 0 },
    { id: "surgeon-gown", ico: "🏷️", l: "Surgical Gown", n: products.filter(p => productMatchesCategory(p, "surgeon-gown", categoryTree)).length, depth: 0 },
    { id: "surgeon-cap", ico: "🏷️", l: "Surgical Cap", n: products.filter(p => productMatchesCategory(p, "surgeon-cap", categoryTree)).length, depth: 0 },
  ].filter(c => c.id === "all" || c.n > 0);

  let rawCatLabel = cat !== 'all' ? (findCategoryBySlug(categoryTree, cat)?.name || cat.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')) : null;

  // Type-based label for home page category cards
  const typeLabels: Record<string, string> = {
    scrubs: 'All Scrub Suits',
    tshirts: 'All Cotton T-Shirts',
    underscrubs: 'All Under Scrubs',
    'surgical-gown': 'All Surgical Gowns',
    'surgical-cap': 'All Surgical Caps',
  };
  const typeLabelActive = typeFilter ? (typeLabels[typeFilter.toLowerCase()] || typeFilter) : null;

  let activeCatLabel = typeLabelActive || cats.find((c: any) => c.id === cat)?.l || rawCatLabel || (gen !== 'all' ? (gen.charAt(0).toUpperCase() + gen.slice(1) + " Collection") : "All Products");

  const S3 = "https://d2tnzshqdaedbc.cloudfront.net";

  // Direct banner filename lookup for under scrub categories — exact S3 uploaded filenames
  // Men (All Under Scrubs + Full Sleeve)  → men-full-sleeve-compression-under-scrub-banner.jpg
  // Women (All Under Scrubs + Full Sleeve) → women-full-sleeve-compression-under-scrub-banner.jpg
  const underscrubBannerMap: Record<string, string> = {
    "men-underscrub":                           `${S3}/men-full-sleeve-compression-under-scrub-banner`,
    "men-full-sleeve-compression-underscrub":   `${S3}/men-full-sleeve-compression-under-scrub-banner`,
    "women-underscrub":                         `${S3}/women-full-sleeve-compression-under-scrub-banner`,
    "women-full-sleeve-compression-underscrub": `${S3}/women-full-sleeve-compression-under-scrub-banner`,
  };
  const isUnderscrubCat = catKey in underscrubBannerMap || typeFilter === "underscrubs" || typeFilter === "underscrub";

  // Normalize cat for banner filenames (used for non-special categories)
  let bannerCat = catKey !== "all" ? catKey : (typeFilter || "all");
  if (bannerCat === "tshirts" || bannerCat === "tshirt" || bannerCat.includes("t-shirt") || bannerCat.includes("tshirt")) {
    bannerCat = "cotton-crew-tshirt";
  } else if (bannerCat.includes("surgeon-gown") || bannerCat.includes("surgical-gown")) {
    bannerCat = "surgeon-gown";
  } else if (bannerCat.includes("surgeon-cap") || bannerCat.includes("surgical-cap")) {
    bannerCat = "surgeon-cap";
  } else if (bannerCat.includes('scrub') && !bannerCat.includes('underscrub')) {
    bannerCat = 'scrub-suit';
  }

  const isTypeOrCatActive = bannerCat !== "all";

  // Strip gender prefixes/suffixes from bannerCat for cleaner S3 matching
  bannerCat = bannerCat
    .replace(/^men-/, '')
    .replace(/^women-/, '')
    .replace(/-men$/, '')
    .replace(/-women$/, '')
    .replace(/^surgical-/, '');

  // 100% DYNAMIC BANNER LOGIC (Ecommerce Priority System)
  const genName = genKey !== "all" ? genKey.charAt(0).toUpperCase() + genKey.slice(1) : "";
  const titlePrefix = genName ? `${genName}'s ` : "";

  // Prevent double naming (e.g. "Men's Scrub Suit Men")
  const safeTitle = (activeCatLabel.includes(genName) && genName !== "") ? activeCatLabel : `${titlePrefix}${activeCatLabel}`;

  // Exact S3 filenames lookup for surgical gown/cap — matches what was uploaded
  const surgicalBannerMap: Record<string, string> = {
    "men-gown":   `${S3}/men-surgical-gown-banner`,
    "men-cap":    `${S3}/men-surgical-cap-banner`,
    "women-gown": `${S3}/women-surgeon-gown-banner`,
    "women-cap":  `${S3}/women-surgeon-cap-banner`,
    "all-gown":   `${S3}/surgeon-gown-banner`,
    "all-cap":    `${S3}/surgeon-cap-banner`,
  };
  const isGownCat = bannerCat === "surgeon-gown";
  const isCapCat  = bannerCat === "surgeon-cap";

  let staticBannerBase: string | null = null;
  let staticBannerTitle = "";

  if (isSurgical) {
    if (isGownCat || isCapCat) {
      const lookupKey = `${genKey !== "all" ? genKey : "all"}-${isGownCat ? "gown" : "cap"}`;
      staticBannerBase = surgicalBannerMap[lookupKey] ?? `${S3}/surgical-wear-banner`;
    } else if (genKey === "women") {
      staticBannerBase = `${S3}/women-surgical-wear-banner`;
    } else {
      staticBannerBase = `${S3}/surgical-wear-banner`;
    }
    staticBannerTitle = safeTitle;
  } else if (isTypeOrCatActive && genKey !== "all") {
    // Gender + Category: underscrub direct map, gown/cap map, then generic
    if (isUnderscrubCat) {
      staticBannerBase = underscrubBannerMap[catKey] ?? underscrubBannerMap[`${genKey}-underscrub`] ?? `${S3}/${genKey}-underscrub-banner`;
    } else if (isGownCat || isCapCat) {
      const lookupKey = `${genKey}-${isGownCat ? "gown" : "cap"}`;
      staticBannerBase = surgicalBannerMap[lookupKey] ?? `${S3}/${genKey}-${bannerCat}-banner`;
    } else {
      staticBannerBase = `${S3}/${genKey}-${bannerCat}-banner`;
    }
    staticBannerTitle = safeTitle;
  } else if (isTypeOrCatActive) {
    // General Category: check gown/cap map
    if (isGownCat || isCapCat) {
      const lookupKey = `all-${isGownCat ? "gown" : "cap"}`;
      staticBannerBase = surgicalBannerMap[lookupKey] ?? `${S3}/${bannerCat}-banner`;
    } else if (isUnderscrubCat) {
      staticBannerBase = `${S3}/men-full-sleeve-compression-under-scrub-banner`;
    } else {
      staticBannerBase = `${S3}/${bannerCat}-banner`;
    }
    staticBannerTitle = activeCatLabel;
  } else if (genKey !== "all") {
    staticBannerBase = `${S3}/${genKey}-banner`;
    staticBannerTitle = `${genName}'s Collection`;
  } else {
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

  const activeDesc = typeConfigs[cat !== "all" ? cat : typeFilter]?.d || descMap[staticBannerTitle] || genericDesc;

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
        {/* Breadcrumb ... (rest of JSX) */}
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
          <h1 className="catalog-title" style={{ fontSize: '28px', marginBottom: '15px' }}>{staticBannerTitle}</h1>
          <div style={{ width: '60px', height: '4px', background: '#008080', marginBottom: '25px', borderRadius: '2px' }}></div>
          <ExpandableDescription
            text={activeDesc}
            className="catalog-subtitle"
            style={{ maxWidth: '800px', fontSize: '19px', lineHeight: '1.7', color: '#475569', fontWeight: 400 }}
          />
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
              {/* GENDER */}
              <div className="sb3-section">
                <div className="sb3-sec-hd">GENDER</div>
                <div className="sb3-list">
                  {[
                    ["all", "All"],
                    ["men", "Men"],
                    ["women", "Women"]
                  ].map(([v, l]) => (
                    <div
                      key={v}
                      className={`sb3-item${gen === v ? " active" : ""}`}
                      onClick={() => { updateURL({ gender: v, pg: "1" }); if (mobF) setMobF(false); }}
                    >
                      <div className="sb3-check-box" />
                      <span className="sb3-label">{l}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CATEGORIES */}
              <div className="sb3-section">
                <div className="sb3-sec-hd">CATEGORIES</div>
                <div className="sb3-list">
                  {cats.map((c) => (
                    <div
                      key={c.id}
                      className={`sb3-item${cat === c.id ? " active" : ""}`}
                      onClick={() => { updateURL({ cat: c.id, pg: "1" }); if (mobF) setMobF(false); }}
                      style={{ paddingLeft: c.depth * 14 }}
                    >
                      <div className="sb3-check-box" />
                      <span className="sb3-label">{c.l}</span>
                      <span className="sb3-num">{c.n}</span>
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
                      onClick={() => { updateURL({ minP: mn, maxP: mx, pg: "1" }); if (mobF) setMobF(false); }}
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
                  {(colors.length ? colors : []).map((c: any) => (
                    <div
                      key={c.name}
                      className={`sb3-color-item${colorFilter === c.name ? " active" : ""}`}
                      onClick={() => { updateURL({ color: colorFilter === c.name ? "" : c.name, pg: "1" }); }}
                    >
                      <div className="sb3-color-dot" style={{ background: c.hexCode }} />
                      <span className="sb3-color-name">{c.name}</span>
                      {colorFilter === c.name && (
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
                  {(sizes.length ? sizes : [{ sizeValue: "XS" }, { sizeValue: "S" }, { sizeValue: "M" }, { sizeValue: "L" }, { sizeValue: "XL" }, { sizeValue: "2XL" }]).map((s: any) => {
                    const val = s.sizeValue || s.name;
                    return (
                      <button
                        key={val}
                        onClick={() => { updateURL({ size: sizeFilter === val ? '' : val, pg: "1" }); }}
                        style={{
                          padding: '6px 14px', borderRadius: 8, fontSize: 13, fontWeight: 700,
                          border: sizeFilter === val ? '2px solid #008080' : '1.5px solid #e2e8f0',
                          background: sizeFilter === val ? '#008080' : 'white',
                          color: sizeFilter === val ? 'white' : '#475569',
                          cursor: 'pointer', transition: 'all 0.15s',
                        }}
                      >
                        {val}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* FABRIC */}
              {fabrics.length > 0 && (
                <div className="sb3-section">
                  <div className="sb3-sec-hd">FABRIC</div>
                  <div className="sb3-list">
                    {fabrics.map((f: string) => (
                      <div
                        key={f}
                        className={`sb3-item${fabricFilter.toLowerCase() === f.toLowerCase() ? " active" : ""}`}
                        onClick={() => {
                          updateURL({ fabric: fabricFilter.toLowerCase() === f.toLowerCase() ? "" : f, pg: "1" });
                          if (mobF) setMobF(false);
                        }}
                      >
                        <div className="sb3-check-box" />
                        <span className="sb3-label">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* FIT */}
              {fits.length > 0 && (
                <div className="sb3-section">
                  <div className="sb3-sec-hd">FIT</div>
                  <div className="sb3-list">
                    {fits.map((f: string) => (
                      <div
                        key={f}
                        className={`sb3-item${fitFilter.toLowerCase() === f.toLowerCase() ? " active" : ""}`}
                        onClick={() => {
                          updateURL({ fit: fitFilter.toLowerCase() === f.toLowerCase() ? "" : f, pg: "1" });
                          if (mobF) setMobF(false);
                        }}
                      >
                        <div className="sb3-check-box" />
                        <span className="sb3-label">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
                  {typeFilter && cat === "all" && (
                    <span className="af-tag">
                      {typeLabelActive}
                      <span
                        className="af-x"
                        onClick={() => {
                          setTypeFilter("");
                          setPg(1);
                          updateURL({ type: null });
                        }}
                      >
                        ✕
                      </span>
                    </span>
                  )}
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
                  {fabricFilter && (
                    <span className="af-tag">
                      🧵 {fabricFilter}
                      <span
                        className="af-x"
                        onClick={() => {
                          updateURL({ fabric: "", pg: "1" });
                        }}
                      >
                        ✕
                      </span>
                    </span>
                  )}
                  {fitFilter && (
                    <span className="af-tag">
                      👕 {fitFilter}
                      <span
                        className="af-x"
                        onClick={() => {
                          updateURL({ fit: "", pg: "1" });
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
                  <ProductCard key={p.variantId} p={p} forceColor={p.displayColorHex} />
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
/* pg-3 now handled by global responsive logic */
        
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

        /* SQUARE PRODUCT CARDS — Using Global Grid Classes */
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
    <>
      <div className="cat-banner">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={title}
          onError={tryNext}
          className="cat-banner-img"
        />
      </div>
      <style jsx>{`
        .cat-banner {
          width: 100%;
          margin-bottom: 30px;
          border-radius: 20px;
          overflow: hidden;
          position: relative;
          box-shadow: 0 4px 20px rgba(0,0,0,0.06);
          background: #f1f5f9;
          aspect-ratio: 1600 / 420;
        }
        .cat-banner-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 20%;
          display: block;
        }
        @media (max-width: 768px) {
          .cat-banner {
            aspect-ratio: 1600 / 450;
            border-radius: 12px;
          }
        }
        @media (max-width: 480px) {
          .cat-banner {
            aspect-ratio: 1600 / 500;
          }
        }
      `}</style>
    </>
  );
}


function SearchParamsKeyWrapper() {
  const searchParams = useSearchParams();
  const key = `${searchParams.get("cat")}-${searchParams.get("gender")}`;
  return <ProductsContent key={key} />;
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div>Loading products...</div>}>
      <SearchParamsKeyWrapper />
    </Suspense>
  );
}
