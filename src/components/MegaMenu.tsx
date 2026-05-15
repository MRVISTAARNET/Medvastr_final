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
        { l: "Flexy Fit Scrub", cat: "men" },
        { l: "Green OT Gown", cat: "surgical" },
        { l: "Diagnostic", cat: "stethoscope" },
        { l: "Green Linen Sheet", cat: "linen" },
        { l: "New Arrivals", cat: "all" },
        { l: "Best Sellers", cat: "all" },
      ]
    : [
        { l: "Flexy Fit Scrub", cat: "women" },
        { l: "Green OT Gown", cat: "surgical" },
        { l: "Diagnostic", cat: "stethoscope" },
        { l: "Green Linen Sheet", cat: "linen" },
        { l: "New Arrivals", cat: "all" },
        { l: "Best Sellers", cat: "all" },
      ];

  const scrubs = [
    { l: "Flexy Fit 'V' Scrub" },
    { l: "Scrub Suit with Logo" },
    { l: "Nurse Uniform" },
    { l: "Premium Doctor Apron" },
    { l: "Customized Uniforms" },
  ];

  const labCoats = [
    { l: "Linen Towel (50x50)" },
    { l: "Green Sheet (100x100)" },
    { l: "Green Sheet (150x150)" },
    { l: "Green Sheet with Hole" },
    { l: "Cardiac Trolley Sheet" },
    { l: "Single Bed Blanket" },
  ];

  const accessories = G
    ? [{ l: "Stethoscope" }, { l: "Green Surgery Cap" }]
    : [{ l: "Stethoscope" }, { l: "Green Surgery Cap" }];

  const colours = [
    { l: "Dark Blue", h: "#1a2b4a" },
    { l: "Light Blue", h: "#add8e6" },
    { l: "Maroon", h: "#800000" },
    { l: "Wine", h: "#722f37" },
    { l: "Navy", h: "#1a2744" },
    { l: "Eucalyptus", h: "#7aab8a" },
    { l: "Black", h: "#1a1a1a" },
    { l: "Steel Grey", h: "#607d8b" },
    { l: "Forest Green", h: "#1d6e55" },
    { l: "Heather Grey", h: "#9e9e9e" },
    { l: "Olive", h: "#6b7f6b" },
    { l: "Military Green", h: "#4a5e3a" },
  ];

  const fabric = [
    { l: "100% Pure Cotton" },
    { l: "Premium PC Cotton" },
    { l: "Camel Brown Wool" },
  ];

  const pockets = [{ l: "Free Size" }, { l: "S / M / L / XL" }, { l: "XXL / 3XL" }];

  const apparel = [
    { l: "Green OT Gown" }, 
    { l: "Maternity Gown" }, 
    { l: "Hospital Gown" }
  ];

  return (
    <div className="mega">
      <div className="mega-top-bar">
        {quickLinks.map((q, i) => (
          <div
            key={i}
            className={`mega-top-link${(q as any).red ? " is-red" : ""}`}
            style={(q as any).red ? { borderColor: "var(--red)", color: "var(--red)", background: "#fdecea" } : {}}
          >
            {q.l}
          </div>
        ))}
      </div>

      <div className="mega-in">
        <div className="mcol">
          <div className="mcol-sub">
            Flexy Fit 'V' Scrub <span style={{ fontSize: 10, color: "var(--t)", fontWeight: 700 }}>→</span>
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
            By Size
          </div>
          <ul>
            {G ? (
              <>
                <li><span>M</span></li>
                <li><span>L</span></li>
                <li><span>XL</span></li>
                <li><span>XXL</span></li>
              </>
            ) : (
              <>
                <li><span>S</span></li>
                <li><span>M</span></li>
                <li><span>L</span></li>
                <li><span>XL</span></li>
              </>
            )}
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
