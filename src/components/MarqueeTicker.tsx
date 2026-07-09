"use client";

import React from "react";

const items = [
    "LONG-SHIFT VERIFIED",
    "ANTI-MICROBIAL FABRIC",
    "200+ INDUSTRIAL WASHES",
    "LAB TESTED QUALITY",
    "UP TO 5 POCKETS",
    "MADE FOR HEALTHCARE",
    "ANTI-DISTRACTION FIT",
    "BACKED BY TECHNOLOGY",
    "TONS OF STORAGE",
    "FLAME RETARDANT",
];

export default function MarqueeTicker() {
    const doubled = [...items, ...items];

    return (
        <div
            style={{
                width: "100%",
                background: "#c8f535",
                overflow: "hidden",
                padding: "14px 0",
                borderTop: "2px solid #0f172a",
                borderBottom: "2px solid #0f172a",
            }}
        >
            <div className="ticker-track">
                {doubled.map((text, i) => (
                    <span key={i} className="ticker-item">
                        {text}
                        <span className="ticker-dot">✦</span>
                    </span>
                ))}
            </div>

            <style jsx>{`
        .ticker-track {
          display: flex;
          width: max-content;
          animation: ticker-scroll 35s linear infinite;
          align-items: center;
        }

        .ticker-item {
          display: inline-flex;
          align-items: center;
          gap: 18px;
          font-size: 13px;
          font-weight: 900;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          color: #0f172a;
          padding: 0 10px;
          white-space: nowrap;
        }

        .ticker-dot {
          font-size: 10px;
          color: #0f172a;
          opacity: 0.5;
        }

        @keyframes ticker-scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        @media (max-width: 768px) {
          .ticker-item {
            font-size: 11px;
            letter-spacing: 1.5px;
          }
        }
      `}</style>
        </div>
    );
}
