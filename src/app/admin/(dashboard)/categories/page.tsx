'use client';

import React, { useState, useEffect } from 'react';
import AdminTopbar from '@/components/admin/AdminTopbar';
import { API_BASE, authHeaders } from '@/lib/api';

export default function AdminCategories() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cats, setCats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCats = async () => {
    try {
      const res = await fetch(`${API_BASE}/categories`);
      const data = await res.json();
      if (data.success) setCats(data.data);
    } catch (e) {
      console.error("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCats();
  }, []);

  const handleSave = async () => {
    const name = (document.getElementById('cat-name') as HTMLInputElement)?.value;
    const slug = (document.getElementById('cat-slug') as HTMLInputElement)?.value;
    const desc = (document.getElementById('cat-desc') as HTMLTextAreaElement)?.value;
    
    if (name) {
      try {
      const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE}/categories`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ 
            name, 
            slug: slug || name.toLowerCase().replace(/ /g, '-'),
            description: desc 
          })
        });
        const data = await res.json();
        if (data.success) {
          fetchCats();
          alert('Category Added Successfully!');
        }
      } catch (e) {
        alert('Failed to add category');
      }
    }
    setIsModalOpen(false);
  };

  return (
    <>
      <AdminTopbar
        title="Categories"
        sub="Organise products into categories"
        action={{ label: '+ Add Category', onClick: () => setIsModalOpen(true) }}
      />
      <div className="admin-content">
        <div className="panel">
          <div className="table-card">
            <div className="table-hd">
              <div className="table-hd-left">
                <div className="table-title">Categories</div>
                <div className="table-sub">{cats.length} categories</div>
              </div>
              <button className="btn-primary" onClick={() => setIsModalOpen(true)}>+ Add Category</button>
            </div>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Slug</th>
                  <th>Products</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {cats.map((c) => (
                  <tr key={c.id}>
                    <td className="td-bold">{c.name}</td>
                    <td>
                      <span className="td-mono">{c.slug}</span>
                    </td>
                    <td>{c.productCount || 0} products</td>
                    <td>
                      {c.active !== false ? (
                        <span className="badge b-grn">Active</span>
                      ) : (
                        <span className="badge b-red">Inactive</span>
                      )}
                    </td>
                    <td>
                      <div className="act-btns">
                        <div className="act-btn edit">✏️</div>
                        <div className="act-btn del" onClick={() => {
                          if (!confirm('Delete this category?')) return;
                          (async () => {
                            try {
                              const token = localStorage.getItem('token');
                              const res = await fetch(`${API_BASE}/categories/${c.id}`, {
                                method: 'DELETE',
                                headers: { 'Authorization': `Bearer ${token}` }
                              });
                              const data = await res.json();
                              if (data.success) {
                                setCats(cats.filter(cat => cat.id !== c.id));
                              } else {
                                alert(data.message || 'Failed to delete category');
                              }
                            } catch (e) {
                              alert('Failed to delete category');
                            }
                          })();
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

      {isModalOpen && (
        <div className="modal-bg" onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false) }}>
          <div className="modal">
            <div className="modal-hd">
              <div className="modal-title">Add Category</div>
              <button className="modal-x" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="fg">
                <label>Category Name</label>
                <input type="text" id="cat-name" placeholder="e.g. Scrubs" />
              </div>
              <div className="fg">
                <label>Slug</label>
                <input type="text" id="cat-slug" placeholder="e.g. scrubs" />
              </div>
              <div className="fg">
                <label>Description</label>
                <textarea id="cat-desc" placeholder="Category description..."></textarea>
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleSave}>Save</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
