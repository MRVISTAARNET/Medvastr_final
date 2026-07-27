import React from "react";

interface BrandLogoProps {
  dark?: boolean; // true for dark background (Footer), false for light background (Header)
  height?: number;
}

export default function BrandLogo({ dark = false, height }: BrandLogoProps) {
  if (dark) {
    const finalHeight = height || 64;
    return (
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          background: "#ffffff",
          padding: "10px 22px",
          borderRadius: "12px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
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
