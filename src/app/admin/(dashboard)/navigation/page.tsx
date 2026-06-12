"use client";

import { useEffect, useState } from "react";
import { API_BASE, authHeaders } from "@/lib/api";

const ITEM_TYPES = ["LINK", "DROPDOWN", "MEGA_MENU"];

export default function AdminNavigationPage() {
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState({
    label: "", href: "", itemType: "LINK", gender: "", displayOrder: 0, active: true, openNewTab: false,
  });
  const [editingId, setEditingId] = useState<number | null>(null);

  const load = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE}/admin/nav`, { headers: authHeaders(token) });
    setItems(await res.json());
  };

  useEffect(() => { load(); }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const url = editingId ? `${API_BASE}/admin/nav/${editingId}` : `${API_BASE}/admin/nav`;
    await fetch(url, {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json", ...authHeaders(token) },
      body: JSON.stringify(form),
    });
    setForm({ label: "", href: "", itemType: "LINK", gender: "", displayOrder: 0, active: true, openNewTab: false });
    setEditingId(null);
    load();
  };

  return (
    <div className="admin-page">
      <h1 className="admin-page-title">Navigation Menu</h1>
      <p style={{ color: "#888", marginBottom: 20 }}>Manage top-level navbar items. Use MEGA_MENU for Men/Women, DROPDOWN for category menus.</p>
      <form onSubmit={save} className="admin-form" style={{ marginBottom: 24, display: "grid", gap: 8, maxWidth: 600 }}>
        <input placeholder="Label" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} required />
        <input placeholder="Href (e.g. /bulk-orders)" value={form.href} onChange={(e) => setForm({ ...form, href: e.target.value })} />
        <select value={form.itemType} onChange={(e) => setForm({ ...form, itemType: e.target.value })}>
          {ITEM_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <input placeholder="Gender (men/women for mega menu)" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} />
        <input type="number" placeholder="Display order" value={form.displayOrder} onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })} />
        <button type="submit">{editingId ? "Update" : "Add"} Item</button>
      </form>
      <table className="admin-table">
        <thead><tr><th>Label</th><th>Href</th><th>Type</th><th>Order</th><th>Active</th><th></th></tr></thead>
        <tbody>
          {items.filter((i) => !i.parentId).map((item) => (
            <tr key={item.id}>
              <td>{item.label}</td><td>{item.href}</td><td>{item.itemType}</td><td>{item.displayOrder}</td><td>{item.active ? "Yes" : "No"}</td>
              <td>
                <button type="button" onClick={() => { setForm(item); setEditingId(item.id); }}>Edit</button>
                <button type="button" onClick={async () => { await fetch(`${API_BASE}/admin/nav/${item.id}`, { method: "DELETE", headers: authHeaders(localStorage.getItem("token")) }); load(); }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
