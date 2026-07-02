'use client';
import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { API_BASE } from '@/lib/api';

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token') ?? '';

    useEffect(() => {
        document.title = "Reset Password | Medvastr";
    }, []);

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [status, setStatus] = useState<'valid' | 'invalid' | 'loading' | 'success' | 'error'>('valid');
    const [message, setMessage] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword.length < 6) { setMessage('Password too short.'); setStatus('error'); return; }
        if (newPassword !== confirmPassword) { setMessage('Passwords mismatch.'); setStatus('error'); return; }

        setStatus('loading');
        try {
            const res = await fetch(`${API_BASE}/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword }),
            });
            const data = await res.json();
            if (data.success) {
                setStatus('success');
                setTimeout(() => router.push('/'), 2000);
            } else {
                setStatus('error');
                setMessage(data.message || 'Error occurred.');
            }
        } catch {
            setStatus('error');
            setMessage('Connection failed.');
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: 'white', fontFamily: 'sans-serif', padding: '20px' }}>
            <div style={{ background: '#1e293b', padding: '40px', borderRadius: '20px', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
                <h1 style={{ marginBottom: '20px' }}>Reset Password</h1>
                {!token && <p style={{ color: '#ef4444' }}>No token found in link.</p>}

                {status === 'success' ? (
                    <p style={{ color: '#22c55e' }}>Password updated! Redirecting...</p>
                ) : (
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ position: 'relative', width: '100%' }}>
                            <input 
                                type={showNewPassword ? 'text' : 'password'} 
                                placeholder="New Password" 
                                value={newPassword} 
                                onChange={e => setNewPassword(e.target.value)} 
                                style={{ padding: '12px', paddingRight: '40px', borderRadius: '8px', border: 'none', width: '100%', boxSizing: 'border-box', color: '#1e293b' }} 
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '16px',
                                    padding: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    opacity: showNewPassword ? 1 : 0.4,
                                    transition: 'opacity 0.2s',
                                    color: '#888',
                                    zIndex: 10
                                }}
                            >
                                👁️
                            </button>
                        </div>
                        <div style={{ position: 'relative', width: '100%' }}>
                            <input 
                                type={showConfirmPassword ? 'text' : 'password'} 
                                placeholder="Confirm Password" 
                                value={confirmPassword} 
                                onChange={e => setConfirmPassword(e.target.value)} 
                                style={{ padding: '12px', paddingRight: '40px', borderRadius: '8px', border: 'none', width: '100%', boxSizing: 'border-box', color: '#1e293b' }} 
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '16px',
                                    padding: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    opacity: showConfirmPassword ? 1 : 0.4,
                                    transition: 'opacity 0.2s',
                                    color: '#888',
                                    zIndex: 10
                                }}
                            >
                                👁️
                            </button>
                        </div>
                        {message && <p style={{ color: '#ef4444', fontSize: '14px' }}>{message}</p>}
                        <button type="submit" disabled={status === 'loading'} style={{ padding: '12px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold' }}>
                            {status === 'loading' ? 'Saving...' : 'Update Password'}
                        </button>
                    </form>
                )}
                <div style={{ marginTop: '20px' }}>
                    <Link href="/" style={{ color: '#94a3b8', textDecoration: 'none' }}>← Back Home</Link>
                </div>
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div style={{ color: 'white', textAlign: 'center', paddingTop: '100px' }}>Loading...</div>}>
            <ResetPasswordForm />
        </Suspense>
    );
}
