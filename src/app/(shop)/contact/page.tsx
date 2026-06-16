"use client";

import React, { useState } from "react";
import { B } from "@/lib/data";
import { API_BASE } from "@/lib/api";

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const socials = [
    ["📸", "Instagram", B.ig],
    ["📘", "Facebook", B.fb],
    ["💼", "LinkedIn", B.li],
  ];

  return (
    <div style={{ backgroundColor: "#ffffff", minHeight: "100vh", position: "relative" }}>

      {/* Top Banner Section */}
      <div style={{
        height: "60vh",
        minHeight: "450px",
        background: "linear-gradient(rgba(15, 23, 42, 0.4), rgba(15, 23, 42, 0.4)), url('https://d2tnzshqdaedbc.cloudfront.net/contact-banner.png') center/cover",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 24px"
      }}>
        {/* Banner with no text overlay as requested */}
      </div>

      <div style={{ maxWidth: "1200px", margin: "-80px auto 0", padding: "0 24px 100px", position: "relative", zIndex: 10 }}>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "32px" }}>

          {/* LEFT SIDE: Information */}
          <div style={{
            background: "#0f172a",
            padding: "54px 44px",
            borderRadius: "32px",
            color: "white",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
          }}>
            <h3 style={{ fontSize: "1.75rem", fontWeight: 800, marginBottom: "12px" }}>Let's Connect</h3>
            <p style={{ color: "rgba(255,255,255,0.6)", marginBottom: "48px", lineHeight: 1.6 }}>
              Our dedicated support team understands the unique needs of healthcare professionals. Reach out anytime.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "36px" }}>
              {[
                { ico: "📞", l: "Speak with us", v: `${B.phone1}\n${B.phone2}`, href: `tel:${B.phone1}` },
                { ico: "✉️", l: "Write to us", v: B.email, href: `mailto:${B.email}` },
                { ico: "📍", l: "Visit our office", v: B.addr },
              ].map((i) => (
                <div key={i.l} className="contact-info-row" style={{ display: "flex", gap: "24px", alignItems: "flex-start" }}>
                  <div style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "20px",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "26px",
                    flexShrink: 0
                  }}>
                    {i.ico}
                  </div>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: "#10b981", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>{i.l}</div>
                    {i.href ? (
                      <a href={i.href} style={{ fontSize: "17px", fontWeight: 600, color: "white", textDecoration: "none", whiteSpace: "pre-line", lineHeight: "1.5" }}>
                        {i.v}
                      </a>
                    ) : (
                      <div style={{ fontSize: "17px", fontWeight: 500, color: "white", whiteSpace: "pre-line", lineHeight: "1.5" }}>{i.v}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: "64px", paddingTop: "40px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
              <h3 style={{ fontSize: "14px", fontWeight: 700, color: "rgba(255,255,255,0.4)", marginBottom: "24px", textTransform: "uppercase", letterSpacing: "1.5px" }}>Follow Medvastr</h3>
              <div style={{ display: "flex", gap: "16px" }}>
                {socials.map(([ico, nm, url]) => (
                  <a key={nm} href={url} target="_blank" rel="noopener" className="social-icon">
                    {ico}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: The Form */}
          <div style={{
            background: "white",
            padding: "54px 44px",
            borderRadius: "32px",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.08)",
            border: "1px solid #f1f5f9"
          }}>
            {sent ? (
              <div style={{ textAlign: "center", padding: "60px 20px" }}>
                <div style={{ fontSize: "72px", marginBottom: "32px", background: "#f0fdf4", width: "140px", height: "140px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 32px", border: "1px solid #dcfce7" }}>✨</div>
                <h3 style={{ fontSize: "2rem", color: "#0f172a", marginBottom: "16px", fontWeight: 800 }}>Message Sent!</h3>
                <p style={{ color: "#64748b", fontSize: "17px", lineHeight: "1.7", marginBottom: "40px" }}>
                  We've received your query. Our operations manager will reach out to you personally within the next 24 hours.
                </p>
                <button onClick={() => setSent(false)} style={{ background: "#0f172a", color: "white", border: "none", padding: "16px 32px", borderRadius: "14px", fontWeight: 700, cursor: "pointer", transition: "all 0.3s" }}>
                  Send another message
                </button>
              </div>
            ) : (
              <>
                <h3 style={{ fontSize: "2rem", color: "#0f172a", marginBottom: "10px", fontWeight: 800 }}>Send a Message</h3>
                <p style={{ color: "#64748b", fontSize: "16px", marginBottom: "40px", lineHeight: 1.6 }}>Have a specific requirement or just want to say hi? We're all ears.</p>

                <form onSubmit={async (e) => {
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
                        type: form.get("subject") === "Bulk Order Inquiry" ? "BULK_ORDER" : "CONTACT",
                        message: `Subj: ${form.get("subject")} - Msg: ${form.get("message")}`
                      })
                    });
                  } catch (err) { }
                  setLoading(false);
                  setSent(true);
                }} style={{ display: "flex", flexDirection: "column", gap: "28px" }}>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "28px" }} className="responsive-grid">
                    <div className="input-group">
                      <label>Your Name</label>
                      <input name="name" required placeholder="Enter your full name" />
                    </div>
                    <div className="input-group">
                      <label>Mobile Number</label>
                      <input name="phone" required type="tel" placeholder="Enter your phone number" />
                    </div>
                  </div>

                  <div className="input-group">
                    <label>Email Address</label>
                    <input name="email" required type="email" placeholder="Enter your email address" />
                  </div>

                  <div className="input-group">
                    <label>What can we help with?</label>
                    <select name="subject" required>
                      <option>General Inquiry</option>
                      <option>Bulk/Hospital Orders</option>
                      <option>Sizing & Customization</option>
                      <option>Shipping & Logistics</option>
                    </select>
                  </div>

                  <div className="input-group">
                    <label>Your Message</label>
                    <textarea name="message" required placeholder="Tell us more about your needs..." rows={5} />
                  </div>

                  <button type="submit" disabled={loading} className="submit-btn">
                    {loading ? "Sending..." : "Submit Inquiry —"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .contact-info-row:hover { transform: translateX(10px); }
        .contact-info-row { transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); }

        .social-icon {
          width: 50px;
          height: 50px;
          border-radius: 15px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          transition: all 0.3s ease;
          text-decoration: none;
          color: white;
        }
        .social-icon:hover {
          background: #10b981;
          border-color: #10b981;
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(16, 185, 129, 0.2);
        }

        .input-group label {
          display: block;
          font-size: 11px;
          font-weight: 800;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          margin-bottom: 10px;
        }
        .input-group input, .input-group select, .input-group textarea {
          width: 100%;
          padding: 18px 20px;
          background: #f8fafc;
          border: 1.5px solid #e2e8f0;
          border-radius: 14px;
          font-size: 16px;
          color: #0f172a;
          font-family: inherit;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          outline: none;
          box-sizing: border-box;
        }
        .input-group textarea { resize: none; }
        .input-group input:focus, .input-group select:focus, .input-group textarea:focus {
          border-color: #0f172a;
          background: #fff;
          box-shadow: 0 0 0 4px rgba(15, 23, 42, 0.05);
        }

        .submit-btn {
          width: 100%;
          padding: 20px;
          background: #10b981;
          color: #fff;
          border: none;
          border-radius: 14px;
          font-size: 17px;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          margin-top: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          letter-spacing: 0.5px;
        }
        .submit-btn:hover:not(:disabled) {
          background: #059669;
          transform: translateY(-3px);
          box-shadow: 0 15px 30px rgba(16, 185, 129, 0.25);
        }
        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .responsive-grid { grid-template-columns: 1fr !important; gap: 28px !important; }
        }
      `}</style>
    </div>
  );
}
