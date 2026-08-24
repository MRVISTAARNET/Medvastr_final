"use client";

import React, { useState } from "react";
import Link from "next/link";
import { B } from "@/lib/data";
import { API_BASE } from "@/lib/api";

export default function ContactPage() {
  React.useEffect(() => {
    document.title = "Contact Us | Medvarn — Premium Medical Apparel";
  }, []);

  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const socials = [
    { ico: "📸", nm: "Instagram", url: B.ig, sub: "@medvarn" },
    { ico: "📘", nm: "Facebook", url: B.fb, sub: "Medvarn Apparel" },
    { ico: "💼", nm: "LinkedIn", url: B.li, sub: "Medvarn Medical" },
  ];

  return (
    <div className="ct-page">
      {/* ── TOP HERO HEADER ── */}
      <div className="ct-hero">
        <div className="ct-hero-inner">
          <div className="ct-breadcrumb">
            <Link href="/">Home</Link>
            <span className="sep">/</span>
            <span className="active">Contact Us</span>
          </div>
          <h1 className="ct-hero-title">Get in Touch with Medvarn</h1>
          <p className="ct-hero-sub">
            Have questions about surgical scrubs, custom embroidery, bulk hospital orders, or shipping? Our dedicated team is here to assist you.
          </p>
        </div>
      </div>

      {/* ── MAIN CONTENT WRAPPER ── */}
      <div className="ct-wrapper">
        <div className="ct-grid">
          {/* LEFT: Info Panel */}
          <div className="ct-info-panel">
            <div className="ct-badge">DEDICATED SUPPORT</div>
            <h2 className="ct-info-heading">Let's Connect</h2>
            <p className="ct-info-sub">
              We understand the demanding schedule of healthcare professionals. Reach out through any channel below for quick response.
            </p>

            <div className="ct-info-list">
              {[
                {
                  ico: "📞",
                  label: "SPEAK WITH US",
                  value: B.phone1,
                  sub: "Mon – Sat, 9:00 AM – 7:00 PM IST",
                  href: `tel:${B.phone1}`,
                },
                {
                  ico: "✉️",
                  label: "WRITE TO US",
                  value: B.email,
                  sub: "Guaranteed response within 24 hours",
                  href: `mailto:${B.email}`,
                },
                {
                  ico: "📍",
                  label: "VISIT OUR HEAD OFFICE",
                  value: B.addr,
                  sub: "Express Zone, Western Express Highway, Goregaon/Malad East",
                  href: "https://maps.google.com/?q=Express+Zone+Malad+East+Mumbai",
                },
              ].map((item) => (
                <div key={item.label} className="ct-info-row">
                  <div className="ct-info-icon">{item.ico}</div>
                  <div className="ct-info-text">
                    <div className="ct-info-label">{item.label}</div>
                    {item.href ? (
                      <a
                        href={item.href}
                        target={item.href.startsWith("http") ? "_blank" : undefined}
                        rel={item.href.startsWith("http") ? "noopener" : undefined}
                        className="ct-info-value"
                      >
                        {item.value}
                      </a>
                    ) : (
                      <div className="ct-info-value">{item.value}</div>
                    )}
                    <div className="ct-info-subtext">{item.sub}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="ct-socials-wrap">
              <div className="ct-socials-title">Follow Medvarn Official</div>
              <div className="ct-socials">
                {socials.map((s) => (
                  <a
                    key={s.nm}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ct-social-btn"
                    title={s.nm}
                  >
                    <span className="soc-ico">{s.ico}</span>
                    <div className="soc-text">
                      <span className="soc-name">{s.nm}</span>
                      <span className="soc-sub">{s.sub}</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: Contact Form */}
          <div className="ct-form-panel">
            {sent ? (
              <div className="ct-success">
                <div className="ct-success-badge">✓ MESSAGE SENT</div>
                <div className="ct-success-icon">🎉</div>
                <h3 className="ct-success-heading">Thank you for reaching out!</h3>
                <p className="ct-success-text">
                  We've received your query. A Medvarn customer care representative will contact you via email or phone within 24 hours.
                </p>
                <button onClick={() => setSent(false)} className="ct-again-btn">
                  ← Send Another Message
                </button>
              </div>
            ) : (
              <>
                <div className="ct-form-header">
                  <h2 className="ct-form-heading">Send a Direct Message</h2>
                  <p className="ct-form-sub">
                    Fill out the form below and we'll get back to you immediately.
                  </p>
                </div>

                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setLoading(true);
                    const form = new FormData(e.currentTarget);
                    try {
                      await fetch(`${API_BASE}/inquiries`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          name: form.get("name"),
                          email: form.get("email"),
                          phone: form.get("phone"),
                          type:
                            form.get("subject") === "Bulk/Hospital Orders"
                              ? "BULK_ORDER"
                              : "CONTACT",
                          message: `Subj: ${form.get("subject")} - Msg: ${form.get("message")}`,
                        }),
                      });
                    } catch (err) {}
                    setLoading(false);
                    setSent(true);
                  }}
                  className="ct-form"
                >
                  <div className="ct-row">
                    <div className="ct-field">
                      <label htmlFor="ct-name">
                        YOUR NAME <span className="req">*</span>
                      </label>
                      <input
                        id="ct-name"
                        name="name"
                        required
                        placeholder="e.g. Dr. Ananya Sharma"
                      />
                    </div>
                    <div className="ct-field">
                      <label htmlFor="ct-phone">
                        MOBILE NUMBER <span className="req">*</span>
                      </label>
                      <input
                        id="ct-phone"
                        name="phone"
                        required
                        type="tel"
                        placeholder="e.g. +91 98765 43210"
                      />
                    </div>
                  </div>

                  <div className="ct-field">
                    <label htmlFor="ct-email">
                      EMAIL ADDRESS <span className="req">*</span>
                    </label>
                    <input
                      id="ct-email"
                      name="email"
                      required
                      type="email"
                      placeholder="e.g. doctor@hospital.com"
                    />
                  </div>

                  <div className="ct-field">
                    <label htmlFor="ct-subject">
                      WHAT CAN WE HELP YOU WITH? <span className="req">*</span>
                    </label>
                    <select id="ct-subject" name="subject" required defaultValue="General Inquiry">
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Bulk/Hospital Orders">Bulk / Hospital Orders</option>
                      <option value="Sizing & Customization">Sizing & Customization</option>
                      <option value="Shipping & Logistics">Shipping & Logistics</option>
                      <option value="Returns & Exchanges">Returns & Exchanges</option>
                    </select>
                  </div>

                  <div className="ct-field">
                    <label htmlFor="ct-message">
                      YOUR MESSAGE <span className="req">*</span>
                    </label>
                    <textarea
                      id="ct-message"
                      name="message"
                      required
                      placeholder="Please specify your product, quantity, or specific inquiry details..."
                      rows={5}
                    />
                  </div>

                  <button type="submit" disabled={loading} className="ct-submit">
                    {loading ? "Transmitting..." : "Submit Inquiry →"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>

        {/* ── QUICK ASSISTANCE CARDS ── */}
        <div className="ct-quick-row">
          <div className="ct-qcard">
            <span className="qico">🏥</span>
            <div className="qtitle">Hospital Bulk Orders</div>
            <div className="qsub">Need custom logo embroidery or 50+ scrub suits?</div>
            <Link href="/bulk-orders" className="qlink">
              Explore Bulk Pricing →
            </Link>
          </div>
          <div className="ct-qcard">
            <span className="qico">📦</span>
            <div className="qtitle">Track Your Shipment</div>
            <div className="qsub">Check live delivery status of your existing order.</div>
            <Link href="/track" className="qlink">
              Track Package →
            </Link>
          </div>
          <div className="ct-qcard">
            <span className="qico">🔄</span>
            <div className="qtitle">7-Day Easy Returns</div>
            <div className="qsub">Need a size swap or return assistance?</div>
            <Link href="/returns" className="qlink">
              Initiate Return →
            </Link>
          </div>
        </div>

        {/* ── MAP SECTION ── */}
        <div className="ct-map-card">
          <div className="ct-map-header">
            <div>
              <h3 className="ct-map-heading">📍 Visit Our Head Office</h3>
              <p className="ct-map-sub">F 81-B, Express Zone, Malad East, Mumbai, Maharashtra 400063</p>
            </div>
            <a
              href="https://maps.google.com/?q=Express+Zone+Malad+East+Mumbai"
              target="_blank"
              rel="noopener noreferrer"
              className="ct-dir-btn"
            >
              Get Directions ↗
            </a>
          </div>
          <div className="ct-map-wrap">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3769.308298715783!2d72.85501867595304!3d19.143542282071665!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7b71329c97b83%3A0x6b801a6104d538c2!2sExpress%20Zone!5e0!3m2!1sen!2sin!4v1719120000000!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </div>

      <style jsx>{`
        .ct-page {
          background: #f8fafc;
          min-height: 100vh;
          font-family: var(--sans), sans-serif;
          color: #0f172a;
          padding-bottom: 80px;
        }

        /* Hero */
        .ct-hero {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          padding: 40px 24px 70px;
          color: white;
          border-bottom: 3px solid #008080;
        }
        .ct-hero-inner {
          max-width: 1200px;
          margin: 0 auto;
        }
        .ct-breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #94a3b8;
          margin-bottom: 16px;
        }
        .ct-breadcrumb a {
          color: #cbd5e1;
          text-decoration: none;
        }
        .ct-breadcrumb a:hover {
          color: #38bdf8;
        }
        .ct-breadcrumb .active {
          color: #f8fafc;
          font-weight: 600;
        }
        .ct-hero-title {
          font-size: 36px;
          font-weight: 800;
          color: white;
          margin: 0 0 10px;
          letter-spacing: -0.02em;
        }
        .ct-hero-sub {
          font-size: 16px;
          color: #cbd5e1;
          max-width: 720px;
          line-height: 1.6;
          margin: 0;
        }

        /* Wrapper */
        .ct-wrapper {
          max-width: 1200px;
          margin: -36px auto 0;
          padding: 0 24px;
          position: relative;
          z-index: 10;
        }

        /* Grid */
        .ct-grid {
          display: grid;
          grid-template-columns: 1fr 1.35fr;
          gap: 28px;
          align-items: stretch;
        }

        /* Left Info Panel */
        .ct-info-panel {
          background: #0f172a;
          border-radius: 20px;
          padding: 36px;
          color: white;
          box-shadow: 0 16px 40px rgba(15, 23, 42, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .ct-badge {
          display: inline-block;
          background: rgba(0, 128, 128, 0.25);
          color: #2dd4bf;
          border: 1px solid rgba(45, 212, 191, 0.3);
          padding: 4px 12px;
          border-radius: 999px;
          font-size: 10.5px;
          font-weight: 800;
          letter-spacing: 1.5px;
          margin-bottom: 14px;
        }
        .ct-info-heading {
          font-size: 26px;
          font-weight: 800;
          color: white;
          margin: 0 0 10px;
        }
        .ct-info-sub {
          font-size: 13.5px;
          color: #94a3b8;
          line-height: 1.6;
          margin: 0 0 30px;
        }
        .ct-info-list {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .ct-info-row {
          display: flex;
          gap: 16px;
          align-items: flex-start;
          transition: transform 0.2s;
        }
        .ct-info-row:hover {
          transform: translateX(4px);
        }
        .ct-info-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.12);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          flex-shrink: 0;
        }
        .ct-info-label {
          font-size: 11px;
          font-weight: 800;
          color: #38bdf8;
          letter-spacing: 1px;
          margin-bottom: 4px;
        }
        .ct-info-value {
          font-size: 15px;
          font-weight: 600;
          color: white;
          text-decoration: none;
          line-height: 1.4;
          display: block;
        }
        a.ct-info-value:hover {
          color: #2dd4bf;
          text-decoration: underline;
        }
        .ct-info-subtext {
          font-size: 12px;
          color: #64748b;
          margin-top: 3px;
        }

        /* Socials */
        .ct-socials-wrap {
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
        .ct-socials-title {
          font-size: 11px;
          font-weight: 800;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          margin-bottom: 14px;
        }
        .ct-socials {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .ct-social-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.08);
          text-decoration: none;
          color: white;
          transition: all 0.2s;
        }
        .ct-social-btn:hover {
          background: rgba(0, 128, 128, 0.25);
          border-color: #008080;
          transform: translateX(4px);
        }
        .soc-ico {
          font-size: 18px;
        }
        .soc-name {
          font-size: 13px;
          font-weight: 700;
          display: block;
        }
        .soc-sub {
          font-size: 11px;
          color: #94a3b8;
          display: block;
        }

        /* Right Form Panel */
        .ct-form-panel {
          background: white;
          border-radius: 20px;
          padding: 36px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
          border: 1.5px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .ct-form-heading {
          font-size: 22px;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 6px;
        }
        .ct-form-sub {
          font-size: 13.5px;
          color: #64748b;
          margin: 0 0 24px;
        }
        .ct-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .ct-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .ct-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .ct-field label {
          font-size: 11px;
          font-weight: 800;
          color: #475569;
          letter-spacing: 0.5px;
        }
        .req {
          color: #ef4444;
        }
        .ct-field input,
        .ct-field select,
        .ct-field textarea {
          width: 100%;
          padding: 11px 14px;
          background: #ffffff;
          border: 1.5px solid #cbd5e1;
          border-radius: 8px;
          font-size: 14px;
          color: #0f172a;
          font-family: inherit;
          outline: none;
          transition: all 0.2s;
          box-sizing: border-box;
        }
        .ct-field input:focus,
        .ct-field select:focus,
        .ct-field textarea:focus {
          border-color: #008080;
          box-shadow: 0 0 0 3px rgba(0, 128, 128, 0.12);
        }
        .ct-submit {
          width: 100%;
          padding: 14px;
          background: #008080;
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 6px;
        }
        .ct-submit:hover:not(:disabled) {
          background: #0d9488;
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(0, 128, 128, 0.25);
        }
        .ct-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Success */
        .ct-success {
          text-align: center;
          padding: 40px 20px;
        }
        .ct-success-badge {
          display: inline-block;
          background: #dcfce7;
          color: #15803d;
          padding: 4px 14px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 800;
          margin-bottom: 16px;
        }
        .ct-success-icon {
          font-size: 48px;
          margin-bottom: 12px;
        }
        .ct-success-heading {
          font-size: 22px;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 10px;
        }
        .ct-success-text {
          font-size: 14px;
          color: #64748b;
          line-height: 1.6;
          margin: 0 0 24px;
        }
        .ct-again-btn {
          background: #0f172a;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
        }

        /* Quick cards */
        .ct-quick-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-top: 32px;
        }
        .ct-qcard {
          background: white;
          border: 1.5px solid #e2e8f0;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.02);
          transition: all 0.2s;
        }
        .ct-qcard:hover {
          border-color: #008080;
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(0, 128, 128, 0.08);
        }
        .qico {
          font-size: 32px;
          display: block;
          margin-bottom: 10px;
        }
        .qtitle {
          font-size: 16px;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 4px;
        }
        .qsub {
          font-size: 13px;
          color: #64748b;
          line-height: 1.5;
          margin-bottom: 14px;
        }
        .qlink {
          font-size: 13px;
          font-weight: 700;
          color: #008080;
          text-decoration: none;
        }
        .qlink:hover {
          text-decoration: underline;
        }

        /* Map */
        .ct-map-card {
          margin-top: 32px;
          background: white;
          padding: 28px;
          border-radius: 20px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
          border: 1.5px solid #e2e8f0;
        }
        .ct-map-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
          gap: 16px;
          flex-wrap: wrap;
        }
        .ct-map-heading {
          font-size: 20px;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 4px;
        }
        .ct-map-sub {
          font-size: 13px;
          color: #64748b;
          margin: 0;
        }
        .ct-dir-btn {
          background: #f1f5f9;
          color: #0f172a;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 700;
          text-decoration: none;
          transition: background 0.2s;
        }
        .ct-dir-btn:hover {
          background: #e2e8f0;
        }
        .ct-map-wrap {
          width: 100%;
          height: 360px;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid #cbd5e1;
        }

        /* Responsive */
        @media (max-width: 960px) {
          .ct-grid {
            grid-template-columns: 1fr;
          }
          .ct-quick-row {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 600px) {
          .ct-row {
            grid-template-columns: 1fr;
          }
          .ct-info-panel,
          .ct-form-panel {
            padding: 24px;
          }
          .ct-hero-title {
            font-size: 28px;
          }
        }
      `}</style>
    </div>
  );
}
