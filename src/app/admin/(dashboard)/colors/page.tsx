"use client";

import { useEffect, useState } from "react";
import { API_BASE, authHeaders } from "@/lib/api";

export default function AdminColorsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState({ name: "", hexCode: "#000000", displayOrder: 0, active: true });
  const [editingId, setEditingId] = useState<number | null>(null);

  const load = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE}/admin/colors`, { headers: authHeaders(token) });
    setItems(await res.json());
  };

  useEffect(() => { load(); }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const url = editingId ? `${API_BASE}/admin/colors/${editingId}` : `${API_BASE}/admin/colors`;
    await fetch(url, {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json", ...authHeaders(token) },
      body: JSON.stringify(form),
    });
    setForm({ name: "", hexCode: "#000000", displayOrder: 0, active: true });
    setEditingId(null);
    load();
  };

  return (
    <div className="admin-page">
      <h1 className="admin-page-title">Color Master</h1>
      <form onSubmit={save} className="admin-form" style={{ marginBottom: 24 }}>
        <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input type="color" value={form.hexCode} onChange={(e) => setForm({ ...form, hexCode: e.target.value })} />
        <input type="number" placeholder="Order" value={form.displayOrder} onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })} />
        <label><input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> Active</label>
        <button type="submit">{editingId ? "Update" : "Add"} Color</button>
      </form>
      <table className="admin-table">
        <thead><tr><th>Preview</th><th>Name</th><th>Hex</th><th>Order</th><th>Active</th><th></th></tr></thead>
        <tbody>
          {items.map((c) => (
            <tr key={c.id}>
              <td><span style={{ display: "inline-block", width: 24, height: 24, borderRadius: "50%", background: c.hexCode, border: "1px solid #ccc" }} /></td>
              <td>{c.name}</td><td>{c.hexCode}</td><td>{c.displayOrder}</td><td>{c.active ? "Yes" : "No"}</td>
              <td>
                <button type="button" onClick={() => { setForm(c); setEditingId(c.id); }}>Edit</button>
                <button type="button" onClick={async () => { await fetch(`${API_BASE}/admin/colors/${c.id}`, { method: "DELETE", headers: authHeaders(localStorage.getItem("token")) }); load(); }}>Disable</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
