'use client';

import React, { useState, useEffect } from 'react';
import AdminTopbar from '@/components/admin/AdminTopbar';
import { fmtDate } from '@/lib/data';
import { API_BASE, authHeaders } from '@/lib/api';

const getStars = (r: number) => {
  const full = Math.floor(r);
  return '★'.repeat(full) + '☆'.repeat(5 - full);
};

export default function AdminReviews() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED'>('ALL');
  const [form, setForm] = useState({ productId: '', rating: '5', title: '', body: '' });
  const [saving, setSaving] = useState(false);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_BASE}/products?size=200`);
      const data = await res.json();
      if (data.success) setProducts(data.data.content);
    } catch (e) { }
  };

  const fetchAllReviews = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/products/reviews/all?size=200`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setReviews(data.data.content || []);
      }
    } catch (e) { }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
    fetchAllReviews();
  }, []);

  const handleApprove = async (reviewId: number) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/products/reviews/${reviewId}/approve`, {
        method: 'POST',
        headers: authHeaders(token),
      });
      const data = await res.json();
      if (data.success) {
        setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, approved: true } : r));
      }
    } catch (e) { alert('Error approving review'); }
  };

  const handleReject = async (reviewId: number) => {
    if (!confirm('Are you sure you want to reject and delete this review?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/products/reviews/${reviewId}/reject`, {
        method: 'DELETE',
        headers: authHeaders(token),
      });
      if (res.ok) {
        setReviews(prev => prev.filter(r => r.id !== reviewId));
      }
    } catch (e) { alert('Error rejecting review'); }
  };

  const handleSave = async () => {
    if (!form.productId || !form.body) return alert('Please fill required fields');
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/products/${form.productId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
        body: JSON.stringify({ rating: parseInt(form.rating), title: form.title, body: form.body })
      });
      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        setForm({ productId: '', rating: '5', title: '', body: '' });
        fetchAllReviews();
      } else {
        alert(data.message || 'Failed to add review');
      }
    } catch (e) { alert('Connection error'); }
    setSaving(false);
  };

  const filtered = reviews.filter(r => {
    if (filter === 'PENDING') return !r.approved;
    if (filter === 'APPROVED') return r.approved;
    return true;
  });

  const pendingCount = reviews.filter(r => !r.approved).length;

  return (
    <>
      <AdminTopbar
        title="Reviews"
        sub="Moderate product reviews — approve or reject customer feedback"
        action={{ label: '+ Add Review', onClick: () => setIsModalOpen(true) }}
      />
      <div className="admin-content">
        <div className="panel">
          <div className="table-card">
            <div className="table-hd">
              <div className="table-hd-left">
                <div className="table-title">Product Reviews</div>
                <div className="table-sub">{reviews.length} total · {pendingCount} pending approval</div>
              </div>
              <div className="table-hd-right">
                <button className="btn-primary" onClick={() => setIsModalOpen(true)}>+ Add Review</button>
                <select
                  className="tbl-select"
                  value={filter}
                  onChange={e => setFilter(e.target.value as any)}
                >
                  <option value="ALL">All Reviews</option>
                  <option value="PENDING">Pending ({pendingCount})</option>
                  <option value="APPROVED">Approved</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--txt3)' }}>Loading reviews...</div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Customer</th>
                      <th>Rating</th>
                      <th>Review</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--txt3)' }}>
                          No reviews found.
                        </td>
                      </tr>
                    ) : (
                      filtered.map((r) => (
                        <tr key={r.id}>
                          <td className="td-bold">{r.productName || 'Unknown Product'}</td>
                          <td>{r.userName || r.customer || 'Customer'}</td>
                          <td>
                            <span style={{ color: '#f59e0b', letterSpacing: '-1px' }}>
                              {getStars(r.rating)}
                            </span>{' '}
                            <span style={{ fontSize: 12, color: 'var(--txt3)' }}>{r.rating}</span>
                          </td>
                          <td
                            style={{
                              maxWidth: '240px',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              fontSize: '13px',
                              color: 'var(--txt2)',
                            }}
                          >
                            {r.title && <strong>{r.title}: </strong>}
                            {r.body || r.text}
                          </td>
                          <td>{fmtDate(r.createdAt || r.date)}</td>
                          <td>
                            {r.approved ? (
                              <span className="badge b-grn">✓ Approved</span>
                            ) : (
                              <span className="badge b-warn">⏳ Pending</span>
                            )}
                          </td>
                          <td>
                            <div className="act-btns">
                              {!r.approved && (
                                <button
                                  className="act-btn edit"
                                  title="Approve"
                                  onClick={() => handleApprove(r.id)}
                                  style={{ background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', padding: '4px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
                                >
                                  ✅ Approve
                                </button>
                              )}
                              <button
                                className="act-btn del"
                                title="Reject & Delete"
                                onClick={() => handleReject(r.id)}
                                style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '4px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
                              >
                                🚫 Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-bg" onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false) }}>
          <div className="modal" style={{ maxWidth: '500px' }}>
            <div className="modal-hd">
              <div className="modal-title">Add Manual Review</div>
              <button type="button" className="modal-x" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="fg">
                <label>Select Product *</label>
                <select
                  value={form.productId}
                  onChange={e => setForm(p => ({ ...p, productId: e.target.value }))}
                  style={{ width: '100%', height: '42px', borderRadius: 8, border: '1.5px solid #eee', padding: '0 12px' }}
                >
                  <option value="">-- Choose Product --</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="fg">
                <label>Rating *</label>
                <select
                  value={form.rating}
                  onChange={e => setForm(p => ({ ...p, rating: e.target.value }))}
                  style={{ width: '100%', height: '42px', borderRadius: 8, border: '1.5px solid #eee', padding: '0 12px' }}
                >
                  {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} Stars {'★'.repeat(n)}</option>)}
                </select>
              </div>
              <div className="fg">
                <label>Review Title (Optional)</label>
                <input type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Amazing quality" />
              </div>
              <div className="fg">
                <label>Review Body *</label>
                <textarea value={form.body} onChange={e => setForm(p => ({ ...p, body: e.target.value }))} placeholder="Write the review here..." style={{ height: '100px' }} />
              </div>
              <div style={{ fontSize: 12, color: '#888', background: '#fffbeb', borderRadius: 8, padding: '10px 14px', border: '1px solid #fde68a' }}>
                ℹ️ This review will be submitted as <strong>Pending</strong>. You can approve it from the reviews table.
              </div>
            </div>
            <div className="modal-foot">
              <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button type="button" className="btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
