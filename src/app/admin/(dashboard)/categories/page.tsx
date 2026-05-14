'use client';

import React, { useState } from 'react';
import AdminTopbar from '@/components/admin/AdminTopbar';

export default function AdminCategories() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cats, setCats] = useState([
    { id: 1, name: 'Scrubs', slug: 'scrubs', products: 10, active: true },
    { id: 2, name: 'Lab Coats', slug: 'labcoat', products: 2, active: true },
    { id: 3, name: 'Stethoscope', slug: 'stethoscope', products: 2, active: true },
    { id: 4, name: 'DRIFT Jacket', slug: 'jacket', products: 2, active: true },
    { id: 5, name: 'Underscrubs', slug: 'underscrub', products: 2, active: true },
    { id: 6, name: 'Accessories', slug: 'accessories', products: 2, active: true },
  ]);

  const handleSave = () => {
    const name = (document.getElementById('cat-name') as HTMLInputElement)?.value;
    const slug = (document.getElementById('cat-slug') as HTMLInputElement)?.value;
    
    if (name) {
      const newCat = {
        id: Date.now(),
        name,
        slug: slug || name.toLowerCase().replace(/ /g, '-'),
        products: 0,
        active: true
      };
      setCats([...cats, newCat]);
      alert('Category Added Successfully!');
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
                    <td>{c.products} products</td>
                    <td>
                      {c.active ? (
                        <span className="badge b-grn">Active</span>
                      ) : (
                        <span className="badge b-red">Inactive</span>
                      )}
                    </td>
                    <td>
                      <div className="act-btns">
                        <div className="act-btn edit">✏️</div>
                        <div className="act-btn del" onClick={() => { if(confirm('Delete this category?')) setCats(cats.filter(cat => cat.id !== c.id)) }}>🗑️</div>
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
