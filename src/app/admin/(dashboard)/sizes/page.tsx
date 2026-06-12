"use client";

import { useEffect, useState } from "react";
import { API_BASE, authHeaders } from "@/lib/api";

export default function AdminSizesPage() {
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState({ name: "", sizeValue: "", category: "APPAREL", displayOrder: 0, active: true });
  const [editingId, setEditingId] = useState<number | null>(null);

  const load = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE}/admin/sizes`, { headers: authHeaders(token) });
    setItems(await res.json());
  };

  useEffect(() => { load(); }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const url = editingId ? `${API_BASE}/admin/sizes/${editingId}` : `${API_BASE}/admin/sizes`;
    await fetch(url, {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json", ...authHeaders(token) },
      body: JSON.stringify(form),
    });
    setForm({ name: "", sizeValue: "", category: "APPAREL", displayOrder: 0, active: true });
    setEditingId(null);
    load();
  };

  return (
    <div className="admin-page">
      <h1 className="admin-page-title">Size Master</h1>
      <form onSubmit={save} className="admin-form" style={{ marginBottom: 24 }}>
        <input placeholder="Label (e.g. Extra Large)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input placeholder="Value (e.g. XL)" value={form.sizeValue} onChange={(e) => setForm({ ...form, sizeValue: e.target.value })} required />
        <input placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
        <input type="number" placeholder="Order" value={form.displayOrder} onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })} />
        <button type="submit">{editingId ? "Update" : "Add"} Size</button>
      </form>
      <table className="admin-table">
        <thead><tr><th>Name</th><th>Value</th><th>Category</th><th>Order</th><th></th></tr></thead>
        <tbody>
          {items.map((s) => (
            <tr key={s.id}>
              <td>{s.name}</td><td>{s.sizeValue}</td><td>{s.category}</td><td>{s.displayOrder}</td>
              <td><button type="button" onClick={() => { setForm(s); setEditingId(s.id); }}>Edit</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
