"use client";

import React, { useState } from "react";
import Link from "next/link";
import { B } from "@/lib/data";

export default function Footer() {
  const [openCol, setOpenCol] = useState<string | null>(null);

  const toggle = (col: string) => {
    if (window.innerWidth <= 768) {
      setOpenCol(openCol === col ? null : col);
    }
  };

  return (
    <footer id="ft">
      <div className="ft-g">
        <div className="ft-brand">
          <div className="ft-logo">
            medvastr
          </div>
          <span className="ft-tag">Wear Wellness - Premium Medical Apparel</span>
          <p className="ft-desc">
            India's leading medical apparel brand. Built for doctors, nurses and healthcare professionals.
          </p>
          <div className="ft-contact">
            📞 <a href={`tel:${B.phone1}`}>{B.phone1}</a> | <a href={`tel:${B.phone2}`}>{B.phone2}</a> | {B.landline}<br />
            ✉️ <a href={`mailto:${B.email}`}>{B.email}</a><br />
            📍 {B.addr}
          </div>
          <div className="ft-soc">
            <a href={B.ig} target="_blank" rel="noopener" className="ft-s-a">Instagram</a>
            <a href={B.fb} target="_blank" rel="noopener" className="ft-s-a">Facebook</a>
            <a href={`https://wa.me/919920314164`} target="_blank" rel="noopener" className="ft-s-a" style={{ background: "#25d366", borderColor: "#25d366" }}>WhatsApp</a>
          </div>
        </div>

        <div className={`ft-col${openCol === 'men' ? ' open' : ''}`}>
          <h4 onClick={() => toggle('men')}>
            Men <span className="ft-arr">▾</span>
          </h4>
          <ul className="ft-lnks">
            {[
              ["Flexy Fit Scrub", "men"], ["Green Sheets", "linen"], ["Cardiac Sheets", "linen"], ["Bed Blankets", "linen"]
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
              ["Flexy Fit Scrub", "women"], ["Maternity Gowns", "surgical"], ["Patient Dress", "surgical"], ["Scrubs with Logo", "uniforms"], ["OT Gowns", "surgical"]
            ].map(([l, cat]) => (
              <li key={l}><Link href={`/products?cat=${cat}`}>{l}</Link></li>
            ))}
          </ul>
        </div>

        <div className={`ft-col${openCol === 'help' ? ' open' : ''}`}>
          <h4 onClick={() => toggle('help')}>
            Support <span className="ft-arr">▾</span>
          </h4>
          <ul className="ft-lnks">
            {[
              ["Contact Us", "contact"], ["Track Order", "track"], ["Size Guide", "sizeguide"], ["Bulk Orders", "bulk-orders"]
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
              ["About Us", "about"], ["Sustainability", "sustainability"], ["Shipping & Returns", "refund"], ["Privacy & Terms", "privacy"]
            ].map(([l, p]) => (
              <li key={l}><Link href={`/${p}`}>{l}</Link></li>
            ))}
          </ul>
        </div>
      </div>

      <div className="ft-btm">
        <div className="ft-copy">
          © 2026 Medvastr. All rights reserved. <br />
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
          background: #0f172a;
          color: white;
          padding: 40px 40px 20px;
          border-top: 1px solid rgba(255,255,255,0.05);
        }
        .ft-g {
          max-width: 1400px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1.8fr 1fr 1fr 1fr 1fr;
          gap: 30px;
          align-items: start;
        }
        .ft-logo { 
          font-family: var(--sans), sans-serif; 
          font-size: 34px; 
          font-weight: 900; 
          color: #ffffff; 
          letter-spacing: -0.03em; 
          text-transform: lowercase;
          margin-bottom: 8px;
          display: block;
        }
        .ft-tag { font-size: 11px; letter-spacing: 2px; color: #10b981; text-transform: uppercase; font-weight: 800; display: block; margin-bottom: 16px; }
        .ft-desc { font-size: 14px; color: #e2e8f0; margin-bottom: 16px; line-height: 1.6; max-width: 300px; }
        .ft-contact { font-size: 14px; color: #e2e8f0; line-height: 1.8; margin-bottom: 20px; }
        .ft-contact a { color: #ffffff; transition: color 0.2s; text-decoration: none; font-weight: 600; }
        .ft-contact a:hover { color: #10b981; }
        .ft-soc { display: flex; gap: 10px; flex-wrap: wrap; margin-top: auto; }
        .ft-s-a { padding: 0 14px; height: 34px; border-radius: 6px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; transition: all 0.3s; color: white; text-decoration: none; white-space: nowrap; width: auto; }
        .ft-s-a:hover { background: #10b981; border-color: #10b981; transform: translateY(-3px); }
        h4 { font-size: 12px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 16px; color: #10b981; }
        ul { list-style: none; padding: 0; }
        li { margin-bottom: 10px; }
        li a { font-size: 14px; color: #cbd5e1; transition: all 0.2s; text-decoration: none; font-weight: 500; }
        li a:hover { color: #ffffff; padding-left: 5px; }
        .ft-btm { max-width: 1400px; margin: 30px auto 0; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.06); display: flex; justify-content: space-between; align-items: center; }
        .ft-copy { font-size: 13.5px; color: #94a3b8; font-weight: 500; }
        .ft-credit a { color: #cbd5e1; font-weight: 600; text-decoration: none; }
        .ft-credit a:hover { color: white; }
        .ft-pay { display: flex; gap: 10px; flex-wrap: wrap; justify-content: flex-end; }
        .pay-p { font-size: 11px; font-weight: 800; padding: 6px 12px; background: rgba(255,255,255,0.03); border-radius: 6px; color: #cbd5e1; border: 1px solid rgba(255,255,255,0.05); }

        @media(max-width: 768px) {
          footer { padding: 50px 24px 40px; }
          .ft-g { grid-template-columns: 1fr; gap: 0; }
          .ft-brand { margin-bottom: 40px; text-align: center; }
          .ft-desc { margin: 15px auto; text-align: center; }
          .ft-soc { justify-content: center; }
          .ft-col { border-bottom: 1px solid rgba(255,255,255,0.06); }
          .ft-col h4 { margin-bottom: 0; padding: 18px 0; }
          .ft-lnks { display: none; padding-bottom: 20px; }
          .ft-col.open .ft-lnks { display: block; }
          .ft-btm { flex-direction: column; text-align: center; gap: 30px; margin-top: 40px; }
          .ft-arr { display: inline-block; transition: transform 0.3s; margin-left: 6px; font-size: 10px; opacity: 0.5; }
          .ft-col.open .ft-arr { transform: rotate(180deg); opacity: 1; color: var(--t); }
          .ft-col h4 { display: flex; justify-content: space-between; align-items: center; }
        }
      `}</style>
    </footer >
  );
}
