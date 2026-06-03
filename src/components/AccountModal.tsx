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
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    otp: ""
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
        ok = await register(form.firstName, form.lastName, form.email, form.password, form.phone);
      } else if (mode === "login-otp") {
        ok = await requestOtp(form.email);
        if (ok) {
          setMode("verify-otp");
          return; // Stay open, just switch mode
        }
      } else if (mode === "verify-otp") {
        ok = await loginWithOtp(form.email, form.otp);
      }

      if (ok) {
        onClose();
      } else {
        if (mode !== "login-otp") {
          setError("Invalid credentials or code. Please try again.");
        }
      }
    } catch (err) {
      setError("Something went wrong. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      {/* Blurred backdrop */}
      <div
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }}
        onClick={onClose}
      />

      <div
        className="acct-modal"
        style={{
          position: "relative",
          zIndex: 10001,
          background: "var(--wh)",
          width: "100%",
          maxWidth: 440,
          borderRadius: 28,
          padding: '44px 36px',
          boxShadow: "0 40px 120px rgba(0,0,0,0.35)",
          animation: 'modalSlideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <button
          onClick={onClose}
          style={{ position: "absolute", top: 20, right: 20, width: 32, height: 32, borderRadius: '50%', background: '#f5f5f5', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#666' }}
        >
          ✕
        </button>

        {user ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#f0f9f9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, margin: "0 auto 20px", color: '#008080', border: '2px solid #008080' }}>
              👤
            </div>
            <h2 style={{ fontFamily: "var(--serif)", fontSize: 26, marginBottom: 8 }}>Hi, {user.firstName}!</h2>
            <div style={{ fontSize: 13, color: "#999", marginBottom: 32 }}>{user.email}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <Link href="/my-orders" onClick={onClose} className="btn-p" style={{ width: "100%", height: 50, borderRadius: 12, justifyContent: "center", textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                View My Orders
              </Link>
              <button className="btn-o" style={{ width: "100%", height: 50, borderRadius: 12, border: '1px solid #eee' }} onClick={() => { logout(); onClose(); }}>
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          <div>
            <h2 style={{ fontFamily: "var(--serif)", fontSize: 28, marginBottom: 8, color: '#111' }}>
              {mode === 'login' ? 'Welcome Back' : mode === 'register' ? 'Get Started' : mode === 'login-otp' ? 'Login with Email' : 'Check Your Email'}
            </h2>
            <p style={{ fontSize: 14, color: "#666", marginBottom: 24 }}>
              {mode === 'login' ? 'Enter your details to sign in.' : mode === 'register' ? 'Create an account to track your orders.' : mode === 'login-otp' ? 'We will send a one-time code to your email.' : `Enter the 6-digit code sent to ${form.email}`}
            </p>

            {error && (
              <div style={{ background: '#fff5f5', color: '#e53e3e', padding: '12px 16px', borderRadius: 10, fontSize: 13, marginBottom: 20, border: '1px solid #fed7d7' }}>
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {mode === 'register' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="fg">
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", marginBottom: 6, color: '#666' }}>First Name</label>
                    <input name="firstName" autoComplete="given-name" required value={form.firstName} onChange={handleInputChange} style={{ height: 44, borderRadius: 8, padding: '0 12px', border: '1.5px solid #eee', width: '100%', fontSize: 14 }} />
                  </div>
                  <div className="fg">
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", marginBottom: 6, color: '#666' }}>Last Name</label>
                    <input name="lastName" autoComplete="family-name" required value={form.lastName} onChange={handleInputChange} style={{ height: 44, borderRadius: 8, padding: '0 12px', border: '1.5px solid #eee', width: '100%', fontSize: 14 }} />
                  </div>
                </div>
              )}

              {mode !== 'verify-otp' && (
                <div className="fg">
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", marginBottom: 6, color: '#666' }}>Email Address</label>
                  <input name="email" type="email" autoComplete="email" placeholder="name@example.com" required value={form.email} onChange={handleInputChange} style={{ height: 44, borderRadius: 8, padding: '0 12px', border: '1.5px solid #eee', width: '100%', fontSize: 14 }} />
                </div>
              )}

              {mode === 'register' && (
                <div className="fg">
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", marginBottom: 6, color: '#666' }}>Mobile Number</label>
                  <input name="phone" type="tel" autoComplete="tel" placeholder="+91" required value={form.phone} onChange={handleInputChange} style={{ height: 44, borderRadius: 8, padding: '0 12px', border: '1.5px solid #eee', width: '100%', fontSize: 14 }} />
                </div>
              )}

              {(mode === 'login' || mode === 'register') && (
                <div className="fg">
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", marginBottom: 6, color: '#666' }}>Password</label>
                  <input name="password" type="password" autoComplete={mode === 'login' ? "current-password" : "new-password"} placeholder="••••••••" required value={form.password} onChange={handleInputChange} style={{ height: 44, borderRadius: 8, padding: '0 12px', border: '1.5px solid #eee', width: '100%', fontSize: 14 }} />
                </div>
              )}

              {mode === 'verify-otp' && (
                <div className="fg">
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", marginBottom: 6, color: '#666' }}>6-Digit OTP</label>
                  <input name="otp" type="text" placeholder="123456" maxLength={6} required value={form.otp} onChange={handleInputChange} style={{ height: 44, borderRadius: 8, padding: '0 12px', border: '1.5px solid #eee', width: '100%', fontSize: 14, letterSpacing: '4px', textAlign: 'center' }} />
                </div>
              )}

              <button className="co-cta" type="submit" disabled={loading} style={{ height: 50, borderRadius: 10, background: '#008080', color: '#fff', fontSize: 15, fontWeight: 700, border: 'none', cursor: 'pointer', marginTop: 8 }}>
                {loading ? 'Processing...' : (mode === 'login' ? 'Sign In' : mode === 'register' ? 'Join Medvastr' : mode === 'login-otp' ? 'Send OTP' : 'Verify & Login')}
              </button>
            </form>

            <div style={{ textAlign: "center", marginTop: 24, fontSize: 13, color: "#888", display: 'flex', flexDirection: 'column', gap: 10 }}>
              {mode === 'login' && (
                <>
                  <div>New to Medvastr? <span onClick={() => { setMode('register'); setError(""); }} style={{ color: "#008080", fontWeight: 700, cursor: "pointer" }}>Join Now</span></div>
                  <div>Trouble logging in? <span onClick={() => { setMode('login-otp'); setError(""); }} style={{ color: "#008080", fontWeight: 700, cursor: "pointer" }}>Login via OTP</span></div>
                </>
              )}
              {mode === 'login-otp' && (
                <div>Prefer password? <span onClick={() => { setMode('login'); setError(""); }} style={{ color: "#008080", fontWeight: 700, cursor: "pointer" }}>Login with Password</span></div>
              )}
              {mode === 'verify-otp' && (
                <div>Didn't receive code? <span onClick={() => { setMode('login-otp'); setError(""); }} style={{ color: "#008080", fontWeight: 700, cursor: "pointer" }}>Try again</span></div>
              )}
              {mode === 'register' && (
                <div>Already have an account? <span onClick={() => { setMode('login'); setError(""); }} style={{ color: "#008080", fontWeight: 700, cursor: "pointer" }}>Sign In</span></div>
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
