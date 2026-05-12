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
    <div className="press-sec">
      <div className="press-in">
        <div className="press-l">Trusted by & Featured In</div>
        <div className="press-logos">
          {logos.map(([ico, nm, d]) => (
            <div className="press-logo" key={nm}>
              <div className="pl-ico">{ico}</div>
              <div className="pl-nm">{nm}</div>
              <div className="pl-tag">{d}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
