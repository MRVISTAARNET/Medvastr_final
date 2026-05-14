'use client';

import React, { useState } from 'react';
import AdminTopbar from '@/components/admin/AdminTopbar';
import { MOCK_ADMIN, fmt, fmtNum, fmtDate } from '@/lib/adminData';

export default function AdminPromos() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [promos, setPromos] = useState(MOCK_ADMIN.promos);

  const handleSave = () => {
    const code = (document.getElementById('promo-code') as HTMLInputElement)?.value?.toUpperCase();
    const type = (document.getElementById('promo-type') as HTMLSelectElement)?.value;
    const discount = parseFloat((document.getElementById('promo-val') as HTMLInputElement)?.value) || 0;
    
    if (code) {
      const newPromo = {
        id: Date.now(),
        code,
        type,
        discount,
        minOrder: parseFloat((document.getElementById('promo-min') as HTMLInputElement)?.value) || 0,
        uses: 0,
        maxUses: parseInt((document.getElementById('promo-max') as HTMLInputElement)?.value) || 100,
        expiry: (document.getElementById('promo-exp') as HTMLInputElement)?.value || '2027-01-01',
        active: true
      };
      setPromos([newPromo, ...promos]);
      alert('Promo Code Added Successfully!');
    }
    setIsModalOpen(false);
  };

  return (
    <>
      <AdminTopbar
        title="Promo Codes"
        sub="Create and manage discount codes"
        action={{ label: '+ Add Promo Code', onClick: () => setIsModalOpen(true) }}
      />
      <div className="admin-content">
        <div className="panel">
          <div className="stats-grid" style={{ marginBottom: '22px' }}>
            <StatCard ico="🎟️" label="Active Promos" val={promos.filter((p) => p.active).length.toString()} sub="currently live" dir="neu" bg="#daf3ef" />
            <StatCard ico="📊" label="Total Redemptions" val={fmtNum(promos.reduce((s, p) => s + (p.uses || 0), 0))} sub="all time" dir="up" bg="#dbeafe" />
            <StatCard ico="💸" label="Avg Discount" val="18.75%" sub="across all codes" dir="neu" bg="#fef5e4" />
            <StatCard ico="🔝" label="Top Code" val="MEDVASTR10" sub={`${fmtNum(1842)} uses`} dir="up" bg="#ede9fe" />
          </div>
          <div className="table-card">
            <div className="table-hd">
              <div className="table-hd-left">
                <div className="table-title">Promo Codes</div>
                <div className="table-sub">{promos.length} codes</div>
              </div>
              <button className="btn-primary" onClick={() => setIsModalOpen(true)}>+ Add Promo Code</button>
            </div>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Discount</th>
                  <th>Min Order</th>
                  <th>Uses</th>
                  <th>Expiry</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {promos.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <span className="td-mono" style={{ fontSize: '14px', fontWeight: 700, color: 'var(--navy)' }}>
                        {p.code}
                      </span>
                    </td>
                    <td className="td-bold">
                      {p.type === 'FLAT' ? fmt(p.discount) : `${p.discount}% off`}
                    </td>
                    <td>{p.minOrder > 0 ? fmt(p.minOrder) : 'No minimum'}</td>
                    <td>
                      <div className="td-bold">{fmtNum(p.uses)}</div>
                      <div className="td-meta">of {fmtNum(p.maxUses)} max</div>
                    </td>
                    <td>{fmtDate(p.expiry)}</td>
                    <td>
                      {p.active ? (
                        <span className="badge b-grn">Active</span>
                      ) : (
                        <span className="badge b-red">Expired</span>
                      )}
                    </td>
                    <td>
                      <div className="act-btns">
                        <div className="act-btn edit" title="Edit">✏️</div>
                        <div className="act-btn del" title="Delete" onClick={() => { if(confirm('Delete promo?')) setPromos(promos.filter(promo => promo.id !== p.id)) }}>🗑️</div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-bg" onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false) }}>
          <div className="modal">
            <div className="modal-hd">
              <div className="modal-title">Add Promo Code</div>
              <button className="modal-x" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="fg-row">
                <div className="fg">
                  <label>Promo Code</label>
                  <input type="text" id="promo-code" placeholder="SAVE20" style={{ textTransform: 'uppercase' }} />
                </div>
                <div className="fg">
                  <label>Discount Type</label>
                  <select id="promo-type">
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FLAT">Flat Amount (₹)</option>
                  </select>
                </div>
              </div>
              <div className="fg-row">
                <div className="fg">
                  <label>Discount Value</label>
                  <input type="number" id="promo-val" placeholder="20" />
                </div>
                <div className="fg">
                  <label>Min Order (₹)</label>
                  <input type="number" id="promo-min" placeholder="0" />
                </div>
              </div>
              <div className="fg-row">
                <div className="fg">
                  <label>Max Uses</label>
                  <input type="number" id="promo-max" placeholder="1000" />
                </div>
                <div className="fg">
                  <label>Expiry Date</label>
                  <input type="date" id="promo-exp" />
                </div>
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleSave}>Save</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function StatCard({ ico, label, val, sub, dir, bg }: any) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <div className="stat-ico" style={{ background: bg }}>
          {ico}
        </div>
        <div className={`stat-badge badge-${dir === 'up' ? 'up' : dir === 'dn' ? 'dn' : 'neu'}`}>
          {dir === 'up' ? '↑' : dir === 'dn' ? '↓' : '—'} {sub.split(' ')[0]}
        </div>
      </div>
      <div className="stat-n">{val}</div>
      <div className="stat-l">{label}</div>
    </div>
  );
}
