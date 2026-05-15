'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success && data.data.user.role === 'ADMIN') {
        localStorage.setItem('adm_token', data.data.token);
        localStorage.setItem('adm_user', JSON.stringify(data.data.user));
        router.push('/admin');
      } else if (data.success && data.data.user.role !== 'ADMIN') {
        setError('Access denied. Admin privileges required.');
        setLoading(false);
      } else {
        setError(data.message || 'Invalid email or password.');
        setLoading(false);
      }
    } catch (e) {
      setError('Connection failed. Please check your backend.');
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
              <label>Email Address</label>
              <input 
                type="email" 
                placeholder="admin@medvastr.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
            <div className="lf">
              <label>Password</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
            <button className="login-btn" type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In to Dashboard'}
            </button>
            <div className="login-note">
              🔒 This area is restricted to Medvastr admins only.<br/>All access attempts are logged.
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
