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
          <div className="ft-logo">medvastr</div>
          <span className="ft-tag">Wear Wellness - Premium Medical Apparel</span>
          <p className="ft-desc">
            India's leading medical apparel brand. Built specifically for the modern healthcare professional who demands style and comfort.
          </p>

          <div className="ft-contact-list">
            <div className="contact-item">
              <span className="contact-icon">📞</span>
              <div className="contact-details">
                <a href={`tel:${B.phone1}`}>{B.phone1}</a>
                <span className="sep">•</span>
                <a href={`tel:${B.phone2}`}>{B.phone2}</a>
              </div>
            </div>
            <div className="contact-item">
              <span className="contact-icon">✉️</span>
              <a href={`mailto:${B.email}`}>{B.email}</a>
            </div>
            <div className="contact-item">
              <span className="contact-icon">📍</span>
              <span className="addr-text">{B.addr}</span>
            </div>
          </div>

          <div className="ft-soc-v2">
            <a href={B.ig} target="_blank" rel="noopener" className="social-circle ig" aria-label="Instagram">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
            <a href={B.fb} target="_blank" rel="noopener" className="social-circle fb" aria-label="Facebook">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.324v-21.35c0-.732-.593-1.325-1.325-1.325z" />
              </svg>
            </a>
            <a href={`https://wa.me/919920314164`} target="_blank" rel="noopener" className="social-circle wa" aria-label="WhatsApp">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.588-5.946 0-6.556 5.332-11.891 11.891-11.891 3.181 0 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.335 11.892-11.891 11.892-1.996 0-3.951-.5-5.688-1.448l-6.304 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884 0 2.225.584 3.899 1.698 5.623l-.991 3.616 3.791-.994zm11.423-7.484c-.307-.154-1.817-.897-2.098-.998-.282-.103-.488-.154-.691.154-.204.309-.789 1.002-.967 1.208-.177.206-.355.231-.662.077-.307-.154-1.297-.478-2.47-1.524-.913-.814-1.53-1.82-1.709-2.128-.179-.309-.019-.476.134-.63.139-.138.307-.359.462-.538.154-.18.206-.309.308-.513.103-.206.052-.385-.026-.538-.077-.154-.691-1.666-.947-2.282-.248-.6-.503-.518-.691-.528l-.589-.011c-.204 0-.538.077-.819.385-.282.308-1.077 1.051-1.077 2.564 0 1.513 1.099 2.973 1.253 3.179.154.206 2.164 3.303 5.244 4.634.733.316 1.305.505 1.748.647.737.236 1.408.203 1.94.124.593-.088 1.817-.743 2.073-1.46.257-.717.257-1.332.18-1.46-.077-.128-.282-.206-.589-.359z" />
              </svg>
            </a>
          </div>
        </div>



        <div className={`ft-col${openCol === 'links' ? ' open' : ''}`}>
          <h4 onClick={() => toggle('links')}>
            Quick Links <span className="ft-arr">▾</span>
          </h4>
          <ul className="ft-lnks">
            {[
              ["Scrub Suit", "scrubs", false, true],
              ["Cotton Crew T-Shirt", "tshirts", false, true],
              ["Full Sleeve Under Scrub", "underscrub", false, true],
              ["Surgical Gown", "surgical-surgeon-gown", false, false],
              ["Surgical Cap", "surgical-surgeon-cap", false, false],
              ["Linen & Bedding", "linen-and-bedding", true, false],
              ["Brown Blanket", "brown-blankets", true, false],
              ["Maternity Gown", "maternity-gown", true, false],
              ["Patient Dress", "patient-dress", true, false]
            ].map(([l, cat, isBulk, isType]) => (
              <li key={l as string}>
                <Link href={isBulk ? `/bulk-orders/${cat}` : (isType ? `/products?type=${cat}` : `/products?cat=${cat}`)}>{l as string}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className={`ft-col${openCol === 'company' ? ' open' : ''}`}>
          <h4 onClick={() => toggle('company')}>
            Company <span className="ft-arr">▾</span>
          </h4>
          <ul className="ft-lnks">
            {[
              ["About Us", "about"], ["Shipping & Returns", "refund"], ["Privacy & Terms", "privacy"]
            ].map(([l, p]) => (
              <li key={l}><Link href={`/${p}`}>{l}</Link></li>
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
          background: #0a0f1c;
          color: white;
          padding: 80px 40px 40px;
          border-top: 1px solid rgba(255,255,255,0.03);
          font-family: var(--sans), sans-serif;
        }
        .ft-g {
          max-width: 1400px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 2.5fr 1fr 1fr 1fr;
          gap: 45px;
          align-items: start;
        }
        .ft-brand {
           display: flex;
           flex-direction: column;
           gap: 15px;
        }
        .ft-logo { 
          font-size: 42px; 
          font-weight: 950; 
          color: #ffffff; 
          letter-spacing: -0.04em; 
          text-transform: lowercase;
          margin-bottom: 2px;
          line-height: 1;
        }
        .ft-tag { 
          font-size: 11px; 
          letter-spacing: 3px; 
          color: #94a3b8; 
          text-transform: uppercase; 
          font-weight: 700; 
          opacity: 0.8;
        }
        .ft-desc { 
          font-size: 14px; 
          color: #94a3b8; 
          line-height: 1.7; 
          max-width: 380px; 
          margin-bottom: 5px;
        }
        
        .ft-contact-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 10px;
        }
        .contact-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          font-size: 14px;
          color: #f1f5f9;
        }
        .contact-icon {
          width: 32px;
          height: 32px;
          background: rgba(255,255,255,0.05);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          flex-shrink: 0;
        }
        .contact-details {
           display: flex;
           gap: 8px;
           flex-wrap: wrap;
        }
        .contact-item a { color: #f1f5f9; text-decoration: none; border-bottom: 1px solid transparent; transition: all 0.2s; font-weight: 600; }
        .contact-item a:hover { border-bottom-color: #ffffff; color: white; }
        .sep { opacity: 0.3; }
        .addr-text { line-height: 1.5; color: #cbd5e1; }

        .ft-soc-v2 { 
          display: flex; 
          gap: 15px; 
          margin-top: 15px; 
        }
        .social-circle {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          background: rgba(255,255,255,0.05);
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          border: 1px solid rgba(255,255,255,0.05);
        }
        .social-circle:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.2);
        }
        .social-circle.ig:hover { background: radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285aeb 90%); border-color: transparent; }
        .social-circle.fb:hover { background: #1877f2; border-color: #1877f2; }
        .social-circle.wa:hover { background: #25d366; border-color: #25d366; }

        h4 { 
          font-size: 14px; 
          font-weight: 800; 
          letter-spacing: 1.5px; 
          text-transform: uppercase; 
          margin-bottom: 25px; 
          color: #ffffff; 
          position: relative;
          padding-bottom: 10px;
        }
        h4::after {
          content: '';
          position: absolute;
          left: 0;
          bottom: 0;
          width: 30px;
          height: 2px;
          background: rgba(255,255,255,0.2);
        }
        
        ul { list-style: none; padding: 0; }
        li { margin-bottom: 12px; }
        li a { font-size: 14px; color: #94a3b8; transition: all 0.2s; text-decoration: none; font-weight: 500; }
        li a:hover { color: #ffffff; transform: translateX(5px); display: inline-block; }

        .ft-btm { 
          max-width: 1400px; 
          margin: 60px auto 0; 
          padding-top: 30px; 
          border-top: 1px solid rgba(255,255,255,0.05); 
          display: flex; 
          justify-content: space-between; 
          align-items: center; 
        }
        .ft-copy { font-size: 13.5px; color: #64748b; font-weight: 500; line-height: 1.6; }
        .ft-credit a { color: #94a3b8; font-weight: 700; text-decoration: none; }
        .ft-credit a:hover { color: white; }
        
        .ft-pay { display: flex; gap: 8px; flex-wrap: wrap; justify-content: flex-end; }
        .pay-p { 
          font-size: 10px; 
          font-weight: 800; 
          padding: 6px 12px; 
          background: rgba(255,255,255,0.02); 
          border-radius: 6px; 
          color: #94a3b8; 
          border: 1px solid rgba(255,255,255,0.05); 
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        @media(max-width: 1024px) {
          .ft-g { gap: 30px; grid-template-columns: 2fr 1fr 1fr; }
        }

        @media(max-width: 768px) {
          footer { padding: 60px 24px 40px; }
          .ft-g { grid-template-columns: 1fr; gap: 0; }
          .ft-brand { margin-bottom: 50px; text-align: center; align-items: center; }
          .ft-desc { margin: 15px auto; text-align: center; }
          .ft-contact-list { align-items: center; }
          .contact-item { justify-content: center; }
          .ft-soc-v2 { justify-content: center; }
          
          .ft-col { border-bottom: 1px solid rgba(255,255,255,0.05); }
          .ft-col h4 { margin-bottom: 0; padding: 22px 0; font-size: 13px; }
          .ft-col h4::after { display: none; }
          .ft-lnks { display: none; padding-bottom: 25px; }
          .ft-col.open .ft-lnks { display: block; }
          
          .ft-btm { flex-direction: column; text-align: center; gap: 30px; margin-top: 40px; }
          .ft-pay { justify-content: center; }
          
          .ft-arr { display: inline-block; transition: transform 0.3s; margin-left: 6px; font-size: 10px; opacity: 0.5; }
          .ft-col.open .ft-arr { transform: rotate(180deg); opacity: 1; }
          .ft-col h4 { display: flex; justify-content: space-between; align-items: center; }
        }
      `}</style>
    </footer >
  );
}
