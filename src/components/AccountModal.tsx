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

        {/* Left Column - Welcome Brand Banner (Flipkart Style) */}
        <div className="auth-left-banner">
          <div>
            <h2 className="banner-title">{mode === 'register' ? 'Looks like you\'re new here!' : 'Login'}</h2>
            <p className="banner-subtitle">
              {mode === 'register' 
                ? 'Sign up with your details to get started' 
                : 'Get access to your Orders, Wishlist and Recommendations'}
            </p>
          </div>
          
          <div className="banner-graphic-area">
            <div className="tilted-logo-card">
              <span className="logo-card-text">medvarn</span>
              <span className="logo-card-tag">scrubs & apparel</span>
            </div>
          </div>
        </div>

        {/* Right Column - Forms Panel */}
        <div className="auth-right-form">
          {user ? (
            /* Logged in Panel */
            <div style={{ textAlign: "center", width: "100%", padding: "10px 0" }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto 16px", color: '#2874f0', border: '2px solid #2874f0' }}>👤</div>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>Hi, {user.firstName || 'Customer'}!</h2>
              <div style={{ fontSize: 13, color: "#64748b", marginBottom: 24 }}>{user.email}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <Link href="/account" onClick={onClose} className="btn-primary" style={{ width: "100%", height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#2874f0', borderRadius: 4, fontWeight: 700 }}>My Account Dashboard</Link>
                <button className="btn-secondary" style={{ width: "100%", height: 44, borderRadius: 4, border: '1px solid #cbd5e1', cursor: 'pointer' }} onClick={() => { logout(); onClose(); }}>Sign Out</button>
              </div>
            </div>
          ) : fpMode ? (
            /* Forgot Password Panel */
            <div style={{ width: "100%" }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>Forgot Password?</h2>
              <p style={{ fontSize: 13, color: "#64748b", marginBottom: 20 }}>Enter your registered email address below to receive a reset link.</p>

              {fpMsg && (
                <div style={{ background: fpMsg.startsWith('✅') ? '#f0fdf4' : '#fef2f2', color: fpMsg.startsWith('✅') ? '#166534' : '#991b1b', padding: '10px 14px', borderRadius: 6, fontSize: 13, marginBottom: 16, border: '1px solid transparent' }}>
                  {fpMsg}
                </div>
              )}

              {!fpMsg.startsWith('✅') && (
                <form onSubmit={handleForgotPassword} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div className="input-group">
                    <label className="input-label">Email Address</label>
                    <input type="email" placeholder="Enter Email Address" required value={fpEmail} onChange={e => setFpEmail(e.target.value)} className="styled-input" />
                  </div>
                  <button type="submit" disabled={fpLoading} className="auth-submit-btn" style={{ marginTop: 8 }}>
                    {fpLoading ? 'Sending...' : 'SEND RESET LINK'}
                  </button>
                </form>
              )}

              <div style={{ textAlign: "center", marginTop: 20, fontSize: 13 }}>
                <span onClick={() => { setFpMode(false); setFpEmail(""); setFpMsg(""); }} style={{ color: "#2874f0", fontWeight: 700, cursor: "pointer" }}>← Back to Sign In</span>
              </div>
            </div>
          ) : (
            /* Main Form Panel */
            <div className="form-container">
              {/* Header with Mode Switcher */}
              <div className="form-header-row">
                <div>
                  <h3 className="form-title">
                    {mode === 'register' ? 'Create Account' : 'Log in for the best experience'}
                  </h3>
                  <p className="form-subtitle">
                    {mode === 'register' ? 'Enter your details to register' : 'Enter your phone number or email to continue'}
                  </p>
                </div>
              </div>

              {/* Promo Pill */}
              <div className="promo-banner">
                <div style={{ fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>🎉</span>
                  <span>Get <strong>10% OFF</strong> on your first order</span>
                </div>
                <span className="promo-code">WELCOME10</span>
              </div>

              {error && (
                <div className="error-alert">⚠️ {error}</div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {mode === 'register' && (
                  <div className="input-group">
                    <label className="input-label">Full Name</label>
                    <input name="fullName" type="text" placeholder="Enter Full Name" required value={form.fullName} onChange={handleInputChange} className="styled-input" />
                  </div>
                )}

                {mode === 'login-otp' && (
                  <div className="input-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label className="input-label">Mobile Number / Email</label>
                      <span onClick={() => switchMode('login')} className="switch-link">
                        Use Password
                      </span>
                    </div>
                    <div className="phone-input-wrapper">
                      <span className="country-code">+91 🇮🇳</span>
                      <input
                        name="email"
                        type="text"
                        placeholder="Enter 10-digit mobile number"
                        required
                        value={form.email}
                        onChange={handleInputChange}
                        className="phone-input"
                      />
                    </div>
                  </div>
                )}

                {mode === 'login' && (
                  <>
                    <div className="input-group">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label className="input-label">Email or Phone</label>
                        <span onClick={() => switchMode('login-otp')} className="switch-link">
                          Use OTP
                        </span>
                      </div>
                      <input
                        name="email"
                        type="text"
                        placeholder="Enter Email or Phone Number"
                        required
                        value={form.email}
                        onChange={handleInputChange}
                        className="styled-input"
                      />
                    </div>

                    <div className="input-group" style={{ position: 'relative' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label className="input-label">Password</label>
                        <span onClick={() => { setFpMode(true); setFpEmail(form.email); setFpMsg(""); }} className="forgot-link">
                          Forgot Password?
                        </span>
                      </div>
                      <input name="password" type={showPassword ? "text" : "password"} placeholder="Enter Password" required value={form.password} onChange={handleInputChange} className="styled-input" style={{ paddingRight: '40px' }} />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ position: 'absolute', right: '10px', bottom: '10px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', opacity: 0.6 }}
                      >
                        {showPassword ? "🙈" : "👁️"}
                      </button>
                    </div>
                  </>
                )}

                {mode === 'register' && (
                  <>
                    <div className="input-group">
                      <label className="input-label">Email Address</label>
                      <input name="email" type="email" placeholder="Enter Email Address" required value={form.email} onChange={handleInputChange} className="styled-input" />
                    </div>

                    <div className="input-group">
                      <label className="input-label">Mobile Number</label>
                      <div className="phone-input-wrapper">
                        <span className="country-code">+91 🇮🇳</span>
                        <input name="phone" type="tel" placeholder="Enter Phone Number" required value={form.phone} onChange={handleInputChange} className="phone-input" />
                      </div>
                    </div>

                    <div className="input-group" style={{ position: 'relative' }}>
                      <label className="input-label">Create Password</label>
                      <input name="password" type={showPassword ? "text" : "password"} placeholder="At least 8 characters" required minLength={8} value={form.password} onChange={handleInputChange} className="styled-input" style={{ paddingRight: '40px' }} />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ position: 'absolute', right: '10px', bottom: '10px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', opacity: 0.6 }}
                      >
                        {showPassword ? "🙈" : "👁️"}
                      </button>
                    </div>
                  </>
                )}

                {mode === 'verify-otp' && (
                  <div className="input-group">
                    <label className="input-label">Enter 6-Digit OTP</label>
                    <input name="otp" type="text" inputMode="numeric" placeholder="000000" maxLength={6} required value={form.otp} onChange={handleInputChange} className="styled-input" style={{ textAlign: 'center', fontSize: 22, letterSpacing: '8px', fontWeight: 700 }} />
                    <SpamNote />
                  </div>
                )}

                {/* Consent Checkbox */}
                <div className="consent-box">
                  <input
                    type="checkbox"
                    id="callConsent"
                    checked={callConsent}
                    onChange={(e) => setCallConsent(e.target.checked)}
                    className="consent-checkbox"
                  />
                  <label htmlFor="callConsent" className="consent-label">
                    Get updates, sizing support & offer alerts on <strong>Call & WhatsApp</strong>.
                  </label>
                </div>

                {/* Terms Disclaimer */}
                <p className="disclaimer-text">
                  By continuing, you agree to Medvarn's <Link href="/terms" onClick={onClose} className="legal-link">Terms of Use</Link> & <Link href="/privacy" onClick={onClose} className="legal-link">Privacy Policy</Link>.
                </p>

                <button type="submit" disabled={loading} className="auth-submit-btn">
                  {loading ? 'PLEASE WAIT...' : (mode === 'login' ? 'LOGIN' : mode === 'register' ? 'CONTINUE' : mode === 'login-otp' ? 'CONTINUE' : 'VERIFY & LOGIN')}
                </button>
              </form>

              {/* Footer Switch Links */}
              <div className="auth-footer-switch">
                {(mode === 'login-otp' || mode === 'login') && (
                  <div className="switch-account-text">
                    New to Medvarn? <span onClick={() => switchMode('register')} className="accent-action">Create an account</span>
                  </div>
                )}
                {mode === 'verify-otp' && (
                  <div className="switch-account-text">
                    Didn't receive OTP? <span onClick={() => switchMode('login-otp')} className="accent-action">Resend</span> or <span onClick={() => setMode('login-otp')} className="accent-action">Change Number</span>
                  </div>
                )}
                {mode === 'register' && (
                  <div className="switch-account-text">
                    Existing User? <span onClick={() => switchMode('login-otp')} className="accent-action">Log in</span>
                  </div>
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
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
        }
        .auth-modal {
          position: relative;
          z-index: 10001;
          background: #ffffff;
          width: 100%;
          max-width: 680px;
          height: auto;
          max-height: 90vh;
          border-radius: 4px;
          display: flex;
          overflow: hidden;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
          animation: modalSlideUp 0.25s ease-out;
        }
        .auth-close-btn {
          position: absolute;
          top: 12px;
          right: 12px;
          width: 32px;
          height: 32px;
          background: transparent;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          color: #878787;
          z-index: 50;
          transition: color 0.2s;
        }
        .auth-close-btn:hover {
          color: #212121;
        }
        
        /* Left Column Banner - Flipkart Blue Design */
        .auth-left-banner {
          width: 38%;
          background: #2874f0;
          padding: 36px 28px;
          color: #ffffff;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
          background-image: linear-gradient(180deg, #2874f0 0%, #1e5fc2 100%);
        }
        .banner-title {
          font-size: 26px;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 10px;
          letter-spacing: -0.3px;
        }
        .banner-subtitle {
          font-size: 14px;
          line-height: 1.5;
          color: #dbf4ff;
          font-weight: 400;
        }
        .banner-graphic-area {
          display: flex;
          justify-content: center;
          align-items: center;
          padding-top: 20px;
        }
        .tilted-logo-card {
          background: #ffffff;
          color: #2874f0;
          padding: 16px 24px;
          border-radius: 8px;
          transform: rotate(-3deg);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
          display: flex;
          flex-direction: column;
          align-items: center;
          border: 1px solid rgba(255, 255, 255, 0.4);
        }
        .logo-card-text {
          font-size: 22px;
          font-weight: 900;
          letter-spacing: -0.5px;
          text-transform: lowercase;
        }
        .logo-card-tag {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
          color: #666;
        }

        /* Right Column Form */
        .auth-right-form {
          width: 62%;
          padding: 32px 32px 24px;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          overflow-y: auto;
          max-height: 90vh;
          background: #ffffff;
        }

        .form-container {
          width: 100%;
          display: flex;
          flex-direction: column;
        }

        .form-header-row {
          margin-bottom: 14px;
        }
        .form-title {
          font-size: 16px;
          font-weight: 700;
          color: #212121;
          margin-bottom: 4px;
        }
        .form-subtitle {
          font-size: 12px;
          color: #878787;
        }

        .promo-banner {
          background: #f0fdf4;
          border: 1px dashed #86efac;
          color: #166534;
          padding: 8px 12px;
          border-radius: 4px;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .promo-code {
          background: #15803d;
          color: #ffffff;
          font-weight: 700;
          font-size: 10px;
          padding: 2px 6px;
          border-radius: 3px;
          letter-spacing: 0.5px;
        }

        .error-alert {
          background: #fef2f2;
          color: #b91c1c;
          padding: 8px 12px;
          border-radius: 4px;
          font-size: 12px;
          margin-bottom: 14px;
          border: 1px solid #fecaca;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
          width: 100%;
        }
        .input-label {
          font-size: 12px;
          font-weight: 600;
          color: #212121;
        }
        .styled-input {
          height: 42px;
          border: 1px solid #e0e0e0;
          border-radius: 4px;
          padding: 0 12px;
          font-size: 14px;
          color: #212121;
          outline: none;
          transition: border-color 0.2s;
          width: 100%;
        }
        .styled-input:focus {
          border-color: #2874f0;
          box-shadow: 0 0 0 1px #2874f0;
        }

        .phone-input-wrapper {
          display: flex;
          align-items: center;
          border: 1px solid #e0e0e0;
          border-radius: 4px;
          overflow: hidden;
          height: 42px;
          transition: border-color 0.2s;
        }
        .phone-input-wrapper:focus-within {
          border-color: #2874f0;
          box-shadow: 0 0 0 1px #2874f0;
        }
        .country-code {
          background: #f8fafc;
          border-right: 1px solid #e0e0e0;
          padding: 0 10px;
          font-size: 13px;
          font-weight: 600;
          color: #475569;
          height: 100%;
          display: flex;
          align-items: center;
          white-space: nowrap;
        }
        .phone-input {
          border: none;
          outline: none;
          padding: 0 12px;
          font-size: 14px;
          color: #212121;
          width: 100%;
          height: 100%;
        }

        .switch-link {
          font-size: 12px;
          color: #2874f0;
          font-weight: 600;
          cursor: pointer;
        }
        .switch-link:hover {
          text-decoration: underline;
        }
        .forgot-link {
          font-size: 11px;
          color: #2874f0;
          font-weight: 600;
          cursor: pointer;
        }

        .consent-box {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          background: #f8fafc;
          padding: 8px 10px;
          border-radius: 4px;
          border: 1px solid #e2e8f0;
          margin-top: 2px;
        }
        .consent-checkbox {
          margin-top: 2px;
          cursor: pointer;
          accent-color: #2874f0;
          width: 14px;
          height: 14px;
          flex-shrink: 0;
        }
        .consent-label {
          font-size: 11px;
          color: #475569;
          line-height: 1.35;
          cursor: pointer;
        }

        .disclaimer-text {
          font-size: 11px;
          color: #878787;
          line-height: 1.4;
          margin: 0;
        }
        .legal-link {
          color: #2874f0;
          font-weight: 500;
        }

        .auth-submit-btn {
          height: 44px;
          background: #fb641b;
          color: #ffffff;
          border: none;
          border-radius: 2px;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 0.5px;
          cursor: pointer;
          transition: background 0.2s;
          margin-top: 4px;
          box-shadow: 0 1px 2px 0 rgba(0,0,0,.2);
        }
        .auth-submit-btn:hover {
          background: #e65611;
        }
        .auth-submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .auth-footer-switch {
          margin-top: 24px;
          text-align: center;
        }
        .switch-account-text {
          font-size: 13px;
          color: #212121;
          font-weight: 500;
        }
        .accent-action {
          color: #2874f0;
          font-weight: 700;
          cursor: pointer;
        }
        .accent-action:hover {
          text-decoration: underline;
        }

        @media (max-width: 768px) {
          .auth-modal {
            max-width: 440px;
            border-radius: 8px;
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
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

