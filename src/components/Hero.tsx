"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";

import { useApp } from "@/context/AppContext";
import { normalizeMediaUrl } from "@/lib/api";

interface HeroProps {
  onShop: () => void;
}

export default function Hero({ onShop }: HeroProps) {
  const [cur, setCur] = useState(0);
  const [au, setAu] = useState(true);
  const S3_BASE = "https://d2tnzshqdaedbc.cloudfront.net";
  const [dynamicSlides] = useState([
    { base: `${S3_BASE}/home-hero-1` },
    { base: `${S3_BASE}/home-hero-2` },
    { base: `${S3_BASE}/home-hero-3` }
  ]);
  const t = useRef<NodeJS.Timeout | null>(null);

  const { banners } = useApp();
  
  // Filter active banners for the top slot (HOME_TOP)
  const homeBanners = (banners || []).filter(
    (b: any) => b.isActive && b.position === "HOME_TOP"
  );

  // Use dynamic banners if uploaded; otherwise fall back to default slides
  const slides = homeBanners.length > 0 
    ? homeBanners.map((b: any) => ({
        id: b.id,
        src: b.imageUrl,
        link: b.linkUrl || null,
        title: b.title
      }))
    : dynamicSlides.map((s, i) => ({
        id: `fallback-${i}`,
        src: null,
        base: s.base,
        link: "/products",
        title: "Hero Promotional Banner"
      }));

  useEffect(() => {
    if (!au || slides.length <= 1) return;
    t.current = setInterval(() => setCur((c) => (c + 1) % slides.length), 6000);
    return () => {
      if (t.current) clearInterval(t.current);
    };
  }, [au, cur, slides.length]);

  const go = (d: number) => {
    if (slides.length <= 1) return;
    setCur((cur + d + slides.length) % slides.length);
    setAu(false);
    setTimeout(() => setAu(true), 10000);
  };

  return (
    <div className="hero">
      <div className="hero-track" style={{ transform: `translateX(-${cur * 100}%)` }}>
        {slides.map((s: any, i: number) => {
          const content = s.src ? (
            <img
              src={s.src}
              alt={s.title || "Hero Promotional Banner"}
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center bottom", display: "block" }}
            />
          ) : (
            <SmartSlide base={s.base} />
          );

          return (
            <div className="hero-slide" key={s.id}>
              {s.link ? (
                <Link href={s.link} style={{ display: "block", width: "100%", height: "100%" }}>
                  {content}
                </Link>
              ) : (
                content
              )}
            </div>
          );
        })}
      </div>
      {slides.length > 1 && (
        <>
          <button className="hero-arr hero-p" onClick={() => go(-1)}>
            ‹
          </button>
          <button className="hero-arr hero-n" onClick={() => go(1)}>
            ›
          </button>
        </>
      )}

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

// SmartSlide: always hides text, tries jpg/png/webp, and renders crop-free with height: auto
function SmartSlide({ base }: { base: string }) {
  const [src, setSrc] = useState(base + ".jpg");
  const tryNext = () => {
    if (src.endsWith(".jpg")) { setSrc(base + ".png"); }
    else if (src.endsWith(".png")) { setSrc(base + ".webp"); }
  };

  return (
    <img
      src={src}
      alt="Hero Promotional Banner"
      onError={tryNext}
      style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center bottom", display: "block" }}
    />
  );
}
