'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { API_BASE } from '@/lib/api';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) { setMessage('Please enter your email address.'); setStatus('error'); return; }
        setStatus('loading');
        setMessage('');

        try {
            const res = await fetch(
                `${API_BASE}/auth/forgot-password?email=${encodeURIComponent(email)}`,
                { method: 'POST' }
            );
            const data = await res.json();
            setMessage(data.message || 'If this email is registered you will receive a reset link shortly.');
            setStatus('sent');
        } catch {
            setMessage('Something went wrong. Please try again.');
            setStatus('error');
        }
    };

    return (
        <>
            <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        body{background:linear-gradient(135deg,#0f1928 0%,#1a2b4a 100%);min-height:100vh;font-family:'Segoe UI',Arial,sans-serif}
        .fp-wrap{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px}
        .fp-card{background:rgba(255,255,255,.05);backdrop-filter:blur(18px);border:1px solid rgba(255,255,255,.1);
                 border-radius:20px;padding:48px 40px;width:100%;max-width:420px;box-shadow:0 24px 64px rgba(0,0,0,.5)}
        .fp-logo{font-size:22px;font-weight:800;color:#fff;letter-spacing:1px;text-align:center;margin-bottom:6px}
        .fp-logo span{color:#5b8cff}
        .fp-title{font-size:20px;font-weight:700;color:#fff;text-align:center;margin-bottom:8px}
        .fp-sub{font-size:13px;color:#a0b4d6;text-align:center;margin-bottom:32px;line-height:1.6}
        .fp-field{display:flex;flex-direction:column;gap:6px;margin-bottom:20px}
        .fp-field label{font-size:13px;color:#a0b4d6;font-weight:600}
        .fp-field input{padding:12px 16px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.15);
                        border-radius:10px;color:#fff;font-size:15px;outline:none;transition:border .2s}
        .fp-field input:focus{border-color:#5b8cff}
        .fp-field input::placeholder{color:rgba(255,255,255,.3)}
        .fp-btn{width:100%;padding:13px;background:linear-gradient(135deg,#1a2b4a,#2d4d8e);border:none;
                border-radius:10px;color:#fff;font-size:15px;font-weight:700;cursor:pointer;
                transition:opacity .2s,transform .15s;letter-spacing:.5px}
        .fp-btn:hover:not(:disabled){opacity:.9;transform:translateY(-1px)}
        .fp-btn:disabled{opacity:.6;cursor:not-allowed}
        .fp-msg{padding:12px 16px;border-radius:10px;font-size:14px;margin-bottom:20px;text-align:center}
        .fp-msg.success{background:rgba(91,140,255,.15);border:1px solid rgba(91,140,255,.3);color:#a0c4ff}
        .fp-msg.error{background:rgba(255,80,80,.12);border:1px solid rgba(255,80,80,.25);color:#ffaaaa}
        .fp-back{text-align:center;margin-top:20px;font-size:13px;color:#a0b4d6}
        .fp-back a{color:#5b8cff;text-decoration:none;font-weight:600}
        .fp-back a:hover{text-decoration:underline}
        .fp-icon{font-size:44px;text-align:center;margin-bottom:16px}
      `}</style>

            <div className="fp-wrap">
                <div className="fp-card">
                    <div className="fp-logo">Medva<span>str</span></div>
                    <div className="fp-icon">🔐</div>
                    <div className="fp-title">Forgot Password?</div>
                    <div className="fp-sub">
                        Enter your registered email address and we&apos;ll send you<br />
                        a secure link to reset your password.
                    </div>

                    {message && (
                        <div className={`fp-msg ${status === 'sent' ? 'success' : 'error'}`}>
                            {status === 'sent' ? '✅ ' : '⚠️ '}{message}
                        </div>
                    )}

                    {status !== 'sent' && (
                        <form onSubmit={handleSubmit}>
                            <div className="fp-field">
                                <label>Email Address</label>
                                <input
                                    type="email"
                                    placeholder="admin@medvastr.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    autoComplete="email"
                                />
                            </div>
                            <button className="fp-btn" type="submit" disabled={status === 'loading'}>
                                {status === 'loading' ? 'Sending...' : 'Send Reset Link'}
                            </button>
                        </form>
                    )}

                    <div className="fp-back">
                        <Link href="/admin/login">← Back to Login</Link>
                    </div>
                </div>
            </div>
        </>
    );
}
