import React from "react";

interface BrandLogoProps {
  dark?: boolean; // true for dark background (Footer), false for light background (Header)
  height?: number;
}

export default function BrandLogo({ dark = false, height }: BrandLogoProps) {
  if (dark) {
    const finalHeight = height || 72;
    return (
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          background: "#ffffff",
          padding: "14px 28px",
          borderRadius: "14px",
          boxShadow: "0 6px 24px rgba(0,0,0,0.25)",
          marginBottom: "20px",
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
            transform: "scale(1.2)",
          }}
        />
      </div>
    );
  }

  const finalHeight = height || 74;
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        height: `${finalHeight}px`,
        maxHeight: `${finalHeight}px`,
        overflow: "hidden",
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
          transform: "scale(1.35)",
          transformOrigin: "left center",
        }}
      />
    </div>
  );
}
