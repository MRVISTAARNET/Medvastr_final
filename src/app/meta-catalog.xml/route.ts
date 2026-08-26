import { API_BASE } from "@/lib/api";

function escapeXml(unsafe: string | null | undefined): string {
  if (!unsafe) return "";
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  try {
    const res = await fetch(`${API_BASE}/products?size=200`, {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch products: ${res.status}`);
    }

    const data = await res.json();
    const products: any[] = data?.data?.content || data?.data || [];

    let itemsXml = "";

    for (const p of products) {
      if (!p.active) continue;

      const productUrl = `https://www.medvarn.com/product/${p.slug || p.id}`;
      
      // Get primary image or first image from imageUrls / images
      let imageUrl = "https://d2tnzshqdaedbc.cloudfront.net/women-scrub-1.jpg";
      if (Array.isArray(p.images) && p.images.length > 0) {
        const primary = p.images.find((img: any) => img.primary) || p.images[0];
        imageUrl = primary?.imageUrl || primary?.url || imageUrl;
      } else if (Array.isArray(p.imageUrls) && p.imageUrls.length > 0) {
        imageUrl = p.imageUrls[0];
      }

      const price = p.price ? Number(p.price).toFixed(2) : "599.00";
      const title = escapeXml(p.name);
      const desc = escapeXml(p.description || p.shortDescription || p.name);

      itemsXml += `
    <item>
      <g:id>${p.id}</g:id>
      <g:title>${title}</g:title>
      <g:description>${desc}</g:description>
      <g:link>${escapeXml(productUrl)}</g:link>
      <g:image_link>${escapeXml(imageUrl)}</g:image_link>
      <g:brand>Medvarn</g:brand>
      <g:condition>new</g:condition>
      <g:availability>in_stock</g:availability>
      <g:price>${price} INR</g:price>
      <g:google_product_category>Apparel &amp; Accessories &gt; Uniforms &gt; Medical Uniforms</g:google_product_category>
    </item>`;
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Medvarn Official Product Catalog</title>
    <link>https://www.medvarn.com</link>
    <description>Premium Medical Apparel, Surgical Scrubs, and Healthcare Uniforms</description>${itemsXml}
  </channel>
</rss>`;

    return new Response(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=UTF-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error: any) {
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:g="http://base.google.com/ns/1.0"><channel><title>Medvarn Catalog</title></channel></rss>`,
      {
        status: 200,
        headers: { "Content-Type": "application/xml; charset=UTF-8" },
      }
    );
  }
}
