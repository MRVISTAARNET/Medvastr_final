import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        textAlign: "center",
        fontFamily: "var(--font-sans, system-ui, sans-serif)",
        background: "#fafafa",
      }}
    >
      <div style={{ fontSize: 72, fontWeight: 800, color: "#008080", lineHeight: 1 }}>404</div>
      <h1 style={{ fontSize: 28, margin: "16px 0 8px", fontFamily: "var(--font-serif, Georgia, serif)" }}>
        Page not found
      </h1>
      <p style={{ color: "#666", maxWidth: 420, marginBottom: 32 }}>
        The page you are looking for may have been moved or no longer exists.
      </p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
        <Link href="/" className="btn-p" style={{ padding: "12px 24px", borderRadius: 10, textDecoration: "none" }}>
          Go Home
        </Link>
        <Link
          href="/products"
          style={{
            padding: "12px 24px",
            borderRadius: 10,
            border: "1.5px solid #008080",
            color: "#008080",
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          Browse Products
        </Link>
      </div>
    </div>
  );
}
