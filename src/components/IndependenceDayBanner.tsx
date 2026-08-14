"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const BANNER_DISMISSED_KEY = "medvarn_indday_banner_dismissed_2026";

export default function IndependenceDayBanner() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(BANNER_DISMISSED_KEY);
    if (!dismissed) setVisible(true);
  }, []);

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    localStorage.setItem(BANNER_DISMISSED_KEY, "1");
    setVisible(false);
  };

  const handleClick = () => {
    router.push("/products");
  };

  if (!visible) return null;

  return (
    <>
      <div
        className="ind-banner"
        onClick={handleClick}
        role="banner"
        aria-label="Independence Day Sale — Shop All Collections"
        style={{ cursor: "pointer" }}
      >
        {/* Tricolor top strip */}
        <div className="ind-tricolor">
          <span className="ind-saffron" />
          <span className="ind-white" />
          <span className="ind-green" />
        </div>

        {/* Main Banner Content */}
        <div className="ind-inner">
          {/* Left: Date block */}
          <div className="ind-left">
            <div className="ind-happy">HAPPY</div>
            <div className="ind-date">
              <span className="ind-15">15</span>
              <sup className="ind-th">TH</sup>
            </div>
            <div className="ind-aug">AUGUST</div>
            <div className="ind-tag">
              <span className="ind-line saffron" />
              INDEPENDENCE DAY
              <span className="ind-line green" />
            </div>
          </div>

          {/* Center: Ashoka Chakra + headline */}
          <div className="ind-center">
            {/* Ashoka Chakra SVG */}
            <svg className="ind-chakra" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <circle cx="60" cy="60" r="56" stroke="#1a56db" strokeWidth="4" fill="none" />
              <circle cx="60" cy="60" r="9" stroke="#1a56db" strokeWidth="3" fill="#1a56db" />
              {Array.from({ length: 24 }).map((_, i) => {
                const angle = (i * 360) / 24;
                const rad = (angle * Math.PI) / 180;
                const x1 = 60 + 9 * Math.cos(rad);
                const y1 = 60 + 9 * Math.sin(rad);
                const x2 = 60 + 52 * Math.cos(rad);
                const y2 = 60 + 52 * Math.sin(rad);
                return (
                  <line
                    key={i}
                    x1={x1} y1={y1} x2={x2} y2={y2}
                    stroke="#1a56db" strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                );
              })}
            </svg>

            <div className="ind-headline">
              <div className="ind-h1">Crafted for care.</div>
              <div className="ind-h2">Designed for those who do more.</div>
            </div>

            <button
              className="ind-shop-btn"
              onClick={(e) => { e.stopPropagation(); router.push("/products"); }}
              aria-label="Shop Now"
            >
              Shop Now →
            </button>
          </div>

          {/* Right: Message */}
          <div className="ind-right">
            <div className="ind-msg">
              Honoring freedom.<br />
              Serving the nation.<br />
              <strong>Together, we care.</strong>
            </div>
            {/* Balloons decoration */}
            <div className="ind-balloons" aria-hidden="true">
              <span className="ind-balloon saffron-b">🟠</span>
              <span className="ind-balloon white-b">⚪</span>
              <span className="ind-balloon green-b">🟢</span>
            </div>
          </div>
        </div>

        {/* Tricolor bottom strip */}
        <div className="ind-tricolor">
          <span className="ind-saffron" />
          <span className="ind-white" />
          <span className="ind-green" />
        </div>

        {/* Dismiss Button */}
        <button
          className="ind-close"
          onClick={handleDismiss}
          aria-label="Close Independence Day banner"
          title="Dismiss"
        >
          ✕
        </button>
      </div>

      <style>{`
        /* ===================== INDEPENDENCE DAY BANNER ===================== */
        .ind-banner {
          position: relative;
          width: 100%;
          background: linear-gradient(135deg, #fffaf5 0%, #f0f7ff 40%, #f0fff4 100%);
          overflow: hidden;
          box-shadow: 0 4px 24px rgba(0,0,0,0.10);
          border-bottom: 1px solid #e2e8f0;
          user-select: none;
        }

        /* Tricolor strip (top + bottom) */
        .ind-tricolor {
          display: flex;
          height: 5px;
          width: 100%;
        }
        .ind-saffron { flex: 1; background: #FF9933; }
        .ind-white   { flex: 1; background: #FFFFFF; border-top: 1px solid #e2e8f0; }
        .ind-green   { flex: 1; background: #138808; }

        /* Inner layout */
        .ind-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          max-width: 1200px;
          margin: 0 auto;
          padding: 18px 60px 18px 40px;
          gap: 24px;
          min-height: 140px;
        }

        /* LEFT — Date block */
        .ind-left {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          flex-shrink: 0;
          min-width: 130px;
        }
        .ind-happy {
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 3px;
          color: #1a56db;
          margin-bottom: 0;
        }
        .ind-date {
          display: flex;
          align-items: flex-start;
          line-height: 1;
        }
        .ind-15 {
          font-size: 52px;
          font-weight: 900;
          color: #FF9933;
          line-height: 1;
          font-family: var(--font-sans, sans-serif);
        }
        .ind-th {
          font-size: 16px;
          font-weight: 800;
          color: #FF9933;
          margin-top: 10px;
          margin-left: 2px;
        }
        .ind-aug {
          font-size: 22px;
          font-weight: 900;
          color: #138808;
          letter-spacing: 2px;
          margin-top: -4px;
        }
        .ind-tag {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 9px;
          font-weight: 700;
          color: #334155;
          letter-spacing: 1.5px;
          margin-top: 4px;
          white-space: nowrap;
        }
        .ind-line {
          display: inline-block;
          width: 14px;
          height: 2px;
          border-radius: 2px;
        }
        .ind-line.saffron { background: #FF9933; }
        .ind-line.green   { background: #138808; }

        /* CENTER */
        .ind-center {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          flex: 1;
          gap: 8px;
          text-align: center;
        }
        .ind-chakra {
          width: 60px;
          height: 60px;
          opacity: 0.18;
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
        }
        .ind-headline {
          position: relative;
          z-index: 1;
        }
        .ind-h1 {
          font-size: 16px;
          font-weight: 700;
          color: #1e293b;
          letter-spacing: 0.3px;
        }
        .ind-h2 {
          font-size: 18px;
          font-weight: 800;
          color: #1a56db;
          margin-top: 2px;
        }
        .ind-shop-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #1a56db;
          color: #ffffff;
          border: none;
          border-radius: 50px;
          padding: 9px 24px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.2s, transform 0.15s;
          position: relative;
          z-index: 2;
          margin-top: 4px;
          letter-spacing: 0.4px;
        }
        .ind-shop-btn:hover {
          background: #1248c2;
          transform: scale(1.04);
        }

        /* RIGHT */
        .ind-right {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          flex-shrink: 0;
          min-width: 130px;
          gap: 8px;
        }
        .ind-msg {
          font-size: 13px;
          color: #1e293b;
          text-align: right;
          line-height: 1.6;
        }
        .ind-msg strong {
          color: #1a56db;
          font-weight: 800;
        }
        .ind-balloons {
          display: flex;
          gap: 4px;
          font-size: 18px;
          opacity: 0.85;
        }

        /* Dismiss ✕ */
        .ind-close {
          position: absolute;
          top: 10px;
          right: 14px;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: rgba(0,0,0,0.08);
          border: none;
          font-size: 14px;
          color: #64748b;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s, color 0.2s;
          z-index: 10;
          line-height: 1;
        }
        .ind-close:hover {
          background: rgba(0,0,0,0.16);
          color: #0f172a;
        }

        /* ---- Mobile ---- */
        @media (max-width: 768px) {
          .ind-inner {
            flex-direction: column;
            align-items: center;
            padding: 16px 20px 14px;
            min-height: unset;
            gap: 10px;
            text-align: center;
          }
          .ind-left {
            align-items: center;
            flex-direction: row;
            gap: 12px;
            min-width: 0;
          }
          .ind-left .ind-happy { display: none; }
          .ind-tag { font-size: 8px; }
          .ind-15  { font-size: 38px; }
          .ind-aug { font-size: 16px; margin-top: -2px; }
          .ind-right { align-items: center; }
          .ind-msg { text-align: center; font-size: 12px; }
          .ind-h1  { font-size: 13px; }
          .ind-h2  { font-size: 14px; }
          .ind-shop-btn { font-size: 12px; padding: 8px 20px; }
          .ind-close { top: 8px; right: 10px; width: 24px; height: 24px; font-size: 12px; }
        }

        @media (max-width: 480px) {
          .ind-right { display: none; }
          .ind-h1  { font-size: 12px; }
          .ind-h2  { font-size: 13px; }
        }
        /* ================================================================== */
      `}</style>
    </>
  );
}
