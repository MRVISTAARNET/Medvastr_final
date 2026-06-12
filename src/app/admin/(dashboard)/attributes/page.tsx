"use client";

import { useEffect, useState } from "react";
import { API_BASE, authHeaders } from "@/lib/api";
import AdminTopbar from "@/components/admin/AdminTopbar";

export default function AdminAttributesPage() {
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState({ name: "", slug: "", attributeType: "SELECT", displayOrder: 0, filterable: true, active: true });
  const [valueForm, setValueForm] = useState({ attributeId: 0, value: "", displayOrder: 0 });
  const [editingId, setEditingId] = useState<number | null>(null);

  const load = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE}/admin/attributes`, { headers: authHeaders(token) });
    setItems(await res.json());
  };

  useEffect(() => { load(); }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const url = editingId ? `${API_BASE}/admin/attributes/${editingId}` : `${API_BASE}/admin/attributes`;
    await fetch(url, {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json", ...authHeaders(token) },
      body: JSON.stringify(form),
    });
    setForm({ name: "", slug: "", attributeType: "SELECT", displayOrder: 0, filterable: true, active: true });
    setEditingId(null);
    load();
  };

  const addValue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valueForm.attributeId) return;
    const token = localStorage.getItem("token");
    await fetch(`${API_BASE}/admin/attributes/${valueForm.attributeId}/values`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders(token) },
      body: JSON.stringify({ value: valueForm.value, displayOrder: valueForm.displayOrder, active: true }),
    });
    setValueForm({ attributeId: 0, value: "", displayOrder: 0 });
    load();
  };

  const removeValue = async (valueId: number) => {
    const token = localStorage.getItem("token");
    await fetch(`${API_BASE}/admin/attributes/values/${valueId}`, { method: "DELETE", headers: authHeaders(token) });
    load();
  };

  return (
    <>
      <AdminTopbar title="Product Attributes" sub="Manage filterable attributes and values" />
      <div className="admin-content">
        <form onSubmit={save} className="admin-form" style={{ marginBottom: 24, display: "grid", gap: 8, maxWidth: 640 }}>
          <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input placeholder="Slug (optional)" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
          <select value={form.attributeType} onChange={(e) => setForm({ ...form, attributeType: e.target.value })}>
            <option value="SELECT">Select</option>
            <option value="COLOR">Color</option>
            <option value="SIZE">Size</option>
          </select>
          <label><input type="checkbox" checked={form.filterable} onChange={(e) => setForm({ ...form, filterable: e.target.checked })} /> Filterable</label>
          <button type="submit">{editingId ? "Update" : "Create"} Attribute</button>
        </form>

        <form onSubmit={addValue} className="admin-form" style={{ marginBottom: 32, display: "grid", gap: 8, maxWidth: 640 }}>
          <select value={valueForm.attributeId} onChange={(e) => setValueForm({ ...valueForm, attributeId: Number(e.target.value) })} required>
            <option value={0}>Select attribute</option>
            {items.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
          <input placeholder="Value" value={valueForm.value} onChange={(e) => setValueForm({ ...valueForm, value: e.target.value })} required />
          <button type="submit">Add Value</button>
        </form>

        {items.map((attr) => (
          <div key={attr.id} className="panel" style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <strong>{attr.name}</strong>
              <span style={{ color: "#888" }}>{attr.slug} · {attr.attributeType}</span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {(attr.values || []).map((v: any) => (
                <span key={v.id} style={{ background: "#f0f0f0", padding: "4px 10px", borderRadius: 6, fontSize: 13 }}>
                  {v.value}
                  <button type="button" onClick={() => removeValue(v.id)} style={{ marginLeft: 6, border: "none", background: "none", cursor: "pointer" }}>×</button>
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
