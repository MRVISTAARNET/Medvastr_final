"use client";

import React, { useState } from "react";
import Link from "next/link";
import { B } from "@/lib/data";

export default function Footer() {
  const [openCol, setOpenCol] = useState<string | null>(null);

  const toggle = (col: string) => {
    if (typeof window !== "undefined" && window.innerWidth <= 768) {
      setOpenCol(openCol === col ? null : col);
    }
  };

  return (
    <footer id="ft">
      <div className="ft-g">
        <div className="ft-brand">
          <div className="ft-logo">
            Medva<span>str</span>
          </div>
          <span className="ft-tag">Premium Medical Apparel</span>
          <p className="ft-desc">
            India's leading medical apparel brand. Built for doctors, nurses and healthcare professionals.
          </p>
          <div className="ft-contact">
            <div className="ft-c-i">📞 <a href={`tel:${B.phone}`}>{B.phone}</a></div>
            <div className="ft-c-i">✉️ <a href={`mailto:${B.email}`}>{B.email}</a></div>
            <div className="ft-c-i">📍 {B.addr}</div>
          </div>
          <div className="ft-soc">
            {[['📸', B.ig], ['f', B.fb], ['in', B.li]].map(([l, h]) => (
              <a key={l} href={h} target="_blank" rel="noopener" className="ft-s-a">{l}</a>
            ))}
          </div>
        </div>

        <div className={`ft-col${openCol === 'men' ? ' open' : ''}`}>
          <h4 onClick={() => toggle('men')}>
            Men <span className="ft-arr">▾</span>
          </h4>
          <ul className="ft-lnks">
            {[
              ["V-Neck Scrubs", "scrubs"], ["Mandarin Collar", "scrubs"], ["ecoflex™ Scrubs", "scrubs"], ["Lab Coats", "labcoat"], ["DRIFT Jacket", "jacket"], ["Accessories", "accessories"]
            ].map(([l, cat]) => (
              <li key={l}><Link href={`/products?cat=${cat}`}>{l}</Link></li>
            ))}
          </ul>
        </div>

        <div className={`ft-col${openCol === 'women' ? ' open' : ''}`}>
          <h4 onClick={() => toggle('women')}>
            Women <span className="ft-arr">▾</span>
          </h4>
          <ul className="ft-lnks">
            {[
              ["V-Neck Scrubs", "scrubs"], ["Mandarin Collar", "scrubs"], ["ecoflex™ Scrubs", "scrubs"], ["Lab Coats", "labcoat"], ["DRIFT Jacket", "jacket"], ["Hijab", "accessories"]
            ].map(([l, cat]) => (
              <li key={l}><Link href={`/products?cat=${cat}`}>{l}</Link></li>
            ))}
          </ul>
        </div>

        <div className={`ft-col${openCol === 'help' ? ' open' : ''}`}>
          <h4 onClick={() => toggle('help')}>
            Help <span className="ft-arr">▾</span>
          </h4>
          <ul className="ft-lnks">
            {[
              ["Track My Order", "track"], ["Returns & Exchanges", "returns"], ["Size Guide", "sizeguide"], ["Bulk Orders", "bulk"], ["Contact Us", "contact"], ["Breakpoint 24/7", "breakpoint"]
            ].map(([l, p]) => (
              <li key={l}><Link href={`/${p}`}>{l}</Link></li>
            ))}
          </ul>
        </div>

        <div className={`ft-col${openCol === 'company' ? ' open' : ''}`}>
          <h4 onClick={() => toggle('company')}>
            Company <span className="ft-arr">▾</span>
          </h4>
          <ul className="ft-lnks">
            {[
              ["About Us", "about"], ["Blog & Resources", "blog"], ["Sustainability", "sustainability"], ["Privacy Policy", "privacy"], ["Terms of Service", "terms"], ["Refund Policy", "refund"]
            ].map(([l, p]) => (
              <li key={l}><Link href={`/${p}`}>{l}</Link></li>
            ))}
          </ul>
        </div>
      </div>

      <div className="ft-btm">
        <div className="ft-copy">
          © 2026 Medvastr. All rights reserved. <br/>
          <span className="ft-credit">Made by <a href="https://mrvistaarnet.com" target="_blank" rel="noopener">MrVistaarNet</a> ❤️</span>
        </div>
        <div className="ft-pay">
          {["UPI", "Visa", "MC", "Amex", "COD", "EMI"].map((p) => (
            <span key={p} className="pay-p">{p}</span>
          ))}
        </div>
      </div>

      <style jsx>{`
        footer {
          background: var(--ink);
          color: white;
          padding: 80px 40px 40px;
          position: relative;
          z-index: 10;
          width: 100%;
          margin-top: 60px;
        }
        .ft-g {
          max-width: 1560px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1.5fr 1fr 1fr 1fr 1fr;
          gap: 40px;
        }
        .ft-logo { font-family: var(--serif); font-size: 36px; font-weight: 700; color: white; letter-spacing: -0.04em; }
        .ft-logo span { color: var(--t); }
        .ft-tag { font-size: 10px; letter-spacing: 3px; color: var(--lt); text-transform: uppercase; display: block; margin-top: 6px; }
        .ft-desc { font-size: 14px; color: var(--lt); margin: 24px 0; line-height: 1.6; max-width: 340px; }
        .ft-contact { font-size: 14px; color: var(--lt); line-height: 2; margin-bottom: 24px; }
        .ft-soc { display: flex; gap: 14px; }
        .ft-s-a { width: 36px; height: 36px; border-radius: 50%; background: rgba(255,255,255,0.08); display: flex; align-items: center; justify-content: center; font-size: 16px; transition: all 0.2s; }
        .ft-s-a:hover { background: var(--t); transform: translateY(-3px); }
        h4 { font-size: 13px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 28px; color: white; }
        ul { list-style: none; }
        li { margin-bottom: 14px; }
        li a { font-size: 14.5px; color: var(--lt); transition: color 0.15s; }
        li a:hover { color: var(--t); }
        .ft-btm { max-width: 1560px; margin: 80px auto 0; padding-top: 40px; border-top: 1px solid rgba(255,255,255,0.08); display: flex; justify-content: space-between; align-items: center; }
        .ft-copy { font-size: 13px; color: var(--lt); line-height: 1.8; }
        .ft-credit a { color: var(--t2); font-weight: 600; text-decoration: underline; }
        .ft-pay { display: flex; gap: 10px; }
        .pay-p { font-size: 10px; font-weight: 700; padding: 5px 10px; background: rgba(255,255,255,0.06); border-radius: 4px; color: var(--lt); }
        
        @media (max-width: 768px) {
          footer { padding: 60px 24px 40px; }
          .ft-g { grid-template-columns: 1fr; gap: 0; }
          .ft-brand { margin-bottom: 40px; text-align: left; }
          .ft-desc { margin: 15px 0; text-align: left; font-size: 13.5px; }
          .ft-soc { justify-content: flex-start; }
          .ft-col { border-bottom: 1px solid rgba(255,255,255,0.08); }
          .ft-col h4 { margin-bottom: 0; padding: 20px 0; font-size: 14px; }
          .ft-lnks { display: none; padding-bottom: 24px; }
          .ft-col.open .ft-lnks { display: block; }
          .ft-btm { flex-direction: column; text-align: left; align-items: flex-start; gap: 30px; margin-top: 60px; }
          .ft-arr { display: inline-block; transition: transform 0.3s; margin-left: 10px; font-size: 12px; opacity: 0.5; }
          .ft-col.open .ft-arr { transform: rotate(180deg); opacity: 1; color: var(--t); }
          .ft-col h4 { display: flex; justify-content: space-between; align-items: center; }
          .ft-pay { width: 100%; justify-content: flex-start; flex-wrap: wrap; }
        }
      `}</style>
    </footer>
  );
}
