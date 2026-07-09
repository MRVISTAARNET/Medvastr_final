'use client';

import React, { useState, useEffect, useCallback } from 'react';
import AdminTopbar from '@/components/admin/AdminTopbar';
import { fmt, fmtNum, fmtDate, fmtDateTime } from '@/lib/data';
import { API_BASE, authHeaders } from '@/lib/api';

const downloadCSV = (data: any[], fileName: string) => {
  if (!data || !data.length) return;
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(obj =>
    Object.values(obj).map(v => typeof v === 'string' ? `"${v.replace(/"/g, '""')}"` : v).join(',')
  ).join('\n');
  const blob = new Blob([`${headers}\n${rows}`], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  link.click();
};

export default function AdminOrders() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(0);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<any>(null);
  const [debugResponse, setDebugResponse] = useState<string | null>(null);
  const [singleSyncing, setSingleSyncing] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/orders/admin/all?size=200`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setOrders(data.data.content.map((o: any) => ({
          id: o.id,
          num: o.orderNumber,
          customer: o.shippingName || 'Unknown',
          phone: o.shippingPhone || '',
          items: o.items?.length || 0,
          itemsList: o.items || [],
          total: o.totalAmount,
          status: o.status,
          shiprocketStatus: o.shiprocketSyncStatus || '',
          date: o.createdAt,
          city: o.shippingCity || '—',
          payment: o.paymentMethod || 'COD',
          razorpayId: o.paymentId || null,
          awb: o.trackingNumber || '',
          courier: o.courierName || ''
        })));
      }
    } catch (e) {
      console.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const filteredOrders = orders.filter(o => {
    const matchesSearch = !search ||
      o.num.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.toLowerCase().includes(search.toLowerCase()) ||
      (o.awb && o.awb.toLowerCase().includes(search.toLowerCase()));

    let matchesFilter = false;
    if (filter === 'ALL') {
      matchesFilter = true;
    } else if (filter === 'PROCESSING') {
      matchesFilter = o.status === 'PROCESSING' || o.status === 'PACKED';
    } else if (filter === 'SHIPPED') {
      matchesFilter = o.status === 'SHIPPED' || o.status === 'OUT_FOR_DELIVERY';
    } else if (filter === 'RETURNED') {
      matchesFilter = o.status === 'RETURNED' || o.status === 'RETURN_REQUESTED';
    } else {
      matchesFilter = o.status === filter;
    }

    let matchesDate = true;
    if (o.date) {
      const orderDateStr = o.date.slice(0, 10);
      if (startDate && orderDateStr < startDate) matchesDate = false;
      if (endDate && orderDateStr > endDate) matchesDate = false;
    } else if (startDate || endDate) {
      matchesDate = false;
    }

    return matchesSearch && matchesFilter && matchesDate;
  });

  const exportOrders = () => {
    const feed = filteredOrders.map(o => ({
      'Order ID': o.num,
      'Customer Name': o.customer,
      'Phone': o.phone,
      'City': o.city,
      'Date': o.date ? fmtDateTime(o.date) : '—',
      'Payment Method': o.payment,
      'Total Amount (₹)': o.total,
      'Items Count': o.items,
      'Status': o.status,
      'Shiprocket Status': o.shiprocketStatus,
      'Tracking AWB': o.awb,
      'Courier': o.courier
    }));
    downloadCSV(feed, `medvastr_orders_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const handleBulkSync = async () => {
    setSyncing(true);
    setSyncMsg('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/orders/admin/sync-shiprocket`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setSyncMsg(data.success ? `✅ ${data.data}` : `❌ ${data.message || 'Sync failed'}`);
      if (data.success) await fetchOrders();
    } catch (e) {
      setSyncMsg('❌ Sync request failed');
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncMsg(''), 6000);
    }
  };

  const handleSingleSync = async () => {
    if (!editingOrder) return;
    setSingleSyncing(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/orders/admin/${editingOrder.id}/sync-status`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        const updated = data.data;
        const newStatus = updated.status;
        const newSrStatus = updated.shiprocketSyncStatus || '';
        setOrders(orders.map(o => o.id === editingOrder.id
          ? { ...o, status: newStatus, shiprocketStatus: newSrStatus }
          : o));
        setEditingOrder({ ...editingOrder, status: newStatus, shiprocketStatus: newSrStatus });
        alert(`✅ Synced! Internal status: ${newStatus}\nShiprocket status: ${newSrStatus || 'N/A'}`);
      } else {
        alert(`❌ ${data.message || 'Sync failed'}`);
      }
    } catch (e) {
      alert('❌ Sync request failed');
    } finally {
      setSingleSyncing(false);
    }
  };

  const statusBadge = (s: string) => {
    const map: any = {
      DELIVERED: 'b-grn', SHIPPED: 'b-blue', OUT_FOR_DELIVERY: 'b-blue',
      PROCESSING: 'b-warn', PENDING: 'b-purple', CONFIRMED: 'b-purple', PACKED: 'b-warn',
      CANCELLED: 'b-red', REFUNDED: 'b-gray', RETURN_REQUESTED: 'b-warn', RETURNED: 'b-red',
    };
    const labels: any = {
      PENDING: 'New',
      CONFIRMED: 'Ready to Ship',
      PROCESSING: 'Pickups & Manifests',
      PACKED: 'Pickups & Manifests',
      SHIPPED: 'In Transit',
      OUT_FOR_DELIVERY: 'Out for Delivery',
      DELIVERED: 'Delivered',
      CANCELLED: 'Cancelled',
      RETURNED: 'RTO',
      RETURN_REQUESTED: 'RTO Requested'
    };
    return <span className={`badge ${map[s] || 'b-gray'}`}>{labels[s] || s}</span>;
  };

  const srBadge = (srStatus: string) => {
    if (!srStatus) return null;
    const s = srStatus.toLowerCase();
    let cls = 'b-gray';
    if (s.includes('delivered') && !s.includes('undelivered')) cls = 'b-grn';
    else if (s.includes('out for delivery')) cls = 'b-blue';
    else if (s.includes('in transit') || s.includes('reached')) cls = 'b-blue';
    else if (s.includes('pickup') || s.includes('manifest') || s.includes('label')) cls = 'b-warn';
    else if (s.includes('rto') || s.includes('return') || s.includes('cancel')) cls = 'b-red';
    else if (s.includes('ndr') || s.includes('undelivered')) cls = 'b-red';

    return (
      <span
        className={`badge ${cls}`}
        style={{ fontSize: '10px', marginLeft: '4px', opacity: 0.85 }}
        title={`Shiprocket: ${srStatus}`}
      >
        🚀 {srStatus}
      </span>
    );
  };

  return (
    <>
      <AdminTopbar
        title="Orders"
        sub="Manage and track all customer orders"
      />
      <div className="admin-content">
        <div className="panel">
          {/* ── Status Summary Cards ── */}
          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)', marginBottom: '22px' }}>
            {['ALL', 'PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'].map(s => {
              const labelMap: any = {
                ALL: 'All Orders',
                PENDING: 'New',
                PROCESSING: 'Pickups & Manifests',
                SHIPPED: 'In Transit',
                DELIVERED: 'Delivered'
              };
              const count = s === 'ALL' ? orders.length :
                            s === 'PENDING' ? orders.filter(o => o.status === 'PENDING').length :
                            s === 'PROCESSING' ? orders.filter(o => o.status === 'PROCESSING' || o.status === 'PACKED').length :
                            s === 'SHIPPED' ? orders.filter(o => o.status === 'SHIPPED' || o.status === 'OUT_FOR_DELIVERY').length :
                            orders.filter(o => o.status === 'DELIVERED').length;

              return (
                <div
                  key={s}
                  className="stat-card"
                  style={{ cursor: 'pointer', padding: '14px 16px', borderColor: filter === s ? 'var(--teal)' : '', background: filter === s ? 'var(--teal4)' : '' }}
                  onClick={() => setFilter(s)}
                >
                  <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--txt3)' }}>{labelMap[s]}</div>
                  <div className="stat-n" style={{ fontSize: '22px', marginTop: '6px' }}>
                    {fmtNum(count)}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="table-card">
            <div className="table-hd">
              <div className="table-hd-left">
                <div className="table-title">All Orders</div>
                <div className="table-sub">{fmtNum(filteredOrders.length)} total orders</div>
              </div>
              <div className="table-hd-right" style={{ gap: '10px', flexWrap: 'wrap' }}>
                {/* Date filters */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--txt2)' }}>From:</span>
                  <input
                    type="date"
                    className="tbl-search"
                    style={{ width: '130px', padding: '6px 10px', height: '36px' }}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--txt2)' }}>To:</span>
                  <input
                    type="date"
                    className="tbl-search"
                    style={{ width: '130px', padding: '6px 10px', height: '36px' }}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
                <input
                  className="tbl-search"
                  placeholder="Search order / customer / AWB..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <select
                  className="tbl-select"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="ALL">All Orders</option>
                  <option value="PENDING">New</option>
                  <option value="CONFIRMED">Ready to Ship</option>
                  <option value="PROCESSING">Pickups & Manifests</option>
                  <option value="SHIPPED">In Transit</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="RETURNED">RTO</option>
                </select>

                {/* 🔄 Bulk Sync Button */}
                <button
                  type="button"
                  onClick={handleBulkSync}
                  disabled={syncing}
                  style={{
                    padding: '0 16px',
                    height: '36px',
                    fontSize: '13px',
                    fontWeight: 600,
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: syncing ? 'not-allowed' : 'pointer',
                    background: syncing ? '#94a3b8' : '#0f766e',
                    border: 'none',
                    color: 'white',
                    transition: 'background 0.2s',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {syncing ? '⏳ Syncing...' : '🔄 Sync Shiprocket'}
                </button>

                <button
                  type="button"
                  style={{
                    padding: '0 16px',
                    height: '36px',
                    fontSize: '13px',
                    fontWeight: 600,
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    background: '#008080',
                    border: 'none',
                    color: 'white'
                  }}
                  onClick={exportOrders}
                >
                  📥 Export CSV
                </button>
              </div>
            </div>

            {/* Sync result message */}
            {syncMsg && (
              <div style={{
                margin: '0 0 12px',
                padding: '10px 16px',
                borderRadius: '8px',
                background: syncMsg.startsWith('✅') ? '#f0fdf4' : '#fef2f2',
                border: `1px solid ${syncMsg.startsWith('✅') ? '#86efac' : '#fca5a5'}`,
                color: syncMsg.startsWith('✅') ? '#166534' : '#991b1b',
                fontSize: '13px',
                fontWeight: 600
              }}>
                {syncMsg}
              </div>
            )}

            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Items & Total</th>
                  <th>Payment</th>
                  <th>City</th>
                  <th>AWB / Courier</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: 'var(--txt2)' }}>Loading orders...</td></tr>
                ) : filteredOrders.length === 0 ? (
                  <tr><td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: 'var(--txt2)' }}>No orders found</td></tr>
                ) : filteredOrders.map((o, idx) => (
                  <tr key={idx}>
                    <td><span className="td-mono">{o.num}</span></td>
                    <td>
                      <div className="td-name">{o.customer}</div>
                      <div className="td-meta">{o.phone || '—'}</div>
                    </td>
                    <td>
                      <div className="td-bold">{fmt(o.total)}</div>
                      <div className="td-meta">{o.items} item(s)</div>
                    </td>
                    <td><span className="badge b-gray">{o.payment}</span></td>
                    <td>{o.city}</td>
                    <td>
                      {o.awb ? (
                        <>
                          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ink)', fontFamily: 'monospace' }}>{o.awb}</div>
                          {o.courier && <div className="td-meta">{o.courier}</div>}
                        </>
                      ) : (
                        <span style={{ color: 'var(--txt3)', fontSize: '12px' }}>—</span>
                      )}
                    </td>
                    <td>{fmtDateTime(o.date)}</td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', alignItems: 'flex-start' }}>
                        {statusBadge(o.status)}
                        {o.shiprocketStatus && srBadge(o.shiprocketStatus)}
                      </div>
                    </td>
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

      {/* ── Order Modal ── */}
      {isModalOpen && editingOrder && (
        <div className="modal-bg" onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false) }}>
          <div className="modal" style={{ maxWidth: '640px' }}>
            <div className="modal-hd">
              <div className="modal-title">Manage Order: {editingOrder.num}</div>
              <button className="modal-x" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>
            <div className="modal-body">
              {/* ── Shiprocket Status Info Bar ── */}
              {(editingOrder.awb || editingOrder.shiprocketStatus) && (
                <div style={{
                  marginBottom: '16px',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #f0fdf4, #ecfdf5)',
                  border: '1px solid #86efac',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '10px',
                  flexWrap: 'wrap'
                }}>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#166534', marginBottom: '4px' }}>
                      🚀 Shiprocket Live Status
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      {editingOrder.awb && (
                        <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '13px', color: '#0f172a' }}>
                          AWB: {editingOrder.awb}
                        </span>
                      )}
                      {editingOrder.courier && (
                        <span style={{ fontSize: '12px', color: '#64748b' }}>via {editingOrder.courier}</span>
                      )}
                      {editingOrder.shiprocketStatus && srBadge(editingOrder.shiprocketStatus)}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleSingleSync}
                    disabled={singleSyncing || !editingOrder.awb}
                    style={{
                      padding: '7px 14px',
                      background: singleSyncing ? '#94a3b8' : '#0f766e',
                      color: 'white',
                      border: 'none',
                      borderRadius: '7px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: singleSyncing || !editingOrder.awb ? 'not-allowed' : 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {singleSyncing ? '⏳ Syncing...' : '🔄 Sync Now'}
                  </button>
                </div>
              )}

              <div className="fg-row">
                <div className="fg">
                  <label>Customer</label>
                  <input type="text" disabled value={editingOrder.customer} />
                </div>
                <div className="fg">
                  <label>Phone Number</label>
                  <input type="text" disabled value={editingOrder.phone || '—'} />
                </div>
              </div>
              <div className="fg-row" style={{ marginTop: '12px' }}>
                <div className="fg">
                  <label>Order Status</label>
                  <select id="o-status" defaultValue={editingOrder.status}>
                    <option value="PENDING">New</option>
                    <option value="CONFIRMED">Ready to Ship</option>
                    <option value="PROCESSING">Pickups & Manifests</option>
                    <option value="SHIPPED">In Transit</option>
                    <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="CANCELLED">Cancelled</option>
                    <option value="RETURNED">RTO</option>
                  </select>
                </div>
                <div className="fg">
                  <label>Shipping City</label>
                  <input type="text" disabled value={editingOrder.city} />
                </div>
              </div>
              <div className="fg-row">
                <div className="fg">
                  <label>Payment Method</label>
                  <div style={{ padding: '8px 12px', background: 'var(--bg2)', borderRadius: '6px', border: '1px solid var(--bdr)' }}>
                    {editingOrder.payment === 'RAZORPAY' ? (
                      <div>
                        <strong style={{ color: '#3395FF' }}>Razorpay</strong>
                        {editingOrder.razorpayId && <div style={{ fontSize: '12px', color: 'var(--txt2)' }}>Txn ID: {editingOrder.razorpayId}</div>}
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

              {/* Items table */}
              <div style={{ marginTop: '20px', padding: '16px', background: 'var(--bg2)', borderRadius: '8px', border: '1px solid var(--bdr)' }}>
                <div style={{ fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>📦 Ordered Items</span>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--bdr)', textAlign: 'left', color: 'var(--txt2)' }}>
                        <th style={{ paddingBottom: '8px' }}>Item</th>
                        <th style={{ paddingBottom: '8px' }}>SKU</th>
                        <th style={{ paddingBottom: '8px' }}>Variant</th>
                        <th style={{ paddingBottom: '8px' }}>Qty</th>
                        <th style={{ paddingBottom: '8px' }}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(editingOrder.itemsList || []).map((item: any, idx: number) => (
                        <tr key={idx} style={{ borderBottom: '1px solid var(--bdr)' }}>
                          <td style={{ padding: '8px 0', fontWeight: 500 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <img src={item.imageUrl || 'https://via.placeholder.com/40'} alt={item.productName} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                              {item.productName}
                            </div>
                          </td>
                          <td style={{ padding: '8px 0', color: 'var(--txt2)' }}>{item.sku || '—'}</td>
                          <td style={{ padding: '8px 0', color: 'var(--txt2)' }}>{item.size} / {item.colorName}</td>
                          <td style={{ padding: '8px 0' }}>{item.quantity}</td>
                          <td style={{ padding: '8px 0', fontWeight: 600 }}>{fmt(item.totalPrice)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Shiprocket Integration */}
              <div style={{ marginTop: '20px', padding: '16px', background: 'var(--bg2)', borderRadius: '8px', border: '1px solid var(--bdr)' }}>
                <div style={{ fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>🚀 Shiprocket Integration</span>
                </div>

                <div className="fg-row" style={{ marginBottom: '12px' }}>
                  <div className="fg">
                    <label>Order Number (Edit if duplicate error on Shiprocket)</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input type="text" id="o-num-edit" defaultValue={editingOrder.num} style={{ flex: 1 }} />
                      <button type="button" className="btn-primary" style={{ padding: '0 16px', background: '#008080', border: 'none', color: 'white', borderRadius: '8px', cursor: 'pointer' }} onClick={async () => {
                        const newNum = (document.getElementById('o-num-edit') as HTMLInputElement).value;
                        if (!newNum || newNum === editingOrder.num) return alert("Please enter a new order number");
                        try {
                          const token = localStorage.getItem('token');
                          const res = await fetch(`${API_BASE}/orders/admin/${editingOrder.id}/rename?orderNumber=${encodeURIComponent(newNum)}`, {
                            method: 'PUT',
                            headers: { 'Authorization': `Bearer ${token}` }
                          });
                          const data = await res.json();
                          if (data.success) {
                            alert("Order number updated successfully.");
                            setOrders(orders.map(o => o.id === editingOrder.id ? { ...o, num: newNum } : o));
                          } else {
                            alert(data.message || "Failed to update order number");
                          }
                        } catch (e) {
                          alert("Failed to update order number");
                        }
                      }}>Rename</button>
                    </div>
                  </div>
                </div>

                <div className="fg-row">
                  <div className="fg">
                    <label>Push to Shiprocket</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => {
                        (async () => {
                          try {
                            const token = localStorage.getItem('token');
                            const res = await fetch(`${API_BASE}/orders/admin/${editingOrder.id}/shiprocket`, {
                              method: 'POST',
                              headers: { 'Authorization': `Bearer ${token}` }
                            });
                            const data = await res.json();
                            alert(data.success ? "Order pushed to Shiprocket successfully." : (data.message || "Failed to push"));
                          } catch (e) {
                            alert("Shiprocket push failed");
                          }
                        })();
                      }}>Push Async</button>
                      <button type="button" className="btn-secondary" style={{ flex: 1, backgroundColor: '#f1f5f9' }} onClick={() => {
                        (async () => {
                          try {
                            const token = localStorage.getItem('token');
                            const res = await fetch(`${API_BASE}/orders/admin/${editingOrder.id}/shiprocket-sync`, {
                              method: 'POST',
                              headers: { 'Authorization': 'Bearer ' + token }
                            });
                            const data = await res.json();
                            if (data.success) {
                              setDebugResponse(data.data);
                            } else {
                              alert(data.message || "Failed (Sync)");
                            }
                          } catch (e) {
                            alert("Sync push failed");
                          }
                        })();
                      }}>Push Sync (Debug)</button>
                    </div>
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

      {/* Debug Response Modal */}
      {debugResponse && (
        <div className="modal-bg" onClick={() => setDebugResponse(null)}>
          <div className="modal" style={{ maxWidth: '800px' }}>
            <div className="modal-hd">
              <div className="modal-title">Shiprocket Sync Debug Details</div>
              <button className="modal-x" onClick={() => setDebugResponse(null)}>✕</button>
            </div>
            <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              <pre style={{ background: '#f1f5f9', padding: '16px', borderRadius: '8px', overflowX: 'auto', whiteSpace: 'pre-wrap', fontSize: '13px', fontFamily: 'monospace', color: '#0f172a' }}>
                {debugResponse}
              </pre>
            </div>
            <div className="modal-foot">
              <button className="btn-primary" onClick={() => setDebugResponse(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
