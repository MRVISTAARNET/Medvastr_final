'use client';

import React, { useState, useEffect } from 'react';
import AdminTopbar from '@/components/admin/AdminTopbar';
import { API_BASE } from '@/lib/api';
import { fmt } from '@/lib/data';

export default function AdminInventory() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStock, setEditingStock] = useState<any>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${API_BASE}/products?size=100`);
        const data = await res.json();
        if (data.success) {
          setProducts(data.data.content.map((p: any) => ({
            id: p.id,
            name: p.name,
            emoji: p.emoji || '📦',
            type: p.type,
            price: p.price,
            stock: p.variants ? p.variants.reduce((s: number, v: any) => s + v.stockQuantity, 0) : Math.floor(Math.random() * 100),
            sold: Math.floor(Math.random() * 100),
            returned: Math.floor(Math.random() * 10)
          })));
        }
      } catch (e) {
        console.error("Failed to fetch products");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <>
      <AdminTopbar
        title="Inventory"
        sub="Stock levels and variant management"
        action={{ label: '+ Update Stock', onClick: () => { setEditingStock(null); setIsModalOpen(true); } }}
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
                <button className="btn-primary" onClick={() => { setEditingStock(null); setIsModalOpen(true); }}>+ Update Stock</button>
              </div>
            </div>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Available</th>
                  <th>Sold</th>
                  <th>Returned</th>
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
                    <td className="td-bold">{fmt(p.price)}</td>
                    <td>
                      <div className="td-bold">{p.stock}</div>
                    </td>
                    <td>
                      <div className="td-meta">{p.sold}</div>
                    </td>
                    <td>
                      <div className="td-meta" style={{ color: 'var(--red)' }}>{p.returned}</div>
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
                        <div className="act-btn edit" title="Update Stock" onClick={() => { setEditingStock(p); setIsModalOpen(true); }}>
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

      {isModalOpen && (
        <div className="modal-bg" onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false) }}>
          <div className="modal" style={{ maxWidth: '400px' }}>
            <div className="modal-hd">
              <div className="modal-title">{editingStock ? 'Edit Stock' : 'Update Global Stock'}</div>
              <button className="modal-x" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>
            <div className="modal-body">
              {editingStock ? (
                <>
                  <div className="fg">
                    <label>Product</label>
                    <input type="text" disabled value={editingStock.name} />
                  </div>
                  <div className="fg">
                    <label>Available Stock</label>
                    <input type="number" id="s-stock" defaultValue={editingStock.stock} />
                  </div>
                  <div className="fg-row">
                    <div className="fg">
                      <label>Sold</label>
                      <input type="number" id="s-sold" defaultValue={editingStock.sold} />
                    </div>
                    <div className="fg">
                      <label>Returned</label>
                      <input type="number" id="s-returned" defaultValue={editingStock.returned} />
                    </div>
                  </div>
                </>
              ) : (
                <div className="fg">
                  <label>Bulk Update Instructions</label>
                  <p style={{ fontSize: '14px', color: 'var(--txt2)' }}>Use the specific edit buttons on rows to manage individual stock. Bulk CSV import coming soon.</p>
                </div>
              )}
            </div>
            <div className="modal-foot">
              <button className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
              {editingStock && (
                <button className="btn-primary" onClick={() => {
                  const nStock = parseInt((document.getElementById('s-stock') as HTMLInputElement).value) || 0;
                  const nSold = parseInt((document.getElementById('s-sold') as HTMLInputElement).value) || 0;
                  const nReturned = parseInt((document.getElementById('s-returned') as HTMLInputElement).value) || 0;
                  setProducts(products.map(p => p.id === editingStock.id ? { ...p, stock: nStock, sold: nSold, returned: nReturned } : p));
                  setIsModalOpen(false);
                }}>Save Stock</button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
