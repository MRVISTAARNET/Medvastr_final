import React from "react";
import Link from "next/link";

interface BrandLogoProps {
  dark?: boolean; // true for dark backgrounds (e.g. Footer), false for light backgrounds (Header)
  height?: number;
  showTagline?: boolean;
}

export default function BrandLogo({ dark = false, height = 38, showTagline = true }: BrandLogoProps) {
  const textColor = dark ? "#ffffff" : "#0f172a";
  const subtextColor = dark ? "#94a3b8" : "#008080";
  const iconBg = dark ? "rgba(255,255,255,0.12)" : "#0f172a";

  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", textDecoration: "none", userSelect: "none" }}>
      {/* Brand Icon SVG */}
      <svg width={height} height={height} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
        <rect width="40" height="40" rx="10" fill={iconBg} />
        {/* Sleek Medical M + R Ribbon Icon */}
        <path d="M10 27V15C10 15 12.5 13 15 15C17.5 17 17.5 23 20 23C22.5 23 22.5 16 25 16C27.5 16 28 18 28 20V27" stroke="#008080" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="20" cy="14" r="2.5" fill="#3b82f6" />
      </svg>

      {/* Brand Text */}
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", lineHeight: "1.05" }}>
        <span style={{ fontSize: height > 34 ? "22px" : "19px", fontWeight: 800, letterSpacing: "-0.5px", color: textColor, fontFamily: "var(--sans), system-ui, sans-serif" }}>
          med<span style={{ color: "#008080" }}>varn</span>
        </span>
        {showTagline && (
          <span style={{ fontSize: "8px", fontWeight: 700, letterSpacing: "0.8px", color: subtextColor, textTransform: "uppercase", marginTop: "2px", whiteSpace: "nowrap" }}>
            The colour of wellness
          </span>
        )}
      </div>
    </div>
  );
}
