'use client';

import React, { useState } from 'react';
import AdminTopbar from '@/components/admin/AdminTopbar';
import { API_BASE, authHeaders } from '@/lib/api';

export default function AdminSettings() {
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [pwdMsg, setPwdMsg] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);

  const [razorpayKey, setRazorpayKey] = useState('');
  const [apiMsg, setApiMsg] = useState('');
  const [apiLoading, setApiLoading] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPwd || !newPwd) { setPwdMsg('Please fill both fields.'); return; }
    if (newPwd.length < 6) { setPwdMsg('New password must be at least 6 chars.'); return; }
    setPwdLoading(true);
    setPwdMsg('');
    try {
      const res = await fetch(`${API_BASE}/users/me/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ currentPassword: currentPwd, newPassword: newPwd })
      });
      const data = await res.json();
      setPwdMsg(data.success ? '✅ Password changed successfully!' : ('❌ ' + (data.message || 'Failed')));
      if (data.success) { setCurrentPwd(''); setNewPwd(''); }
    } catch { setPwdMsg('❌ Network error'); }
    setPwdLoading(false);
  };

  const handleSaveRazorpay = async () => {
    if (!razorpayKey) { setApiMsg('Please enter Razorpay Key ID.'); return; }
    setApiLoading(true);
    setApiMsg('');
    try {
      const res = await fetch(`${API_BASE}/settings/razorpay_key`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ value: razorpayKey })
      });
      const data = await res.json();
      setApiMsg(data.success ? '✅ Razorpay Key saved! Restart server to apply.' : ('❌ ' + (data.message || 'Failed')));
    } catch { setApiMsg('❌ Network error'); }
    setApiLoading(false);
  };

  const [wipeLoading, setWipeLoading] = useState(false);
  const handleWipeData = async () => {
    if (!window.confirm("CRITICAL WARNING: This will permanently delete ALL orders, carts, products, and inventory from the live database. ONLY the Admin account and settings will remain. Are you absolutely sure you want to proceed?")) return;
    
    setWipeLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/system/wipe-test-data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() }
      });
      const data = await res.json();
      if (data.success) {
        alert("Success! The database has been wiped clean. You can now start fresh.");
        window.location.reload();
      } else {
        alert("Failed to wipe data: " + data.message);
      }
    } catch {
      alert("Network error while wiping data.");
    }
    setWipeLoading(false);
  };

  const inp = {
    width: '100%', height: '44px',
    border: '1.5px solid var(--bdr2)', borderRadius: '9px',
    padding: '0 14px', fontFamily: 'var(--body)', fontSize: '14px',
    outline: 'none', color: 'var(--txt)', background: 'var(--bg)',
    boxSizing: 'border-box' as const
  };

  return (
    <>
      <AdminTopbar title="Settings" sub="Store configuration and preferences" />
      <div className="admin-content">
        <div className="panel">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '22px', flexWrap: 'wrap' } as React.CSSProperties}>

            {/* Store Info */}
            <div className="table-card" style={{ marginBottom: 0 }}>
              <div className="table-hd"><div className="table-title">Store Information</div></div>
              <div style={{ padding: '22px' }}>
                <div className="fg"><label>Store Name</label><input type="text" defaultValue="Medvastr" style={inp} /></div>
                <div className="fg"><label>Email</label><input type="email" defaultValue="info@medvastr.com" style={inp} /></div>
                <div className="fg"><label>Phone</label><input type="tel" defaultValue="8976488911" style={inp} /></div>
                <div className="fg">
                  <label>Address</label>
                  <textarea style={{ ...inp, height: '80px', padding: '10px 14px', resize: 'vertical' }}
                    defaultValue="F 81-B, Express Zone, Malad East, Mumbai – 400063" />
                </div>
                <button className="btn-primary" style={{ opacity: 0.7, cursor: 'not-allowed' }}>Save Changes (local only)</button>
              </div>
            </div>

            <div>
              {/* Razorpay Key */}
              <div className="table-card" style={{ marginBottom: '22px' }}>
                <div className="table-hd"><div className="table-title">Razorpay Configuration</div></div>
                <div style={{ padding: '22px' }}>
                  <div className="fg">
                    <label>Current Key ID</label>
                    <input type="text" placeholder="Leave blank to keep existing key..." style={inp} readOnly
                      defaultValue="rzp_test_SvSsw..." />
                  </div>
                  <div className="fg">
                    <label>New Razorpay Key ID <span style={{ color: '#888', fontWeight: 400 }}>(rzp_live_... or rzp_test_...)</span></label>
                    <input type="text" placeholder="rzp_live_XXXXXXXXXXXXXXXXXX" style={inp}
                      value={razorpayKey} onChange={e => setRazorpayKey(e.target.value)} />
                  </div>
                  {apiMsg && <div style={{ fontSize: 13, margin: '8px 0', color: apiMsg.startsWith('✅') ? 'green' : 'red' }}>{apiMsg}</div>}
                  <button className="btn-primary" onClick={handleSaveRazorpay} disabled={apiLoading}>
                    {apiLoading ? 'Saving...' : 'Update Razorpay Key'}
                  </button>
                </div>
              </div>

              {/* Admin Password */}
              <div className="table-card" style={{ marginBottom: 0 }}>
                <div className="table-hd"><div className="table-title">Admin Account Password</div></div>
                <div style={{ padding: '22px' }}>
                  <div className="fg">
                    <label>Current Password</label>
                    <input type="password" placeholder="••••••••" style={inp}
                      value={currentPwd} onChange={e => setCurrentPwd(e.target.value)} />
                  </div>
                  <div className="fg">
                    <label>New Password</label>
                    <input type="password" placeholder="Minimum 6 characters" style={inp}
                      value={newPwd} onChange={e => setNewPwd(e.target.value)} />
                  </div>
                  {pwdMsg && <div style={{ fontSize: 13, margin: '8px 0', color: pwdMsg.startsWith('✅') ? 'green' : 'red' }}>{pwdMsg}</div>}
                  <button className="btn-primary" onClick={handleChangePassword} disabled={pwdLoading}>
                    {pwdLoading ? 'Changing...' : 'Change Password'}
                  </button>
                </div>
              </div>
            </div>

            {/* DANGER ZONE */}
            <div style={{ gridColumn: '1 / -1' }}>
              <div className="table-card" style={{ marginBottom: 0, border: '1px solid #ef4444' }}>
                <div className="table-hd" style={{ background: '#fef2f2', borderBottom: '1px solid #fee2e2' }}>
                  <div className="table-title" style={{ color: '#dc2626' }}>⚠️ DANGER ZONE: Wipe Production Data</div>
                </div>
                <div style={{ padding: '22px' }}>
                  <p style={{ color: '#4b5563', fontSize: '14px', marginBottom: '16px' }}>
                    Clicking the button below will <strong>permanently delete</strong> all products, variants, inventory logs, carts, orders, and order items from the live database. Only your Admin account, Promo Codes, and Store Settings will be preserved. This action CANNOT be undone.
                  </p>
                  <button className="btn-primary" style={{ background: '#ef4444', color: 'white' }} onClick={handleWipeData} disabled={wipeLoading}>
                    {wipeLoading ? 'Wiping Database...' : 'Delete All Test Data & Start Fresh'}
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
