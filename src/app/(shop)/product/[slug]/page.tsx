import type { Metadata } from "next";
import { SITE_URL } from "@/lib/api";
import { serverFetchJson } from "@/lib/server-api";
import JsonLd from "@/components/JsonLd";
import ProductDetailClient from "./ProductDetailClient";

export const revalidate = 300;

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await serverFetchJson<any>(`/products/slug/${encodeURIComponent(slug)}`, 300);
  if (!product) return { title: "Product" };
  const title = product.seoTitle || product.name;
  const description = product.seoDescription || product.description?.slice(0, 160) || "";
  const image = product.imageUrls?.[0];
  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/product/${slug}` },
    openGraph: {
      title,
      description,
      type: "website",
      images: image ? [{ url: image }] : [],
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await serverFetchJson<any>(`/products/slug/${encodeURIComponent(slug)}`, 300);

  const jsonLd = product
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        description: product.seoDescription || product.description,
        image: product.imageUrls?.[0],
        sku: product.sku,
        brand: { "@type": "Brand", name: product.brand || "Medvastr" },
        offers: {
          "@type": "Offer",
          priceCurrency: "INR",
          price: product.price,
          availability: "https://schema.org/InStock",
        },
      }
    : null;

  return (
    <>
      {jsonLd && <JsonLd data={jsonLd} />}
      <ProductDetailClient initialProduct={product} />
    </>
  );
}
