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
            <p className="banner-subtitle">Premium Medical Scrubs & Accessories</p>

            {/* Benefit Highlights */}
            <div className="banner-benefits">
              <div className="benefit-item">
                <span className="benefit-icon">🎁</span>
                <span><strong>10% OFF</strong> on Your 1st Order</span>
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
            Medvarn • Designed for Healthcare Professionals
          </div>
        </div>

        {/* Right Column - Forms Panel */}
        <div className="auth-right-form">
          {user ? (
            /* Logged in Panel */
            <div style={{ textAlign: "center", width: "100%" }}>
              <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#f0f4f8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, margin: "0 auto 20px", color: 'var(--primary-navy)', border: '2px solid var(--primary-navy)' }}>👤</div>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--primary-navy)', marginBottom: 8 }}>Hi, {user.firstName || 'Customer'}!</h2>
              <div style={{ fontSize: 14, color: "var(--secondary-text)", marginBottom: 32 }}>{user.email}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <Link href="/account" onClick={onClose} className="btn-primary" style={{ width: "100%", height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>My Account Dashboard</Link>
                <button className="btn-secondary" style={{ width: "100%", height: 48 }} onClick={() => { logout(); onClose(); }}>Sign Out</button>
              </div>
            </div>
          ) : fpMode ? (
            /* Forgot Password Panel */
            <div style={{ width: "100%" }}>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--primary-navy)', marginBottom: 8 }}>Forgot Password?</h2>
              <p style={{ fontSize: 14, color: "var(--secondary-text)", marginBottom: 24 }}>Enter your registered email address below. We'll email you a password reset link.</p>

              {fpMsg && (
                <div style={{ background: fpMsg.startsWith('✅') ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: fpMsg.startsWith('✅') ? '#16a34a' : '#dc2626', padding: '12px 16px', borderRadius: 8, fontSize: 13, marginBottom: 16, border: '1.5px solid transparent' }}>
                  {fpMsg}
                </div>
              )}

              {!fpMsg.startsWith('✅') && (
                <form onSubmit={handleForgotPassword} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div className="underline-input-group">
                    <label className="underline-input-label">Email Address</label>
                    <input type="email" placeholder="Enter Email Address" required value={fpEmail} onChange={e => setFpEmail(e.target.value)} className="underline-input" />
                  </div>
                  <button type="submit" disabled={fpLoading} className="btn-primary" style={{ marginTop: 12 }}>
                    {fpLoading ? 'Sending...' : 'Send Reset Link'}
                  </button>
                </form>
              )}

              <div style={{ textAlign: "center", marginTop: 24, fontSize: 14 }}>
                <span onClick={() => { setFpMode(false); setFpEmail(""); setFpMsg(""); }} style={{ color: "var(--accent-blue)", fontWeight: 700, cursor: "pointer" }}>← Back to Sign In</span>
              </div>
            </div>
          ) : (
            /* Login & Sign Up Forms */
            <div style={{ width: "100%" }}>
              {/* 🎁 10% OFF Welcome Promo Banner */}
              <div style={{
                background: 'linear-gradient(135deg, #0f2942 0%, #008080 100%)',
                color: '#ffffff',
                padding: '14px 18px',
                borderRadius: '14px',
                marginBottom: '22px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                boxShadow: '0 6px 18px rgba(15, 41, 66, 0.15)'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '0.3px', textTransform: 'uppercase' }}>
                    🎉 CLAIM 10% OFF YOUR FIRST ORDER!
                  </div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.9)', marginTop: '2px' }}>
                    Sign in or enter mobile number to apply discount
                  </div>
                </div>
                <span style={{
                  background: '#fef3c7',
                  color: '#92400e',
                  fontWeight: 800,
                  fontSize: '12px',
                  padding: '5px 10px',
                  borderRadius: '6px',
                  letterSpacing: '0.8px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                  whiteSpace: 'nowrap'
                }}>
                  WELCOME10
                </span>
              </div>

              {error && (
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#dc2626', padding: '12px 16px', borderRadius: 10, fontSize: 13, marginBottom: 20 }}>⚠️ {error}</div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {mode === 'register' && (
                  <div className="underline-input-group">
                    <label className="underline-input-label">Full Name</label>
                    <input name="fullName" type="text" placeholder="Enter Full Name" required value={form.fullName} onChange={handleInputChange} className="underline-input" />
                  </div>
                )}

                {mode !== 'verify-otp' && (
                  <div className="underline-input-group">
                    <label className="underline-input-label">
                      {mode === 'login' || mode === 'login-otp' ? 'Mobile Number or Email Address' : 'Email Address'}
                    </label>
                    <input
                      name="email"
                      type="text"
                      placeholder={mode === 'login' || mode === 'login-otp' ? 'Enter 10-digit Mobile or Email' : 'Enter Email Address'}
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
                        <span onClick={() => { setFpMode(true); setFpEmail(form.email); setFpMsg(""); }} style={{ fontSize: 12, color: '#008080', fontWeight: 600, cursor: 'pointer', zIndex: 10 }}>
                          Forgot Password?
                        </span>
                      )}
                    </div>
                    <input name="password" type={showPassword ? "text" : "password"} placeholder="Enter Password" required minLength={mode === 'register' ? 8 : undefined} value={form.password} onChange={handleInputChange} className="underline-input" style={{ paddingRight: '40px' }} />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ position: 'absolute', right: '0', bottom: '10px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', opacity: showPassword ? 1 : 0.4, transition: 'opacity 0.2s', zIndex: 10 }}
                    >
                      👁️
                    </button>
                  </div>
                )}

                {mode === 'verify-otp' && (
                  <div className="underline-input-group">
                    <label className="underline-input-label">6-Digit Verification Code</label>
                    <input name="otp" type="text" inputMode="numeric" placeholder="000000" maxLength={6} required value={form.otp} onChange={handleInputChange} className="underline-input" style={{ textAlign: 'center', fontSize: 24, letterSpacing: '8px' }} />
                    <SpamNote />
                  </div>
                )}

                {/* 📱 Call & WhatsApp Consent Checkbox */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', background: '#f8fafc', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <input
                    type="checkbox"
                    id="callConsent"
                    checked={callConsent}
                    onChange={(e) => setCallConsent(e.target.checked)}
                    style={{ marginTop: '2px', cursor: 'pointer', width: '16px', height: '16px', accentColor: '#008080' }}
                  />
                  <label htmlFor="callConsent" style={{ fontSize: '12px', color: '#475569', lineHeight: '1.45', cursor: 'pointer' }}>
                    I agree to receive order updates, sizing guidance, and special offer alerts via <strong>Call & WhatsApp</strong>.
                  </label>
                </div>

                {/* Terms Disclaimer */}
                <p style={{ fontSize: "12px", color: "#64748b", lineHeight: "1.5", margin: 0 }}>
                  By continuing, you agree to Medvarn's <Link href="/terms" onClick={onClose} style={{ color: "#008080", fontWeight: 600 }}>Terms of Use</Link> and <Link href="/privacy" onClick={onClose} style={{ color: "#008080", fontWeight: 600 }}>Privacy Policy</Link>.
                </p>

                <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: 8, height: '46px', fontSize: '14px', fontWeight: 700, letterSpacing: '0.5px', background: '#0f2942', borderRadius: '10px', cursor: 'pointer' }}>
                  {loading ? 'Please wait...' : (mode === 'login' ? 'LOGIN WITH PASSWORD' : mode === 'register' ? 'CREATE ACCOUNT & CLAIM 10%' : mode === 'login-otp' ? 'REQUEST OTP & CLAIM 10% OFF' : 'VERIFY & LOGIN')}
                </button>
              </form>

              {/* Divider */}
              {(mode === 'login' || mode === 'login-otp') && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '22px 0 16px' }}>
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
                      <span onClick={() => switchMode('login')} style={{ color: "#008080", fontWeight: 700, cursor: "pointer" }}>
                        🔑 Prefer Password? Sign In with Password
                      </span>
                    </div>
                    <div>New to Medvarn? <span onClick={() => switchMode('register')} style={{ color: "#008080", fontWeight: 700, cursor: "pointer" }}>Create an account</span></div>
                  </>
                )}
                {mode === 'login' && (
                  <>
                    <div>
                      <span onClick={() => switchMode('login-otp')} style={{ color: "#008080", fontWeight: 700, cursor: "pointer" }}>
                        📱 Continue with Mobile OTP (Fast & Easy)
                      </span>
                    </div>
                    <div>New to Medvarn? <span onClick={() => switchMode('register')} style={{ color: "#008080", fontWeight: 700, cursor: "pointer" }}>Create an account</span></div>
                  </>
                )}
                {mode === 'verify-otp' && (
                  <>
                    <div>Didn't receive code? <span onClick={() => switchMode('login-otp')} style={{ color: "#008080", fontWeight: 700, cursor: "pointer" }}>Try again</span></div>
                    <div>Wrong mobile/email? <span onClick={() => setMode('login-otp')} style={{ color: "#008080", fontWeight: 700, cursor: "pointer" }}>Change mobile</span></div>
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
          padding: 20px;
        }
        .auth-backdrop {
          position: absolute;
          inset: 0;
          background: rgba(15, 23, 42, 0.55);
          backdrop-filter: blur(8px);
        }
        .auth-modal {
          position: relative;
          z-index: 10001;
          background: #ffffff;
          width: 100%;
          max-width: 720px;
          max-height: 90vh;
          border-radius: 20px;
          display: flex;
          overflow-y: auto;
          overflow-x: hidden;
          box-shadow: 0 35px 100px rgba(15, 23, 42, 0.3);
          animation: modalSlideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .auth-close-btn {
          position: absolute;
          top: 18px;
          right: 18px;
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: #f1f5f9;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 15px;
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
          width: 38%;
          background: linear-gradient(160deg, #0f2942 0%, #1e3a5f 100%);
          padding: 40px 28px;
          color: #ffffff;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
        }
        .banner-title {
          font-size: 26px;
          font-weight: 800;
          line-height: 1.25;
          color: #ffffff;
          margin-bottom: 6px;
          letter-spacing: -0.5px;
        }
        .banner-subtitle {
          font-size: 13px;
          line-height: 1.5;
          color: rgba(255, 255, 255, 0.85);
          margin-bottom: 24px;
        }
        .banner-benefits {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-top: 10px;
        }
        .benefit-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          color: rgba(255, 255, 255, 0.95);
          line-height: 1.4;
        }
        .benefit-icon {
          font-size: 18px;
          flex-shrink: 0;
        }
        .banner-footer-note {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.6);
          letter-spacing: 0.3px;
          text-transform: uppercase;
          font-weight: 600;
          margin-top: 24px;
        }

        /* Right Column Form */
        .auth-right-form {
          width: 62%;
          padding: 40px 34px;
          display: flex;
          align-items: center;
          background: #ffffff;
        }
        .underline-input-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
          width: 100%;
        }
        .underline-input-label {
          font-size: 12px;
          font-weight: 700;
          color: #475569;
        }
        .underline-input {
          height: auto !important;
          border: none !important;
          border-bottom: 1.5px solid #cbd5e1 !important;
          border-radius: 0 !important;
          padding: 8px 0 !important;
          font-size: 15px !important;
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
          gap: 10px;
          font-size: 13px;
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
            padding: 32px 24px;
          }
        }

        @keyframes modalSlideUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
