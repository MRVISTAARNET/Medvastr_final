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
  const [hoverOff, setHoverOff] = useState(false);
  const mo = mobileGroup ?? localGroup;
  const setMo = setMobileGroup ?? setLocalGroup;

  const close = () => onNavigate?.();

  const handleNavigate = () => {
    setHoverOff(true);
    close();
  };

  return (
    <div 
      className={`nav-in ${hoverOff ? "hover-off" : ""}`}
      onMouseLeave={() => setHoverOff(false)}
    >
      {items.map((item) => {
        const key = item.label;
        const isMega = item.type === "MEGA_MENU" && item.children && item.children.length > 0;

        if (isMega) {
          return (
            <div 
              key={key} 
              className={`nav-group${mo === key ? " mob-open" : ""}`}
              onMouseEnter={() => setHoverOff(false)}
            >
              <Link
                href={item.href}
                className="nl"
                onClick={(e) => {
                  if (typeof window !== "undefined" && window.innerWidth <= 1024) {
                    if (mo !== key) {
                      e.preventDefault();
                      setMo(key);
                    } else {
                      handleNavigate();
                    }
                  } else {
                    handleNavigate();
                  }
                }}
              >
                {item.label} <span className="nav-arrow">▾</span>
              </Link>
              <div className="nav-sub">
                <MegaMenu
                  items={item.children!}
                  label={item.label}
                  onNavigate={handleNavigate}
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
            onClick={handleNavigate}
            onMouseEnter={() => setHoverOff(false)}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
