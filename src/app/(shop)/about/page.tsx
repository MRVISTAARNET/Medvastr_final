import React from "react";

export default function AboutPage() {
  return (
    <div style={{ backgroundColor: "#ffffff", minHeight: "100vh" }}>
      {/* Hero Section - The Professional Identity */}
      <div style={{
        height: "65vh",
        minHeight: "500px",
        background: "linear-gradient(rgba(15, 23, 42, 0.4), rgba(15, 23, 42, 0.4)), url('https://images.unsplash.com/photo-1631815587646-b85a1bb027e1?q=80&w=2042&auto=format&fit=crop') center/cover",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: "100px"
      }}>
        {/* Banner with no text overlay as requested */}
      </div>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px 150px" }}>

        {/* Section 1: The Genesis of Medvastr */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "80px", alignItems: "center", marginBottom: "140px" }}>
          <div>
            <h2 style={{ fontSize: "3rem", fontWeight: 900, color: "#0f172a", marginBottom: "32px", letterSpacing: "-0.02em", lineHeight: 1.2 }}>Where Science Meets <span style={{ color: "#10b981" }}>Style</span>.</h2>
            <div style={{ color: "#475569", fontSize: "1.125rem", lineHeight: 1.8 }}>
              <p style={{ marginBottom: "24px" }}>
                The story of Medvastr began in the quiet corridors of a busy metropolitan hospital in 2021. Our founders observed a glaring disconnect: while medical technology was advancing at light speed, the apparel worn by the surgeons, nurses, and technicians remained stagnant—uncomfortable, impersonal, and poorly fitted.
              </p>
              <p style={{ marginBottom: "24px" }}>
                A doctor's workday is an endurance test. Shifts often stretch beyond 18 hours, moving between high-pressure operating rooms and demanding patient consultations. We asked a simple question: <strong>Why should the world's most dedicated professionals settle for less-than-perfect gear?</strong>
              </p>
              <p style={{ marginBottom: "24px" }}>
                From that inquiry, Medvastr was born. Not just as a clothing brand, but as a performance-apparel engineering lab dedicated exclusively to the unique physiological and psychological needs of healthcare practitioners. Over the years, we have evolved from a small startup to India's most trusted medical apparel brand, serving over 250 healthcare institutes.
              </p>
              <p>
                Our philosophy is simple: healthcare is demanding, your apparel shouldn't be. We invest heavily in R&D to bring textile innovations like antimicrobial coatings, 4-way stretch fabrics, and color-retention technology to the forefront of medical gear.
              </p>
            </div>
          </div>
          <div style={{ position: "relative" }}>
            <div style={{
              aspectRatio: "4/5",
              borderRadius: "40px",
              overflow: "hidden",
              boxShadow: "0 40px 80px -15px rgba(15, 23, 42, 0.2)",
              background: "#f1f5f9"
            }}>
              <img
                src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=2080&auto=format&fit=crop"
                alt="Medvastr Craftsmanship"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
            <div style={{
              position: "absolute",
              top: "-30px",
              right: "-30px",
              background: "white",
              padding: "32px",
              borderRadius: "32px",
              boxShadow: "0 25px 50px rgba(0,0,0,0.1)",
              maxWidth: "200px"
            }}>
              <div style={{ fontSize: "2.5rem", fontWeight: 900, color: "#10b981" }}>4.9★</div>
              <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Industry Rating</div>
            </div>
          </div>
        </div>

        {/* Section 2: Our Core Philosophy - Section-wise attraction */}
        <div style={{ background: "#0f172a", borderRadius: "60px", padding: "100px 60px", color: "white", marginBottom: "140px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, right: 0, width: "400px", height: "400px", background: "radial-gradient(circle, rgba(16,185,129,0.15) 0%, rgba(15,23,42,0) 70%)", zIndex: 0 }} />

          <div style={{ textAlign: "center", marginBottom: "80px", position: "relative", zIndex: 1 }}>
            <h2 style={{ fontSize: "3rem", fontWeight: 900, marginBottom: "20px" }}>The Three Pillars of Medvastr</h2>
            <p style={{ fontSize: "1.25rem", color: "rgba(255,255,255,0.6)", maxWidth: "800px", margin: "0 auto" }}>
              Our design process is rooted in a deep understanding of clinical environments, ergonomics, and textile science.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "40px", position: "relative", zIndex: 1 }}>
            {[
              {
                t: "Adaptive Comfort",
                d: "We utilize 4-way stretch fabrics that move with the clinician, ensuring that whether you are performing a delicate procedure or rushing through an ER, your apparel is never a restriction.",
                i: "💨",
                l: "Fabric Science"
              },
              {
                t: "Clinical Integrity",
                d: "Our textiles are infused with advanced antimicrobial properties and liquid-repellent technology, creating a critical barrier between you and the environmental demands of healthcare.",
                i: "🧪",
                l: "Protection"
              },
              {
                t: "Dignified Aesthetics",
                d: "We believe that when you look professional, you feel empowered. Our sleek, modern silhouettes command respect and instill confidence in both the wearer and their patients.",
                i: "✨",
                l: "Design"
              }
            ].map(v => (
              <div key={v.t} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", padding: "50px 40px", borderRadius: "32px", transition: "transform 0.3s ease" }}>
                <div style={{ fontSize: "12px", fontWeight: 800, color: "#10b981", textTransform: "uppercase", letterSpacing: "2px", marginBottom: "24px" }}>{v.l}</div>
                <div style={{ fontSize: "3.5rem", marginBottom: "24px" }}>{v.i}</div>
                <h4 style={{ fontSize: "1.75rem", fontWeight: 800, marginBottom: "16px" }}>{v.t}</h4>
                <p style={{ color: "rgba(255,255,255,0.6)", lineHeight: 1.7 }}>{v.d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Detailed Content - The Fabric Lab */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "80px", alignItems: "center", marginBottom: "140px" }}>
          <div style={{ order: 2 }}>
            <h2 style={{ fontSize: "2.75rem", fontWeight: 900, color: "#0f172a", marginBottom: "32px", lineHeight: 1.2 }}>Innovation Built in the <span style={{ color: "#10b981" }}>Field</span>.</h2>
            <div style={{ color: "#475569", fontSize: "1.125rem", lineHeight: 1.8 }}>
              <p style={{ marginBottom: "24px" }}>
                Unlike generic apparel manufacturers, Medvastr products are not designed behind closed doors. We operate a unique \"Field Innovation Program\" where prototypes are worn by surgeons and residents at top-tier medical institutes for 30-day trial periods.
              </p>
              <p style={{ marginBottom: "24px" }}>
                We analyze every detail—from the angle of chest pockets to the breathability of the fabric under operating theater lights. This iterative feedback loop ensures that by the time a Medvastr scrub reaches you, it has been refined over hundreds of hours of actual clinical usage.
              </p>
              <p style={{ marginBottom: "24px" }}>
                Our commitment to quality is uncompromising. Each yard of fabric undergoes rigorous testing for pilling, color-fastness, and tensile strength. We understand that medical apparel isn't just a uniform—it's safety equipment.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px", marginTop: "40px" }}>
                <div>
                  <div style={{ fontSize: "2rem", fontWeight: 900, color: "#0f172a" }}>250+</div>
                  <div style={{ fontSize: "0.9rem", color: "#64748b", fontWeight: 600 }}>Institutes Served</div>
                </div>
                <div>
                  <div style={{ fontSize: "2rem", fontWeight: 900, color: "#0f172a" }}>500,000+</div>
                  <div style={{ fontSize: "0.9rem", color: "#64748b", fontWeight: 600 }}>Care Hours Supported</div>
                </div>
              </div>
            </div>
          </div>
          <div style={{ order: 1 }}>
            <div style={{
              aspectRatio: "1/1",
              borderRadius: "40px",
              overflow: "hidden",
              boxShadow: "0 40px 80px -15px rgba(15, 23, 42, 0.15)",
              background: "#f1f5f9"
            }}>
              <img
                src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2070&auto=format&fit=crop"
                alt="Clinical Testing"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
          </div>
        </div>

        {/* Section 4: Our Social Commitment */}
        <div style={{ textAlign: "center", padding: "100px 0", borderTop: "1px solid #f1f5f9" }}>
          <h2 style={{ fontSize: "2.75rem", fontWeight: 900, color: "#0f172a", marginBottom: "32px" }}>The Healer's Promise</h2>
          <p style={{ fontSize: "1.25rem", color: "#64748b", maxWidth: "850px", margin: "0 auto", lineHeight: 1.8, marginBottom: "60px" }}>
            For every 100 sets of scrubs sold, Medvastr donates specialized medical apparel to rural health clinics across India, ensuring that even those serving in the most underserved regions have access to high-quality professional gear.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "24px" }}>
            <div style={{ padding: "30px 50px", background: "#f8fafc", borderRadius: "24px" }}>
              <div style={{ fontSize: "14px", fontWeight: 800, color: "#10b981", marginBottom: "8px" }}>Impact</div>
              <div style={{ fontSize: "1.75rem", fontWeight: 800 }}>5,000+ Donations</div>
            </div>
            <div style={{ padding: "30px 50px", background: "#f8fafc", borderRadius: "24px" }}>
              <div style={{ fontSize: "14px", fontWeight: 800, color: "#10b981", marginBottom: "8px" }}>Network</div>
              <div style={{ fontSize: "1.75rem", fontWeight: 800 }}>120 Charity Partners</div>
            </div>
          </div>
        </div>

        {/* Closing Narrative - Call to connection */}
        <div style={{
          background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
          borderRadius: "50px",
          padding: "80px 40px",
          textAlign: "center",
          color: "white",
          boxShadow: "0 30px 60px rgba(16, 185, 129, 0.25)"
        }}>
          <h2 style={{ fontSize: "3rem", fontWeight: 900, marginBottom: "24px" }}>Join the Movement.</h2>
          <p style={{ fontSize: "1.35rem", marginBottom: "48px", maxWidth: "700px", margin: "0 auto 48px", opacity: 0.9 }}>
            Whether you are a medical student starting your first internship or a department head overseeing a major hospital, you are part of the Medvastr family. We are here to support you so you can focus on what matters most—saving lives.
          </p>
          <div style={{ fontSize: "1.125rem", fontWeight: 700, fontStyle: "italic" }}>
            Medvastr — Wear Your Dedication.
          </div>
        </div>

      </div>
    </div>
  );
}
