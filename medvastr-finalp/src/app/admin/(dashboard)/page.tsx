'use client';

import React from 'react';
import AdminTopbar from '@/components/admin/AdminTopbar';
import { MOCK_ADMIN, fmt, fmtNum, fmtDate } from '@/lib/adminData';
import Link from 'next/link';

export default function AdminDashboard() {
  const s = MOCK_ADMIN.stats;
  const recentOrders = MOCK_ADMIN.orders.slice(0, 5);
  const maxRevenue = Math.max(...MOCK_ADMIN.monthlyRevenue.map(m => m.v));

  const statusBadge = (s: string) => {
    const map: any = {
      DELIVERED:  'b-grn',   SHIPPED:    'b-blue',
      PROCESSING: 'b-warn',  PENDING:    'b-purple',
      CANCELLED:  'b-red',   REFUNDED:   'b-gray',
    };
    return <span className={`badge ${map[s] || 'b-gray'}`}>{s}</span>;
  };

  return (
    <>
      <AdminTopbar 
        title="Dashboard" 
        sub="Welcome back — here's what's happening today" 
      />
      <div className="admin-content">
        <div className="panel">
          {/* Stats */}
          <div className="stats-grid">
            <StatCard ico="💰" label="Total Revenue" val={fmt(s.revenue)} sub={`+${s.growth}% this month`} dir="up" bg="#daf3ef" />
            <StatCard ico="📦" label="Total Orders" val={fmtNum(s.orders)} sub={`${s.pendingOrders} pending`} dir="up" bg="#dbeafe" />
            <StatCard ico="👥" label="Customers" val={fmtNum(s.customers)} sub="Registered users" dir="up" bg="#fef5e4" />
            <StatCard ico="⭐" label="Avg Rating" val={`${s.ratingAvg} / 5.0`} sub="Based on all reviews" dir="neu" bg="#ede9fe" />
          </div>

          {/* Quick Actions */}
          <div className="quick-actions">
            <Link href="/admin/orders" className="qa-btn">
              <div className="qa-ico">📦</div>
              <div className="qa-t">View Orders</div>
              <div className="qa-s">{s.pendingOrders} pending</div>
            </Link>
            <Link href="/admin/products" className="qa-btn">
              <div className="qa-ico">➕</div>
              <div className="qa-t">Add Product</div>
              <div className="qa-s">Expand catalogue</div>
            </Link>
            <Link href="/admin/customers" className="qa-btn">
              <div className="qa-ico">👥</div>
              <div className="qa-t">Customers</div>
              <div className="qa-s">{fmtNum(s.customers)} registered</div>
            </Link>
            <Link href="/admin/promos" className="qa-btn">
              <div className="qa-ico">🎟️</div>
              <div className="qa-t">Promo Codes</div>
              <div className="qa-s">Manage discounts</div>
            </Link>
          </div>

          {/* Charts row */}
          <div className="charts-row">
            {/* Revenue bar chart */}
            <div className="chart-card">
              <div className="chart-hd">
                <div><div className="chart-title">Revenue Overview</div><div className="chart-sub">Last 6 months</div></div>
                <div className="chart-tabs">
                  <div className="chart-tab on">Revenue</div>
                  <div className="chart-tab">Orders</div>
                </div>
              </div>
              <div className="bar-chart">
                {MOCK_ADMIN.monthlyRevenue.map((m, i) => (
                  <div className="bar-col" key={i}>
                    <div className="bar" style={{ height: `${Math.round((m.v / maxRevenue) * 170)}px` }}>
                      <div className="bar-tooltip">{fmt(m.v)}</div>
                    </div>
                    <div className="bar-label">{m.m}</div>
                  </div>
                ))}
              </div>
            </div>
            {/* Top products */}
            <div className="chart-card">
              <div className="chart-hd">
                <div><div className="chart-title">Top Products</div><div className="chart-sub">By revenue this month</div></div>
              </div>
              <div className="mini-list">
                {MOCK_ADMIN.topProducts.slice(0, 5).map((p, i) => (
                  <div className="mini-item" key={i}>
                    <div className={`mini-rank ${i === 0 ? 'gold-rank' : ''}`}>{i + 1}</div>
                    <div className="mini-info">
                      <div className="mini-name">{p.emoji} {p.name}</div>
                      <div className="mini-sub">{p.sales} sold</div>
                    </div>
                    <div className="mini-val">{fmt(p.revenue)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="table-card">
            <div className="table-hd">
              <div className="table-hd-left">
                <div className="table-title">Recent Orders</div>
                <div className="table-sub">Latest {recentOrders.length} orders</div>
              </div>
              <Link href="/admin/orders" className="btn-secondary">View All Orders →</Link>
            </div>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th><th>Customer</th><th>Items</th><th>Total</th><th>Payment</th><th>Status</th><th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o, idx) => (
                  <tr key={idx}>
                    <td><span className="td-mono">{o.num}</span></td>
                    <td>
                      <div className="td-name">{o.customer}</div>
                      <div className="td-meta">{o.email}</div>
                    </td>
                    <td>{o.items} item{o.items > 1 ? 's' : ''}</td>
                    <td className="td-bold">{fmt(o.total)}</td>
                    <td>{o.payment}</td>
                    <td>{statusBadge(o.status)}</td>
                    <td>{fmtDate(o.date)}</td>
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
