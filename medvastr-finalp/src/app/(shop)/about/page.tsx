import GenericPage from "@/components/GenericPage";

export default function AboutPage() {
  return (
    <GenericPage
      title="About Us"
      desc="Built for those who heal. Medvastr is India's leading premium medical apparel brand."
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, alignItems: "center" }}>
        <div>
          <h2 style={{ fontFamily: "var(--serif)", fontSize: 32, marginBottom: 16 }}>Our Mission</h2>
          <p style={{ fontSize: 15, lineHeight: 1.8, marginBottom: 14 }}>
            To clothe India's 5 million+ healthcare professionals with apparel that combines <strong>comfort</strong>,{" "}
            <strong>functionality</strong> and <strong>professional aesthetics</strong> — at a price that respects their
            dedication.
          </p>
          <p style={{ fontSize: 15, lineHeight: 1.8 }}>
            Every Medvastr product is tested in real clinical environments before reaching you. We work directly with
            doctors, nurses, surgeons and hospital administrators.
          </p>
        </div>
        <div style={{ background: "var(--warm)", padding: 30, borderRadius: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {[
              ["50K+", "Happy Customers"],
              ["4.8★", "Average Rating"],
              ["200+", "Cities Delivered"],
              ["₹2Cr+", "Products Sold"],
            ].map(([n, l]) => (
              <div key={l} style={{ textAlign: "center", padding: 14, background: "white", borderRadius: 10 }}>
                <div style={{ fontFamily: "var(--serif)", fontSize: 24, fontWeight: 700, color: "var(--t)" }}>{n}</div>
                <div style={{ fontSize: 11, color: "var(--lt)" }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </GenericPage>
  );
}
