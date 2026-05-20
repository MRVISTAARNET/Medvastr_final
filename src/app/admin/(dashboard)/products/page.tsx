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
    const badge = (document.getElementById('p-badge') as HTMLSelectElement)?.value || '';
    const desc = (document.getElementById('p-desc') as HTMLTextAreaElement)?.value || '';
    const gender = (document.getElementById('p-gender') as HTMLSelectElement)?.value || 'unisex';
    const fabric = (document.getElementById('p-fabric') as HTMLInputElement)?.value || '';
    const fit = (document.getElementById('p-fit') as HTMLInputElement)?.value || '';
    const catId = parseInt((document.getElementById('p-cat') as HTMLSelectElement)?.value) || undefined;
    const imgUrl = (document.getElementById('p-img') as HTMLInputElement)?.value || '';
    const emoji = (document.getElementById('p-emo') as HTMLInputElement)?.value || '📦';
    const sku = (document.getElementById('p-sku') as HTMLInputElement)?.value || '';
    const brand = (document.getElementById('p-brand') as HTMLInputElement)?.value || 'Medvastr';
    const sizesStr = (document.getElementById('p-sizes') as HTMLInputElement)?.value || '';
    const colorsStr = (document.getElementById('p-colors') as HTMLInputElement)?.value || '';
    const barcode = (document.getElementById('p-barcode') as HTMLInputElement)?.value || '';
    
    if (name && price) {
      const pData: any = {
        name,
        type,
        price,
        originalPrice,
        badge,
        desc,
        gen: gender,
        fab: fabric,
        fit,
        catId,
        imgs: imgUrl ? [imgUrl] : [],
        emo: emoji,
        bg: '#f0f0f0',
        sku,
        brand,
        sizes: sizesStr.split(',').map(s => s.trim()).filter(Boolean),
        clrs: colorsStr.split(',').map(c => c.trim()).filter(Boolean),
        barcode,
        rating: editingProduct?.rating || 0,
        rev: editingProduct?.rev || 0,
        active: true
      };

      if (editingProduct) {
        updateProduct({ ...editingProduct, ...pData });
        alert(`Product Updated Successfully!`);
      } else {
        addProduct({ ...pData, id: Date.now() });
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

  const { categories } = useApp();

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
            <div style={{ overflowX: 'auto' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Product</th><th>Type</th><th>Price</th><th>Rating</th><th>Badge</th><th>Status</th><th>Actions</th>
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
                            <div className="td-meta">SKU: {p.sku || p.id} | Brand: {p.brand || 'Medvastr'}</div>
                          </div>
                        </div>
                      </td>
                      <td><span className="badge b-blue">{p.type}</span></td>
                      <td className="td-bold">{fmt(p.price)}</td>
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
      </div>

      {isModalOpen && (
        <div className="modal-bg" onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false) }}>
          <div className="modal" style={{ maxWidth: '700px' }}>
            <div className="modal-hd">
              <div className="modal-title">{editingProduct ? 'Edit Product' : 'Add New Product'}</div>
              <button className="modal-x" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="fg-row">
                <div className="fg" style={{ flex: 2 }}>
                  <label>Product Name</label>
                  <input type="text" id="p-name" defaultValue={editingProduct?.name || ''} placeholder="Men's Classic V-Neck Scrub" />
                </div>
                <div className="fg">
                  <label>Category</label>
                  <select id="p-cat" defaultValue={editingProduct?.catId || ''}>
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="fg-row">
                <div className="fg">
                  <label>Type Key</label>
                  <input type="text" id="p-type" defaultValue={editingProduct?.type || 'scrubs'} placeholder="scrubs / labcoat / jacket" />
                </div>
                <div className="fg">
                  <label>Emoji</label>
                  <input type="text" id="p-emo" defaultValue={editingProduct?.emo || '🥼'} placeholder="🥼" />
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
                  <select id="p-gender" defaultValue={editingProduct?.gen || 'unisex'}>
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
                <label>Main Image URL</label>
                <input type="text" id="p-img" defaultValue={editingProduct?.imgs?.[0] || ''} placeholder="https://example.com/image.jpg" />
              </div>
              <div className="fg">
                <label>Description</label>
                <textarea id="p-desc" defaultValue={editingProduct?.desc || ''} placeholder="Product description..." style={{ height: '80px' }}></textarea>
              </div>
              <div className="fg-row">
                <div className="fg">
                  <label>Fabric / Material</label>
                  <input type="text" id="p-fabric" defaultValue={editingProduct?.fab || ''} placeholder="Classic / ecoflex™" />
                </div>
                <div className="fg">
                  <label>Fit</label>
                  <input type="text" id="p-fit" defaultValue={editingProduct?.fit || ''} placeholder="Regular Fit / Slim Fit" />
                </div>
              </div>
              <div className="fg-row">
                <div className="fg">
                  <label>SKU Code</label>
                  <input type="text" id="p-sku" defaultValue={editingProduct?.sku || ''} placeholder="e.g. MV-SCRUB-101" />
                </div>
                <div className="fg">
                  <label>Brand</label>
                  <input type="text" id="p-brand" defaultValue={editingProduct?.brand || 'Medvastr'} placeholder="Brand Name" />
                </div>
              </div>
              <div className="fg-row">
                <div className="fg">
                  <label>Sizes (comma separated)</label>
                  <input type="text" id="p-sizes" defaultValue={editingProduct?.sizes?.join(', ') || 'XS, S, M, L, XL'} placeholder="S, M, L, XL" />
                </div>
                <div className="fg">
                  <label>Colors (comma separated)</label>
                  <input type="text" id="p-colors" defaultValue={editingProduct?.clrs?.join(', ') || ''} placeholder="#1a2b4a, #800000" />
                </div>
              </div>
              <div className="fg">
                <label>Barcode</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input type="text" id="p-barcode" defaultValue={editingProduct?.barcode || ''} placeholder="Generated or scanned barcode" style={{ flex: 1 }} />
                  <button type="button" className="btn-secondary" onClick={() => {
                    const skuVal = (document.getElementById('p-sku') as HTMLInputElement)?.value;
                    const barcodeInp = document.getElementById('p-barcode') as HTMLInputElement;
                    if(barcodeInp) barcodeInp.value = skuVal ? `BC-${skuVal}-${Math.floor(Math.random()*1000)}` : `BC-${Math.floor(Math.random()*1000000)}`;
                  }}>Generate</button>
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
