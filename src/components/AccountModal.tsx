"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { API_BASE } from "@/lib/api";

export default function AccountModal({ onClose }: { onClose: () => void }) {
  const { user, login, register, logout, requestOtp, loginWithOtp } = useApp();
  const [mode, setMode] = useState<"login" | "register" | "login-otp" | "verify-otp">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    fullName: "", email: "", password: "", phone: "", otp: ""
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    setForm({ ...form, [e.target.name]: e.target.value });
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
      if (ok) { onClose(); }
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
      <div className="auth-backdrop" onClick={onClose} />

      <div className="auth-modal">
        {/* Close Button */}
        <button onClick={onClose} className="auth-close-btn" aria-label="Close dialog">✕</button>

        {/* Left Column - Welcome Brand Banner */}
        <div className="auth-left-banner">
          <div>
            {user ? (
              <>
                <h2 className="banner-title">Welcome</h2>
                <p className="banner-subtitle">Glad to have you back at Medvastr!</p>
              </>
            ) : fpMode ? (
              <>
                <h2 className="banner-title">Password Reset</h2>
                <p className="banner-subtitle">Get secure access back to your account profile.</p>
              </>
            ) : mode === "login" || mode === "login-otp" || mode === "verify-otp" ? (
              <>
                <h2 className="banner-title">Login</h2>
                <p className="banner-subtitle">Get access to your Orders, Wishlist and Recommendations</p>
              </>
            ) : (
              <>
                <h2 className="banner-title">Looks like you're new here!</h2>
                <p className="banner-subtitle">Create an account to get started with Medvastr</p>
              </>
            )}
          </div>
          
          {/* Decorative Card */}
          <div className="banner-card-box">
            <div className="banner-tilted-card">
              <span className="card-brand-label">medvastr</span>
            </div>
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
              {error && (
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#dc2626', padding: '12px 16px', borderRadius: 8, fontSize: 13, marginBottom: 20 }}>⚠️ {error}</div>
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
                      {mode === 'login-otp' ? 'Email Address or Mobile Number' : 'Email Address'}
                    </label>
                    <input
                      name="email"
                      type={mode === 'login-otp' ? 'text' : 'email'}
                      placeholder={mode === 'login-otp' ? 'Enter Email or 10-digit Mobile' : 'Enter Email Address'}
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
                        <span onClick={() => { setFpMode(true); setFpEmail(form.email); setFpMsg(""); }} style={{ fontSize: 12, color: 'var(--accent-blue)', fontWeight: 600, cursor: 'pointer', zIndex: 10 }}>
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
                    <label className="underline-input-label">6-Digit Code</label>
                    <input name="otp" type="text" inputMode="numeric" placeholder="000000" maxLength={6} required value={form.otp} onChange={handleInputChange} className="underline-input" style={{ textAlign: 'center', fontSize: 24, letterSpacing: '8px' }} />
                    <SpamNote />
                  </div>
                )}

                {/* Terms Disclaimer */}
                <p style={{ fontSize: "12px", color: "var(--secondary-text)", lineHeight: "1.5", margin: 0 }}>
                  By continuing, you agree to Medvastr's <Link href="/terms" onClick={onClose} style={{ color: "var(--accent-blue)", fontWeight: 600 }}>Terms of Use</Link> and <Link href="/privacy" onClick={onClose} style={{ color: "var(--accent-blue)", fontWeight: 600 }}>Privacy Policy</Link>.
                </p>

                <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: 8 }}>
                  {loading ? 'Please wait...' : (mode === 'login' ? 'LOGIN' : mode === 'register' ? 'SIGN UP' : mode === 'login-otp' ? 'REQUEST OTP' : 'VERIFY & LOGIN')}
                </button>
              </form>

              {/* Divider */}
              {(mode === 'login' || mode === 'login-otp') && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0 0' }}>
                  <div style={{ flex: 1, height: 1, background: 'var(--border-color)' }} />
                  <span style={{ fontSize: 12, color: 'var(--secondary-text)', fontWeight: 600 }}>OR</span>
                  <div style={{ flex: 1, height: 1, background: 'var(--border-color)' }} />
                </div>
              )}

              {/* Bottom Switch Links */}
              <div className="auth-switch-links">
                {mode === 'login' && (
                  <>
                    <div>
                      <span onClick={() => switchMode('login-otp')} style={{ color: "var(--accent-blue)", fontWeight: 700, cursor: "pointer" }}>
                        📧 Continue with OTP (no password needed)
                      </span>
                    </div>
                    <div>New to Medvastr? <span onClick={() => switchMode('register')} style={{ color: "var(--accent-blue)", fontWeight: 700, cursor: "pointer" }}>Create an account</span></div>
                  </>
                )}
                {mode === 'login-otp' && (
                  <div>Prefer password? <span onClick={() => switchMode('login')} style={{ color: "var(--accent-blue)", fontWeight: 700, cursor: "pointer" }}>Sign In with Password</span></div>
                )}
                {mode === 'verify-otp' && (
                  <>
                    <div>Didn't receive code? <span onClick={() => switchMode('login-otp')} style={{ color: "var(--accent-blue)", fontWeight: 700, cursor: "pointer" }}>Try again</span></div>
                    <div>Wrong email? <span onClick={() => setMode('login-otp')} style={{ color: "var(--accent-blue)", fontWeight: 700, cursor: "pointer" }}>Change email</span></div>
                  </>
                )}
                {mode === 'register' && (
                  <div>Existing User? <span onClick={() => switchMode('login')} style={{ color: "var(--accent-blue)", fontWeight: 700, cursor: "pointer" }}>Log in</span></div>
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
          background: rgba(15, 23, 42, 0.45);
          backdrop-filter: blur(8px);
        }
        .auth-modal {
          position: relative;
          z-index: 10001;
          background: #ffffff;
          width: 100%;
          max-width: 780px;
          min-height: 540px;
          border-radius: 20px;
          display: flex;
          overflow: hidden;
          box-shadow: 0 40px 120px rgba(15, 23, 42, 0.25);
          animation: modalSlideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .auth-close-btn {
          position: absolute;
          top: 24px;
          right: 24px;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #f1f5f9;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          color: var(--secondary-text);
          z-index: 50;
          transition: background-color 0.2s;
        }
        .auth-close-btn:hover {
          background: #e2e8f0;
        }
        
        /* Left Column Branding */
        .auth-left-banner {
          width: 40%;
          background: linear-gradient(135deg, var(--light-blue) 0%, var(--secondary-blue) 100%);
          padding: 44px 32px;
          color: #ffffff;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
        }
        .banner-title {
          font-size: 30px;
          font-weight: 700;
          line-height: 1.2;
          color: #ffffff;
          margin-bottom: 12px;
        }
        .banner-subtitle {
          font-size: 14px;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.85);
        }
        .banner-card-box {
          display: flex;
          justify-content: center;
          align-items: center;
          margin-top: 40px;
        }
        .banner-tilted-card {
          width: 140px;
          height: 110px;
          background: #ffffff;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          transform: rotate(-8deg);
          box-shadow: 0 10px 25px rgba(32, 58, 95, 0.15);
        }
        .card-brand-label {
          font-size: 20px;
          font-weight: 900;
          color: var(--primary-navy);
          letter-spacing: -0.5px;
        }

        /* Right Column Form */
        .auth-right-form {
          width: 60%;
          padding: 56px 44px;
          display: flex;
          align-items: center;
          background: #ffffff;
        }
        .underline-input-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
          width: 100%;
        }
        .underline-input-label {
          font-size: 12px;
          font-weight: 700;
          color: var(--secondary-text);
        }
        .underline-input {
          height: auto !important;
          border: none !important;
          border-bottom: 1.5px solid var(--border-color) !important;
          border-radius: 0 !important;
          padding: 8px 0 !important;
          font-size: 15px !important;
          color: var(--dark-text) !important;
          background: transparent !important;
          outline: none !important;
          transition: border-color 0.2s !important;
          width: 100%;
        }
        .underline-input:focus {
          border-bottom-color: var(--accent-blue) !important;
        }
        .underline-input::placeholder {
          color: #cbd5e1;
        }
        
        .auth-switch-links {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 24px;
          font-size: 14px;
          color: var(--secondary-text);
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
            padding: 44px 28px;
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
