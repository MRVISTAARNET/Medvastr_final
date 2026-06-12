"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://api.medvastr.com";

function ResetPasswordContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token");

    const [status, setStatus] = useState<"idle" | "validating" | "valid" | "invalid" | "submitting" | "success" | "error">("validating");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");

    // Validate token on load
    useEffect(() => {
        if (!token) { setStatus("invalid"); setMessage("No reset token found. Please request a new password reset link."); return; }
        fetch(`${API_BASE}/api/auth/reset-password/validate?token=${encodeURIComponent(token)}`)
            .then(r => r.json())
            .then(data => {
                if (data.success && data.data === true) { setStatus("valid"); }
                else { setStatus("invalid"); setMessage("This link has expired or is invalid. Please request a new one."); }
            })
            .catch(() => { setStatus("invalid"); setMessage("Could not validate the link. Please try again."); });
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword.length < 8) { setMessage("Password must be at least 8 characters."); return; }
        if (newPassword !== confirmPassword) { setMessage("Passwords do not match."); return; }
        setStatus("submitting");
        setMessage("");
        try {
            const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, newPassword }),
            });
            const data = await res.json();
            if (data.success) {
                setStatus("success");
                setTimeout(() => router.push("/"), 3000);
            } else {
                setStatus("error");
                setMessage(data.message || "Failed to reset password. The link may have expired.");
            }
        } catch {
            setStatus("error");
            setMessage("Network error. Please check your connection and try again.");
        }
    };

    const inp: React.CSSProperties = {
        height: 48, borderRadius: 10, padding: "0 14px",
        border: "1.5px solid #e2e8f0", width: "100%",
        fontSize: 15, boxSizing: "border-box", outline: "none",
        fontFamily: "inherit", transition: "border-color 0.2s",
    };

    return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #f0f9f9 0%, #e8f4f4 100%)", padding: "20px" }}>
            <div style={{ width: "100%", maxWidth: 440, background: "white", borderRadius: 24, padding: "48px 40px", boxShadow: "0 20px 80px rgba(0,80,80,0.12)" }}>

                {/* Logo */}
                <div style={{ textAlign: "center", marginBottom: 32 }}>
                    <Link href="/" style={{ textDecoration: "none" }}>
                        <div style={{ fontSize: 24, fontWeight: 800, color: "#008080", letterSpacing: "-0.5px" }}>
                            Med<span style={{ color: "#111" }}>vastr</span>
                        </div>
                    </Link>
                </div>

                {/* Validating */}
                {status === "validating" && (
                    <div style={{ textAlign: "center", padding: "20px 0" }}>
                        <div style={{ fontSize: 40, marginBottom: 16 }}>🔄</div>
                        <div style={{ fontSize: 16, color: "#666" }}>Validating your reset link...</div>
                    </div>
                )}

                {/* Invalid / Expired */}
                {status === "invalid" && (
                    <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 48, marginBottom: 16 }}>⛔</div>
                        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#111", marginBottom: 10 }}>Link Expired or Invalid</h1>
                        <p style={{ fontSize: 14, color: "#666", marginBottom: 28, lineHeight: 1.6 }}>{message}</p>
                        <Link href="/" style={{ display: "inline-block", background: "#008080", color: "white", padding: "12px 28px", borderRadius: 10, fontWeight: 700, textDecoration: "none", fontSize: 14 }}>
                            Go to Homepage
                        </Link>
                    </div>
                )}

                {/* Valid — Show Form */}
                {(status === "valid" || status === "submitting" || status === "error") && (
                    <div>
                        <div style={{ textAlign: "center", marginBottom: 28 }}>
                            <div style={{ fontSize: 44, marginBottom: 12 }}>🔐</div>
                            <h1 style={{ fontSize: 24, fontWeight: 700, color: "#111", marginBottom: 8 }}>Set New Password</h1>
                            <p style={{ fontSize: 14, color: "#666" }}>Choose a strong password for your account.</p>
                        </div>

                        {message && (
                            <div style={{ background: "#fff5f5", color: "#c53030", padding: "12px 16px", borderRadius: 10, fontSize: 13, marginBottom: 20, border: "1px solid #fed7d7" }}>
                                ⚠️ {message}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                            <div>
                                <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "#666", marginBottom: 7 }}>New Password</label>
                                <input type="password" placeholder="Minimum 8 characters" required minLength={8} value={newPassword} onChange={e => { setNewPassword(e.target.value); setMessage(""); }} style={inp} />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "#666", marginBottom: 7 }}>Confirm Password</label>
                                <input type="password" placeholder="Re-enter your password" required value={confirmPassword} onChange={e => { setConfirmPassword(e.target.value); setMessage(""); }} style={inp} />
                                {confirmPassword && newPassword !== confirmPassword && (
                                    <div style={{ fontSize: 12, color: "#e53e3e", marginTop: 4 }}>Passwords do not match</div>
                                )}
                                {confirmPassword && newPassword === confirmPassword && newPassword.length >= 8 && (
                                    <div style={{ fontSize: 12, color: "#38a169", marginTop: 4 }}>✅ Passwords match</div>
                                )}
                            </div>

                            <button type="submit" disabled={status === "submitting"} style={{ height: 50, borderRadius: 12, background: "#008080", color: "white", fontSize: 15, fontWeight: 700, border: "none", cursor: status === "submitting" ? "not-allowed" : "pointer", opacity: status === "submitting" ? 0.8 : 1, marginTop: 4 }}>
                                {status === "submitting" ? "Updating Password..." : "Reset Password"}
                            </button>
                        </form>

                        <div style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "#888" }}>
                            <Link href="/" style={{ color: "#008080", fontWeight: 600, textDecoration: "none" }}>← Back to Homepage</Link>
                        </div>
                    </div>
                )}

                {/* Success */}
                {status === "success" && (
                    <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 60, marginBottom: 16 }}>✅</div>
                        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#111", marginBottom: 10 }}>Password Updated!</h1>
                        <p style={{ fontSize: 14, color: "#666", marginBottom: 28, lineHeight: 1.6 }}>
                            Your password has been successfully reset. You will be redirected to the homepage in a few seconds where you can sign in.
                        </p>
                        <Link href="/" style={{ display: "inline-block", background: "#008080", color: "white", padding: "12px 28px", borderRadius: 10, fontWeight: 700, textDecoration: "none", fontSize: 14 }}>
                            Go to Homepage →
                        </Link>
                    </div>
                )}

            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ fontSize: 16, color: "#666" }}>Loading...</div>
            </div>
        }>
            <ResetPasswordContent />
        </Suspense>
    );
}
