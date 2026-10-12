import { Product } from "@/lib/data";

export interface CategoryNode {
  id: number;
  name: string;
  slug: string;
  navLabel?: string;
  showInNav?: boolean;
  active?: boolean;
  parentId?: number | null;
  children?: CategoryNode[];
}

export function findCategoryBySlug(tree: CategoryNode[], slug: string): CategoryNode | null {
  for (const node of tree) {
    if (node.slug === slug) return node;
    if (node.children?.length) {
      const found = findCategoryBySlug(node.children, slug);
      if (found) return found;
    }
  }
  return null;
}

export function findCategoryByPath(tree: CategoryNode[], segments: string[]): CategoryNode | null {
  if (!segments.length) return null;
  let currentLevel = tree;
  let match: CategoryNode | null = null;

  for (const segment of segments) {
    match = currentLevel.find((c) => urlSegment(c, match) === segment) || null;
    if (!match) return null;
    currentLevel = match.children || [];
  }
  return match;
}

export function urlSegment(cat: CategoryNode, parent: CategoryNode | null): string {
  if (!parent) return cat.slug;
  const prefix = `${parent.slug}-`;
  if (cat.slug.startsWith(prefix)) {
    return cat.slug.slice(prefix.length);
  }
  return cat.slug;
}

export function buildCategoryPath(cat: CategoryNode, tree: CategoryNode[]): string {
  const ancestors = findAncestors(cat.id, tree);
  if (!ancestors.length) return `/${cat.slug}`;
  const segments = ancestors.map((node, idx) => {
    const parent = idx > 0 ? ancestors[idx - 1] : null;
    return urlSegment(node, parent);
  });
  return `/${segments.join("/")}`;
}

export function findAncestors(
  categoryId: number,
  tree: CategoryNode[],
  trail: CategoryNode[] = []
): CategoryNode[] {
  for (const node of tree) {
    if (node.id === categoryId) return [...trail, node];
    if (node.children?.length) {
      const found = findAncestors(categoryId, node.children, [...trail, node]);
      if (found.length) return found;
    }
  }
  return [];
}

export function collectDescendantIds(cat: CategoryNode): number[] {
  const ids = [cat.id];
  for (const child of cat.children || []) {
    ids.push(...collectDescendantIds(child));
  }
  return ids;
}

export function productMatchesCategory(
  product: Product & {
    subcategoryId?: number;
    childCategoryId?: number;
    categoryName?: string;
    subcategoryName?: string;
    childCategoryName?: string;
  },
  categorySlug: string,
  tree: CategoryNode[],
  activeGenderFilter: string = "all"
): boolean {
  if (!categorySlug || categorySlug === "all") return true;

  const slug = categorySlug.toLowerCase();

  // 1. Gender Verification
  const gen = (product.gen || "").toLowerCase();
  const pGens = gen.split(',').map(g => g.trim().toLowerCase()).filter(Boolean);

  const matchesTargetGender = (target: "men" | "women") => {
    if (pGens.length === 0 || pGens.includes("all") || pGens.includes("unisex")) return true;
    return pGens.includes(target);
  };

  const isGenderAll = !activeGenderFilter || activeGenderFilter.toLowerCase() === "all";
  if (!isGenderAll) {
    if (activeGenderFilter.toLowerCase() === "men" && !matchesTargetGender("men")) return false;
    if (activeGenderFilter.toLowerCase() === "women" && !matchesTargetGender("women")) return false;
  }
  if (slug.startsWith("men-") && !matchesTargetGender("men")) return false;
  if (slug.startsWith("women-") && !matchesTargetGender("women")) return false;

  // 2. Identify Product's Distinct Apparel Kind
  const name = (product.name || "").toLowerCase();
  const type = (product.type || "").toLowerCase();
  const pCatName = (product.categoryName || "").toLowerCase();
  const pSubCatName = (product.subcategoryName || "").toLowerCase();
  const pChildCatName = (product.childCategoryName || "").toLowerCase();
  const allText = `${name} ${type} ${pCatName} ${pSubCatName} ${pChildCatName}`;

  const isApron =
    allText.includes("apron") ||
    allText.includes("lab coat") ||
    allText.includes("doctor coat") ||
    allText.includes("lab-coat") ||
    type === "apron";

  const isUnderscrub =
    allText.includes("underscrub") ||
    allText.includes("under-scrub") ||
    allText.includes("under scrub");

  const isTShirt =
    allText.includes("t-shirt") ||
    allText.includes("tshirt");

  const isGown =
    allText.includes("gown");

  const isCap =
    allText.includes("cap") ||
    allText.includes("head");

  const isScrubSuit =
    !isApron &&
    !isUnderscrub &&
    !isTShirt &&
    !isGown &&
    !isCap &&
    (allText.includes("scrub") || type === "scrubs" || type === "scrub");

  // 3. Strict routing by requested category

  // 3a. Doctor Apron / Lab Coat Categories
  if (slug.includes("doctor-apron") || slug.includes("lab-coat") || slug.includes("apron")) {
    return isApron;
  }

  // If the product IS an Apron, it must NEVER match any other category below (Scrub Suit, T-Shirt, etc.)
  if (isApron) {
    // Only top-level gender collections like 'men' or 'women' or 'all' may include aprons
    if (slug === "men") return matchesTargetGender("men");
    if (slug === "women") return matchesTargetGender("women");
    return false;
  }

  // 3b. Scrub Suit Categories
  const isScrubSuitCategory =
    slug.includes("scrub-suit") ||
    slug === "scrubs" ||
    slug === "scrub" ||
    slug.includes("classic-solitaire") ||
    slug.includes("flexi-fit") ||
    slug.includes("flexi-v-scrub");

  if (isScrubSuitCategory) {
    if (!isScrubSuit) return false;
    if (slug.includes("classic-solitaire") || slug.includes("classic-solitaire-scrubs")) {
      return name.includes("classic") || name.includes("solitaire") || pChildCatName.includes("classic") || pChildCatName.includes("solitaire");
    }
    if (slug.includes("flexi-fit-v-scrub") || slug.includes("flexi-v-scrub") || slug.includes("flexi")) {
      return name.includes("flexi") || pChildCatName.includes("flexi") || !name.includes("classic");
    }
    return true;
  }

  // 3c. Cotton T-Shirt Categories
  if (slug.includes("cotton-tshirt") || slug.includes("t-shirt") || slug.includes("tshirt")) {
    return isTShirt;
  }

  // 3d. Under Scrub Categories
  if (slug.includes("underscrub") || slug.includes("under-scrub") || slug.includes("full-sleeve")) {
    return isUnderscrub;
  }

  // 3e. Surgical Gown Categories
  if (slug.includes("surgeon-gown") || slug.includes("surgical-gown")) {
    return isGown;
  }

  // 3f. Surgical Cap Categories
  if (slug.includes("surgeon-cap") || slug.includes("surgical-cap")) {
    return isCap;
  }

  // 3g. Surgical Wear Parent Category
  if (slug === "surgical-wear" || slug.includes("surgical-wear")) {
    return isGown || isCap;
  }

  // 3h. Top-level Gender Collections
  if (slug === "men") return matchesTargetGender("men");
  if (slug === "women") return matchesTargetGender("women");

  // 3i. Bulk & Hospital Linen
  if (slug.includes("bulk-order")) return true;
  if (slug.includes("linen") || slug.includes("bedding")) return allText.includes("linen") || allText.includes("bedding");
  if (slug.includes("blanket")) return allText.includes("blanket");
  if (slug.includes("patient")) return allText.includes("patient");
  if (slug.includes("maternity")) return allText.includes("maternity");

  // 4. Fallback Category Tree ID Match for any dynamic/unmapped category
  const cat = findCategoryBySlug(tree, categorySlug);
  if (cat) {
    const ids = new Set(collectDescendantIds(cat));
    const productIds = [product.catId, product.subcategoryId, product.childCategoryId].filter(Boolean);
    if (product.categoryIds) {
      const extraIds = product.categoryIds.split(',').map(s => Number(s.trim())).filter(n => !isNaN(n));
      productIds.push(...extraIds);
    }
    if (productIds.some((id) => ids.has(Number(id)))) {
      return true;
    }
  }

  return false;
}

export function flattenCategoryTree(tree: CategoryNode[], depth = 0): Array<CategoryNode & { depth: number }> {
  return tree.flatMap((node) => [
    { ...node, depth },
    ...flattenCategoryTree(node.children || [], depth + 1),
  ]);
}

export function buildNavFromCategories(tree: CategoryNode[]) {
  return tree
    .filter((c) => c.showInNav !== false)
    .map((c) => {
      const isBulk = c.slug === "bulk-orders" || c.slug === "bulk-order";
      const gender = c.slug === "men" ? "men" : c.slug === "women" ? "women" : undefined;
      return {
        id: c.id,
        label: c.navLabel || c.name,
        href: isBulk ? "/bulk-orders" : buildCategoryPath(c, tree),
        itemType: "MEGA_MENU" as const,
        gender,
        categorySlug: c.slug,
        children: [],
      };
    });
}

export function isScrubSuitItem(item: any): boolean {
  if (!item) return false;

  // NOTE: Items with embroidery are still scrub suits — embroidery is just a customization add-on.
  // Do NOT exclude items based on embroidery presence.

  const name = (item.name || "").toLowerCase();
  const type = (item.type || "").toLowerCase();
  const catStr = [
    item.categoryName,
    item.subcategoryName,
    item.childCategoryName,
    item.short,
    item.desc
  ].filter(Boolean).join(" ").toLowerCase();

  const combined = `${name} ${type} ${catStr}`;

  // Explicitly exclude non-scrub suit items (T-Shirts, Underscrubs, Lab Coats, Caps, Gowns, etc.)
  if (
    combined.includes("t-shirt") ||
    combined.includes("tshirt") ||
    combined.includes("underscrub") ||
    combined.includes("under-scrub") ||
    combined.includes("under scrub") ||
    combined.includes("lab coat") ||
    combined.includes("doctor coat") ||
    combined.includes("doctor apron") ||
    combined.includes("apron") ||
    combined.includes("gown") ||
    combined.includes("cap") ||
    combined.includes("linen") ||
    combined.includes("blanket")
  ) {
    return false;
  }

  return combined.includes("scrub") || combined.includes("suit");
}

