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
          <div className="modal" style={{ maxWidth: '560px' }}>
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
    </>
  );
}
