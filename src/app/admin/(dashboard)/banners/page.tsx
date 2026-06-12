"use client";
import { useState, useEffect } from "react";
import { API_BASE, authHeaders, normalizeMediaUrl } from "@/lib/api";
import Image from "next/image";

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [form, setForm] = useState({
    id: 0,
    title: "",
    imageUrl: "",
    linkUrl: "",
    position: "HOME_TOP",
    displayOrder: 0,
    isActive: true
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchBanners();
  }, []);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchBanners = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/admin/banners`, {
        headers: authHeaders(token)
      });
      const data = await res.json();
      setBanners(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Error fetching banners:", e);
      showToast("Error fetching banners", "error");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast("File size must be less than 5MB", "error");
      return;
    }

    setIsUploading(true);
    try {
      const token = localStorage.getItem("token");

      // If replacing an image, delete the old one from S3 first
      if (form.imageUrl) {
        try {
          await fetch(`${API_BASE}/upload`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json", ...authHeaders(token) },
            body: JSON.stringify({ url: form.imageUrl })
          });
        } catch (delErr) {
          console.warn("Could not delete old image from S3:", delErr);
        }
      }

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API_BASE}/upload`, {
        method: "POST",
        headers: authHeaders(token),
        body: formData
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setForm({ ...form, imageUrl: data.data });
        setImagePreview(data.data);
        showToast("Image uploaded successfully", "success");
      } else {
        showToast("Image upload failed", "error");
      }
    } catch (e) {
      console.error("Error uploading image:", e);
      showToast("Error uploading image", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title.trim()) {
      showToast("Title is required", "error");
      return;
    }

    if (!form.imageUrl.trim()) {
      showToast("Image is required", "error");
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const method = editingId ? "PUT" : "POST";
      const url = editingId ? `${API_BASE}/admin/banners/${editingId}` : `${API_BASE}/admin/banners`;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", ...authHeaders(token) },
        body: JSON.stringify({
          title: form.title,
          imageUrl: form.imageUrl,
          linkUrl: form.linkUrl,
          position: form.position,
          displayOrder: form.displayOrder,
          isActive: form.isActive
        })
      });

      if (res.ok) {
        showToast(editingId ? "Banner updated successfully" : "Banner created successfully", "success");
        resetForm();
        fetchBanners();
      } else {
        showToast("Error saving banner", "error");
      }
    } catch (e) {
      console.error("Error:", e);
      showToast("Connection error", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (banner: any) => {
    setForm({ ...banner, id: banner.id });
    setEditingId(banner.id);
    setImagePreview(banner.imageUrl);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (banner: any) => {
    if (!confirm(`Are you sure you want to delete "${banner.title}"?`)) return;
    try {
      const token = localStorage.getItem("token");

      // Delete the record from DB
      const res = await fetch(`${API_BASE}/admin/banners/${banner.id}`, {
        method: "DELETE",
        headers: authHeaders(token)
      });

      if (res.ok) {
        // Also delete image from S3
        if (banner.imageUrl) {
          try {
            await fetch(`${API_BASE}/upload`, {
              method: "DELETE",
              headers: { "Content-Type": "application/json", ...authHeaders(token) },
              body: JSON.stringify({ url: banner.imageUrl })
            });
          } catch (delErr) {
            console.warn("Could not delete image from S3:", delErr);
          }
        }
        showToast("Banner deleted successfully", "success");
        fetchBanners();
      } else {
        showToast("Error deleting banner", "error");
      }
    } catch (e) {
      console.error("Error:", e);
      showToast("Error deleting banner", "error");
    }
  };

  const resetForm = () => {
    setForm({
      id: 0,
      title: "",
      imageUrl: "",
      linkUrl: "",
      position: "HOME_TOP",
      displayOrder: 0,
      isActive: true
    });
    setEditingId(null);
    setImagePreview("");
  };

  const filteredBanners = banners.filter(b =>
    b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const positionLabels: Record<string, string> = {
    HOME_TOP: "🏠 Home Top",
    HOME_MIDDLE: "🏠 Home Middle",
    HOME_BOTTOM: "🏠 Home Bottom",
    CATEGORY: "📂 Category",
    PROMO: "🎯 Promo"
  };

  return (
    <div className="admin-content">
      {/* Toast */}
      {toast && (
        <div id="admin-toast">
          <div className={`toast ${toast.type}`}>
            {toast.message}
          </div>
        </div>
      )}

      <div className="panel">
        {/* Form Section */}
        <div className="table-card mb-10">
          <div className="table-hd">
            <div className="table-hd-left">
              <div className="table-title">{editingId ? "Edit Banner Details" : "Create New Banner"}</div>
              <div className="table-sub">Manage your promotional banners</div>
            </div>
          </div>
          <div style={{ padding: '24px' }}>

            <form onSubmit={handleSubmit}>
              <div className="fg-row">
                <div className="fg">
                  <label>Banner Title *</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g., Summer Sale 2026"
                    required
                  />
                </div>
                <div className="fg">
                  <label>Location Position *</label>
                  <select
                    value={form.position}
                    onChange={(e) => setForm({ ...form, position: e.target.value })}
                  >
                    <option value="HOME_TOP">Home - Top Region</option>
                    <option value="HOME_MIDDLE">Home - Middle Banner</option>
                    <option value="HOME_BOTTOM">Home - Bottom Feature</option>
                    <option value="CATEGORY">Category Landing Page</option>
                    <option value="PROMO">Promotional Strip</option>
                  </select>
                </div>
              </div>

              <div className="fg-row">
                <div className="fg">
                  <label>Media / Banner Image *</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                  />
                  {isUploading && <p style={{ fontSize: '12px', color: 'blue' }}>Uploading...</p>}
                  {imagePreview && (
                    <img src={normalizeMediaUrl(imagePreview)} alt="Preview" style={{ maxWidth: '100px', marginTop: '10px', borderRadius: '8px' }} />
                  )}
                </div>
                <div className="fg">
                  <label>Link URL (Optional)</label>
                  <input
                    type="text"
                    value={form.linkUrl}
                    onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
                    placeholder="e.g., /collections/summer-sale"
                  />
                </div>
              </div>

              <div className="fg-row">
                <div className="fg">
                  <label>Sort Order</label>
                  <input
                    type="number"
                    value={form.displayOrder}
                    onChange={(e) => setForm({ ...form, displayOrder: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>
                <div className="fg">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginTop: '30px' }}>
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                      style={{ width: 'auto' }}
                    />
                    Banner is Active
                  </label>
                </div>
              </div>

              <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary"
                >
                  {isLoading ? "Saving..." : editingId ? "Update Banner" : "Create Banner"}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="btn-secondary"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* List Section */}
        <div className="table-card">
          <div className="table-hd">
            <div className="table-hd-left">
              <div className="table-title">All Banners</div>
              <div className="table-sub">{filteredBanners.length} of {banners.length} banners</div>
            </div>
            <div className="table-hd-right">
              <input
                type="text"
                placeholder="Search banners..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="tbl-search"
              />
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Banner</th>
                  <th>Position</th>
                  <th>Order</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBanners.map((banner) => (
                  <tr key={banner.id}>
                    <td>
                      <div className="td-flex">
                        <div className="td-avatar" style={{ overflow: 'hidden' }}>
                          {banner.imageUrl ? (
                            <img src={normalizeMediaUrl(banner.imageUrl)} alt={banner.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            '📸'
                          )}
                        </div>
                        <div>
                          <div className="td-name">{banner.title}</div>
                          <div className="td-meta" style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{banner.linkUrl || "No link"}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge b-blue">{positionLabels[banner.position]}</span>
                    </td>
                    <td>{banner.displayOrder}</td>
                    <td>
                      {banner.isActive ? <span className="badge b-grn">Active</span> : <span className="badge b-red">Inactive</span>}
                    </td>
                    <td>
                      <div className="act-btns">
                        <button className="act-btn edit" onClick={() => handleEdit(banner)}>✏️</button>
                        <button className="act-btn del" onClick={() => handleDelete(banner.id)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredBanners.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '30px' }}>No banners found.</td>
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
