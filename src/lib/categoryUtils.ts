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
  tree: CategoryNode[]
): boolean {
  if (!categorySlug || categorySlug === "all") return true;

  const slug = categorySlug.toLowerCase();
  
  // 1. Check ID-based mapping from category tree if available
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

  // 2. Extract Gender requirements from slug
  const gen = (product.gen || "").toLowerCase();
  let reqGen: string | null = null;
  if (slug.startsWith("men-")) reqGen = "men";
  else if (slug.startsWith("women-")) reqGen = "women";

  if (reqGen && gen !== "all") {
    const pGens = gen.split(',').map(g => g.trim().toLowerCase());
    if (pGens.length > 0 && !pGens.includes(reqGen) && !pGens.includes("unisex")) {
      return false; // Strict reject if gender explicitly doesn't match
    }
  }

  // 3. Fallback semantic checks
  const name = (product.name || "").toLowerCase();
  const type = (product.type || "").toLowerCase();
  
  const pCatName = (product.categoryName || "").toLowerCase();
  const pSubCatName = (product.subcategoryName || "").toLowerCase();
  const pChildCatName = (product.childCategoryName || "").toLowerCase();

  // If node name matches category tree name
  if (cat) {
    const catName = cat.name.toLowerCase();
    if (pCatName.includes(catName) || pSubCatName.includes(catName) || pChildCatName.includes(catName)) {
      return true;
    }
  }

  // Specific semantic overrides
  if (slug.includes("scrub-suit") || slug.includes("scrubs")) {
    return type.includes("scrub") && !type.includes("under");
  }
  if (slug.includes("flexi-fit-v-scrub") || slug.includes("flexi-v-scrub")) {
    return type.includes("scrub") && !type.includes("under") && name.includes("flexi");
  }
  if (slug.includes("cotton-tshirt") || slug.includes("t-shirt") || slug.includes("tshirt")) {
    return type.includes("tshirt") || type.includes("t-shirt") || name.includes("t-shirt") || name.includes("tshirt");
  }
  if (slug.includes("full-sleeve") || slug.includes("underscrub") || slug.includes("under-scrub")) {
    return type.includes("under") || name.includes("under");
  }
  if (slug.includes("surgeon-gown") || slug.includes("surgical-gown")) {
    return type.includes("gown") || name.includes("gown");
  }
  if (slug.includes("surgeon-cap") || slug.includes("surgical-cap")) {
    return type.includes("cap") || name.includes("cap") || name.includes("head");
  }
  if (slug.includes("surgical-wear") || slug === "surgical-wear") {
    return type.includes("surgical") || type.includes("gown") || type.includes("cap") || name.includes("surgical") || name.includes("surgeon") || name.includes("gown") || name.includes("cap");
  }

  // Bulk and others
  if (slug.includes("bulk-order")) return true;
  if (slug.includes("linen") || slug.includes("bedding")) return type.includes("linen") || name.includes("linen") || name.includes("bedding");
  if (slug.includes("blanket")) return type.includes("blanket") || name.includes("blanket");
  if (slug.includes("patient")) return type.includes("patient") || name.includes("patient");
  if (slug.includes("maternity")) return type.includes("maternity") || name.includes("maternity");

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
