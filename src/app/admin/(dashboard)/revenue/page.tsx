'use client';

import React from 'react';
import AdminTopbar from '@/components/admin/AdminTopbar';
import { MOCK_ADMIN, fmt, fmtNum } from '@/lib/adminData';

export default function AdminRevenue() {
  const s = MOCK_ADMIN.stats;
  const monthly = MOCK_ADMIN.monthlyRevenue;
  const maxRevenue = monthly.length > 0 ? Math.max(...monthly.map(m => m.v)) : 100;

  return (
    <>
      <AdminTopbar 
        title="Revenue" 
        sub="Financial overview and payment tracking" 
      />
      <div className="admin-content">
        <div className="panel">
          <div className="stats-grid" style={{ marginBottom: '22px' }}>
            <StatCard ico="💰" label="Total Revenue" val={fmt(s.revenue)} sub="All time" dir="up" bg="#daf3ef" />
            <StatCard ico="📅" label="This Month" val={fmt(monthly[5]?.v || 0)} sub="+23.5%" dir="up" bg="#dbeafe" />
            <StatCard ico="🛒" label="Avg Order Value" val={fmt(s.avgOrder)} sub="Per transaction" dir="up" bg="#fef5e4" />
            <StatCard ico="✅" label="Successful Payments" val="98.2%" sub="Payment success rate" dir="up" bg="#ede9fe" />
          </div>

          <div className="chart-card" style={{ marginBottom: '22px' }}>
            <div className="chart-hd"><div><div className="chart-title">Monthly Revenue</div><div className="chart-sub">Oct 2025 – Mar 2026</div></div></div>
            <div className="bar-chart">
              {monthly.map((m, i) => (
                <div className="bar-col" key={i}>
                  <div className="bar" style={{ height: `${Math.round((m.v / maxRevenue) * 170)}px` }}>
                    <div className="bar-tooltip">{fmt(m.v)}</div>
                  </div>
                  <div className="bar-label">{m.m}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="table-card">
            <div className="table-hd"><div className="table-hd-left"><div className="table-title">Monthly Breakdown</div></div></div>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Month</th><th>Revenue</th><th>Orders</th><th>Avg Order Value</th><th>Growth</th>
                </tr>
              </thead>
              <tbody>
                {monthly.map((m, i) => (
                  <tr key={i}>
                    <td className="td-bold">{m.m} 2025{i >= 4 ? ' 2026' : ''}</td>
                    <td className="td-bold">{fmt(m.v)}</td>
                    <td>{Math.round(m.v / 2200)}</td>
                    <td>{fmt(2200)}</td>
                    <td>
                      {i === 0 ? '-' : (
                        <span className={`badge ${m.v > monthly[i - 1].v ? 'b-grn' : 'b-red'}`}>
                          {m.v > monthly[i - 1].v ? '↑' : '↓'} {Math.abs(Math.round(((m.v - monthly[i - 1].v) / monthly[i - 1].v) * 100))}%
                        </span>
                      )}
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
        <div className="stat-ico" style={{ background: bg }}>{ico}</div>
        <div className="stat-badge badge-up">
          {dir === 'up' ? '↑' : dir === 'dn' ? '↓' : '—'} {sub.split(' ')[0]}
        </div>
      </div>
      <div className="stat-n">{val}</div>
      <div className="stat-l">{label}</div>
    </div>
  );
}
