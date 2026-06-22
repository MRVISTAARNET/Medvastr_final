'use client';

import React, { useState, useEffect, useRef } from 'react';
import AdminTopbar from '@/components/admin/AdminTopbar';
import { fmt, B } from '@/lib/data';
import { useApp } from '@/context/AppContext';
import { API_BASE, authHeaders, getToken } from '@/lib/api';
import { validateImageUpload } from '@/lib/uploadValidation';
import { logError } from '@/lib/logger';
import Barcode from 'react-barcode';
import { toJpeg } from 'html-to-image';

// Standardized Mappings for SKU Generation
const GENDER_PREFIX = { 'Men': 'M', 'Women': 'W', 'Unisex': 'U' };
const BRAND_PREFIX = { 'Medvastr': 'MED', 'Fabscrubs': 'FAB', 'Others': 'OTH' };

const downloadCSV = (data: any[], fileName: string) => {
  if (!data || !data.length) return;
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(obj =>
    Object.values(obj).map(v => typeof v === 'string' ? `"${v.replace(/"/g, '""')}"` : v).join(',')
  ).join('\n');
  const blob = new Blob([`${headers}\n${rows}`], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  link.click();
};

export default function AdminProducts() {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'basic' | 'pricing' | 'inventory' | 'media'>('basic');

  const { products, categoryTree } = useApp();
  const fetchProducts = (useApp() as any).fetchProducts;

  const [form, setForm] = useState<any>({
    name: '',
    brand: 'Medvastr',
    gender: 'Men',
    style: 'Standard', // Standard, Top, Bottom, Set
    parentId: '',
    subCategoryId: '',
    price: 0,
    origPrice: 0,
    description: '',
    fabric: '',
    sizes: 'S, M, L, XL',
    clrs: '',
    imgs: [],
    imgsByColor: {}, // { '#hex': ['url1', 'url2'] }
    videoUrl: '',
    active: true,
    badge: 'None', // None, Bestseller, New Arrival, Trending
  });

  const labelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editingProduct) {
      setForm({
        ...editingProduct,
        parentId: editingProduct.categoryIds?.[0] || '',
        subCategoryId: editingProduct.categoryIds?.[1] || '',
        style: editingProduct.style || 'Top',
        sizes: editingProduct.sizes?.join(', ') || 'S, M, L, XL',
        clrs: editingProduct.clrNms?.join(', ') || ''
      });
    } else {
      setForm({
        name: '', brand: 'Medvastr', gender: 'Men', style: 'Standard', parentId: '', subCategoryId: '',
        price: 0, origPrice: 0, description: '', fabric: '',
        sizes: 'S, M, L, XL', clrs: '', imgs: [], videoUrl: '', active: true, imgsByColor: {},
        badge: 'None'
      });
    }
  }, [editingProduct, isModalOpen]);

  // COLOR UTILS
  const COLOR_MAP: Record<string, string> = {
    'navy blue': '#1a2b4a', 'navy': '#000080', 'royal blue': '#4169e1', 'light blue': '#add8e6',
    'maroon': '#800000', 'wine': '#722f37', 'black': '#000000', 'white': '#ffffff',
    'green': '#2e7d32', 'olive': '#556b2f', 'teal': '#008080', 'grey': '#808080',
    'pink': '#ffc0cb', 'purple': '#800080', 'burgundy': '#800020', 'lavender': '#e6e6fa'
  };

  const getColHex = (name: string) => {
    const n = name.trim().toLowerCase();
    return COLOR_MAP[n] || (n.startsWith('#') ? n : '#cccccc');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    const key = id.replace('p-', '');
    setForm((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string, isMultiple: boolean = false) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const token = getToken() || "";
    if (isMultiple) {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);
        try {
          const res = await fetch(`${API_BASE}/upload`, { method: "POST", headers: { "Authorization": `Bearer ${token}` }, body: formData });
          const data = await res.json();
          if (data.success) uploadedUrls.push(data.data);
        } catch (err) { logError(`upload:${file.name}`, err); }
      }
      setForm((prev: any) => ({ ...prev, [field]: [...(Array.isArray(prev[field]) ? prev[field] : []), ...uploadedUrls] }));
    } else {
      const file = files[0];
      const formData = new FormData();
      formData.append("file", file);
      try {
        const res = await fetch(`${API_BASE}/upload`, { method: "POST", headers: { "Authorization": `Bearer ${token}` }, body: formData });
        const data = await res.json();
        if (data.success) setForm((prev: any) => ({ ...prev, [field]: data.data }));
      } catch (err) { alert("Upload failed"); }
    }
  };

  const handleSave = async () => {
    if (!form.name || !form.price) return alert("Missing name or price");
    const token = getToken();
    const slug = form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const clrsList = (form.clrs || '').split(',').map((c: string) => c.trim()).filter(Boolean);
    const sizeList = (form.sizes || '').split(',').map((s: string) => s.trim()).filter(Boolean);

    const variants = sizeList.flatMap((s: string) => clrsList.map((c: string) => {
      const hex = getColHex(c);
      const bPrefix = (BRAND_PREFIX as any)[form.brand] || 'OTH';
      const gPrefix = (GENDER_PREFIX as any)[form.gender] || 'U';
      const cPrefix = c.slice(0, 2).toUpperCase();
      const sPrefix = s.toUpperCase();
      const pPrefix = form.name.slice(0, 3).toUpperCase();
      const sku = `${bPrefix}-${gPrefix}-${pPrefix}-${cPrefix}-${sPrefix}`;
      return { sku, barcode: sku, size: s, colorName: c, colorHex: hex, stockQuantity: 100, imageUrl: form.imgsByColor?.[hex]?.[0] || form.imgs?.[0] || '' };
    }));

    const body = { ...form, slug, variants, categoryIds: [Number(form.parentId), Number(form.subCategoryId)].filter(Boolean) };
    const url = editingProduct ? `${API_BASE}/products/${editingProduct.id}` : `${API_BASE}/products`;
    const res = await fetch(url, { method: editingProduct ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders(token) }, body: JSON.stringify(body) });
    if ((await res.json()).success) { fetchProducts(); setIsModalOpen(false); }
  };

  const exportProductFeed = () => {
    const feed = products.flatMap(p => (p.variants || []).map((v: any) => ({ SKU: v.sku, Name: p.name, Price: p.price, Stock: v.stockQuantity })));
    downloadCSV(feed, `medvastr_inventory_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const downloadBarcode = async (ref: React.RefObject<HTMLDivElement | null>, sku: string) => {
    if (!ref.current) return;
    try {
      const dataUrl = await toJpeg(ref.current, { pixelRatio: 3 });
      const link = document.createElement('a');
      link.download = `barcode-${sku}.jpg`; link.href = dataUrl; link.click();
    } catch (err) { logError('barcode', err); }
  };

  const openEditModal = (p: any) => { setEditingProduct(p); setIsModalOpen(true); };
  const openAddModal = () => { setEditingProduct(null); setActiveTab('basic'); setIsModalOpen(true); };

  const filteredProducts = products.filter((p: any) => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <AdminTopbar title="Products" sub="Medvastr Catalogue Management" action={{ label: '+ Add Product', onClick: openAddModal }} />
      <div className="admin-content">
        <div className="panel">
          <div className="table-card">
            <div className="table-hd">
              <div className="table-hd-left"><div className="table-title">Product List</div></div>
              <div className="table-hd-right">
                <input className="tbl-search" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
                <button className="btn-secondary" style={{ marginRight: '8px' }} onClick={exportProductFeed}>📊 Export SKUs</button>
                <button className="btn-primary" onClick={openAddModal}>+ Add Product</button>
              </div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="admin-table">
                <thead><tr><th>Product</th><th>Price</th><th>Gender</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {filteredProducts.map((p: any) => (
                    <tr key={p.id}>
                      <td><div className="td-flex"><div><strong>{p.name}</strong><br /><small>{p.brand}</small></div></div></td>
                      <td>{fmt(p.price)}</td>
                      <td>{p.gender}</td>
                      <td>{p.active ? <span className="badge b-grn">Active</span> : <span className="badge b-red">Inactive</span>}</td>
                      <td><div className="act-btns"><div className="act-btn edit" onClick={() => openEditModal(p)}>✏️</div></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-bg">
          <div className="modal" style={{ maxWidth: '800px' }}>
            <div className="modal-hd">
              <div className="modal-title">{editingProduct ? 'Edit' : 'Add'} Product</div>
              <button className="modal-x" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>

            <div className="p-tabs">
              <button className={`p-tab ${activeTab === 'basic' ? 'on' : ''}`} onClick={() => setActiveTab('basic')}>1. Basic Info</button>
              <button className={`p-tab ${activeTab === 'pricing' ? 'on' : ''}`} onClick={() => setActiveTab('pricing')}>2. Pricing & Category</button>
              <button className={`p-tab ${activeTab === 'inventory' ? 'on' : ''}`} onClick={() => setActiveTab('inventory')}>3. Inventory</button>
              <button className={`p-tab ${activeTab === 'media' ? 'on' : ''}`} onClick={() => setActiveTab('media')}>4. Media</button>
            </div>

            <div className="modal-body">
              {activeTab === 'basic' && (
                <div style={{ display: 'grid', gap: '20px' }}>
                  <div className="fg"><label>Product Name</label><input id="p-name" value={form.name} onChange={handleInputChange} placeholder="e.g. Flexi Fit V Scrub" /></div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div className="fg"><label>Brand</label><select id="p-brand" value={form.brand} onChange={handleInputChange}><option>Medvastr</option><option>Fabscrubs</option><option>Others</option></select></div>
                    <div className="fg"><label>Gender</label><select id="p-gender" value={form.gender} onChange={handleInputChange}><option>Men</option><option>Women</option><option>Unisex</option></select></div>
                    <div className="fg"><label>Product Style</label><select id="p-style" value={form.style} onChange={handleInputChange}><option>Standard</option><option>Top</option><option>Bottom</option><option>Set</option></select></div>
                  </div>
                  <div className="fg"><label>Description</label><textarea id="p-description" value={form.description} onChange={handleInputChange} rows={3} /></div>
                  <div className="fg"><label>Fabric Composition</label><input id="p-fabric" value={form.fabric} onChange={handleInputChange} placeholder="e.g. 72% Polyester, 21% Rayon, 7% Spandex" /></div>
                  <div className="fg"><label>Featured Badge</label><select id="p-badge" value={form.badge} onChange={handleInputChange}><option value="None">No Badge</option><option value="Bestseller">Bestseller (Show on Home)</option><option value="New Arrival">New Arrival (Show on Home)</option><option value="Trending">Trending</option></select></div>
                </div>
              )}

              {activeTab === 'pricing' && (
                <div style={{ display: 'grid', gap: '20px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div className="fg"><label>Parent Category</label><select id="p-parentId" value={form.parentId} onChange={handleInputChange}><option value="">Select Parent</option>{categoryTree.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                    <div className="fg"><label>Sub Category</label><select id="p-subCategoryId" value={form.subCategoryId} onChange={handleInputChange}><option value="">Select Sub</option>{categoryTree.find((c: any) => String(c.id) === String(form.parentId))?.children?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div className="fg"><label>Selling Price (₹)</label><input id="p-price" value={form.price} onChange={handleInputChange} type="number" /></div>
                    <div className="fg"><label>Original MRP (₹)</label><input id="p-origPrice" value={form.origPrice} onChange={handleInputChange} type="number" /></div>
                  </div>
                </div>
              )}

              {activeTab === 'inventory' && (
                <div style={{ display: 'grid', gap: '20px' }}>
                  <div className="fg"><label>Colors (Comma separated)</label><input id="p-clrs" value={form.clrs} onChange={handleInputChange} placeholder="Navy Blue, Wine, Teal" /></div>
                  <div className="fg"><label>Sizes (Comma separated)</label><input id="p-sizes" value={form.sizes} onChange={handleInputChange} /></div>
                  <div className="fg">
                    <label>Generated SKU Preview</label>
                    <div style={{ background: '#f1f5f9', padding: '15px', borderRadius: '10px', fontSize: '12px', fontFamily: 'monospace' }}>
                      {form.name && (form.clrs || '').split(',')[0] && `${BRAND_PREFIX[form.brand as keyof typeof BRAND_PREFIX]}-${GENDER_PREFIX[form.gender as keyof typeof GENDER_PREFIX]}-${form.name.slice(0, 3).toUpperCase()}-${(form.clrs || '').split(',')[0].slice(0, 2).toUpperCase()}-S`}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'media' && (
                <div style={{ display: 'grid', gap: '20px' }}>
                  <div className="fg">
                    <label>Color-Specific Images (Nike Style)</label>
                    <p style={{ fontSize: '11px', color: '#64748b', marginBottom: '15px' }}>Upload images for each color to enable the premium gallery-swap feature.</p>

                    {(form.clrs || '').split(',').map((c: string) => c.trim()).filter(Boolean).map((color: string) => {
                      const hex = getColHex(color);
                      return (
                        <div key={color} style={{ marginBottom: '25px', padding: '15px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                            <div style={{ width: '15px', height: '15px', borderRadius: '50%', background: hex }} />
                            <strong style={{ fontSize: '13px' }}>{color} Photos</strong>
                          </div>
                          <input type="file" multiple onChange={async (e) => {
                            const files = e.target.files;
                            if (!files) return;
                            const token = getToken() || "";
                            const urls: string[] = [];
                            for (let i = 0; i < files.length; i++) {
                              const formData = new FormData(); formData.append("file", files[i]);
                              const res = await fetch(`${API_BASE}/upload`, { method: "POST", headers: { "Authorization": `Bearer ${token}` }, body: formData });
                              const d = await res.json(); if (d.success) urls.push(d.data);
                            }
                            setForm((prev: any) => ({
                              ...prev,
                              imgsByColor: { ...prev.imgsByColor, [hex]: [...(prev.imgsByColor?.[hex] || []), ...urls] },
                              imgs: [...prev.imgs, ...urls]
                            }));
                          }} />
                          <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                            {(form.imgsByColor?.[hex] || []).map((url: string, i: number) => (
                              <img key={i} src={url} alt="" style={{ width: '50px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="fg"><label>Video URL</label><input id="p-videoUrl" value={form.videoUrl} onChange={handleInputChange} placeholder="S3 URL" /></div>
                </div>
              )}
            </div>

            <div className="modal-foot">
              <button className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleSave}>Save Product</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
