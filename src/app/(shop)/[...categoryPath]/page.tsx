"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { findCategoryByPath } from "@/lib/categoryUtils";

/**
 * SEO category routes:
 * /men
 * /men/scrub-suit
 * /men/scrub-suit/flexi-fit-v-scrub
 */
export default function CategoryPathPage() {
  const params = useParams();
  const router = useRouter();
  const { categoryTree } = useApp();

  useEffect(() => {
    const segments = Array.isArray(params.categoryPath)
      ? params.categoryPath
      : params.categoryPath
        ? [params.categoryPath]
        : [];

    if (!segments.length) {
      router.replace("/products");
      return;
    }

    const category = findCategoryByPath(categoryTree, segments);
    if (category) {
      const gender =
        segments[0] === "men" ? "men" : segments[0] === "women" ? "women" : "";
      const query = new URLSearchParams({ cat: category.slug });
      if (gender) query.set("gender", gender);
      router.replace(`/products?${query.toString()}`);
      return;
    }

    router.replace("/products");
  }, [params.categoryPath, categoryTree, router]);

  return (
    <div style={{ padding: "80px 24px", textAlign: "center", color: "#64748b" }}>
      Loading category...
    </div>
  );
}
