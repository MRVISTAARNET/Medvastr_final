import { Product } from "@/lib/data";
import { normalizeMediaUrl } from "@/lib/api";

const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"];

function sortSizes(sizes: string[]): string[] {
  return [...sizes].sort((a, b) => {
    const ia = SIZE_ORDER.indexOf(a.toUpperCase());
    const ib = SIZE_ORDER.indexOf(b.toUpperCase());
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });
}

function uniqueColors(variants: any[]): { hex: string; name: string }[] {
  const seen = new Set<string>();
  const out: { hex: string; name: string }[] = [];
  for (const v of variants || []) {
    const hex = v.colorHex || "#000000";
    if (!seen.has(hex)) {
      seen.add(hex);
      out.push({ hex, name: v.colorName || "Default" });
    }
  }
  return out;
}

function buildClrImgs(api: any, normalizedImgs: string[]): Record<string, string[]> {
  const colors = uniqueColors(api.variants || []);
  const clrImgs: Record<string, string[]> = {};
  if (colors.length === 0) return clrImgs;

  colors.forEach((c, i) => {
    const variantImg = (api.variants || []).find(
      (v: any) => v.colorHex === c.hex && v.imageUrl
    )?.imageUrl;
    if (variantImg) {
      const primary = normalizeMediaUrl(variantImg);
      const extras = normalizedImgs.filter((u) => u !== primary);
      clrImgs[c.hex] = [primary, ...extras];
      return;
    }
    if (normalizedImgs.length >= colors.length) {
      const per = Math.max(1, Math.ceil(normalizedImgs.length / colors.length));
      clrImgs[c.hex] = normalizedImgs.slice(i * per, (i + 1) * per);
    } else {
      clrImgs[c.hex] = normalizedImgs.length ? normalizedImgs : [];
    }
  });
  return clrImgs;
}

export function mapApiProduct(p: any): Product {
  const variants = p.variants || [];
  const colors = uniqueColors(variants);
  const clrs = colors.map((c) => c.hex);
  const clrNms = colors.map((c) => c.name);
  const normalizedImgs = (p.imageUrls || []).map((u: string) => normalizeMediaUrl(u));
  const clrImgs = buildClrImgs(p, normalizedImgs);
  const variantSizes = [
    ...new Set(variants.map((v: any) => v.size).filter(Boolean)),
  ] as string[];

  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    short: p.name.split(" ").slice(-2).join(" "),
    fab: p.fabric,
    type: p.type,
    gen: p.gender,
    price: Number(p.price),
    origPrice: p.originalPrice ? Number(p.originalPrice) : undefined,
    rating: Number(p.rating ?? 4.5),
    rev: p.reviewCount ?? 0,
    badge: p.badge || "",
    clrs: clrs.length ? clrs : [],
    clrNms: clrNms.length ? clrNms : [],
    clrImgs,
    emo: p.emoji || "🥼",
    bg: p.bgColor || "#f0f0f0",
    desc: p.description || "",
    fabD: p.fabricDetail || "",
    stretch: p.stretchType || "",
    pockets: p.pocketCount || 0,
    care: p.careInstructions || "",
    wt: p.weight || "",
    fit: p.fit || "",
    imgs: normalizedImgs,
    catId: p.categoryId,
    sku: p.sku || `MV-${p.id}`,
    styleId: p.styleId || "",
    brand: p.brand || "Medvastr",
    sizes:
      (p.sizes?.length ? p.sizes : variantSizes.length ? sortSizes(variantSizes) : undefined) ||
      ["XS", "S", "M", "L", "XL"],
    barcode: p.barcode || `BC-${p.id}`,
    variants,
  };
}

/** Images to show for a color swatch index on PDP / product cards */
export function getImagesForColor(p: Product, colorIndex: number): string[] {
  const hex = p.clrs?.[colorIndex];
  if (hex && p.clrImgs?.[hex]?.length) return p.clrImgs[hex];
  if (p.imgs?.length && p.clrs?.length && p.clrs.length > 1 && p.imgs.length >= p.clrs.length) {
    const per = Math.max(1, Math.ceil(p.imgs.length / p.clrs.length));
    return p.imgs.slice(colorIndex * per, (colorIndex + 1) * per);
  }
  return p.imgs || [];
}

/** Sizes in stock for the selected color (falls back to all sizes) */
export function getSizesForColor(p: Product, colorIndex: number): string[] {
  const hex = p.clrs?.[colorIndex];
  if (!hex || !p.variants?.length) return p.sizes || [];
  const fromVariants = [
    ...new Set(
      p.variants
        .filter((v: any) => v.colorHex === hex && v.size)
        .map((v: any) => v.size as string)
    ),
  ];
  return fromVariants.length ? sortSizes(fromVariants) : p.sizes || [];
}

/** Build API payload from admin / context product shape */
export function toApiProductRequest(p: any) {
  const imgs = Array.isArray(p.imgs) ? p.imgs : p.imgs ? [p.imgs] : p.imageUrls || [];
  return {
    name: p.name,
    description: p.desc ?? p.description,
    fabric: p.fab ?? p.fabric,
    type: p.type,
    gender: p.gen ?? p.gender,
    badge: p.badge,
    brand: p.brand,
    styleId: p.styleId || undefined,
    barcode: p.barcode || undefined,
    sku: p.sku || undefined,
    emoji: p.emo ?? p.emoji,
    bgColor: p.bg ?? p.bgColor,
    fabricDetail: p.fabD ?? p.fabricDetail,
    stretchType: p.stretch ?? p.stretchType,
    pocketCount: p.pockets ?? p.pocketCount,
    careInstructions: p.care ?? p.careInstructions,
    weight: p.weight ?? p.wt,
    fit: p.fit,
    price: p.price ? Number(p.price) : 0,
    originalPrice: (p.originalPrice || p.origPrice) ? Number(p.originalPrice || p.origPrice) : undefined,
    categoryId: (p.catId || p.categoryId) ? Number(p.catId || p.categoryId) : undefined,
    imageUrls: imgs,
    videoUrl: p.videoUrl,
    variants: p.variants,
  };
}
