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
    t.current = setInterval(() => setCur((c) => (c + 1) % SLIDES.length), 6000);
    return () => {
      if (t.current) clearInterval(t.current);
    };
  }, [au, cur]);

  const go = (d: number) => {
    setCur((cur + d + SLIDES.length) % SLIDES.length);
    setAu(false);
    setTimeout(() => setAu(true), 10000);
  };

  return (
    <div className="hero">
      <div className="hero-track" style={{ transform: `translateX(-${cur * 100}%)` }}>
        {SLIDES.map((s, i) => (
          <div className="hero-slide" key={i}>
            <div className="slide-bg" style={{ backgroundImage: `url(${s.img})`, backgroundSize: 'cover', backgroundPosition: 'center', height: '100%' }} />
          </div>
        ))}
      </div>
      <button className="hero-arr hero-p" onClick={() => go(-1)}>
        ‹
      </button>
      <button className="hero-arr hero-n" onClick={() => go(1)}>
        ›
      </button>

      <style jsx>{`
        .slide-stats-glass {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          padding: 24px;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 20px;
          max-width: 320px;
        }
        .sst-g {
          text-align: center;
        }
        .sst-n {
          font-size: 24px;
          font-weight: 800;
          color: white;
          display: block;
        }
        .sst-l {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.8);
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-top: 4px;
        }
        @media (max-width: 768px) {
           .slide-stats-glass {
              margin: 40px auto 0;
              grid-template-columns: repeat(4, 1fr);
              max-width: 100%;
              padding: 15px;
              border-radius: 12px;
           }
           .sst-n { font-size: 18px; }
           .sst-l { font-size: 9px; }
           .slide-h1 { font-size: 32px; line-height: 1.1; }
        }
      `}</style>
    </div>
  );
}
