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

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_BASE}/products?size=100`);
      const data = await res.json();
      if (data.success) setProducts(data.data.content);
    } catch (e) { }
  };

  const fetchAllReviews = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/products/reviews/all?size=100`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setReviews((data.data.content || []).map((r: any) => ({
          id: r.id,
          product: r.productName || 'Product',
          customer: r.userName || 'Customer',
          rating: r.rating,
          text: r.body,
          date: r.createdAt,
          status: 'APPROVED'
        })));
      }
    } catch (e) { }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
    fetchAllReviews();
  }, []);

  const handleSave = async () => {
    const pid = (document.getElementById('rev-prod') as HTMLSelectElement)?.value;
    const rating = (document.getElementById('rev-rat') as HTMLSelectElement)?.value;
    const title = (document.getElementById('rev-tit') as HTMLInputElement)?.value;
    const body = (document.getElementById('rev-body') as HTMLTextAreaElement)?.value;

    if (!pid || !rating || !body) return alert('Please fill required fields');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/products/${pid}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rating: parseInt(rating), title, body })
      });
      const data = await res.json();
      if (data.success) {
        alert('Review added successfully!');
        setIsModalOpen(false);
        fetchAllReviews();
      } else {
        alert(data.message || 'Failed to add review');
      }
    } catch (e) {
      alert('Connection error');
    }
  };

  return (
    <>
      <AdminTopbar
        title="Reviews"
        sub="Monitor and moderate product reviews"
        action={{ label: '+ Add Review', onClick: () => setIsModalOpen(true) }}
      />
      <div className="admin-content">
        <div className="panel">
          <div className="table-card">
            <div className="table-hd">
              <div className="table-hd-left">
                <div className="table-title">Product Reviews</div>
                <div className="table-sub">{reviews.length} reviews</div>
              </div>
              <div className="table-hd-right">
                <button className="btn-primary" onClick={() => setIsModalOpen(true)} style={{ marginRight: '10px' }}>+ Add Review</button>
                <select className="tbl-select">
                  <option>All Reviews</option>
                  <option>PENDING</option>
                  <option>APPROVED</option>
                </select>
              </div>
            </div>
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
                {reviews.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--txt3)' }}>No reviews found. Click "+ Add Review" to create one.</td></tr>
                ) : (
                  reviews.map((r) => (
                    <tr key={r.id}>
                      <td className="td-bold">{r.product}</td>
                      <td>{r.customer}</td>
                      <td>
                        <span style={{ color: '#f59e0b', letterSpacing: '-1px' }}>
                          {getStars(r.rating)}
                        </span>{' '}
                        {r.rating}
                      </td>
                      <td
                        style={{
                          maxWidth: '280px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          fontSize: '13px',
                          color: 'var(--txt2)',
                        }}
                      >
                        {r.text}
                      </td>
                      <td>{fmtDate(r.date)}</td>
                      <td>
                        {r.status === 'APPROVED' ? (
                          <span className="badge b-grn">Approved</span>
                        ) : (
                          <span className="badge b-warn">Pending</span>
                        )}
                      </td>
                      <td>
                        <div className="act-btns">
                          <div className="act-btn edit" title="Approve">✅</div>
                          <div className="act-btn del" title="Reject">🚫</div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-bg" onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false) }}>
          <div className="modal" style={{ maxWidth: '500px' }}>
            <div className="modal-hd">
              <div className="modal-title">Add Manual Review</div>
              <button className="modal-x" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="fg">
                <label>Select Product</label>
                <select id="rev-prod" className="tbl-select" style={{ width: '100%', height: '42px' }}>
                  <option value="">-- Choose Product --</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="fg">
                <label>Rating</label>
                <select id="rev-rat" className="tbl-select" style={{ width: '100%', height: '42px' }}>
                  {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} Stars</option>)}
                </select>
              </div>
              <div className="fg">
                <label>Review Title (Optional)</label>
                <input type="text" id="rev-tit" placeholder="e.g. Amazing quality" />
              </div>
              <div className="fg">
                <label>Review Body</label>
                <textarea id="rev-body" placeholder="Write the review here..." style={{ height: '100px' }}></textarea>
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleSave}>Submit Review</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
