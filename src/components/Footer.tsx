"use client";

import React, { useState } from "react";
import Link from "next/link";
import { B } from "@/lib/data";

export default function Footer() {
  const [openCol, setOpenCol] = useState<string | null>(null);

  const toggle = (id: string) => {
    if (window.innerWidth <= 768) {
      setOpenCol(openCol === id ? null : id);
    }
  };

  return (
    <footer className="ft">
      <div className="ft-g">
        <div>
          <div className="ft-logo">
            Medva<span>str</span>
          </div>
          <span className="ft-tag">Premium Medical Apparel</span>
          <p className="ft-desc">
            India's leading medical apparel brand. Built for doctors, nurses and healthcare professionals.
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

        {[
          {
            id: "men",
            h: "Men",
            links: [
              ["V-Neck Scrubs", "scrubs"],
              ["Mandarin Collar", "scrubs"],
              ["ecoflex™ Scrubs", "scrubs"],
              ["Lab Coats", "labcoat"],
              ["Underscrubs", "underscrub"],
              ["DRIFT Jacket", "jacket"],
              ["Accessories", "accessories"],
            ],
          },
          {
            id: "women",
            h: "Women",
            links: [
              ["V-Neck Scrubs", "scrubs"],
              ["Mandarin Collar", "scrubs"],
              ["ecoflex™ Scrubs", "scrubs"],
              ["Lab Coats", "labcoat"],
              ["Underscrubs", "underscrub"],
              ["DRIFT Jacket", "jacket"],
              ["Hijab", "accessories"],
            ],
          },
          {
            id: "help",
            h: "Help",
            links: [
              ["Track My Order", "track"],
              ["Returns & Exchanges", "returns"],
              ["Size Guide", "sizeguide"],
              ["Bulk Orders", "bulk"],
              ["Contact Us", "contact"],
            ],
          },
          {
            id: "comp",
            h: "Company",
            links: [
              ["About Us", "about"],
              ["Blog & Resources", "blog"],
              ["Sustainability", "sustainability"],
              ["Privacy Policy", "privacy"],
              ["Terms of Service", "terms"],
            ],
          },
        ].map((col) => (
          <div className="ft-col" key={col.id}>
            <div className="ft-col-h" onClick={() => toggle(col.id)}>
              <h4>{col.h}</h4>
              <span className="ft-col-ico">{openCol === col.id ? "−" : "+"}</span>
            </div>
            <ul className={`ft-lnks${openCol === col.id ? " on" : ""}`}>
              {col.links.map(([l, p]) => (
                <li key={l}>
                  <Link href={p.startsWith("/") ? p : `/products?cat=${p}`}>{l}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="ft-btm">
        <div>
          © 2026 Medvastr. All rights reserved. 
          <br className="mob-only" />
          <span style={{ marginLeft: 10 }}>
            Made by <a href="https://mrvistaarnet.com" target="_blank" rel="noopener" style={{ color: 'var(--t)', fontWeight: 600 }}>MRVISTAARNET</a>
          </span>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center", marginTop: 10 }}>
          <span style={{ opacity: 0.5, fontSize: 11 }}>Payments:</span>
          {["UPI", "Visa", "MC", "Amex", "COD"].map((p) => (
            <span key={p} className="pay-p">
              {p}
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
}
