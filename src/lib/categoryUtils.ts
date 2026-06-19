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
  },
  categorySlug: string,
  tree: CategoryNode[]
): boolean {
  if (!categorySlug || categorySlug === "all") return true;
  const cat = findCategoryBySlug(tree, categorySlug);
  if (!cat) return false;
  const ids = new Set(collectDescendantIds(cat));
  const productIds = [product.catId, product.subcategoryId, product.childCategoryId].filter(Boolean);
  return productIds.some((id) => ids.has(Number(id)));
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
