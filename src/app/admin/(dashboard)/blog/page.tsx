"use client";

import { useEffect, useState } from "react";
import { API_BASE, authHeaders } from "@/lib/api";

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [showSeoSection, setShowSeoSection] = useState(false);
  const [contentPreview, setContentPreview] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    featuredImage: "",
    authorName: "Medvastr",
    status: "DRAFT",
    seoTitle: "",
    seoDescription: "",
  });
  const [editingId, setEditingId] = useState<number | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const load = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/admin/blog/posts`, { headers: authHeaders(token) });
      const data = await res.json();
      setPosts(Array.isArray(data) ? data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) : []);
    } catch (e) {
      console.error("Error loading posts:", e);
      showToast("Error loading posts", "error");
    }
  };

  useEffect(() => { load(); }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { showToast("File size must be less than 5MB", "error"); return; }
    setIsUploading(true);
    try {
      const token = localStorage.getItem("token");

      if (form.featuredImage) {
        try {
          await fetch(`${API_BASE}/upload`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json", ...authHeaders(token) },
            body: JSON.stringify({ url: form.featuredImage })
          });
        } catch { }
      }

      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`${API_BASE}/upload`, { method: "POST", headers: authHeaders(token), body: formData });
      const data = await res.json();
      if (res.ok && data.success) {
        setForm({ ...form, featuredImage: data.data });
        showToast("Image uploaded successfully", "success");
      } else {
        showToast("Image upload failed", "error");
      }
    } catch (e) {
      showToast("Error uploading image", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const generateSlug = (title: string) =>
    title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { showToast("Title is required", "error"); return; }
    if (!form.content.trim()) { showToast("Content is required", "error"); return; }
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const url = editingId ? `${API_BASE}/admin/blog/posts/${editingId}` : `${API_BASE}/admin/blog/posts`;
      const res = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", ...authHeaders(token) },
        body: JSON.stringify({ ...form, slug: form.slug || generateSlug(form.title) }),
      });
      if (res.ok) {
        showToast(editingId ? "Post updated successfully" : "Post created successfully", "success");
        resetForm();
        load();
      } else {
        showToast("Error saving post", "error");
      }
    } catch (e) {
      showToast("Connection error", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setForm({ title: "", slug: "", excerpt: "", content: "", featuredImage: "", authorName: "Medvastr", status: "DRAFT", seoTitle: "", seoDescription: "" });
    setEditingId(null);
    setShowSeoSection(false);
    setContentPreview(false);
  };

  const handleEdit = (post: any) => {
    setForm(post);
    setEditingId(post.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/admin/blog/posts/${id}`, { method: "DELETE", headers: authHeaders(token) });
      if (res.ok) { showToast("Post deleted successfully", "success"); load(); }
      else showToast("Error deleting post", "error");
    } catch (e) {
      showToast("Error deleting post", "error");
    }
  };

  const filteredPosts = posts.filter(p =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.authorName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-content">
      {/* Toast */}
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
              <div className="table-title">{editingId ? "Edit Blog Post" : "Create New Blog Post"}</div>
              <div className="table-sub">Manage your blog content</div>
            </div>
          </div>
          <div style={{ padding: '24px' }}>
            <form onSubmit={save}>
              {/* Basic Info */}
              <div className="fg-row">
                <div className="fg" style={{ gridColumn: '1 / -1' }}>
                  <label>Post Title *</label>
                  <input
                    type="text"
                    placeholder="e.g., Complete Guide to Medical Scrubs"
                    value={form.title}
                    onChange={(e) => {
                      setForm({ ...form, title: e.target.value });
                      if (!editingId) setForm(prev => ({ ...prev, slug: generateSlug(e.target.value) }));
                    }}
                    required
                  />
                </div>
              </div>

              <div className="fg-row">
                <div className="fg">
                  <label>URL Slug</label>
                  <input
                    type="text"
                    placeholder="Auto-generated from title"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  />
                </div>
                <div className="fg">
                  <label>Author Name</label>
                  <input
                    type="text"
                    placeholder="Medvastr"
                    value={form.authorName}
                    onChange={(e) => setForm({ ...form, authorName: e.target.value })}
                  />
                </div>
              </div>

              <div className="fg-row">
                <div className="fg" style={{ gridColumn: '1 / -1' }}>
                  <label>Excerpt</label>
                  <textarea
                    placeholder="Brief summary of your post (shows in blog listing)"
                    value={form.excerpt}
                    onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                    rows={2}
                  />
                </div>
              </div>

              {/* Featured Image */}
              <div className="fg-row">
                <div className="fg">
                  <label>Featured Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                  />
                  {isUploading && <p style={{ fontSize: '12px', color: 'var(--teal)' }}>Uploading...</p>}
                  {form.featuredImage && (
                    <img src={form.featuredImage} alt="Featured" style={{ maxWidth: '100px', marginTop: '10px', borderRadius: '8px' }} />
                  )}
                </div>
                <div className="fg">
                  <label>Publishing Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  >
                    <option value="DRAFT">Draft (Not visible)</option>
                    <option value="PUBLISHED">Published (Visible)</option>
                  </select>
                </div>
              </div>

              {/* Content Editor */}
              <div className="fg">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ margin: 0 }}>Post Content *</label>
                  <button
                    type="button"
                    onClick={() => setContentPreview(!contentPreview)}
                    className="btn-secondary"
                    style={{ height: '28px', fontSize: '12px', padding: '0 12px' }}
                  >
                    {contentPreview ? "Edit Mode" : "Preview Mode"}
                  </button>
                </div>
                {contentPreview ? (
                  <div style={{ width: '100%', padding: '16px 20px', border: '1.5px solid var(--bdr2)', borderRadius: '9px', background: 'white', minHeight: '250px' }}>
                    <div dangerouslySetInnerHTML={{ __html: form.content }} />
                  </div>
                ) : (
                  <textarea
                    placeholder="Write your post content here (HTML or Markdown supported)"
                    value={form.content}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                    rows={12}
                    style={{ fontFamily: 'monospace', fontSize: '13px' }}
                    required
                  />
                )}
              </div>

              {/* SEO Accordion */}
              <div style={{ border: '1.5px solid var(--bdr2)', borderRadius: '9px', overflow: 'hidden', marginBottom: '16px' }}>
                <button
                  type="button"
                  onClick={() => setShowSeoSection(!showSeoSection)}
                  style={{ width: '100%', padding: '14px 20px', textAlign: 'left', fontWeight: 700, color: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg)', border: 'none', cursor: 'pointer' }}
                >
                  <span>🔍 Search Engine Optimization (SEO)</span>
                  <span style={{ color: 'var(--txt4)' }}>{showSeoSection ? "▼" : "▶"}</span>
                </button>
                {showSeoSection && (
                  <div style={{ padding: '20px', borderTop: '1px solid var(--bdr2)' }}>
                    <div className="fg-row">
                      <div className="fg">
                        <label>SEO Title</label>
                        <input
                          type="text"
                          placeholder="Title for search engines (50–60 chars)"
                          value={form.seoTitle}
                          onChange={(e) => setForm({ ...form, seoTitle: e.target.value })}
                          maxLength={60}
                        />
                      </div>
                      <div className="fg">
                        <label>SEO Description</label>
                        <textarea
                          placeholder="Meta description (150–160 chars)"
                          value={form.seoDescription}
                          onChange={(e) => setForm({ ...form, seoDescription: e.target.value })}
                          maxLength={160}
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" disabled={isLoading} className="btn-primary">
                  {isLoading ? "Saving..." : editingId ? "Update Post" : "Create Post"}
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

        {/* Posts List */}
        <div className="table-card">
          <div className="table-hd">
            <div className="table-hd-left">
              <div className="table-title">All Posts</div>
              <div className="table-sub">{filteredPosts.length} of {posts.length} posts</div>
            </div>
            <div className="table-hd-right">
              <input
                type="text"
                placeholder="Search posts..."
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
                  <th>Title</th>
                  <th>Author</th>
                  <th>Status</th>
                  <th>Published</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPosts.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className="td-name">{p.title}</div>
                      <div className="td-meta">{p.slug}</div>
                    </td>
                    <td>{p.authorName}</td>
                    <td>
                      {p.status === "PUBLISHED"
                        ? <span className="badge b-grn">Published</span>
                        : <span className="badge b-warn">Draft</span>
                      }
                    </td>
                    <td>{p.publishedAt ? new Date(p.publishedAt).toLocaleDateString() : "—"}</td>
                    <td>
                      <div className="act-btns">
                        <button className="act-btn edit" onClick={() => handleEdit(p)}>✏️</button>
                        <button className="act-btn del" onClick={() => handleDelete(p.id)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredPosts.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '30px' }}>No posts found.</td>
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
