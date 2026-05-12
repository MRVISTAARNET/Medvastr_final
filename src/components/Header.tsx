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

  const res = q
    ? PRODUCTS.filter((p) => p.name.toLowerCase().includes(q.toLowerCase())).slice(0, 6)
    : [];

  const cc = cart.reduce((s, i) => s + i.qty, 0);
  const wc = wishlist.length;

  return (
    <div id="hdr">
      <div className="hdr-row">
        <Link href="/" className="logo">
          <span className="lw">
            Medva<span>str</span>
          </span>
          <span className="lt">Premium Medical Apparel</span>
        </Link>

        <div className="srch-col">
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
                    <Link href={`/product/${p.id}`} className="s-row" key={p.id} onClick={() => { setQ(""); setSd(false); }}>
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
            🛒 Cart <span className="cart-n">{cc}</span>
          </button>
        </div>
      </div>

      <div id="nav">
        <div className="nav-in">
          <div className="nav-group">
            <div className="nl">
              Men <span className="nav-arrow">▾</span>
            </div>
            <MegaMenu gender="men" />
          </div>
          <div className="nav-group">
            <div className="nl">
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
            <Link key={n.l} href={n.href} className="nl">
              {n.l}
              {n.pill === "new" && <span className="ntag">NEW</span>}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
