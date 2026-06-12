"use client";
import { useState, useEffect } from "react";
import { API_BASE, authHeaders } from "@/lib/api";

export default function AdminCollectionsPage() {
  const [collections, setCollections] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedCollectionForProducts, setSelectedCollectionForProducts] = useState<number | null>(null);
  const [productSearch, setProductSearch] = useState("");
  const [form, setForm] = useState({
    id: 0,
    name: "",
    slug: "",
    description: "",
    imageUrl: "",
    collectionType: "CURATED",
    displayOrder: 0,
    isActive: true
  });
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    fetchCollections();
    fetchProducts();
  }, []);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const fetchCollections = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/admin/collections`, {
        headers: authHeaders(token)
      });
      const data = await res.json();
      setCollections(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Error fetching collections:", e);
      showToast("Error fetching collections", "error");
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_BASE}/products?size=1000`);
      const data = await res.json();
      if (data.success) setProducts(data.data.content);
    } catch (e) {
      console.error("Error fetching products:", e);
      showToast("Error fetching products", "error");
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

    if (!form.name.trim()) {
      showToast("Collection name is required", "error");
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const method = editingId ? "PUT" : "POST";
      const url = editingId
        ? `${API_BASE}/admin/collections/${editingId}`
        : `${API_BASE}/admin/collections`;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", ...authHeaders(token) },
        body: JSON.stringify({
          name: form.name,
          slug: form.slug || generateSlug(form.name),
          description: form.description,
          imageUrl: form.imageUrl,
          collectionType: form.collectionType,
          displayOrder: form.displayOrder,
          isActive: form.isActive
        })
      });

      if (res.ok) {
        showToast(editingId ? "Collection updated successfully" : "Collection created successfully", "success");
        resetForm();
        fetchCollections();
      } else {
        showToast("Error saving collection", "error");
      }
    } catch (e) {
      console.error("Error:", e);
      showToast("Connection error", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (collection: any) => {
    setForm({ ...collection, id: collection.id });
    setEditingId(collection.id);
    setImagePreview(collection.imageUrl);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this collection?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/admin/collections/${id}`, {
        method: "DELETE",
        headers: authHeaders(token)
      });
      if (res.ok) {
        showToast("Collection deleted successfully", "success");
        fetchCollections();
      } else {
        showToast("Error deleting collection", "error");
      }
    } catch (e) {
      console.error("Error:", e);
      showToast("Error deleting collection", "error");
    }
  };

  const addProductToCollection = async (collectionId: number, productId: number) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_BASE}/admin/collections/${collectionId}/products/${productId}`,
        {
          method: "POST",
          headers: authHeaders(token)
        }
      );
      if (res.ok) {
        showToast("Product added to collection", "success");
        fetchCollections();
        setShowProductModal(false);
      } else {
        showToast("Error adding product", "error");
      }
    } catch (e) {
      console.error("Error:", e);
      showToast("Connection error", "error");
    }
  };

  const resetForm = () => {
    setForm({
      id: 0,
      name: "",
      slug: "",
      description: "",
      imageUrl: "",
      collectionType: "CURATED",
      displayOrder: 0,
      isActive: true
    });
    setEditingId(null);
    setImagePreview("");
  };

  const filteredCollections = collections.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.collectionType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentCollection = selectedCollectionForProducts ? collections.find(c => c.id === selectedCollectionForProducts) : null;
  const collectionProductIds = currentCollection?.products?.map((p: any) => p.id) || [];
  const availableProducts = products.filter(p => !collectionProductIds.includes(p.id));
  const filteredProducts = availableProducts.filter(p =>
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  const typeIcons: Record<string, string> = {
    CURATED: "🎯",
    NEW_ARRIVALS: "✨",
    TRENDING: "🔥",
    SALE: "💰",
    BULK_ORDER: "📦",
    SEASONAL: "🌸"
  };

  const typeLabels: Record<string, string> = {
    CURATED: "Curated",
    NEW_ARRIVALS: "New Arrivals",
    TRENDING: "Trending",
    SALE: "On Sale",
    BULK_ORDER: "Bulk Orders",
    SEASONAL: "Seasonal"
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
              <div className="table-title">{editingId ? "Edit Collection Details" : "Create New Collection"}</div>
              <div className="table-sub">Manage your product collections</div>
            </div>
          </div>
          <div style={{ padding: '24px' }}>

            <form onSubmit={handleSubmit}>
              <div className="fg-row">
                <div className="fg">
                  <label>Collection Name *</label>
                  <input
                    type="text"
                    placeholder="e.g., Summer Scrubs Collection"
                    value={form.name}
                    onChange={(e) => {
                      setForm({ ...form, name: e.target.value });
                      if (!editingId) setForm(prev => ({ ...prev, slug: generateSlug(e.target.value) }));
                    }}
                    required
                  />
                </div>
                <div className="fg">
                  <label>URL Slug</label>
                  <input
                    type="text"
                    placeholder="Auto-generated from name"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  />
                </div>
              </div>

              <div className="fg-row">
                <div className="fg" style={{ gridColumn: '1 / -1' }}>
                  <label>Description</label>
                  <textarea
                    placeholder="Describe this collection (shows on collection page)"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>

              <div className="fg-row">
                <div className="fg">
                  <label>Collection Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                  />
                  {isUploading && <p style={{ fontSize: '12px', color: 'blue' }}>Uploading...</p>}
                  {imagePreview && (
                    <img src={imagePreview} alt="Collection" style={{ maxWidth: '100px', marginTop: '10px', borderRadius: '8px' }} />
                  )}
                </div>
                <div className="fg">
                  <label>Collection Type *</label>
                  <select
                    value={form.collectionType}
                    onChange={(e) => setForm({ ...form, collectionType: e.target.value })}
                  >
                    {Object.entries(typeLabels).map(([key, label]) => (
                      <option key={key} value={key}>{typeIcons[key]} {label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="fg-row">
                <div className="fg">
                  <label>Display Order</label>
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
                    Collection is Active
                  </label>
                </div>
              </div>

              <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary"
                >
                  {isLoading ? "Saving..." : editingId ? "Update Collection" : "Create Collection"}
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

        {/* Collections List */}
        <div className="table-card">
          <div className="table-hd">
            <div className="table-hd-left">
              <div className="table-title">All Collections</div>
              <div className="table-sub">{filteredCollections.length} of {collections.length} collections</div>
            </div>
            <div className="table-hd-right">
              <input
                type="text"
                placeholder="Search collections..."
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
                  <th>Collection</th>
                  <th>Type</th>
                  <th>Products</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCollections.map((collection) => (
                  <tr key={collection.id}>
                    <td>
                      <div className="td-flex">
                        <div className="td-avatar" style={{ overflow: 'hidden' }}>
                          {collection.imageUrl ? (
                            <img src={collection.imageUrl} alt={collection.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            '📸'
                          )}
                        </div>
                        <div>
                          <div className="td-name">{collection.name}</div>
                          <div className="td-meta" style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>/{collection.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge b-purple">{typeIcons[collection.collectionType]} {typeLabels[collection.collectionType]}</span>
                    </td>
                    <td>{collection.products?.length || 0}</td>
                    <td>
                      {collection.isActive ? <span className="badge b-grn">Active</span> : <span className="badge b-red">Inactive</span>}
                    </td>
                    <td>
                      <div className="act-btns">
                        <button className="act-btn edit" onClick={() => handleEdit(collection)} title="Edit">✏️</button>
                        <button className="act-btn" onClick={() => {
                          setSelectedCollectionForProducts(collection.id);
                          setShowProductModal(true);
                        }} title="Manage Products">📦</button>
                        <button className="act-btn del" onClick={() => handleDelete(collection.id)} title="Delete">🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredCollections.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '30px' }}>No collections found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div >

      {/* Product Modal */}
      {
        showProductModal && currentCollection && (
          <div className="modal-bg">
            <div className="modal">
              <div className="modal-hd">
                <div className="modal-title">Add Products to {currentCollection.name}</div>
                <button className="modal-x" onClick={() => setShowProductModal(false)}>✕</button>
              </div>

              <div className="modal-body" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', border: '1.5px solid var(--bdr2)', borderRadius: '9px', marginBottom: '16px' }}
                />

                <div className="mini-list">
                  {filteredProducts.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--txt3)', padding: '20px' }}>No products available</div>
                  ) : (
                    filteredProducts.map((product) => (
                      <div key={product.id} className="mini-item" style={{ border: '1px solid var(--bdr2)', padding: '12px', borderRadius: '10px', marginBottom: '8px' }}>
                        <div className="mini-info">
                          <div className="mini-name">{product.name}</div>
                          <div className="mini-sub">₹{product.price}</div>
                        </div>
                        <button
                          onClick={() => addProductToCollection(currentCollection.id, product.id)}
                          className="btn-primary" style={{ padding: '0 12px', height: '32px' }}
                        >
                          Add
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="modal-foot">
                <button
                  onClick={() => setShowProductModal(false)}
                  className="btn-secondary"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
}
