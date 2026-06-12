"use client";
import { useState, useEffect } from "react";
import { API_BASE, authHeaders } from "@/lib/api";

export default function AdminBulkOrdersPage() {
  const [tiers, setTiers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [form, setForm] = useState({
    id: 0,
    minQuantity: 10,
    maxQuantity: 50,
    discountPercentage: 10,
    description: "",
    isActive: true
  });
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => { fetchTiers(); }, []);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchTiers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/admin/bulk-orders/tiers`, { headers: authHeaders(token) });
      const data = await res.json();
      setTiers(Array.isArray(data) ? data.sort((a: any, b: any) => a.minQuantity - b.minQuantity) : []);
    } catch (e) {
      showToast("Error fetching tiers", "error");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.minQuantity <= 0) { showToast("Min quantity must be greater than 0", "error"); return; }
    if (form.maxQuantity && form.maxQuantity <= form.minQuantity) { showToast("Max quantity must be greater than min quantity", "error"); return; }
    if (form.discountPercentage < 0 || form.discountPercentage > 100) { showToast("Discount must be between 0 and 100%", "error"); return; }

    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const method = editingId ? "PUT" : "POST";
      const url = editingId ? `${API_BASE}/admin/bulk-orders/tiers/${editingId}` : `${API_BASE}/admin/bulk-orders/tiers`;
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", ...authHeaders(token) },
        body: JSON.stringify({ minQuantity: form.minQuantity, maxQuantity: form.maxQuantity, discountPercentage: form.discountPercentage, description: form.description, isActive: form.isActive })
      });
      if (res.ok) {
        showToast(editingId ? "Tier updated successfully" : "Tier created successfully", "success");
        resetForm();
        fetchTiers();
      } else {
        showToast("Error saving tier", "error");
      }
    } catch (e) {
      showToast("Connection error", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (tier: any) => {
    setForm({ ...tier, id: tier.id });
    setEditingId(tier.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this tier?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/admin/bulk-orders/tiers/${id}`, { method: "DELETE", headers: authHeaders(token) });
      if (res.ok) { showToast("Tier deleted successfully", "success"); fetchTiers(); }
      else showToast("Error deleting tier", "error");
    } catch (e) {
      showToast("Error deleting tier", "error");
    }
  };

  const resetForm = () => {
    setForm({ id: 0, minQuantity: 10, maxQuantity: 50, discountPercentage: 10, description: "", isActive: true });
    setEditingId(null);
  };

  return (
    <div className="admin-content">
      {toast && (
        <div id="admin-toast">
          <div className={`toast ${toast.type}`}>{toast.message}</div>
        </div>
      )}

      <div className="panel">
        {/* Form Section */}
        <div className="table-card mb-10">
          <div className="table-hd">
            <div className="table-hd-left">
              <div className="table-title">{editingId ? "Edit Discount Tier" : "Create New Tier"}</div>
              <div className="table-sub">Configure bulk order pricing rules</div>
            </div>
          </div>
          <div style={{ padding: '24px' }}>
            <form onSubmit={handleSubmit}>

              {/* Quantity Range */}
              <div className="fg-row">
                <div className="fg">
                  <label>Min Quantity *</label>
                  <input
                    type="number"
                    value={form.minQuantity}
                    onChange={(e) => setForm({ ...form, minQuantity: parseInt(e.target.value) || 1 })}
                    placeholder="10"
                    min="1"
                    required
                  />
                </div>
                <div className="fg">
                  <label>Max Quantity <span style={{ fontWeight: 400, fontSize: '11px' }}>(leave 0 for unlimited)</span></label>
                  <input
                    type="number"
                    value={form.maxQuantity}
                    onChange={(e) => setForm({ ...form, maxQuantity: parseInt(e.target.value) || 0 })}
                    placeholder="50"
                    min="0"
                  />
                </div>
              </div>

              {/* Discount Slider */}
              <div className="fg">
                <label>Discount Percentage *</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="0.5"
                    value={form.discountPercentage}
                    onChange={(e) => setForm({ ...form, discountPercentage: parseFloat(e.target.value) })}
                    style={{ flex: 1, height: '6px', accentColor: 'var(--teal)' }}
                  />
                  <div style={{ minWidth: '80px', background: 'var(--teal4)', border: '1.5px solid var(--teal3)', borderRadius: '9px', padding: '6px 12px', textAlign: 'center' }}>
                    <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--teal)' }}>{form.discountPercentage.toFixed(1)}%</span>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--txt4)', marginTop: '4px' }}>
                  <span>0%</span><span>50%</span><span>100%</span>
                </div>
              </div>

              {/* Description */}
              <div className="fg">
                <label>Description *</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="e.g., Bulk order 10-50 pieces: 10% discount"
                  rows={3}
                  required
                />
              </div>

              {/* Live Preview */}
              <div style={{ background: 'var(--teal4)', border: '1.5px solid var(--teal3)', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--teal)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px' }}>Customer Preview</div>
                <div style={{ background: 'white', borderRadius: '10px', padding: '16px', boxShadow: 'var(--sh0)' }}>
                  <div style={{ fontSize: '13px', color: 'var(--txt4)', marginBottom: '8px' }}>
                    Range: <strong style={{ color: 'var(--navy)' }}>{form.minQuantity} – {form.maxQuantity ? form.maxQuantity.toLocaleString() : "∞"} items</strong>
                  </div>
                  <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--teal)', lineHeight: 1 }}>
                    {form.discountPercentage.toFixed(1)}% <span style={{ fontSize: '16px', color: 'var(--teal2)' }}>OFF</span>
                  </div>
                  {form.description && (
                    <div style={{ marginTop: '10px', fontSize: '13px', color: 'var(--txt2)', background: 'var(--bg)', padding: '8px 12px', borderRadius: '7px' }}>{form.description}</div>
                  )}
                </div>
              </div>

              {/* Active Toggle */}
              <div className="fg">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={!!form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    style={{ width: 'auto' }}
                  />
                  Tier is Active (visible to customers)
                </label>
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" disabled={isLoading} className="btn-primary">
                  {isLoading ? "Saving..." : editingId ? "Update Tier" : "Create Tier"}
                </button>
                {editingId && (
                  <button type="button" onClick={resetForm} className="btn-secondary">
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Tiers List */}
        <div className="table-card">
          <div className="table-hd">
            <div className="table-hd-left">
              <div className="table-title">All Discount Tiers</div>
              <div className="table-sub">{tiers.length} tiers configured</div>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ textAlign: 'left' }}>#</th>
                  <th style={{ textAlign: 'left' }}>Quantity Range</th>
                  <th style={{ textAlign: 'left' }}>Discount</th>
                  <th style={{ textAlign: 'left' }}>Description</th>
                  <th style={{ textAlign: 'left' }}>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tiers.map((tier, idx) => (
                  <tr key={tier.id}>
                    <td>
                      <span style={{ fontWeight: 700, color: 'var(--txt4)', fontSize: '16px' }}>#{idx + 1}</span>
                    </td>
                    <td>
                      <div className="td-bold">{tier.minQuantity} – {tier.maxQuantity ? tier.maxQuantity.toLocaleString() : "∞"}</div>
                      <div className="td-meta">pieces</div>
                    </td>
                    <td>
                      <span style={{ fontSize: '22px', fontWeight: 800, color: 'var(--teal)' }}>{tier.discountPercentage}%</span>
                    </td>
                    <td style={{ maxWidth: '220px' }}>
                      <span style={{ fontSize: '13px', color: 'var(--txt2)' }}>{tier.description}</span>
                    </td>
                    <td>
                      {tier.isActive ? <span className="badge b-grn">Active</span> : <span className="badge b-red">Inactive</span>}
                    </td>
                    <td>
                      <div className="act-btns">
                        <button className="act-btn edit" onClick={() => handleEdit(tier)}>✏️</button>
                        <button className="act-btn del" onClick={() => handleDelete(tier.id)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {tiers.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--txt4)' }}>
                      No discount tiers configured. Create your first tier above.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
