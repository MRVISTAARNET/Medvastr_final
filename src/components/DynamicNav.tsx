"use client";

import React, { useState } from "react";
import Link from "next/link";
import MegaMenu from "./MegaMenu";
import { NavItem } from "@/lib/navData";

interface DynamicNavProps {
  items: NavItem[];
  mobileOpen?: boolean;
  onNavigate?: () => void;
  mobileGroup?: string | null;
  setMobileGroup?: (g: string | null) => void;
}

export default function DynamicNav({
  items,
  mobileOpen,
  onNavigate,
  mobileGroup,
  setMobileGroup,
}: DynamicNavProps) {
  const [localGroup, setLocalGroup] = useState<string | null>(null);
  const mo = mobileGroup ?? localGroup;
  const setMo = setMobileGroup ?? setLocalGroup;

  const close = () => onNavigate?.();

  return (
    <div className="nav-in">
      {items.map((item) => {
        const key = item.label;
        const isMega = item.type === "MEGA_MENU" && item.children && item.children.length > 0;

        if (isMega) {
          return (
            <div key={key} className={`nav-group${mo === key ? " mob-open" : ""}`}>
              <Link
                href={item.href}
                className="nl"
                onClick={(e) => {
                  if (typeof window !== "undefined" && window.innerWidth <= 1024) {
                    if (mo !== key) {
                      e.preventDefault();
                      setMo(key);
                    } else {
                      close();
                    }
                  }
                }}
              >
                {item.label} <span className="nav-arrow">▾</span>
              </Link>
              <div className="nav-sub">
                <MegaMenu
                  items={item.children!}
                  label={item.label}
                  onNavigate={close}
                />
              </div>
            </div>
          );
        }

        return (
          <Link
            key={key}
            href={item.href}
            className="nl"
            onClick={close}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
