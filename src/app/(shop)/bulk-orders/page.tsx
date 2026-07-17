"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { API_BASE } from "@/lib/api";

export default function BulkOrderPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [institution, setInstitution] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [qty, setQty] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.title = "Bulk Orders & Custom Hospital Uniforms | Medvastr";
  }, []);

  const handleScrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/inquiries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          institution,
          email,
          phone,
          quantity: qty,
          message: msg,
          subject: "Bulk Order Request"
        })
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setName("");
        setInstitution("");
        setEmail("");
        setPhone("");
        setQty("");
        setMsg("");
      }
    } catch (e) {
      // Ignored
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { num: "01", t: "Fill out the form", d: "with details" },
    { num: "02", t: "Receive a call", d: "within 24 hours" },
    { num: "03", t: "Build your", d: "custom order with us" },
    { num: "04", t: "Get seamless,", d: "end-to-end delivery" }
  ];

  const categories = [
    { t: "Scrub Suits", slug: "scrub-suit", img: "https://d2tnzshqdaedbc.cloudfront.net/bulk-scrub-suit.jpg", d: "High-performance medical scrubs designed for maximum comfort and flexibility during long clinical shifts." },
    { t: "Linen & Bedding", slug: "linen-and-bedding", img: "https://d2tnzshqdaedbc.cloudfront.net/bulk-linen.jpg", d: "High-performance institutional linens designed for over 200+ industrial washes." },
    { t: "Maternity Gown", slug: "maternity-gown", img: "https://d2tnzshqdaedbc.cloudfront.net/bulk-maternity.jpg", d: "Breathable, ergonomic maternity wear optimized for patient comfort and ease of care." },
    { t: "Patient Dress", slug: "patient-dress", img: "https://d2tnzshqdaedbc.cloudfront.net/bulk-patient.jpg", d: "Soft, durable patient gowns and pajamas designed for clinical accessibility." },
    { t: "Brown Blanket", slug: "brown-blankets", img: "https://d2tnzshqdaedbc.cloudfront.net/bulk-blanket.jpg", d: "Professional grade ward blankets offering supreme warmth and infection control compliance." }
  ];

  const faqs = [
    {
      q: "What is the minimum quantity required for a bulk medical scrubs order?",
      a: "The minimum quantity starts at 50 items for institutional orders to qualify for customization and bulk discount pricing."
    },
    {
      q: "Can we mix colours or styles in a single bulk scrubs order?",
      a: "Yes! You can mix and match sizes, colors, and designs across the total order volume to fit your clinic's needs."
    },
    {
      q: "How long does it take to deliver bulk medical scrubs orders?",
      a: "Standard bulk delivery takes 7 to 10 business days. Express shipping configurations are available on request."
    },
    {
      q: "Are exchanges allowed for bulk scrubs orders?",
      a: "Since bulk orders are customized with embroidery, logos, or sizing, we do not accept size or color exchanges once processing has started."
    },
    {
      q: "Can I return a scrubs order in bulk?",
      a: "Returns are only accepted in cases of manufacturing defects or stitching issues within 7 days of delivery."
    },
    {
      q: "Can I order only scrub tops, only scrub bottoms, or different quantities in a bulk order?",
      a: "Yes, we support separate top or bottom purchases, as well as unequal quantity ratios (e.g. 50 tops and 30 bottoms)."
    },
    {
      q: "Do you offer discounts for bulk medical scrubs orders?",
      a: "Yes! We offer tiered volume discounts. The higher your quantity, the larger the discount per unit."
    },
    {
      q: "Are you a bulk medical scrubs supplier in India?",
      a: "Yes, Medvastr is a leading direct-to-hospital manufacturer and supplier of medical apparel across India."
    },
    {
      q: "Can I customise my scrubs order in bulk with logos or embroidery?",
      a: "Yes! We provide custom hospital embroidery, screen-printing, and department labelling services."
    },
    {
      q: "How do I place a scrubs order in bulk?",
      a: "Simply fill out the enquiry form at the bottom of this page, or contact us directly via phone or WhatsApp!"
    }
  ];

  const S3 = "https://d2tnzshqdaedbc.cloudfront.net";

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", paddingBottom: "80px" }}>
      {/* ── HERO BANNER ── */}
      <SmartBanner base={`${S3}/bulk-order-banner`} title="Bulk Orders for Healthcare" />

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
        
        {/* ── PROCESS STEPS ── */}
        <div className="process-sec">
          <h2 className="section-title">Bulk Ordering Made Simple</h2>
          <p className="section-subtitle">Fill out the form, and we'll take care of the rest.</p>

          <div className="steps-flow">
            <div className="steps-line"></div>
            {steps.map((s, idx) => (
              <div className="step-card" key={idx}>
                <div className="step-badge">{s.num}</div>
                <div className="step-text">
                  <strong>{s.t}</strong>
                  <span>{s.d}</span>
                </div>
              </div>
            ))}
          </div>

          <button onClick={handleScrollToForm} className="btn-start-order">
            Start Your Order Now
          </button>
        </div>

        {/* ── PRODUCTS SECTION ── */}
        <div style={{ margin: "80px 0" }}>
          <div style={{ textAlign: "center", marginBottom: "50px" }}>
            <h2 className="section-title">Bulk Product Categories</h2>
            <p className="section-subtitle">Premium medical textiles and apparel supplied directly to top hospitals nationwide.</p>
          </div>

          <div className="categories-grid">
            {categories.map((c) => (
              <Link href={`/bulk-orders/${c.slug}`} key={c.slug} className="cat-card">
                <div className="cat-img-wrap">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={c.img} alt={c.t} className="cat-img" />
                </div>
                <div className="cat-info">
                  <h4 className="cat-title">{c.t}</h4>
                  <p className="cat-desc">{c.d}</p>
                  <div className="cat-btn">View Details →</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ── PURPLE HELP BANNER ── */}
        <div className="help-banner">
          <div className="help-title">Planning a bulk order? We're here to help.</div>
          <div className="help-buttons">
            <button onClick={handleScrollToForm} className="btn-help-quote">Get a Quote</button>
            <a href="tel:+918976488911" className="btn-help-call">Call Now</a>
          </div>
        </div>

        {/* ── FAQS ACCORDION ── */}
        <div style={{ margin: "60px 0" }}>
          <h2 className="section-title">FAQs</h2>
          <div className="faq-list">
            {faqs.map((f, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="faq-item">
                  <button onClick={() => setOpenFaq(isOpen ? null : idx)} className="faq-question">
                    <span>{f.q}</span>
                    <span className="faq-toggle">{isOpen ? "−" : "+"}</span>
                  </button>
                  {isOpen && <div className="faq-answer">{f.a}</div>}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── ENQUIRY FORM ── */}
        <div ref={formRef} className="form-card">
          <h2 className="form-title">📧 Bulk Order Enquiry</h2>
          <p className="form-subtitle">Fill in the institutional request form below and our manager will contact you.</p>

          {success ? (
            <div className="form-success">
              ✓ Inquiry submitted successfully! Our manager will call you within 24 hours.
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="Enter your name" />
                </div>
                <div className="form-group">
                  <label>Hospital/Institution Name *</label>
                  <input type="text" required value={institution} onChange={e => setInstitution(e.target.value)} placeholder="AIIMS, Apollo, etc." />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Email Address *</label>
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="name@hospital.com" />
                </div>
                <div className="form-group">
                  <label>Phone Number *</label>
                  <input type="tel" required value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 XXXXX XXXXX" />
                </div>
              </div>
              <div className="form-group">
                <label>Estimated Quantity Required *</label>
                <input type="number" min="50" required value={qty} onChange={e => setQty(e.target.value)} placeholder="Minimum 50 items" />
              </div>
              <div className="form-group">
                <label>Specific Customizations or Requirements</label>
                <textarea rows={4} value={msg} onChange={e => setMsg(e.target.value)} placeholder="E.g., logo embroidery, custom hospital colors..." />
              </div>

              <button type="submit" disabled={loading} className="btn-submit">
                {loading ? "Submitting Inquiry..." : "Submit Inquiry"}
              </button>
            </form>
          )}
        </div>

      </div>

      <style jsx>{`
        .section-title {
          font-size: 32px;
          fontWeight: 800;
          color: #0f172a;
          text-align: center;
          margin-bottom: 8px;
        }
        .section-subtitle {
          font-size: 16px;
          color: #64748b;
          text-align: center;
          margin-bottom: 40px;
        }

        /* Steps Flow */
        .process-sec {
          text-align: center;
          margin-top: 50px;
        }
        .steps-flow {
          display: flex;
          justify-content: space-between;
          position: relative;
          max-width: 1000px;
          margin: 40px auto;
          gap: 20px;
        }
        .steps-line {
          position: absolute;
          top: 25px;
          left: 5%;
          right: 5%;
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
          width: 50px;
          height: 50px;
          border-radius: 6px;
          background: white;
          border: 2px solid #e2e8f0;
          color: #64748b;
          font-weight: 700;
          font-size: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s;
          box-shadow: 0 4px 6px rgba(0,0,0,0.02);
        }
        .step-card:nth-child(2) .step-badge,
        .step-card:nth-child(3) .step-badge {
          background: #709fdc;
          border-color: #709fdc;
          color: white;
        }
        .step-text {
          margin-top: 15px;
          text-align: center;
          font-size: 14px;
        }
        .step-text strong {
          display: block;
          color: #1e293b;
          margin-bottom: 2px;
        }
        .step-text span {
          color: #64748b;
        }
        .btn-start-order {
          background: #482f8f;
          color: white;
          border: none;
          padding: 14px 32px;
          font-size: 15px;
          font-weight: 700;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.2s;
          margin-top: 20px;
        }
        .btn-start-order:hover {
          background: #392473;
        }

        /* Categories */
        .categories-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 32px;
        }
        .cat-card {
          background: white;
          border-radius: 20px;
          overflow: hidden;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 20px rgba(0,0,0,0.03);
          transition: transform 0.3s, border-color 0.3s;
          display: flex;
          flex-direction: column;
          text-decoration: none;
        }
        .cat-card:hover {
          transform: translateY(-8px);
          border-color: #008080;
        }
        .cat-img-wrap {
          aspect-ratio: 1.1 / 1;
          overflow: hidden;
        }
        .cat-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s;
        }
        .cat-card:hover .cat-img {
          transform: scale(1.05);
        }
        .cat-info {
          padding: 24px;
          display: flex;
          flex-direction: column;
          flex: 1;
        }
        .cat-title {
          font-size: 20px;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 10px 0;
        }
        .cat-desc {
          font-size: 14px;
          color: #64748b;
          line-height: 1.6;
          margin: 0 0 20px 0;
          flex: 1;
        }
        .cat-btn {
          background: #f1f5f9;
          color: #0f172a;
          padding: 10px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 700;
          text-align: center;
          text-transform: uppercase;
          transition: all 0.2s;
        }
        .cat-card:hover .cat-btn {
          background: #008080;
          color: white;
        }

        /* Help Banner */
        .help-banner {
          background: #482f8f;
          border-radius: 12px;
          padding: 24px 36px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 20px;
          margin: 60px 0;
        }
        .help-title {
          font-size: 18px;
          font-weight: 700;
          color: white;
        }
        .help-buttons {
          display: flex;
          align-items: center;
          gap: 15px;
        }
        .btn-help-quote {
          background: transparent;
          color: white;
          border: 1.5px solid white;
          padding: 10px 24px;
          font-size: 14px;
          font-weight: 600;
          border-radius: 6px;
          cursor: pointer;
          transition: background 0.2s, color 0.2s;
        }
        .btn-help-quote:hover {
          background: white;
          color: #482f8f;
        }
        .btn-help-call {
          background: white;
          color: #482f8f;
          padding: 10px 24px;
          font-size: 14px;
          font-weight: 600;
          border-radius: 6px;
          text-decoration: none;
          transition: opacity 0.2s;
        }
        .btn-help-call:hover {
          opacity: 0.9;
        }

        /* FAQs */
        .faq-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          max-width: 900px;
          margin: 0 auto;
        }
        .faq-item {
          background: #f1f5f9;
          border-radius: 8px;
          overflow: hidden;
          transition: all 0.2s;
        }
        .faq-question {
          width: 100%;
          background: transparent;
          border: none;
          padding: 18px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 14px;
          font-weight: 700;
          color: #0f172a;
          cursor: pointer;
          text-align: left;
        }
        .faq-toggle {
          font-size: 18px;
          color: #64748b;
          font-weight: 400;
        }
        .faq-answer {
          padding: 0 24px 20px 24px;
          font-size: 14px;
          color: #475569;
          line-height: 1.6;
        }

        /* Form Card */
        .form-card {
          background: white;
          border-radius: 24px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 10px 40px rgba(0,0,0,0.04);
          padding: 40px;
          max-width: 800px;
          margin: 60px auto 0 auto;
        }
        .form-title {
          font-size: 24px;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 8px 0;
        }
        .form-subtitle {
          font-size: 14px;
          color: #64748b;
          margin: 0 0 30px 0;
        }
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .form-group label {
          font-size: 13px;
          font-weight: 700;
          color: #1e293b;
        }
        .form-group input,
        .form-group textarea {
          border: 1.5px solid #cbd5e1;
          border-radius: 12px;
          padding: 12px 16px;
          font-size: 15px;
          outline: none;
          transition: border-color 0.2s;
          height: 48px;
        }
        .form-group textarea {
          height: auto;
        }
        .form-group input:focus,
        .form-group textarea:focus {
          border-color: var(--accent-blue);
        }
        .btn-submit {
          background: var(--primary-navy);
          color: white;
          border: none;
          height: 48px;
          border-radius: 10px;
          font-size: 16px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          cursor: pointer;
          box-shadow: 0 4px 15px rgba(32, 58, 95, 0.15);
          transition: all 0.22s;
        }
        .btn-submit:hover {
          transform: translateY(-2px);
          background: var(--secondary-blue);
          box-shadow: 0 6px 20px rgba(32, 58, 95, 0.25);
        }
        .form-success {
          background: #ecfdf5;
          border: 1px solid #10b981;
          color: #065f46;
          padding: 20px;
          border-radius: 12px;
          font-weight: 700;
          text-align: center;
        }

        @media (max-width: 768px) {
          .steps-flow {
            flex-direction: column;
            gap: 30px;
            align-items: flex-start;
            padding-left: 20px;
          }
          .steps-line {
            top: 0;
            bottom: 0;
            left: 45px;
            width: 2px;
            height: 80%;
            border-top: none;
            border-left: 2px dashed #cbd5e1;
          }
          .step-card {
            flex-direction: row;
            gap: 20px;
            align-items: center;
          }
          .step-text {
            margin-top: 0;
            text-align: left;
          }
          .help-banner {
            padding: 24px;
            text-align: center;
            justify-content: center;
          }
          .help-buttons {
            width: 100%;
            justify-content: center;
          }
          .form-row {
            grid-template-columns: 1fr;
          }
          .form-card {
            padding: 24px;
          }
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
      <img
        src={src}
        alt={title}
        onError={tryNext}
        className="bulk-banner-img hero-image-desktop"
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={srcMob}
        alt={title + " Mobile"}
        onError={tryNextMob}
        className="bulk-banner-img hero-image-mobile"
      />
      <style jsx>{`
        .bulk-smart-banner {
          width: 100%;
          margin-bottom: 36px;
          overflow: hidden;
        }
        .bulk-banner-img {
          width: 100%;
          height: auto;
          display: block;
        }
        @media (max-width: 768px) {
          .bulk-smart-banner {
            min-height: 140px;
            margin-bottom: 36px;
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
