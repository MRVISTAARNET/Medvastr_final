"use client";

import React from "react";
import { B } from "@/lib/data";

interface GenPageProps {
  title: string;
  desc?: string;
  children?: React.ReactNode;
}

export default function GenericPage({ title, desc, children }: GenPageProps) {
  return (
    <div className="page">
      <div
        className="inner-pg"
        style={{ maxWidth: 960, margin: "0 auto", padding: "80px 20px" }}
      >
        <h1 style={{ fontFamily: "var(--serif)", fontSize: 52, fontWeight: 700, marginBottom: 12, letterSpacing: "-.03em" }}>{title}</h1>
        <div className="inner-sub" style={{ fontSize: 18, color: "var(--lt)", marginBottom: 48, lineHeight: 1.6 }}>
          {desc || "Medvastr – Premium Medical Apparel"}
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
