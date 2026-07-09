'use client';

import React, { useState, useEffect } from 'react';
import AdminTopbar from '@/components/admin/AdminTopbar';
import { fmtDate } from '@/lib/data';
import { API_BASE, authHeaders } from '@/lib/api';

export default function AdminFeedback() {
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  const fetchFeedbacks = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/orders/feedback/admin?page=${page}&size=50`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.data) {
        setFeedbacks(data.data.content || []);
      }
    } catch (e) {
      console.error('Failed to fetch feedbacks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, [page]);

  const getRatingBadge = (rating: number) => {
    if (rating >= 9) return <span className="badge b-grn" style={{ padding: '4px 10px', fontSize: '13px' }}>💚 {rating} (Promoter)</span>;
    if (rating >= 7) return <span className="badge b-warn" style={{ padding: '4px 10px', fontSize: '13px' }}>💛 {rating} (Passive)</span>;
    return <span className="badge b-red" style={{ padding: '4px 10px', fontSize: '13px' }}>❤️ {rating} (Detractor)</span>;
  };

  // Compute stats
  const totalCount = feedbacks.length;
  const promoters = feedbacks.filter(f => f.rating >= 9).length;
  const passives = feedbacks.filter(f => f.rating >= 7 && f.rating <= 8).length;
  const detractors = feedbacks.filter(f => f.rating <= 6).length;

  const promoterPct = totalCount > 0 ? Math.round((promoters / totalCount) * 100) : 0;
  const detractorPct = totalCount > 0 ? Math.round((detractors / totalCount) * 100) : 0;
  const npsScore = promoterPct - detractorPct;

  const avgRating = totalCount > 0 
    ? (feedbacks.reduce((acc, curr) => acc + curr.rating, 0) / totalCount).toFixed(1) 
    : '0.0';

  return (
    <>
      <AdminTopbar
        title="Customer Feedback"
        sub="Track customer satisfaction, Net Promoter Scores (NPS), and delivery experiences"
      />
      <div className="admin-content">
        <div className="panel">
          
          {/* NPS and Ratings Overview */}
          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '22px' }}>
            <div className="stat-card">
              <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--txt3)' }}>
                NPS SCORE
              </div>
              <div className="stat-n" style={{ fontSize: '28px', marginTop: '6px', color: npsScore >= 50 ? 'var(--green)' : (npsScore >= 0 ? '#f59e0b' : 'var(--red)') }}>
                {npsScore > 0 ? `+${npsScore}` : npsScore}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--txt2)', marginTop: '4px' }}>
                Promoters - Detractors
              </div>
            </div>

            <div className="stat-card">
              <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--txt3)' }}>
                AVG RATING
              </div>
              <div className="stat-n" style={{ fontSize: '28px', marginTop: '6px' }}>
                ⭐ {avgRating} <span style={{ fontSize: '14px', color: 'var(--txt3)' }}>/ 10</span>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--txt2)', marginTop: '4px' }}>
                Based on {totalCount} reviews
              </div>
            </div>

            <div className="stat-card">
              <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--txt3)' }}>
                SATISFACTION BREAKDOWN
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <span className="badge b-grn" style={{ flex: 1, textAlign: 'center' }}>🎉 {promoterPct}%</span>
                <span className="badge b-warn" style={{ flex: 1, textAlign: 'center' }}>⚖️ {totalCount > 0 ? Math.round((passives / totalCount) * 100) : 0}%</span>
                <span className="badge b-red" style={{ flex: 1, textAlign: 'center' }}>⚠️ {detractorPct}%</span>
              </div>
              <div style={{ fontSize: '10px', color: 'var(--txt2)', marginTop: '6px', textAlign: 'center' }}>
                Promoters · Passives · Detractors
              </div>
            </div>

            <div className="stat-card">
              <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--txt3)' }}>
                TOTAL RESPONSES
              </div>
              <div className="stat-n" style={{ fontSize: '28px', marginTop: '6px' }}>
                {totalCount}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--txt2)', marginTop: '4px' }}>
                Customer submissions
              </div>
            </div>
          </div>

          <div className="table-card">
            <div className="table-hd">
              <div className="table-hd-left">
                <div className="table-title">All Customer Responses</div>
                <div className="table-sub">{totalCount} submissions found</div>
              </div>
            </div>

            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--txt3)' }}>Loading feedback data...</div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer Details</th>
                      <th>Score Rating</th>
                      <th>Customer Remarks</th>
                      <th>Submission Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feedbacks.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--txt3)' }}>
                          No customer experience feedback submitted yet.
                        </td>
                      </tr>
                    ) : (
                      feedbacks.map((f) => (
                        <tr key={f.id}>
                          <td><span className="td-mono">{f.orderNumber}</span></td>
                          <td>
                            <div className="td-name">{f.customerName}</div>
                            <div className="td-meta">{f.customerEmail}</div>
                          </td>
                          <td>{getRatingBadge(f.rating)}</td>
                          <td style={{ 
                            maxWidth: '300px', 
                            fontSize: '13px', 
                            color: 'var(--txt2)', 
                            lineHeight: '1.5',
                            whiteSpace: 'pre-wrap'
                          }}>
                            {f.remarks && f.remarks.trim() ? (
                              `"${f.remarks}"`
                            ) : (
                              <span style={{ fontStyle: 'italic', color: 'var(--txt3)' }}>No comments provided</span>
                            )}
                          </td>
                          <td>{fmtDate(f.createdAt)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
            
            {feedbacks.length > 0 && (
              <div className="tbl-pag">
                <div className="tbl-pag-info">Showing page {page + 1} of responses</div>
                <div className="pag-btns">
                  <button className="pag-btn" disabled={page === 0} onClick={() => setPage(page - 1)}>‹</button>
                  <button className="pag-btn on">{page + 1}</button>
                  <button className="pag-btn" onClick={() => setPage(page + 1)}>›</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
