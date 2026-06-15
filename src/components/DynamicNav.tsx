"use client";

import React, { useState } from "react";
import Link from "next/link";
import MegaMenu from "./MegaMenu";

export interface NavItem {
  id: number;
  label: string;
  href?: string;
  itemType?: "LINK" | "DROPDOWN" | "MEGA_MENU";
  gender?: string;
  categorySlug?: string;
  openNewTab?: boolean;
  children?: NavItem[];
}

interface DynamicNavProps {
  items: NavItem[];
  categoryTree?: any[];
  mobileOpen?: boolean;
  onNavigate?: () => void;
  mobileGroup?: string | null;
  setMobileGroup?: (g: string | null) => void;
}

export default function DynamicNav({
  items,
  categoryTree = [],
  mobileOpen,
  onNavigate,
  mobileGroup,
  setMobileGroup,
}: DynamicNavProps) {
  const [localGroup, setLocalGroup] = useState<string | null>(null);
  const mo = mobileGroup ?? localGroup;
  const setMo = setMobileGroup ?? setLocalGroup;

  const close = () => onNavigate?.();

  const renderDropdownChildren = (item: NavItem) => {
    if (item.children?.length) {
      return (
        <div className="flexy-sub" style={{ minWidth: 260, padding: "20px 24px", display: "block", left: 0, borderTop: "3px solid #0f172a" }}>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {item.children.map((child) => (
              <li key={child.id} style={{ padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
                <Link href={child.href || "#"} onClick={close} style={{ textDecoration: "none", color: "#374151", fontWeight: 600, fontSize: "14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>{child.label}</span>
                  <span style={{ color: "#0f7c6e", fontSize: "12px", opacity: 0.6 }}>›</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      );
    }

    const cat = categoryTree.find((c) =>
      c.slug === item.categorySlug ||
      c.name.toLowerCase() === item.label.toLowerCase() ||
      (item.label.toUpperCase() === "BULK ORDER" && c.slug === "bulk-orders") ||
      (item.label.toUpperCase() === "BULK ORDERS" && c.slug === "bulk-orders")
    );
    const subs = cat?.children || [];
    if (!subs.length) return null;

    return (
      <div className="flexy-sub" style={{ minWidth: 260, padding: "20px 24px", display: "block", left: 0, borderTop: "3px solid #0f172a" }}>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {subs.map((sub: any) => (
            <li key={sub.id} style={{ padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
              <Link href={`/products?cat=${sub.slug}`} onClick={close} style={{ textDecoration: "none", color: "#374151", fontWeight: 600, fontSize: "14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>{sub.navLabel || sub.name}</span>
                <span style={{ color: "#0f7c6e", fontSize: "12px", opacity: 0.6 }}>›</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="nav-in">
      {items.map((item) => {
        const key = String(item.id);
        // Auto-detect if it's a dropdown based on category tree children
        const matchingCat = categoryTree.find((c) =>
          c.slug === item.categorySlug ||
          c.name.toLowerCase() === item.label.toLowerCase() ||
          (item.label.toUpperCase().includes("BULK ORDER") && c.slug === "bulk-orders")
        );
        const hasSubs = matchingCat?.children && matchingCat.children.length > 0;

        // If it has subs, we upgrade it to MEGA_MENU so it looks premium
        const isMega = item.itemType === "MEGA_MENU" || hasSubs;
        const isDropdown = item.itemType === "DROPDOWN" && !isMega;

        if (isMega) {
          return (
            <div key={key} className={`nav-group${mo === key ? " mob-open" : ""}`}>
              <Link
                href={item.href || "#"}
                className="nl"
                onClick={(e) => {
                  if (typeof window !== "undefined" && window.innerWidth <= 1024) {
                    if (mo !== key) {
                      e.preventDefault();
                      setMo(key);
                    } else {
                      // Already open, allow navigation
                      close();
                    }
                  }
                }}
              >
                {item.label} <span className="nav-arrow">▾</span>
              </Link>
              <div className="nav-sub">
                <MegaMenu
                  gender={item.gender as any}
                  parentSlug={item.categorySlug}
                  label={item.label}
                />
              </div>
            </div>
          );
        }

        if (isDropdown) {
          return (
            <div key={key} className={`nav-group flexy-group${mo === key ? " mob-open" : ""}`} style={{ position: "relative", whiteSpace: "nowrap" }}>
              <div className="nl" onClick={() => setMo(mo === key ? null : key)}>
                {item.label} <span className="nav-arrow">▾</span>
              </div>
              {renderDropdownChildren(item)}
            </div>
          );
        }

        return (
          <Link
            key={key}
            href={item.href || "#"}
            className="nl"
            onClick={close}
            target={item.openNewTab ? "_blank" : undefined}
            rel={item.openNewTab ? "noopener noreferrer" : undefined}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
