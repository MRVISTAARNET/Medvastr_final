'use client';

import React from 'react';
import AdminTopbar from '@/components/admin/AdminTopbar';
import { API_BASE } from '@/lib/api';

export default function AdminSettings() {

  return (
    <>
      <AdminTopbar
        title="Settings"
        sub="Store configuration and preferences"
      />
      <div className="admin-content">
        <div className="panel">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '22px' }}>
            <div className="table-card" style={{ marginBottom: 0 }}>
              <div className="table-hd">
                <div className="table-title">Store Information</div>
              </div>
              <div style={{ padding: '22px' }}>
                <div className="fg">
                  <label>Store Name</label>
                  <input type="text" defaultValue="Medvastr" className="tbl-search" style={{ width: '100%', height: '44px' }} />
                </div>
                <div className="fg">
                  <label>Email</label>
                  <input type="email" defaultValue="medvastr@gmail.com" className="tbl-search" style={{ width: '100%', height: '44px' }} />
                </div>
                <div className="fg">
                  <label>Phone</label>
                  <input type="tel" defaultValue="8976488911" className="tbl-search" style={{ width: '100%', height: '44px' }} />
                </div>
                <div className="fg">
                  <label>Address</label>
                  <textarea
                    style={{
                      width: '100%',
                      border: '1.5px solid var(--bdr2)',
                      borderRadius: '9px',
                      padding: '10px 14px',
                      fontFamily: 'var(--body)',
                      fontSize: '14px',
                      outline: 'none',
                      resize: 'vertical',
                      color: 'var(--txt)',
                    }}
                    defaultValue="F 81-B, Express Zone, Malad East, Mumbai – 400063"
                  />
                </div>
                <button className="btn-primary">Save Changes</button>
              </div>
            </div>
            <div>
              <div className="table-card" style={{ marginBottom: '22px' }}>
                <div className="table-hd">
                  <div className="table-title">API Configuration</div>
                </div>
                <div style={{ padding: '22px' }}>
                  <div className="fg">
                    <label>Backend API URL</label>
                    <input type="text" defaultValue="https://yourdomain.com/api" className="tbl-search" style={{ width: '100%', height: '44px' }} />
                  </div>
                  <div className="fg">
                    <label>Razorpay Key ID</label>
                    <input type="text" placeholder="rzp_live_..." className="tbl-search" style={{ width: '100%', height: '44px' }} />
                  </div>
                  <button className="btn-primary">Update API URL</button>
                </div>
              </div>
              <div className="table-card" style={{ marginBottom: 0 }}>
                <div className="table-hd">
                  <div className="table-title">Admin Account</div>
                </div>
                <div style={{ padding: '22px' }}>
                  <div className="fg">
                    <label>Current Password</label>
                    <input type="password" placeholder="••••••••" className="tbl-search" style={{ width: '100%', height: '44px' }} />
                  </div>
                  <div className="fg">
                    <label>New Password</label>
                    <input type="password" placeholder="••••••••" className="tbl-search" style={{ width: '100%', height: '44px' }} />
                  </div>
                  <button className="btn-primary">Change Password</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
