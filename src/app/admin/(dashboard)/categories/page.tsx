"use client";

import React, { useState, useEffect } from "react";
import AdminTopbar from "@/components/admin/AdminTopbar";
import { API_BASE, authHeaders } from "@/lib/api";
import { useApp } from "@/context/AppContext";

export default function AdminCategories() {
  const { refreshCategories } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cats, setCats] = useState<any[]>([]);
  const [tree, setTree] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", slug: "", description: "", parentId: "" });

  const fetchCats = async () => {
    const [flatRes, treeRes] = await Promise.all([
      fetch(`${API_BASE}/categories`),
      fetch(`${API_BASE}/categories?view=tree`),
    ]);
    const flat = await flatRes.json();
    const treeData = await treeRes.json();
    if (flat.success) setCats(flat.data);
    if (treeData.success) setTree(treeData.data);
  };

  useEffect(() => { fetchCats(); }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm({ name: "", slug: "", description: "", parentId: "" });
    setIsModalOpen(true);
  };

  const openEdit = (c: any) => {
    setEditingId(c.id);
    setForm({ name: c.name, slug: c.slug || "", description: c.description || "", parentId: c.parentId ? String(c.parentId) : "" });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name) return;
    const token = localStorage.getItem("token");
    const body: any = {
      name: form.name,
      slug: form.slug || form.name.toLowerCase().replace(/ /g, "-"),
      description: form.description,
      parentId: form.parentId ? Number(form.parentId) : null,
    };
    const url = editingId ? `${API_BASE}/categories/${editingId}` : `${API_BASE}/categories`;
    const res = await fetch(url, {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json", ...authHeaders(token) },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (data.success) {
      fetchCats();
      refreshCategories();
      setIsModalOpen(false);
    } else {
      alert(data.message || "Failed to save");
    }
  };

  const renderTree = (nodes: any[], depth = 0): React.ReactNode[] =>
    nodes.flatMap((c): React.ReactNode[] => [
      <tr key={c.id}>
        <td className="td-bold" style={{ paddingLeft: depth * 20 + 12 }}>{c.name}</td>
        <td><span className="td-mono">{c.slug}</span></td>
        <td>{c.parentName || "—"}</td>
        <td>{c.active !== false ? <span className="badge b-grn">Active</span> : <span className="badge b-red">Inactive</span>}</td>
        <td>
          <button className="act-btn edit" onClick={() => openEdit(c)}>✏️</button>
          <button className="act-btn del" onClick={() => {
            if (!confirm("Delete this category?")) return;
            fetch(`${API_BASE}/categories/${c.id}`, { method: "DELETE", headers: authHeaders(localStorage.getItem("token")) })
              .then(() => { fetchCats(); refreshCategories(); });
          }}>🗑️</button>
        </td>
      </tr>,
      ...(c.children?.length ? renderTree(c.children, depth + 1) : []),
    ]);

  return (
    <>
      <AdminTopbar title="Categories" sub="Organise products into hierarchy" action={{ label: "+ Add Category", onClick: openCreate }} />
      <div className="admin-content">
        <div className="panel">
          <table className="admin-table">
            <thead>
              <tr><th>Category</th><th>Slug</th><th>Parent</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>{renderTree(tree)}</tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-bg" onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false); }}>
          <div className="modal">
            <div className="modal-hd">
              <div className="modal-title">{editingId ? "Edit" : "Add"} Category</div>
              <button className="modal-x" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>
            <div className="modal-body" style={{ display: "grid", gap: 12 }}>
              <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input placeholder="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
              <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              <select value={form.parentId} onChange={(e) => setForm({ ...form, parentId: e.target.value })}>
                <option value="">No parent (top-level)</option>
                {cats.filter((c) => c.id !== editingId).map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
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
