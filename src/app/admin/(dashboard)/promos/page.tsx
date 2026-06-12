"use client";

import React, { useEffect, useState } from "react";
import AdminTopbar from "@/components/admin/AdminTopbar";
import { API_BASE, authHeaders } from "@/lib/api";
import { fmt, fmtNum, fmtDate } from "@/lib/data";

export default function AdminPromos() {
  const [promos, setPromos] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    code: "", description: "", discountType: "PERCENTAGE", discountValue: 10,
    minimumOrderAmount: 0, maximumDiscountAmount: 0, usageLimit: 100,
    expiresAt: "", active: true,
  });

  const load = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE}/admin/promos`, { headers: authHeaders(token) });
    setPromos(await res.json());
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm({ code: "", description: "", discountType: "PERCENTAGE", discountValue: 10, minimumOrderAmount: 0, maximumDiscountAmount: 0, usageLimit: 100, expiresAt: "", active: true });
    setIsModalOpen(true);
  };

  const openEdit = (p: any) => {
    setEditingId(p.id);
    setForm({
      code: p.code, description: p.description || "", discountType: p.discountType,
      discountValue: Number(p.discountValue), minimumOrderAmount: Number(p.minimumOrderAmount || 0),
      maximumDiscountAmount: Number(p.maximumDiscountAmount || 0), usageLimit: p.usageLimit || 0,
      expiresAt: p.expiresAt || "", active: p.active,
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    const url = editingId ? `${API_BASE}/admin/promos/${editingId}` : `${API_BASE}/admin/promos`;
    const res = await fetch(url, {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json", ...authHeaders(token) },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setIsModalOpen(false);
      load();
    } else {
      alert("Failed to save promo");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Deactivate this promo?")) return;
    const token = localStorage.getItem("token");
    await fetch(`${API_BASE}/admin/promos/${id}`, { method: "DELETE", headers: authHeaders(token) });
    load();
  };

  const activeCount = promos.filter((p) => p.active).length;
  const totalUses = promos.reduce((s, p) => s + (p.usedCount || 0), 0);
  const top = [...promos].sort((a, b) => (b.usedCount || 0) - (a.usedCount || 0))[0];

  return (
    <>
      <AdminTopbar title="Promo Codes" sub="Create and manage discount codes" action={{ label: "+ Add Promo Code", onClick: openCreate }} />
      <div className="admin-content">
        <div className="panel">
          <div className="stats-grid" style={{ marginBottom: "22px" }}>
            <StatCard ico="🎟️" label="Active Promos" val={String(activeCount)} sub="currently live" dir="neu" bg="#daf3ef" />
            <StatCard ico="📊" label="Total Redemptions" val={fmtNum(totalUses)} sub="all time" dir="up" bg="#dbeafe" />
            <StatCard ico="🔝" label="Top Code" val={top?.code || "—"} sub={`${fmtNum(top?.usedCount || 0)} uses`} dir="up" bg="#ede9fe" />
          </div>
          <table className="admin-table">
            <thead>
              <tr><th>Code</th><th>Discount</th><th>Min Order</th><th>Uses</th><th>Expiry</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {promos.map((p) => (
                <tr key={p.id}>
                  <td><span className="td-mono" style={{ fontWeight: 700 }}>{p.code}</span></td>
                  <td>{p.discountType === "FIXED" ? fmt(p.discountValue) : `${p.discountValue}% off`}</td>
                  <td>{p.minimumOrderAmount > 0 ? fmt(p.minimumOrderAmount) : "No minimum"}</td>
                  <td>{fmtNum(p.usedCount || 0)}{p.usageLimit ? ` / ${p.usageLimit}` : ""}</td>
                  <td>{p.expiresAt ? fmtDate(p.expiresAt) : "—"}</td>
                  <td>{p.active ? <span className="badge b-grn">Active</span> : <span className="badge b-red">Inactive</span>}</td>
                  <td>
                    <button className="act-btn edit" onClick={() => openEdit(p)}>✏️</button>
                    <button className="act-btn del" onClick={() => handleDelete(p.id)}>🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-bg" onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false); }}>
          <div className="modal">
            <div className="modal-hd">
              <div className="modal-title">{editingId ? "Edit" : "Add"} Promo Code</div>
              <button className="modal-x" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>
            <div className="modal-body" style={{ display: "grid", gap: 12 }}>
              <input placeholder="Code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} />
              <input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              <select value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value })}>
                <option value="PERCENTAGE">Percentage</option>
                <option value="FIXED">Fixed amount</option>
              </select>
              <input type="number" placeholder="Discount value" value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: Number(e.target.value) })} />
              <input type="number" placeholder="Min order" value={form.minimumOrderAmount} onChange={(e) => setForm({ ...form, minimumOrderAmount: Number(e.target.value) })} />
              <input type="number" placeholder="Max discount cap" value={form.maximumDiscountAmount} onChange={(e) => setForm({ ...form, maximumDiscountAmount: Number(e.target.value) })} />
              <input type="number" placeholder="Usage limit" value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: Number(e.target.value) })} />
              <input type="date" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} />
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

function StatCard({ ico, label, val, sub, dir, bg }: any) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <div className="stat-ico" style={{ background: bg }}>{ico}</div>
        <div className={`stat-badge badge-${dir === "up" ? "up" : "neu"}`}>{sub}</div>
      </div>
      <div className="stat-n">{val}</div>
      <div className="stat-l">{label}</div>
    </div>
  );
}
