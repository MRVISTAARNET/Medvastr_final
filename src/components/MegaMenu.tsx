"use client";

import React from "react";
import { PRODUCTS } from "@/lib/data";

interface MegaMenuProps {
  gender: "men" | "women";
}

export default function MegaMenu({ gender }: MegaMenuProps) {
  const G = gender === "men";

  const quickLinks = G
    ? [
        { l: "All Men", cat: "all" },
        // { l: "DRIFT Jacket", cat: "jacket", nw: true },
        { l: "Stethoscope", cat: "stethoscope" },
        { l: "LAST CHANCE", cat: "all", red: true },
        // { l: "Plus Size", cat: "scrubs" },
        { l: "New Arrivals", cat: "all" },
        // { l: "ecoflex™ 2-way", cat: "scrubs" },
        // { l: "ecoflex™ 4-way", cat: "scrubs" },
      ]
    : [
        { l: "All Women", cat: "all" },
        // { l: "DRIFT Jacket", cat: "jacket", nw: true },
        { l: "Stethoscope", cat: "stethoscope" },
        { l: "LAST CHANCE", cat: "all", red: true },
        // { l: "Plus Size", cat: "scrubs" },
        { l: "New Arrivals", cat: "all" },
        // { l: "ecoflex™ 2-way", cat: "scrubs" },
        // { l: "ecoflex™ 4-way", cat: "scrubs" },
      ];

  const scrubs = [
    { l: "Scrubs with Logo" },
    { l: "Nurse Uniform with Logo" },
  ];

  const labCoats = [
    { l: "Linen Towel" },
    { l: "Green Sheet" },
    { l: "Cardiac Trolley Sheet" },
    { l: "Single Bed Blanket" },
  ];

  const accessories = G
    ? [{ l: "Stethoscope" }, { l: "Scrub Cap" }]
    : [{ l: "Stethoscope" }, { l: "Scrub Cap" }];

  const colours = G
    ? [
        { l: "Ceil Blue", h: "#7b9db3" },
        { l: "Navy", h: "#1a2744" },
        { l: "Eucalyptus", h: "#7aab8a" },
        { l: "Black", h: "#1a1a1a" },
        { l: "Maroon", h: "#7a3535" },
        { l: "Wine", h: "#7b1c3c" },
        { l: "Steel Grey", h: "#607d8b" },
        { l: "Forest Green", h: "#1d6e55" },
        { l: "Heather Grey", h: "#9e9e9e" },
        { l: "Olive", h: "#6b7f6b" },
        { l: "Charcoal", h: "#3a3a3a" },
        { l: "Military Green", h: "#4a5e3a", nw: true },
      ]
    : [
        { l: "Ceil Blue", h: "#7b9db3" },
        { l: "Navy", h: "#1a2744" },
        { l: "Galaxy Blue", h: "#2c3e7a" },
        { l: "Black", h: "#1a1a1a" },
        { l: "Steel Grey", h: "#607d8b" },
        { l: "Wine", h: "#7b1c3c" },
        { l: "Pastel Lilac", h: "#c4a4b8" },
        { l: "Forest Green", h: "#1d6e55" },
        { l: "Hot Pink", h: "#e8437a" },
        { l: "Maroon", h: "#7a3535" },
        { l: "Mauve", h: "#b58ca8" },
        { l: "Eucalyptus", h: "#7aab8a" },
        { l: "Heather Grey", h: "#9e9e9e" },
        { l: "Olive", h: "#6b7f6b" },
        { l: "Military Green", h: "#4a5e3a", nw: true },
      ];

  const fabric = [
    { l: "100% Cotton" },
    { l: "PC Cotton" },
    { l: "Wool (Blankets)" },
  ];

  const pockets = [{ l: "Free Size" }, { l: "XS / S / M / L" }, { l: "XL / XXL / 3XL" }];

  const apparel = [
    { l: "Surgeon Gown" }, 
    { l: "Maternity Gown" }, 
    { l: "Patient Dress" }
  ];

  return (
    <div className="mega">
      <div className="mega-top-bar">
        {quickLinks.map((q, i) => (
          <div
            key={i}
            className={`mega-top-link${q.nw ? " is-new" : ""}${q.red ? " is-red" : ""}`}
            style={q.red ? { borderColor: "var(--red)", color: "var(--red)", background: "#fdecea" } : {}}
          >
            {q.l}
            {q.nw && <span className="ntag">NEW</span>}
          </div>
        ))}
      </div>

      <div className="mega-in">
        <div className="mcol">
          <div className="mcol-sub">
            Uniforms & Scrubs <span style={{ fontSize: 10, color: "var(--t)", fontWeight: 700 }}>→</span>
          </div>
          <ul>
            {scrubs.map((x) => (
              <li key={x.l}>
                <span>{x.l}</span>
              </li>
            ))}
          </ul>
          <div className="mcol-sub" style={{ marginTop: 18 }}>
            Diagnostic & Caps
          </div>
          <ul>
            {accessories.map((x) => (
              <li key={x.l}>
                <span>{x.l}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mcol">
          <div className="mcol-sub">
            Linen & Bedding <span style={{ fontSize: 10, color: "var(--t)", fontWeight: 700 }}>→</span>
          </div>
          <ul>
            {labCoats.map((x) => (
              <li key={x.l}>
                <span>{x.l}</span>
              </li>
            ))}
          </ul>
          <div className="mcol-sub" style={{ marginTop: 18 }}>
            Surgical & Patient Wear
          </div>
          <ul>
            {apparel.map((x) => (
              <li key={x.l}>
                <span>
                  {x.l}
                  {x.nw && <span className="nnt">NEW</span>}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mcol">
          <div className="mcol-hd">
            Shop By Colour
            <span className="mcol-hd-link">See all →</span>
          </div>
          <div className="mega-clr-g">
            {colours.map((c) => (
              <div className="mclr" key={c.l}>
                <div className="mclr-d" style={{ background: c.h }} />
                <span className="mclr-n">
                  {c.l}
                  {c.nw && (
                    <span className="nnt" style={{ marginLeft: 4 }}>
                      NEW
                    </span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mcol">
          <div className="mcol-sub">Materials</div>
          <ul>
            {fabric.map((x) => (
              <li key={x.l}>
                <span>{x.l}</span>
              </li>
            ))}
          </ul>
          <div className="mcol-sub" style={{ marginTop: 18 }}>
            Sizes
          </div>
          <ul>
            {pockets.map((x) => (
              <li key={x.l}>
                <span>{x.l}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mcol" style={{ borderRight: "none" }} />

        <div
          className="mbanner"
          style={{
            background: G
              ? "linear-gradient(145deg,#101e34 0%,#0b2c26 100%)"
              : "linear-gradient(145deg,#2a0a1a 0%,#3e1030 100%)",
          }}
        >
          <div className="mban-content">
            <div className="mban-ico">{G ? "👨‍⚕️" : "👩‍⚕️"}</div>
            <span className="mban-t">Shop All {G ? "Men's" : "Women's"}</span>
            <span className="mban-s">View full collection →</span>
          </div>
        </div>
      </div>
    </div>
  );
}
