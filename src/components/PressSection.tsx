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
    <div className="press-sec" style={{ overflow: 'hidden', padding: '40px 0', background: '#fff' }}>
      <div className="press-in" style={{ maxWidth: '1560px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{
          textAlign: 'center',
          fontSize: '13px',
          fontWeight: 800,
          letterSpacing: '3px',
          textTransform: 'uppercase',
          color: '#64748b',
          marginBottom: '28px'
        }}>
          Trusted by &amp; Featured In
        </div>
        <div className="press-logos-wrap">
          <div className="press-logos-marquee">
            {[...logos, ...logos].map(([ico, nm, d], i) => (
              <div className="press-logo" key={`${nm}-${i}`}>
                <div style={{ fontSize: '28px', marginBottom: '6px', textAlign: 'center' }}>{ico}</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', textAlign: 'center', whiteSpace: 'nowrap' }}>{nm}</div>
                <div style={{ fontSize: '11px', color: '#64748b', textAlign: 'center', marginTop: '2px' }}>{d}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <style jsx>{`
        .press-logos-wrap {
          overflow: hidden;
          width: 100%;
        }
        .press-logos-marquee {
          display: flex;
          gap: 60px;
          width: max-content;
          animation: marquee 30s linear infinite;
        }
        .press-logo {
          flex: 0 0 auto;
          min-width: 160px;
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
