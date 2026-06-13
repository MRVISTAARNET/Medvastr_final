"use client";

import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { fmt } from "@/lib/data";

interface MegaMenuProps {
  gender?: "men" | "women";
  parentSlug?: string;
  label: string;
}

// Category icons map removed as requested by user.
function getCatIcon(slug: string, name: string): string | null {
  return null;
}

export default function MegaMenu({ gender, parentSlug, label }: MegaMenuProps) {
  const { products, categoryTree = [], colors = [], sizes = [] } = useApp();

  const genStr = gender ? (gender === "men" ? "MEN" : "WOMEN") : "";
  const genKey = gender || "";
  const queryGen = gender ? `gender=${gender}` : "";

  // Filter products by gender
  const genProducts = products.filter((p) => {
    if (!gender) return true;
    return !p.gen || p.gen.toLowerCase() === genKey || p.gen.toLowerCase() === "unisex";
  });

  // Find parent category
  const parentCat = categoryTree.find((c: any) =>
    (parentSlug && c.slug === parentSlug) ||
    (gender && c.slug === genKey) ||
    (label && c.name.toLowerCase() === label.toLowerCase()) ||
    (label === "BULK ORDER" && c.slug === "bulk-orders")
  );
  const subcats: any[] = parentCat?.children || [];

  // Featured product: first product in this section
  const featuredProduct = genProducts.find((p) =>
    subcats.some((c) => String(p.catId) === String(c.id))
  ) || genProducts[0];

  // All products under this menu's subcategories (for col 2)
  const allMenuProducts = genProducts
    .filter((p) => subcats.some((c) => String(p.catId) === String(c.id)))
    .slice(0, 6);

  const colours = colors.length > 0
    ? colors.slice(0, 6).map((c: any) => ({ l: c.name, h: c.hexCode, c: c.name }))
    : [
      { l: "Navy Blue", h: "#1a2b4a", c: "Navy Blue" },
      { l: "Royal Blue", h: "#1a56db", c: "Royal Blue" },
      { l: "Teal Green", h: "#0f766e", c: "Teal Green" },
      { l: "Wine", h: "#7f1d1d", c: "Wine" },
      { l: "Black", h: "#111827", c: "Black" },
    ];

  const sizeLinks = sizes.length > 0 ? sizes.slice(0, 9) : [
    { sizeValue: "XS" }, { sizeValue: "S" }, { sizeValue: "M" },
    { sizeValue: "L" }, { sizeValue: "XL" }, { sizeValue: "XXL" },
    { sizeValue: "3XL" }, { sizeValue: "4XL" }, { sizeValue: "5XL" },
  ];

  const catLabel = gender === "men" ? "MEN CATEGORIES" : gender === "women" ? "WOMEN CATEGORIES" : `${label.toUpperCase()} CATEGORIES`;

  const isClothing = !["BULK ORDER", "BULK ORDERS"].includes(label.toUpperCase());

  return (
    <div className="mega">
      <div className="mega-in" style={{ gridTemplateColumns: '1.2fr 1fr 1fr' }}>

        {/* COL 1: Deep Categories */}
        <div className="mcol" style={{ gridColumn: "span 1" }}>
          <div className="mcol-hd">{catLabel}</div>
          <ul className="m-deep-list">
            {subcats.length > 0 ? subcats.map((cat: any) => (
              <li key={cat.id} className="m-parent-li">
                <Link href={`/products?cat=${cat.slug}${queryGen ? `&${queryGen}` : ""}`} className="m-p-link">
                  {cat.navLabel || cat.name}
                  {cat.children?.length > 0 && <span className="mcat-arrow">▾</span>}
                </Link>
                {cat.children?.length > 0 && (
                  <ul className="m-sub-list">
                    {cat.children.map((sub: any) => (
                      <li key={sub.id}>
                        <Link href={`/products?cat=${sub.slug}${queryGen ? `&${queryGen}` : ""}`}>
                          {sub.navLabel || sub.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            )) : (
              <li>
                <span style={{ fontSize: 12, opacity: 0.5, padding: "8px 10px", display: "block" }}>
                  No categories yet
                </span>
              </li>
            )}
          </ul>
        </div>

        {isClothing ? (
          <>
            {/* COL 2: Popular Colors */}
            <div className="mcol">
              <div className="mcol-hd">Popular Colors</div>
              <div className="mega-clr-g">
                {colours.map((c) => (
                  <Link
                    key={c.l}
                    href={`/products?color=${encodeURIComponent(c.c)}${queryGen ? `&${queryGen}` : ""}${parentSlug ? `&cat=${parentSlug}` : ""}`}
                    className="mclr"
                  >
                    <div className="mclr-d" style={{ background: c.h }} />
                    <span className="mclr-n">{c.l}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* COL 3: Sizes */}
            <div className="mcol" style={{ borderRight: "none" }}>
              <div className="mcol-hd">Sizes</div>
              <div className="msize-grid">
                {sizeLinks.map((s: any) => (
                  <Link
                    key={s.sizeValue || s.name}
                    href={`/products?size=${s.sizeValue || s.name}${queryGen ? `&${queryGen}` : ""}${parentSlug ? `&cat=${parentSlug}` : ""}`}
                    className="msize-pill"
                  >
                    {s.sizeValue || s.name}
                  </Link>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="mcol" style={{ gridColumn: "span 2", padding: "40px", background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)", marginLeft: "20px", borderRadius: 16, border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <h3 style={{ fontSize: 24, fontWeight: 800, color: "#0f7c6e", marginBottom: 16, letterSpacing: "-0.02em" }}>Premium {label} Supplies</h3>
            <p style={{ fontSize: 15, color: "#475569", lineHeight: 1.7, marginBottom: 30 }}>
              Explore our comprehensive <b>{label.toLowerCase()}</b> inventory. Engineered for supreme durability and rigorous medical standards.
            </p>
            <Link
              href={label.toUpperCase().includes("BULK") ? "/bulk-orders" : `/products?cat=${parentCat?.slug}`}
              style={{ display: "inline-flex", width: 'fit-content', alignItems: "center", justifyContent: "center", background: "#0f7c6e", color: "white", padding: "14px 28px", borderRadius: 8, fontSize: 14, fontWeight: 700, textDecoration: "none" }}
            >
              Explore Collection
            </Link>
          </div>
        )}
      </div>

      <style jsx>{`
        .m-deep-list { list-style: none; padding: 0; margin: 0; }
        .m-parent-li { margin-bottom: 20px; }
        .m-p-link { font-weight: 800 !important; color: #0f172a !important; font-size: 15px !important; display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px !important; }
        .m-sub-list { list-style: none; padding-left: 20px; border-left: 1px solid #e2e8f0; margin-top: 5px; }
        .m-sub-list li { padding: 4px 0; }
        .m-sub-list a { font-size: 13px !important; color: #64748b !important; font-weight: 500 !important; }
        .m-sub-list a:hover { color: #0f7c6e !important; }
        .mcat-arrow { font-size: 10px; opacity: 0.5; }
      `}</style>
    </div>
  );
}

