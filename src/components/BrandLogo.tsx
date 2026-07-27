import React from "react";

interface BrandLogoProps {
  dark?: boolean; // true for dark background (Footer), false for light background (Header)
  height?: number;
}

export default function BrandLogo({ dark = false, height = 46 }: BrandLogoProps) {
  if (dark) {
    return (
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          background: "#ffffff",
          padding: "6px 14px",
          borderRadius: "8px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.12)",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.png"
          alt="Medvarn"
          style={{
            height: `${height}px`,
            width: "auto",
            maxHeight: `${height}px`,
            objectFit: "contain",
            display: "block",
          }}
        />
      </div>
    );
  }

  return (
    <div style={{ display: "inline-flex", alignItems: "center" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo.png"
        alt="Medvarn"
        style={{
          height: `${height}px`,
          width: "auto",
          maxHeight: `${height}px`,
          objectFit: "contain",
          display: "block",
        }}
      />
    </div>
  );
}
