import { Product } from "@/lib/data";

export interface CategoryNode {
  id: number;
  name: string;
  slug: string;
  navLabel?: string;
  showInNav?: boolean;
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

  // 1. Try matching using category IDs if they align
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

  // 2. Robust fallback matching using category slugs, type, names and gender
  const slug = categorySlug.toLowerCase();
  const name = (product.name || "").toLowerCase();
  const type = (product.type || "").toLowerCase();
  const gen = (product.gen || "").toLowerCase();

  // Extract gender prefix requirement from hardcoded category slug (e.g. "men-scrub-suit")
  let reqGen: string | null = null;
  if (slug.startsWith("men-")) reqGen = "men";
  else if (slug.startsWith("women-")) reqGen = "women";

  if (reqGen && gen !== "all" && !gen.split(',').map(g => g.trim().toLowerCase()).includes(reqGen)) {
    return false;
  }

  // Check matching by category/subcategory name string if they match tree node names
  const pCatName = (product.categoryName || "").toLowerCase();
  const pSubCatName = (product.subcategoryName || "").toLowerCase();
  const pChildCatName = (product.childCategoryName || "").toLowerCase();

  if (cat) {
    const catName = cat.name.toLowerCase();
    if (pCatName === catName || pSubCatName === catName || pChildCatName === catName) {
      return true;
    }
  }

  // Category specific keyword/type mapping rules
  if (slug.includes("scrub-suit") || slug.includes("scrubs")) {
    return type === "scrubs" || type.includes("scrub") || name.includes("scrub");
  }
  if (slug.includes("flexi-fit-v-scrub") || slug.includes("flexi-v-scrub")) {
    return (type === "scrubs" || type.includes("scrub") || name.includes("scrub")) && name.includes("flexi");
  }
  if (slug.includes("cotton-tshirt") || slug.includes("t-shirt") || slug.includes("tshirt")) {
    return type === "tshirts" || type === "tshirt" || name.includes("t-shirt") || name.includes("tshirt");
  }
  if (slug.includes("full-sleeve") || slug.includes("underscrub") || slug.includes("under-scrub")) {
    return type === "underscrubs" || type === "underscrub" || type.includes("under") || name.includes("under") || pSubCatName.includes("under") || pChildCatName.includes("full sleeve");
  }
  if (slug.includes("surgeon-gown") || slug.includes("surgical-gown")) {
    return type === "surgical-gown" || type === "gown" || name.includes("gown");
  }
  if (slug.includes("surgeon-cap") || slug.includes("surgical-cap")) {
    return type === "surgical-cap" || type === "cap" || name.includes("cap") || name.includes("head");
  }
  if (slug.includes("surgical-wear") || slug === "surgical-wear") {
    return type === "surgical" || type.includes("surgical") || name.includes("surgical") || name.includes("surgeon") || name.includes("gown") || name.includes("cap");
  }

  // Bulk category mappings
  if (slug === "bulk-orders" || slug === "bulk-order") {
    return true; 
  }
  if (slug === "linen-and-bedding") {
    return type === "linen" || name.includes("linen") || name.includes("bedding") || pCatName.includes("linen") || pSubCatName.includes("linen");
  }
  if (slug === "brown-blankets" || slug === "brown-blanket") {
    return name.includes("blanket") || pCatName.includes("blanket") || pSubCatName.includes("blanket");
  }
  if (slug === "patient-dress") {
    return name.includes("patient") || pCatName.includes("patient") || pSubCatName.includes("patient");
  }
  if (slug === "maternity-gown") {
    return name.includes("maternity") || pCatName.includes("maternity") || pSubCatName.includes("maternity");
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
