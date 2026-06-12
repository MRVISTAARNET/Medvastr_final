export default function SustainabilityPage() {
  const S = {
    wrap: { maxWidth: '1400px', margin: '0 auto', padding: '64px 24px', fontFamily: 'inherit' },
    hero: { background: 'linear-gradient(135deg,#064e3b 0%,#065f46 50%,#0d9488 100%)', borderRadius: '20px', padding: '56px 40px', marginBottom: '48px', color: 'white', position: 'relative' as const, overflow: 'hidden' },
    card: { background: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 2px 16px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9', marginBottom: '24px' },
    h2: { fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '14px' },
    p: { color: '#475569', lineHeight: 1.8, fontSize: '15px' },
    tag: { fontSize: '11px', fontWeight: 700, background: '#ecfdf5', color: '#059669', padding: '3px 10px', borderRadius: '20px', letterSpacing: '1px', textTransform: 'uppercase' as const, display: 'inline-block', marginBottom: '10px' },
    li: { display: 'flex', gap: '12px', alignItems: 'flex-start', fontSize: '15px', color: '#475569', lineHeight: 1.7, marginBottom: '12px' },
    dot: { color: '#059669', fontWeight: 800, flexShrink: 0, fontSize: '16px' },
  };

  const promises = [
    ['🧵', 'Comfort That Lasts', 'We use a special, soft fabric blend with a little bit of stretch. It breathes well, keeps you dry, and feels lightweight even during a long 12-hour shift.'],
    ['💪', 'Made to Endure', 'Hospital uniform washing is tough. Our uniforms use high-quality dyes and strong stitching so they stay bright, professional, and looking like new — even after hundreds of washes.'],
    ['🏥', 'A Complete Solution', 'We don\'t just sell scrubs. We supply entire hospitals with everything they need — from classic nursing uniforms and doctor gowns to patient clothes and bed linens, all color-coded by department.'],
  ];

  const differentiators = [
    ['🔬', 'Advanced Fabric Technology', 'Our uniforms are engineered using a premium blend of 98% Poly-Viscose (PV) and 2% Lycra, with an optimal fabric weight of 180 GSM. This specific composition ensures high breathability, durability, and moisture management — keeping medical staff safe, dry, and comfortable through demanding 12-hour shifts.'],
    ['🔧', 'Built to Endure', 'Healthcare garments undergo rigorous laundering. We use advanced, fade-resistant dyes and reinforced stitching to ensure our uniforms maintain their professional appearance and structural integrity even after hundreds of commercial high-temperature washes. The subtle stretch of the Lycra blend provides the necessary mobility for day-and-night comfort.'],
    ['🎨', 'Tailored for Every Department', 'We streamline hospital operations by offering a true one-stop solution. From classic nursing scrubs to heavy-duty surgical gowns and comfortable patient apparel, we design and supply cohesive, color-coded uniform programs customized for entire healthcare systems.'],
  ];

  return (
    <div style={S.wrap}>
      {/* Hero */}
      <div style={S.hero}>
        <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '260px', height: '260px', background: 'rgba(255,255,255,0.06)', borderRadius: '50%' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', marginBottom: '12px' }}>Since 2012</div>
          <h1 style={{ fontSize: 'clamp(1.8rem,4vw,2.8rem)', fontWeight: 900, marginBottom: '16px', lineHeight: 1.15 }}>Caring for Those Who<br />Care for Others</h1>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.82)', maxWidth: '600px', lineHeight: 1.7 }}>
            Since 2012, we have been a trusted partner for top hospitals, supplying high-quality linen and uniforms. Over the years, we watched healthcare heroes working exhausting shifts in stiff, uncomfortable scrubs. We knew they deserved better. That's why we created Medvastr — a brand dedicated to changing medical apparel for the better.
          </p>
        </div>
      </div>

      {/* Intro */}
      <div style={S.card}>
        <span style={S.tag}>Our Mission</span>
        <p style={S.p}>
          Medvastr blends comfort, daily functionality, and modern style. We meet the needs of modern hospitals by offering premium medical scrubs and eco-friendly green linen products. <strong style={{ color: '#0f172a' }}>You spend your days taking care of others — Medvastr is here to take care of you.</strong>
        </p>
      </div>

      {/* Three Promises */}
      <div style={S.card}>
        <span style={S.tag}>Our Three Simple Promises</span>
        <h2 style={S.h2}>What We Stand For</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: '20px', marginTop: '8px' }}>
          {promises.map(([icon, title, desc]) => (
            <div key={title as string} style={{ background: '#f0fdf4', borderRadius: '12px', padding: '24px', border: '1.5px solid #a7f3d0' }}>
              <div style={{ fontSize: '28px', marginBottom: '10px' }}>{icon}</div>
              <div style={{ fontWeight: 800, color: '#064e3b', marginBottom: '8px', fontSize: '15px' }}>{title}</div>
              <p style={{ ...S.p, fontSize: '14px', marginBottom: 0 }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* What Makes Us Different */}
      <div style={S.card}>
        <span style={S.tag}>Real Experience</span>
        <h2 style={S.h2}>What Makes Us Different?</h2>
        <p style={{ ...S.p, marginBottom: '20px' }}>
          We are not a new fashion company trying to make scrubs. We have over a decade of real experience working directly with hospitals. We know exactly what fabric works, what lasts, and what healthcare workers actually need to feel good at work.
        </p>
      </div>

      {/* Green Linen */}
      <div style={{ background: 'linear-gradient(135deg,#ecfdf5,#f0fdfa)', borderRadius: '16px', padding: '32px', border: '2px solid #6ee7b7', marginBottom: '24px' }}>
        <div style={{ fontSize: '32px', marginBottom: '12px' }}>🌿</div>
        <h2 style={{ ...S.h2, color: '#064e3b' }}>Moving Towards a Greener Future</h2>
        <p style={S.p}>
          We also believe in protecting the planet while protecting people. Alongside our scrubs, we offer <strong style={{ color: '#059669' }}>Green Linen</strong> options — eco-friendly, sustainable hospital linens designed to reduce waste and help healthcare facilities lower their environmental footprint without losing quality or safety.
        </p>
      </div>

      {/* Why Leading Hospitals Choose Us */}
      <div style={S.card}>
        <span style={S.tag}>Why Leading Hospitals Choose Us</span>
        <h2 style={S.h2}>Built for Healthcare, Not Fashion</h2>
        <p style={{ ...S.p, marginBottom: '24px' }}>We understand that medical apparel isn't just clothing — it is a critical piece of healthcare equipment. That is why our manufacturing process is built around three uncompromising principles:</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {differentiators.map(([icon, title, desc]) => (
            <div key={title as string} style={S.li}>
              <div style={{ width: '48px', height: '48px', background: '#ecfdf5', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>{icon}</div>
              <div>
                <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>{title}</div>
                <p style={{ ...S.p, marginBottom: 0, fontSize: '14px' }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ background: 'linear-gradient(135deg,#0f172a,#1e3a5f)', borderRadius: '16px', padding: '40px', textAlign: 'center', color: 'white' }}>
        <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🏥</div>
        <h3 style={{ fontWeight: 800, fontSize: '1.4rem', marginBottom: '10px' }}>Ready to Outfit Your Team?</h3>
        <p style={{ color: 'rgba(255,255,255,0.75)', marginBottom: '24px', fontSize: '15px' }}>Join hundreds of hospitals and clinics who trust Medvastr for premium medical apparel.</p>
        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="/bulk-orders" style={{ background: '#059669', color: 'white', padding: '12px 26px', borderRadius: '10px', fontWeight: 700, textDecoration: 'none' }}>Explore Bulk Orders →</a>
          <a href="/contact" style={{ border: '2px solid rgba(255,255,255,0.35)', color: 'white', padding: '12px 26px', borderRadius: '10px', fontWeight: 700, textDecoration: 'none' }}>Get in Touch</a>
        </div>
      </div>
    </div>
  );
}
