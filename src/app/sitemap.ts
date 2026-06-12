import type { MetadataRoute } from "next";
import { SITE_URL, API_BASE } from "@/lib/api";

const STATIC_ROUTES = [
  "",
  "/products",
  "/collections",
  "/new-arrivals",
  "/about",
  "/contact",
  "/bulk-orders",
  "/blog",
  "/sustainability",
  "/sizeguide",
  "/returns",
  "/refund",
  "/privacy",
  "/terms",
  "/track",
];

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.7,
  }));

  let dynamicEntries: MetadataRoute.Sitemap = [];

  try {
    const [productsRes, collectionsRes, blogRes] = await Promise.all([
      fetch(`${API_BASE}/products?size=500`, { next: { revalidate: 3600 } }),
      fetch(`${API_BASE}/collections`, { next: { revalidate: 3600 } }),
      fetch(`${API_BASE}/blog/posts?size=100`, { next: { revalidate: 3600 } }),
    ]);

    const productsJson = await productsRes.json();
    const products = productsJson?.data?.content || productsJson?.content || [];
    dynamicEntries = dynamicEntries.concat(
      products
        .filter((p: any) => p.slug && p.active !== false)
        .map((p: any) => ({
          url: `${SITE_URL}/product/${p.slug}`,
          lastModified: p.createdAt ? new Date(p.createdAt) : now,
          changeFrequency: "weekly" as const,
          priority: 0.8,
        }))
    );

    const collections = await collectionsRes.json();
    if (Array.isArray(collections)) {
      dynamicEntries = dynamicEntries.concat(
        collections
          .filter((c: any) => c.slug && c.isActive !== false)
          .map((c: any) => ({
            url: `${SITE_URL}/collections/${c.slug}`,
            lastModified: c.createdAt ? new Date(c.createdAt) : now,
            changeFrequency: "weekly" as const,
            priority: 0.75,
          }))
      );
    }

    const blogJson = await blogRes.json();
    const posts = blogJson?.content || [];
    dynamicEntries = dynamicEntries.concat(
      posts
        .filter((p: any) => p.slug)
        .map((p: any) => ({
          url: `${SITE_URL}/blog/${p.slug}`,
          lastModified: p.publishedAt ? new Date(p.publishedAt) : now,
          changeFrequency: "monthly" as const,
          priority: 0.6,
        }))
    );
  } catch {
    /* API unavailable — static sitemap only */
  }

  return [...staticEntries, ...dynamicEntries];
}
