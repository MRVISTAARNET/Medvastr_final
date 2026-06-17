"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { PRODUCTS, fmt } from "@/lib/data";
import DynamicNav, { NavItem } from "./DynamicNav";

const FALLBACK_NAV: NavItem[] = [
  { id: 1, label: "Men", href: "/products?gender=men", itemType: "MEGA_MENU", gender: "men", categorySlug: "men" },
  { id: 2, label: "Women", href: "/products?gender=women", itemType: "MEGA_MENU", gender: "women", categorySlug: "women" },
  { id: 3, label: "Surgical Wear", href: "/products?cat=surgical-wear", itemType: "MEGA_MENU", categorySlug: "surgical-wear" },
  { id: 4, label: "Bulk Order", href: "/bulk-orders", itemType: "LINK" },
  { id: 5, label: "About Us", href: "/about", itemType: "LINK" },
  { id: 6, label: "Blogs", href: "/blog", itemType: "LINK" },
  { id: 7, label: "Contact Us", href: "/contact", itemType: "LINK" },
];

interface HeaderProps {
  onCart: () => void;
  onWish: () => void;
  onAcct: () => void;
  user: any;
}

export default function Header({ onCart, onWish, onAcct, user }: HeaderProps) {
  const { cart, wishlist, products, navItems, categoryTree } = useApp();
  const [q, setQ] = useState("");
  const [sd, setSd] = useState(false);
  const [mn, setMn] = useState(false); // Mobile Nav
  const [mS, setMs] = useState(false); // Mobile Search
  const [mo, setMo] = useState<string | null>(null); // Mobile Open Group

  const res = q
    ? products.filter((p) => p.name.toLowerCase().includes(q.toLowerCase())).slice(0, 6)
    : [];

  const cc = cart.reduce((s, i) => s + i.qty, 0);
  const wc = wishlist.length;

  return (
    <div id="hdr">
      <div className="hdr-row">
        <div style={{ display: "flex", alignItems: "center", gap: 30 }}>
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
              placeholder="Search scrubs, lab coats, gowns..."
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
                {(user.firstName || "U").charAt(0)}
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

      {/* Mobile Nav Drawer */}
      <div className={`mob-drawer-ov${mn ? " on" : ""}`} onClick={() => setMn(false)} />
      <div id="nav" className={mn ? " mob-on" : ""}>
        <div className="mob-nav-hd mob-only">
          <button className="mn-close" onClick={() => setMn(false)}>✕</button>
        </div>
        <DynamicNav
          items={navItems && navItems.length > 0 ? navItems : FALLBACK_NAV}
          categoryTree={categoryTree}
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
          
          .mob-drawer-ov {
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.5);
            z-index: 9999;
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.4s;
          }
          .mob-drawer-ov.on { opacity: 1; visibility: visible; }

          .mob-nav-hd {
            display: flex !important;
            padding: 20px 24px;
            justify-content: flex-end;
            align-items: center;
            border-bottom: 1px solid var(--bdr);
            background: var(--wh);
          }
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
          .nav-group { width: 100%; }
          .nav-sub { display: none; background: var(--off); }
          .nav-group.mob-open .nav-sub { display: block; }
          .nav-arrow { transition: transform 0.3s; }
          .nav-group.mob-open .nav-arrow { transform: rotate(180deg); }
        }
      `}</style>
    </div>
  );
}
