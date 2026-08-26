function escapeXml(unsafe: string | null | undefined): string {
  if (!unsafe) return "";
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const S3_BASE = "https://d2tnzshqdaedbc.cloudfront.net";

  // Fallback product items in case API is temporarily unreachable
  const fallbackProducts = [
    {
      id: 10,
      name: "Women's Cotton Crew Neck T-Shirt",
      slug: "womens-cotton-crew-neck-t-shirt",
      description: "Premium 100% cotton crew neck T-shirt offering soft breathable comfort for medical professionals.",
      price: 599,
      image: `${S3_BASE}/women-scrub-1.jpg`,
    },
    {
      id: 9,
      name: "Men's Cotton Crew Neck T-Shirt",
      slug: "mens-cotton-crew-neck-t-shirt",
      description: "Premium 100% cotton crew neck T-shirt designed for all-day clinical performance.",
      price: 599,
      image: `${S3_BASE}/men-scrub-1.jpg`,
    },
    {
      id: 8,
      name: "Women's Full Sleeve Compression Under Scrub",
      slug: "womens-full-sleeve-compression-under-scrub-t-shirt",
      description: "Cotton Lycra 4-way stretch compression underscrub for medical professionals.",
      price: 699,
      image: `${S3_BASE}/women-scrub-2.jpg`,
    },
    {
      id: 7,
      name: "Men's Full Sleeve Compression Under Scrub",
      slug: "mens-full-sleeve-compression-under-scrub-t-shirt",
      description: "Cotton Lycra 4-way stretch compression underscrub for doctors and surgeons.",
      price: 699,
      image: `${S3_BASE}/men-scrub-2.jpg`,
    },
  ];

  let itemsXml = "";

  try {
    const apiRes = await fetch("https://api.medvarn.com/api/products?size=200", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) MedvarnFeed/1.0",
        "Accept": "application/json",
      },
      next: { revalidate: 3600 },
    });

    if (apiRes.ok) {
      const data = await apiRes.json();
      const products: any[] = data?.data?.content || data?.data || [];

      for (const p of products) {
        if (p.active === false) continue;

        const productUrl = `https://www.medvarn.com/product/${p.slug || p.id}`;
        let imageUrl = `${S3_BASE}/women-scrub-1.jpg`;

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
    }
  } catch (err) {
    // Ignore error, fallback items will be rendered below
  }

  // If itemsXml is empty, use fallback items
  if (!itemsXml) {
    for (const p of fallbackProducts) {
      const productUrl = `https://www.medvarn.com/product/${p.slug}`;
      itemsXml += `
    <item>
      <g:id>${p.id}</g:id>
      <g:title>${escapeXml(p.name)}</g:title>
      <g:description>${escapeXml(p.description)}</g:description>
      <g:link>${escapeXml(productUrl)}</g:link>
      <g:image_link>${escapeXml(p.image)}</g:image_link>
      <g:brand>Medvarn</g:brand>
      <g:condition>new</g:condition>
      <g:availability>in_stock</g:availability>
      <g:price>${p.price.toFixed(2)} INR</g:price>
      <g:google_product_category>Apparel &amp; Accessories &gt; Uniforms &gt; Medical Uniforms</g:google_product_category>
    </item>`;
    }
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
}
