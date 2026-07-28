"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { fmt } from "@/lib/data";
import { NAV_DATA } from "@/lib/navData";
import DynamicNav from "./DynamicNav";
import BrandLogo from "./BrandLogo";

interface HeaderProps {
  onCart: () => void;
  onWish: () => void;
  onAcct: () => void;
  user: any;
}

export default function Header({ onCart, onWish, onAcct, user }: HeaderProps) {
  const { cart, wishlist, products, isHydrated } = useApp();
  const [q, setQ] = useState("");
  const [sd, setSd] = useState(false);
  const [mn, setMn] = useState(false); // Mobile Nav
  const [mS, setMs] = useState(false); // Mobile Search
  const [mo, setMo] = useState<string | null>(null); // Mobile Open Group

  const getSuggestions = () => {
    if (!q) return [];
    const query = q.trim().toLowerCase();
    
    // Check if query is exactly a gender category
    const isExactMen = query === "men" || query === "man" || query === "mens" || query === "mans";
    const isExactWomen = query === "women" || query === "woman" || query === "womens" || query === "womans";
    
    if (isExactMen) {
      return products.filter((p) => {
        const pGens = (p.gen || "men").toLowerCase().split(',').map((s: string) => s.trim());
        return pGens.includes("men") || pGens.includes("unisex");
      }).slice(0, 6);
    }
    
    if (isExactWomen) {
      return products.filter((p) => {
        const pGens = (p.gen || "men").toLowerCase().split(',').map((s: string) => s.trim());
        return pGens.includes("women") || pGens.includes("unisex");
      }).slice(0, 6);
    }

    // Determine targeted gender tags
    const isMenSearch = query.includes(" men ") || query.includes(" mens ") || query.includes(" man ") || query.includes(" mans ")
        || query.startsWith("men ") || query.startsWith("mens ") || query.startsWith("man ") || query.startsWith("mans ")
        || query.endsWith(" men") || query.endsWith(" mens") || query.endsWith(" man") || query.endsWith(" mans");
        
    const isWomenSearch = query.includes(" women ") || query.includes(" womens ") || query.includes(" woman ") || query.includes(" womans ")
        || query.startsWith("women ") || query.startsWith("womens ") || query.startsWith("woman ") || query.startsWith("womans ")
        || query.endsWith(" women") || query.endsWith(" womens") || query.endsWith(" woman") || query.endsWith(" womans");

    // Clean query (strip gender words)
    let cleanQuery = query;
    let requiredGender: string | null = null;
    let excludedGender: string | null = null;

    if (isMenSearch && !isWomenSearch) {
      requiredGender = "men";
      excludedGender = "women";
      cleanQuery = query.replace(/\b(men|man|mens|mans|for)\b/g, "").trim();
    } else if (isWomenSearch && !isMenSearch) {
      requiredGender = "women";
      excludedGender = "men";
      cleanQuery = query.replace(/\b(women|woman|womens|womans|for)\b/g, "").trim();
    }
    
    if (!cleanQuery) {
      cleanQuery = query;
    }

    const normClean = cleanQuery.replace(/[\s-]/g, "");

    return products.filter((p) => {
      const pGens = (p.gen || "men").toLowerCase().split(',').map((s: string) => s.trim());
      
      // Exclude opposite gender
      if (excludedGender && pGens.includes(excludedGender) && !pGens.includes("unisex")) {
        return false;
      }
      
      // If we require a gender, ensure it matches
      if (requiredGender && !pGens.includes(requiredGender) && !pGens.includes("unisex")) {
        return false;
      }

      // Strict keyword-to-name matching — prevents description false-positives
      // Each keyword must appear in the product NAME only
      const strictKeywords = [
        { key: "tshirt",     match: ["t-shirt", "tshirt"] },
        { key: "t-shirt",    match: ["t-shirt", "tshirt"] },
        { key: "underscrub", match: ["under scrub", "underscrub"] },
        { key: "under scrub",match: ["under scrub", "underscrub"] },
        { key: "scrub",      match: ["scrub"] },
        { key: "cap",        match: ["cap"] },
        { key: "gown",       match: ["gown"] },
        { key: "surgical",   match: ["surgical"] },
      ];

      const pNameLower = p.name.toLowerCase();

      // Check if any strict keyword matches the query
      for (const rule of strictKeywords) {
        if (normClean === rule.key.replace(/[\s-]/g, "")) {
          // Strict: product name must contain at least one of the match terms
          const nameHasMatch = rule.match.some(m => pNameLower.includes(m));
          // Extra guard for "scrub" alone: must NOT be solely a tshirt result
          if (rule.key === "scrub") {
            return nameHasMatch && !(
              pNameLower.includes("t-shirt") || pNameLower.includes("tshirt")
            );
          }
          return nameHasMatch;
        }
      }

      // Check if query contains a strict keyword (partial query like "flexi scrub")
      for (const rule of strictKeywords) {
        if (normClean.includes(rule.key.replace(/[\s-]/g, ""))) {
          return rule.match.some(m => pNameLower.includes(m));
        }
      }

      // Default fallback: match product NAME only (not description)
      // This prevents products with query in their description showing up
      return pNameLower.includes(cleanQuery);
    }).slice(0, 6);
  };

  const res = getSuggestions();

  const resolvedNav = NAV_DATA;
  const cc = cart.reduce((s, i) => s + i.qty, 0);
  const wc = wishlist.length;

  return (
    <div id="hdr">
      <div className="hdr-row">
        {/* Left: Mobile Toggle & Brand Logo */}
        <div className="hdr-logo-area">
          <button className="ha mob-only" onClick={() => setMn(true)}>
            ☰
          </button>
          <Link href="/" className="logo" style={{ display: "flex", alignItems: "center" }}>
            <BrandLogo dark={false} height={64} />
          </Link>
        </div>

        {/* Middle: Desktop Inline Navigation */}
        <div className="hdr-nav-inline mob-hide">
          <DynamicNav
            items={resolvedNav}
            mobileOpen={mn}
            onNavigate={() => setMn(false)}
            mobileGroup={mo}
            setMobileGroup={setMo}
          />
        </div>

        {/* Right: Premium Icon + Label Action Items */}
        <div className="hdr-acts">
          {/* Search Button */}
          <button 
            className="hdr-act-item" 
            onClick={() => setMs(!mS)} 
            title="Search"
          >
            <svg className="hdr-act-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <span className="hdr-act-lbl mob-hide">Search</span>
          </button>
          
          {/* Account / Login Button */}
          <button 
            className="hdr-act-item" 
            onClick={onAcct} 
            title={user ? `Account (${user.firstName || "User"})` : "Login"}
          >
            <svg className="hdr-act-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <span className="hdr-act-lbl mob-hide">
              {user ? (user.firstName || "Account") : "Login"}
            </span>
          </button>

          {/* Cart Button */}
          <button className="hdr-act-item cart-act-item" onClick={onCart} title="Cart">
            <div className="cart-icon-wrap">
              <svg className="hdr-act-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              {isHydrated && cc > 0 && <span className="cart-badge-dot">{cc}</span>}
            </div>
            <span className="hdr-act-lbl mob-hide">Cart</span>
          </button>
        </div>
      </div>

      {/* Slide-Down Animated Search Overlay */}
      {mS && (
        <div className="srch-overlay-bar">
          <div className="srch-overlay-inner">
            <span className="srch-ico">🔍</span>
            <input
              autoFocus
              placeholder="Search scrubs, surgical wear, caps, underscrubs..."
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setSd(true);
              }}
            />
            {q && (
              <span className="srch-clr" onClick={() => setQ("")}>
                ✕
              </span>
            )}
            <button className="srch-close-btn" onClick={() => setMs(false)}>
              Close ✕
            </button>

            {sd && q && (
              <div className="srch-drop" onMouseDown={(e) => e.preventDefault()}>
                {res.length === 0 ? (
                  <div className="s-empty">No results for "{q}"</div>
                ) : (
                  <>
                    <div className="s-hd">Products</div>
                    {res.map((p) => (
                      <Link
                        href={`/product/${p.slug || p.id}`}
                        className="s-row"
                        key={p.id}
                        onClick={() => {
                          setQ("");
                          setSd(false);
                          setMs(false);
                          setMn(false);
                        }}
                      >
                        <div className="s-thumb" style={{ background: p.bg, overflow: 'hidden' }}>
                          {p.imgs && p.imgs[0] ? (
                            <img src={p.imgs[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            p.emo
                          )}
                        </div>
                        <div>
                          <div className="s-nm">{p.name}</div>
                          <div className="s-pr">{fmt(p.price)}</div>
                        </div>
                      </Link>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile Nav Drawer */}
      <div className={`mob-drawer-ov${mn ? " on" : ""}`} onClick={() => setMn(false)} />
      <div id="nav" className={mn ? " mob-on" : ""}>
        <div className="mob-nav-hd mob-only">
          <img src="/logo.png" alt="Medvarn" style={{ height: "36px", width: "auto", objectFit: "contain" }} />
          <button type="button" className="mn-close" onClick={() => setMn(false)} style={{ touchAction: 'manipulation' }}>✕</button>
        </div>
        <DynamicNav
          items={resolvedNav}
          mobileOpen={mn}
          onNavigate={() => setMn(false)}
          mobileGroup={mo}
          setMobileGroup={setMo}
        />
      </div>

      <style jsx>{`
        @media (max-width: 1024px) {
          .mob-only { display: flex !important; }
          .mob-hide { display: none !important; }

          .mob-nav-hd {
            display: flex !important;
            padding: 18px 20px;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #e2e8f0;
            background: #ffffff;
            position: sticky;
            top: 0;
            z-index: 1;
          }
          .mob-nav-brand {
            font-size: 34px;
            font-weight: 900;
            color: #0f172a;
            letter-spacing: -1px;
          }
          .mn-close {
            width: 40px;
            height: 40px;
            background: #f1f5f9;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            color: #0f172a;
            cursor: pointer;
            -webkit-tap-highlight-color: transparent;
            touch-action: manipulation;
            border: none;
          }
          .mn-close:active { background: #e2e8f0; }
          .ha {
            -webkit-tap-highlight-color: transparent;
            touch-action: manipulation;
          }
          .ha-user-btn {
            width: 42px !important;
            padding: 0 !important;
            border-radius: 50% !important;
          }
        }
      `}</style>
    </div>
  );
}
