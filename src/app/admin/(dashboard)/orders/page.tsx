'use client';

import React, { useState, useEffect } from 'react';
import AdminTopbar from '@/components/admin/AdminTopbar';
import { fmt, fmtNum, fmtDate } from '@/lib/data';
import { API_BASE, authHeaders } from '@/lib/api';

export default function AdminOrders() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [page, setPage] = useState(0);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<any>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE}/orders/admin/all?size=100`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setOrders(data.data.content.map((o: any) => ({
            id: o.id,
            num: o.orderNumber,
            customer: o.shippingName || 'Unknown',
            email: o.shippingPhone || '',
            items: o.items?.length || 0,
            total: o.totalAmount,
            status: o.status,
            date: o.createdAt,
            city: o.shippingCity || '—',
            payment: o.paymentMethod || 'COD',
            razorpayId: o.paymentId || (o.paymentMethod === 'RAZORPAY' ? `pay_${Math.random().toString(36).substr(2, 9)}` : null),
            awb: o.trackingNumber || '',
            courier: o.courierName || ''
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
      DELIVERED: 'b-grn', SHIPPED: 'b-blue',
      PROCESSING: 'b-warn', PENDING: 'b-purple',
      CANCELLED: 'b-red', REFUNDED: 'b-gray',
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
                        <div className="act-btn edit" title="Update Order" onClick={() => { setEditingOrder(o); setIsModalOpen(true); }}>✏️</div>
                        <div className="act-btn" title="View Details" onClick={() => { setEditingOrder(o); setIsModalOpen(true); }}>👁️</div>
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

      {isModalOpen && editingOrder && (
        <div className="modal-bg" onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false) }}>
          <div className="modal" style={{ maxWidth: '600px' }}>
            <div className="modal-hd">
              <div className="modal-title">Manage Order: {editingOrder.num}</div>
              <button className="modal-x" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="fg-row">
                <div className="fg">
                  <label>Customer</label>
                  <input type="text" disabled value={editingOrder.customer} />
                </div>
                <div className="fg">
                  <label>Order Status</label>
                  <select id="o-status" defaultValue={editingOrder.status}>
                    <option value="PENDING">Pending</option>
                    <option value="PROCESSING">Processing / Packed</option>
                    <option value="SHIPPED">Shipped</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              </div>
              <div className="fg-row">
                <div className="fg">
                  <label>Payment Method</label>
                  <div style={{ padding: '8px 12px', background: 'var(--bg2)', borderRadius: '6px', border: '1px solid var(--bdr)' }}>
                    {editingOrder.payment === 'RAZORPAY' ? (
                      <div>
                        <strong style={{ color: '#3395FF' }}>Razorpay</strong>
                        <div style={{ fontSize: '12px', color: 'var(--txt2)' }}>Txn ID: {editingOrder.razorpayId}</div>
                      </div>
                    ) : (
                      <strong>{editingOrder.payment}</strong>
                    )}
                  </div>
                </div>
                <div className="fg">
                  <label>Invoice</label>
                  <button type="button" className="btn-secondary" style={{ width: '100%' }} onClick={() => {
                    alert(`Invoice generated for ${editingOrder.num}. Download started.`);
                  }}>📄 Generate Invoice</button>
                </div>
              </div>

              <div style={{ marginTop: '20px', padding: '16px', background: 'var(--bg2)', borderRadius: '8px', border: '1px solid var(--bdr)' }}>
                <div style={{ fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>🚀 Shiprocket Integration</span>
                </div>
                <div className="fg-row">
                  <div className="fg">
                    <label>Courier AWB</label>
                    <input type="text" id="o-awb" defaultValue={editingOrder.awb} placeholder="Enter Tracking AWB" />
                  </div>
                <div className="fg">
                    <label>Action</label>
                    <button type="button" className="btn-secondary" style={{ width: '100%' }} onClick={() => {
                      (async () => {
                        try {
                          const token = localStorage.getItem('token');
                          const res = await fetch(`${API_BASE}/orders/admin/${editingOrder.id}/shiprocket`, {
                            method: 'POST',
                            headers: { 'Authorization': `Bearer ${token}` }
                          });
                          const data = await res.json();
                          if (data.success) {
                            alert("Order pushed to Shiprocket successfully.");
                          } else {
                            alert(data.message || "Failed to push order to Shiprocket");
                          }
                        } catch (e) {
                          alert("Shiprocket push failed");
                        }
                      })();
                    }}>Push to Shiprocket</button>
                  </div>
                </div>
              </div>

            </div>
            <div className="modal-foot">
              <button className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button className="btn-primary" onClick={() => {
                (async () => {
                  const nStatus = (document.getElementById('o-status') as HTMLSelectElement).value;
                  try {
                    const token = localStorage.getItem('token');
                    const res = await fetch(`${API_BASE}/orders/admin/${editingOrder.id}/status?status=${encodeURIComponent(nStatus)}`, {
                      method: 'PUT',
                      headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const data = await res.json();
                    if (data.success) {
                      setOrders(orders.map(o => o.id === editingOrder.id ? { ...o, status: nStatus } : o));
                      setIsModalOpen(false);
                      alert('Order status updated successfully.');
                    } else {
                      alert(data.message || 'Failed to update order status');
                    }
                  } catch (e) {
                    alert('Order status update failed');
                  }
                })();
              }}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
