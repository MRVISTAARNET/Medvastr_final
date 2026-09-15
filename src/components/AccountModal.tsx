"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { API_BASE } from "@/lib/api";

export default function AccountModal({ onClose }: { onClose: () => void }) {
  const { user, login, register, logout, requestOtp, loginWithOtp } = useApp();
  const [mode, setMode] = useState<"login" | "register" | "login-otp" | "verify-otp">("login-otp");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    fullName: "", email: "", password: "", phone: "", otp: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [callConsent, setCallConsent] = useState(true);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleDismissModal = () => {
    try {
      localStorage.setItem("mv_welcome_dismissed_at", Date.now().toString());
    } catch { /* ignore */ }
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      let ok = false;
      if (mode === "login") {
        ok = await login(form.email, form.password);
      } else if (mode === "register") {
        const nameParts = form.fullName.trim().split(" ");
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";
        
        if (!firstName) {
          setError("Please enter your full name.");
          setLoading(false);
          return;
        }
        if (form.password.length < 8) {
          setError("Password must be at least 8 characters.");
          setLoading(false);
          return;
        }
        ok = await register(firstName, lastName, form.email, form.password, form.phone);
      } else if (mode === "login-otp") {
        ok = await requestOtp(form.email);
        if (ok) { setMode("verify-otp"); setLoading(false); return; }
      } else if (mode === "verify-otp") {
        ok = await loginWithOtp(form.email, form.otp);
      }
      if (ok) {
        try {
          localStorage.setItem("mv_user_completed_auth", "true");
        } catch { /* ignore */ }
        if (callConsent) {
          try {
            fetch(`${API_BASE}/inquiries`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: form.fullName || "Registered User",
                email: form.email,
                phone: form.phone || (form.email.match(/^\d{10}$/) ? form.email : ""),
                message: "User logged in/registered with Call & WhatsApp Consent for 10% OFF Offer (WELCOME10)",
                type: "WELCOME_POPUP_LEAD"
              })
            }).catch(() => {});
          } catch { /* ignore */ }
        }
        onClose();
      }
      else { if (mode !== "login-otp") setError("Invalid credentials or code. Please try again."); }
    } catch { 
      setError("Something went wrong. Please check your connection."); 
    } finally { 
      setLoading(false); 
    }
  };

  // Forgot Password
  const [fpMode, setFpMode] = useState(false);
  const [fpEmail, setFpEmail] = useState("");
  const [fpLoading, setFpLoading] = useState(false);
  const [fpMsg, setFpMsg] = useState("");

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fpEmail) { setFpMsg("Please enter your email."); return; }
    setFpLoading(true); setFpMsg("");
    try {
      await fetch(`${API_BASE}/auth/forgot-password?email=${encodeURIComponent(fpEmail)}`, { method: "POST" });
      setFpMsg("✅ If this email is registered, a reset link has been sent. Please check your inbox.");
    } catch { setFpMsg("❌ Network error. Please try again."); }
    setFpLoading(false);
  };

  const switchMode = (m: typeof mode) => {
    setMode(m); setError("");
    setForm({ fullName: "", email: "", password: "", phone: "", otp: "" });
    setFpMode(false); setFpMsg("");
  };

  const SpamNote = () => (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '10px 12px', fontSize: 12, color: '#92400e', marginTop: 12 }}>
      <span style={{ fontSize: 14, flexShrink: 0 }}>📬</span>
      <span>Check your <strong>Spam / Junk</strong> folder if the email code is delayed.</span>
    </div>
  );

  return (
    <div className="auth-overlay">
      {/* Backdrop */}
      <div className="auth-backdrop" onClick={handleDismissModal} />

      <div className="auth-modal">
        {/* Close Button */}
        <button onClick={handleDismissModal} className="auth-close-btn" aria-label="Close dialog">✕</button>

        {/* Left Column - Welcome Brand Banner */}
        <div className="auth-left-banner">
          <div>
            <h2 className="banner-title">Medvarn</h2>
            <p className="banner-subtitle">Premium Medical Scrubs & Apparel</p>

            {/* Benefit Highlights */}
            <div className="banner-benefits">
              <div className="benefit-item">
                <span className="benefit-icon">🎁</span>
                <span><strong>10% OFF</strong> on Your First Order</span>
              </div>
              <div className="benefit-item">
                <span className="benefit-icon">🩺</span>
                <span>High-Performance Medical Fabrics</span>
              </div>
              <div className="benefit-item">
                <span className="benefit-icon">🚚</span>
                <span>Express Shipping & Sizing Support</span>
              </div>
            </div>
          </div>
          
          <div className="banner-footer-note">
            Medvarn • Healthcare Apparel
          </div>
        </div>

        {/* Right Column - Forms Panel */}
        <div className="auth-right-form">
          {user ? (
            /* Logged in Panel */
            <div style={{ textAlign: "center", width: "100%" }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto 16px", color: '#008080', border: '2px solid #008080' }}>👤</div>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>Hi, {user.firstName || 'Customer'}!</h2>
              <div style={{ fontSize: 13, color: "#64748b", marginBottom: 24 }}>{user.email}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <Link href="/account" onClick={onClose} className="btn-primary" style={{ width: "100%", height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>My Account Dashboard</Link>
                <button className="btn-secondary" style={{ width: "100%", height: 44 }} onClick={() => { logout(); onClose(); }}>Sign Out</button>
              </div>
            </div>
          ) : fpMode ? (
            /* Forgot Password Panel */
            <div style={{ width: "100%" }}>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>Forgot Password?</h2>
              <p style={{ fontSize: 13, color: "#64748b", marginBottom: 20 }}>Enter your registered email address below to receive a reset link.</p>

              {fpMsg && (
                <div style={{ background: fpMsg.startsWith('✅') ? '#f0fdf4' : '#fef2f2', color: fpMsg.startsWith('✅') ? '#166534' : '#991b1b', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 16, border: '1px solid transparent' }}>
                  {fpMsg}
                </div>
              )}

              {!fpMsg.startsWith('✅') && (
                <form onSubmit={handleForgotPassword} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div className="underline-input-group">
                    <label className="underline-input-label">Email Address</label>
                    <input type="email" placeholder="Enter Email Address" required value={fpEmail} onChange={e => setFpEmail(e.target.value)} className="underline-input" />
                  </div>
                  <button type="submit" disabled={fpLoading} className="btn-primary" style={{ marginTop: 8 }}>
                    {fpLoading ? 'Sending...' : 'Send Reset Link'}
                  </button>
                </form>
              )}

              <div style={{ textAlign: "center", marginTop: 20, fontSize: 13 }}>
                <span onClick={() => { setFpMode(false); setFpEmail(""); setFpMsg(""); }} style={{ color: "#008080", fontWeight: 700, cursor: "pointer" }}>← Back to Sign In</span>
              </div>
            </div>
          ) : (
            /* Login & Sign Up Forms */
            <div style={{ width: "100%" }}>
              {/* 🎁 10% OFF Welcome Promo Pill */}
              <div style={{
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                color: '#166534',
                padding: '10px 14px',
                borderRadius: '10px',
                marginBottom: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '10px'
              }}>
                <div style={{ fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>🎁</span>
                  <span>Get <strong>10% OFF</strong> your order</span>
                </div>
                <span style={{
                  background: '#008080',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '11px',
                  padding: '3px 8px',
                  borderRadius: '5px',
                  letterSpacing: '0.5px',
                  whiteSpace: 'nowrap'
                }}>
                  WELCOME10
                </span>
              </div>

              {error && (
                <div style={{ background: '#fef2f2', color: '#991b1b', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 16, border: '1px solid #fecaca' }}>⚠️ {error}</div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {mode === 'register' && (
                  <div className="underline-input-group">
                    <label className="underline-input-label">Full Name</label>
                    <input name="fullName" type="text" placeholder="Enter Full Name" required value={form.fullName} onChange={handleInputChange} className="underline-input" />
                  </div>
                )}

                {mode !== 'verify-otp' && (
                  <div className="underline-input-group">
                    <label className="underline-input-label">
                      {mode === 'login' || mode === 'login-otp' ? 'Mobile Number or Email' : 'Email Address'}
                    </label>
                    <input
                      name="email"
                      type="text"
                      placeholder={mode === 'login' || mode === 'login-otp' ? 'Enter 10-digit mobile or email' : 'Enter Email Address'}
                      required
                      value={form.email}
                      onChange={handleInputChange}
                      className="underline-input"
                    />
                  </div>
                )}

                {mode === 'register' && (
                  <div className="underline-input-group">
                    <label className="underline-input-label">Phone Number</label>
                    <input name="phone" type="tel" placeholder="Enter Phone Number" required value={form.phone} onChange={handleInputChange} className="underline-input" />
                  </div>
                )}

                {(mode === 'login' || mode === 'register') && (
                  <div className="underline-input-group" style={{ position: 'relative' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label className="underline-input-label">Password</label>
                      {mode === 'login' && (
                        <span onClick={() => { setFpMode(true); setFpEmail(form.email); setFpMsg(""); }} style={{ fontSize: 11, color: '#008080', fontWeight: 600, cursor: 'pointer', zIndex: 10 }}>
                          Forgot Password?
                        </span>
                      )}
                    </div>
                    <input name="password" type={showPassword ? "text" : "password"} placeholder="Enter Password" required minLength={mode === 'register' ? 8 : undefined} value={form.password} onChange={handleInputChange} className="underline-input" style={{ paddingRight: '36px' }} />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ position: 'absolute', right: '0', bottom: '8px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '15px', opacity: showPassword ? 1 : 0.4, transition: 'opacity 0.2s', zIndex: 10 }}
                    >
                      👁️
                    </button>
                  </div>
                )}

                {mode === 'verify-otp' && (
                  <div className="underline-input-group">
                    <label className="underline-input-label">6-Digit Code</label>
                    <input name="otp" type="text" inputMode="numeric" placeholder="000000" maxLength={6} required value={form.otp} onChange={handleInputChange} className="underline-input" style={{ textAlign: 'center', fontSize: 22, letterSpacing: '6px' }} />
                    <SpamNote />
                  </div>
                )}

                {/* 📱 Call & WhatsApp Consent Checkbox */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <input
                    type="checkbox"
                    id="callConsent"
                    checked={callConsent}
                    onChange={(e) => setCallConsent(e.target.checked)}
                    style={{ marginTop: '2px', cursor: 'pointer', width: '15px', height: '15px', accentColor: '#008080' }}
                  />
                  <label htmlFor="callConsent" style={{ fontSize: '11px', color: '#475569', lineHeight: '1.4', cursor: 'pointer' }}>
                    I agree to receive order updates, sizing guidance, and special offer alerts via <strong>Call & WhatsApp</strong>.
                  </label>
                </div>

                {/* Terms Disclaimer */}
                <p style={{ fontSize: "11px", color: "#64748b", lineHeight: "1.4", margin: 0 }}>
                  By continuing, you agree to Medvarn's <Link href="/terms" onClick={onClose} style={{ color: "#008080", fontWeight: 600 }}>Terms</Link> & <Link href="/privacy" onClick={onClose} style={{ color: "#008080", fontWeight: 600 }}>Privacy Policy</Link>.
                </p>

                <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: 4, height: '44px', fontSize: '13px', fontWeight: 700, letterSpacing: '0.5px', background: '#008080', borderRadius: '8px', cursor: 'pointer' }}>
                  {loading ? 'Please wait...' : (mode === 'login' ? 'LOGIN' : mode === 'register' ? 'CREATE ACCOUNT' : mode === 'login-otp' ? 'REQUEST OTP' : 'VERIFY & LOGIN')}
                </button>
              </form>

              {/* Divider */}
              {(mode === 'login' || mode === 'login-otp') && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '16px 0 12px' }}>
                  <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
                  <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700 }}>OR</span>
                  <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
                </div>
              )}

              {/* Bottom Switch Links */}
              <div className="auth-switch-links">
                {mode === 'login-otp' && (
                  <>
                    <div>
                      <span onClick={() => switchMode('login')} style={{ color: "#008080", fontWeight: 600, cursor: "pointer" }}>
                        🔑 Sign In with Password
                      </span>
                    </div>
                    <div>New to Medvarn? <span onClick={() => switchMode('register')} style={{ color: "#008080", fontWeight: 700, cursor: "pointer" }}>Create account</span></div>
                  </>
                )}
                {mode === 'login' && (
                  <>
                    <div>
                      <span onClick={() => switchMode('login-otp')} style={{ color: "#008080", fontWeight: 600, cursor: "pointer" }}>
                        📱 Continue with Mobile OTP
                      </span>
                    </div>
                    <div>New to Medvarn? <span onClick={() => switchMode('register')} style={{ color: "#008080", fontWeight: 700, cursor: "pointer" }}>Create account</span></div>
                  </>
                )}
                {mode === 'verify-otp' && (
                  <>
                    <div>Didn't receive code? <span onClick={() => switchMode('login-otp')} style={{ color: "#008080", fontWeight: 600, cursor: "pointer" }}>Try again</span></div>
                    <div>Wrong number? <span onClick={() => setMode('login-otp')} style={{ color: "#008080", fontWeight: 600, cursor: "pointer" }}>Change number</span></div>
                  </>
                )}
                {mode === 'register' && (
                  <div>Existing User? <span onClick={() => switchMode('login-otp')} style={{ color: "#008080", fontWeight: 700, cursor: "pointer" }}>Log in</span></div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .auth-overlay {
          position: fixed;
          inset: 0;
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
        }
        .auth-backdrop {
          position: absolute;
          inset: 0;
          background: rgba(15, 23, 42, 0.5);
          backdrop-filter: blur(6px);
        }
        .auth-modal {
          position: relative;
          z-index: 10001;
          background: #ffffff;
          width: 100%;
          max-width: 660px;
          max-height: 90vh;
          border-radius: 16px;
          display: flex;
          overflow: hidden;
          box-shadow: 0 25px 80px rgba(15, 23, 42, 0.25);
          animation: modalSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .auth-close-btn {
          position: absolute;
          top: 14px;
          right: 14px;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: #f1f5f9;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          color: #64748b;
          z-index: 50;
          transition: all 0.2s;
        }
        .auth-close-btn:hover {
          background: #e2e8f0;
          color: #0f172a;
        }
        
        /* Left Column Branding */
        .auth-left-banner {
          width: 36%;
          background: linear-gradient(135deg, #1d4ed8 0%, #0d9488 100%);
          padding: 32px 22px;
          color: #ffffff;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
        }
        .banner-title {
          font-size: 24px;
          font-weight: 800;
          line-height: 1.2;
          color: #ffffff;
          margin-bottom: 4px;
          letter-spacing: -0.5px;
        }
        .banner-subtitle {
          font-size: 12px;
          line-height: 1.4;
          color: rgba(255, 255, 255, 0.88);
          margin-bottom: 20px;
        }
        .banner-benefits {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .benefit-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.95);
          line-height: 1.35;
        }
        .benefit-icon {
          font-size: 16px;
          flex-shrink: 0;
        }
        .banner-footer-note {
          font-size: 10px;
          color: rgba(255, 255, 255, 0.65);
          letter-spacing: 0.3px;
          text-transform: uppercase;
          font-weight: 600;
          margin-top: 20px;
        }

        /* Right Column Form */
        .auth-right-form {
          width: 64%;
          padding: 28px 28px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          overflow-y: auto;
          max-height: 90vh;
          background: #ffffff;
        }
        .underline-input-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
          width: 100%;
        }
        .underline-input-label {
          font-size: 11px;
          font-weight: 700;
          color: #475569;
        }
        .underline-input {
          height: auto !important;
          border: none !important;
          border-bottom: 1.5px solid #cbd5e1 !important;
          border-radius: 0 !important;
          padding: 6px 0 !important;
          font-size: 14px !important;
          color: #0f172a !important;
          background: transparent !important;
          outline: none !important;
          transition: border-color 0.2s !important;
          width: 100%;
        }
        .underline-input:focus {
          border-bottom-color: #008080 !important;
        }
        .underline-input::placeholder {
          color: #94a3b8;
        }
        
        .auth-switch-links {
          display: flex;
          flex-direction: column;
          gap: 8px;
          font-size: 12px;
          color: #64748b;
          text-align: center;
        }

        @media (max-width: 768px) {
          .auth-modal {
            max-width: 440px;
            min-height: auto;
          }
          .auth-left-banner {
            display: none;
          }
          .auth-right-form {
            width: 100%;
            padding: 24px 20px;
          }
        }

        @keyframes modalSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
