"use client";

import React, { useState, useEffect } from "react";
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
        <div className="hdr-left">
          <button className="mn-tog mob-only" onClick={() => setMn(true)}>
            ☰
          </button>
          <Link href="/" className="logo">
            <span className="lw">
              Medva<span>str</span>
            </span>
            <span className="lt">Wear Wellness</span>
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
            <button className="ms-close mob-only" onClick={() => setMs(false)}>✕</button>
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
              <span className="user-init">
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
        <div className="mob-nav-hd">
           <Link href="/" className="logo-sm" onClick={() => setMn(false)}>
             Medva<span>str</span>
           </Link>
           <button className="mn-close" onClick={() => setMn(false)}>✕</button>
        </div>
        <div className="nav-in">
          <div className={`nav-group${mo === "men" ? " mob-open" : ""}`}>
            <div className="nl" onClick={() => setMo(mo === "men" ? null : "men")}>
              Shop Men <span className="nav-arrow">▾</span>
            </div>
            <div className="nav-sub">
               <MegaMenu gender="men" />
            </div>
          </div>
          <div className={`nav-group${mo === "women" ? " mob-open" : ""}`}>
            <div className="nl" onClick={() => setMo(mo === "women" ? null : "women")}>
              Shop Women <span className="nav-arrow">▾</span>
            </div>
            <div className="nav-sub">
               <MegaMenu gender="women" />
            </div>
          </div>
          
          <div className="nav-divider" />
          
          {[
            { l: "ecoflex™ Scrubs", href: "/products?cat=scrubs" },
            { l: "DRIFT Jackets", href: "/products?cat=jacket", pill: "new" },
            { l: "Stethoscopes", href: "/products?cat=stethoscope" },
            { l: "Lab Coat Aprons", href: "/products?cat=labcoat" },
            { l: "Breakpoint 24/7", href: "/breakpoint", pill: "new" },
            { l: "Bulk Offers", href: "/bulk" },
            { l: "Plus Size", href: "/products?cat=scrubs" },
          ].map((n) => (
            <Link key={n.l} href={n.href} className="nl" onClick={() => setMn(false)}>
              {n.l}
              {n.pill === "new" && <span className="ntag">NEW</span>}
            </Link>
          ))}
          
          <div className="nav-divider" />
          
          {[
            { l: "About Medvastr", href: "/about" },
            { l: "Blogs & Resources", href: "/blog" },
            { l: "Contact Support", href: "/contact" },
          ].map((n) => (
            <Link key={n.l} href={n.href} className="nl nl-alt" onClick={() => setMn(false)}>
              {n.l}
            </Link>
          ))}
        </div>
        
        <div className="mob-nav-ft">
          <div className="mn-ft-t">Premium Medical Apparel</div>
          <div className="mn-ft-s">Built for the front lines.</div>
        </div>
      </div>

      <style jsx>{`
        #hdr { width: 100%; position: sticky; top: 0; z-index: 999; background: var(--wh); border-bottom: 1.5px solid var(--bdr); }
        .hdr-row { max-width: 1560px; margin: 0 auto; height: 84px; padding: 0 44px; display: flex; align-items: center; justify-content: space-between; gap: 40px; }
        .hdr-left { display: flex; align-items: center; gap: 20px; }
        
        .mn-tog { font-size: 24px; background: none; border: none; cursor: pointer; color: var(--ink); display: none; }
        .mob-only { display: none; }

        .logo { display: flex; flex-direction: column; text-decoration: none; }
        .lw { font-family: var(--serif); font-size: 32px; font-weight: 700; color: var(--ink); letter-spacing: -0.04em; line-height: 1; }
        .lw span { color: var(--t); }
        .lt { font-size: 9.5px; font-weight: 800; letter-spacing: 3.5px; text-transform: uppercase; color: var(--lt); margin-top: 4px; }

        .srch-col { flex: 1; max-width: 600px; position: relative; }
        .srch-box { background: var(--off); border-radius: 12px; height: 48px; display: flex; align-items: center; padding: 0 16px; border: 1.5px solid transparent; transition: all 0.2s; }
        .srch-box:focus-within { background: var(--wh); border-color: var(--t2); box-shadow: 0 0 0 4px var(--t4); }
        .srch-ico { font-size: 16px; margin-right: 12px; opacity: 0.5; }
        .srch-box input { flex: 1; background: none; border: none; font-size: 14.5px; font-weight: 500; color: var(--ink); }
        .srch-clr { cursor: pointer; font-size: 14px; opacity: 0.3; padding: 5px; }

        .hdr-acts { display: flex; align-items: center; gap: 12px; }
        .ha { width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; transition: all 0.2s; background: none; border: none; cursor: pointer; }
        .ha:hover { background: var(--off); transform: translateY(-1px); }
        .user-init { font-size: 14px; font-weight: 700; color: var(--t); font-family: var(--serif); }
        .ha-badge { position: absolute; top: 6px; right: 6px; background: var(--t); color: white; font-size: 9px; font-weight: 800; min-width: 16px; height: 16px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }

        .cart-pill { background: var(--ink); color: white; height: 46px; padding: 0 20px; border-radius: 23px; display: flex; align-items: center; gap: 10px; font-size: 14px; font-weight: 700; transition: all 0.2s; border: none; cursor: pointer; }
        .cart-pill:hover { background: var(--t); transform: translateY(-1px); }
        .cart-n { background: rgba(255,255,255,0.2); padding: 2px 8px; border-radius: 10px; font-size: 11px; }

        @media (max-width: 1024px) {
          .hdr-row { padding: 0 20px; height: 72px; gap: 15px; }
          .mob-only { display: flex !important; }
          .mob-hide { display: none !important; }
          .mn-tog { display: flex; }
          .srch-col { 
            position: fixed; top: 0; left: 0; width: 100%; height: 72px; background: var(--wh); 
            z-index: 1000; padding: 0 15px; display: none; align-items: center; 
          }
          .srch-col.mob-on { display: flex; }
          .srch-box { flex: 1; border-radius: 0; background: none; }
          .ms-close { background: none; border: none; font-size: 20px; padding: 10px; }

          .mob-drawer-ov { position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 9999; opacity: 0; visibility: hidden; transition: all 0.4s; backdrop-filter: blur(4px); }
          .mob-drawer-ov.on { opacity: 1; visibility: visible; }

          #nav {
            position: fixed; top: 0; left: 0; height: 100vh; width: 85%; max-width: 340px; 
            background: var(--wh); z-index: 10000; transform: translateX(-100%); transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            display: flex !important; flex-direction: column; box-shadow: 20px 0 60px rgba(0,0,0,0.2);
          }
          #nav.mob-on { transform: translateX(0); }

          .mob-nav-hd { padding: 24px; border-bottom: 1px solid var(--bdr); display: flex; justify-content: space-between; align-items: center; }
          .logo-sm { font-family: var(--serif); font-size: 26px; font-weight: 700; color: var(--ink); text-decoration: none; letter-spacing: -0.04em; }
          .logo-sm span { color: var(--t); }
          .mn-close { width: 40px; height: 40px; border-radius: 50%; background: var(--off); font-size: 16px; border: none; }

          .nav-in { flex: 1; overflow-y: auto; padding: 20px 0 !important; }
          .nl { padding: 16px 24px !important; font-size: 16px !important; font-weight: 600 !important; display: flex; justify-content: space-between; align-items: center; color: var(--ink) !important; border: none !important; }
          .nl-alt { font-size: 14.5px !important; font-weight: 500 !important; color: var(--lt) !important; }
          .nav-divider { height: 1px; background: var(--bdr); margin: 15px 24px; opacity: 0.5; }
          .ntag { background: var(--t); color: white; font-size: 9px; padding: 2px 6px; border-radius: 4px; }
          
          .nav-sub { display: none; background: var(--off); padding: 10px 0; }
          .nav-group.mob-open .nav-sub { display: block; }
          .nav-arrow { transition: transform 0.3s; opacity: 0.4; }
          .nav-group.mob-open .nav-arrow { transform: rotate(180deg); opacity: 1; color: var(--t); }

          .mob-nav-ft { padding: 30px 24px; background: var(--off); border-top: 1px solid var(--bdr); }
          .mn-ft-t { font-size: 11px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; color: var(--lt); margin-bottom: 6px; }
          .mn-ft-s { font-size: 14px; font-weight: 600; color: var(--ink2); }
        }
      `}</style>
    </div>
  );
}
