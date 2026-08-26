import { API_BASE } from "@/lib/api";

export async function GET() {
  try {
    const res = await fetch(`${API_BASE}/catalog/meta.xml`, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch catalog XML: ${res.status}`);
    }

    const xml = await res.text();

    return new Response(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=UTF-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Medvarn Catalog</title></channel></rss>`,
      {
        status: 500,
        headers: { "Content-Type": "application/xml" },
      }
    );
  }
}
