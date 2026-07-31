"use client";

import React from "react";
import { B } from "@/lib/data";

interface GenPageProps {
  title: string;
  desc?: string;
  children?: React.ReactNode;
}

export default function GenericPage({ title, desc, children }: GenPageProps) {
  React.useEffect(() => {
    document.title = `${title} | Medvarn`;
  }, [title]);

  return (
    <div className="page">
      <div
        className="inner-pg"
        style={{ maxWidth: 1400, margin: "0 auto", padding: "80px 20px" }}
      >
        <h1 style={{ fontSize: "clamp(24px, 3.2vw, 34px)", fontWeight: 800, color: "#0f2044", marginBottom: 10, letterSpacing: "-.02em", lineHeight: 1.25 }}>{title}</h1>
        <div className="inner-sub" style={{ fontSize: 15, color: "#64748b", marginBottom: 36, lineHeight: 1.5, fontWeight: 500 }}>
          {desc || "Medvarn – Premium Medical Apparel"}
        </div>
        <div className="inner-card" style={{ background: "var(--wh)", border: "1.5px solid var(--bdr)", borderRadius: 20, padding: 44, boxShadow: "var(--s2)" }}>
          {children || (
            <p style={{ fontSize: 16, lineHeight: 1.8, color: "var(--ink2)" }}>
              For questions, contact us at{" "}
              <a href={`mailto:${B.email}`} style={{ color: "var(--t)", fontWeight: 700 }}>
                {B.email}
              </a>{" "}
              or call{" "}
              <a href={`tel:${B.phone1}`} style={{ color: "var(--t)", fontWeight: 700 }}>
                {B.phone1}
              </a>
              .
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
