"use client";

import React, { useState } from "react";

interface AccountModalProps {
  onClose: () => void;
  user: any;
  onLogin: (u: any) => void;
  onLogout: () => void;
}

export default function AccountModal({ onClose, user, onLogin, onLogout }: AccountModalProps) {
  const [em, setEm] = useState("");
  const [pw, setPw] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (em && pw) {
      onLogin({ name: em.split("@")[0], email: em });
      onClose();
    }
  };

  return (
    <div className={`drw-bg open`} onClick={onClose} style={{ zIndex: 2000 }}>
      <div
        className="acct-modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background: "var(--wh)",
          width: "100%",
          maxWidth: 420,
          borderRadius: 20,
          padding: 38,
          boxShadow: "var(--s4)",
          zIndex: 2001,
        }}
      >
        <button
          onClick={onClose}
          style={{ position: "absolute", top: 20, right: 20, fontSize: 18, color: "var(--lt)" }}
        >
          ✕
        </button>

        {user ? (
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: 70,
                height: 70,
                borderRadius: "50%",
                background: "var(--warm)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 32,
                margin: "0 auto 16px",
                border: "2.5px solid var(--t)",
              }}
            >
              👤
            </div>
            <h2 style={{ fontFamily: "var(--serif)", fontSize: 26, marginBottom: 4 }}>Welcome, {user.name}</h2>
            <div style={{ fontSize: 14, color: "var(--lt)", marginBottom: 28 }}>{user.email}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button className="btn-p" style={{ width: "100%", justifyContent: "center" }}>
                Order History
              </button>
              <button className="btn-o" style={{ width: "100%", justifyContent: "center" }} onClick={onLogout}>
                Logout
              </button>
            </div>
          </div>
        ) : (
          <div>
            <h2 style={{ fontFamily: "var(--serif)", fontSize: 28, marginBottom: 8 }}>Sign In</h2>
            <p style={{ fontSize: 14, color: "var(--lt)", marginBottom: 24 }}>Welcome back to the Medvastr community.</p>
            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>
                  Email Address
                </label>
                <input
                  className="price-inp"
                  type="email"
                  placeholder="doctor@hospital.com"
                  required
                  value={em}
                  onChange={(e) => setEm(e.target.value)}
                  style={{ height: 48 }}
                />
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>
                  Password
                </label>
                <input
                  className="price-inp"
                  type="password"
                  placeholder="••••••••"
                  required
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                  style={{ height: 48 }}
                />
              </div>
              <button className="co-cta" type="submit" style={{ marginTop: 0 }}>
                Sign In
              </button>
            </form>
            <div style={{ textAlign: "center", marginTop: 22, fontSize: 13, color: "var(--lt)" }}>
              Don't have an account?{" "}
              <span style={{ color: "var(--t)", fontWeight: 700, cursor: "pointer" }}>Join Now</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
