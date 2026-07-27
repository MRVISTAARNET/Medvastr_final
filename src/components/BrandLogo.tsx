import React from "react";

interface BrandLogoProps {
  dark?: boolean; // true for dark background (Footer), false for light background (Header)
  height?: number;
}

export default function BrandLogo({ dark = false, height }: BrandLogoProps) {
  if (dark) {
    const finalHeight = height || 58;
    return (
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          background: "#ffffff",
          padding: "10px 24px",
          borderRadius: "12px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.22)",
          marginBottom: "18px",
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
          }}
        />
      </div>
    );
  }

  const finalHeight = height || 54;
  return (
    <div style={{ display: "inline-flex", alignItems: "center", overflow: "hidden", maxHeight: "58px" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo.png"
        alt="Medvarn"
        style={{
          height: `${finalHeight}px`,
          width: "auto",
          maxHeight: "54px",
          objectFit: "contain",
          display: "block",
        }}
      />
    </div>
  );
}
