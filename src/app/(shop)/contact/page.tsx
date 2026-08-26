"use client";

import React, { useState, useEffect, useCallback } from "react";
import { B } from "@/lib/data";
import { API_BASE } from "@/lib/api";

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  // CAPTCHA State
  const [captcha, setCaptcha] = useState({ num1: 5, num2: 3, answer: 8 });
  const [captchaInput, setCaptchaInput] = useState("");
  const [captchaError, setCaptchaError] = useState("");

  const generateCaptcha = useCallback(() => {
    const n1 = Math.floor(Math.random() * 9) + 2; // 2 to 10
    const n2 = Math.floor(Math.random() * 8) + 1; // 1 to 8
    setCaptcha({ num1: n1, num2: n2, answer: n1 + n2 });
    setCaptchaInput("");
    setCaptchaError("");
  }, []);

  useEffect(() => {
    document.title = "Contact Us | Medvarn";
    generateCaptcha();
  }, [generateCaptcha]);

  const socials = [
    ["📸", "Instagram", B.ig],
    ["📘", "Facebook", B.fb],
    ["💼", "LinkedIn", B.li],
  ];

  return (
    <div className="ct-page">
      {/* Top Banner Background */}
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
                { ico: "📞", label: "Speak with us", value: B.phone1, href: `tel:${B.phone1}` },
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
              <div className="ct-socials-title">Follow Medvarn</div>
              <div className="ct-socials">
                {socials.map(([ico, nm, url]) => (
                  <a key={nm} href={url} target="_blank" rel="noopener noreferrer" className="ct-social-btn">
                    {ico}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: Form Panel */}
          <div className="ct-form-panel">
            {sent ? (
              <div className="ct-success">
                <div className="ct-success-icon">✨</div>
                <h2 className="ct-success-heading">Message Sent!</h2>
                <p className="ct-success-text">
                  We've received your query. Our team will reach out within 24 hours.
                </p>
                <button
                  onClick={() => {
                    setSent(false);
                    generateCaptcha();
                  }}
                  className="ct-again-btn"
                >
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

                    // CAPTCHA Validation
                    if (parseInt(captchaInput.trim(), 10) !== captcha.answer) {
                      setCaptchaError("❌ Incorrect CAPTCHA answer. Please try again.");
                      generateCaptcha();
                      return;
                    }

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
                      <label htmlFor="ct-name">YOUR NAME <span className="req">*</span></label>
                      <input id="ct-name" name="name" required placeholder="Enter your full name" />
                    </div>
                    <div className="ct-field">
                      <label htmlFor="ct-phone">MOBILE NUMBER <span className="req">*</span></label>
                      <input id="ct-phone" name="phone" required type="tel" placeholder="Enter your phone number" />
                    </div>
                  </div>

                  <div className="ct-field">
                    <label htmlFor="ct-email">EMAIL ADDRESS <span className="req">*</span></label>
                    <input id="ct-email" name="email" required type="email" placeholder="Enter your email address" />
                  </div>

                  <div className="ct-field">
                    <label htmlFor="ct-subject">WHAT CAN WE HELP WITH?</label>
                    <select id="ct-subject" name="subject" required defaultValue="General Inquiry">
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Bulk/Hospital Orders">Bulk / Hospital Orders</option>
                      <option value="Sizing & Customization">Sizing &amp; Customization</option>
                      <option value="Shipping & Logistics">Shipping &amp; Logistics</option>
                    </select>
                  </div>

                  <div className="ct-field">
                    <label htmlFor="ct-message">YOUR MESSAGE <span className="req">*</span></label>
                    <textarea id="ct-message" name="message" required placeholder="Tell us more about your needs..." rows={5} />
                  </div>

                  {/* SECURITY CAPTCHA CHALLENGE */}
                  <div className="ct-captcha-box">
                    <div className="ct-captcha-header">
                      <label htmlFor="ct-captcha">SECURITY CAPTCHA <span className="req">*</span></label>
                      <button
                        type="button"
                        onClick={generateCaptcha}
                        className="ct-captcha-refresh"
                        title="Generate new question"
                      >
                        🔄 Refresh
                      </button>
                    </div>
                    <div className="ct-captcha-input-wrap">
                      <div className="ct-captcha-badge">
                        🛡️ What is <strong>{captcha.num1} + {captcha.num2}</strong> = ?
                      </div>
                      <input
                        id="ct-captcha"
                        type="number"
                        required
                        value={captchaInput}
                        onChange={(e) => {
                          setCaptchaInput(e.target.value);
                          if (captchaError) setCaptchaError("");
                        }}
                        placeholder="Enter answer"
                        className="ct-captcha-field"
                      />
                    </div>
                    {captchaError && <div className="ct-captcha-err">{captchaError}</div>}
                  </div>

                  <button type="submit" disabled={loading} className="ct-submit">
                    {loading ? "Sending..." : "Submit Inquiry →"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>

        {/* Map Section */}
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
        .req {
          color: #ef4444;
        }

        /* Banner */
        .ct-banner {
          height: 380px;
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
          align-items: stretch;
        }

        /* Left info panel */
        .ct-info-panel {
          background: #0f172a;
          border-radius: 24px;
          padding: 44px 36px;
          color: white;
          box-shadow: 0 20px 48px rgba(0,0,0,0.18);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .ct-info-heading {
          font-size: 26px;
          font-weight: 800;
          color: white;
          margin: 0 0 10px;
        }
        .ct-info-sub {
          font-size: 13.5px;
          color: rgba(255,255,255,0.65);
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
          font-weight: 800;
          color: #7FA5E6;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 6px;
        }
        .ct-info-value {
          font-size: 15px;
          font-weight: 600;
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
          font-weight: 800;
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
          background: #008080;
          border-color: #008080;
          transform: translateY(-4px);
        }

        /* Right form panel */
        .ct-form-panel {
          background: white;
          border-radius: 24px;
          padding: 40px 36px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.06);
          border: 1px solid #f1f5f9;
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
          margin: 0 0 28px;
          line-height: 1.6;
        }
        .ct-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
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
          letter-spacing: 0.8px;
        }
        .ct-field input,
        .ct-field select,
        .ct-field textarea {
          width: 100%;
          padding: 12px 16px;
          background: #f8fafc;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          font-size: 14px;
          color: #0f172a;
          font-family: inherit;
          outline: none;
          transition: all 0.2s;
          box-sizing: border-box;
          height: 46px;
        }
        .ct-field textarea {
          height: auto;
          resize: none;
        }
        .ct-field input:focus,
        .ct-field select:focus,
        .ct-field textarea:focus {
          border-color: #008080;
          background: white;
          box-shadow: 0 0 0 3px rgba(0, 128, 128, 0.1);
        }

        /* CAPTCHA Styling */
        .ct-captcha-box {
          background: #f8fafc;
          border: 1.5px solid #cbd5e1;
          border-radius: 12px;
          padding: 14px 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .ct-captcha-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .ct-captcha-header label {
          font-size: 11px;
          font-weight: 800;
          color: #475569;
          letter-spacing: 0.8px;
        }
        .ct-captcha-refresh {
          background: none;
          border: none;
          font-size: 11.5px;
          font-weight: 700;
          color: #008080;
          cursor: pointer;
          padding: 0;
        }
        .ct-captcha-refresh:hover {
          text-decoration: underline;
        }
        .ct-captcha-input-wrap {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        .ct-captcha-badge {
          background: #ffffff;
          border: 1px solid #cbd5e1;
          padding: 8px 14px;
          border-radius: 8px;
          font-size: 13.5px;
          color: #0f172a;
          flex-shrink: 0;
          font-weight: 600;
        }
        .ct-captcha-field {
          flex: 1;
          min-width: 100px;
          height: 42px !important;
          border-radius: 8px !important;
          background: white !important;
        }
        .ct-captcha-err {
          font-size: 12px;
          font-weight: 700;
          color: #ef4444;
          margin-top: 2px;
        }

        .ct-submit {
          width: 100%;
          padding: 14px;
          background: #0f172a;
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 4px;
        }
        .ct-submit:hover:not(:disabled) {
          background: #008080;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 128, 128, 0.25);
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
          font-weight: 800;
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
          background: #0f172a;
          color: white;
          border: none;
          padding: 12px 28px;
          border-radius: 10px;
          font-weight: 700;
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
          font-weight: 800;
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
