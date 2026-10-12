import { Product } from "@/lib/data";
import { normalizeMediaUrl } from "@/lib/api";

const SIZE_ORDER = ["FREE SIZE", "FREE", "ONE SIZE", "OS", "XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"];

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

export const GLOBAL_COLOR_MAP: Record<string, string> = {
  // Whites
  'white': '#ffffff',
  'milky white': '#ffffff',
  'milky-white': '#ffffff',
  'milk white': '#ffffff',
  'milky': '#ffffff',
  'pure white': '#ffffff',
  'doctor white': '#ffffff',
  'medical white': '#ffffff',
  'snow white': '#ffffff',
  'bright white': '#ffffff',
  'clean white': '#ffffff',
  'classic white': '#ffffff',
  'off white': '#faf9f6',
  'off-white': '#faf9f6',
  'cream': '#fffdd0',
  'ivory': '#fffff0',

  // Blues
  'dark navy': '#1b2a4a',
  'navy': '#000080',
  'navy blue': '#1a2b4a',
  'dark blue': '#00008b',
  'midnight blue': '#191970',
  'royal blue': '#4169e1',
  'light blue': '#add8e6',
  'sky blue': '#87ceeb',
  'ceil blue': '#92a8d1',
  'caribbean blue': '#008b8b',
  'steel blue': '#4682b4',
  'blue': '#2563eb',

  // Reds / Purples
  'maroon': '#800000',
  'wine': '#3D274E',
  'burgundy': '#800020',
  'red': '#dc2626',
  'pink': '#ffc0cb',
  'purple': '#800080',
  'lavender': '#e6e6fa',

  // Neutrals / Greys / Blacks
  'black': '#000000',
  'charcoal': '#333333',
  'grey': '#6b7280',
  'gray': '#6b7280',
  'dark grey': '#374151',
  'dark gray': '#374151',
  'light grey': '#d1d5db',
  'light gray': '#d1d5db',
  'slate': '#708090',
  'slate grey': '#708090',
  'slate gray': '#708090',

  // Greens
  'green': '#2e7d32',
  'hunter green': '#355e3b',
  'olive': '#556b2f',
  'teal': '#008080'
};

export function getColorHex(name: string, fallbackHex?: string): string {
  if (!name) return fallbackHex || '#ffffff';
  const raw = name.trim();
  const n = raw.toLowerCase().replace(/[-_]/g, ' ').replace(/\s+/g, ' ');
  if (GLOBAL_COLOR_MAP[n]) return GLOBAL_COLOR_MAP[n];
  if (raw.startsWith('#') && (raw.length === 4 || raw.length === 7)) {
    // If raw hex is an unwanted grey fallback for a white or doctor apron product, override it
    if ((raw.toLowerCase() === '#6b7280' || raw.toLowerCase() === '#808080' || raw.toLowerCase() === '#cccccc') &&
        (n.includes('white') || n.includes('milky') || n.includes('milk') || n.includes('apron') || n.includes('coat'))) {
      return '#ffffff';
    }
    return raw;
  }

  // Smart color keyword matching
  if (n.includes('white') || n.includes('milky') || n.includes('milk')) {
    if (n.includes('off') || n.includes('cream') || n.includes('ivory')) return '#faf9f6';
    return '#ffffff';
  }
  if (n.includes('navy')) return '#1b2a4a';
  if (n.includes('royal')) return '#4169e1';
  if (n.includes('ceil')) return '#92a8d1';
  if (n.includes('sky')) return '#87ceeb';
  if (n.includes('teal')) return '#008080';
  if (n.includes('maroon') || n.includes('burgundy')) return '#800000';
  if (n.includes('wine')) return '#3D274E';
  if (n.includes('olive')) return '#556b2f';
  if (n.includes('black')) return '#000000';
  if (n.includes('charcoal')) return '#333333';
  if (n.includes('grey') || n.includes('gray')) return '#6b7280';
  if (n.includes('green')) return '#2e7d32';
  if (n.includes('blue')) return '#2563eb';
  if (n.includes('pink')) return '#ffc0cb';
  if (n.includes('purple')) return '#800080';
  if (n.includes('lavender')) return '#e6e6fa';
  if (n.includes('red')) return '#dc2626';

  if (fallbackHex && fallbackHex.startsWith('#') && fallbackHex !== '#cccccc' && fallbackHex !== '#808080' && fallbackHex !== '#6b7280') {
    return fallbackHex;
  }
  return '#ffffff';
}

function uniqueColors(variants: any[]): { hex: string; name: string }[] {
  const seen = new Set<string>();
  const out: { hex: string; name: string }[] = [];
  for (const v of variants || []) {
    const rawHex = v.colorHex || "#000000";
    const name = v.colorName || "Default";
    const hex = getColorHex(name, rawHex);
    if (!seen.has(hex)) {
      seen.add(hex);
      out.push({ hex, name });
    }
  }
  return out;
}

function buildClrImgs(api: any, normalizedImgs: string[]): Record<string, string[]> {
  const colors = uniqueColors(api.variants || []);
  const clrImgs: Record<string, string[]> = {};
  if (colors.length === 0) return clrImgs;

  const imageMeta = api.images || [];

  colors.forEach((c, i) => {
    const taggedFromMeta = imageMeta
      .filter((img: any) => (img.colorHex || img.colorCode || "").toLowerCase() === c.hex.toLowerCase())
      .map((img: any) => normalizeMediaUrl(img.imageUrl));

    const tagged = taggedFromMeta.length
      ? taggedFromMeta
      : normalizedImgs.filter((u) => {
          try {
            return decodeURIComponent(u).toLowerCase().includes(`?clr=${c.hex.toLowerCase()}`);
          } catch {
            return u.toLowerCase().includes(`?clr=${c.hex.toLowerCase()}`);
          }
        });

    // 2. Second priority: Variant Hero Image
    const variantImg = (api.variants || []).find(
      (v: any) => (v.colorHex === c.hex || getColorHex(v.colorName) === c.hex) && v.imageUrl
    )?.imageUrl;

    if (tagged.length > 0) {
      clrImgs[c.hex] = tagged;
    } else if (variantImg) {
      const primary = normalizeMediaUrl(variantImg);
      const extras = normalizedImgs.filter((u) => u !== primary && !u.includes('?clr='));
      clrImgs[c.hex] = [primary, ...extras];
    } else if (normalizedImgs.length >= colors.length) {
      // 3. Fallback: Sequential grouping
      const per = Math.max(1, Math.ceil(normalizedImgs.length / colors.length));
      clrImgs[c.hex] = normalizedImgs.slice(i * per, (i + 1) * per);
    } else {
      clrImgs[c.hex] = normalizedImgs.filter(u => !u.includes('?clr='));
    }
  });
  return clrImgs;
}

export function mapApiProduct(p: any): Product {
  // Fix old wine color globally in API response
  const fixColor = (hex: string) => hex?.toLowerCase() === '#722f37' ? '#3D274E' : hex;

  const variants = (p.variants || []).map((v: any) => ({
    ...v,
    colorHex: getColorHex(v.colorName, fixColor(v.colorHex))
  }));

  if (p.images) {
    p.images = p.images.map((img: any) => ({
      ...img,
      colorHex: fixColor(img.colorHex),
      colorCode: fixColor(img.colorCode)
    }));
  }

  const colors = uniqueColors(variants);
  
  const normalizedImgs = (p.imageUrls || []).map((u: string) => {
    let nu = normalizeMediaUrl(u);
    if (nu.toLowerCase().includes('%23722f37') || nu.toLowerCase().includes('#722f37')) {
      nu = nu.replace(/%23722f37/ig, '%233D274E').replace(/#722f37/ig, '#3D274E');
    }
    return nu;
  });

  // Pass the updated variants and images to buildClrImgs via a mock api object
  const clrImgs = buildClrImgs({ ...p, variants, images: p.images }, normalizedImgs);
  
  // Re-order colors so that the color of the first uploaded image is always first
  if (normalizedImgs.length > 0 && colors.length > 0) {
    const firstImg = normalizedImgs[0];
    const firstColorIdx = colors.findIndex(c => clrImgs[c.hex] && clrImgs[c.hex].includes(firstImg));
    if (firstColorIdx > 0) {
      const firstC = colors.splice(firstColorIdx, 1)[0];
      colors.unshift(firstC);
    }
  }

  const clrs = colors.map((c) => c.hex);
  const clrNms = colors.map((c) => c.name);
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
    categoryIds: p.categoryIds,
    imgs: normalizedImgs,
    catId: p.categoryId,
    subcategoryId: p.subcategoryId,
    childCategoryId: p.childCategoryId,
    categoryName: p.categoryName,
    subcategoryName: p.subcategoryName,
    childCategoryName: p.childCategoryName,
    sku: p.sku || `MV-${p.id}`,
    style: p.styleId || p.style || "Standard",
    styleId: p.styleId || p.style || "Standard",
    brand: p.brand || "Medvarn",
    sizes:
      (p.sizes?.length ? p.sizes : variantSizes.length ? sortSizes(variantSizes) : undefined) ||
      ["XS", "S", "M", "L", "XL"],
    barcode: p.barcode || `BC-${p.id}`,
    variants,
    active: p.active !== undefined ? p.active : true,
    videoUrl: p.videoUrl || "",
    createdAt: p.createdAt || undefined,
    seoTitle: p.seoTitle,
    seoDescription: p.seoDescription,
    seoKeywords: p.seoKeywords,
    tax: p.tax ? Number(p.tax) : undefined,
    shortDescription: p.shortDescription,
    material: p.material,
    tags: p.tags,
    codDisabled: p.codDisabled !== undefined ? p.codDisabled : false,
    embroideryEnabled: p.embroideryEnabled !== undefined ? Boolean(p.embroideryEnabled) : false,
    embroideryConfig: p.embroideryConfig || "",
  };
}

/** Resolve variant ID from product variants by size + color hex */
export function resolveVariantId(product: Product, size: string, colorHex: string): number | undefined {
  const variants = product.variants || [];
  let lookupSize = size;
  if (size && size.startsWith("Top: ")) {
    const parts = size.split("/");
    if (parts.length > 0) {
      lookupSize = parts[0].replace("Top:", "").trim();
    }
  }
  const match = variants.find(
    (v: any) => v.size === lookupSize && (v.colorHex === colorHex || !v.colorHex)
  );
  return match?.id;
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
    subcategoryId: p.subcategoryId ? Number(p.subcategoryId) : undefined,
    childCategoryId: p.childCategoryId ? Number(p.childCategoryId) : undefined,
    imageUrls: imgs,
    videoUrl: p.videoUrl,
    categoryIds: p.categoryIds,
    variants: p.variants,
    shortDescription: p.shortDescription,
    material: p.material,
    tags: p.tags,
    seoTitle: p.seoTitle,
    seoDescription: p.seoDescription,
    seoKeywords: p.seoKeywords,
    tax: p.tax ? Number(p.tax) : undefined,
    embroideryEnabled: p.embroideryEnabled !== undefined ? Boolean(p.embroideryEnabled) : false,
    embroideryConfig: p.embroideryConfig,
  };
}
