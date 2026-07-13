import type { MetadataRoute } from "next";
import { SITE_URL, API_BASE } from "@/lib/api";
import { HARDCODED_CATEGORIES, type CategoryNode } from "@/lib/navData";
import { buildCategoryPath } from "@/lib/categoryUtils";

const STATIC_ROUTES = [
  "",
  "/products",
  "/new-arrivals",
  "/about",
  "/contact",
  "/bulk-orders",
  "/blog",
  "/sizeguide",
  "/returns",
  "/refund",
  "/privacy",
  "/terms",
  "/track",
];

// Helper to collect all categories from the tree recursively
function getAllCategoryNodes(nodes: CategoryNode[]): CategoryNode[] {
  let list: CategoryNode[] = [];
  for (const node of nodes) {
    list.push(node);
    if (node.children && node.children.length > 0) {
      list = list.concat(getAllCategoryNodes(node.children));
    }
  }
  return list;
}

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  
  // 1. Static Routes
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.7,
  }));

  let dynamicEntries: MetadataRoute.Sitemap = [];

  // 2. Dynamic Categories from the Tree
  try {
    const allCategories = getAllCategoryNodes(HARDCODED_CATEGORIES);
    const categoryEntries: MetadataRoute.Sitemap = allCategories.map((cat) => {
      const path = buildCategoryPath(cat, HARDCODED_CATEGORIES);
      const isSubLevel = path.split("/").filter(Boolean).length > 1;
      return {
        url: `${SITE_URL}${path}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: isSubLevel ? 0.6 : 0.75,
      };
    });
    dynamicEntries = dynamicEntries.concat(categoryEntries);
  } catch (e) {
    console.error("Failed to build category sitemap entries", e);
  }

  // 3. Dynamic Products and Blog Posts
  try {
    const [productsRes, blogRes] = await Promise.all([
      fetch(`${API_BASE}/products?size=500`, { next: { revalidate: 3600 } }),
      fetch(`${API_BASE}/blog/posts?size=100`, { next: { revalidate: 3600 } }),
    ]);

    const productsJson = await productsRes.json();
    const products = productsJson?.data?.content || productsJson?.content || [];
    const productEntries: MetadataRoute.Sitemap = products
      .filter((p: any) => p.slug && p.active !== false)
      .map((p: any) => ({
        url: `${SITE_URL}/product/${p.slug}`,
        lastModified: p.createdAt ? new Date(p.createdAt) : now,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      }));
    dynamicEntries = dynamicEntries.concat(productEntries);

    const blogJson = await blogRes.json();
    const posts = blogJson?.content || [];
    const postEntries: MetadataRoute.Sitemap = posts
      .filter((p: any) => p.slug)
      .map((p: any) => ({
        url: `${SITE_URL}/blog/${p.slug}`,
        lastModified: p.publishedAt ? new Date(p.publishedAt) : now,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      }));
    dynamicEntries = dynamicEntries.concat(postEntries);
  } catch (err) {
    console.error("Failed to fetch sitemap dynamic entries", err);
  }

  return [...staticEntries, ...dynamicEntries];
}
