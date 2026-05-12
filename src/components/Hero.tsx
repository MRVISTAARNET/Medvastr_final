"use client";

import React, { useState, useEffect, useRef } from "react";
import { SLIDES } from "@/lib/data";

interface HeroProps {
  onShop: () => void;
}

export default function Hero({ onShop }: HeroProps) {
  const [cur, setCur] = useState(0);
  const [au, setAu] = useState(true);
  const t = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!au) return;
    t.current = setInterval(() => setCur((c) => (c + 1) % SLIDES.length), 5500);
    return () => {
      if (t.current) clearInterval(t.current);
    };
  }, [au, cur]);

  const go = (d: number) => {
    setCur((cur + d + SLIDES.length) % SLIDES.length);
    setAu(false);
    setTimeout(() => setAu(true), 9000);
  };

  return (
    <div className="hero">
      <div className="hero-track" style={{ transform: `translateX(-${cur * 100}%)` }}>
        {SLIDES.map((s, i) => (
          <div className="hero-slide" key={i}>
            <div className="slide-bg" style={{ background: `linear-gradient(132deg,${s.g1} 52%,${s.g2})` }} />
            <div className="slide-body">
              <div className="slide-txt">
                <div className="slide-ey">⚕ {s.ey}</div>
                <h1 className="slide-h1">
                  {s.h}
                  {s.em && <em>{s.em}</em>}
                </h1>
                <p className="slide-p">{s.p}</p>
                <div className="slide-btns">
                  <button className="btn-p" onClick={onShop}>
                    {s.c1} →
                  </button>
                  <button className="btn-g" onClick={onShop}>
                    {s.c2}
                  </button>
                </div>
                <div className="slide-dots">
                  {SLIDES.map((_, j) => (
                    <button
                      key={j}
                      className={`sdot${cur === j ? " on" : ""}`}
                      onClick={() => {
                        setCur(j);
                        setAu(false);
                      }}
                    />
                  ))}
                </div>
              </div>
              <div className="slide-stats">
                {[
                  ["50K+", "Happy Doctors"],
                  ["4.8★", "Avg Rating"],
                  ["30+", "Colours"],
                  ["200+", "Wash Tests"],
                ].map(([n, l]) => (
                  <div className="sst" key={l}>
                    <span className="sst-n">{n}</span>
                    <div className="sst-l">{l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      <button className="hero-arr hero-p" onClick={() => go(-1)}>
        ‹
      </button>
      <button className="hero-arr hero-n" onClick={() => go(1)}>
        ›
      </button>
    </div>
  );
}
