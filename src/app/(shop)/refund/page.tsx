export default function ShippingRefundPage() {
  const S = {
    wrap: { maxWidth: '1400px', margin: '0 auto', padding: '64px 24px', fontFamily: 'inherit' },
    hero: { background: 'linear-gradient(135deg,#0f172a 0%,#1e3a5f 100%)', borderRadius: '20px', padding: '48px 40px', marginBottom: '48px', color: 'white' },
    heroTitle: { fontSize: 'clamp(1.6rem,4vw,2.4rem)', fontWeight: 800, marginBottom: '10px' },
    heroSub: { fontSize: '16px', color: 'rgba(255,255,255,0.75)', maxWidth: '520px' },
    section: { background: 'white', borderRadius: '16px', padding: '32px', marginBottom: '24px', boxShadow: '0 2px 16px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' },
    secHeader: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', paddingBottom: '16px', borderBottom: '2px solid #f1f5f9' },
    icon: { width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 },
    h2: { fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0 },
    p: { color: '#475569', lineHeight: 1.8, fontSize: '15px', marginBottom: '10px' },
    ul: { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column' as const, gap: '10px' },
    li: { display: 'flex', gap: '10px', alignItems: 'flex-start', fontSize: '15px', color: '#475569', lineHeight: 1.7 },
    dot: { color: '#059669', fontWeight: 800, flexShrink: 0, marginTop: '1px' },
    note: { background: '#fefce8', border: '1.5px solid #fde047', borderRadius: '10px', padding: '14px 18px', fontSize: '13px', color: '#713f12', fontWeight: 500, marginTop: '16px' },
    badge: { fontSize: '11px', fontWeight: 700, background: '#ecfdf5', color: '#059669', padding: '3px 10px', borderRadius: '20px', textTransform: 'uppercase' as const, letterSpacing: '1px' },
  };

  return (
    <div style={S.wrap}>
      <div style={S.hero}>
        <div style={S.heroTitle}>Shipping & Refund Policies</div>
        <p style={S.heroSub}>Here's everything you need to know about our shipping timelines, how to return or exchange an item, and when to expect your refund.</p>
      </div>

      {/* Shipping Policy */}
      <div style={S.section}>
        <div style={S.secHeader}>
          <div style={{ ...S.icon, background: '#eff6ff' }}>🚚</div>
          <div>
            <div style={S.h2}>Shipping Policy</div>
            <span style={S.badge}>Delivery Info</span>
          </div>
        </div>
        <p style={S.p}>We aim to deliver your order as quickly and safely as possible.</p>
        <ul style={S.ul}>
          {[
            ['Order Processing', 'Orders are processed within 1–2 business days.'],
            ['Delivery Time', 'Products are typically delivered within 3–7 days after dispatch, depending on your location.'],
            ['Embroidered / Engraved Items', 'Require an additional 2–4 working days for dispatch.'],
            ['Tracking', 'A tracking link will be shared via email/WhatsApp after dispatch.'],
            ['Coverage', 'We deliver across India via trusted courier partners.'],
          ].map(([b, t]) => (
            <li key={b} style={S.li}><span style={S.dot}>▸</span><span><strong style={{ color: '#0f172a' }}>{b}:</strong> {t}</span></li>
          ))}
        </ul>
      </div>

      {/* Exchange & Return */}
      <div style={S.section}>
        <div style={S.secHeader}>
          <div style={{ ...S.icon, background: '#fef3c7' }}>🔄</div>
          <div>
            <div style={S.h2}>Exchange & Return Policy</div>
            <span style={{ ...S.badge, background: '#fef3c7', color: '#92400e' }}>7-Day Window</span>
          </div>
        </div>
        <p style={S.p}>We accept return or exchange requests under the following terms:</p>
        <ul style={S.ul}>
          {[
            ['Exchange Window', 'Requests must be placed within 7 days of delivery. Once the exchange request is approved, the replacement product will be delivered within 3–7 business days.'],
            ['Eligibility', 'Products must be unused, unwashed, and returned in their original packaging including all tags and boxes. Worn or damaged items will not be accepted.'],
            ['Non-Returnable Items', 'Embroidered, engraved, or sale items are not eligible for return/exchange.'],
            ['Processing', 'Exchange orders are initiated after the original item is picked up. If reverse pickup isn\'t available in your area, you may be asked to self-ship the product.'],
          ].map(([b, t]) => (
            <li key={b} style={S.li}><span style={S.dot}>▸</span><span><strong style={{ color: '#0f172a' }}>{b}:</strong> {t}</span></li>
          ))}
        </ul>
        <div style={S.note}>💡 Warehouse address will be provided upon request if self-shipping is required.</div>
      </div>

      {/* Refund Policy */}
      <div style={S.section}>
        <div style={S.secHeader}>
          <div style={{ ...S.icon, background: '#ecfdf5' }}>₹</div>
          <div>
            <div style={S.h2}>Refund Policy</div>
            <span style={S.badge}>2–5 Business Days</span>
          </div>
        </div>
        <p style={S.p}>Refunds are processed after inspection and approval of returned items.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginTop: '12px' }}>
          {[
            { title: 'Prepaid Orders', color: '#eff6ff', borderColor: '#bfdbfe', items: ['A flat ₹100 reverse shipment fee is deducted for returns (not exchanges).', 'Prepaid non-embroidery RTOs can only be refunded via credit voucher.', 'Refunds are credited back to the original payment method.'] },
            { title: 'COD Orders', color: '#fef9ec', borderColor: '#fde68a', items: ['Refunds are provided via credit voucher as a gift card sent to your registered email.', 'COD handling charges paid at the time of order are non-refundable.'] },
          ].map(({ title, color, borderColor, items }) => (
            <div key={title} style={{ background: color, border: `1.5px solid ${borderColor}`, borderRadius: '12px', padding: '20px' }}>
              <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '12px', fontSize: '14px' }}>{title}</div>
              <ul style={{ ...S.ul, gap: '8px' }}>
                {items.map(i => <li key={i} style={{ ...S.li, fontSize: '13px' }}><span style={S.dot}>✓</span><span>{i}</span></li>)}
              </ul>
            </div>
          ))}
        </div>

        <ul style={{ ...S.ul, marginTop: '16px' }}>
          {[
            ['Refund Timeline', 'Refunds are initiated immediately after the returned items pass quality checks and are picked up. The amount is credited within 2–5 business days.'],
            ['Reverse Pickup', 'We offer reverse pickup in most locations. If unavailable, self-shipping may be required.'],
          ].map(([b, t]) => (
            <li key={b} style={S.li}><span style={S.dot}>▸</span><span><strong style={{ color: '#0f172a' }}>{b}:</strong> {t}</span></li>
          ))}
        </ul>
      </div>

      {/* Need Help */}
      <div style={{ background: 'linear-gradient(135deg,#059669,#0d9488)', borderRadius: '16px', padding: '32px', textAlign: 'center', color: 'white' }}>
        <div style={{ fontSize: '28px', marginBottom: '10px' }}>🤝</div>
        <div style={{ fontWeight: 800, fontSize: '1.2rem', marginBottom: '8px' }}>Need help with a return or refund?</div>
        <p style={{ color: 'rgba(255,255,255,0.82)', marginBottom: '20px', fontSize: '15px' }}>Our support team responds within 24 hours.</p>
        <a href="/contact" style={{ background: 'white', color: '#059669', padding: '12px 28px', borderRadius: '10px', fontWeight: 700, textDecoration: 'none', fontSize: '15px' }}>
          Contact Support →
        </a>
      </div>
    </div>
  );
}
