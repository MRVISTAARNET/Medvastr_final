'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { login } = useApp();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter email and password.');
      return;
    }
    setLoading(true);
    setError('');

    const success = await login(email, password, { adminOnly: true });
    if (success) {
      router.push('/admin');
    } else {
      setError('Invalid email or password, or access denied.');
      setLoading(false);
    }
  };

  return (
    <div id="login-page">
      <div className="login-box">
        <div className="login-top">
          <div className="login-shield">🛡️</div>
          <div className="login-logo">Medva<span>str</span></div>
          <div className="login-sub">Admin Dashboard — Authorized Access Only</div>
        </div>
        <div className="login-body">
          <form onSubmit={handleLogin}>
            {error && <div className="login-err">⚠️ <span>{error}</span></div>}
            <div className="lf">
              <label htmlFor="admin-email">Email Address</label>
              <input
                id="admin-email"
                type="email"
                placeholder="admin@medvastr.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
            <div className="lf">
              <label htmlFor="admin-password">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  style={{ paddingRight: '40px', width: '100%' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
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
                    opacity: showPassword ? 1 : 0.4,
                    transition: 'opacity 0.2s',
                    color: '#888',
                    zIndex: 10
                  }}
                >
                  👁️
                </button>
              </div>
            </div>
            <button className="login-btn" type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In to Dashboard'}
            </button>

            <div style={{ textAlign: 'center', marginTop: '14px' }}>
              <Link
                href="/forgot-password"
                style={{ color: '#a0b4d6', fontSize: '13px', textDecoration: 'underline', opacity: 0.9 }}
              >
                Forgot your password?
              </Link>
            </div>

            <div className="login-note">
              🔒 This area is restricted to Medvastr admins only.<br />All access attempts are logged.
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
