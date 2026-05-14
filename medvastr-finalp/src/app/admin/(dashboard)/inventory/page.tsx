'use client';

import React from 'react';
import AdminTopbar from '@/components/admin/AdminTopbar';
import { MOCK_ADMIN, fmt } from '@/lib/adminData';

export default function AdminInventory() {
  const products = MOCK_ADMIN.products;

  return (
    <>
      <AdminTopbar
        title="Inventory"
        sub="Stock levels and variant management"
        action={{ label: '+ Update Stock', onClick: () => alert('Stock Update Modal coming soon!') }}
      />
      <div className="admin-content">
        <div className="panel">
          <div className="table-card">
            <div className="table-hd">
              <div className="table-hd-left">
                <div className="table-title">Inventory Overview</div>
                <div className="table-sub">Stock levels across all products</div>
              </div>
              <div className="table-hd-right">
                <select className="tbl-select">
                  <option>All Stock</option>
                  <option>Low Stock (&lt;50)</option>
                  <option>Out of Stock</option>
                </select>
                <button className="btn-primary" onClick={() => alert('Stock Update Modal coming soon!')}>+ Update Stock</button>
              </div>
            </div>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Type</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className="td-flex">
                        <span style={{ fontSize: '22px', marginRight: '8px' }}>
                          {p.emoji}
                        </span>
                        <div className="td-name">{p.name}</div>
                      </div>
                    </td>
                    <td>
                      <span className="badge b-blue">{p.type}</span>
                    </td>
                    <td className="td-bold">{fmt(p.price)}</td>
                    <td>
                      <div className="td-bold">{p.stock}</div>
                    </td>
                    <td>
                      {(p.stock || 0) === 0 ? (
                        <span className="badge b-red">Out of Stock</span>
                      ) : (p.stock || 0) < 50 ? (
                        <span className="badge b-warn">Low Stock</span>
                      ) : (
                        <span className="badge b-grn">In Stock</span>
                      )}
                    </td>
                    <td>
                      <div className="act-btns">
                        <div className="act-btn edit" title="Update Stock">
                          📦
                        </div>
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
