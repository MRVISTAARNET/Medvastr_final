"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { PRODUCTS, fmt } from "@/lib/data";
import MegaMenu from "./MegaMenu";

interface HeaderProps {
  onCart: () => void;
  onWish: () => void;
  onAcct: () => void;
  user: any;
}

export default function Header({ onCart, onWish, onAcct, user }: HeaderProps) {
  const { cart, wishlist } = useApp();
  const [q, setQ] = useState("");
  const [sd, setSd] = useState(false);
  const [mn, setMn] = useState(false); // Mobile Nav
  const [mS, setMs] = useState(false); // Mobile Search
  const [mo, setMo] = useState<string | null>(null); // Mobile Open Group
  const [doM, setDoM] = useState<string | null>(null); // Desktop Open Mega

  const res = q
    ? PRODUCTS.filter((p) => p.name.toLowerCase().includes(q.toLowerCase())).slice(0, 6)
    : [];

  const cc = cart.reduce((s, i) => s + i.qty, 0);
  const wc = wishlist.length;

  return (
    <div id="hdr" onMouseLeave={() => setDoM(null)}>
      <div className="hdr-row">
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <button className="ha mob-only" onClick={() => setMn(true)}>
            ☰
          </button>
          <Link href="/" className="logo">
            <span className="lw">
              Medva<span>str</span>
            </span>
            <span className="lt">Wear Wellness</span>
          </Link>
          
          {/* Desktop Nav Links */}
          <div className="desk-nav mob-hide">
             <div className="dn-l" onMouseEnter={() => setDoM("men")}>Men</div>
             <div className="dn-l" onMouseEnter={() => setDoM("women")}>Women</div>
             <Link href="/products?cat=scrubs" className="dn-l">ecoflex™</Link>
             <Link href="/products?cat=stethoscope" className="dn-l">Stethoscope</Link>
          </div>
        </div>

        <div className={`srch-col${mS ? " mob-on" : ""}`}>
          <div className="srch-box">
            <span className="srch-ico">🔍</span>
            <input
              placeholder="Search scrubs, stethoscopes, lab coats..."
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setSd(true);
              }}
              onFocus={() => setSd(true)}
              onBlur={() => setTimeout(() => setSd(false), 200)}
            />
            {q && (
              <span className="srch-clr" onClick={() => setQ("")}>
                ✕
              </span>
            )}
          </div>
          {sd && q && (
            <div className="srch-drop">
              {res.length === 0 ? (
                <div className="s-empty">No results for "{q}"</div>
              ) : (
                <>
                  <div className="s-hd">Products</div>
                  {res.map((p) => (
                    <Link
                      href={`/product/${p.id}`}
                      className="s-row"
                      key={p.id}
                      onClick={() => {
                        setQ("");
                        setSd(false);
                        setMs(false);
                        setMn(false);
                      }}
                    >
                      <div className="s-thumb" style={{ background: p.bg }}>
                        {p.emo}
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
          <button className="ha" onClick={onAcct} title="Account">
            {user ? (
              <span style={{ fontSize: 14, fontWeight: 700, color: "var(--t)", fontFamily: "var(--serif)" }}>
                {user.name.charAt(0)}
              </span>
            ) : (
              "👤"
            )}
          </button>
          <button className="ha" onClick={onWish} title="Wishlist" style={{ position: "relative" }}>
            {wc > 0 ? "❤️" : "🤍"}
            {wc > 0 && <span className="ha-badge">{wc}</span>}
          </button>
          <button className="cart-pill" onClick={onCart}>
            🛒 <span className="mob-hide">Cart</span> <span className="cart-n">{cc}</span>
          </button>
        </div>
      </div>

      {/* Desktop Mega Menu Dropdown */}
      {doM && (
        <div className="desk-mega-wrap mob-hide" onMouseEnter={() => setDoM(doM)} onMouseLeave={() => setDoM(null)}>
           <MegaMenu gender={doM as "men" | "women"} />
        </div>
      )}

      {/* Mobile Nav Drawer */}
      <div className={`mob-drawer-ov${mn ? " on" : ""}`} onClick={() => setMn(false)} />
      <div id="nav" className={mn ? " mob-on" : ""}>
        <div className="mob-nav-hd">
           <div className="logo-sm">Medva<span>str</span></div>
           <button className="mn-close" onClick={() => setMn(false)}>✕</button>
        </div>
        <div className="nav-in">
          <div className={`nav-group${mo === "men" ? " mob-open" : ""}`}>
            <div className="nl" onClick={() => setMo(mo === "men" ? null : "men")}>
              Men <span className="nav-arrow">▾</span>
            </div>
            <div className="nav-sub">
               <MegaMenu gender="men" />
            </div>
          </div>
          <div className={`nav-group${mo === "women" ? " mob-open" : ""}`}>
            <div className="nl" onClick={() => setMo(mo === "women" ? null : "women")}>
              Women <span className="nav-arrow">▾</span>
            </div>
            <div className="nav-sub">
               <MegaMenu gender="women" />
            </div>
          </div>
          {[
            { l: "ecoflex™", href: "/products?cat=scrubs" },
            { l: "DRIFT Jacket", href: "/products?cat=jacket", pill: "new" },
            { l: "Stethoscope", href: "/products?cat=stethoscope" },
            { l: "Lab Coat Aprons", href: "/products?cat=labcoat" },
            { l: "Breakpoint 24/7", href: "/breakpoint", pill: "new" },
            { l: "Bulk Offers", href: "/bulk" },
            { l: "Plus Size", href: "/products?cat=scrubs" },
            { l: "About Us", href: "/about" },
            { l: "Blogs", href: "/blog" },
          ].map((n) => (
            <Link key={n.l} href={n.href} className="nl" onClick={() => setMn(false)}>
              {n.l}
              {n.pill === "new" && <span className="ntag">NEW</span>}
            </Link>
          ))}
        </div>
      </div>

      <style jsx>{`
        .mob-only { display: none; }
        .desk-nav { display: flex; gap: 24px; margin-left: 20px; align-items: center; }
        .dn-l { font-size: 13.5px; font-weight: 700; color: var(--ink); text-transform: uppercase; letter-spacing: 1px; cursor: pointer; transition: color 0.2s; }
        .dn-l:hover { color: var(--t); }
        .desk-mega-wrap { 
          position: absolute; top: 100%; left: 0; width: 100%; 
          background: white; border-top: 1px solid var(--bdr); border-bottom: 1px solid var(--bdr);
          box-shadow: 0 20px 40px rgba(0,0,0,0.08); z-index: 800; animation: megaIn 0.25s var(--ease);
        }
        @keyframes megaIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: none; } }

        @media (max-width: 1024px) {
          .mob-only { display: flex !important; }
          .mob-hide { display: none !important; }
          
          .mob-drawer-ov {
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.6);
            z-index: 9999;
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.4s;
          }
          .mob-drawer-ov.on { opacity: 1; visibility: visible; }

          .mob-nav-hd {
            display: flex !important;
            padding: 20px 24px;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid var(--bdr);
            background: var(--wh);
          }
          .logo-sm { font-family: var(--serif); font-size: 24px; font-weight: 700; color: var(--ink); }
          .logo-sm span { color: var(--t); }
          
          .mn-close {
            width: 40px;
            height: 40px;
            background: var(--off);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            color: var(--ink2);
          }
          .nav-in {
             flex-direction: column;
             padding: 10px 0 !important;
          }
          .nav-group { width: 100%; border-bottom: 1px solid var(--bdr2); }
          .nav-sub { display: none; background: var(--off); padding: 10px 0; }
          .nav-group.mob-open .nav-sub { display: block; }
          .nav-arrow { transition: transform 0.3s; font-size: 12px; opacity: 0.5; }
          .nav-group.mob-open .nav-arrow { transform: rotate(180deg); }
        }
      `}</style>
    </div>
  );
}
