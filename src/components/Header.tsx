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
          <button className="ha mob-only" style={{ display: "none" }} onClick={() => setMn(true)}>
            ☰
          </button>
          <Link href="/" className="logo">
            <span className="lw">
              Medva<span>str</span>
            </span>
            <span className="lt">Premium Medical Apparel</span>
          </Link>
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
          <button className="ha mob-only" style={{ display: "none" }} onClick={() => setMs(!mS)}>
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

      {/* Overlay */}
      {mn && <div className="mob-ov" onClick={() => setMn(false)} style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', z-index: 9999
      }} />}

      <div id="nav" className={mn ? " mob-on" : ""}>
        <div className="mob-nav-hd" style={{ display: 'none' }}>
           <span className="logo-sm">Medvastr</span>
           <button className="mn-close" onClick={() => setMn(false)}>✕</button>
        </div>
        <div className="nav-in">
          <div className={`nav-group${mo === "men" ? " mob-open" : ""}`}>
            <div className="nl" onClick={() => setMo(mo === "men" ? null : "men")}>
              Men <span className="nav-arrow">▾</span>
            </div>
            <MegaMenu gender="men" />
          </div>
          <div className={`nav-group${mo === "women" ? " mob-open" : ""}`}>
            <div className="nl" onClick={() => setMo(mo === "women" ? null : "women")}>
              Women <span className="nav-arrow">▾</span>
            </div>
            <MegaMenu gender="women" />
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
        @media (max-width: 1024px) {
          .mob-only { display: flex !important; }
          .mob-hide { display: none !important; }
          .mob-nav-hd {
            display: flex !important;
            padding: 24px;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid var(--bdr);
            background: var(--wh);
          }
          .logo-sm {
            font-family: var(--serif);
            font-size: 22px;
            font-weight: 700;
            color: var(--ink);
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
             padding: 10px 24px;
             align-items: flex-start;
          }
          .nl {
             width: 100%;
             padding: 16px 0;
             font-size: 15px;
             border-bottom: 1px solid var(--bdr2);
          }
          .nl::after { display: none; }
          .nav-group { width: 100%; }
        }
      `}</style>
    </div>
  );
}
