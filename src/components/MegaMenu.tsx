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
    (["BULK ORDER", "BULK ORDERS"].includes(label.toUpperCase()) && (c.slug === "bulk-orders" || c.slug === "bulk-order"))
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
      <div className="mega-in" style={{ gridTemplateColumns: '1.2fr 0.8fr 0.8fr 1fr' }}>

        {/* COL 1: Categories Hierarchy */}
        <div className="mcol">
          <div className="mcol-hd">{catLabel}</div>
          <ul className="m-deep-list">
            {subcats.length > 0 ? subcats.map((cat: any) => {
              const baseHref = isClothing ? `/products?cat=${cat.slug}${queryGen ? `&${queryGen}` : ""}` : `/bulk-orders/${cat.slug}`;
              return (
                <li key={cat.id} className="m-parent-li">
                  <Link href={baseHref} className="m-p-link">
                    {cat.navLabel || cat.name}
                    {cat.children?.length > 0 && <span className="mcat-arrow">▾</span>}
                  </Link>
                  {cat.children?.length > 0 && (
                    <ul className="m-sub-list">
                      {cat.children.map((sub: any) => (
                        <li key={sub.id}>
                          <Link href={isClothing ? `/products?cat=${sub.slug}${queryGen ? `&${queryGen}` : ""}` : `/bulk-orders/${sub.slug}`}>
                            {sub.navLabel || sub.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            }) : (
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
                    href={`/products?color=${encodeURIComponent(c.c)}${gender ? `&gender=${gender}` : ""}`}
                    className="mclr"
                  >
                    <div className="mclr-d" style={{ background: c.h }} />
                    <span className="mclr-n">{c.l}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* COL 3: Sizes */}
            <div className="mcol">
              <div className="mcol-hd">Sizes</div>
              <div className="msize-grid">
                {sizeLinks.map((s: any) => (
                  <Link
                    key={s.sizeValue || s.name}
                    href={`/products?size=${s.sizeValue || s.name}${gender ? `&gender=${gender}` : ""}`}
                    className="msize-pill"
                  >
                    {s.sizeValue || s.name}
                  </Link>
                ))}
              </div>
              <Link href="/sizeguide" className="msize-guide-btn">
                📏 Size Guide
              </Link>
            </div>

            {/* COL 4: Featured Product Card */}
            <div className="mcol" style={{ borderRight: "none" }}>
              <div className="mcol-hd">Featured</div>
              {featuredProduct ? (
                <Link href={`/product/${featuredProduct.slug || featuredProduct.id}`} className="m-feat-card">
                  <div className="m-feat-img">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {featuredProduct.imgs?.[0] && <img src={featuredProduct.imgs[0]} alt={featuredProduct.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                  </div>
                  <div className="m-feat-info">
                    <span className="m-feat-name">{featuredProduct.name}</span>
                    <span className="m-feat-price">{fmt(featuredProduct.price)}</span>
                  </div>
                </Link>
              ) : (
                <div className="m-feat-empty">
                  Medvastr Premium
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="mcol" style={{ gridColumn: "span 3", padding: "40px", background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)", marginLeft: "20px", borderRadius: 16, border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <h3 style={{ fontSize: 24, fontWeight: 800, color: "#0f7c6e", marginBottom: 16 }}>Premium {label} Supplies</h3>
            <p style={{ fontSize: 15, color: "#475569", lineHeight: 1.7, marginBottom: 30 }}>
              Explore our comprehensive collection for your medical facility. Engineered for durability and high clinical standards.
            </p>
            <Link
              href={label.toUpperCase().includes("BULK") ? "/bulk-orders" : `/products?cat=${parentCat?.slug}`}
              className="btn-p"
              style={{
                width: 'fit-content',
                background: 'linear-gradient(135deg, #ff4c29 0%, #ff1e56 100%)',
                color: 'white',
                padding: '14px 30px',
                borderRadius: '100px',
                fontWeight: 900,
                textTransform: 'uppercase',
                letterSpacing: '1px',
                border: 'none',
                boxShadow: '0 10px 25px rgba(255,30,86,0.3)'
              }}
            >
              Explore Collection
            </Link>
          </div>
        )}
      </div>

      <style jsx>{`
        .m-deep-list { list-style: none; padding: 0; margin: 0; }
        .m-parent-li { margin-bottom: 12px; }
        .m-p-link { font-weight: 850 !important; color: #0f172a !important; font-size: 13.5px !important; display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px !important; text-transform: uppercase; letter-spacing: 0.5px; }
        .m-sub-list { list-style: none; padding-left: 15px; border-left: 2px solid #f1f5f9; margin-top: 4px; display: flex; flex-direction: column; gap: 4px; }
        .m-sub-list li { padding: 2px 0; }
        .m-sub-list a { font-size: 13px !important; color: #64748b !important; font-weight: 600 !important; transition: all 0.2s; }
        .m-sub-list a:hover { color: #008080 !important; padding-left: 4px; }
        .mcat-arrow { font-size: 10px; color: #94a3b8; }
        
        .msize-guide-btn { margin-top: 18px; display: flex; align-items: center; justify-content: center; gap: 6px; width: 100%; background: #008080; color: white; padding: 12px 16px; border-radius: 8px; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; transition: all 0.25s; cursor: pointer; text-decoration: none; box-shadow: 0 4px 14px rgba(0,128,128,0.25); }
        .msize-guide-btn:hover { background: #006666; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(0,128,128,0.35); }

        .m-feat-card { display: block; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; text-decoration: none; transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); margin-top: 5px; }
        .m-feat-card:hover { transform: translateY(-5px); border-color: #cbd5e1; }
        .m-feat-img { height: 180px; background: #fff; overflow: hidden; }
        .m-feat-img img { width: 100%; height: 100%; objectFit: cover; }
        .m-feat-info { padding: 15px; display: flex; flex-direction: column; gap: 4px; }
        .m-feat-name { font-size: 13px; font-weight: 700; color: #1e293b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .m-feat-price { font-size: 14px; font-weight: 900; color: #008080; }
        .m-feat-empty { height: 180px; display: flex; align-items: center; justify-content: center; background: #f1f5f9; color: #94a3b8; font-weight: 700; font-size: 12px; text-transform: uppercase; border-radius: 12px; }
      `}</style>
    </div>
  );
}

