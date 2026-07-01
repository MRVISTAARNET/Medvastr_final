"use client";
import React, { useContext, useState, useMemo } from "react";
import { AppContext } from "@/context/AppContext";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import Image from "next/image";




export default function BulkOrderPage() {
  React.useEffect(() => {
    document.title = "Bulk Orders & Custom Hospital Uniforms | Medvastr";
  }, []);

  const ctx = useContext(AppContext);
  const [selectedQuantity, setSelectedQuantity] = useState(50);

  if (!ctx) return null;

  const { products, bulkOrderTiers } = ctx;

  const applicableTier = useMemo(() =>
    bulkOrderTiers.find(
      (tier: any) => selectedQuantity >= tier.minQuantity &&
        (!tier.maxQuantity || selectedQuantity <= tier.maxQuantity)
    ),
    [selectedQuantity, bulkOrderTiers]
  );

  const discountPercent = applicableTier?.discountPercentage || 0;
  const basePrice = 500;
  const savings = Math.round(basePrice * discountPercent / 100);

  const stats = [
    ["⭐", "200+ Washes", "Durability"],
    ["📦", "Custom Packaging", "Branding"],
    ["🚚", "Free Shipping", "100+ Units"],
    ["💰", "Bulk Discounts", "Up to 20%"],
  ];

  const benefits1 = [
    ["Special Pricing", "Exclusive discounts for large quantities"],
    ["Custom Packaging", "Branded packaging options available"],
    ["Dedicated Manager", "Personal account manager for orders"],
    ["Flexible Terms", "Extended payment options for bulk orders"],
  ];

  const benefits2 = [
    ["Free Shipping", "On orders over 100 units"],
    ["Quality Guaranteed", "200+ wash guarantee on all items"],
    ["Priority Support", "24/7 support for bulk inquiries"],
    ["Fast Delivery", "Express shipping available pan-India"],
  ];

  const faqs = [
    ["What is the minimum order quantity?", "Minimum bulk order starts from 50 items to qualify for institutional pricing and customization."],
    ["Can I choose different sizes?", "Absolutely! You can provide sizes as per your requirement across the total quantity."],
    ["Can I mix different products?", "Yes! You can mix and match any products. Bulk discount applies to total quantity."],
    ["What's the delivery time?", "Standard delivery: 5-7 business days. Express delivery within 2-3 days available on request."],
  ];

  const S3 = "https://d2tnzshqdaedbc.cloudfront.net";

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #ecfdf5 50%, #f0fdfa 100%)' }}>

      {/* ── HERO BANNER ── */}
      <SmartBanner base={`${S3}/bulk-order-banner`} title="Bulk Orders for Healthcare" />

      <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '0 24px 64px' }}>

        {/* Stats Grid Overlay (Premium Look) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginTop: '40px', zIndex: 10 }}>
          {stats.map(([icon, title, sub]) => (
            <div key={title} style={{ background: 'white', borderRadius: '16px', padding: '24px 16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 40px rgba(0,0,0,0.06)', textAlign: 'center' }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>{icon}</div>
              <div style={{ fontWeight: 800, fontSize: '14px', color: '#0f172a' }}>{title}</div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', fontWeight: 600 }}>{sub}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '64px' }}>

          {/* ── PRICING TIERS ── */}
          <div style={{ marginBottom: '64px' }}>
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, color: '#0f172a', marginBottom: '10px' }}>💰 Bulk Discount Pricing</h2>
              <p style={{ fontSize: '17px', color: '#64748b' }}>Select quantity to see your discount tier</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px', marginBottom: '48px' }}>
              {bulkOrderTiers.map((tier: any, idx: number) => {
                const isActive = applicableTier?.id === tier.id;
                return (
                  <div
                    key={tier.id}
                    onClick={() => setSelectedQuantity(tier.minQuantity)}
                    style={{
                      position: 'relative',
                      padding: '32px',
                      borderRadius: '20px',
                      cursor: 'pointer',
                      background: 'white',
                      boxShadow: isActive ? '0 20px 60px rgba(5,150,105,0.2)' : '0 4px 20px rgba(0,0,0,0.06)',
                      border: isActive ? '2.5px solid #10b981' : '2px solid #f1f5f9',
                      transform: isActive ? 'scale(1.03)' : 'scale(1)',
                      transition: 'all 0.25s ease',
                    }}
                  >
                    {isActive && (
                      <div style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(90deg, #10b981, #0d9488)', color: 'white', padding: '4px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, boxShadow: '0 4px 14px rgba(16,185,129,0.4)' }}>
                        ✓ YOUR TIER
                      </div>
                    )}
                    <div style={{ position: 'absolute', top: '16px', right: '16px', background: '#f8fafc', color: '#64748b', width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '18px' }}>
                      #{idx + 1}
                    </div>

                    <p style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, marginBottom: '6px' }}>📦 Quantity Range</p>
                    <p style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>
                      {tier.minQuantity} – {tier.maxQuantity ? tier.maxQuantity.toLocaleString() : '∞'}
                    </p>
                    <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '24px' }}>items</p>

                    <div style={{ borderTop: '2px solid #ecfdf5', paddingTop: '20px', paddingBottom: '20px' }}>
                      <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '6px' }}>🎯 Discount</p>
                      <p style={{ fontSize: '3.5rem', fontWeight: 900, color: '#059669', lineHeight: 1 }}>{tier.discountPercentage}%</p>
                      <p style={{ fontSize: '13px', color: '#94a3b8' }}>off per unit</p>
                    </div>

                    {tier.description && (
                      <div style={{ background: '#f0fdf4', borderLeft: '4px solid #10b981', padding: '12px 14px', borderRadius: '8px', fontSize: '13px', color: '#374151', fontWeight: 500 }}>
                        {tier.description}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── QUANTITY SELECTOR ── */}
          <div style={{ background: 'white', borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.08)', padding: 'clamp(32px, 5vw, 56px)', marginBottom: '64px', border: '2px solid #f1f5f9' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '48px' }}>

              {/* Left: Quantity Input */}
              <div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>📊 Select Your Quantity</h3>
                <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '32px' }}>
                  <strong>Min 50 pcs</strong> required for professional pricing. <br />
                  <span style={{ color: '#059669', fontWeight: 600 }}>✨ Sizes as per your requirement</span>
                </p>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '10px' }}>Total Items</label>
                  <input
                    type="number"
                    min="50"
                    max="5000"
                    value={selectedQuantity}
                    onChange={(e) => setSelectedQuantity(Math.min(5000, Math.max(50, parseInt(e.target.value) || 50)))}
                    style={{ width: '100%', padding: '14px 20px', border: '2px solid #a7f3d0', borderRadius: '14px', fontSize: '1.25rem', fontWeight: 800, textAlign: 'center', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ marginBottom: '8px' }}>
                  <input
                    type="range"
                    min="1"
                    max="500"
                    value={selectedQuantity}
                    onChange={(e) => setSelectedQuantity(parseInt(e.target.value))}
                    style={{ width: '100%', height: '8px', accentColor: '#059669', cursor: 'pointer' }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', fontWeight: 600, marginBottom: '28px' }}>
                  <span>1 item</span><span>250 items</span><span>500 items</span>
                </div>

                {/* Quick Select */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                  {[10, 25, 50, 100].map(qty => (
                    <button
                      key={qty}
                      onClick={() => setSelectedQuantity(qty)}
                      style={{
                        padding: '10px 0',
                        borderRadius: '10px',
                        fontWeight: 700,
                        fontSize: '15px',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                        background: selectedQuantity === qty ? '#059669' : '#f1f5f9',
                        color: selectedQuantity === qty ? 'white' : '#0f172a',
                      }}
                    >
                      {qty}
                    </button>
                  ))}
                </div>
              </div>

              {/* Right: Savings Panel */}
              <div style={{ background: 'linear-gradient(135deg, #ecfdf5, #f0fdfa)', borderRadius: '20px', padding: '32px', border: '2px solid #a7f3d0' }}>
                <p style={{ fontSize: '11px', fontWeight: 800, color: '#059669', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '20px' }}>💝 Your Savings</p>
                <div style={{ fontSize: '5rem', fontWeight: 900, color: '#059669', lineHeight: 1 }}>{discountPercent}%</div>
                <div style={{ fontSize: '16px', color: '#374151', margin: '8px 0' }}>
                  Save <strong style={{ color: '#059669' }}>₹{savings}</strong> per unit
                </div>
                <div style={{ fontSize: '14px', color: '#475569', marginBottom: '28px' }}>
                  Total savings: <strong style={{ color: '#059669' }}>₹{(savings * selectedQuantity).toLocaleString()}</strong>
                </div>

                <div style={{ background: 'white', borderRadius: '14px', padding: '16px', marginBottom: '20px' }}>
                  {[
                    ['Unit price', `₹${basePrice}`, true],
                    ['After discount', `₹${(basePrice - savings).toLocaleString()}`, false],
                  ].map(([label, val, strike]) => (
                    <div key={label as string} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', fontSize: '14px' }}>
                      <span style={{ color: '#64748b' }}>{label}</span>
                      <span style={{ textDecoration: strike ? 'line-through' : 'none', color: strike ? '#94a3b8' : '#059669', fontWeight: 700 }}>{val}</span>
                    </div>
                  ))}
                  <div style={{ borderTop: '2px solid #f1f5f9', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 800 }}>
                    <span>Total ({selectedQuantity} units)</span>
                    <span style={{ fontSize: '1.5rem', color: '#059669' }}>₹{((basePrice - savings) * selectedQuantity).toLocaleString()}</span>
                  </div>
                </div>

                {applicableTier?.description && (
                  <div style={{ background: '#eff6ff', borderLeft: '4px solid #3b82f6', padding: '12px 14px', borderRadius: '8px', fontSize: '13px', color: '#1e3a5f' }}>
                    ✓ {applicableTier.description}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── BENEFITS ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '64px' }}>
            <div style={{ background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', borderRadius: '20px', padding: '32px', border: '2px solid #bfdbfe' }}>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e3a5f', marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '2rem' }}>📦</span> Bulk Order Benefits
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {benefits1.map(([title, desc]) => (
                  <div key={title} style={{ display: 'flex', gap: '14px' }}>
                    <div style={{ fontSize: '20px', color: '#3b82f6', flexShrink: 0, marginTop: '2px' }}>✓</div>
                    <div>
                      <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '2px' }}>{title}</div>
                      <div style={{ fontSize: '13px', color: '#475569' }}>{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)', borderRadius: '20px', padding: '32px', border: '2px solid #a7f3d0' }}>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#064e3b', marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '2rem' }}>🚚</span> Shipping & Support
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {benefits2.map(([title, desc]) => (
                  <div key={title} style={{ display: 'flex', gap: '14px' }}>
                    <div style={{ fontSize: '20px', color: '#059669', flexShrink: 0, marginTop: '2px' }}>✓</div>
                    <div>
                      <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '2px' }}>{title}</div>
                      <div style={{ fontSize: '13px', color: '#475569' }}>{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── BULK PRODUCT CATALOG ── */}
          <div style={{ marginBottom: '80px' }}>
            <div style={{ textAlign: 'center', marginBottom: '60px' }}>
              <div style={{ display: 'inline-block', background: '#ecfdf4', color: '#059669', padding: '8px 20px', borderRadius: '100px', fontSize: '13px', fontWeight: 800, marginBottom: '16px', letterSpacing: '1px' }}>INSTITUTIONAL GRADE</div>
              <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 900, color: '#0f172a', letterSpacing: '-1.5px' }}>Bulk Product Categories</h2>
              <p style={{ color: '#64748b', marginTop: '10px', fontSize: '18px', maxWidth: '700px', margin: '12px auto 0' }}>Premium medical textiles and apparel supplied directly to top hospitals and clinics nationwide.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '32px' }}>
              {[
                { t: "Linen & Bedding", slug: "linen-and-bedding", img: "https://d2tnzshqdaedbc.cloudfront.net/bulk-linen.jpg", d: "High-performance institutional linens designed for over 200+ industrial washes." },
                { t: "Brown blanket", slug: "brown-blankets", img: "https://d2tnzshqdaedbc.cloudfront.net/bulk-blanket.jpg", d: "Professional grade ward blankets offering supreme warmth and infection control compliance." },
                { t: "Maternity Gown", slug: "maternity-gown", img: "https://d2tnzshqdaedbc.cloudfront.net/bulk-maternity.jpg", d: "Breathable, ergonomic maternity wear optimized for patient comfort and ease of care." },
                { t: "Patient Dresses", slug: "patient-dress", img: "https://d2tnzshqdaedbc.cloudfront.net/bulk-patient.jpg", d: "Soft, durable patient gowns and pajamas designed for clinical accessibility." },
                { t: "Scrub Suit", slug: "scrub-suit", img: "https://d2tnzshqdaedbc.cloudfront.net/bulk-scrub-suit.jpg", d: "High-performance medical scrubs designed for maximum comfort and flexibility during long clinical shifts." }
              ].map(item => (
                <Link key={item.slug} href={`/bulk-orders/${item.slug}`} style={{ textDecoration: 'none' }}>
                  <div className="bulk-card" style={{
                    borderRadius: '24px',
                    overflow: 'hidden',
                    background: 'white',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
                    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    <div style={{ aspectRatio: '1 / 1', overflow: 'hidden', position: 'relative' }}>
                      <Image src={item.img} alt={item.t} fill style={{ objectFit: 'cover', transition: 'transform 0.6s ease' }} className="card-img" sizes="(max-width: 768px) 100vw, 400px" />
                      <div className="card-overlay" style={{ position: 'absolute', inset: 0, background: 'rgba(0,128,128,0)', transition: 'all 0.3s' }}></div>
                    </div>
                    <div style={{ padding: '28px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <h4 style={{ fontSize: '22px', fontWeight: 900, color: '#0f172a', marginBottom: '12px', letterSpacing: '-0.5px' }}>{item.t}</h4>
                      <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px', lineHeight: 1.7, flex: 1 }}>{item.d}</p>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        background: 'linear-gradient(135deg, #ff4c29 0%, #ff1e56 100%)',
                        color: 'white',
                        padding: '12px 24px',
                        borderRadius: '12px',
                        fontWeight: 800,
                        fontSize: '13px',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        boxShadow: '0 6px 20px rgba(255,30,86,0.3)',
                        transition: 'all 0.3s',
                      }}>
                        View Details <span style={{ fontSize: '16px' }}>→</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <style jsx>{`
              .bulk-card:hover {
                transform: translateY(-12px);
                box-shadow: 0 25px 50px rgba(0,128,128,0.1);
                border-color: #008080;
              }
              .bulk-card:hover .card-img {
                transform: scale(1.1);
              }
              .bulk-card:hover .card-overlay {
                background: rgba(0,128,128,0.05);
              }
            `}</style>
          </div>

          {/* ── CTA ── */}
          <div style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)', borderRadius: '24px', padding: 'clamp(40px, 6vw, 64px) 40px', textAlign: 'center', marginBottom: '64px', border: '1.5px solid #334155' }}>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.5rem)', fontWeight: 800, color: 'white', marginBottom: '16px' }}>❓ Need Custom Pricing?</h2>
            <p style={{ fontSize: '16px', color: '#94a3b8', marginBottom: '40px', maxWidth: '560px', margin: '0 auto 40px' }}>
              For orders beyond standard tiers or special requirements, our team is ready to provide personalized quotes and support.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/contact?subject=bulk-order-inquiry" style={{ background: 'linear-gradient(135deg, #ff4c29 0%, #ff1e56 100%)', color: 'white', padding: '16px 40px', borderRadius: '100px', fontWeight: 900, fontSize: '18px', textDecoration: 'none', boxShadow: '0 10px 30px rgba(255,30,86,0.3)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                📧 Request Custom Pricing
              </Link>
              <a href="tel:+918976488911" style={{ border: '2px solid rgba(255,255,255,0.4)', color: 'white', padding: '14px 30px', borderRadius: '12px', fontWeight: 700, fontSize: '16px', textDecoration: 'none' }}>
                📱 Call Us Now
              </a>
            </div>
          </div>

          {/* ── FAQ ── */}
          <div>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.25rem)', fontWeight: 800, color: '#0f172a', textAlign: 'center', marginBottom: '48px' }}>Frequently Asked Questions</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              {faqs.map(([q, a]) => (
                <details key={q} style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', cursor: 'pointer', border: '1.5px solid #f1f5f9' }}>
                  <summary style={{ fontWeight: 700, fontSize: '16px', color: '#0f172a', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                    {q} <span style={{ fontSize: '16px', color: '#059669', flexShrink: 0 }}>▼</span>
                  </summary>
                  <p style={{ marginTop: '16px', color: '#475569', lineHeight: 1.7, fontSize: '15px' }}>{a}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SmartBanner({ base, title }: { base: string; title: string }) {
  const [src, setSrc] = React.useState(base + ".jpg");
  const [failed, setFailed] = React.useState(false);

  React.useEffect(() => {
    setSrc(base + ".jpg");
    setFailed(false);
  }, [base]);

  const tryNext = () => {
    if (src.endsWith(".jpg")) { setSrc(base + ".png"); }
    else if (src.endsWith(".png")) { setSrc(base + ".webp"); }
    else { setFailed(true); }
  };

  if (failed) return null;

  return (
    <div
      className="bulk-smart-banner"
      style={{
        width: "100%",
        background: "#0a0f1c",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={title}
        onError={tryNext}
        className="bulk-banner-img"
      />
      <style jsx>{`
        .bulk-smart-banner {
          width: 100%;
        }
        .bulk-banner-img {
          width: 100%;
          height: auto;
          display: block;
        }
        @media (max-width: 768px) {
          .bulk-smart-banner {
            min-height: 140px;
            display: flex;
            align-items: center;
          }
          .bulk-banner-img {
            min-height: 140px;
            object-fit: cover;
            object-position: center;
          }
        }
      `}</style>
    </div>
  );
}
