"use client";

import React from "react";
import Link from "next/link";

export default function AboutHomeSection() {
  return (
    <div className="about-home">
      <div className="about-home-in">
        <div>
          <div className="about-tag">⚕ Our Story</div>
          <h2 className="about-h">
            Where <em>comfort</em> meets clinical excellence
          </h2>
          <p className="about-p">
            Medvastr was born from a simple but powerful belief — that the people who dedicate their lives to healing
            others deserve apparel that works as hard as they do. Based in Mumbai, we design every scrub, lab coat and
            jacket with direct input from doctors, nurses and healthcare workers across India.
          </p>
          <div className="about-facts">
            {[
              ["50K+", "Happy Customers"],
              ["4.8★", "Average Rating"],
              ["200+", "Cities Delivered"],
              ["₹2Cr+", "Products Sold"],
            ].map(([n, l]) => (
              <div className="afact" key={l}>
                <span className="afact-n">{n}</span>
                <div className="afact-l">{l}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link href="/about" className="btn-p">
              Read Our Story →
            </Link>
            <Link href="/products" className="btn-g">
              Shop Now
            </Link>
          </div>
        </div>
        <div className="about-right">
          <div className="about-card-grid">
            {[
              { ico: "🧪", t: "Lab Tested", s: "Every fabric certified for 200+ wash durability", bg: "rgba(10,124,108,.3)" },
              { ico: "⏰", t: "Long-Shift Ready", s: "Engineered for 12+ hour comfort and focus", bg: "rgba(27,37,60,.6)" },
              { ico: "🛡️", t: "Anti-Distraction", s: "Design that lets you focus on patient care", bg: "rgba(195,128,48,.3)" },
              { ico: "👜", t: "Up to 9 Pockets", s: "Carry everything you need, always within reach", bg: "rgba(27,37,60,.6)" },
            ].map((c, i) => (
              <div key={i} className="acard" style={{ background: c.bg, border: "1px solid rgba(255,255,255,.1)" }}>
                <div className="acard-ico">{c.ico}</div>
                <div className="acard-t">{c.t}</div>
                <div className="acard-s">{c.s}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
