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

  // Duplicate for seamless marquee
  const items = [...logos, ...logos];

  return (
    <div className="press-sec">
      <div className="press-in">
        <div className="press-l" style={{ textAlign: 'center', marginBottom: 20 }}>Trusted by & Featured In</div>
        <div className="marquee-w">
          <div className="marquee-in">
            {items.map(([ico, nm, d], i) => (
              <div className="press-logo" key={`${nm}-${i}`} style={{ margin: '0 30px', flexShrink: 0 }}>
                <div className="pl-ico">{ico}</div>
                <div className="pl-nm">{nm}</div>
                <div className="pl-tag">{d}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
