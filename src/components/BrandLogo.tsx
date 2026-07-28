import React from "react";

interface BrandLogoProps {
  dark?: boolean; // true for dark background (Footer), false for light background (Header)
  height?: number;
  noMargin?: boolean;
}

export default function BrandLogo({ dark = false, height, noMargin = false }: BrandLogoProps) {
  if (dark) {
    const finalHeight = height || 64;
    return (
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          background: "#ffffff",
          padding: "8px 18px",
          borderRadius: "12px",
          boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
          marginBottom: noMargin ? "0px" : "18px",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.png"
          alt="Medvarn"
          style={{
            height: `${finalHeight}px`,
            width: "auto",
            objectFit: "contain",
            display: "block",
          }}
        />
      </div>
    );
  }

  const finalHeight = height || 64;
  return (
    <div style={{ display: "inline-flex", alignItems: "center" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo.png"
        alt="Medvarn"
        style={{
          height: `${finalHeight}px`,
          width: "auto",
          objectFit: "contain",
          display: "block",
        }}
      />
    </div>
  );
}
