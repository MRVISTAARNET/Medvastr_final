"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { API_BASE } from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import { mapApiProduct } from "@/lib/productUtils";

export default function CollectionDetailPage({ params }: { params: { slug: string } }) {
  const [collection, setCollection] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/collections/slug/${params.slug}`)
      .then((r) => r.json())
      .then((data) => setCollection(data))
      .catch(() => setCollection(null))
      .finally(() => setLoading(false));
  }, [params.slug]);

  if (loading) {
    return <div className="page sec" style={{ textAlign: "center", padding: 80 }}>Loading collection…</div>;
  }

  if (!collection) {
    return (
      <div className="page sec" style={{ textAlign: "center", padding: 80 }}>
        <p style={{ color: "var(--lt)", fontSize: 18 }}>Collection not found</p>
        <Link href="/collections" className="btn-t" style={{ marginTop: 16 }}>← All Collections</Link>
      </div>
    );
  }

  const products = (collection.products || []).map((p: any) => mapApiProduct(p));

  return (
    <div className="page">
      <div className="sec">
        {collection.imageUrl && (
          <div style={{ width: "100%", height: 280, borderRadius: 16, overflow: "hidden", marginBottom: 32 }}>
            <img src={collection.imageUrl} alt={collection.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        )}
        <h1 style={{ fontFamily: "var(--serif)", fontSize: 36, marginBottom: 8 }}>{collection.name}</h1>
        {collection.description && (
          <p style={{ color: "var(--lt)", fontSize: 16, maxWidth: 720, marginBottom: 32 }}>{collection.description}</p>
        )}

        {products.length > 0 ? (
          <div className="pg-4">
            {products.map((p: any) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "48px 20px", background: "var(--warm)", borderRadius: 12 }}>
            <p style={{ color: "var(--lt)" }}>No products in this collection yet.</p>
            <Link href="/products" className="btn-t" style={{ marginTop: 16 }}>Browse All Products</Link>
          </div>
        )}
      </div>
    </div>
  );
}
