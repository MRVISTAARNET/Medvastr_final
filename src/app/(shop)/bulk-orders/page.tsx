"use client";
import { useContext, useState, useMemo } from "react";
import { AppContext } from "@/context/AppContext";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";

export default function BulkOrderPage() {
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
    ["What is the minimum order quantity?", "Minimum bulk order starts from 10 items. For smaller quantities, check our regular retail section."],
    ["Can I mix different products?", "Yes! You can mix and match any products. Bulk discount applies to total quantity."],
    ["What's the delivery time?", "Standard delivery: 5-7 business days. Express delivery within 2-3 days available on request."],
    ["Do you offer customization?", "Yes! Custom branding, packaging, and labeling available. Contact our team for details."],
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #ecfdf5 50%, #f0fdfa 100%)' }}>

      {/* ── HERO ── */}
      <div style={{ background: 'linear-gradient(135deg, #059669 0%, #0d9488 50%, #0891b2 100%)', color: 'white', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.08, backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 60%)' }} />
        <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '80px 24px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, marginBottom: '16px', letterSpacing: '-0.02em', lineHeight: 1.15 }}>
            Bulk Orders for Healthcare
          </h1>
          <p style={{ fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', color: 'rgba(255,255,255,0.88)', marginBottom: '48px', maxWidth: '680px', margin: '0 auto 48px' }}>
            Premium medical apparel with exclusive bulk discounts for hospitals, clinics, and institutions
          </p>

          {/* Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginTop: '40px' }}>
            {stats.map(([icon, title, sub]) => (
              <div key={title} style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)', borderRadius: '16px', padding: '20px 16px', border: '1px solid rgba(255,255,255,0.25)' }}>
                <div style={{ fontSize: '28px', marginBottom: '8px' }}>{icon}</div>
                <div style={{ fontWeight: 700, fontSize: '15px' }}>{title}</div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.75)', marginTop: '2px' }}>{sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '64px 24px' }}>

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
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '32px' }}>📊 Select Your Quantity</h3>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '10px' }}>Total Items</label>
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={selectedQuantity}
                  onChange={(e) => setSelectedQuantity(Math.min(500, Math.max(1, parseInt(e.target.value) || 1)))}
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

        {/* ── FEATURED PRODUCTS ── */}
        {products && products.length > 0 && (
          <div style={{ marginBottom: '64px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '40px' }}>
              <div>
                <h2 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.25rem)', fontWeight: 800, color: '#0f172a' }}>Featured Products</h2>
                <p style={{ color: '#64748b', marginTop: '6px', fontSize: '16px' }}>Top products available for bulk orders</p>
              </div>
              <Link href="/products" style={{ color: '#059669', fontWeight: 700, background: '#ecfdf5', padding: '10px 22px', borderRadius: '10px', textDecoration: 'none', border: '1.5px solid #a7f3d0', transition: 'all 0.15s' }}>
                View All →
              </Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '24px' }}>
              {products.slice(0, 8).map((product: any) => (
                <ProductCard key={product.id} p={product} />
              ))}
            </div>
          </div>
        )}

        {/* ── CTA ── */}
        <div style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)', borderRadius: '24px', padding: 'clamp(40px, 6vw, 64px) 40px', textAlign: 'center', marginBottom: '64px', border: '1.5px solid #334155' }}>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.5rem)', fontWeight: 800, color: 'white', marginBottom: '16px' }}>❓ Need Custom Pricing?</h2>
          <p style={{ fontSize: '16px', color: '#94a3b8', marginBottom: '40px', maxWidth: '560px', margin: '0 auto 40px' }}>
            For orders beyond standard tiers or special requirements, our team is ready to provide personalized quotes and support.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/contact?subject=bulk-order-inquiry" style={{ background: '#059669', color: 'white', padding: '14px 30px', borderRadius: '12px', fontWeight: 700, fontSize: '16px', textDecoration: 'none' }}>
              📧 Request Custom Quote
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
  );
}
