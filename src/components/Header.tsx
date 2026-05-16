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

  const res = q
    ? PRODUCTS.filter((p) => p.name.toLowerCase().includes(q.toLowerCase())).slice(0, 6)
    : [];

  const cc = cart.reduce((s, i) => s + i.qty, 0);
  const wc = wishlist.length;

  return (
    <div id="hdr">
      <div className="hdr-row">
        <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
          <button className="ha mob-only" onClick={() => setMn(true)}>
            ☰
          </button>
          <Link href="/" className="logo">
            <span className="lw">medvastr</span>
            <span className="lt">Wear Wellness</span>
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

      {/* Mobile Nav Drawer */}
      <div className={`mob-drawer-ov${mn ? " on" : ""}`} onClick={() => setMn(false)} />
      <div id="nav" className={mn ? " mob-on" : ""}>
        <div className="mob-nav-hd mob-only">
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
          <div className={`nav-group flexy-group${mo === "flexy" ? " mob-open" : ""}`} style={{ position: "relative", whiteSpace: "nowrap" }}>
            <div className="nl" onClick={() => setMo(mo === "flexy" ? null : "flexy")}>
              Flexy Fit 'V' Scrub <span className="nav-arrow">▾</span>
            </div>
            <div className="flexy-sub">
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "var(--lt)", marginBottom: 10 }}>Men's Sizes</div>
                <div style={{ display: "flex", gap: 8 }}>
                  {["M","L","XL","XXL"].map(s => (
                    <Link key={s} href="/products?cat=scrubs" onClick={() => setMn(false)} style={{ padding: "6px 12px", border: "1.5px solid var(--bdr)", borderRadius: 6, fontSize: 12, fontWeight: 600 }}>{s}</Link>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "var(--lt)", marginBottom: 10 }}>Women's Sizes</div>
                <div style={{ display: "flex", gap: 8 }}>
                  {["S","M","L","XL"].map(s => (
                    <Link key={s} href="/products?cat=scrubs" onClick={() => setMn(false)} style={{ padding: "6px 12px", border: "1.5px solid var(--bdr)", borderRadius: 6, fontSize: 12, fontWeight: 600 }}>{s}</Link>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "var(--lt)", marginBottom: 10 }}>Colours</div>
                <div style={{ display: "flex", gap: 8 }}>
                  {[["Dark Blue","#1a2b4a"],["Light Blue","#add8e6"],["Maroon","#800000"],["Wine","#722f37"]].map(([n,h]) => (
                    <div key={n} title={n} style={{ width: 20, height: 20, borderRadius: "50%", background: h, border: "2px solid rgba(0,0,0,0.1)", cursor: "pointer" }} />
                  ))}
                </div>
              </div>
              <div style={{ alignSelf: "center" }}>
                <Link href="/products?cat=scrubs" onClick={() => setMn(false)} className="btn-t" style={{ fontSize: 12, height: 36, padding: "0 16px" }}>
                  Buy Now →
                </Link>
              </div>
            </div>
          </div>
          {[
            { l: "Linen & Bedding", href: "/products?cat=linen" },
            { l: "Surgical Wear", href: "/products?cat=surgical" },
            // { l: "Stethoscope", href: "/products?cat=stethoscope" },
            { l: "Bulk Offers", href: "/bulk" },
            { l: "About Us", href: "/about" },
            { l: "Blogs", href: "/blog" },
          ].map((n) => (
            <Link key={n.l} href={n.href} className="nl" onClick={() => setMn(false)}>
              {n.l}
            </Link>
          ))}
        </div>
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
