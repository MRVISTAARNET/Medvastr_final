"use client";
import React from "react";
import Link from "next/link";

const IMAGES = {
  hero: "https://medvastr-assets.s3.ap-south-1.amazonaws.com/about-1.jpg",
  section2: "https://medvastr-assets.s3.ap-south-1.amazonaws.com/about-2.jpg",
  section3: "https://medvastr-assets.s3.ap-south-1.amazonaws.com/about-3.jpg",
  section4: "https://medvastr-assets.s3.ap-south-1.amazonaws.com/about-4.jpg",
  section5: "https://medvastr-assets.s3.ap-south-1.amazonaws.com/about-5.jpg",
  section6: "https://medvastr-assets.s3.ap-south-1.amazonaws.com/about-6.jpg"
};

const COLORS = {
  navy: "#1a1a3a",
  teal: "#008080",
  wine: "#4b0082",
  lightGray: "#f1f5f9",
  border: "#cbd5e1",
  text: "#334155",
};

export default function AboutPage() {
  return (
    <div style={{ backgroundColor: "#ffffff", minHeight: "100vh", fontFamily: "system-ui, sans-serif" }}>

      {/* 1. TOP HEADER SECTION */}
      <section style={{ padding: "80px 24px", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ borderTop: `2px solid ${COLORS.teal}`, borderBottom: `2px solid ${COLORS.teal}`, padding: "60px 0", position: "relative" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "60px" }}>
            <div>
              <h1 style={{ fontSize: "72px", fontWeight: "900", color: COLORS.navy, lineHeight: "0.9", margin: 0 }}>
                About Us : <br />
                <span style={{ fontSize: "56px", fontWeight: "700" }}>Caring for Those Who Care for Others</span>
              </h1>
            </div>
            <div style={{ borderLeft: `2px dotted ${COLORS.border}`, paddingLeft: "40px", color: COLORS.text, fontSize: "18px", lineHeight: "1.6" }}>
              <p style={{ marginBottom: "20px" }}>Since 2012, we have been a trusted partner for top hospitals, supplying high-quality linen and uniforms.</p>
              <p style={{ marginBottom: "20px" }}>Over the years, we watched healthcare heroes working exhausting shifts in stiff, uncomfortable scrubs. We knew they deserved better.</p>
              <p style={{ marginBottom: "20px" }}>That is why we created <strong>Medvastr</strong>—a brand dedicated to changing medical apparel for the better.</p>
              <p>We meet the needs of modern hospitals by offering premium medical scrubs and eco-friendly green linen products.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THREE PROMISES */}
      <section style={{ padding: "60px 24px", maxWidth: "1200px", margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", fontSize: "36px", fontWeight: "800", color: COLORS.navy, marginBottom: "50px" }}>Our Three Simple Promises</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "30px" }}>
          <PromiseBox title="Comfort That Lasts" desc="We use a special, soft fabric blend with a little bit of stretch. It breathes well, keeps you dry, and feels lightweight even during a long 12-hour shift." />
          <PromiseBox title="Made to Endure" desc="Hospital uniform washing is tough. Our uniforms use high-quality dyes and strong stitching so they stay bright, professional, and looking like new—even after multiple washes." />
          <PromiseBox title="A Complete Solution" desc="We don't just sell scrubs. We supply entire hospitals with everything they need, from nursing uniforms to patient clothes and bed linens, all color-coded by department." />
        </div>
      </section>

      {/* 3. DIFFERENCE SECTION */}
      <section style={{ padding: "60px 24px", maxWidth: "1200px", margin: "0 auto", textAlign: "center", borderBottom: `1px solid ${COLORS.border}` }}>
        <h2 style={{ fontSize: "36px", fontWeight: "800", color: COLORS.navy, marginBottom: "24px" }}>What Makes Us Different?</h2>
        <p style={{ fontSize: "18px", color: COLORS.text, maxWidth: "900px", margin: "0 auto", lineHeight: "1.8" }}>
          <strong>Real Experience:</strong> We have over a decade of real experience working directly with hospitals. We know exactly what fabric works, what lasts, and what healthcare workers actually need to feel good at work.
        </p>
      </section>

      <section style={{ padding: "100px 24px", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "60px", alignItems: "start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
            <ImageBox src={IMAGES.hero} label="SCRUBS_HERO_IMAGE" width="100%" height="800px" />
            <div style={{ marginTop: "40px", border: `2px dashed ${COLORS.border}`, padding: "30px", borderRadius: "12px" }}>
              <h3 style={{ fontSize: "24px", fontWeight: "800", marginBottom: "20px" }}>Size Chart: Mens & Womens</h3>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                <thead>
                  <tr style={{ backgroundColor: COLORS.navy, color: "white" }}>
                    <th style={tableCell}>Size</th>
                    <th style={tableCell}>Chest</th>
                    <th style={tableCell}>Shoulder</th>
                    <th style={tableCell}>Length</th>
                  </tr>
                </thead>
                <tbody>
                  {['XS', 'S', 'M', 'L', 'XL', '2XL'].map(s => (
                    <tr key={s}>
                      <td style={tableCellBody}><strong>{s}</strong></td>
                      <td style={tableCellBody}>35-37</td>
                      <td style={tableCellBody}>18.75</td>
                      <td style={tableCellBody}>27.5</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div>
            <h2 style={{ fontSize: "56px", fontWeight: "900", color: COLORS.navy, marginBottom: "30px", fontStyle: "italic" }}>Flexi Fit V Scrubs</h2>
            <ul style={{ listStyle: "disc", paddingLeft: "24px", fontSize: "18px", color: COLORS.text, lineHeight: "1.8", marginBottom: "40px" }}>
              <li>Engineered specifically to withstand the rigorous demands of a 12-hour shift, or garment utilizes a proprietary high-performance fabric matrix.</li>
              <li>Our uniforms are engineered using a premium blend of <strong>98% Poly-Viscose (PV) and 2% Lycra</strong>, with an optimal fabric weight of <strong>180 GSM</strong>.</li>
            </ul>
            <div style={{ padding: "30px", backgroundColor: COLORS.navy, borderRadius: "20px", color: "white", marginBottom: "40px" }}>
              <h4 style={{ fontWeight: "800", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "1px" }}>Color Options :</h4>
              <div style={{ display: "flex", gap: "24px" }}>
                <ColorCircle color="#1a1a3a" name="Navy Blue" />
                <ColorCircle color="#93c5fd" name="Light Blue" />
                <ColorCircle color="#4b0082" name="Maroon" />
                <ColorCircle color="#2d1b33" name="Wine" />
              </div>
            </div>
            <ImageBox src={IMAGES.section2} label="SCRUBS_MODELS_PHOTO" width="100%" height="500px" />
          </div>
        </div>
      </section>

      <section style={{ padding: "80px 24px", backgroundColor: "#f8fafc" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "60px", alignItems: "center", marginBottom: "60px" }}>
            <div>
              <h2 style={{ fontSize: "48px", fontWeight: "900", color: COLORS.navy, marginBottom: "30px" }}>Premium Cotton Crew T-Shirts :</h2>
              <ImageBox src={IMAGES.section3} label="TSHIRT_FLAT_LAY" width="100%" height="300px" />
            </div>
            <div style={{ border: `1px solid ${COLORS.navy}`, borderRadius: "12px", overflow: "hidden" }}>
              <div style={{ backgroundColor: COLORS.navy, color: "white", padding: "12px", textAlign: "center", fontWeight: "800" }}>PRODUCT SPECIFICATIONS</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr" }}>
                <div style={specHeader}>Material Composition</div>
                <div style={specCell}>100% Long-Staple Cotton — Ultra-soft hand feel.</div>
                <div style={specHeader}>Fabric Weight</div>
                <div style={specCell}>Optimized mid-weight knit for seamless layering.</div>
                <div style={specHeader}>Structural Fit</div>
                <div style={specCell}>Reinforced lay-flat crew neck collar.</div>
              </div>
            </div>
          </div>
          <ImageBox src={IMAGES.section4} label="TSHIRT_GROUP_PHOTO" width="100%" height="600px" />
        </div>
      </section>

      <section style={{ padding: "100px 24px", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "60px", alignItems: "center" }}>
          <ImageBox src={IMAGES.section5} label="COMPRESSION_PRODUCT" width="100%" height="500px" />
          <div>
            <h2 style={{ fontSize: "42px", fontWeight: "900", color: COLORS.navy, textTransform: "uppercase" }}>Full Sleeves Compression Underscrub</h2>
            <p style={{ fontSize: "18px", lineHeight: "1.6", color: COLORS.text, margin: "24px 0" }}>
              This premium compression underscrub combines the natural thermoregulation of long-staple cotton with the strategic elasticity of Lycra®. It acts as a second skin minimizing muscle fatigue.
            </p>
            <div style={{ border: "2px solid #000", borderRadius: "10px", overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr" }}>
                <div style={techHeader}>Material Blend</div><div style={techCell}>Long-Staple Combed Cotton + Premium Lycra</div>
                <div style={techHeader}>Compression Level</div><div style={techCell}>Mild-to-Moderate (Optimized for 12-hour wear)</div>
                <div style={techHeader}>Sleeve Architecture</div><div style={techCell}>Full-length tapered sleeves</div>
              </div>
            </div>
            <p style={{ marginTop: "24px", fontWeight: "700" }}>• Stealth Black (Sleek, low-maintenance)</p>
            <p style={{ fontWeight: "700" }}>• Sizing Grid: S | M | L | XL | XXL</p>
          </div>
        </div>
      </section>

      <section style={{ padding: "80px 24px", backgroundColor: "#f1f5f9" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "60px" }}>
            <div style={{ backgroundColor: "white", padding: "40px", borderRadius: "20px", boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
              <ImageBox src={IMAGES.section6} label="SURGICAL_SHOT" width="100%" height="300px" />
              <h3 style={{ fontSize: "32px", fontWeight: "900", color: COLORS.teal, textTransform: "uppercase", margin: "30px 0 10px" }}>Surgical OT Gowns & Caps</h3>
              <p style={{ color: COLORS.text, marginBottom: "20px" }}>In the operating theatre, your apparel is your primary defense against cross-contamination.</p>
              <table style={{ width: "100%", fontSize: "14px" }}>
                <tbody>
                  <tr style={{ borderBottom: "1px solid #eee" }}><td style={{ padding: "8px" }}>OT Gown:</td><td style={{ padding: "8px", fontWeight: "700" }}>100% Cotton, 135 GSM</td></tr>
                  <tr><td style={{ padding: "8px" }}>Surgical Cap:</td><td style={{ padding: "8px", fontWeight: "700" }}>100% Cotton, 135 GSM</td></tr>
                </tbody>
              </table>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
              <div style={{ backgroundColor: COLORS.navy, color: "white", padding: "40px", borderRadius: "20px" }}>
                <h3 style={{ fontSize: "28px", fontWeight: "800", marginBottom: "20px" }}>Maternity Gown</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "10px", fontSize: "14px" }}>
                  <div>Material:</div><div>Poly Cotton</div>
                  <div>Clinical Access:</div><div>Upper chest/shoulders | Full column</div>
                  <div>Colour:</div><div>Dark Maroon</div>
                </div>
              </div>
              <div style={{ backgroundColor: "white", border: `1px solid ${COLORS.navy}`, padding: "40px", borderRadius: "20px" }}>
                <h3 style={{ fontSize: "28px", fontWeight: "800", marginBottom: "20px", color: COLORS.navy }}>Patient Dress</h3>
                <p style={{ fontSize: "14px", fontWeight: "600", marginBottom: "10px" }}>1. General Ward & Ambulatory Dresses</p>
                <p style={{ fontSize: "12px", color: COLORS.text, marginBottom: "20px" }}>Two-piece top-and-trouser sets with easy-tie soft-snap closures.</p>
                <p style={{ fontSize: "14px", fontWeight: "600", marginBottom: "10px" }}>2. Pediatric & Neonatal Collection</p>
                <p style={{ fontSize: "12px", color: COLORS.text }}>Ultra-soft, vibrant, distraction printed garments. 100% Cotton.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER CTA */}
      <section style={{ padding: "100px 24px", textAlign: "center" }}>
        <h2 style={{ fontSize: "40px", fontWeight: "900", color: COLORS.navy, marginBottom: "20px" }}>Experience the Medvastr Difference.</h2>
        <Link href="/products" style={{ textDecoration: "none" }}>
          <button style={{ backgroundColor: COLORS.teal, color: "white", padding: "20px 60px", borderRadius: "50px", border: "none", fontSize: "20px", fontWeight: "700", cursor: "pointer" }}>
            Explore Our Products
          </button>
        </Link>
      </section>
    </div>
  );
}

function PromiseBox({ title, desc }: { title: string; desc: string }) {
  return (
    <div style={{ padding: "40px", border: `1px solid ${COLORS.border}`, borderRadius: "16px", backgroundColor: "white", textAlign: "center" }}>
      <h3 style={{ fontSize: "24px", fontWeight: "800", color: COLORS.navy, marginBottom: "16px", textTransform: "uppercase" }}>{title}</h3>
      <p style={{ color: COLORS.text, lineHeight: "1.6", fontStyle: "italic" }}>{desc}</p>
    </div>
  );
}

function ImageBox({ src, label, width, height }: { src: string; label: string; width: string; height: string }) {
  return (
    <div style={{ width, height, backgroundColor: "#f1f5f9", borderRadius: "20px", overflow: "hidden", position: "relative" }}>
      <img
        src={src}
        alt={label}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
        onError={(e) => {
          (e.target as any).style.display = 'none';
          (e.target as any).parentElement.innerHTML = `
            <div style="height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:20px; text-align:center; background:#e2e8f0; border:2px dashed #94a3b8">
              <div style="font-size:40px; margin-bottom:10px">📷</div>
              <p style="font-size:12px; font-weight:700; color:#1a1a3a">${label}</p>
              <p style="font-size:10px; color:#64748b">S3 Path: ${src.split('/').pop()}</p>
            </div>
          `;
        }}
      />
    </div>
  );
}

function ColorCircle({ color, name }: { color: string; name: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
      <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: color, border: "2px solid white" }}></div>
      <span style={{ fontSize: "10px", fontWeight: "600", opacity: "0.8" }}>{name}</span>
    </div>
  );
}

const tableCell: React.CSSProperties = { padding: "12px", border: "1px solid rgba(0,0,0,0.1)", textAlign: "left" };
const tableCellBody: React.CSSProperties = { padding: "12px", border: `1px solid ${COLORS.border}`, textAlign: "left" };
const specHeader: React.CSSProperties = { padding: "16px", borderRight: `1px solid ${COLORS.navy}`, borderBottom: `1px solid ${COLORS.navy}`, fontWeight: "700", backgroundColor: "#0000000a", fontSize: "13px" };
const specCell: React.CSSProperties = { padding: "16px", borderBottom: `1px solid ${COLORS.navy}`, fontSize: "13px" };
const techHeader: React.CSSProperties = { padding: "16px", backgroundColor: COLORS.navy, color: "white", fontWeight: "700", fontSize: "14px" };
const techCell: React.CSSProperties = { padding: "16px", fontWeight: "700", color: COLORS.navy, fontSize: "14px", borderBottom: "1px solid #eee" };
