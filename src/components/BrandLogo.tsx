import React from "react";

interface BrandLogoProps {
  dark?: boolean; // true for dark background (Footer), false for light background (Header)
  height?: number;
}

export default function BrandLogo({ dark = false, height }: BrandLogoProps) {
  const finalHeight = height || (dark ? 56 : 68);

  if (dark) {
    return (
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          background: "#ffffff",
          padding: "8px 18px",
          borderRadius: "10px",
          boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
          marginBottom: "16px",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.png"
          alt="Medvarn"
          style={{
            height: `${finalHeight}px`,
            width: "auto",
            maxHeight: `${finalHeight}px`,
            objectFit: "contain",
            display: "block",
            transform: "scale(1.15)",
          }}
        />
      </div>
    );
  }

  return (
    <div style={{ display: "inline-flex", alignItems: "center", padding: "2px 0", overflow: "visible" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo.png"
        alt="Medvarn"
        style={{
          height: `${finalHeight}px`,
          width: "auto",
          maxHeight: `${finalHeight}px`,
          objectFit: "contain",
          display: "block",
          transform: "scale(1.22)",
          transformOrigin: "left center",
        }}
      />
    </div>
  );
}
