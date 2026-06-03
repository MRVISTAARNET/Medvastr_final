'use client';

import React, { useState, useEffect } from 'react';
import AdminTopbar from '@/components/admin/AdminTopbar';
import { fmt } from '@/lib/data';
import { API_BASE } from '@/lib/api';

export default function AdminRevenue() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE}/orders/admin/all?size=500`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) setOrders(data.data.content || data.data || []);
      } catch (e) { }
      setLoading(false);
    };
    fetchOrders();
  }, []);

  // Compute stats from real orders
  const totalRevenue = orders.reduce((sum, o) => sum + (parseFloat(o.totalAmount) || 0), 0);
  const avgOrder = orders.length > 0 ? totalRevenue / orders.length : 0;

  const now = new Date();
  const thisMonth = orders.filter(o => {
    const d = new Date(o.createdAt);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const thisMonthRevenue = thisMonth.reduce((s, o) => s + (parseFloat(o.totalAmount) || 0), 0);

  // Build monthly breakdown for last 6 months
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const label = d.toLocaleString('default', { month: 'short' });
    const year = d.getFullYear();
    const monthOrders = orders.filter(o => {
      const od = new Date(o.createdAt);
      return od.getMonth() === d.getMonth() && od.getFullYear() === year;
    });
    const revenue = monthOrders.reduce((s, o) => s + (parseFloat(o.totalAmount) || 0), 0);
    return { label, revenue, count: monthOrders.length };
  });

  const maxRev = Math.max(...monthlyData.map(m => m.revenue), 1);

  if (loading) return (
    <>
      <AdminTopbar title="Revenue" sub="Financial overview and payment tracking" />
      <div className="admin-content"><div className="panel" style={{ textAlign: 'center', padding: '60px', color: 'var(--txt3)' }}>Loading revenue data...</div></div>
    </>
  );

  return (
    <>
      <AdminTopbar title="Revenue" sub="Financial overview and payment tracking" />
      <div className="admin-content">
        <div className="panel">
          <div className="stats-grid" style={{ marginBottom: '22px' }}>
            <StatCard ico="💰" label="Total Revenue" val={fmt(totalRevenue)} sub="All time" dir="up" bg="#daf3ef" />
            <StatCard ico="📅" label="This Month" val={fmt(thisMonthRevenue)} sub={`${thisMonth.length} orders`} dir="up" bg="#dbeafe" />
            <StatCard ico="🛒" label="Avg Order Value" val={fmt(avgOrder)} sub="Per transaction" dir="up" bg="#fef5e4" />
            <StatCard ico="📦" label="Total Orders" val={String(orders.length)} sub="All time" dir="up" bg="#ede9fe" />
          </div>

          <div className="chart-card" style={{ marginBottom: '22px' }}>
            <div className="chart-hd">
              <div>
                <div className="chart-title">Monthly Revenue</div>
                <div className="chart-sub">Last 6 months (Live Data)</div>
              </div>
            </div>
            <div className="bar-chart">
              {monthlyData.map((m, i) => (
                <div className="bar-col" key={i}>
                  <div className="bar" style={{ height: `${Math.max(Math.round((m.revenue / maxRev) * 170), m.revenue > 0 ? 4 : 0)}px` }}>
                    <div className="bar-tooltip">{fmt(m.revenue)}</div>
                  </div>
                  <div className="bar-label">{m.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="table-card">
            <div className="table-hd"><div className="table-hd-left"><div className="table-title">Monthly Breakdown</div></div></div>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Month</th><th>Revenue</th><th>Orders</th><th>Avg Order</th><th>Growth</th>
                </tr>
              </thead>
              <tbody>
                {monthlyData.map((m, i) => (
                  <tr key={i}>
                    <td className="td-bold">{m.label}</td>
                    <td className="td-bold">{fmt(m.revenue)}</td>
                    <td>{m.count}</td>
                    <td>{m.count > 0 ? fmt(m.revenue / m.count) : '—'}</td>
                    <td>
                      {i === 0 ? '—' : (
                        <span className={`badge ${m.revenue >= monthlyData[i - 1].revenue ? 'b-grn' : 'b-red'}`}>
                          {m.revenue >= monthlyData[i - 1].revenue ? '↑' : '↓'}{' '}
                          {monthlyData[i - 1].revenue > 0
                            ? Math.abs(Math.round(((m.revenue - monthlyData[i - 1].revenue) / monthlyData[i - 1].revenue) * 100))
                            : 0}%
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
          {dir === 'up' ? '↑' : dir === 'dn' ? '↓' : '—'} {sub}
        </div>
      </div>
      <div className="stat-n">{val}</div>
      <div className="stat-l">{label}</div>
    </div>
  );
}
