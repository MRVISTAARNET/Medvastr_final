"use client";
import React, { useState, useRef } from "react";
import Link from "next/link";

export default function BulkOrderPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const handleScrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const steps = [
    { num: "01", t: "Fill out the form", d: "with your requirements" },
    { num: "02", t: "Receive a call", d: "within 24 hours" },
    { num: "03", t: "Build your order", d: "with our team" },
    { num: "04", t: "Seamless delivery", d: "end-to-end fulfilment" }
  ];

  const categories = [
    {
      t: "Scrub Suits", slug: "scrub-suit",
      img: "https://d2tnzshqdaedbc.cloudfront.net/bulk-scrub-suit.jpg",
      d: "High-performance medical scrubs designed for maximum comfort during long clinical shifts."
    },
    {
      t: "Linen & Bedding", slug: "linen-and-bedding",
      img: "https://d2tnzshqdaedbc.cloudfront.net/bulk-linen.jpg",
      d: "Institutional linens designed for 200+ industrial wash cycles without fading."
    },
    {
      t: "Maternity Gown", slug: "maternity-gown",
      img: "https://d2tnzshqdaedbc.cloudfront.net/bulk-maternity.jpg",
      d: "Breathable, ergonomic maternity wear optimized for patient comfort and clinical ease."
    },
    {
      t: "Patient Dress", slug: "patient-dress",
      img: "https://d2tnzshqdaedbc.cloudfront.net/bulk-patient.jpg",
      d: "Soft, durable patient gowns and pajamas designed for clinical accessibility."
    },
    {
      t: "Brown Blanket", slug: "brown-blankets",
      img: "https://d2tnzshqdaedbc.cloudfront.net/bulk-blanket.jpg",
      d: "Professional grade ward blankets with supreme warmth and infection control compliance."
    }
  ];

  const faqs = [
    {
      q: "What is the minimum quantity for a bulk order?",
      a: "Minimum 50 items for institutional orders to qualify for customization and bulk discount pricing."
    },
    {
      q: "Can we mix colours or styles in a single bulk order?",
      a: "Yes! You can mix and match sizes, colors, and designs across the total order volume."
    },
    {
      q: "How long does bulk delivery take?",
      a: "Standard bulk delivery takes 7–10 business days. Express shipping is available on request."
    },
    {
      q: "Are exchanges allowed for bulk orders?",
      a: "Since bulk orders are customized with embroidery or logos, we don't accept exchanges once processing starts."
    },
    {
      q: "Can I return a bulk order?",
      a: "Returns are accepted only for manufacturing defects or stitching issues within 7 days of delivery."
    },
    {
      q: "Can I order only scrub tops or bottoms in different quantities?",
      a: "Yes, we support separate top/bottom purchases and unequal quantity ratios (e.g. 50 tops + 30 bottoms)."
    },
    {
      q: "Do you offer discounts for bulk orders?",
      a: "Yes! Tiered volume discounts — the higher your quantity, the larger the discount per unit."
    },
    {
      q: "Can I customise with logos or embroidery?",
      a: "Yes! We provide custom hospital embroidery, screen-printing, and department labelling services."
    }
  ];

  const S3 = "https://d2tnzshqdaedbc.cloudfront.net";

  return (
    <div className="bulk-page">
      {/* ── HERO BANNER ── */}
      <SmartBanner base={`${S3}/bulk-order-banner`} title="Bulk Orders for Healthcare" />

      <div className="bulk-inner">

        {/* ── PROCESS STEPS ── */}
        <section className="process-sec">
          <h2 className="sec-heading">Bulk Ordering Made Simple</h2>
          <p className="sec-sub">Fill out the form and we'll take care of the rest.</p>
          <div className="steps-flow">
            <div className="steps-line"></div>
            {steps.map((s, idx) => (
              <div className="step-card" key={idx}>
                <div className={`step-badge${idx === 1 || idx === 2 ? " active" : ""}`}>{s.num}</div>
                <div className="step-text">
                  <strong>{s.t}</strong>
                  <span>{s.d}</span>
                </div>
              </div>
            ))}
          </div>
          <button onClick={handleScrollToForm} className="btn-primary">
            Start Your Order
          </button>
        </section>

        {/* ── PRODUCT CATEGORIES ── */}
        <section className="cats-sec">
          <h2 className="sec-heading">Bulk Product Categories</h2>
          <p className="sec-sub">Premium medical textiles supplied directly to hospitals nationwide.</p>
          <div className="cats-grid">
            {categories.map((c) => (
              <Link href={`/bulk-orders/${c.slug}`} key={c.slug} className="cat-card">
                <div className="cat-img-wrap">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={c.img} alt={c.t} className="cat-img"
                    onError={(e) => { (e.target as any).style.display = "none"; }} />
                </div>
                <div className="cat-info">
                  <h3 className="cat-title">{c.t}</h3>
                  <p className="cat-desc">{c.d}</p>
                  <div className="cat-btn">View Details →</div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── HELP BANNER ── */}
        <div className="help-banner">
          <div className="help-text">Planning a bulk order? We're here to help.</div>
          <div className="help-btns">
            <button onClick={handleScrollToForm} className="btn-outline">Get a Quote</button>
            <a href="tel:+918976488911" className="btn-solid">Call Now</a>
          </div>
        </div>

        {/* ── FAQs ── */}
        <section className="faq-sec">
          <h2 className="sec-heading">Frequently Asked Questions</h2>
          <div className="faq-list">
            {faqs.map((f, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className={`faq-item${isOpen ? " open" : ""}`}>
                  <button onClick={() => setOpenFaq(isOpen ? null : idx)} className="faq-q">
                    <span>{f.q}</span>
                    <span className="faq-icon">{isOpen ? "−" : "+"}</span>
                  </button>
                  {isOpen && <div className="faq-a">{f.a}</div>}
                </div>
              );
            })}
          </div>
        </section>

        {/* ── CONTACT CTA ── */}
        <div ref={formRef} className="contact-cta">
          <div className="cta-icon">💬</div>
          <h2 className="cta-heading">Ready to place a bulk order?</h2>
          <p className="cta-sub">Get institutional pricing, custom branding, and dedicated support. Our team responds within 24 hours.</p>
          <div className="cta-actions">
            <Link href="/contact" className="btn-cta-primary">Send Us an Enquiry</Link>
            <a href="tel:+918976488911" className="btn-cta-outline">📞 Call Now</a>
          </div>
        </div>

      </div>

      <style jsx>{`
        .bulk-page {
          min-height: 100vh;
          background: #f8fafc;
          padding-bottom: 80px;
          font-family: var(--sans), sans-serif;
        }
        .bulk-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
        }

        /* Section headings */
        .sec-heading {
          font-size: 24px;
          font-weight: 600;
          color: var(--primary-navy);
          text-align: center;
          margin-bottom: 6px;
          letter-spacing: -0.01em;
        }
        .sec-sub {
          font-size: 13px;
          color: #64748b;
          text-align: center;
          margin-bottom: 36px;
        }

        /* Steps */
        .process-sec {
          text-align: center;
          margin-top: 50px;
        }
        .steps-flow {
          display: flex;
          justify-content: space-between;
          position: relative;
          max-width: 900px;
          margin: 36px auto;
          gap: 20px;
        }
        .steps-line {
          position: absolute;
          top: 24px;
          left: 6%;
          right: 6%;
          height: 2px;
          border-top: 2px dashed #cbd5e1;
          z-index: 1;
        }
        .step-card {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          z-index: 2;
        }
        .step-badge {
          width: 48px;
          height: 48px;
          border-radius: 8px;
          background: white;
          border: 2px solid #e2e8f0;
          color: #64748b;
          font-weight: 700;
          font-size: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }
        .step-badge.active {
          background: var(--primary-navy);
          border-color: var(--primary-navy);
          color: white;
        }
        .step-text {
          margin-top: 12px;
          text-align: center;
          font-size: 13px;
        }
        .step-text strong {
          display: block;
          color: #1e293b;
          font-weight: 600;
          margin-bottom: 2px;
        }
        .step-text span {
          color: #64748b;
        }
        .btn-primary {
          background: var(--primary-navy);
          color: white;
          border: none;
          padding: 12px 28px;
          font-size: 14px;
          font-weight: 600;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.2s;
          margin-top: 16px;
        }
        .btn-primary:hover {
          background: var(--secondary-blue);
        }

        /* Categories */
        .cats-sec {
          margin: 70px 0;
        }
        .cats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 28px;
        }
        .cat-card {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid #e2e8f0;
          box-shadow: 0 2px 12px rgba(0,0,0,0.03);
          transition: transform 0.25s, box-shadow 0.25s;
          display: flex;
          flex-direction: column;
          text-decoration: none;
        }
        .cat-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 8px 28px rgba(0,0,0,0.08);
          border-color: var(--primary-navy);
        }
        .cat-img-wrap {
          width: 100%;
          overflow: hidden;
          background: #f1f5f9;
        }
        .cat-img {
          width: 100%;
          height: auto;
          display: block;
          object-fit: contain;
          transition: transform 0.35s;
        }
        .cat-card:hover .cat-img {
          transform: scale(1.04);
        }
        .cat-info {
          padding: 20px;
          display: flex;
          flex-direction: column;
          flex: 1;
        }
        .cat-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--primary-navy);
          margin: 0 0 8px 0;
        }
        .cat-desc {
          font-size: 13px;
          color: #64748b;
          line-height: 1.55;
          margin: 0 0 16px 0;
          flex: 1;
        }
        .cat-btn {
          background: #f1f5f9;
          color: var(--primary-navy);
          padding: 9px 16px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          text-align: center;
          transition: all 0.2s;
          margin-top: auto;
        }
        .cat-card:hover .cat-btn {
          background: var(--primary-navy);
          color: white;
        }

        /* Help Banner */
        .help-banner {
          background: var(--primary-navy);
          border-radius: 12px;
          padding: 22px 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
          margin: 0 0 60px;
        }
        .help-text {
          font-size: 16px;
          font-weight: 600;
          color: white;
        }
        .help-btns {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .btn-outline {
          background: transparent;
          color: white;
          border: 1.5px solid rgba(255,255,255,0.6);
          padding: 9px 22px;
          font-size: 13px;
          font-weight: 600;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-outline:hover {
          background: white;
          color: var(--primary-navy);
          border-color: white;
        }
        .btn-solid {
          background: white;
          color: var(--primary-navy);
          padding: 9px 22px;
          font-size: 13px;
          font-weight: 600;
          border-radius: 6px;
          text-decoration: none;
          transition: opacity 0.2s;
        }
        .btn-solid:hover {
          opacity: 0.9;
        }

        /* FAQs */
        .faq-sec {
          margin: 0 0 60px;
        }
        .faq-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          max-width: 860px;
          margin: 0 auto;
        }
        .faq-item {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          overflow: hidden;
          transition: border-color 0.2s;
        }
        .faq-item.open {
          border-color: var(--primary-navy);
        }
        .faq-q {
          width: 100%;
          background: transparent;
          border: none;
          padding: 16px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 14px;
          font-weight: 600;
          color: var(--primary-navy);
          cursor: pointer;
          text-align: left;
          gap: 12px;
        }
        .faq-icon {
          font-size: 18px;
          color: #94a3b8;
          font-weight: 400;
          flex-shrink: 0;
        }
        .faq-a {
          padding: 0 20px 16px 20px;
          font-size: 13px;
          color: #475569;
          line-height: 1.65;
        }

        /* Contact CTA */
        .contact-cta {
          background: white;
          border-radius: 20px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 24px rgba(0,0,0,0.04);
          padding: 48px 40px;
          text-align: center;
          margin: 0 auto 60px;
          max-width: 680px;
        }
        .cta-icon {
          font-size: 40px;
          margin-bottom: 16px;
        }
        .cta-heading {
          font-size: 22px;
          font-weight: 600;
          color: var(--primary-navy);
          margin: 0 0 10px;
        }
        .cta-sub {
          font-size: 14px;
          color: #64748b;
          line-height: 1.6;
          margin: 0 0 28px;
          max-width: 480px;
          margin-left: auto;
          margin-right: auto;
        }
        .cta-actions {
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
        }
        .btn-cta-primary {
          background: var(--primary-navy);
          color: white;
          padding: 12px 28px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.2s;
        }
        .btn-cta-primary:hover {
          background: var(--secondary-blue);
          transform: translateY(-1px);
        }
        .btn-cta-outline {
          background: transparent;
          color: var(--primary-navy);
          border: 1.5px solid var(--primary-navy);
          padding: 12px 28px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.2s;
        }
        .btn-cta-outline:hover {
          background: var(--primary-navy);
          color: white;
        }

        /* Smart Banner */
        .bulk-smart-banner {
          width: 100%;
          margin-bottom: 40px;
          overflow: hidden;
        }
        .bulk-banner-img {
          width: 100%;
          height: auto;
          display: block;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .steps-flow {
            flex-direction: column;
            gap: 24px;
            align-items: flex-start;
            padding-left: 20px;
          }
          .steps-line {
            top: 0; bottom: 0;
            left: 44px;
            width: 2px; height: 80%;
            border-top: none;
            border-left: 2px dashed #cbd5e1;
          }
          .step-card {
            flex-direction: row;
            gap: 16px;
            align-items: center;
          }
          .step-text { margin-top: 0; text-align: left; }
          .help-banner { padding: 20px 24px; text-align: center; justify-content: center; }
          .help-btns { width: 100%; justify-content: center; }
          .form-row { grid-template-columns: 1fr; }
          .form-card { padding: 24px; }
          .cats-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}

function SmartBanner({ base, title }: { base: string; title: string }) {
  const [src, setSrc] = React.useState(base + ".jpg");
  const [srcMob, setSrcMob] = React.useState(base + "-mob.jpg");
  const [failed, setFailed] = React.useState(false);

  React.useEffect(() => {
    setSrc(base + ".jpg");
    setSrcMob(base + "-mob.jpg");
    setFailed(false);
  }, [base]);

  const tryNext = () => {
    if (src.endsWith(".jpg")) { setSrc(base + ".png"); }
    else if (src.endsWith(".png")) { setSrc(base + ".webp"); }
    else { setFailed(true); }
  };
  const tryNextMob = () => {
    if (srcMob.endsWith(".jpg")) { setSrcMob(base + "-mob.png"); }
    else if (srcMob.endsWith(".png")) { setSrcMob(base + "-mob.webp"); }
  };

  if (failed) return null;

  return (
    <div className="bulk-smart-banner">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={title} onError={tryNext} className="bulk-banner-img hero-image-desktop" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={srcMob} alt={title + " Mobile"} onError={tryNextMob} className="bulk-banner-img hero-image-mobile" />
      <style jsx>{`
        .bulk-smart-banner { width: 100%; margin-bottom: 0; overflow: hidden; }
        .bulk-banner-img { width: 100%; height: auto; display: block; }
        @media (max-width: 768px) {
          .bulk-smart-banner { min-height: 140px; display: flex; align-items: center; }
          .bulk-banner-img { min-height: 140px; object-fit: cover; object-position: center; }
        }
      `}</style>
    </div>
  );
}
