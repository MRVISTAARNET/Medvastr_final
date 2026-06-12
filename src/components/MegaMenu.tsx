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
      <div className="mega-in">

        {/* COL 1: Categories with icons */}
        <div className="mcol">
          <div className="mcol-hd">{catLabel}</div>
          <ul>
            {subcats.length > 0 ? subcats.map((cat: any) => (
              <li key={cat.id}>
                <Link href={`/products?cat=${cat.slug}${genStr ? `&gen=${genStr}` : ""}`}>
                  {cat.navLabel || cat.name}
                  <span className="mcat-arrow">›</span>
                </Link>
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

        {/* COL 2: Products List - only show for clothing */}
        {isClothing && (
          <div className="mcol">
            <div className="mcol-hd">Latest Products</div>
            <div className="mprod-list" style={{ minHeight: 180 }}>
              {allMenuProducts.length > 0 ? (
                allMenuProducts.map((p) => (
                  <Link
                    key={p.id}
                    href={`/product/${p.slug || p.id}`}
                    className="mprod-li"
                  >
                    <div className="mprod-li-img">
                      {p.imgs?.[0] && <img src={p.imgs[0]} alt={p.name} />}
                    </div>
                    <div className="mprod-li-info">
                      <span className="mprod-li-name">{p.name}</span>
                      <span className="mprod-li-prc">{fmt(p.price)}</span>
                    </div>
                  </Link>
                ))
              ) : (
                <div style={{ padding: "20px 0", color: "#94a3b8", fontSize: 13, opacity: 0.8 }}>
                  No new arrivals currently.
                </div>
              )}
            </div>
            <Link
              href={`/products?${genStr ? `gen=${genStr}` : ""}${parentSlug ? `&cat=${parentSlug}` : ""}`}
              className="msize-guide"
            >
              Shop all &rsaquo;
            </Link>
          </div>
        )}

        {isClothing ? (
          <>
            {/* COL 3: Popular Colors */}
            <div className="mcol">
              <div className="mcol-hd">Popular Colors</div>
              <div className="mega-clr-g">
                {colours.map((c) => (
                  <Link
                    key={c.l}
                    href={`/products?color=${encodeURIComponent(c.c)}${genStr ? `&gen=${genStr}` : ""}${parentSlug ? `&cat=${parentSlug}` : ""}`}
                    className="mclr"
                  >
                    <div className="mclr-d" style={{ background: c.h }} />
                    <span className="mclr-n">{c.l}</span>
                  </Link>
                ))}
              </div>
              <Link
                href={`/products?${genStr ? `gen=${genStr}` : ""}`}
                className="msize-guide"
                style={{ marginTop: 10 }}
              >
                View all colors &rsaquo;
              </Link>
            </div>

            {/* COL 4: Sizes as pills */}
            <div className="mcol">
              <div className="mcol-hd">Sizes</div>
              <div className="msize-grid">
                {sizeLinks.map((s: any) => (
                  <Link
                    key={s.sizeValue || s.name}
                    href={`/products?size=${s.sizeValue || s.name}${genStr ? `&gen=${genStr}` : ""}${parentSlug ? `&cat=${parentSlug}` : ""}`}
                    className="msize-pill"
                  >
                    {s.sizeValue || s.name}
                  </Link>
                ))}
              </div>
              <Link
                href={`/products?${genStr ? `gen=${genStr}` : ""}`}
                className="msize-guide"
              >
                View size guide &rsaquo;
              </Link>
            </div>
          </>
        ) : (
          <div className="mcol" style={{ gridColumn: "span 3", padding: "40px", background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)", margin: "20px 0 20px 20px", borderRadius: 16, border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <h3 style={{ fontSize: 24, fontWeight: 800, color: "#0f7c6e", marginBottom: 16, letterSpacing: "-0.02em" }}>Premium {label} Supplies</h3>
            <p style={{ fontSize: 15, color: "#475569", lineHeight: 1.7, marginBottom: 30, maxWidth: "500px" }}>
              Explore our comprehensive <b>{label.toLowerCase()}</b> inventory. Engineered for supreme durability, optimal comfort, and rigorous medical standards. View our entire catalog and secure the absolute best quality for your facility.
            </p>
            <div style={{ display: "flex", gap: "12px" }}>
              <Link
                href={label.toUpperCase().includes("BULK") ? "/bulk-orders" : `/products?cat=${parentCat?.slug}`}
                style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", background: "#0f7c6e", color: "white", padding: "14px 28px", borderRadius: 8, fontSize: 14, fontWeight: 700, textDecoration: "none", transition: "background 0.2s" }}
              >
                Explore Collection
              </Link>
              {label.toUpperCase().includes("BULK") && (
                <Link
                  href="/contact"
                  style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "1px solid #cbd5e1", color: "#334155", padding: "14px 28px", borderRadius: 8, fontSize: 14, fontWeight: 700, textDecoration: "none", transition: "background 0.2s" }}
                >
                  Request Quote
                </Link>
              )}
            </div>
          </div>
        )}

        {/* COL 5: Featured Product card */}
        <div className="mcol" style={{ borderRight: "none" }}>
          <div className="mfeatured">
            <div className="mfeatured-label">Featured Product</div>
            {featuredProduct ? (
              <>
                <button className="mfeatured-wish" aria-label="Wishlist">&#9825;</button>
                <div className="mfeatured-img">
                  {featuredProduct.imgs?.[0] ? (
                    <img
                      src={featuredProduct.imgs[0]}
                      alt={featuredProduct.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <span style={{ fontSize: 40 }}>🩺</span>
                  )}
                </div>
                <div className="mfeatured-name">{featuredProduct.name}</div>
                <div className="mfeatured-price">{fmt(featuredProduct.price)}</div>
                <Link href={`/product/${featuredProduct.slug || featuredProduct.id}`} className="mfeatured-btn">
                  Shop Now
                </Link>
              </>
            ) : (
              <div className="mfeatured-img" style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)", color: "#94a3b8", fontWeight: 600, fontSize: 14 }}>
                <span style={{ opacity: 0.6 }}>Medvastr Premium</span>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

