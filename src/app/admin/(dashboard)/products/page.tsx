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
    weight: '', care: '', stretch: '', fabD: '', pockets: '', videoUrl: '',
    seoTitle: '', seoDescription: '', shortDescription: '', material: '', tags: ''
  });

  const labelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editingProduct) {
      setForm({
        ...editingProduct,
        name: editingProduct.name || '',
        type: editingProduct.type || 'scrubs',
        price: editingProduct.price || '',
        originalPrice: editingProduct.originalPrice || '',
        badge: editingProduct.badge || '',
        desc: editingProduct.description || editingProduct.desc || '',
        gen: editingProduct.gender || editingProduct.gen || 'unisex',
        fit: editingProduct.fit || '',
        fab: editingProduct.fabric || editingProduct.fab || '',
        fabD: editingProduct.fabricDetail || editingProduct.fabD || '',
        stretch: editingProduct.stretchType || editingProduct.stretch || '',
        pockets: editingProduct.pocketCount || editingProduct.pockets || '',
        care: editingProduct.careInstructions || editingProduct.care || '',
        weight: editingProduct.wt || editingProduct.weight || '',
        emo: editingProduct.emoji || editingProduct.emo || '📦',
        styleId: editingProduct.styleId || '',
        sku: editingProduct.sku || '',
        videoUrl: editingProduct.videoUrl || '',
        imgs: editingProduct.imgs || [],
        sizes: editingProduct.sizes?.join(', ') || '',
        clrs: editingProduct.clrNms?.join(', ') || editingProduct.clrs?.join(', ') || '',
        catId: editingProduct.categoryId || editingProduct.catId || ''
      });
    } else {
      setForm({
        name: '', type: 'scrubs', price: '', originalPrice: '', badge: '', desc: '',
        gen: 'unisex', fab: '', fit: '', catId: '', imgs: [], emo: '📦',
        sku: '', styleId: '', brand: 'Medvastr', sizes: 'XS, S, M, L, XL', clrs: '', barcode: '',
        weight: '', care: '', stretch: '', fabD: '', pockets: '', videoUrl: ''
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

  // SKU Mapping Codes
  const GENDER_CODES: Record<string, string> = { men: 'MEN', women: 'WOM', unisex: 'UNI' };
  const CAT_CODES: Record<string, string> = {
    top: 'TOP', bottom: 'BOT', set: 'SET', tshirt: 'TSH', underscrub: 'USC', cap: 'CAP', linen: 'LIN'
  };
  const PRODUCT_NAME_CODES: Record<string, string> = {
    'flexi fit v scrub': 'FVS',
    'classic scrub': 'CLS',
    'cotton crew tshirt': 'CCT',
    'compression under scrub': 'CUS',
    'surgical gown': 'SGN',
    'surgical cap': 'SCP'
  };
  const COLOR_CODES: Record<string, string> = {
    'navy blue': 'NB', 'light blue': 'LB', 'maroon': 'MR', 'wine': 'WN',
    'black': 'BK', 'lavender': 'LV', 'green': 'GN', 'grey': 'GR', 'teal': 'TL'
  };

  const getProductCode = (name: string) => {
    const n = name.toLowerCase();
    for (const [key, code] of Object.entries(PRODUCT_NAME_CODES)) {
      if (n.includes(key)) return code;
    }
    return 'PRD'; // Default
  };

  const getColCode = (name: string) => {
    const n = name.trim().toLowerCase();
    if (COLOR_CODES[n]) return COLOR_CODES[n];
    return n.slice(0, 2).toUpperCase();
  };

  // Color Map (Name to Hex)
  const COLOR_MAP: Record<string, string> = {
    'navy blue': '#1a2b4a', 'navy': '#000080', 'royal blue': '#4169e1', 'light blue': '#add8e6',
    'maroon': '#800000', 'wine': '#722f37', 'black': '#000000', 'white': '#ffffff',
    'green': '#2e7d32', 'olive': '#556b2f', 'teal': '#008080', 'grey': '#808080',
    'pink': '#ffc0cb', 'purple': '#800080', 'burgundy': '#800020', 'lavender': '#e6e6fa'
  };

  const getColHex = (name: string) => {
    const n = name.trim().toLowerCase();
    if (COLOR_MAP[n]) return COLOR_MAP[n];
    if (n.startsWith('#')) return n;
    return '#cccccc';
  };

  const getColName = (input: string) => {
    const raw = input.trim();
    if (!raw) return "Default";
    if (raw.startsWith('#')) return raw.toUpperCase();
    return raw.replace(/\s+/g, ' ').trim();
  };

  const isVideo = (url: string) => /\.(mp4|webm|ogg|mov)$/i.test(url);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    const key = id.replace('p-', '');
    setForm((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string, isMultiple: boolean = false) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const token = getToken() || "";

    // Multiple upload logic
    if (isMultiple) {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const validationError = validateImageUpload(file);
        if (validationError) {
          alert(`${file.name}: ${validationError}`);
          continue;
        }

        const formData = new FormData();
        formData.append("file", file);
        try {
          const res = await fetch(`${API_BASE}/upload`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${token}` },
            body: formData,
          });
          const data = await res.json();
          if (data.success) {
            uploadedUrls.push(data.data);
          }
        } catch (err) {
          logError(`upload:${file.name}`, err);
        }
      }

      setForm((prev: any) => ({
        ...prev,
        [field]: [...(Array.isArray(prev[field]) ? prev[field] : []), ...uploadedUrls]
      }));
    } else {
      // Single upload logic (e.g. video)
      const file = files[0];
      const validationError = validateImageUpload(file);
      if (validationError) {
        alert(validationError);
        return;
      }

      const token = getToken() || "";

      // Cleanup existing asset before replacing
      if (form[field]) {
        try {
          await fetch(`${API_BASE}/upload`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({ url: form[field] })
          });
        } catch { }
      }

      const formData = new FormData();
      formData.append("file", file);
      try {
        const res = await fetch(`${API_BASE}/upload`, {
          method: "POST",
          headers: { "Authorization": `Bearer ${token}` },
          body: formData,
        });
        const data = await res.json();
        if (data.success) {
          setForm((prev: any) => ({ ...prev, [field]: data.data }));
        } else {
          alert(data.message || "Upload failed");
        }
      } catch (err) {
        alert("Error uploading file");
      }
    }
  };

  const handleSave = async () => {
    if (form.name && form.price) {
      const colorInputs = (form.clrs || '').split(',').map((c: string) => c.trim()).filter(Boolean);
      const sizeInputs = (form.sizes || '').split(',').map((s: string) => s.trim()).filter(Boolean);
      const variantStock = 100;
      const imgList = Array.isArray(form.imgs) ? form.imgs : form.imgs ? [form.imgs] : [];
      const variants = sizeInputs.flatMap((size: string) =>
        colorInputs.map((colorInput: string) => {
          const gCode = GENDER_CODES[form.gen] || 'MEN';
          const cCode = CAT_CODES[form.styleId] || 'TOP';
          const pCode = getProductCode(form.name);
          const colCode = getColCode(colorInput);
          const sCode = size.replace(/\s+/g, '').toUpperCase();
          const SKU = `${gCode}-${cCode}-${pCode}-${colCode}-${sCode}`;
          const BarcodeValue = SKU.replace(/-/g, '');

          return {
            size,
            colorName: getColName(colorInput),
            colorHex: getColHex(colorInput),
            stockQuantity: variantStock,
            sku: SKU,
            barcode: BarcodeValue
          };
        })
      );
      // Assign hero images per colour based on the user's manual pairing (?clr= tag)
      colorInputs.forEach((colorInput: string) => {
        const hex = getColHex(colorInput);
        // Find the first image tagged with this color, or fallback to the very first image
        const matchedImg = imgList.find((url: string) => url.includes(`?clr=${hex}`)) || imgList[0];

        if (matchedImg) {
          const matchingVariants = variants.filter((v: { colorHex: string }) => v.colorHex === hex);
          matchingVariants.forEach((v: any) => {
            v.imageUrl = matchedImg;
          });
        }
      });

      const pData: any = {
        ...form,
        price: parseFloat(form.price) || 0,
        originalPrice: parseFloat(form.originalPrice) || undefined,
        imgs: Array.isArray(form.imgs) ? form.imgs : (form.imgs ? [form.imgs] : []),
        sizes: sizeInputs,
        clrs: colorInputs.map((c: string) => getColHex(c)).filter(Boolean),
        variants,
        active: true
      };

      if (editingProduct) {
        await updateProduct({ ...editingProduct, ...pData });
        setIsModalOpen(false);
        setEditingProduct(null);
      } else {
        const saved = await addProduct(pData);
        if (saved) {
          setEditingProduct(saved);
        }
      }
    } else {
      alert('Please fill Name and Price');
    }
  };

  const downloadAllBarcodes = async () => {
    if (!editingProduct?.variants?.length) return;
    const variants = editingProduct.variants;

    // Check if we have multiple variants
    if (!confirm(`This will download ${variants.length} barcode labels. Continue?`)) return;

    for (let i = 0; i < variants.length; i++) {
      const v = variants[i];
      // Note: In a real production app, we'd use a ZIP library or a server-side PDF generator.
      // For this demo, we'll download them sequentially.
      const vForm = {
        ...form,
        barcode: v.sku,
        sku: v.sku,
        currentSize: v.size,
        currentColor: v.colorName
      };

      // We temporarily update the preview to the specific variant
      const labelNode = document.getElementById(`label-${i}`);
      if (!labelNode) continue;

      try {
        const dataUrl = await toJpeg(labelNode, { cacheBust: true, pixelRatio: 2 });
        const link = document.createElement('a');
        link.download = `barcode-${v.sku}.jpg`;
        link.href = dataUrl;
        link.click();
        // Add a small delay to avoid browser blocking
        await new Promise(r => setTimeout(r, 500));
      } catch (err) {
        console.error(`Barcode ${v.sku} failed`, err);
      }
    }
  };

  const downloadBarcode = async (ref: React.RefObject<HTMLDivElement | null>, sku: string) => {
    if (!ref.current) return;
    try {
      const dataUrl = await toJpeg(ref.current, { cacheBust: true, pixelRatio: 3 });
      const link = document.createElement('a');
      link.download = `barcode-${sku || 'product'}.jpg`;
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
                      <td>{p.badge ? (p.badge.split(',').map((b: string, i: number) => <span key={i} className="badge b-purple" style={{ marginRight: '4px', marginBottom: '4px' }}>{b.trim()}</span>)) : '-'}</td>
                      <td>{(p as any).active ? <span className="badge b-grn">Active</span> : <span className="badge b-red">Inactive</span>}</td>
                      <td>
                        <div className="act-btns">
                          <div className="act-btn edit" title="Edit" onClick={() => openEditModal(p)}>✏️</div>
                          <div className="act-btn del" title="Delete" onClick={async () => {
                            if (confirm(`Delete ${p.name}?`)) {
                              await deleteProduct(p.id);
                              // Cleanup S3 images
                              const token = getToken();
                              const imgUrls = (p as any).imgs || (p as any).imageUrls || [];
                              for (const url of imgUrls) {
                                try {
                                  await fetch(`${API_BASE}/upload`, {
                                    method: "DELETE",
                                    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                                    body: JSON.stringify({ url })
                                  });
                                } catch { }
                              }
                            }
                          }}>🗑️</div>
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
        <div className="modal-bg">
          <div className="modal" style={{ maxWidth: '860px', width: '100%', maxHeight: '90vh' }}>
            <div className="modal-hd">
              <div className="modal-title">{editingProduct ? 'Edit Product Details' : 'Add New Product'}</div>
              <button type="button" className="modal-x" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} style={{ flex: 1, overflowY: 'auto', padding: '24px 26px' }}>
              {/* Basic Details */}
              <div className="fg-row">
                <div className="fg" style={{ gridColumn: '1 / -1' }}>
                  <label>Product Name *</label>
                  <input type="text" id="p-name" value={form.name} onChange={handleInputChange} placeholder="Men's Classic V-Neck Scrub" required />
                </div>
              </div>
              <div className="fg-row">
                <div className="fg">
                  <label>Category</label>
                  <select id="p-catId" value={form.catId} onChange={handleInputChange}>
                    <option value="">Select Category</option>
                    {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="fg">
                  <label>Type Key (Tabs)</label>
                  <select id="p-type" value={form.type} onChange={handleInputChange}>
                    <option value="scrubs">scrubs (Uniforms & Scrubs)</option>
                    <option value="linen">linen (Linen & Bedding)</option>
                    <option value="surgical">surgical (Surgical Wear)</option>
                    <option value="diagnostic">diagnostic (Diagnostic & Caps)</option>
                    <option value="other">other</option>
                  </select>
                </div>
              </div>
              <div className="fg-row">
                <div className="fg">
                  <label>Brand</label>
                  <input type="text" id="p-brand" value={form.brand} onChange={handleInputChange} placeholder="Brand Name" />
                </div>
                <div className="fg">
                  <label>Gender</label>
                  <select id="p-gen" value={form.gen} onChange={handleInputChange}>
                    <option value="men">Men</option>
                    <option value="women">Women</option>
                    <option value="unisex">Unisex (Shows in both Men & Women)</option>
                  </select>
                </div>
                <div className="fg">
                  <label>Style / Fit Group</label>
                  <select id="p-styleId" value={form.styleId} onChange={handleInputChange}>
                    <option value="top">Top</option>
                    <option value="bottom">Bottom</option>
                    <option value="set">Full Set (Top + Bottom)</option>
                    <option value="gown">Gown (Single Piece)</option>
                    <option value="patient-dress">Patient Dress</option>
                    <option value="maternity-gown">Maternity Gown</option>
                    <option value="tshirt">T-Shirt / Crew</option>
                    <option value="underscrub">Under Scrub</option>
                    <option value="cap">Cap / Accessory</option>
                    <option value="linen">Linen / Bedding</option>
                    <option value="blanket">Blanket</option>
                    <option value="other">Other / Single Piece</option>
                  </select>
                </div>
                <div className="fg">
                  <label>Status</label>
                  <select id="p-active" value={form.active ? "true" : "false"} onChange={(e) => setForm((prev: any) => ({ ...prev, active: e.target.value === "true" }))}>
                    <option value="true">Active</option>
                    <option value="false">Hidden</option>
                  </select>
                </div>
              </div>
              <div className="fg">
                <label>Description</label>
                <textarea id="p-desc" value={form.desc} onChange={handleInputChange} placeholder="Product description..." rows={3} />
              </div>

              {/* Pricing & Merchandising */}
              <div className="fg-row" style={{ marginTop: '8px' }}>
                <div className="fg">
                  <label>Price (₹) *</label>
                  <input type="number" id="p-price" value={form.price} onChange={handleInputChange} placeholder="1099" required />
                </div>
                <div className="fg">
                  <label>Original Price (₹)</label>
                  <input type="number" id="p-originalPrice" value={form.originalPrice} onChange={handleInputChange} placeholder="Strikethrough price" />
                </div>
              </div>
              <div className="fg-row">
                <div className="fg" style={{ gridColumn: 'span 2' }}>
                  <label>Badges (Select Multiple)</label>
                  <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', padding: '12px', background: '#f8fafc', borderRadius: '12px', border: '1.5px solid #e2e8f0' }}>
                    {["Bestseller", "New", "New Launch", "Premium", "10% Off", "Limited Edition", "Buy Set & Save", "Bundle Deal"].map(tag => (
                      <label key={tag} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                        <input
                          type="checkbox"
                          checked={(form.badge || "").includes(tag)}
                          onChange={(e) => {
                            const current = (form.badge || "").split(',').map((s: string) => s.trim()).filter(Boolean);
                            let next;
                            if (e.target.checked) {
                              next = [...current, tag];
                            } else {
                              next = current.filter((t: string) => t !== tag);
                            }
                            setForm((prev: any) => ({ ...prev, badge: next.join(', ') }));
                          }}
                        />
                        {tag}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="fg">
                  <label>Emoji</label>
                  <input type="text" id="p-emo" value={form.emo} onChange={handleInputChange} placeholder="🥼" />
                </div>
              </div>
              {/* Media Upload — REDESIGNED: COLOR-GROUPED */}
              <div className="media-section" style={{ background: '#f8fafc', padding: '28px', borderRadius: '24px', border: '1px solid #e2e8f0', marginTop: '24px', marginBottom: '24px' }}>
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>📸</span> Media & Color Pairing
                  </h3>
                  <p style={{ fontSize: '13px', color: '#64748b' }}>
                    Assign images to specific colors. The first image in each color group will be the primary thumbnail.
                  </p>
                </div>

                <div className="fg" style={{ marginBottom: '24px' }}>
                  <label style={{ fontWeight: 700, color: '#0f172a' }}>Upload New Media (Images/Videos)</label>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    onChange={(e) => handleFileUpload(e, 'imgs', true)}
                    style={{ marginTop: '8px', padding: '12px', background: '#fff', borderRadius: '12px', border: '2px dashed #cbd5e1', width: '100%' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {(() => {
                    const colorInputs = (form.clrs || '').split(',').map((c: string) => c.trim()).filter(Boolean);
                    const allGroups = [...colorInputs, 'Unassigned'];

                    return allGroups.map(colorName => {
                      const hex = colorName === 'Unassigned' ? 'all' : getColHex(colorName);
                      const groupImgs = (form.imgs || []).filter((url: string) => {
                        const tag = url.split('?clr=')[1] || 'all';
                        return tag === hex;
                      });

                      if (groupImgs.length === 0 && colorName === 'Unassigned') return null;

                      return (
                        <div key={colorName} style={{ background: '#fff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                            {colorName !== 'Unassigned' && <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: hex, border: '1px solid rgba(0,0,0,0.1)' }} />}
                            <span style={{ fontWeight: 800, fontSize: '14px', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                              {colorName} {colorName !== 'Unassigned' ? 'Media' : ''}
                            </span>
                            <span style={{ fontSize: '12px', color: '#94a3b8', marginLeft: 'auto' }}>{groupImgs.length} items</span>
                          </div>

                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                            {groupImgs.map((url: string) => {
                              const originalIdx = form.imgs.indexOf(url);
                              return (
                                <div key={url} style={{ width: '100px', position: 'relative' }}>
                                  <div style={{ width: '100%', aspectRatio: '1/1', borderRadius: '10px', overflow: 'hidden', border: '1px solid #f1f5f9' }}>
                                    {isVideo(url) ? (
                                      <div style={{ width: '100%', height: '100%', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>🎬</div>
                                    ) : (
                                      <img src={url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="preview" />
                                    )}
                                  </div>

                                  {/* Delete */}
                                  <div
                                    style={{ position: 'absolute', top: -5, right: -5, width: '20px', height: '20px', background: '#ef4444', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', cursor: 'pointer', fontWeight: 900, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                                    onClick={() => {
                                      const next = [...form.imgs];
                                      next.splice(originalIdx, 1);
                                      setForm((prev: any) => ({ ...prev, imgs: next }));
                                    }}
                                  >✕</div>

                                  {/* Color Cycler / Move */}
                                  <select
                                    value={hex}
                                    style={{ width: '100%', fontSize: '9px', marginTop: '6px', padding: '4px', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#f8fafc' }}
                                    onChange={(e) => {
                                      const next = [...form.imgs];
                                      const base = url.split('?')[0];
                                      next[originalIdx] = e.target.value === 'all' ? base : `${base}?clr=${e.target.value}`;
                                      setForm((prev: any) => ({ ...prev, imgs: next }));
                                    }}
                                  >
                                    <option value="all">Unassigned</option>
                                    {colorInputs.map((c: string) => <option key={c} value={getColHex(c)}>{c}</option>)}
                                  </select>
                                </div>
                              );
                            })}

                            {groupImgs.length === 0 && (
                              <div style={{ padding: '20px', border: '2px dashed #f1f5f9', borderRadius: '10px', width: '100%', textAlign: 'center', color: '#94a3b8', fontSize: '12px' }}>
                                No images assigned to {colorName}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>

                <div className="fg" style={{ marginTop: '24px' }}>
                  <label style={{ fontWeight: 700 }}>Primary Product Video (Optional)</label>
                  <input type="file" accept="video/*" onChange={(e) => handleFileUpload(e, 'videoUrl', false)} />
                  {form.videoUrl && (
                    <p style={{ fontSize: '12px', color: '#0369a1', marginTop: '8px', fontWeight: 700 }}>✓ Video Uploaded</p>
                  )}
                </div>
              </div>

              {/* Properties & Variants */}
              <div className="variant-section" style={{ background: '#f8fafc', padding: '24px', borderRadius: '20px', border: '1px solid #e2e8f0', marginTop: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>🎨</span> Variant Management & Barcodes
                </h3>

                <div className="fg-row">
                  <div className="fg">
                    <label>Sizes (Separated by comma)</label>
                    <input type="text" id="p-sizes" value={form.sizes} onChange={handleInputChange} placeholder="XS, S, M, L, XL" />
                  </div>
                  <div className="fg">
                    <label>Colors (Separated by comma)</label>
                    <input type="text" id="p-clrs" value={form.clrs} onChange={handleInputChange} placeholder="Navy Blue, Deep Maroon" />
                  </div>
                </div>

                {editingProduct && (
                  <div style={{ marginTop: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <p style={{ fontSize: '13px', fontWeight: 700, color: '#64748b' }}>Generated Inventory Variants ({editingProduct.variants?.length})</p>
                      <button type="button" className="btn-primary" style={{ fontSize: '12px', padding: '8px 16px' }} onClick={downloadAllBarcodes}>⬇️ Download All Barcodes</button>
                    </div>

                    <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px', background: 'white' }}>
                      <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
                        <thead style={{ position: 'sticky', top: 0, background: '#f1f5f9' }}>
                          <tr>
                            <th style={{ textAlign: 'left', padding: '10px' }}>Variant</th>
                            <th style={{ textAlign: 'left', padding: '10px' }}>SKU</th>
                            <th style={{ textAlign: 'center', padding: '10px' }}>Labels</th>
                          </tr>
                        </thead>
                        <tbody>
                          {editingProduct.variants?.map((v: any, idx: number) => (
                            <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                              <td style={{ padding: '10px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: v.colorHex }} />
                                  <strong>{v.size}</strong> <span style={{ opacity: 0.6 }}>/</span> {v.colorName}
                                </div>
                              </td>
                              <td style={{ padding: '10px', fontFamily: 'monospace' }}>{v.sku}</td>
                              <td style={{ padding: '10px', textAlign: 'center' }}>
                                <button type="button" style={{ color: '#008080', fontWeight: 800 }} onClick={() => {
                                  const node = document.getElementById(`label-${idx}`);
                                  if (node) {
                                    const mockLink = { current: node };
                                    downloadBarcode(mockLink as any, v.sku);
                                  }
                                }}>Print</button>
                                {/* Hidden Labels for printing */}
                                <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
                                  <div id={`label-${idx}`} style={{ width: '350px', padding: '30px', background: 'white', border: '2px solid black', color: 'black', fontFamily: 'sans-serif' }}>
                                    <div style={{ textAlign: 'center', fontSize: '28px', fontWeight: 900, marginBottom: '10px', borderBottom: '2px solid black', paddingBottom: '10px' }}>{B.name.toUpperCase()}</div>
                                    <div style={{ fontSize: '14px', marginBottom: '4px' }}><strong>ID:</strong> {v.sku}</div>
                                    <div style={{ fontSize: '14px', marginBottom: '4px' }}><strong>PRODUCT:</strong> {form.name}</div>
                                    <div style={{ fontSize: '14px', marginBottom: '4px' }}><strong>SIZE:</strong> {v.size}</div>
                                    <div style={{ fontSize: '14px', marginBottom: '10px' }}><strong>COLOR:</strong> {v.colorName}</div>
                                    <div style={{ fontSize: '24px', fontWeight: 900, marginTop: '10px' }}>MRP: ₹ {form.price}</div>
                                    <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
                                      <Barcode value={v.sku} width={1.5} height={50} fontSize={12} />
                                    </div>
                                    <div style={{ marginTop: '15px', fontSize: '10px', textAlign: 'center', opacity: 0.7 }}>medvastr.com | {B.phone1}</div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              <div className="fg-row" style={{ marginTop: '24px' }}>
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
                <label>Fabric Detail</label>
                <input type="text" id="p-fabD" value={form.fabD} onChange={handleInputChange} placeholder="72% Polyester, 21% Rayon, 7% Spandex" />
              </div>
              {/* Inventory & SEO */}
              <div className="fg-row">
                <div className="fg">
                  <label>Style ID (Prefix)</label>
                  <input type="text" id="p-styleId" value={form.styleId} onChange={handleInputChange} placeholder="e.g. FF_DS_DB_SM" />
                </div>
                <div className="fg">
                  <label>SKU (Auto)</label>
                  <input type="text" id="p-sku" value={form.sku} onChange={handleInputChange} readOnly style={{ background: 'var(--bg)', color: 'var(--txt3)' }} />
                </div>
              </div>
              <div className="fg-row">
                <div className="fg">
                  <label>SEO Title</label>
                  <input id="p-seoTitle" value={form.seoTitle || ''} onChange={handleInputChange} placeholder="Page title for search engines" />
                </div>
                <div className="fg">
                  <label>SEO Description</label>
                  <input id="p-seoDescription" value={form.seoDescription || ''} onChange={handleInputChange} placeholder="Meta description" />
                </div>
              </div>

              {/* Barcode Label Design */}
              {editingProduct ? (
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-inner flex flex-col items-center">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Barcode Label Preview</p>
                  <div className="flex flex-col items-center gap-4">
                    <div ref={labelRef} className="bg-white p-6 border border-black rounded shadow-sm text-black font-sans w-[350px]">
                      <div className="text-center text-2xl font-black mb-3 border-b-2 border-black pb-2 tracking-tighter">{B.name.toUpperCase()}</div>
                      <div className="text-sm mb-1"><strong>Product:</strong> {form.name || '---'}</div>
                      <div className="text-sm mb-1"><strong>Style ID:</strong> {form.styleId || '---'}</div>
                      <div className="text-sm mb-1"><strong>Colour:</strong> {(form.clrs || '').split(',')[0] || '---'}</div>
                      <div className="text-sm mb-1"><strong>Size:</strong> {(form.sizes || '').split(',')[0] || '---'}</div>
                      <div className="text-xl font-bold mt-4">MRP: ₹ {form.price || '0'}</div>

                      <div className="flex justify-center mt-6">
                        {form.barcode && <Barcode value={form.barcode} width={1.5} height={50} fontSize={12} background="#ffffff" />}
                      </div>

                      <div className="mt-4 text-[10px] text-center border-t border-dashed border-gray-400 pt-3 opacity-80">
                        Email: {B.email} <br />
                        Phone: {B.phone1}
                      </div>
                    </div>
                    <button type="button" className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold shadow-md transition-all flex items-center gap-2" onClick={() => downloadBarcode(labelRef, form.barcode)}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                      Download PDF Label
                    </button>
                    <p className="text-xs text-slate-500 font-medium mt-1">Label generated from saved data.</p>
                  </div>
                </div>
              ) : (
                <div className="bg-emerald-50 border-2 border-dashed border-emerald-200 rounded-2xl p-8 text-center">
                  <div className="text-2xl mb-2">📦</div>
                  <h4 className="text-emerald-800 font-bold mb-1">Save Product First</h4>
                  <p className="text-emerald-600 text-sm font-medium">You can auto-generate and download professional barcodes once this product is created.</p>
                </div>
              )}

            </form>
            <div className="modal-foot">
              <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button type="button" className="btn-primary" onClick={handleSave}>{editingProduct ? 'Save Changes' : 'Create Product'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
