"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { fmt } from "@/lib/data";
import { NAV_DATA } from "@/lib/navData";
import DynamicNav from "./DynamicNav";

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

      // Check text match in name or description
      const nameMatch = p.name.toLowerCase().includes(cleanQuery);
      const descMatch = (p.desc || "").toLowerCase().includes(cleanQuery);
      return nameMatch || descMatch;
    }).slice(0, 6);
  };

  const res = getSuggestions();

  const resolvedNav = NAV_DATA;
  const cc = cart.reduce((s, i) => s + i.qty, 0);
  const wc = wishlist.length;

  return (
    <div id="hdr">
      <div className="hdr-row">
        <div className="hdr-logo-area" style={{ display: "flex", alignItems: "center", gap: 30 }}>
          <button className="ha mob-only" onClick={() => setMn(true)}>
            ☰
          </button>
          <Link href="/" className="logo">
            <span className="lw" style={{ fontSize: 44, fontWeight: 900, letterSpacing: -1.5 }}>medvastr</span>
            <span className="lt" style={{ fontSize: 11, letterSpacing: 3, marginTop: -2 }}>Wear Wellness</span>
          </Link>
        </div>

        <div className={`srch-col${mS ? " mob-on" : ""}`}>
          <div className="srch-box">
            <span className="srch-ico">🔍</span>
            <input
              placeholder="Search scrubs, surgical wear, caps..."
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setSd(true);
              }}
              onFocus={() => setSd(true)}
              onBlur={() => setTimeout(() => setSd(false), 300)}
            />
            {q && (
              <span className="srch-clr" onClick={() => setQ("")}>
                ✕
              </span>
            )}
          </div>
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

        <div className="hdr-acts">
          <button className="ha mob-only" onClick={() => setMs(!mS)}>
            🔍
          </button>
          <button className="ha ha-user-btn" onClick={onAcct} title="Account" style={{ whiteSpace: 'nowrap', width: user ? 'auto' : '42px', padding: user ? '0 15px' : '0', borderRadius: user ? '999px' : '50%' }}>
            {user ? (
              <>
                <span className="mob-hide" style={{ fontSize: 13, fontWeight: 700, color: "var(--t)" }}>
                  Hello, {user.firstName || "Admin"}
                </span>
                <span className="mob-only" style={{ display: 'none' }}>
                  👤
                </span>
              </>
            ) : (
              "👤"
            )}
          </button>
          <button className="ha" onClick={onWish} title="Wishlist" style={{ position: "relative" }}>
            {wc > 0 ? "❤️" : "🤍"}
            {wc > 0 && <span className="ha-badge">{wc}</span>}
          </button>
          <button className="cart-pill" onClick={onCart}>
            🛒 <span className="mob-hide">Cart</span> {isHydrated ? <span className="cart-n">{cc}</span> : <span className="cart-n">...</span>}
          </button>
        </div>
      </div>

      {/* Mobile Nav Drawer */}
      <div className={`mob-drawer-ov${mn ? " on" : ""}`} onClick={() => setMn(false)} />
      <div id="nav" className={mn ? " mob-on" : ""}>
        <div className="mob-nav-hd mob-only">
          <span className="mob-nav-brand">medvastr</span>
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
            border-bottom: 2px solid #10b981;
            background: #ffffff;
            position: sticky;
            top: 0;
            z-index: 1;
          }
          .mob-nav-brand {
            font-size: 28px;
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
