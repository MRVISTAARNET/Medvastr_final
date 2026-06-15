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

  if (typeof window !== "undefined") {
    (window as any).navHelpers = { load, setForm, setEditingId, API_BASE, authHeaders };
  }

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
        <thead><tr><th>Label</th><th>Href</th><th>Type</th><th>Order</th><th>Active</th><th>Actions</th></tr></thead>
        <tbody>
          {renderNavRows(items.filter(i => !i.parentId))}
        </tbody>
      </table>
    </div>
  );
}

function renderNavRows(nodes: any[], depth = 0): React.ReactNode[] {
  const { load, setForm, setEditingId, API_BASE, authHeaders } = (window as any).navHelpers || {};

  return nodes.flatMap((item: any) => [
    <tr key={item.id}>
      <td style={{ paddingLeft: depth * 24 + 12, fontWeight: depth === 0 ? 700 : 400 }}>
        {depth > 0 && "└ "} {item.label}
      </td>
      <td><span className="td-mono" style={{ fontSize: 12 }}>{item.href}</span></td>
      <td><span className="badge b-neu">{item.itemType}</span></td>
      <td>{item.displayOrder}</td>
      <td>{item.active ? <span className="badge b-grn">Yes</span> : <span className="badge b-red">No</span>}</td>
      <td>
        <button className="act-btn edit" onClick={() => { setForm(item); setEditingId(item.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>✏️</button>
        <button className="act-btn del" onClick={async () => {
          if (!confirm(`Delete "${item.label}" and all its sub-items?`)) return;
          const token = localStorage.getItem("token");
          await fetch(`${API_BASE}/admin/nav/${item.id}`, { method: "DELETE", headers: authHeaders(token) });
          load();
        }}>🗑️</button>
      </td>
    </tr>,
    ...(item.children && item.children.length > 0 ? renderNavRows(item.children, depth + 1) : [])
  ]);
}
