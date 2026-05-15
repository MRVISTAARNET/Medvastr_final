"use client";

import GenericPage from "@/components/GenericPage";

export default function BlogPage() {
  return (
    <GenericPage title="Blog & Resources" desc="Healthcare style, wellness tips, and medical industry news.">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 30 }}>
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ border: "1px solid var(--bdr)", borderRadius: 12, overflow: "hidden" }}>
            <div style={{ height: 200, background: "var(--warm)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40 }}>📰</div>
            <div style={{ padding: 20 }}>
              <div style={{ fontSize: 12, color: "var(--t)", fontWeight: 700, textTransform: "uppercase", marginBottom: 8 }}>Articles</div>
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>Medical Apparel Trends in 2026</div>
              <p style={{ fontSize: 14, color: "var(--lt)", lineHeight: 1.6 }}>Discover the latest innovations in surgical gowns and hospital linen technology.</p>
              <div style={{ marginTop: 15, fontWeight: 600, fontSize: 13 }}>Read More →</div>
            </div>
          </div>
        ))}
      </div>
    </GenericPage>
  );
}
