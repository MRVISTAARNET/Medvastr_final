"use client";

import React from "react";
import Link from "next/link";
import { B } from "@/lib/data";

export default function Footer() {
  return (
    <footer>
      <div className="ft-g">
        <div>
          <div className="ft-logo">
            Medva<span>str</span>
          </div>
          <span className="ft-tag">Premium Medical Apparel</span>
          <p className="ft-desc">
            India's leading medical apparel brand. Built for doctors, nurses and healthcare professionals who give
            everything every single day.
          </p>
          <div className="ft-contact">
            📞 <a href={`tel:${B.phone}`}>{B.phone}</a>
            <br />
            ✉️ <a href={`mailto:${B.email}`}>{B.email}</a>
            <br />
            📍 {B.addr}
          </div>
          <div className="ft-soc">
            <a href={B.ig} target="_blank" rel="noopener" className="ft-s-a">📸</a>
            <a href={B.fb} target="_blank" rel="noopener" className="ft-s-a">f</a>
            <a href={B.li} target="_blank" rel="noopener" className="ft-s-a">in</a>
            <a href={B.yt} target="_blank" rel="noopener" className="ft-s-a">▶</a>
          </div>
        </div>
        <div className="ft-col">
          <h4>Men</h4>
          <ul className="ft-lnks">
            {[
              ["V-Neck Scrubs", "scrubs"],
              ["Mandarin Collar", "scrubs"],
              ["Longsleeve Scrubs", "scrubs"],
              ["ecoflex™ Scrubs", "scrubs"],
              ["Lab Coats", "labcoat"],
              ["Underscrubs", "underscrub"],
              ["DRIFT Jacket", "jacket"],
              ["Accessories", "accessories"],
              ["LAST CHANCE", "all"],
            ].map(([l, cat]) => (
              <li key={l}>
                <Link href={`/products?cat=${cat}`}>{l}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="ft-col">
          <h4>Women</h4>
          <ul className="ft-lnks">
            {[
              ["V-Neck Scrubs", "scrubs"],
              ["Mandarin Collar", "scrubs"],
              ["Longsleeve Scrubs", "scrubs"],
              ["ecoflex™ Scrubs", "scrubs"],
              ["Lab Coats", "labcoat"],
              ["Underscrubs", "underscrub"],
              ["DRIFT Jacket", "jacket"],
              ["Hijab", "accessories"],
              ["LAST CHANCE", "all"],
            ].map(([l, cat]) => (
              <li key={l}>
                <Link href={`/products?cat=${cat}`}>{l}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="ft-col">
          <h4>Help</h4>
          <ul className="ft-lnks">
            {[
              ["Track My Order", "track"],
              ["Returns & Exchanges", "returns"],
              ["Size Guide", "sizeguide"],
              ["Bulk Orders", "bulk"],
              ["Contact Us", "contact"],
              ["Breakpoint 24/7", "breakpoint"],
              ["Careers", "careers"],
            ].map(([l, p]) => (
              <li key={l}>
                <Link href={`/${p}`}>{l}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="ft-col">
          <h4>Company</h4>
          <ul className="ft-lnks">
            {[
              ["About Us", "about"],
              ["Blog & Resources", "blog"],
              ["Press Kit", "press"],
              ["Sustainability", "sustainability"],
              ["Privacy Policy", "privacy"],
              ["Terms of Service", "terms"],
              ["Shipping Policy", "shipping"],
              ["Refund Policy", "refund"],
            ].map(([l, p]) => (
              <li key={l}>
                <Link href={`/${p}`}>{l}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="ft-btm">
        <div>© 2026 Medvastr. All rights reserved. Made with ❤️ for India's Healthcare Heroes.</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ opacity: 0.5, fontSize: 11 }}>Payments:</span>
          {["UPI", "Visa", "MC", "Amex", "COD", "EMI", "NB"].map((p) => (
            <span key={p} className="pay-p">
              {p}
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
}
