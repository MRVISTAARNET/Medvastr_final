'use client';

import React from 'react';
import AdminTopbar from '@/components/admin/AdminTopbar';
import { MOCK_ADMIN, fmt } from '@/lib/adminData';

export default function AdminAnalytics() {
  const max = MOCK_ADMIN.monthlyRevenue.length > 0 
    ? Math.max(...MOCK_ADMIN.monthlyRevenue.map((m) => m.v))
    : 100;
  const categoryData = [
    { name: 'Scrubs', val: 52, color: '#12b49a' },
    { name: 'ecoflex™', val: 24, color: '#0a8b79' },
    { name: 'Stethoscope', val: 10, color: '#c08a2e' },
    { name: 'Lab Coats', val: 8, color: '#6d28d9' },
    { name: 'DRIFT Jacket', val: 6, color: '#1d4ed8' },
  ];
  const circumference = 2 * Math.PI * 58;
  let dashOffset = 0;
  const donutSegments = categoryData.map((d) => {
    const dash = (d.val / 100) * circumference;
    const seg = { ...d, dash, offset: dashOffset };
    dashOffset += dash;
    return seg;
  });

  return (
    <>
      <AdminTopbar
        title="Analytics"
        sub="Sales trends, traffic and conversion insights"
      />
      <div className="admin-content">
        <div className="panel">
          <div className="stats-grid" style={{ marginBottom: '22px' }}>
            <StatCard ico="💰" label="Monthly Revenue" val={fmt(MOCK_ADMIN.monthlyRevenue[5]?.v || 0)} sub="+23.5% vs last month" dir="up" bg="#daf3ef" />
            <StatCard ico="📦" label="Monthly Orders" val="342" sub="+18% vs last month" dir="up" bg="#dbeafe" />
            <StatCard ico="🔄" label="Avg Order Value" val={fmt(MOCK_ADMIN.stats.avgOrder)} sub="Per transaction" dir="up" bg="#fef5e4" />
            <StatCard ico="👥" label="New Customers" val="124" sub="This month" dir="up" bg="#ede9fe" />
          </div>

          <div className="charts-row">
            <div className="chart-card">
              <div className="chart-hd">
                <div>
                  <div className="chart-title">Revenue Trend</div>
                  <div className="chart-sub">Oct 2025 – Mar 2026</div>
                </div>
              </div>
              <div className="bar-chart">
                {MOCK_ADMIN.monthlyRevenue.map((m, i) => (
                  <div className="bar-col" key={i}>
                    <div className="bar" style={{ height: `${Math.round((m.v / max) * 170)}px` }}>
                      <div className="bar-tooltip">{fmt(m.v)}</div>
                    </div>
                    <div className="bar-label">{m.m}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="chart-card">
              <div className="chart-hd">
                <div>
                  <div className="chart-title">Sales by Category</div>
                  <div className="chart-sub">Current month</div>
                </div>
              </div>
              <div className="donut-wrap">
                <svg className="donut-svg" width="160" height="160" viewBox="0 0 160 160">
                  <circle cx="80" cy="80" r="58" fill="none" stroke="var(--bdr2)" strokeWidth="18" />
                  {donutSegments.map((s, i) => (
                    <circle
                      key={i}
                      cx="80"
                      cy="80"
                      r="58"
                      fill="none"
                      stroke={s.color}
                      strokeWidth="18"
                      strokeDasharray={`${s.dash} ${circumference}`}
                      strokeDashoffset={-s.offset}
                    />
                  ))}
                </svg>
                <div className="donut-center">
                  <div className="donut-n">100%</div>
                  <div className="donut-l">by category</div>
                </div>
              </div>
              <div className="donut-legend">
                {categoryData.map((d, i) => (
                  <div className="dl-item" key={i}>
                    <div className="dl-dot" style={{ background: d.color }}></div>
                    <div className="dl-name">{d.name}</div>
                    <div className="dl-val">{d.val}%</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="chart-card" style={{ marginBottom: 0 }}>
            <div className="chart-hd">
              <div>
                <div className="chart-title">Top 5 Products by Revenue</div>
                <div className="chart-sub">This month</div>
              </div>
            </div>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Product</th>
                  <th>Units Sold</th>
                  <th>Revenue</th>
                  <th>Avg Order</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_ADMIN.topProducts.map((p, i) => (
                  <tr key={i}>
                    <td>
                      <div className={`mini-rank ${i === 0 ? 'gold-rank' : ''}`}>{i + 1}</div>
                    </td>
                    <td>
                      <div className="td-flex">
                        <span style={{ fontSize: '24px', marginRight: '4px' }}>{p.emoji}</span>
                        <span className="td-name">{p.name}</span>
                      </div>
                    </td>
                    <td className="td-bold">{p.sales}</td>
                    <td className="td-bold">{fmt(p.revenue)}</td>
                    <td>{fmt(Math.round(p.revenue / p.sales))}</td>
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
