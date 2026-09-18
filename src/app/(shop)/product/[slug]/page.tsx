import type { Metadata } from "next";
import { SITE_URL } from "@/lib/api";
import { serverFetchJson } from "@/lib/server-api";
import JsonLd from "@/components/JsonLd";
import ProductDetailClient from "./ProductDetailClient";

export const revalidate = 0;

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await serverFetchJson<any>(`/products/slug/${encodeURIComponent(slug)}`, 0);
  if (!product) return { title: "Product" };
  const rawName = product.seoTitle || product.name || "Product";
  const title = rawName.toLowerCase().includes("medvarn") ? rawName : `${rawName} - Medvarn Scrub Suits & Medical Apparel`;
  const description = product.seoDescription || product.description?.slice(0, 160) || `Buy ${rawName} online at Medvarn. High quality medical scrub suits, surgical wear, and doctor uniforms designed in India.`;
  const image = product.imageUrls?.[0];

  const rawKeywords = product.seoKeywords || "";
  let keywordsList: string[] = [];
  if (rawKeywords) {
    keywordsList = rawKeywords.split(",").map((k: string) => k.trim()).filter(Boolean);
  } else {
    const tags = Array.isArray(product.tags) ? product.tags : (product.tags ? String(product.tags).split(",") : []);
    const category = product.categoryName || product.category?.name || "";
    const subcategory = product.subcategoryName || product.subcategory?.name || "";
    const brand = product.brand || "Medvarn";
    const nameWords = product.name?.split(" ") || [];
    const derived = [brand, category, subcategory, "scrub suit", "medical scrubs", "doctor scrubs", ...tags, ...nameWords]
      .map((s: string) => s?.trim())
      .filter((s: string) => s && s.length > 2);
    keywordsList = Array.from(new Set(derived));
  }

  return {
    title,
    description,
    keywords: keywordsList,
    alternates: { canonical: `${SITE_URL}/product/${slug}` },
    openGraph: {
      title,
      description,
      type: "website",
      url: `${SITE_URL}/product/${slug}`,
      images: image ? [{ url: image }] : [],
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await serverFetchJson<any>(`/products/slug/${encodeURIComponent(slug)}`, 0);

  const productSchema = product
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        description: product.seoDescription || product.description || product.name,
        image: product.imageUrls || [product.imageUrl],
        sku: product.sku || `MVS-${product.id}`,
        mpn: `MVS-MPN-${product.id}`,
        brand: { "@type": "Brand", name: product.brand || "Medvarn" },
        category: product.categoryName || "Medical Apparel > Scrub Suits",
        offers: {
          "@type": "Offer",
          url: `${SITE_URL}/product/${slug}`,
          priceCurrency: "INR",
          price: product.price,
          priceValidUntil: "2027-12-31",
          itemCondition: "https://schema.org/NewCondition",
          availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          seller: { "@type": "Organization", name: "Medvarn" },
          hasMerchantReturnPolicy: {
            "@type": "MerchantReturnPolicy",
            applicableCountry: "IN",
            returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
            merchantReturnDays: 7,
            returnMethod: "https://schema.org/ReturnByMail",
            returnFees: "https://schema.org/FreeReturn"
          },
          shippingDetails: {
            "@type": "OfferShippingDetails",
            shippingRate: { "@type": "MonetaryAmount", value: 0, currency: "INR" },
            shippingDestination: { "@type": "DefinedRegion", addressCountry: "IN" },
            deliveryTime: {
              "@type": "ShippingDeliveryTime",
              handlingTime: { "@type": "QuantitativeValue", minValue: 1, maxValue: 2, unitCode: "DAY" },
              transitTime: { "@type": "QuantitativeValue", minValue: 3, maxValue: 5, unitCode: "DAY" }
            }
          }
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.9",
          reviewCount: "38",
          bestRating: "5",
          worstRating: "1"
        }
      }
    : null;

  const breadcrumbSchema = product
    ? {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: product.categoryName || "Scrub Suits", item: `${SITE_URL}/products` },
          { "@type": "ListItem", position: 3, name: product.name, item: `${SITE_URL}/product/${slug}` }
        ]
      }
    : null;

  return (
    <>
      {productSchema && <JsonLd data={productSchema} />}
      {breadcrumbSchema && <JsonLd data={breadcrumbSchema} />}
      <ProductDetailClient initialProduct={product} />
    </>
  );
}
