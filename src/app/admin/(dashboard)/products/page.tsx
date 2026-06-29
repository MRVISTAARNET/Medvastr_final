'use client';

import React, { useState, useEffect, useRef } from 'react';
import AdminTopbar from '@/components/admin/AdminTopbar';
import { fmt, B } from '@/lib/data';
import { useApp } from '@/context/AppContext';
import { API_BASE, authHeaders, getToken } from '@/lib/api';
import { logError } from '@/lib/logger';
import { toJpeg } from 'html-to-image';
import JsBarcode from 'jsbarcode';

function BarcodeImage({ value }: { value: string }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (svgRef.current) {
      try {
        JsBarcode(svgRef.current, value, {
          format: "CODE128",
          width: 1.5,
          height: 45,
          displayValue: true,
          fontSize: 11,
          margin: 5
        });
      } catch (err) {
        console.error("Barcode generation error", err);
      }
    }
  }, [value]);

  return <svg ref={svgRef} style={{ maxWidth: '100%' }} />;
}

// Standardized Mappings for SKU Generation
const GENDER_PREFIX = { 'Men': 'M', 'Women': 'W', 'Unisex': 'U' };
const BRAND_PREFIX = { 'Medvastr': 'MED', 'Fabscrubs': 'FAB', 'Others': 'OTH' };

export function generateVariantSku(gender: string, style: string, name: string, color: string, size: string): string {
  const gPrefix = gender === 'Men' ? 'M' : (gender === 'Women' ? 'W' : 'U');
  const stylePrefix = style || 'Standard';

  const excludeWords = new Set(['fit', 'suit', 'suits', 'wear', 'men', 'mens', 'women', 'womens', 'unisex']);
  const pWords = name.replace(/[^a-zA-Z0-9 ]/g, '').split(' ').filter((w: string) => {
    return w && !excludeWords.has(w.toLowerCase());
  });
  const pPrefix = pWords.map((w: string) => w.charAt(0).toUpperCase()).join('') || 'PROD';

  const colorAbbrMap: Record<string, string> = {
    'navy blue': 'NB', 'navy': 'NB', 'navi blue': 'NB', 'navi': 'NB',
    'royal blue': 'RB', 'light blue': 'LB', 'maroon': 'MR', 'wine': 'WN',
    'black': 'BK', 'white': 'WT', 'green': 'GN', 'olive': 'OL', 'teal': 'TL',
    'grey': 'GR', 'gray': 'GR', 'pink': 'PK', 'purple': 'PL', 'burgundy': 'BG',
    'lavender': 'LV'
  };
  const cleanColor = color.trim().toLowerCase();
  let cPrefix = '';
  if (colorAbbrMap[cleanColor]) {
    cPrefix = colorAbbrMap[cleanColor];
  } else {
    const words = cleanColor.split(/\s+/).filter(Boolean);
    if (words.length > 1) {
      cPrefix = words.map(w => w.charAt(0).toUpperCase()).join('').slice(0, 3);
    } else if (cleanColor.length > 1) {
      cPrefix = (cleanColor.charAt(0) + cleanColor.charAt(cleanColor.length - 1)).toUpperCase();
    } else {
      cPrefix = cleanColor.toUpperCase();
    }
  }

  const cleanSize = size.trim().toUpperCase();
  let sPrefix = cleanSize;
  if (cleanSize === '2XL') sPrefix = 'XXL';
  else if (cleanSize === '3XL') sPrefix = 'XXXL';
  else if (cleanSize === '4XL') sPrefix = 'XXXXL';
  else if (cleanSize === '5XL') sPrefix = 'XXXXXL';
  else if (cleanSize.toLowerCase().includes('free') || cleanSize.toLowerCase().includes('one')) sPrefix = 'FS';

  return `${gPrefix}-${stylePrefix}-${pPrefix}-${cPrefix}-${sPrefix}`;
}

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
  const [isSaving, setIsSaving] = useState(false);

  const { products, categoryTree, refreshProducts } = useApp();

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
    weightValue: '0.5',
    weightUnit: 'kg',
    careInstructions: 'Machine Wash Cold',
    shortDescription: '',
    material: '',
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
  });

  useEffect(() => {
    if (editingProduct) {
      let wv = '0.5';
      let wu = 'kg';
      const rawW = editingProduct.weight || editingProduct.wt || '';
      if (rawW) {
        const num = parseFloat(rawW);
        if (!isNaN(num)) {
          wv = num.toString();
          wu = rawW.toLowerCase().includes('g') && !rawW.toLowerCase().includes('kg') ? 'g' : 'kg';
        }
      }

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
        weightValue: wv,
        weightUnit: wu,
      });
    } else {
      setForm({
        name: '', brand: 'Medvastr', gender: 'Men', style: 'Standard', parentId: '', subCategoryId: '', childCategoryId: '',
        price: 0, origPrice: 0, tax: 0, type: 'scrubs', description: '', fabric: '',
        sizes: 'S, M, L, XL', clrs: '', imgs: [], videoUrl: '', active: true, imgsByColor: {},
        badge: 'None', fit: 'Classic Fit', pocketCount: 0, weightValue: '0.5', weightUnit: 'kg', careInstructions: 'Machine Wash Cold', shortDescription: '',
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
    if (!form.weightValue?.toString().trim()) return alert("Fabric Weight is required");
    if (!form.material?.trim()) return alert("Fabric Composition (Material) is required");
    if (!form.fit?.trim()) return alert("Fit is required");
    if (!form.careInstructions?.trim()) return alert("Care Instructions are required");
    if (!form.price || form.price <= 0) return alert("Selling Price must be greater than 0");
    if (!form.sku?.trim()) return alert("Parent SKU is required");
    if (form.stock === undefined || form.stock < 0) return alert("Stock quantity is required and cannot be negative");
    if (!form.imgs || form.imgs.length === 0) return alert("At least one product image is required");
    if (form.imgs.length > 30) return alert("Maximum 30 images allowed");

    const adminPwd = window.prompt("Security Check: Enter your admin password to confirm these changes:");
    if (!adminPwd) {
      setIsSaving(false);
      return;
    }

    setIsSaving(true);
    try {
      const token = getToken();
    const slug = form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const clrsList = (form.clrs || '').split(',').map((c: string) => c.trim()).filter(Boolean);
    const sizeList = (form.sizes || '').split(',').map((s: string) => s.trim()).filter(Boolean);

    // Prevent duplicates in colors or sizes list
    if (new Set(clrsList).size !== clrsList.length) return alert("Duplicate colors are not allowed");
    if (new Set(sizeList).size !== sizeList.length) return alert("Duplicate sizes are not allowed");

    const variants = sizeList.flatMap((s: string) => clrsList.map((c: string) => {
      const hex = getColHex(c);
      const variantSku = generateVariantSku(form.gender, form.style, form.name, c, s);
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
      seoKeywords,
      weight: `${form.weightValue}${form.weightUnit}`
    };

    const url = editingProduct ? `${API_BASE}/products/${editingProduct.id}` : `${API_BASE}/products`;
    const res = await fetch(url, {
      method: editingProduct ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders(token), 'X-Admin-Password': adminPwd },
      body: JSON.stringify(body)
    });
    
    const data = await res.json();
    if (data.success) {
      alert("Product saved successfully!");
      refreshProducts();
      setIsModalOpen(false);
    } else {
      alert(data.message || "Save failed");
    }
    } catch (err) {
      console.error(err);
      alert("Error saving product.");
    } finally {
      setIsSaving(false);
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

  const [barcodeProduct, setBarcodeProduct] = useState<any>(null);

  const handleDownloadBarcodeItem = async (variant: any, elementId: string) => {
    const el = document.getElementById(elementId);
    if (!el) return;
    const btn = el.querySelector('button');
    if (btn) btn.style.display = 'none';

    try {
      const dataUrl = await toJpeg(el, { quality: 0.95, backgroundColor: '#ffffff' });
      const link = document.createElement('a');
      link.download = `barcode-${variant.sku}.jpeg`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      alert("Error generating barcode image");
    } finally {
      if (btn) btn.style.display = 'block';
    }
  };

  const handleDownloadAllBarcodes = async (product: any) => {
    const variants = product.variants || [];
    if (!variants.length) return;
    alert(`Downloading ${variants.length} barcode images. Please allow multiple file downloads in your browser.`);
    for (let i = 0; i < variants.length; i++) {
      const v = variants[i];
      const cardId = `barcode-card-${v.id || i}`;
      await handleDownloadBarcodeItem(v, cardId);
      await new Promise(r => setTimeout(r, 200));
    }
  };

  const handlePrintBarcodes = (product: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return alert("Pop-up blocked. Please enable pop-ups to print.");

    const variants = product.variants || [];
    let barcodesHTML = '';
    variants.forEach((v: any) => {
      barcodesHTML += `
        <div class="label-card">
          <div class="header">
            <strong>${product.name}</strong>
            <span>Size: ${v.size} | Color: ${v.colorName}</span>
          </div>
          <svg class="barcode-svg" data-value="${v.sku || v.barcode}"></svg>
          <div class="sku-text">${v.sku}</div>
        </div>
      `;
    });

    printWindow.document.write(`
      <html>
        <head>
          <title>Print Barcodes - ${product.name}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 20px; background: white; }
            .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; }
            .label-card { border: 1px dashed #94a3b8; padding: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; page-break-inside: avoid; background: white; border-radius: 6px; }
            .header { display: flex; flex-direction: column; font-size: 11px; margin-bottom: 5px; width: 100%; border-bottom: 1px solid #f1f5f9; padding-bottom: 4px; }
            .sku-text { font-family: monospace; font-size: 10px; margin-top: 5px; word-break: break-all; }
            @media print {
              body { padding: 0; }
              .label-card { border: 1px solid #e2e8f0; }
            }
          </style>
          <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
        </head>
        <body>
          <div class="grid">
            ${barcodesHTML}
          </div>
          <script>
            window.onload = function() {
              const svgs = document.querySelectorAll('.barcode-svg');
              svgs.forEach(svg => {
                const val = svg.getAttribute('data-value');
                try {
                  JsBarcode(svg, val, {
                    format: "CODE128",
                    width: 1.5,
                    height: 40,
                    displayValue: false,
                    margin: 0
                  });
                } catch(e) {
                  console.error(e);
                }
              });
              setTimeout(() => {
                window.print();
                window.close();
              }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
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
                      <td><div className="act-btns"><div className="act-btn edit" onClick={() => openEditModal(p)} title="Edit Product">✏️</div><div className="act-btn barcode" onClick={() => setBarcodeProduct(p)} title="Download/Print Barcodes" style={{ cursor: 'pointer', fontSize: '15px', marginLeft: '8px' }}>🏷️</div></div></td>
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
                    <div className="fg">
                      <label>Product Weight (for shipping) <span style={{ color: 'red' }}>*</span></label>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <input id="p-weightValue" type="number" step="0.01" value={form.weightValue} onChange={handleInputChange} placeholder="e.g. 0.5" style={{ flex: 1 }} />
                        <select id="p-weightUnit" value={form.weightUnit} onChange={handleInputChange} style={{ width: '80px' }}>
                          <option value="kg">kg</option>
                          <option value="g">g</option>
                        </select>
                      </div>
                    </div>
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
                      {form.name && (form.clrs || '').split(',')[0] && (() => {
                        const firstColorName = (form.clrs || '').split(',')[0].trim();
                        const firstSize = (form.sizes || '').split(',')[0]?.trim() || 'M';
                        return generateVariantSku(form.gender, form.style, form.name, firstColorName, firstSize);
                      })()}
                    </div>
                  </div>
                  {editingProduct && (
                    <div style={{ marginTop: '10px', padding: '15px', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <strong style={{ fontSize: '13px', color: '#0369a1', display: 'block' }}>Variant Barcodes</strong>
                        <span style={{ fontSize: '11px', color: '#0284c7' }}>Generate, print, or download scannable barcodes for all {editingProduct.variants?.length || 0} variants.</span>
                      </div>
                      <button type="button" className="btn-primary" style={{ padding: '8px 16px', background: '#0284c7', border: 'none', marginLeft: 'auto', color: 'white', borderRadius: '6px', cursor: 'pointer' }} onClick={() => { setIsModalOpen(false); setBarcodeProduct(editingProduct); }}>
                        🏷️ View Barcodes
                      </button>
                    </div>
                  )}
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
              <button className="btn-secondary" onClick={() => setIsModalOpen(false)} disabled={isSaving}>Cancel</button>
              <button className="btn-primary" onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Product"}
              </button>
            </div>
          </div>
        </div>
      )}

      {barcodeProduct && (
        <div className="modal-bg">
          <div className="modal" style={{ maxWidth: '900px', width: '90%' }}>
            <div className="modal-hd">
              <div className="modal-title">Product Barcode Catalog: {barcodeProduct.name}</div>
              <button className="modal-x" onClick={() => setBarcodeProduct(null)}>✕</button>
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', padding: '15px 20px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
              <button type="button" className="btn-secondary" onClick={() => handlePrintBarcodes(barcodeProduct)}>🖨️ Print Barcode Labels</button>
              <button type="button" className="btn-primary" onClick={() => handleDownloadAllBarcodes(barcodeProduct)}>📥 Download All JPEGs</button>
            </div>
            <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto', padding: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
                {(barcodeProduct.variants || []).map((v: any, index: number) => {
                  const cardId = `barcode-card-${v.id || index}`;
                  return (
                    <div key={v.id || index} id={cardId} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '15px', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '10px', fontSize: '12px' }}>
                        <span style={{ fontWeight: 700, color: '#334155' }}>Size: {v.size}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: v.colorHex || '#cccccc' }} />
                          {v.colorName}
                        </span>
                      </div>
                      <div className="barcode-img-wrap" style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', width: '100%', display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
                        <BarcodeImage value={v.sku || v.barcode} />
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b', fontFamily: 'monospace', marginBottom: '10px', wordBreak: 'break-all' }}>
                        SKU: {v.sku}
                      </div>
                      <button type="button" className="btn-secondary" style={{ width: '100%', padding: '6px 12px', fontSize: '12px' }} onClick={() => handleDownloadBarcodeItem(v, cardId)}>
                        Download JPEG
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="modal-foot">
              <button type="button" className="btn-secondary" onClick={() => setBarcodeProduct(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
