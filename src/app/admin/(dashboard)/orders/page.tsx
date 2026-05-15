'use client';

import React, { useState, useEffect } from 'react';
import AdminTopbar from '@/components/admin/AdminTopbar';
import { fmt, fmtNum, fmtDate } from '@/lib/adminData';

export default function AdminOrders() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [page, setPage] = useState(0);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('adm_token');
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders?size=100`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setOrders(data.data.content.map((o: any) => ({
            id: o.id,
            num: o.orderNumber,
            customer: o.shippingName || 'Unknown',
            email: o.shippingPhone || '',
            items: 0,
            total: o.totalAmount,
            status: o.status,
            date: o.createdAt,
            city: o.shippingCity || '—',
            payment: o.paymentMethod || 'COD'
          })));
        }
      } catch (e) {
        console.error("Failed to fetch orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(o => {
    const matchesSearch = !search || o.num.toLowerCase().includes(search.toLowerCase()) || o.customer.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'ALL' || o.status === filter;
    return matchesSearch && matchesFilter;
  });

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
        title="Orders" 
        sub="Manage and track all customer orders" 
      />
      <div className="admin-content">
        <div className="panel">
          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)', marginBottom: '22px' }}>
            {['ALL', 'PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'].map(s => (
              <div 
                key={s}
                className="stat-card" 
                style={{ cursor: 'pointer', padding: '14px 16px', borderColor: filter === s ? 'var(--teal)' : '', background: filter === s ? 'var(--teal4)' : '' }}
                onClick={() => setFilter(s)}
              >
                <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--txt3)' }}>{s}</div>
                <div className="stat-n" style={{ fontSize: '22px', marginTop: '6px' }}>
                  {s === 'ALL' ? fmtNum(orders.length) : fmtNum(orders.filter(o => o.status === s).length)}
                </div>
              </div>
            ))}
          </div>

          <div className="table-card">
            <div className="table-hd">
              <div className="table-hd-left">
                <div className="table-title">All Orders</div>
                <div className="table-sub">{fmtNum(filteredOrders.length)} total orders</div>
              </div>
              <div className="table-hd-right">
                <input 
                  className="tbl-search" 
                  placeholder="Search order ID or customer..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <select 
                  className="tbl-select" 
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  {['ALL', 'PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th><th>Customer</th><th>Items & Total</th><th>Payment</th><th>City</th><th>Date</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((o, idx) => (
                  <tr key={idx}>
                    <td><span className="td-mono">{o.num}</span></td>
                    <td>
                      <div className="td-name">{o.customer}</div>
                      <div className="td-meta">{o.city}</div>
                    </td>
                    <td>
                      <div className="td-bold">{fmt(o.total)}</div>
                      <div className="td-meta">{o.items} item(s)</div>
                    </td>
                    <td><span className="badge b-gray">{o.payment}</span></td>
                    <td>{o.city}</td>
                    <td>{fmtDate(o.date)}</td>
                    <td>{statusBadge(o.status)}</td>
                    <td>
                      <div className="act-btns">
                        <div className="act-btn edit" title="Update Status">✏️</div>
                        <div className="act-btn" title="View Details">👁️</div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="tbl-pag">
              <div className="tbl-pag-info">Showing {filteredOrders.length} of {fmtNum(orders.length)} orders</div>
              <div className="pag-btns">
                <button className="pag-btn" disabled={page === 0} onClick={() => setPage(page - 1)}>‹</button>
                <button className="pag-btn on">{page + 1}</button>
                <button className="pag-btn" onClick={() => setPage(page + 1)}>›</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
