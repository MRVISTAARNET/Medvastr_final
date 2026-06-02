"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { fmt, cn } from "@/lib/data";
import { useApp } from "@/context/AppContext";
import ProductCard from "@/components/ProductCard";

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { products, addToCart, wishlist, toggleWishlist, toast } = useApp();
  const idOrSlug = String(id || "");
  const numericId = Number(idOrSlug);
  const p = products.find((x) =>
    Number.isFinite(numericId) ? x.id === numericId : x.slug === idOrSlug
  );
  const [ci, setCi] = useState(0);
  const [sz, setSz] = useState("");
  const [qty, setQty] = useState(1);
  const [mainImg, setMainImg] = useState(0);
  const [reviews, setReviews] = useState<any[]>([]);
  const [revLoading, setRevLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [revBody, setRevBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { user } = useApp();

  // Load reviews for this product
  useEffect(() => {
    if (!p) return;
    const API = process.env.NEXT_PUBLIC_API_URL || "https://api.medvastr.com/api";
    fetch(`${API}/products/${p.id}/reviews?size=50`)
      .then(r => r.json())
      .then(d => {
        if (d.success) setReviews(d.data?.content || []);
      })
      .catch(() => { })
      .finally(() => setRevLoading(false));
  }, [p?.id]);

  // Set default size from product sizes
  useEffect(() => {
    if (p && p.sizes && p.sizes.length > 0) {
      setSz(p.sizes[0]);
    }
  }, [p?.id]);

  if (!p && products.length === 0) {
    return <div className="page sec" style={{ padding: '120px 0', textAlign: 'center' }}>Loading product...</div>;
  }
  if (!p) return <div className="page sec" style={{ padding: '120px 0', textAlign: 'center' }}>Product not found.</div>;

  const wished = wishlist.includes(p.id);
  const related = products.filter((x) => x.type === p.type && x.id !== p.id).slice(0, 4);
  const productSizes = p.sizes && p.sizes.length > 0 ? p.sizes : [];
  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + (r.rating || 5), 0) / reviews.length).toFixed(1)
    : p.rating;

  const handleSubmitReview = async () => {
    if (!user) return toast("Please login to submit a review", "bad");
    if (!revBody.trim()) return toast("Please enter your review", "bad");
    setSubmitting(true);
    try {
      const API = process.env.NEXT_PUBLIC_API_URL || "https://api.medvastr.com/api";
      const res = await fetch(`${API}/products/${p.id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ rating, title: 'Product Review', body: revBody })
      });
      const data = await res.json();
      if (data.success) {
        toast("Review submitted!", "ok");
        setRevBody("");
        setReviews(prev => [data.data, ...prev]);
      } else {
        toast(data.message || "Error submitting review", "bad");
      }
    } catch { toast("Connection error", "bad"); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="page">
      <div className="sec">
        {/* Breadcrumb */}
        <div className="pdp-bc">
          <span onClick={() => router.push("/")}>Home</span>
          <span>›</span>
          <span onClick={() => router.push("/products")}>{p.type}</span>
          <span>›</span>
          <strong>{p.name}</strong>
        </div>

        <div className="pdp-grid">
          {/* Gallery */}
          <div className="pdp-gal">
            {/* Main Image */}
            <div className="pdp-main-img" style={{
              background: (p.imgs && p.imgs.length > 0) ? '#f8f8f8' : p.bg,
              borderRadius: 16,
              overflow: 'hidden',
              position: 'relative',
              aspectRatio: '1/1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {(p.imgs && p.imgs.length > 0) ? (
                <img
                  src={p.imgs[mainImg] || p.imgs[0]}
                  alt={p.name}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              ) : (
                <span style={{ fontSize: 120 }}>{p.emo}</span>
              )}
              {p.badge && (
                <div className={`pc-badge pb-${p.badge.toLowerCase().replace(/ /g, "")} pdp-badge`}>
                  {p.badge}
                </div>
              )}
            </div>

            {/* Thumbnails - only show if more than 1 image */}
            {p.imgs && p.imgs.length > 1 && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${Math.min(p.imgs.length, 5)}, 1fr)`,
                gap: 8,
                marginTop: 12
              }}>
                {p.imgs.map((url, i) => (
                  <div
                    key={i}
                    onClick={() => setMainImg(i)}
                    style={{
                      aspectRatio: '1/1',
                      borderRadius: 10,
                      overflow: 'hidden',
                      border: mainImg === i ? '2.5px solid var(--teal)' : '2px solid #eee',
                      cursor: 'pointer',
                      background: '#f8f8f8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'border-color 0.2s'
                    }}
                  >
                    <img src={url} alt={`view ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="pdp-info">
            <div className="pdp-tag">{p.fab || "Premium"} Collection</div>
            <h1 className="pdp-h">{p.name}</h1>

            <div className="pdp-meta">
              <div className="pdp-stars">
                <span className="stars">{"★".repeat(Math.floor(Number(avgRating)))}</span>
                {avgRating}
              </div>
              <div className="pdp-rev-c">{reviews.length} Verified Reviews</div>
              <div className="pdp-stock">✓ In Stock</div>
            </div>

            <div className="pdp-price-row">
              <span className="pdp-price">{fmt(p.price)}</span>
              {p.origPrice && <span className="pdp-orig">{fmt(p.origPrice)}</span>}
              <span className="pdp-tax">Inclusive of all taxes</span>
            </div>

            <div className="pdp-box">
              {/* COLOUR */}
              {p.clrs && p.clrs.length > 0 && (
                <div className="pdp-opt">
                  <label className="pdp-opt-l">
                    Colour: <span>{p.clrNms && p.clrNms[ci] ? p.clrNms[ci] : cn(p.clrs[ci])}</span>
                  </label>
                  <div className="pdp-clrs">
                    {p.clrs.map((c, i) => (
                      <div
                        key={i}
                        onClick={() => setCi(i)}
                        className={`pdp-clr-sw${ci === i ? " on" : ""}`}
                        style={{ background: c }}
                        title={p.clrNms?.[i] || c}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* SIZE - only from product data */}
              {productSizes.length > 0 && (
                <div className="pdp-opt">
                  <div className="pdp-opt-hd">
                    <label className="pdp-opt-l">Size: <span style={{ fontWeight: 700 }}>{sz}</span></label>
                    <span className="pdp-sg">Size Guide</span>
                  </div>
                  <div className="pdp-sizes">
                    {productSizes.map((s) => (
                      <div
                        key={s}
                        onClick={() => setSz(s)}
                        className={`pdp-sz-sw${sz === s ? " on" : ""}`}
                      >
                        {s}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ACTIONS */}
              <div className="pdp-acts">
                <div className="pdp-qty">
                  <button onClick={() => setQty((q) => Math.max(1, q - 1))}>–</button>
                  <span>{qty}</span>
                  <button onClick={() => setQty((q) => q + 1)}>+</button>
                </div>
                <button
                  className="btn-p pdp-add"
                  onClick={() => {
                    addToCart(p, ci, sz || "One Size");
                    toast(`${p.short} added to your bag!`, "ok");
                  }}
                >
                  Add to Bag — {fmt(p.price * qty)}
                </button>
                <button
                  className={`pdp-wish${wished ? " on" : ""}`}
                  onClick={() => toggleWishlist(p.id)}
                >
                  {wished ? "❤️" : "🤍"}
                </button>
              </div>
            </div>
          </div>

          {/* DETAILS */}
          <div className="pdp-desc-sec" style={{ gridColumn: '1 / -1' }}>
            <div className="pdp-desc-hd">
              <h3>Product Description</h3>
              <span>–</span>
            </div>
            <p className="pdp-desc-p">{p.desc}</p>
            <div className="pdp-specs">
              {([
                ["Fabric", p.fabD],
                ["Stretch", p.stretch],
                p.pockets ? ["Pockets", `${p.pockets} Functional`] : null,
                ["Fit", p.fit],
                ["Weight", p.wt],
                ["Care", p.care],
              ] as Array<[string, string | undefined | null] | null>).filter(
                (item): item is [string, string | undefined | null] => item !== null
              ).map(([l, v]) => v ? (
                <div key={l as string} className="pdp-spec">
                  <div className="pdp-spec-l">{l}</div>
                  <div className="pdp-spec-v">{v}</div>
                </div>
              ) : null)}
            </div>
          </div>

          {/* REVIEWS */}
          <div className="pdp-rev-sec" style={{ gridColumn: '1 / -1', marginTop: 40, borderTop: '1px solid #eee', paddingTop: 30 }}>
            <div className="pdp-desc-hd">
              <h3>Customer Reviews</h3>
              <div style={{ color: 'var(--teal)', fontWeight: 600 }}>{reviews.length} Verified Reviews</div>
            </div>

            {/* Existing Reviews */}
            {revLoading ? (
              <div style={{ padding: '20px 0', color: '#888' }}>Loading reviews...</div>
            ) : reviews.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 }}>
                {reviews.map((r, i) => (
                  <div key={r.id || i} style={{
                    background: '#fafafa',
                    border: '1px solid #eee',
                    borderRadius: 12,
                    padding: '18px 20px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                      <div style={{
                        width: 38, height: 38, borderRadius: '50%',
                        background: 'var(--teal)', color: '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: 15
                      }}>
                        {(r.userName || 'U')[0].toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{r.userName || 'Verified Customer'}</div>
                        <div style={{ fontSize: 12, color: '#999' }}>
                          {r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : ''}
                        </div>
                      </div>
                      <div style={{ marginLeft: 'auto', color: '#f59e0b', fontSize: 16 }}>
                        {'★'.repeat(r.rating || 5)}
                      </div>
                    </div>
                    {r.title && <div style={{ fontWeight: 600, marginBottom: 4 }}>{r.title}</div>}
                    <p style={{ fontSize: 14, color: '#555', lineHeight: 1.6 }}>{r.body}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '16px 0', color: '#aaa', fontSize: 14 }}>No reviews yet. Be the first to share your experience!</div>
            )}

            {/* Submit Review */}
            <div style={{ background: '#f9f9f9', padding: 24, borderRadius: 12 }}>
              <h4 style={{ marginBottom: 16 }}>Share Your Feedback</h4>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600 }}>Rating</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[1, 2, 3, 4, 5].map(n => (
                    <button
                      key={n}
                      onClick={() => setRating(n)}
                      style={{
                        width: 36, height: 36, borderRadius: 8, border: '1.5px solid',
                        borderColor: rating >= n ? '#f59e0b' : '#ddd',
                        background: rating >= n ? '#fef3c7' : '#fff',
                        color: '#f59e0b', fontSize: 18, cursor: 'pointer'
                      }}
                    >★</button>
                  ))}
                  <span style={{ alignSelf: 'center', fontSize: 13, color: '#666' }}>
                    {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
                  </span>
                </div>
              </div>
              <textarea
                value={revBody}
                onChange={e => setRevBody(e.target.value)}
                placeholder="What did you like or dislike? Share your honest experience..."
                style={{ width: '100%', height: 100, padding: 12, borderRadius: 8, border: '1px solid #ddd', resize: 'none', fontSize: 14, fontFamily: 'inherit' }}
              />
              <button
                className="btn-p"
                style={{ marginTop: 12, padding: '12px 28px', borderRadius: 8, opacity: submitting ? 0.7 : 1 }}
                onClick={handleSubmitReview}
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </div>
        </div>

        {/* RELATED */}
        {related.length > 0 && (
          <div className="pdp-rel">
            <div className="sec-hd">
              <div>
                <div className="sec-t">Complete the Look</div>
                <div className="sec-s">Perfect pairings for your {p.short}</div>
              </div>
            </div>
            <div className="pg-4">
              {related.map((rp) => (
                <ProductCard key={rp.id} p={rp} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
