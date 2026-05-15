'use client';

import React, { useState, useEffect } from 'react';
import AdminTopbar from '@/components/admin/AdminTopbar';
import { fmt } from '@/lib/adminData';

export default function AdminInventory() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?size=100`);
        const data = await res.json();
        if (data.success) {
          setProducts(data.data.content.map((p: any) => ({
            id: p.id,
            name: p.name,
            emoji: p.emoji || '📦',
            type: p.type,
            price: p.price,
            stock: p.variants ? p.variants.reduce((s: number, v: any) => s + v.stockQuantity, 0) : 0
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
