'use client';

import React from 'react';
import AdminTopbar from '@/components/admin/AdminTopbar';
import { INITIAL_ADMIN_DATA, fmtDate } from '@/lib/adminData';

const getStars = (r: number) => {
  const full = Math.floor(r);
  return '★'.repeat(full) + '☆'.repeat(5 - full);
};

export default function AdminReviews() {
  const reviews = INITIAL_ADMIN_DATA.reviews;

  return (
    <>
      <AdminTopbar
        title="Reviews"
        sub="Monitor and moderate product reviews"
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
                {reviews.map((r) => (
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
