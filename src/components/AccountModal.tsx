"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";

export default function AccountModal({ onClose }: { onClose: () => void }) {
  const { user, login, register, logout, requestOtp, loginWithOtp } = useApp();
  const [mode, setMode] = useState<"login" | "register" | "login-otp" | "verify-otp">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", password: "", phone: "", otp: ""
  });

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
        if (form.password.length < 8) { setError("Password must be at least 8 characters."); return; }
        ok = await register(form.firstName, form.lastName, form.email, form.password, form.phone);
      } else if (mode === "login-otp") {
        ok = await requestOtp(form.email);
        if (ok) { setMode("verify-otp"); return; }
      } else if (mode === "verify-otp") {
        ok = await loginWithOtp(form.email, form.otp);
      }
      if (ok) { onClose(); }
      else { if (mode !== "login-otp") setError("Invalid credentials or code. Please try again."); }
    } catch { setError("Something went wrong. Please check your connection."); }
    finally { setLoading(false); }
  };

  // ── Forgot Password ────────────────────────────────────────────────────────
  const [fpMode, setFpMode] = useState(false);
  const [fpEmail, setFpEmail] = useState("");
  const [fpLoading, setFpLoading] = useState(false);
  const [fpMsg, setFpMsg] = useState("");

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fpEmail) { setFpMsg("Please enter your email."); return; }
    setFpLoading(true); setFpMsg("");
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "https://api.medvastr.com";
      await fetch(`${apiBase}/api/auth/forgot-password?email=${encodeURIComponent(fpEmail)}`, { method: "POST" });
      setFpMsg("✅ If this email is registered, a reset link has been sent. Please check your inbox.");
    } catch { setFpMsg("❌ Network error. Please try again."); }
    setFpLoading(false);
  };

  const switchMode = (m: typeof mode) => {
    setMode(m); setError("");
    setForm({ firstName: "", lastName: "", email: "", password: "", phone: "", otp: "" });
    setFpMode(false); setFpMsg("");
  };

  // ── Input style ────────────────────────────────────────────────────────────
  const inp: React.CSSProperties = {
    height: 44, borderRadius: 8, padding: '0 12px',
    border: '1.5px solid #eee', width: '100%', fontSize: 14,
    boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit'
  };

  const titles: Record<string, string> = {
    login: "Welcome Back", register: "Create Account",
    "login-otp": "Login with OTP", "verify-otp": "Check Your Email",
  };
  const subtitles: Record<string, string> = {
    login: "Sign in to your Medvastr account.",
    register: "Join Medvastr to track orders & more.",
    "login-otp": "We'll send a one-time code to your email.",
    "verify-otp": `Enter the 6-digit code sent to ${form.email}`,
  };

  const SpamNote = () => (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '10px 12px', fontSize: 12, color: '#92400e', marginTop: 4 }}>
      <span style={{ fontSize: 14, flexShrink: 0 }}>📬</span>
      <span>Didn't receive it? Please also check your <strong>Spam / Junk</strong> folder — emails sometimes land there.</span>
    </div>
  );

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      {/* Backdrop */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }} onClick={onClose} />

      <div style={{ position: "relative", zIndex: 10001, background: "white", width: "100%", maxWidth: 440, borderRadius: 28, padding: '44px 36px', boxShadow: "0 40px 120px rgba(0,0,0,0.35)", animation: 'modalSlideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)' }}>
        {/* Close */}
        <button onClick={onClose} style={{ position: "absolute", top: 20, right: 20, width: 32, height: 32, borderRadius: '50%', background: '#f5f5f5', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#666' }}>✕</button>

        {user ? (
          /* ── Logged in ─────────────────────────────────────────────── */
          <div style={{ textAlign: "center" }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#f0f9f9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, margin: "0 auto 20px", color: '#008080', border: '2px solid #008080' }}>👤</div>
            <h2 style={{ fontFamily: "serif", fontSize: 26, marginBottom: 8 }}>Hi, {user.firstName}!</h2>
            <div style={{ fontSize: 13, color: "#999", marginBottom: 32 }}>{user.email}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <Link href="/my-orders" onClick={onClose} style={{ width: "100%", height: 50, borderRadius: 12, background: '#008080', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', fontWeight: 700 }}>View My Orders</Link>
              <button style={{ width: "100%", height: 50, borderRadius: 12, border: '1.5px solid #eee', background: 'white', cursor: 'pointer', fontWeight: 600, fontSize: 14 }} onClick={() => { logout(); onClose(); }}>Sign Out</button>
            </div>
          </div>

        ) : fpMode ? (
          /* ── Forgot Password ────────────────────────────────────────── */
          <div>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🔑</div>
            <h2 style={{ fontFamily: "serif", fontSize: 26, marginBottom: 8, color: '#111' }}>Forgot Password?</h2>
            <p style={{ fontSize: 14, color: "#666", marginBottom: 24 }}>Enter your registered email address. We'll send you a secure password reset link.</p>

            {fpMsg && (
              <>
                <div style={{ background: fpMsg.startsWith('✅') ? '#f0fff4' : '#fff5f5', color: fpMsg.startsWith('✅') ? '#276749' : '#e53e3e', padding: '12px 16px', borderRadius: 10, fontSize: 13, marginBottom: 12, border: `1px solid ${fpMsg.startsWith('✅') ? '#9ae6b4' : '#fed7d7'}` }}>
                  {fpMsg}
                </div>
                {fpMsg.startsWith('✅') && <SpamNote />}
              </>
            )}

            {!fpMsg.startsWith('✅') && (
              <form onSubmit={handleForgotPassword} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", marginBottom: 6, color: '#666' }}>Email Address</label>
                  <input type="email" placeholder="name@example.com" required value={fpEmail} onChange={e => setFpEmail(e.target.value)} style={inp} />
                </div>
                <button type="submit" disabled={fpLoading} style={{ height: 50, borderRadius: 10, background: '#008080', color: '#fff', fontSize: 15, fontWeight: 700, border: 'none', cursor: fpLoading ? 'not-allowed' : 'pointer', marginTop: 8 }}>
                  {fpLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
            )}

            <div style={{ textAlign: "center", marginTop: 24, fontSize: 13 }}>
              <span onClick={() => { setFpMode(false); setFpEmail(""); setFpMsg(""); }} style={{ color: "#008080", fontWeight: 700, cursor: "pointer" }}>← Back to Sign In</span>
            </div>
          </div>

        ) : (
          /* ── Auth Forms ─────────────────────────────────────────────── */
          <div>
            <h2 style={{ fontFamily: "serif", fontSize: 28, marginBottom: 8, color: '#111' }}>{titles[mode]}</h2>
            <p style={{ fontSize: 14, color: "#666", marginBottom: 24 }}>{subtitles[mode]}</p>

            {error && (
              <div style={{ background: '#fff5f5', color: '#e53e3e', padding: '12px 16px', borderRadius: 10, fontSize: 13, marginBottom: 20, border: '1px solid #fed7d7' }}>⚠️ {error}</div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {mode === 'register' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", marginBottom: 6, color: '#666' }}>First Name</label>
                    <input name="firstName" autoComplete="given-name" required value={form.firstName} onChange={handleInputChange} style={inp} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", marginBottom: 6, color: '#666' }}>Last Name</label>
                    <input name="lastName" autoComplete="family-name" required value={form.lastName} onChange={handleInputChange} style={inp} />
                  </div>
                </div>
              )}

              {mode !== 'verify-otp' && (
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", marginBottom: 6, color: '#666' }}>Email Address</label>
                  <input name="email" type="email" autoComplete="email" placeholder="name@example.com" required value={form.email} onChange={handleInputChange} style={inp} />
                </div>
              )}

              {mode === 'register' && (
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", marginBottom: 6, color: '#666' }}>Mobile Number <span style={{ color: '#aaa', fontWeight: 400 }}>(optional)</span></label>
                  <input name="phone" type="tel" autoComplete="tel" placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={handleInputChange} style={inp} />
                </div>
              )}

              {(mode === 'login' || mode === 'register') && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: '#666' }}>Password</label>
                    {mode === 'login' && (
                      <span onClick={() => { setFpMode(true); setFpEmail(form.email); setFpMsg(""); }} style={{ fontSize: 12, color: '#008080', fontWeight: 600, cursor: 'pointer' }}>
                        Forgot Password?
                      </span>
                    )}
                  </div>
                  <input name="password" type="password" autoComplete={mode === 'login' ? "current-password" : "new-password"} placeholder="••••••••" required minLength={mode === 'register' ? 8 : undefined} value={form.password} onChange={handleInputChange} style={inp} />
                  {mode === 'register' && <div style={{ fontSize: 11, color: '#aaa', marginTop: 4 }}>Minimum 8 characters</div>}
                </div>
              )}

              {mode === 'verify-otp' && (
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", marginBottom: 6, color: '#666' }}>6-Digit Code</label>
                  <input name="otp" type="text" inputMode="numeric" placeholder="000000" maxLength={6} required value={form.otp} onChange={handleInputChange}
                    style={{ ...inp, height: 56, fontSize: 26, letterSpacing: '10px', textAlign: 'center' }} />
                  <div style={{ fontSize: 12, color: '#aaa', marginTop: 6, textAlign: 'center' }}>Code expires in 10 minutes</div>
                  <SpamNote />
                </div>
              )}

              <button type="submit" disabled={loading} style={{ height: 50, borderRadius: 10, background: '#008080', color: '#fff', fontSize: 15, fontWeight: 700, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', marginTop: 8, opacity: loading ? 0.8 : 1, transition: 'opacity 0.2s' }}>
                {loading ? 'Please wait...' : (mode === 'login' ? 'Sign In' : mode === 'register' ? 'Create Account' : mode === 'login-otp' ? 'Send OTP' : 'Verify & Login')}
              </button>
            </form>

            {/* Divider */}
            {(mode === 'login' || mode === 'login-otp') && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0 0' }}>
                <div style={{ flex: 1, height: 1, background: '#eee' }} />
                <span style={{ fontSize: 12, color: '#aaa' }}>OR</span>
                <div style={{ flex: 1, height: 1, background: '#eee' }} />
              </div>
            )}

            {/* Bottom links */}
            <div style={{ textAlign: "center", marginTop: 16, fontSize: 13, color: "#888", display: 'flex', flexDirection: 'column', gap: 10 }}>
              {mode === 'login' && (
                <>
                  <div>
                    <span onClick={() => switchMode('login-otp')} style={{ color: "#008080", fontWeight: 700, cursor: "pointer" }}>
                      📧 Continue with OTP (no password needed)
                    </span>
                  </div>
                  <div>New to Medvastr? <span onClick={() => switchMode('register')} style={{ color: "#008080", fontWeight: 700, cursor: "pointer" }}>Create Account</span></div>
                </>
              )}
              {mode === 'login-otp' && (
                <div>Prefer password? <span onClick={() => switchMode('login')} style={{ color: "#008080", fontWeight: 700, cursor: "pointer" }}>Sign In with Password</span></div>
              )}
              {mode === 'verify-otp' && (
                <>
                  <div>Didn't receive code? <span onClick={() => switchMode('login-otp')} style={{ color: "#008080", fontWeight: 700, cursor: "pointer" }}>Try again</span></div>
                  <div>Wrong email? <span onClick={() => setMode('login-otp')} style={{ color: "#008080", fontWeight: 700, cursor: "pointer" }}>Change email</span></div>
                </>
              )}
              {mode === 'register' && (
                <div>Already have an account? <span onClick={() => switchMode('login')} style={{ color: "#008080", fontWeight: 700, cursor: "pointer" }}>Sign In</span></div>
              )}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes modalSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
