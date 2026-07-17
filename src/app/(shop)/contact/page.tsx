"use client";

import React, { useState } from "react";
import { B } from "@/lib/data";
import { API_BASE } from "@/lib/api";

export default function ContactPage() {
  React.useEffect(() => {
    document.title = "Contact Us | Medvastr";
  }, []);

  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const socials = [
    ["📸", "Instagram", B.ig],
    ["📘", "Facebook", B.fb],
    ["💼", "LinkedIn", B.li],
  ];

  return (
    <div className="ct-page">

      {/* Top Banner */}
      <div className="ct-banner" />

      <div className="ct-wrapper">

        <div className="ct-grid">

          {/* LEFT: Info Panel */}
          <div className="ct-info-panel">
            <h1 className="ct-info-heading">Let's Connect</h1>
            <p className="ct-info-sub">
              Our dedicated support team understands the unique needs of healthcare professionals. Reach out anytime.
            </p>

            <div className="ct-info-list">
              {[
                { ico: "📞", label: "Speak with us", value: `${B.phone1}\n${B.phone2}`, href: `tel:${B.phone1}` },
                { ico: "✉️", label: "Write to us", value: B.email, href: `mailto:${B.email}` },
                { ico: "📍", label: "Visit our office", value: B.addr, href: undefined },
              ].map((item) => (
                <div key={item.label} className="ct-info-row">
                  <div className="ct-info-icon">{item.ico}</div>
                  <div className="ct-info-text">
                    <div className="ct-info-label">{item.label}</div>
                    {item.href ? (
                      <a href={item.href} className="ct-info-value">{item.value}</a>
                    ) : (
                      <div className="ct-info-value">{item.value}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="ct-socials-wrap">
              <div className="ct-socials-title">Follow Medvastr</div>
              <div className="ct-socials">
                {socials.map(([ico, nm, url]) => (
                  <a key={nm} href={url} target="_blank" rel="noopener" className="ct-social-btn">{ico}</a>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: Form */}
          <div className="ct-form-panel">
            {sent ? (
              <div className="ct-success">
                <div className="ct-success-icon">✨</div>
                <h2 className="ct-success-heading">Message Sent!</h2>
                <p className="ct-success-text">
                  We've received your query. Our team will reach out within 24 hours.
                </p>
                <button onClick={() => setSent(false)} className="ct-again-btn">
                  Send another message
                </button>
              </div>
            ) : (
              <>
                <h2 className="ct-form-heading">Send a Message</h2>
                <p className="ct-form-sub">Have a specific requirement or just want to say hi? We're all ears.</p>

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
                          type: form.get("subject") === "Bulk/Hospital Orders" ? "BULK_ORDER" : "CONTACT",
                          message: `Subj: ${form.get("subject")} - Msg: ${form.get("message")}`
                        })
                      });
                    } catch (err) {}
                    setLoading(false);
                    setSent(true);
                  }}
                  className="ct-form"
                >
                  <div className="ct-row">
                    <div className="ct-field">
                      <label>Your Name</label>
                      <input name="name" required placeholder="Enter your full name" />
                    </div>
                    <div className="ct-field">
                      <label>Mobile Number</label>
                      <input name="phone" required type="tel" placeholder="Enter your phone number" />
                    </div>
                  </div>

                  <div className="ct-field">
                    <label>Email Address</label>
                    <input name="email" required type="email" placeholder="Enter your email address" />
                  </div>

                  <div className="ct-field">
                    <label>What can we help with?</label>
                    <select name="subject" required>
                      <option>General Inquiry</option>
                      <option>Bulk/Hospital Orders</option>
                      <option>Sizing &amp; Customization</option>
                      <option>Shipping &amp; Logistics</option>
                    </select>
                  </div>

                  <div className="ct-field">
                    <label>Your Message</label>
                    <textarea name="message" required placeholder="Tell us more about your needs..." rows={5} />
                  </div>

                  <button type="submit" disabled={loading} className="ct-submit">
                    {loading ? "Sending..." : "Submit Inquiry →"}
                  </button>
                </form>
              </>
            )}
          </div>

        </div>

        {/* Map */}
        <div className="ct-map-card">
          <h3 className="ct-map-heading">📍 Find Us Here</h3>
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
        }

        /* Banner */
        .ct-banner {
          height: 55vh;
          min-height: 300px;
          max-height: 450px;
          background: url('https://d2tnzshqdaedbc.cloudfront.net/contact-banner.jpg') center/cover no-repeat;
        }

        /* Wrapper */
        .ct-wrapper {
          max-width: 1160px;
          margin: -80px auto 0;
          padding: 0 20px 80px;
          position: relative;
          z-index: 10;
        }

        /* Two-column grid */
        .ct-grid {
          display: grid;
          grid-template-columns: 1fr 1.4fr;
          gap: 28px;
          align-items: start;
        }

        /* Left info panel */
        .ct-info-panel {
          background: #0f172a;
          border-radius: 24px;
          padding: 44px 36px;
          color: white;
          box-shadow: 0 20px 48px rgba(0,0,0,0.18);
        }
        .ct-info-heading {
          font-size: 24px;
          font-weight: 700;
          color: white;
          margin: 0 0 10px;
        }
        .ct-info-sub {
          font-size: 13px;
          color: rgba(255,255,255,0.6);
          line-height: 1.65;
          margin: 0 0 36px;
        }
        .ct-info-list {
          display: flex;
          flex-direction: column;
          gap: 28px;
        }
        .ct-info-row {
          display: flex;
          gap: 18px;
          align-items: flex-start;
          transition: transform 0.3s;
        }
        .ct-info-row:hover {
          transform: translateX(6px);
        }
        .ct-info-icon {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          flex-shrink: 0;
        }
        .ct-info-text {
          padding-top: 2px;
        }
        .ct-info-label {
          font-size: 11px;
          font-weight: 700;
          color: #7FA5E6;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 6px;
        }
        .ct-info-value {
          font-size: 15px;
          font-weight: 500;
          color: white;
          text-decoration: none;
          white-space: pre-line;
          line-height: 1.55;
        }
        a.ct-info-value:hover {
          text-decoration: underline;
        }
        .ct-socials-wrap {
          margin-top: 36px;
          padding-top: 28px;
          border-top: 1px solid rgba(255,255,255,0.08);
        }
        .ct-socials-title {
          font-size: 11px;
          font-weight: 700;
          color: rgba(255,255,255,0.4);
          text-transform: uppercase;
          letter-spacing: 1.5px;
          margin-bottom: 18px;
        }
        .ct-socials {
          display: flex;
          gap: 12px;
        }
        .ct-social-btn {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          text-decoration: none;
          transition: all 0.25s;
          color: white;
        }
        .ct-social-btn:hover {
          background: var(--accent-blue);
          border-color: var(--accent-blue);
          transform: translateY(-4px);
        }

        /* Right form panel */
        .ct-form-panel {
          background: white;
          border-radius: 24px;
          padding: 40px 36px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.06);
          border: 1px solid #f1f5f9;
        }
        .ct-form-heading {
          font-size: 22px;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 6px;
        }
        .ct-form-sub {
          font-size: 13px;
          color: #64748b;
          margin: 0 0 28px;
          line-height: 1.6;
        }
        .ct-form {
          display: flex;
          flex-direction: column;
          gap: 18px;
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
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.8px;
        }
        .ct-field input,
        .ct-field select,
        .ct-field textarea {
          width: 100%;
          padding: 11px 14px;
          background: #f8fafc;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          font-size: 14px;
          color: #0f172a;
          font-family: inherit;
          outline: none;
          transition: all 0.2s;
          box-sizing: border-box;
          height: 44px;
        }
        .ct-field textarea {
          height: auto;
          resize: none;
        }
        .ct-field input:focus,
        .ct-field select:focus,
        .ct-field textarea:focus {
          border-color: var(--accent-blue);
          background: white;
          box-shadow: 0 0 0 3px rgba(79, 123, 196, 0.06);
        }
        .ct-submit {
          width: 100%;
          padding: 14px;
          background: var(--primary-navy);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 4px;
        }
        .ct-submit:hover:not(:disabled) {
          background: var(--secondary-blue);
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(32, 58, 95, 0.2);
        }
        .ct-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Success state */
        .ct-success {
          text-align: center;
          padding: 48px 20px;
        }
        .ct-success-icon {
          font-size: 56px;
          margin-bottom: 20px;
        }
        .ct-success-heading {
          font-size: 22px;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 12px;
        }
        .ct-success-text {
          font-size: 14px;
          color: #64748b;
          line-height: 1.65;
          margin: 0 0 28px;
        }
        .ct-again-btn {
          background: var(--primary-navy);
          color: white;
          border: none;
          padding: 12px 28px;
          border-radius: 10px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
        }

        /* Map */
        .ct-map-card {
          margin-top: 28px;
          background: white;
          padding: 36px;
          border-radius: 24px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.05);
          border: 1px solid #f1f5f9;
        }
        .ct-map-heading {
          font-size: 20px;
          font-weight: 600;
          color: #0f172a;
          margin: 0 0 20px;
        }
        .ct-map-wrap {
          width: 100%;
          height: 380px;
          border-radius: 14px;
          overflow: hidden;
          border: 1px solid #e2e8f0;
        }

        /* Responsive */
        @media (max-width: 900px) {
          .ct-grid {
            grid-template-columns: 1fr;
          }
          .ct-banner {
            height: 220px;
            min-height: auto;
          }
          .ct-wrapper {
            margin-top: -40px;
          }
          .ct-map-wrap {
            height: 280px;
          }
        }
        @media (max-width: 540px) {
          .ct-row {
            grid-template-columns: 1fr;
          }
          .ct-info-panel,
          .ct-form-panel,
          .ct-map-card {
            padding: 28px 20px;
          }
          .ct-map-wrap {
            height: 240px;
          }
        }
      `}</style>
    </div>
  );
}
