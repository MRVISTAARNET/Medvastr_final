'use client';

import React, { useState, useEffect, useRef } from 'react';
import AdminTopbar from '@/components/admin/AdminTopbar';
import { fmt, B } from '@/lib/data';
import { useApp } from '@/context/AppContext';
import { API_BASE, authHeaders, getToken } from '@/lib/api';
import { logError } from '@/lib/logger';
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
  const [activeTab, setActiveTab] = useState<'basic' | 'pricing' | 'inventory' | 'media' | 'seo'>('basic');
  const [uploadingState, setUploadingState] = useState<{ active: boolean; current: number; total: number; filename: string }>({ active: false, current: 0, total: 0, filename: '' });

  const { products, categoryTree } = useApp();
  const fetchProducts = (useApp() as any).fetchProducts;

  const [form, setForm] = useState<any>({
    name: '',
    brand: 'Medvastr',
    gender: 'Men',
    style: 'Standard', // Standard, Top, Bottom, Set
    parentId: '',
    subCategoryId: '',
    childCategoryId: '',
    price: 0,
    origPrice: 0,
    tax: 0,
    type: 'scrubs', // scrubs, tshirts, underscrub, surgical, bedding, blanket, dress
    description: '',
    fabric: '',
    sizes: 'S, M, L, XL',
    clrs: '',
    sku: '',
    stock: 100,
    imgs: [], // Ordered list of image URLs
    imgsByColor: {}, // { '#hex': ['url1', 'url2'] }
    videoUrl: '',
    active: true,
    badge: 'None',
    fit: 'Classic Fit',
    pocketCount: 0,
    weight: '180 GSM',
    careInstructions: 'Machine Wash Cold',
    shortDescription: '',
    material: '',
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
  });

  useEffect(() => {
    if (editingProduct) {
      setForm({
        ...editingProduct,
        parentId: editingProduct.categoryId || editingProduct.catId || (editingProduct.categoryIds ? editingProduct.categoryIds.split(',')[0] : '') || '',
        subCategoryId: editingProduct.subcategoryId || (editingProduct.categoryIds ? editingProduct.categoryIds.split(',')[1] : '') || '',
        childCategoryId: editingProduct.childCategoryId || (editingProduct.categoryIds ? editingProduct.categoryIds.split(',')[2] : '') || '',
        style: editingProduct.styleId || editingProduct.style || 'Standard',
        origPrice: editingProduct.originalPrice || editingProduct.origPrice || 0,
        imgs: editingProduct.imageUrls || editingProduct.imgs || [],
        imgsByColor: editingProduct.clrImgs || {},
        sizes: editingProduct.sizes?.join(', ') || 'S, M, L, XL',
        clrs: editingProduct.clrNms?.join(', ') || '',
        material: editingProduct.material || '',
        seoTitle: editingProduct.seoTitle || '',
        seoDescription: editingProduct.seoDescription || '',
        seoKeywords: editingProduct.seoKeywords || '',
      });
    } else {
      setForm({
        name: '', brand: 'Medvastr', gender: 'Men', style: 'Standard', parentId: '', subCategoryId: '', childCategoryId: '',
        price: 0, origPrice: 0, tax: 0, type: 'scrubs', description: '', fabric: '',
        sizes: 'S, M, L, XL', clrs: '', imgs: [], videoUrl: '', active: true, imgsByColor: {},
        badge: 'None', fit: 'Classic Fit', pocketCount: 0, weight: '180 GSM', careInstructions: 'Machine Wash Cold', shortDescription: '',
        material: '', sku: '', stock: 100, seoTitle: '', seoDescription: '', seoKeywords: ''
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
    setForm((prev: any) => {
      const next = { ...prev, [key]: value };
      if (key === 'parentId') {
        next.subCategoryId = '';
        next.childCategoryId = '';
      } else if (key === 'subCategoryId') {
        next.childCategoryId = '';
      }
      return next;
    });
  };

  // Move image left/right in order list
  const moveImage = (index: number, direction: 'left' | 'right') => {
    const list = [...form.imgs];
    if (direction === 'left' && index > 0) {
      const temp = list[index];
      list[index] = list[index - 1];
      list[index - 1] = temp;
    } else if (direction === 'right' && index < list.length - 1) {
      const temp = list[index];
      list[index] = list[index + 1];
      list[index + 1] = temp;
    }
    setForm((prev: any) => ({ ...prev, imgs: list }));
  };

  const selectPrimaryImage = (url: string) => {
    // Moves chosen image to index 0 (making it primary)
    const list = [url, ...form.imgs.filter((u: string) => u !== url)];
    setForm((prev: any) => ({ ...prev, imgs: list }));
  };

  const removeImage = (url: string) => {
    setForm((prev: any) => ({ ...prev, imgs: prev.imgs.filter((u: string) => u !== url) }));
  };

  const handleSave = async () => {
    // 1. Front-end Validation for all required fields
    if (!form.name?.trim()) return alert("Product Name is required");
    if (!form.brand) return alert("Brand is required");
    if (!form.parentId) return alert("Parent Category is required");
    if (!form.subCategoryId) return alert("Sub Category is required");
    if (!form.gender) return alert("Gender is required");
    if (!form.type) return alert("Product Type is required");
    if (!form.description?.trim()) return alert("Description is required");
    if (!form.shortDescription?.trim()) return alert("Product Hook is required");
    if (!form.fabric?.trim()) return alert("Fabric is required");
    if (!form.weight?.trim()) return alert("Fabric Weight is required");
    if (!form.material?.trim()) return alert("Fabric Composition (Material) is required");
    if (!form.fit?.trim()) return alert("Fit is required");
    if (!form.careInstructions?.trim()) return alert("Care Instructions are required");
    if (!form.price || form.price <= 0) return alert("Selling Price must be greater than 0");
    if (!form.sku?.trim()) return alert("Parent SKU is required");
    if (form.stock === undefined || form.stock < 0) return alert("Stock quantity is required and cannot be negative");
    if (!form.imgs || form.imgs.length === 0) return alert("At least one product image is required");
    if (form.imgs.length > 30) return alert("Maximum 30 images allowed");

    const token = getToken();
    const slug = form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const clrsList = (form.clrs || '').split(',').map((c: string) => c.trim()).filter(Boolean);
    const sizeList = (form.sizes || '').split(',').map((s: string) => s.trim()).filter(Boolean);

    // Prevent duplicates in colors or sizes list
    if (new Set(clrsList).size !== clrsList.length) return alert("Duplicate colors are not allowed");
    if (new Set(sizeList).size !== sizeList.length) return alert("Duplicate sizes are not allowed");

    const variants = sizeList.flatMap((s: string) => clrsList.map((c: string) => {
      const hex = getColHex(c);
      const bPrefix = (BRAND_PREFIX as any)[form.brand] || 'OTH';
      const gPrefix = (GENDER_PREFIX as any)[form.gender] || 'U';
      const cPrefix = c.slice(0, 2).toUpperCase();
      const sPrefix = s.toUpperCase();
      const pPrefix = form.name.slice(0, 3).toUpperCase();
      const variantSku = `${bPrefix}-${gPrefix}-${pPrefix}-${cPrefix}-${sPrefix}`;
      return {
        sku: variantSku,
        barcode: variantSku,
        size: s,
        colorName: c,
        colorHex: hex,
        stockQuantity: Number(form.stock),
        variantPrice: Number(form.price),
        variantOriginalPrice: Number(form.origPrice) || undefined,
        imageUrl: form.imgsByColor?.[hex]?.[0] || form.imgs?.[0] || '',
        active: true
      };
    }));

    // Transform imgs to append ?clr=hex for color-specific photos in S3 url metadata
    const finalImgs: string[] = [];
    // Maintain display order of main imgs list
    form.imgs.forEach((url: string) => {
      let matchedHex: string | null = null;
      Object.entries(form.imgsByColor || {}).forEach(([hex, urls]: [string, any]) => {
        if (Array.isArray(urls) && urls.map(u => u.split('?')[0]).includes(url.split('?')[0])) {
          matchedHex = hex;
        }
      });
      if (matchedHex) {
        if (url.includes('?clr=')) finalImgs.push(url);
        else finalImgs.push(`${url}?clr=${matchedHex}`);
      } else {
        finalImgs.push(url);
      }
    });

    // Auto-generate missing SEO fields
    const seoTitle = form.seoTitle?.trim() || `${form.name} | Premium ${form.type} - Medvastr`;
    const seoDescription = form.seoDescription?.trim() || form.shortDescription || form.description?.slice(0, 150) || "";
    const seoKeywords = form.seoKeywords?.trim() || `${form.name.toLowerCase()}, medvastr, medical scrubs, ${form.gender.toLowerCase()} ${form.type}`;

    const body = {
      ...form,
      slug,
      variants,
      imgs: finalImgs,
      price: Number(form.price),
      originalPrice: Number(form.origPrice) || undefined,
      tax: Number(form.tax) || 0,
      styleId: form.style || 'Standard',
      categoryId: Number(form.parentId) || undefined,
      subcategoryId: Number(form.subCategoryId) || undefined,
      childCategoryId: Number(form.childCategoryId) || undefined,
      categoryIds: [Number(form.parentId), Number(form.subCategoryId), Number(form.childCategoryId)].filter(Boolean).join(','),
      seoTitle,
      seoDescription,
      seoKeywords
    };

    const url = editingProduct ? `${API_BASE}/products/${editingProduct.id}` : `${API_BASE}/products`;
    const res = await fetch(url, {
      method: editingProduct ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
      body: JSON.stringify(body)
    });
    
    const data = await res.json();
    if (data.success) {
      fetchProducts();
      setIsModalOpen(false);
    } else {
      alert(data.message || "Save failed");
    }
  };

  const exportProductFeed = () => {
    const feed = products.flatMap(p => (p.variants || []).map((v: any) => ({
      SKU: v.sku,
      Name: p.name,
      Price: p.price,
      Stock: v.stockQuantity,
      Active: p.active ? 'Yes' : 'No'
    })));
    downloadCSV(feed, `medvastr_inventory_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const openEditModal = (p: any) => { setEditingProduct(p); setActiveTab('basic'); setIsModalOpen(true); };
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
                <thead><tr><th>Product</th><th>Price</th><th>Gender</th><th>Type</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {filteredProducts.map((p: any) => (
                    <tr key={p.id}>
                      <td><div className="td-flex"><div><strong>{p.name}</strong><br /><small>{p.brand} • {p.sku}</small></div></div></td>
                      <td>{fmt(p.price)}</td>
                      <td>{p.gender}</td>
                      <td>{p.type}</td>
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
              <button className={`p-tab ${activeTab === 'seo' ? 'on' : ''}`} onClick={() => setActiveTab('seo')}>5. SEO Settings</button>
            </div>

            <div className="modal-body">
              {activeTab === 'basic' && (
                <div style={{ display: 'grid', gap: '20px' }}>
                  <div className="fg"><label>Product Name <span style={{ color: 'red' }}>*</span></label><input id="p-name" value={form.name} onChange={handleInputChange} placeholder="e.g. Flexi Fit V Scrub" /></div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                    <div className="fg"><label>Brand <span style={{ color: 'red' }}>*</span></label><select id="p-brand" value={form.brand} onChange={handleInputChange}><option>Medvastr</option><option>Fabscrubs</option><option>Standard</option><option>Others</option></select></div>
                    <div className="fg"><label>Gender <span style={{ color: 'red' }}>*</span></label><select id="p-gender" value={form.gender} onChange={handleInputChange}><option>Men</option><option>Women</option><option>Unisex</option></select></div>
                    <div className="fg"><label>Style <span style={{ color: 'red' }}>*</span></label><select id="p-style" value={form.style} onChange={handleInputChange}><option>Standard</option><option>Top</option><option>Bottom</option><option>Set</option></select></div>
                  </div>
                  <div className="fg"><label>Product Hook (Short Summary) <span style={{ color: 'red' }}>*</span></label><input id="p-shortDescription" value={form.shortDescription} onChange={handleInputChange} placeholder="e.g. Classic comfort and durability for peak performance" /></div>
                  <div className="fg"><label>Silhouette (Fit) <span style={{ color: 'red' }}>*</span></label><input id="p-fit" value={form.fit} onChange={handleInputChange} placeholder="e.g. Modern Slim Fit" /></div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div className="fg"><label>Pocket Count</label><input type="number" id="p-pocketCount" value={form.pocketCount} onChange={handleInputChange} /></div>
                    <div className="fg"><label>Fabric Weight <span style={{ color: 'red' }}>*</span></label><input id="p-weight" value={form.weight} onChange={handleInputChange} placeholder="e.g. 240 GSM" /></div>
                  </div>
                  <div className="fg"><label>Care Instructions <span style={{ color: 'red' }}>*</span></label><input id="p-careInstructions" value={form.careInstructions} onChange={handleInputChange} placeholder="e.g. Machine Wash Cold, Tumble Dry Low" /></div>
                  <div className="fg"><label>Fabric / Composition <span style={{ color: 'red' }}>*</span></label><input id="p-fabric" value={form.fabric} onChange={handleInputChange} placeholder="e.g. Polyester Blend" /></div>
                  <div className="fg"><label>Fabric Composition Detail (Material) <span style={{ color: 'red' }}>*</span></label><input id="p-material" value={form.material} onChange={handleInputChange} placeholder="e.g. 72% Polyester, 21% Rayon, 7% Spandex" /></div>
                  <div className="fg"><label>Performance Description <span style={{ color: 'red' }}>*</span></label><textarea id="p-description" value={form.description} onChange={handleInputChange} rows={3} placeholder="Full technical description..." /></div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div className="fg"><label>Featured Badge</label><select id="p-badge" value={form.badge} onChange={handleInputChange}><option value="None">No Badge</option><option value="Bestseller">Bestseller</option><option value="New Arrival">New Arrival</option><option value="Trending">Trending</option></select></div>
                    <div className="fg"><label>Status</label><select id="p-active" value={String(form.active)} onChange={(e) => setForm((p: any) => ({ ...p, active: e.target.value === 'true' }))}><option value="true">Active</option><option value="false">Inactive</option></select></div>
                  </div>
                </div>
              )}

              {activeTab === 'pricing' && (
                <div style={{ display: 'grid', gap: '20px' }}>
                  {(() => {
                    const parentCategory = categoryTree.find((c: any) => String(c.id) === String(form.parentId));
                    const subCategories = parentCategory?.children || [];
                    const childCategories = subCategories.find((c: any) => String(c.id) === String(form.subCategoryId))?.children || [];
                    const showChildSelector = childCategories.length > 0;

                    return (
                      <div style={{ display: 'grid', gridTemplateColumns: showChildSelector ? '1fr 1fr 1fr 1fr' : '1fr 1fr 1fr', gap: '20px' }}>
                        <div className="fg">
                          <label>Parent Category <span style={{ color: 'red' }}>*</span></label>
                          <select id="p-parentId" value={form.parentId} onChange={handleInputChange}>
                            <option value="">Select Parent</option>
                            {categoryTree.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                        </div>
                        <div className="fg">
                          <label>Sub Category <span style={{ color: 'red' }}>*</span></label>
                          <select id="p-subCategoryId" value={form.subCategoryId} onChange={handleInputChange}>
                            <option value="">Select Sub</option>
                            {subCategories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                        </div>
                        {showChildSelector && (
                          <div className="fg">
                            <label>Child Category</label>
                            <select id="p-childCategoryId" value={form.childCategoryId} onChange={handleInputChange}>
                              <option value="">Select Child</option>
                              {childCategories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                          </div>
                        )}
                        <div className="fg">
                          <label>Product Type <span style={{ color: 'red' }}>*</span></label>
                          <select id="p-type" value={form.type} onChange={handleInputChange}>
                            <option value="scrubs">Scrubs</option>
                            <option value="tshirts">T-Shirts</option>
                            <option value="underscrub">Underscrub</option>
                            <option value="surgical">Surgical Wear</option>
                            <option value="bedding">Linen & Bedding</option>
                            <option value="blanket">Blanket</option>
                            <option value="dress">Patient Dress</option>
                          </select>
                        </div>
                      </div>
                    );
                  })()}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                    <div className="fg"><label>Selling Price (₹) <span style={{ color: 'red' }}>*</span></label><input id="p-price" value={form.price} onChange={handleInputChange} type="number" /></div>
                    <div className="fg"><label>Original MRP (₹)</label><input id="p-origPrice" value={form.origPrice} onChange={handleInputChange} type="number" /></div>
                    <div className="fg"><label>Tax Percentage (%)</label><input id="p-tax" value={form.tax} onChange={handleInputChange} type="number" step="0.01" /></div>
                  </div>
                </div>
              )}

              {activeTab === 'inventory' && (
                <div style={{ display: 'grid', gap: '20px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div className="fg"><label>Parent SKU <span style={{ color: 'red' }}>*</span></label><input id="p-sku" value={form.sku} onChange={handleInputChange} placeholder="e.g. MVS-SCR-NAV" /></div>
                    <div className="fg"><label>Initial Stock (Per Variant) <span style={{ color: 'red' }}>*</span></label><input id="p-stock" value={form.stock} onChange={handleInputChange} type="number" min="0" /></div>
                  </div>
                  <div className="fg"><label>Colors (Comma separated)</label><input id="p-clrs" value={form.clrs} onChange={handleInputChange} placeholder="Navy Blue, Wine, Teal" /></div>
                  <div className="fg"><label>Sizes (Comma separated)</label><input id="p-sizes" value={form.sizes} onChange={handleInputChange} /></div>
                  <div className="fg">
                    <label>Generated SKU Preview</label>
                    <div style={{ background: '#f1f5f9', padding: '15px', borderRadius: '10px', fontSize: '12px', fontFamily: 'monospace' }}>
                      {form.name && (form.clrs || '').split(',')[0] && `${BRAND_PREFIX[form.brand as keyof typeof BRAND_PREFIX] || 'OTH'}-${GENDER_PREFIX[form.gender as keyof typeof GENDER_PREFIX] || 'U'}-${form.name.slice(0, 3).toUpperCase()}-${(form.clrs || '').split(',')[0].slice(0, 2).toUpperCase()}-S`}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'media' && (
                <div style={{ display: 'grid', gap: '20px' }}>
                  {/* General Images list */}
                  <div className="fg">
                    <label>Product Gallery Images (Upload up to 30 photos total) <span style={{ color: 'red' }}>*</span></label>
                    <p style={{ fontSize: '11px', color: '#64748b', marginBottom: '10px' }}>Drag or sort images. The first image will be set as primary.</p>
                    
                    <input type="file" multiple disabled={form.imgs.length >= 30 || uploadingState.active} onChange={async (e) => {
                      const files = e.target.files;
                      if (!files) return;
                      const token = getToken() || "";
                      const allowedCount = Math.max(0, 30 - form.imgs.length);
                      const filesToUpload = Math.min(files.length, allowedCount);
                      if (filesToUpload === 0) return;

                      setUploadingState({ active: true, current: 0, total: filesToUpload, filename: files[0].name });

                      for (let i = 0; i < filesToUpload; i++) {
                        setUploadingState(prev => ({ ...prev, current: i + 1, filename: files[i].name }));
                        const formData = new FormData(); formData.append("file", files[i]);
                        try {
                          const res = await fetch(`${API_BASE}/upload`, { 
                            method: "POST", 
                            headers: { "Authorization": `Bearer ${token}` }, 
                            body: formData 
                          });
                          const d = await res.json(); 
                          if (d.success && d.data) {
                            setForm((prev: any) => {
                              if (prev.imgs.includes(d.data) || prev.imgs.length >= 30) return prev;
                              return { ...prev, imgs: [...prev.imgs, d.data] };
                            });
                          } else {
                            alert(`Upload failed for ${files[i].name}: ${d.message || "File too large or invalid format. Please check file size (<10MB)."}`);
                          }
                        } catch (err) {
                          alert(`Upload failed for ${files[i].name}: Connection error`);
                        }
                      }
                      setUploadingState({ active: false, current: 0, total: 0, filename: '' });
                      e.target.value = '';
                    }} />

                    {uploadingState.active && (
                      <div style={{ marginTop: '10px', padding: '10px', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', color: '#065f46', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#059669' }} />
                        <span>Uploading <strong>{uploadingState.current} of {uploadingState.total}</strong>: {uploadingState.filename}...</span>
                      </div>
                    )}

                    <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {form.imgs.map((url: string, index: number) => (
                        <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '10px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                          <img src={url.split('?')[0]} alt="" style={{ width: '45px', height: '55px', objectFit: 'cover', borderRadius: '4px' }} />
                          <div style={{ flex: 1, fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {url.split('/').pop()?.split('?')[0]}
                            {index === 0 && <span style={{ marginLeft: '10px', background: '#008080', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '9px', fontWeight: 900 }}>PRIMARY</span>}
                          </div>
                          <div style={{ display: 'flex', gap: '5px' }}>
                            <button type="button" className="btn-secondary" style={{ padding: '4px 8px', fontSize: '12px' }} disabled={index === 0} onClick={() => moveImage(index, 'left')}>▲ Up</button>
                            <button type="button" className="btn-secondary" style={{ padding: '4px 8px', fontSize: '12px' }} disabled={index === form.imgs.length - 1} onClick={() => moveImage(index, 'right')}>▼ Down</button>
                            <button type="button" className="btn-secondary" style={{ padding: '4px 8px', fontSize: '12px', background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' }} onClick={() => selectPrimaryImage(url)}>★ Make Primary</button>
                            <button type="button" className="btn-secondary" style={{ padding: '4px 8px', fontSize: '12px', background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' }} onClick={() => removeImage(url)}>✕ Delete</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <hr style={{ border: '0', height: '1px', background: '#e2e8f0', margin: '10px 0' }} />

                  <div className="fg">
                    <label>Color-Specific Photo Mapping</label>
                    <p style={{ fontSize: '11px', color: '#64748b', marginBottom: '8px' }}>Assign uploaded images to their respective colors to enable gallery swapping.</p>
                    <p style={{ fontSize: '11px', color: '#0f766e', fontWeight: 600, background: '#f0fdf4', padding: '8px 12px', borderRadius: '6px', border: '1px solid #bbf7d0', marginBottom: '15px' }}>
                      💡 <strong>Action Required:</strong> Click on the images under each color to map them. Unselected images will look faded. If you do not select any image for a color, that color will fallback to showing all gallery images.
                    </p>

                    {(form.clrs || '').split(',').map((c: string) => c.trim()).filter(Boolean).map((color: string) => {
                      const hex = getColHex(color);
                      return (
                        <div key={color} style={{ marginBottom: '15px', padding: '12px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: hex }} />
                            <strong style={{ fontSize: '12px' }}>{color} Photos</strong>
                          </div>
                          
                          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
                            {form.imgs.map((url: string, idx: number) => {
                              const isMapped = form.imgsByColor?.[hex]?.includes(url);
                              return (
                                <div key={idx} onClick={() => {
                                  const currentList = form.imgsByColor?.[hex] || [];
                                  const newList = isMapped ? currentList.filter((u: string) => u !== url) : [...currentList, url];
                                  setForm((prev: any) => ({
                                    ...prev,
                                    imgsByColor: { ...prev.imgsByColor, [hex]: newList }
                                  }));
                                }} style={{ 
                                  position: 'relative', 
                                  cursor: 'pointer', 
                                  border: isMapped ? '2px solid #008080' : '1px solid #cbd5e1', 
                                  borderRadius: '6px', 
                                  padding: '2px',
                                  opacity: isMapped ? 1 : 0.45,
                                  transition: 'opacity 0.2s ease, border-color 0.2s ease',
                                  background: isMapped ? '#e0f2f1' : 'transparent',
                                }}>
                                  <img src={url.split('?')[0]} alt="" style={{ width: '40px', height: '48px', objectFit: 'cover', borderRadius: '4px' }} />
                                  {isMapped && <div style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#008080', color: 'white', borderRadius: '50%', width: '14px', height: '14px', display: 'flex', alignItems: 'center', justifyItems: 'center', fontSize: '9px', fontWeight: 900, justifyContent: 'center' }}>✓</div>}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="fg"><label>Video URL</label><input id="p-videoUrl" value={form.videoUrl} onChange={handleInputChange} placeholder="S3 MP4/WebM URL" /></div>
                </div>
              )}

              {activeTab === 'seo' && (
                <div style={{ display: 'grid', gap: '20px' }}>
                  <div className="fg">
                    <label>SEO Meta Title</label>
                    <input id="p-seoTitle" value={form.seoTitle} onChange={handleInputChange} placeholder="Leave blank to generate automatically" />
                    <small style={{ color: '#64748b', fontSize: '11px', marginTop: '4px', display: 'block' }}>Best length: 50-60 characters</small>
                  </div>
                  <div className="fg">
                    <label>SEO Meta Description</label>
                    <textarea id="p-seoDescription" value={form.seoDescription} onChange={handleInputChange} rows={4} placeholder="Leave blank to generate automatically" />
                    <small style={{ color: '#64748b', fontSize: '11px', marginTop: '4px', display: 'block' }}>Best length: 150-160 characters</small>
                  </div>
                  <div className="fg">
                    <label>SEO Meta Keywords (Comma separated)</label>
                    <input id="p-seoKeywords" value={form.seoKeywords} onChange={handleInputChange} placeholder="scrubs, medical, doctor wear, etc." />
                  </div>
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
