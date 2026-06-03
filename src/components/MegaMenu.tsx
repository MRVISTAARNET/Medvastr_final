import Link from "next/link";
import { useApp } from "@/context/AppContext";

interface MegaMenuProps {
  gender: "men" | "women";
}

export default function MegaMenu({ gender }: MegaMenuProps) {
  const { products } = useApp();
  const G = gender === "men";
  const genStr = G ? "MEN" : "WOMEN";
  const genKey = G ? "men" : "women";

  // Filter proper products for this gender (or unisex)
  const genProducts = products.filter(p => p.gen === genKey || p.gen === "unisex");

  const quickLinks = [
    { l: "New Arrivals", href: `/products?gender=${genStr}&sort=nw` },
    { l: "Best Sellers", href: `/products?gender=${genStr}&sort=rt` },
    { l: "View All", href: `/products?gender=${genStr}` },
  ];

  // Dynamically grab first 4 scrubs
  const scrubs = genProducts.filter(p => p.type === "scrubs").slice(0, 4).map(p => ({
    l: p.name,
    href: `/product/${p.slug || p.id}`
  }));

  // Dynamically grab first 3 accessories (caps)
  const accessories = genProducts.filter(p => p.type === "diagnostic" || p.name.toLowerCase().includes("cap")).slice(0, 3).map(p => ({
    l: p.name,
    href: `/product/${p.slug || p.id}`
  }));

  // Dynamically grab first 4 surgical/apparel
  const apparel = genProducts.filter(p => p.type === "surgical" || p.type === "linen").slice(0, 4).map(p => ({
    l: p.name,
    href: `/product/${p.slug || p.id}`
  }));

  const colours = [
    { l: "Dark Blue", h: "#1a2b4a", c: "Dark Blue" },
    { l: "Light Blue", h: "#add8e6", c: "Light Blue" },
    { l: "Maroon", h: "#800000", c: "Maroon" },
    { l: "Wine", h: "#722f37", c: "Wine" },
  ];

  const fabric = [
    { l: "100% Pure Cotton" },
    { l: "Premium PC Cotton" },
    { l: "Camel Brown Wool" },
  ];

  return (
    <div className="mega">
      <div className="mega-top-bar">
        {quickLinks.map((q, i) => (
          <Link
            key={i}
            href={q.href}
            className="mega-top-link"
          >
            {q.l}
          </Link>
        ))}
      </div>

      <div className="mega-in">
        <div className="mcol">
          <div className="mcol-sub">
            <Link href={`/products?cat=scrubs&gender=${genStr}`}>
              Scrubs & Uniforms <span style={{ fontSize: 10, color: "var(--t)", fontWeight: 700 }}>→</span>
            </Link>
          </div>
          <ul>
            {scrubs.map((x) => (
              <li key={x.l}>
                <Link href={x.href}>{x.l}</Link>
              </li>
            ))}
          </ul>
          <div className="mcol-sub" style={{ marginTop: 18 }}>
            <Link href={`/products?cat=diagnostic&gender=${genStr}`}>Caps & Docs</Link>
          </div>
          <ul>
            {accessories.map((x) => (
              <li key={x.l}>
                <Link href={x.href}>{x.l}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="mcol">
          <div className="mcol-sub">
            Surgical & Patient Wear
          </div>
          <ul>
            {apparel.map((x) => (
              <li key={x.l}>
                <Link href={x.href}>
                  {x.l}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="mcol">
          <div className="mcol-hd">
            Shop By Colour
            <Link href={`/products?gender=${genStr}`} className="mcol-hd-link">See all →</Link>
          </div>
          <div className="mega-clr-g">
            {colours.map((c) => (
              <Link href={`/products?color=${c.c}&gender=${genStr}`} className="mclr" key={c.l}>
                <div className="mclr-d" style={{ background: c.h }} />
                <span className="mclr-n">
                  {c.l}
                </span>
              </Link>
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
                <li><Link href={`/products?size=M&gender=${genStr}`}>M</Link></li>
                <li><Link href={`/products?size=L&gender=${genStr}`}>L</Link></li>
                <li><Link href={`/products?size=XL&gender=${genStr}`}>XL</Link></li>
                <li><Link href={`/products?size=XXL&gender=${genStr}`}>XXL</Link></li>
              </>
            ) : (
              <>
                <li><Link href={`/products?size=S&gender=${genStr}`}>S</Link></li>
                <li><Link href={`/products?size=M&gender=${genStr}`}>M</Link></li>
                <li><Link href={`/products?size=L&gender=${genStr}`}>L</Link></li>
                <li><Link href={`/products?size=XL&gender=${genStr}`}>XL</Link></li>
              </>
            )}
          </ul>
        </div>

        <div className="mcol" style={{ borderRight: "none" }} />

        <Link
          href={`/products?gender=${genStr}`}
          className="mbanner"
          style={{
            background: G
              ? "linear-gradient(145deg,#101e34 0%,#0b2c26 100%)"
              : "linear-gradient(145deg,#2a0a1a 0%,#3e1030 100%)",
            textDecoration: "none"
          }}
        >
          <div className="mban-content">
            <div className="mban-ico">{G ? "👨‍⚕️" : "👩‍⚕️"}</div>
            <span className="mban-t">Shop All {G ? "Men's" : "Women's"}</span>
            <span className="mban-s">View full collection →</span>
          </div>
        </Link>
      </div>
    </div>
  );
}
