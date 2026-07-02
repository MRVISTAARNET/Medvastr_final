'use client';

import React, { useState } from 'react';
import AdminTopbar from '@/components/admin/AdminTopbar';
import { API_BASE, authHeaders } from '@/lib/api';

export default function AdminSettings() {
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [pwdMsg, setPwdMsg] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);

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
                    <div style={{ position: 'relative' }}>
                      <input type={showCurrentPwd ? 'text' : 'password'} placeholder="••••••••" style={{ ...inp, paddingRight: '40px' }}
                        value={currentPwd} onChange={e => setCurrentPwd(e.target.value)} />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPwd(!showCurrentPwd)}
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
                          opacity: showCurrentPwd ? 1 : 0.4,
                          transition: 'opacity 0.2s',
                          color: '#888',
                          zIndex: 10
                        }}
                      >
                        👁️
                      </button>
                    </div>
                  </div>
                  <div className="fg">
                    <label>New Password</label>
                    <div style={{ position: 'relative' }}>
                      <input type={showNewPwd ? 'text' : 'password'} placeholder="Minimum 6 characters" style={{ ...inp, paddingRight: '40px' }}
                        value={newPwd} onChange={e => setNewPwd(e.target.value)} />
                      <button
                        type="button"
                        onClick={() => setShowNewPwd(!showNewPwd)}
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
                          opacity: showNewPwd ? 1 : 0.4,
                          transition: 'opacity 0.2s',
                          color: '#888',
                          zIndex: 10
                        }}
                      >
                        👁️
                      </button>
                    </div>
                  </div>
                  {pwdMsg && <div style={{ fontSize: 13, margin: '8px 0', color: pwdMsg.startsWith('✅') ? 'green' : 'red' }}>{pwdMsg}</div>}
                  <button className="btn-primary" onClick={handleChangePassword} disabled={pwdLoading}>
                    {pwdLoading ? 'Changing...' : 'Change Password'}
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
