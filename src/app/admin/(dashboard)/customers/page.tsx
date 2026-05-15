'use client';

import React from 'react';
import AdminTopbar from '@/components/admin/AdminTopbar';
import { INITIAL_ADMIN_DATA, fmt, fmtNum, fmtDate } from '@/lib/adminData';

export default function AdminCustomers() {
  const customers = INITIAL_ADMIN_DATA.customers;
  const maxSpent = Math.max(...customers.map((c) => c.spent || 0));
  const avgOrders = (
    customers.reduce((s, c) => s + (c.orders || 0), 0) / customers.length
  ).toFixed(1);
  const avgSpent =
    customers.reduce((s, c) => s + (c.spent || 0), 0) / customers.length;

  return (
    <>
      <AdminTopbar
        title="Customers"
        sub="View and manage customer accounts"
      />
      <div className="admin-content">
        <div className="panel">
          <div className="stats-grid" style={{ marginBottom: '22px' }}>
            <StatCard ico="👥" label="Total Customers" val={fmtNum(customers.length)} sub="registered accounts" dir="up" bg="#dbeafe" />
            <StatCard ico="🏆" label="Top Spender" val={fmt(maxSpent)} sub="Nurse Anita Rao" dir="up" bg="#fef5e4" />
            <StatCard ico="📦" label="Avg Orders" val={avgOrders} sub="per customer" dir="neu" bg="#daf3ef" />
            <StatCard ico="💰" label="Avg Spend" val={fmt(avgSpent)} sub="per customer" dir="up" bg="#ede9fe" />
          </div>

          <div className="table-card">
            <div className="table-hd">
              <div className="table-hd-left">
                <div className="table-title">Customers</div>
                <div className="table-sub">{customers.length} registered customers</div>
              </div>
              <div className="table-hd-right">
                <input className="tbl-search" placeholder="Search by name or email..." />
              </div>
            </div>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Contact</th>
                  <th>City</th>
                  <th>Orders</th>
                  <th>Total Spent</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div className="td-flex">
                        <div
                          className="td-avatar"
                          style={{
                            background: 'var(--teal3)',
                            fontSize: '16px',
                            fontWeight: 700,
                            color: 'var(--teal)',
                          }}
                        >
                          {(c.name || 'U').charAt(0)}
                        </div>
                        <div>
                          <div className="td-name">{c.name}</div>
                          <div className="td-meta">{c.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>{c.phone || '—'}</td>
                    <td>{c.city || '—'}</td>
                    <td className="td-bold">{c.orders || 0}</td>
                    <td className="td-bold">{fmt(c.spent || 0)}</td>
                    <td>
                      <span className={`badge ${c.role === 'ADMIN' ? 'b-purple' : 'b-gray'}`}>
                        {c.role}
                      </span>
                    </td>
                    <td>{fmtDate(c.joined)}</td>
                    <td>
                      <div className="act-btns">
                        <div className="act-btn" title="View Profile">
                          👁️
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

function StatCard({ ico, label, val, sub, dir, bg }: any) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <div className="stat-ico" style={{ background: bg }}>
          {ico}
        </div>
        <div className={`stat-badge badge-${dir === 'up' ? 'up' : dir === 'dn' ? 'dn' : 'neu'}`}>
          {dir === 'up' ? '↑' : dir === 'dn' ? '↓' : '—'} {sub.split(' ')[0]}
        </div>
      </div>
      <div className="stat-n">{val}</div>
      <div className="stat-l">{label}</div>
    </div>
  );
}
