'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { API_BASE } from '@/lib/api';

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token') ?? '';

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPwd, setShowPwd] = useState(false);
    const [status, setStatus] = useState<'validating' | 'valid' | 'invalid' | 'loading' | 'success' | 'error'>('validating');
    const [message, setMessage] = useState('');

    // Validate the token as soon as the page loads
    useEffect(() => {
        if (!token) { setStatus('invalid'); setMessage('No reset token found. Please request a new link.'); return; }

        fetch(`${API_BASE}/auth/reset-password/validate?token=${encodeURIComponent(token)}`)
            .then(r => r.json())
            .then(data => {
                if (data.data === true) setStatus('valid');
                else { setStatus('invalid'); setMessage('This reset link is invalid or has expired. Please request a new one.'); }
            })
            .catch(() => { setStatus('invalid'); setMessage('Could not validate the link. Please try again.'); });
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword.length < 6) { setMessage('Password must be at least 6 characters.'); setStatus('error'); return; }
        if (newPassword !== confirmPassword) { setMessage('Passwords do not match.'); setStatus('error'); return; }

        setStatus('loading');
        setMessage('');

        try {
            const res = await fetch(`${API_BASE}/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword }),
            });
            const data = await res.json();
            if (data.success) {
                setStatus('success');
                setMessage(data.message || 'Password updated! Redirecting to login…');
                setTimeout(() => router.push('/admin/login'), 2500);
            } else {
                setStatus('error');
                setMessage(data.message || 'Something went wrong. Please try again.');
            }
        } catch {
            setStatus('error');
            setMessage('Connection failed. Please try again.');
        }
    };

    return (
        <>
            <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        body{background:linear-gradient(135deg,#0f1928 0%,#1a2b4a 100%);min-height:100vh;font-family:'Segoe UI',Arial,sans-serif}
        .rp-wrap{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px}
        .rp-card{background:rgba(255,255,255,.05);backdrop-filter:blur(18px);border:1px solid rgba(255,255,255,.1);
                 border-radius:20px;padding:48px 40px;width:100%;max-width:430px;box-shadow:0 24px 64px rgba(0,0,0,.5)}
        .rp-logo{font-size:22px;font-weight:800;color:#fff;letter-spacing:1px;text-align:center;margin-bottom:6px}
        .rp-logo span{color:#5b8cff}
        .rp-icon{font-size:44px;text-align:center;margin-bottom:12px}
        .rp-title{font-size:20px;font-weight:700;color:#fff;text-align:center;margin-bottom:8px}
        .rp-sub{font-size:13px;color:#a0b4d6;text-align:center;margin-bottom:28px;line-height:1.6}
        .rp-field{display:flex;flex-direction:column;gap:6px;margin-bottom:18px;position:relative}
        .rp-field label{font-size:13px;color:#a0b4d6;font-weight:600}
        .rp-field input{padding:12px 44px 12px 16px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.15);
                        border-radius:10px;color:#fff;font-size:15px;outline:none;transition:border .2s;width:100%}
        .rp-field input:focus{border-color:#5b8cff}
        .rp-field input::placeholder{color:rgba(255,255,255,.3)}
        .toggle-eye{position:absolute;right:14px;top:36px;cursor:pointer;font-size:18px;user-select:none;color:#a0b4d6}
        .rp-btn{width:100%;padding:13px;background:linear-gradient(135deg,#1a2b4a,#2d4d8e);border:none;
                border-radius:10px;color:#fff;font-size:15px;font-weight:700;cursor:pointer;
                transition:opacity .2s,transform .15s;letter-spacing:.5px}
        .rp-btn:hover:not(:disabled){opacity:.9;transform:translateY(-1px)}
        .rp-btn:disabled{opacity:.6;cursor:not-allowed}
        .rp-msg{padding:12px 16px;border-radius:10px;font-size:14px;margin-bottom:18px;text-align:center;line-height:1.5}
        .rp-msg.success{background:rgba(91,140,255,.15);border:1px solid rgba(91,140,255,.3);color:#a0c4ff}
        .rp-msg.error{background:rgba(255,80,80,.12);border:1px solid rgba(255,80,80,.25);color:#ffaaaa}
        .rp-msg.warning{background:rgba(255,180,0,.1);border:1px solid rgba(255,180,0,.25);color:#ffd466}
        .rp-back{text-align:center;margin-top:20px;font-size:13px;color:#a0b4d6}
        .rp-back a{color:#5b8cff;text-decoration:none;font-weight:600}
        .rp-back a:hover{text-decoration:underline}
        .strength-bar{height:4px;border-radius:2px;margin-top:6px;transition:width .3s,background .3s}
        .strength-label{font-size:11px;margin-top:3px}
      `}</style>

            <div className="rp-wrap">
                <div className="rp-card">
                    <div className="rp-logo">Medva<span>str</span></div>
                    <div className="rp-icon">🔑</div>
                    <div className="rp-title">Set New Password</div>
                    <div className="rp-sub">Choose a strong password — at least 6 characters,<br />mix of letters, numbers &amp; symbols.</div>

                    {/* Validating spinner */}
                    {status === 'validating' && (
                        <div className="rp-msg warning">⏳ Validating your reset link…</div>
                    )}

                    {/* Invalid token */}
                    {status === 'invalid' && (
                        <>
                            <div className="rp-msg error">❌ {message}</div>
                            <div className="rp-back">
                                <Link href="/forgot-password">Request a new reset link</Link>
                            </div>
                        </>
                    )}

                    {/* Success */}
                    {status === 'success' && (
                        <div className="rp-msg success">✅ {message}</div>
                    )}

                    {/* Error on submit */}
                    {status === 'error' && message && (
                        <div className="rp-msg error">⚠️ {message}</div>
                    )}

                    {/* Form — shown when token is valid or submit errored */}
                    {(status === 'valid' || status === 'loading' || status === 'error') && (
                        <form onSubmit={handleSubmit}>
                            <div className="rp-field">
                                <label>New Password</label>
                                <input
                                    type={showPwd ? 'text' : 'password'}
                                    placeholder="Enter new password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    autoComplete="new-password"
                                />
                                <span className="toggle-eye" onClick={() => setShowPwd(!showPwd)}>
                                    {showPwd ? '🙈' : '👁️'}
                                </span>
                                {/* Strength indicator */}
                                {newPassword && (() => {
                                    const strength = newPassword.length >= 12 && /[!@#$%^&*]/.test(newPassword) ? 'strong'
                                        : newPassword.length >= 8 ? 'medium' : 'weak';
                                    const colour = strength === 'strong' ? '#4caf50' : strength === 'medium' ? '#ff9800' : '#f44336';
                                    const width = strength === 'strong' ? '100%' : strength === 'medium' ? '66%' : '33%';
                                    return (
                                        <>
                                            <div className="strength-bar" style={{ width, background: colour }} />
                                            <span className="strength-label" style={{ color: colour }}>
                                                {strength === 'strong' ? '💪 Strong' : strength === 'medium' ? '👌 Medium' : '⚠️ Weak'}
                                            </span>
                                        </>
                                    );
                                })()}
                            </div>

                            <div className="rp-field">
                                <label>Confirm Password</label>
                                <input
                                    type={showPwd ? 'text' : 'password'}
                                    placeholder="Re-enter new password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    autoComplete="new-password"
                                />
                                {confirmPassword && newPassword !== confirmPassword && (
                                    <span style={{ fontSize: '12px', color: '#f44336', marginTop: '4px' }}>
                                        ❌ Passwords don&apos;t match
                                    </span>
                                )}
                                {confirmPassword && newPassword === confirmPassword && (
                                    <span style={{ fontSize: '12px', color: '#4caf50', marginTop: '4px' }}>
                                        ✅ Passwords match
                                    </span>
                                )}
                            </div>

                            <button className="rp-btn" type="submit" disabled={status === 'loading'}>
                                {status === 'loading' ? 'Updating Password…' : 'Update Password'}
                            </button>
                        </form>
                    )}

                    <div className="rp-back">
                        <Link href="/admin/login">← Back to Login</Link>
                    </div>
                </div>
            </div>
        </>
    );
}

// Wrap in Suspense because useSearchParams() requires it in Next.js 13+
export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div style={{
                minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'linear-gradient(135deg,#0f1928,#1a2b4a)', color: '#fff', fontSize: '18px'
            }}>
                Loading…
            </div>
        }>
            <ResetPasswordForm />
        </Suspense>
    );
}
