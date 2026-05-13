"use client";

import React from "react";

export default function PressSection() {
  const logos = [
    ["🏥", "AIIMS Delhi", "Govt Hospital"],
    ["⚕", "Apollo Hospitals", "Private Healthcare"],
    ["🩺", "Fortis", "Multi-Specialty"],
    ["💊", "Max Healthcare", "Hospital Chain"],
    ["📰", "Times of India", "National Media"],
    ["📱", "YourStory", "Startup Media"],
  ];

  return (
    <div className="press-sec" style={{ overflow: 'hidden' }}>
      <div className="press-in">
        <div className="press-l">Trusted by & Featured In</div>
        <div className="press-logos-wrap">
          <div className="press-logos-marquee">
            {[...logos, ...logos].map(([ico, nm, d], i) => (
              <div className="press-logo" key={`${nm}-${i}`}>
                <div className="pl-ico">{ico}</div>
                <div className="pl-nm">{nm}</div>
                <div className="pl-tag">{d}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <style jsx>{`
        .press-logos-wrap {
          overflow: hidden;
          width: 100%;
          margin-top: 20px;
        }
        .press-logos-marquee {
          display: flex;
          gap: 30px;
          width: max-content;
          animation: marquee 30s linear infinite;
        }
        .press-logo {
          flex: 0 0 auto;
          min-width: 180px;
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
