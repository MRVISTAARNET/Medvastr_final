'use client';

import React, { useState } from 'react';
import AdminTopbar from '@/components/admin/AdminTopbar';
import { fmt } from '@/lib/adminData';
import { useApp } from '@/context/AppContext';

// Re-defining starRating as it's a UI helper
const getStars = (r: number) => {
  const full = Math.floor(r);
  return '★'.repeat(full) + '☆'.repeat(5 - full);
};

export default function AdminProducts() {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  
  const { products, addProduct, updateProduct, deleteProduct } = useApp();

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  const handleSave = () => {
    const name = (document.getElementById('p-name') as HTMLInputElement)?.value;
    const type = (document.getElementById('p-type') as HTMLSelectElement)?.value;
    const price = parseFloat((document.getElementById('p-price') as HTMLInputElement)?.value) || 0;
    const originalPrice = parseFloat((document.getElementById('p-oprice') as HTMLInputElement)?.value) || undefined;
    const badge = (document.getElementById('p-badge') as HTMLSelectElement)?.value || undefined;
    
    if (name && price) {
      if (editingProduct) {
        updateProduct({ ...editingProduct, name, type, price, originalPrice, badge });
        alert(`Product ${name} Updated Successfully!`);
      } else {
        const newProduct = {
          id: Date.now(),
          name,
          type,
          price,
          originalPrice,
          badge,
          rating: 0,
          active: true,
          emo: '📦',
          gen: 'unisex',
          clrs: ['#000'],
          szs: ['M'],
          imgs: ['/images/placeholder.jpg'],
          bg: '#f0f0f0'
        };
        addProduct(newProduct as any);
        alert('Product Added Successfully!');
      }
    }
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const openEditModal = (product: any) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  return (
    <>
      <AdminTopbar 
        title="Products" 
        sub="Manage your product catalogue" 
        action={{ label: '+ Add Product', onClick: openAddModal }}
      />
      <div className="admin-content">
        <div className="panel">
          <div className="table-card">
            <div className="table-hd">
              <div className="table-hd-left">
                <div className="table-title">Products</div>
                <div className="table-sub">{products.length} products in catalogue</div>
              </div>
              <div className="table-hd-right">
                <input 
                  className="tbl-search" 
                  placeholder="Search products..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <button className="btn-primary" onClick={openAddModal}>+ Add Product</button>
              </div>
            </div>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th><th>Type</th><th>Price</th><th>Stock</th><th>Rating</th><th>Badge</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className="td-flex">
                        <div className="td-avatar">{p.emo || '🥼'}</div>
                        <div>
                          <div className="td-name">{p.name}</div>
                          <div className="td-meta">ID: {p.id}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className="badge b-blue">{p.type}</span></td>
                    <td className="td-bold">{fmt(p.price)}</td>
                    <td><span className={((p as any).stock || 0) < 50 ? 'badge b-warn' : 'badge b-gray'}>{((p as any).stock || '—')}</span></td>
                    <td>
                      <span style={{ color: '#f59e0b', letterSpacing: '-1px' }}>{getStars(p.rating || 0)}</span> 
                      <span style={{ fontSize: '12px', color: 'var(--txt3)', marginLeft: '6px' }}>{p.rating || 0}</span>
                    </td>
                    <td>{p.badge ? <span className="badge b-purple">{p.badge}</span> : '-'}</td>
                    <td>{(p as any).active ? <span className="badge b-grn">Active</span> : <span className="badge b-red">Inactive</span>}</td>
                    <td>
                      <div className="act-btns">
                        <div className="act-btn edit" title="Edit" onClick={() => openEditModal(p)}>✏️</div>
                        <div className="act-btn del" title="Delete" onClick={() => { if(confirm(`Delete ${p.name}?`)) deleteProduct(p.id) }}>🗑️</div>
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
              <div className="modal-title">{editingProduct ? 'Edit Product' : 'Add New Product'}</div>
              <button className="modal-x" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="fg-row">
                <div className="fg">
                  <label>Product Name</label>
                  <input type="text" id="p-name" defaultValue={editingProduct?.name || ''} placeholder="Men's Classic V-Neck Scrub" />
                </div>
                <div className="fg">
                  <label>Type</label>
                  <select id="p-type" defaultValue={editingProduct?.type || 'scrubs'}>
                    <option value="scrubs">Scrubs</option>
                    <option value="labcoat">Lab Coat</option>
                    <option value="stethoscope">Stethoscope</option>
                    <option value="jacket">DRIFT Jacket</option>
                    <option value="underscrub">Underscrubs</option>
                    <option value="accessories">Accessories</option>
                  </select>
                </div>
              </div>
              <div className="fg-row">
                <div className="fg">
                  <label>Price (₹)</label>
                  <input type="number" id="p-price" defaultValue={editingProduct?.price || ''} placeholder="1099" />
                </div>
                <div className="fg">
                  <label>Original Price (₹)</label>
                  <input type="number" id="p-oprice" defaultValue={editingProduct?.originalPrice || ''} placeholder="Leave blank if no discount" />
                </div>
              </div>
              <div className="fg-row">
                <div className="fg">
                  <label>Gender</label>
                  <select id="p-gender" defaultValue={editingProduct?.gender || 'unisex'}>
                    <option value="men">Men</option>
                    <option value="women">Women</option>
                    <option value="unisex">Unisex</option>
                  </select>
                </div>
                <div className="fg">
                  <label>Badge</label>
                  <select id="p-badge" defaultValue={editingProduct?.badge || ''}>
                    <option value="">None</option>
                    <option value="Bestseller">Bestseller</option>
                    <option value="New">New</option>
                    <option value="Premium">Premium</option>
                    <option value="New Launch">New Launch</option>
                    <option value="10% Off">10% Off</option>
                  </select>
                </div>
              </div>
              <div className="fg">
                <label>Description</label>
                <textarea id="p-desc" defaultValue={editingProduct?.description || ''} placeholder="Product description..."></textarea>
              </div>
              <div className="fg-row">
                <div className="fg">
                  <label>Fabric</label>
                  <input type="text" id="p-fabric" defaultValue={editingProduct?.fabric || ''} placeholder="Classic / ecoflex™ / Modal" />
                </div>
                <div className="fg">
                  <label>Fit</label>
                  <input type="text" id="p-fit" defaultValue={editingProduct?.fit || ''} placeholder="Regular Fit / Slim Fit" />
                </div>
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleSave}>{editingProduct ? 'Update Product' : 'Add Product'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
