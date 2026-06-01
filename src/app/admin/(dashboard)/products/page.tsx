'use client';

import React, { useState, useEffect, useRef } from 'react';
import AdminTopbar from '@/components/admin/AdminTopbar';
import { fmt, B } from '@/lib/data';
import { useApp } from '@/context/AppContext';
import Barcode from 'react-barcode';
import { toPng } from 'html-to-image';

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

  const filteredProducts = products.filter((p: any) => p.name.toLowerCase().includes(search.toLowerCase()));

  const [form, setForm] = useState<any>({
    name: '', type: 'scrubs', price: '', originalPrice: '', badge: '', desc: '',
    gen: 'unisex', fab: '', fit: '', catId: '', imgs: '', emo: '📦',
    sku: '', styleId: '', brand: 'Medvastr', sizes: 'XS, S, M, L, XL', clrs: '', barcode: '',
    weight: '', care: '', stretch: '', fabD: '', pockets: ''
  });

  const labelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editingProduct) {
      setForm({
        ...editingProduct,
        imgs: editingProduct.imgs?.[0] || '',
        sizes: editingProduct.sizes?.join(', ') || '',
        clrs: editingProduct.clrs?.join(', ') || '',
        catId: editingProduct.catId || ''
      });
    } else {
      setForm({
        name: '', type: 'scrubs', price: '', originalPrice: '', badge: '', desc: '',
        gen: 'unisex', fab: '', fit: '', catId: '', imgs: '', emo: '📦',
        sku: '', styleId: '', brand: 'Medvastr', sizes: 'XS, S, M, L, XL', clrs: '', barcode: '',
        weight: '', care: '', stretch: '', fabD: '', pockets: ''
      });
    }
  }, [editingProduct, isModalOpen]);

  // Auto-generate SKU and Barcode
  useEffect(() => {
    if (!editingProduct && form.name) {
      const namePart = form.name.split(' ').map((s: string) => s[0]).join('').toUpperCase().slice(0, 3);
      const stylePart = form.styleId ? form.styleId.replace(/\s+/g, '_').toUpperCase() : 'ST';

      // Better Color Initials (e.g. Dark Blue -> DB)
      let colorPart = 'XX';
      if (form.clrs) {
        const firstCol = form.clrs.split(',')[0].trim();
        const parts = firstCol.split(' ');
        if (parts.length > 1) {
          colorPart = parts.map((p: string) => p[0]).join('').toUpperCase();
        } else {
          colorPart = firstCol.slice(0, 2).toUpperCase();
        }
      }

      const generatedSku = `${form.brand.slice(0, 2).toUpperCase()}-${namePart}-${stylePart}-${colorPart}`;

      setForm((prev: any) => ({
        ...prev,
        sku: generatedSku,
        barcode: generatedSku
      }));
    }
  }, [form.name, form.styleId, form.clrs, form.brand, editingProduct]);

  // Color Map (Name to Hex)
  const COLOR_MAP: Record<string, string> = {
    'dark blue': '#1a2b4a', 'navy': '#000080', 'royal blue': '#4169e1', 'light blue': '#add8e6',
    'maroon': '#800000', 'wine': '#722f37', 'black': '#000000', 'white': '#ffffff',
    'green': '#2e7d32', 'olive': '#556b2f', 'teal': '#008080', 'grey': '#808080',
    'pink': '#ffc0cb', 'purple': '#800080', 'burgundy': '#800020'
  };

  const getColHex = (name: string) => {
    const n = name.trim().toLowerCase();
    if (COLOR_MAP[n]) return COLOR_MAP[n];
    if (n.startsWith('#')) return n;
    return '#cccccc'; // fallback
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    const key = id.replace('p-', '');
    setForm((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (form.name && form.price) {
      const pData: any = {
        ...form,
        price: parseFloat(form.price) || 0,
        originalPrice: parseFloat(form.originalPrice) || undefined,
        imgs: form.imgs ? [form.imgs] : [],
        sizes: form.sizes.split(',').map((s: string) => s.trim()).filter(Boolean),
        clrs: form.clrs.split(',').map((c: string) => getColHex(c.trim())).filter(Boolean),
        weight: form.weight,
        care: form.care,
        stretch: form.stretch,
        fabD: form.fabD,
        pockets: parseInt(form.pockets) || 0,
        rating: editingProduct?.rating || 4.5,
        rev: editingProduct?.rev || 0,
        active: true
      };

      if (editingProduct) {
        await updateProduct({ ...editingProduct, ...pData });
        setIsModalOpen(false);
        setEditingProduct(null);
      } else {
        const saved = await addProduct(pData);
        if (saved) {
          // Instead of closing, set to editing mode so they can download barcode
          setEditingProduct(saved);
          setForm({
            ...saved,
            imgs: saved.imgs?.[0] || '',
            sizes: saved.sizes?.join(', ') || '',
            clrs: saved.clrs?.join(', ') || '',
            catId: saved.catId || ''
          });
        }
      }
    } else {
      alert('Please fill Name and Price');
    }
  };

  const downloadBarcode = async () => {
    if (labelRef.current === null) return;
    try {
      const dataUrl = await toPng(labelRef.current, { cacheBust: true, pixelRatio: 3 });
      const link = document.createElement('a');
      link.download = `barcode-${form.sku || 'product'}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Barcode download failed', err);
    }
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
                          <div className="act-btn del" title="Delete" onClick={() => { if (confirm(`Delete ${p.name}?`)) deleteProduct(p.id) }}>🗑️</div>
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
            <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              <div className="fg-row">
                <div className="fg" style={{ flex: 2 }}>
                  <label>Product Name</label>
                  <input type="text" id="p-name" value={form.name} onChange={handleInputChange} placeholder="Men's Classic V-Neck Scrub" />
                </div>
                <div className="fg">
                  <label>Category</label>
                  <select id="p-cat" value={form.catId} onChange={handleInputChange}>
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="fg-row">
                <div className="fg">
                  <label>Type Key (for Homepage Tabs)</label>
                  <select id="p-type" value={form.type} onChange={handleInputChange}>
                    <option value="scrubs">scrubs (Uniforms & Scrubs)</option>
                    <option value="linen">linen (Linen & Bedding)</option>
                    <option value="surgical">surgical (Surgical Wear)</option>
                    <option value="diagnostic">diagnostic (Diagnostic & Caps)</option>
                    <option value="other">other</option>
                  </select>
                </div>
                <div className="fg">
                  <label>Emoji</label>
                  <input type="text" id="p-emo" value={form.emo} onChange={handleInputChange} placeholder="🥼" />
                </div>
              </div>
              <div className="fg-row">
                <div className="fg">
                  <label>Price (₹)</label>
                  <input type="number" id="p-price" value={form.price} onChange={handleInputChange} placeholder="1099" />
                </div>
                <div className="fg">
                  <label>Original Price (₹)</label>
                  <input type="number" id="p-originalPrice" value={form.originalPrice} onChange={handleInputChange} placeholder="Leave blank if no discount" />
                </div>
              </div>
              <div className="fg-row">
                <div className="fg">
                  <label>Gender</label>
                  <select id="p-gen" value={form.gen} onChange={handleInputChange}>
                    <option value="men">Men</option>
                    <option value="women">Women</option>
                    <option value="unisex">Unisex</option>
                  </select>
                </div>
                <div className="fg">
                  <label>Badge</label>
                  <select id="p-badge" value={form.badge} onChange={handleInputChange}>
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
                <input type="text" id="p-imgs" value={form.imgs} onChange={handleInputChange} placeholder="https://example.com/image.jpg" />
              </div>
              <div className="fg">
                <label>Description</label>
                <textarea id="p-desc" value={form.desc} onChange={handleInputChange} placeholder="Product description..." style={{ height: '80px' }}></textarea>
              </div>
              <div className="fg-row">
                <div className="fg">
                  <label>Fabric / Material</label>
                  <input type="text" id="p-fab" value={form.fab} onChange={handleInputChange} placeholder="Classic / ecoflex™" />
                </div>
                <div className="fg">
                  <label>Fit</label>
                  <input type="text" id="p-fit" value={form.fit} onChange={handleInputChange} placeholder="Regular Fit / Slim Fit" />
                </div>
              </div>
              <div className="fg-row">
                <div className="fg">
                  <label>Style ID (for SKU)</label>
                  <input type="text" id="p-styleId" value={form.styleId} onChange={handleInputChange} placeholder="e.g. FF_DS_DB_SM" />
                </div>
                <div className="fg">
                  <label>Brand</label>
                  <input type="text" id="p-brand" value={form.brand} onChange={handleInputChange} placeholder="Brand Name" />
                </div>
              </div>
              <div className="fg-row">
                <div className="fg">
                  <label>Sizes (comma separated)</label>
                  <input type="text" id="p-sizes" value={form.sizes} onChange={handleInputChange} placeholder="S, M, L, XL" />
                </div>
                <div className="fg">
                  <label>Colors (Names e.g. Dark Blue, Maroon)</label>
                  <input type="text" id="p-clrs" value={form.clrs} onChange={handleInputChange} placeholder="Dark Blue, Maroon" />
                </div>
              </div>

              <div className="fg-row">
                <div className="fg">
                  <label>Weight</label>
                  <input type="text" id="p-weight" value={form.weight} onChange={handleInputChange} placeholder="Lightweight / 250g" />
                </div>
                <div className="fg">
                  <label>Pocket Count</label>
                  <input type="number" id="p-pockets" value={form.pockets} onChange={handleInputChange} placeholder="7" />
                </div>
              </div>

              <div className="fg-row">
                <div className="fg">
                  <label>Stretch Type</label>
                  <input type="text" id="p-stretch" value={form.stretch} onChange={handleInputChange} placeholder="4-way stretch" />
                </div>
                <div className="fg">
                  <label>Care Instructions</label>
                  <input type="text" id="p-care" value={form.care} onChange={handleInputChange} placeholder="Machine wash cold" />
                </div>
              </div>

              <div className="fg">
                <label>Fabric Detailed Info</label>
                <input type="text" id="p-fabD" value={form.fabD} onChange={handleInputChange} placeholder="72% Polyester, 21% Rayon, 7% Spandex" />
              </div>
              <div className="fg-row">
                <div className="fg">
                  <label>SKU (Auto-generated)</label>
                  <input type="text" id="p-sku" value={form.sku} onChange={handleInputChange} />
                </div>
                <div className="fg">
                  <label>Barcode Value</label>
                  <input type="text" id="p-barcode" value={form.barcode} onChange={handleInputChange} />
                </div>
              </div>

              {/* Barcode Label Design - ONLY show for existing products (SAVE FIRST) */}
              {editingProduct ? (
                <div className="barcode-preview-section" style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
                  <label>Barcode Label Preview (Final Label)</label>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                    <div
                      ref={labelRef}
                      className="barcode-label"
                      style={{
                        width: '350px',
                        background: '#fff',
                        padding: '20px',
                        border: '1px solid #000',
                        borderRadius: '4px',
                        color: '#000',
                        fontFamily: 'Inter, sans-serif'
                      }}
                    >
                      <div style={{ textAlign: 'center', fontSize: '24px', fontWeight: '800', marginBottom: '10px', borderBottom: '2px solid #000', paddingBottom: '5px' }}>{B.name.toUpperCase()}</div>
                      <div style={{ fontSize: '13px', marginBottom: '4px' }}><strong>P Name:</strong> {form.name || '---'}</div>
                      <div style={{ fontSize: '13px', marginBottom: '4px' }}><strong>Style ID:</strong> {form.styleId || '---'}</div>
                      <div style={{ fontSize: '13px', marginBottom: '4px' }}><strong>Colour:</strong> {form.clrs.split(',')[0] || '---'}</div>
                      <div style={{ fontSize: '13px', marginBottom: '4px' }}><strong>Size:</strong> {form.sizes.split(',')[0] || '---'}</div>
                      <div style={{ fontSize: '18px', fontWeight: '700', marginTop: '10px' }}>MRP: ₹ {form.price || '0'}</div>

                      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '15px' }}>
                        {form.barcode && (
                          <Barcode
                            value={form.barcode}
                            width={1.5}
                            height={50}
                            fontSize={12}
                            background="#ffffff"
                          />
                        )}
                      </div>

                      <div style={{ marginTop: '10px', fontSize: '10px', textAlign: 'center', borderTop: '1px dashed #ccc', paddingTop: '8px' }}>
                        Email: {B.email} <br />
                        Phone: {B.phone1}
                      </div>
                    </div>
                    <button type="button" className="btn-secondary" onClick={downloadBarcode}>
                      📥 Download Professional Label
                    </button>
                    <p style={{ fontSize: '11px', color: 'var(--ink3)' }}>Label is generated using saved SKU/Barcode data.</p>
                  </div>
                </div>
              ) : (
                <div style={{ marginTop: '20px', padding: '16px', background: '#f8f8f8', borderRadius: '8px', textAlign: 'center', border: '1px dashed #ccc' }}>
                  <div style={{ fontSize: '20px', marginBottom: '8px' }}>📦</div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#666' }}>Save Product First</div>
                  <div style={{ fontSize: '12px', color: '#999' }}>You can download the professional barcode label after saving this product.</div>
                </div>
              )}
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
