'use client';

import React, { useState, useEffect } from 'react';
import AdminTopbar from '@/components/admin/AdminTopbar';
import { fmt } from '@/lib/data';
import { API_BASE, authHeaders } from '@/lib/api';

export default function AdminAnalytics() {
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem('token');
        const [ordRes, prodRes] = await Promise.all([
          fetch(`${API_BASE}/orders/admin/all?size=500`, { headers: authHeaders(token) }),
          fetch(`${API_BASE}/products?size=100`),
        ]);
        const [ordData, prodData] = await Promise.all([ordRes.json(), prodRes.json()]);
        if (ordData.success) setOrders(ordData.data.content || ordData.data || []);
        if (prodData.success) setProducts(prodData.data.content || []);
      } catch (e) { }
      setLoading(false);
    };
    load();
  }, []);

  const totalRevenue = orders.reduce((s, o) => s + (parseFloat(o.totalAmount) || 0), 0);
  const avgOrder = orders.length > 0 ? totalRevenue / orders.length : 0;

  const now = new Date();
  const thisMonth = orders.filter(o => {
    const d = new Date(o.createdAt);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const monthlyRevenue = thisMonth.reduce((s, o) => s + (parseFloat(o.totalAmount) || 0), 0);

  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const label = d.toLocaleString('default', { month: 'short' });
    const monthOrders = orders.filter(o => {
      const od = new Date(o.createdAt);
      return od.getMonth() === d.getMonth() && od.getFullYear() === d.getFullYear();
    });
    const revenue = monthOrders.reduce((s, o) => s + (parseFloat(o.totalAmount) || 0), 0);
    return { label, revenue, count: monthOrders.length };
  });

  // Top products by order item count
  const productSales: Record<string, { name: string; emoji: string; count: number; revenue: number }> = {};
  orders.forEach(o => {
    (o.items || []).forEach((item: any) => {
      const name = item.productName || 'Unknown';
      if (!productSales[name]) productSales[name] = { name, emoji: '📦', count: 0, revenue: 0 };
      productSales[name].count += item.quantity || 1;
      productSales[name].revenue += parseFloat(item.totalPrice) || 0;
    });
  });
  const topProducts = Object.values(productSales).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

  const maxRev = Math.max(...monthlyData.map(m => m.revenue), 1);
  const circumference = 2 * Math.PI * 58;

  if (loading) return (
    <>
      <AdminTopbar title="Analytics" sub="Sales trends, traffic and conversion insights" />
      <div className="admin-content"><div className="panel" style={{ textAlign: 'center', padding: '60px', color: 'var(--txt3)' }}>Loading analytics...</div></div>
    </>
  );

  return (
    <>
      <AdminTopbar title="Analytics" sub="Sales trends, traffic and conversion insights" />
      <div className="admin-content">
        <div className="panel">
          <div className="stats-grid" style={{ marginBottom: '22px' }}>
            <StatCard ico="💰" label={`${now.toLocaleString('default', { month: 'long' })} Revenue`} val={fmt(monthlyRevenue)} sub={`${thisMonth.length} orders`} dir="up" bg="#daf3ef" />
            <StatCard ico="📦" label="Total Orders" val={String(orders.length)} sub="All time" dir="up" bg="#dbeafe" />
            <StatCard ico="🔄" label="Avg Order Value" val={fmt(avgOrder)} sub="Per transaction" dir="neu" bg="#fef5e4" />
            <StatCard ico="📦" label="Live Products" val={String(products.length)} sub="In catalogue" dir="neu" bg="#ede9fe" />
          </div>

          <div className="charts-row">
            <div className="chart-card">
              <div className="chart-hd">
                <div><div className="chart-title">Revenue Trend</div><div className="chart-sub">Last 6 months (live)</div></div>
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
            <div className="chart-card">
              <div className="chart-hd">
                <div><div className="chart-title">Top Products</div><div className="chart-sub">By order revenue</div></div>
              </div>
              <div className="mini-list">
                {topProducts.length > 0 ? topProducts.map((p, i) => (
                  <div className="mini-item" key={i}>
                    <div className={`mini-rank ${i === 0 ? 'gold-rank' : ''}`}>{i + 1}</div>
                    <div className="mini-info">
                      <div className="mini-name">{p.emoji} {p.name}</div>
                      <div className="mini-sub">{p.count} sold</div>
                    </div>
                    <div className="mini-val">{fmt(p.revenue)}</div>
                  </div>
                )) : (
                  <div style={{ textAlign: 'center', color: 'var(--lt)', fontSize: '13px', padding: '20px 0' }}>No order data yet</div>
                )}
              </div>
            </div>
          </div>

          <div className="chart-card" style={{ marginBottom: 0 }}>
            <div className="chart-hd">
              <div><div className="chart-title">Monthly Breakdown</div><div className="chart-sub">Revenue & order count</div></div>
            </div>
            <table className="admin-table">
              <thead>
                <tr><th>Month</th><th>Revenue</th><th>Orders</th><th>Avg Order</th><th>vs Prev Month</th></tr>
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
        <div className={`stat-badge badge-${dir === 'up' ? 'up' : dir === 'dn' ? 'dn' : 'neu'}`}>
          {dir === 'up' ? '↑' : dir === 'dn' ? '↓' : '—'} {sub.split(' ')[0]}
        </div>
      </div>
      <div className="stat-n">{val}</div>
      <div className="stat-l">{label}</div>
    </div>
  );
}
