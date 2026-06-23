'use client';

import React, { useState, useEffect } from 'react';
import AdminTopbar from '@/components/admin/AdminTopbar';
import { API_BASE, authHeaders } from '@/lib/api';
import { fmt } from '@/lib/data';

export default function AdminInventory() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [variantStocks, setVariantStocks] = useState<Record<number, number>>({});
  const [saving, setSaving] = useState(false);

  // Stock logs state
  const [selectedVariantForLogs, setSelectedVariantForLogs] = useState<any>(null);
  const [logsList, setLogsList] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_BASE}/products?size=200`);
      const data = await res.json();
      if (data.success) {
        const mapped = data.data.content.map((p: any) => ({
          id: p.id,
          name: p.name,
          emoji: p.emoji || '📦',
          type: p.type,
          price: p.price,
          variants: p.variants || [],
          stock: (p.variants || []).reduce((s: number, v: any) => s + (v.stockQuantity || 0), 0),
        }));
        setProducts(mapped);
      }
    } catch {
      console.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const loadVariantLogs = async (v: any) => {
    setSelectedVariantForLogs(v);
    setLoadingLogs(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE}/admin/inventory/variants/${v.id}/logs`, {
        headers: { ...authHeaders(token) }
      });
      const data = await res.json();
      if (data.success) {
        setLogsList(data.data || []);
      }
    } catch {
      alert("Failed to fetch logs");
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openVariantEditor = (product: any) => {
    const stocks: Record<number, number> = {};
    for (const v of product.variants || []) {
      stocks[v.id] = v.stockQuantity || 0;
    }
    setVariantStocks(stocks);
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const saveVariantStock = async () => {
    if (!editingProduct) return;
    setSaving(true);
    const token = localStorage.getItem("token");
    try {
      const updates = Object.entries(variantStocks).map(([variantId, stockQuantity]) => ({
        variantId: Number(variantId),
        stockQuantity: Number(stockQuantity),
      }));
      const res = await fetch(`${API_BASE}/admin/inventory/variants/bulk`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders(token) },
        body: JSON.stringify({ updates }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchProducts();
        setIsModalOpen(false);
        setEditingProduct(null);
      } else {
        alert(data.message || "Failed to update stock");
      }
    } catch {
      alert("Failed to update stock");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <AdminTopbar
        title="Inventory"
        sub="Variant-level stock management"
      />
      <div className="admin-content">
        <div className="panel">
          <div className="table-card">
            <div className="table-hd">
              <div className="table-hd-left">
                <div className="table-title">Inventory Overview</div>
                <div className="table-sub">Stock levels across all product variants</div>
              </div>
            </div>
            {loading ? (
              <div style={{ padding: 40, textAlign: "center" }}>Loading inventory...</div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Variants</th>
                    <th>Total Stock</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <div className="td-flex">
                          <span style={{ fontSize: '22px', marginRight: '8px' }}>{p.emoji}</span>
                          <div>
                            <div className="td-name">{p.name}</div>
                            <div className="td-meta">{fmt(p.price)}</div>
                          </div>
                        </div>
                      </td>
                      <td>{(p.variants || []).length}</td>
                      <td><div className="td-bold">{p.stock}</div></td>
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
                        <button className="act-btn edit" title="Manage Variants" onClick={() => openVariantEditor(p)}>
                          📦
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {isModalOpen && editingProduct && (
        <div className="modal-bg" onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false) }}>
          <div className="modal" style={{ maxWidth: '600px' }}>
            <div className="modal-hd">
              <div className="modal-title">Variant Stock — {editingProduct.name}</div>
              <button className="modal-x" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>
            <div className="modal-body" style={{ maxHeight: 420, overflowY: 'auto' }}>
              {(editingProduct.variants || []).map((v: any) => (
                <div key={v.id} className="fg-row" style={{ alignItems: 'center', marginBottom: 12 }}>
                  <div className="fg" style={{ flex: 2 }}>
                    <label>{v.colorName || 'Color'} / {v.size || 'Size'}</label>
                    <input type="text" disabled value={v.sku || v.barcode || `Variant #${v.id}`} />
                  </div>
                  <div className="fg" style={{ flex: 1 }}>
                    <label>Stock</label>
                    <input
                      type="number"
                      min={0}
                      value={variantStocks[v.id] ?? 0}
                      onChange={(e) => setVariantStocks((prev) => ({
                        ...prev,
                        [v.id]: parseInt(e.target.value) || 0,
                      }))}
                    />
                  </div>
                  <button type="button" className="btn-secondary" style={{ padding: '6px 10px', marginTop: '20px' }} onClick={() => loadVariantLogs(v)}>
                    Logs 📋
                  </button>
                </div>
              ))}
            </div>
            <div className="modal-foot">
              <button className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button className="btn-primary" disabled={saving} onClick={saveVariantStock}>
                {saving ? 'Saving...' : 'Save Stock'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stock Logs Modal */}
      {selectedVariantForLogs && (
        <div className="modal-bg" onClick={() => setSelectedVariantForLogs(null)} style={{ zIndex: 11000 }}>
          <div className="modal" style={{ maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-hd">
              <div className="modal-title">Inventory Logs — {selectedVariantForLogs.sku || `Variant #${selectedVariantForLogs.id}`}</div>
              <button className="modal-x" onClick={() => setSelectedVariantForLogs(null)}>✕</button>
            </div>
            <div className="modal-body" style={{ maxHeight: 350, overflowY: 'auto' }}>
              {loadingLogs ? (
                <div style={{ padding: 20, textAlign: 'center' }}>Loading logs...</div>
              ) : logsList.length === 0 ? (
                <div style={{ padding: 20, textAlign: 'center', color: '#64748b' }}>No transaction history for this variant.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {logsList.map((log: any) => (
                    <div key={log.id} style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }}>
                      <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <strong style={{
                          color: log.actionType === 'PURCHASE' ? '#991b1b' : 
                                 log.actionType === 'INITIAL_CREATION' ? '#166534' : 
                                 log.actionType === 'ORDER_CANCELLED' ? '#075985' : '#854d0e'
                        }}>{log.actionType}</strong>
                        <span style={{ color: '#64748b', fontSize: '11px' }}>{new Date(log.createdAt).toLocaleString()}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '15px', color: '#334155' }}>
                        <div>Qty Change: <strong style={{ color: log.changeQuantity >= 0 ? 'green' : 'red' }}>{log.changeQuantity >= 0 ? `+${log.changeQuantity}` : log.changeQuantity}</strong></div>
                        <div>Prev: <strong>{log.previousStock}</strong></div>
                        <div>New: <strong>{log.newStock}</strong></div>
                      </div>
                      {log.notes && <div style={{ marginTop: '6px', fontSize: '12px', color: '#64748b', fontStyle: 'italic' }}>Note: {log.notes}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="modal-foot">
              <button className="btn-secondary" onClick={() => setSelectedVariantForLogs(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
