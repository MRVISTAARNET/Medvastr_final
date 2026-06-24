"use client";

import React, { useState, useEffect } from "react";

interface ExpandableDescriptionProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function ExpandableDescription({ text, className, style }: ExpandableDescriptionProps) {
  const [expanded, setExpanded] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!text) return null;

  // On server side or before client-side hydration, render the default look
  if (!mounted || !isMobile) {
    return (
      <p className={className} style={{ margin: 0, ...style }}>
        {text}
      </p>
    );
  }

  // Mobile layout with truncation and "See More" toggle button
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <p
        className={className}
        style={{
          margin: 0,
          ...style,
          display: expanded ? "block" : "-webkit-box",
          WebkitLineClamp: expanded ? "unset" : 1,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {text}
      </p>
      {text.length > 40 && (
        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            background: "none",
            border: "none",
            color: "#008080",
            fontWeight: 700,
            fontSize: "13px",
            padding: 0,
            textAlign: "left",
            cursor: "pointer",
            width: "fit-content",
            outline: "none",
            textDecoration: "underline",
          }}
        >
          {expanded ? "See Less" : "See More"}
        </button>
      )}
    </div>
  );
}
