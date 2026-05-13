"use client";

import React, { useState } from "react";
import Link from "next/link";
import { B } from "@/lib/data";

export default function Footer() {
  const [openCol, setOpenCol] = useState<string | null>(null);

  const toggle = (col: string) => {
    if (typeof window !== 'undefined' && window.innerWidth <= 768) {
      setOpenCol(openCol === col ? null : col);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer id="ft">
      <div className="ft-g">
        <div className="ft-brand">
          <div className="ft-logo">
            Medva<span>str</span>
          </div>
          <span className="ft-tag">Wear Wellness</span>
          <p className="ft-desc">
            India's most loved medical apparel brand. Engineering scrubs that work as hard as you do.
          </p>
          <div className="ft-contact">
            <div className="ft-c-i"><span>📞</span> <a href={`tel:${B.phone}`}>{B.phone}</a></div>
            <div className="ft-c-i"><span>✉️</span> <a href={`mailto:${B.email}`}>{B.email}</a></div>
            <div className="ft-c-i"><span>📍</span> {B.addr}</div>
          </div>
          <div className="ft-soc">
            {[
              { l: '📸', h: B.ig, n: 'Instagram' }, 
              { l: 'f', h: B.fb, n: 'Facebook' }, 
              { l: 'in', h: B.li, n: 'LinkedIn' }
            ].map((s) => (
              <a key={s.n} href={s.h} target="_blank" rel="noopener" className="ft-s-a" title={s.n}>{s.l}</a>
            ))}
          </div>
        </div>

        <div className={`ft-col${openCol === 'men' ? ' open' : ''}`}>
          <h4 onClick={() => toggle('men')}>
            Men's Collection <span className="ft-arr">▾</span>
          </h4>
          <ul className="ft-lnks">
            {[
              ["V-Neck Scrubs", "scrubs"], ["Mandarin Scrubs", "scrubs"], ["ecoflex™ Edition", "scrubs"], ["Modern Lab Coats", "labcoat"], ["DRIFT Jackets", "jacket"], ["All Accessories", "accessories"]
            ].map(([l, cat]) => (
              <li key={l}><Link href={`/products?cat=${cat}`}>{l}</Link></li>
            ))}
          </ul>
        </div>

        <div className={`ft-col${openCol === 'women' ? ' open' : ''}`}>
          <h4 onClick={() => toggle('women')}>
            Women's Collection <span className="ft-arr">▾</span>
          </h4>
          <ul className="ft-lnks">
            {[
              ["V-Neck Scrubs", "scrubs"], ["Mandarin Scrubs", "scrubs"], ["ecoflex™ Edition", "scrubs"], ["Modern Lab Coats", "labcoat"], ["DRIFT Jackets", "jacket"], ["Medical Hijabs", "accessories"]
            ].map(([l, cat]) => (
              <li key={l}><Link href={`/products?cat=${cat}`}>{l}</Link></li>
            ))}
          </ul>
        </div>

        <div className={`ft-col${openCol === 'help' ? ' open' : ''}`}>
          <h4 onClick={() => toggle('help')}>
            Customer Care <span className="ft-arr">▾</span>
          </h4>
          <ul className="ft-lnks">
            {[
              ["Track My Order", "track"], ["Returns & Exchanges", "returns"], ["Size Guide", "sizeguide"], ["Bulk Orders", "bulk"], ["Contact Support", "contact"], ["24/7 Helpline", "contact"]
            ].map(([l, p]) => (
              <li key={l}><Link href={`/${p}`}>{l}</Link></li>
            ))}
          </ul>
        </div>

        <div className={`ft-col${openCol === 'company' ? ' open' : ''}`}>
          <h4 onClick={() => toggle('company')}>
            Our Story <span className="ft-arr">▾</span>
          </h4>
          <ul className="ft-lnks">
            {[
              ["About Medvastr", "about"], ["Medical Blog", "blog"], ["Our Impact", "about"], ["Privacy Policy", "privacy"], ["Terms of Use", "terms"], ["Return Policy", "refund"]
            ].map(([l, p]) => (
              <li key={l}><Link href={`/${p}`}>{l}</Link></li>
            ))}
          </ul>
        </div>
      </div>

      <div className="ft-btm">
        <div className="ft-copy">
          © 2026 Medvastr. Engineered for Excellence. <br className="mob-only"/>
          <span className="ft-credit">Crafted by <a href="https://mrvistaarnet.com" target="_blank" rel="noopener">MrVistaarNet</a></span>
        </div>
        
        <button className="back-to-top" onClick={scrollToTop}>
          ↑ <span className="mob-hide">Back to Top</span>
        </button>

        <div className="ft-pay">
          {["UPI", "Visa", "MC", "Amex", "COD"].map((p) => (
            <span key={p} className="pay-p">{p}</span>
          ))}
        </div>
      </div>

      <style jsx>{`
        #ft { background: var(--ink); color: white; padding: 100px 44px 40px; position: relative; z-index: 10; }
        .ft-g { max-width: 1560px; margin: 0 auto; display: grid; grid-template-columns: 1.5fr 1fr 1fr 1fr 1fr; gap: 60px; }
        
        .ft-logo { font-family: var(--serif); font-size: 42px; font-weight: 700; color: white; letter-spacing: -0.04em; line-height: 0.9; }
        .ft-logo span { color: var(--t); }
        .ft-tag { font-size: 10px; font-weight: 800; letter-spacing: 4px; color: var(--lt); text-transform: uppercase; display: block; margin-top: 8px; }
        .ft-desc { font-size: 14.5px; color: var(--lt); margin: 24px 0; line-height: 1.7; max-width: 340px; }
        
        .ft-contact { margin-bottom: 30px; }
        .ft-c-i { font-size: 14px; color: var(--lt); margin-bottom: 12px; display: flex; align-items: center; gap: 10px; }
        .ft-c-i span { font-size: 16px; opacity: 0.6; }
        .ft-c-i a:hover { color: var(--t); text-decoration: underline; }

        .ft-soc { display: flex; gap: 14px; }
        .ft-s-a { width: 40px; height: 40px; border-radius: 50%; background: rgba(255,255,255,0.06); display: flex; align-items: center; justify-content: center; font-size: 16px; transition: all 0.3s; border: 1px solid rgba(255,255,255,0.05); }
        .ft-s-a:hover { background: var(--t); transform: translateY(-4px); border-color: var(--t); box-shadow: 0 10px 20px rgba(10, 124, 108, 0.3); }

        h4 { font-size: 14px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 28px; color: white; }
        ul { list-style: none; }
        li { margin-bottom: 14px; }
        li a { font-size: 14.5px; color: var(--lt); transition: all 0.2s; display: inline-block; }
        li a:hover { color: var(--wh); transform: translateX(5px); }

        .ft-btm { max-width: 1560px; margin: 80px auto 0; padding-top: 40px; border-top: 1px solid rgba(255,255,255,0.08); display: flex; justify-content: space-between; align-items: center; }
        .ft-copy { font-size: 13px; color: var(--lt); line-height: 1.8; }
        .ft-credit a { color: var(--t2); font-weight: 700; }
        
        .back-to-top { background: rgba(255,255,255,0.06); color: white; border: 1px solid rgba(255,255,255,0.1); padding: 10px 20px; border-radius: 999px; font-size: 13px; font-weight: 700; display: flex; align-items: center; gap: 8px; transition: all 0.2s; }
        .back-to-top:hover { background: var(--t); border-color: var(--t); transform: translateY(-3px); }

        .ft-pay { display: flex; gap: 10px; }
        .pay-p { font-size: 10px; font-weight: 800; padding: 5px 10px; background: rgba(255,255,255,0.05); border-radius: 6px; color: var(--lt); border: 1px solid rgba(255,255,255,0.03); }

        @media (max-width: 1024px) {
          .ft-g { grid-template-columns: 1fr 1fr 1fr; gap: 40px; }
          .ft-brand { grid-column: 1 / -1; }
        }

        @media (max-width: 768px) {
          #ft { padding: 60px 20px 40px; }
          .ft-g { grid-template-columns: 1fr; gap: 0; }
          .ft-brand { margin-bottom: 50px; text-align: center; }
          .ft-desc { margin: 15px auto; text-align: center; }
          .ft-contact { display: flex; flex-direction: column; align-items: center; }
          .ft-soc { justify-content: center; }
          .ft-col { border-bottom: 1px solid rgba(255,255,255,0.06); }
          .ft-col h4 { margin-bottom: 0; padding: 22px 0; display: flex; justify-content: space-between; align-items: center; }
          .ft-lnks { display: none; padding: 0 0 24px; }
          .ft-col.open .ft-lnks { display: block; }
          .ft-arr { transition: transform 0.3s; opacity: 0.5; }
          .ft-col.open .ft-arr { transform: rotate(180deg); opacity: 1; color: var(--t); }
          .ft-btm { flex-direction: column; text-align: center; gap: 30px; border-top: none; padding-top: 0; }
          .back-to-top { order: -1; width: 100%; justify-content: center; height: 50px; }
        }
      `}</style>
    </footer>
  );
}
