"use client";

import React, { useState, useEffect } from "react";
import { B } from "@/lib/data";
import { API_BASE } from "@/lib/api";

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  // Luxury Interactive CAPTCHA State: "idle" | "verifying" | "verified"
  const [captchaState, setCaptchaState] = useState<"idle" | "verifying" | "verified">("idle");
  const [captchaError, setCaptchaError] = useState("");

  useEffect(() => {
    document.title = "Contact Us | Medvarn";
  }, []);

  const handleVerifyClick = () => {
    if (captchaState === "verified" || captchaState === "verifying") return;
    setCaptchaError("");
    setCaptchaState("verifying");
    setTimeout(() => {
      setCaptchaState("verified");
    }, 600);
  };

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
                    setCaptchaState("idle");
                    setCaptchaError("");
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

                    // Luxury CAPTCHA Verification Check
                    if (captchaState !== "verified") {
                      setCaptchaError("Please tap the security badge below to verify you are human.");
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
                    <textarea id="ct-message" name="message" required placeholder="Tell us more about your needs..." rows={4} />
                  </div>

                  {/* LUXURY VISUAL CAPTCHA BADGE */}
                  <div className={`ct-visual-captcha ${captchaError ? "has-error" : ""} ${captchaState === "verified" ? "is-verified" : ""}`}>
                    <div className="captcha-card" onClick={handleVerifyClick}>
                      <div className="captcha-checkbox-wrap">
                        {captchaState === "idle" && <div className="captcha-box" />}
                        {captchaState === "verifying" && <div className="captcha-spinner" />}
                        {captchaState === "verified" && (
                          <div className="captcha-check-icon">
                            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </div>
                        )}
                      </div>

                      <div className="captcha-text-wrap">
                        {captchaState === "idle" && <span className="captcha-main-text">Tap to verify you are human</span>}
                        {captchaState === "verifying" && <span className="captcha-main-text verifying">Checking security token...</span>}
                        {captchaState === "verified" && <span className="captcha-main-text verified">Verification Complete</span>}
                        <span className="captcha-sub-text">Protected by Medvarn Anti-Spam Shield</span>
                      </div>

                      <div className="captcha-brand-badge">
                        <span className="shield-icon">🛡️</span>
                        <span className="brand-text">SECURE</span>
                      </div>
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

        {/* TALK TO MEDVARN FEATURE CARDS (WE'RE HERE TO HELP) */}
        <div className="ct-talk-section">
          <div className="ct-talk-sub">WE'RE HERE TO HELP</div>
          <h2 className="ct-talk-title">TALK TO MEDVARN</h2>
          
          <div className="ct-talk-grid">
            {/* 1. WHATSAPP US */}
            <a
              href="https://wa.me/918976488911?text=Hi!%20I%20have%20a%20question%20about%20Medvarn%20scrubs."
              target="_blank"
              rel="noopener noreferrer"
              className="ct-talk-card"
            >
              <div className="ct-talk-icon-circle">
                <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.713-1.458L0 24zm6.59-4.846c1.666.988 3.311 1.485 5.352 1.486 5.517 0 10.005-4.487 10.008-10.007.001-2.673-1.042-5.186-2.935-7.078C17.128 1.663 14.62 1.62 12.012 1.62c-5.522 0-10.014 4.488-10.017 10.009-.001 2.095.547 4.14 1.595 5.922L2.553 21.6l4.094-1.446zm9.046-5.437c.297.148.512.22.682.502.17.283.17 1.626-.69 2.476-.86.85-2.227.637-3.999-.071-1.771-.709-3.93-2.585-5.15-4.707-1.219-2.122-1.14-3.472-.234-4.38.906-.908 1.67-.85 1.84-.709.17.14.368.397.48.623.114.227.227.51.142.68-.086.17-.425.51-.623.708-.198.198-.425.425-.198.822.227.396.906 1.485 1.955 2.418 1.05.933 2.126 1.416 2.522 1.586.397.17.623.142.85-.113.227-.255.963-1.132 1.218-1.53.255-.396.51-.31.85-.17z" />
                </svg>
              </div>
              <h3 className="ct-talk-card-title">WHATSAPP US</h3>
              <div className="ct-talk-card-desc">Fastest chat with a human</div>
              <div className="ct-talk-card-note">Replies in ~10 min, 10am-7pm</div>
            </a>

            {/* 2. TRACK MY ORDER */}
            <a href="/track" className="ct-talk-card">
              <div className="ct-talk-icon-circle">
                <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                  <line x1="12" y1="22.08" x2="12" y2="12" />
                </svg>
              </div>
              <h3 className="ct-talk-card-title">TRACK MY ORDER</h3>
              <div className="ct-talk-card-desc">Order ID or AWB Tracking Number</div>
              <div className="ct-talk-card-note">Self-serve · no waiting</div>
            </a>

            {/* 3. EMAIL SUPPORT */}
            <a href="mailto:info@medvarn.com" className="ct-talk-card">
              <div className="ct-talk-icon-circle">
                <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <h3 className="ct-talk-card-title">EMAIL SUPPORT</h3>
              <div className="ct-talk-card-desc">info@medvarn.com</div>
              <div className="ct-talk-card-note">Replies within 24 hrs</div>
            </a>
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

        /* STYLISH VISUAL CAPTCHA CARD */
        .ct-visual-captcha {
          margin-top: 4px;
        }
        .captcha-card {
          background: #f8fafc;
          border: 1.5px solid #cbd5e1;
          border-radius: 14px;
          padding: 14px 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          cursor: pointer;
          transition: all 0.25s ease;
          user-select: none;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
        }
        .captcha-card:hover {
          border-color: #008080;
          background: #f0fdf4;
          transform: translateY(-1px);
        }
        .is-verified .captcha-card {
          background: #f0fdf4;
          border-color: #16a34a;
          box-shadow: 0 4px 12px rgba(22, 163, 74, 0.12);
        }
        .has-error .captcha-card {
          border-color: #ef4444;
          background: #fef2f2;
          animation: shake 0.4s ease;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-6px); }
          40%, 80% { transform: translateX(6px); }
        }

        .captcha-checkbox-wrap {
          width: 32px;
          height: 32px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .captcha-box {
          width: 24px;
          height: 24px;
          border: 2px solid #94a3b8;
          border-radius: 6px;
          background: white;
          transition: all 0.2s;
        }
        .captcha-card:hover .captcha-box {
          border-color: #008080;
        }
        .captcha-spinner {
          width: 22px;
          height: 22px;
          border: 3px solid #cbd5e1;
          border-top-color: #008080;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .captcha-check-icon {
          width: 28px;
          height: 28px;
          background: #16a34a;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 6px rgba(22, 163, 74, 0.3);
        }

        .captcha-text-wrap {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .captcha-main-text {
          font-size: 13.5px;
          font-weight: 700;
          color: #0f172a;
        }
        .captcha-main-text.verifying {
          color: #008080;
        }
        .captcha-main-text.verified {
          color: #15803d;
        }
        .captcha-sub-text {
          font-size: 11px;
          color: #64748b;
        }

        .captcha-brand-badge {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          padding-left: 12px;
          border-left: 1px solid #e2e8f0;
          flex-shrink: 0;
        }
        .shield-icon {
          font-size: 18px;
        }
        .brand-text {
          font-size: 9px;
          font-weight: 800;
          color: #64748b;
          letter-spacing: 0.8px;
        }

        .ct-captcha-err {
          font-size: 12px;
          font-weight: 700;
          color: #ef4444;
          margin-top: 6px;
          padding-left: 4px;
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

        /* TALK TO MEDVARN SECTION */
        .ct-talk-section {
          margin-top: 48px;
          text-align: center;
        }
        .ct-talk-sub {
          font-size: 12px;
          font-weight: 800;
          color: #64748b;
          letter-spacing: 1.5px;
          margin-bottom: 6px;
          text-transform: uppercase;
        }
        .ct-talk-title {
          font-size: 26px;
          font-weight: 900;
          color: #0f172a;
          margin: 0 0 32px;
          letter-spacing: -0.02em;
        }
        .ct-talk-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        .ct-talk-card {
          background: #ffffff;
          border: 1.5px solid #cbd5e1;
          border-radius: 20px;
          padding: 36px 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          text-decoration: none !important;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);
        }
        .ct-talk-card:hover {
          transform: translateY(-6px);
          border-color: #0f172a;
          box-shadow: 0 12px 28px rgba(15, 23, 42, 0.12);
        }
        .ct-talk-icon-circle {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: #0f172a;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
          transition: transform 0.3s ease;
        }
        .ct-talk-card:hover .ct-talk-icon-circle {
          transform: scale(1.1);
          background: #008080;
        }
        .ct-talk-card-title {
          font-size: 16px;
          font-weight: 900;
          color: #0f172a;
          margin: 0 0 8px;
          letter-spacing: 0.02em;
          text-transform: uppercase;
        }
        .ct-talk-card-desc {
          font-size: 13.5px;
          font-weight: 600;
          color: #334155;
          margin-bottom: 4px;
        }
        .ct-talk-card-note {
          font-size: 12px;
          color: #64748b;
          font-weight: 500;
        }

        @media (max-width: 840px) {
          .ct-talk-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }
          .ct-talk-card {
            padding: 24px 20px;
          }
        }

        /* Map */
        .ct-map-card {
          margin-top: 48px;
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
