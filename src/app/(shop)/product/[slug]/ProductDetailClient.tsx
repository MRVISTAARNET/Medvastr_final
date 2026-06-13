"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { fmt, cn, Product } from "@/lib/data";
import { useApp } from "@/context/AppContext";
import ProductCard from "@/components/ProductCard";
import { API_BASE, authHeaders } from "@/lib/api";
import { mapApiProduct, getImagesForColor, getSizesForColor } from "@/lib/productUtils";

function Accordion({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-t border-slate-200">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex justify-between items-center py-4 bg-none border-none cursor-pointer text-sm font-bold text-slate-900 text-left hover:text-emerald-600 transition"
      >
        {title}
        <span className={`text-lg font-normal text-slate-600 transition-transform ${open ? 'rotate-180' : ''}`}>›</span>
      </button>
      {open && (
        <div className="pb-4 text-sm text-slate-600 leading-relaxed">
          {children}
        </div>
      )}
    </div>
  );
}

export default function ProductDetailClient({ initialProduct }: { initialProduct?: any }) {
  const { slug } = useParams();
  const router = useRouter();
  const { products, addToCart, wishlist, toggleWishlist, toast, user } = useApp();

  const idOrSlug = String(slug || "");
  const numericId = Number(idOrSlug);
  const fromList = products.find((x) =>
    Number.isFinite(numericId) && numericId ? x.id === numericId : x.slug === idOrSlug
  );

  const [fetched, setFetched] = useState<Product | null>(initialProduct ? mapApiProduct(initialProduct) : null);
  const [fetching, setFetching] = useState(false);
  const p = fromList || fetched;

  const [ci, setCi] = useState(0);
  const [sz, setSz] = useState("");
  const [qty, setQty] = useState(1);
  const [mainImg, setMainImg] = useState(0);
  const [brokenImages, setBrokenImages] = useState<Record<number, boolean>>({});
  const [reviews, setReviews] = useState<any[]>([]);
  const [revLoading, setRevLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [revBody, setRevBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (fromList || fetched || !idOrSlug) return;
    setFetching(true);
    const path = Number.isFinite(numericId)
      ? `${API_BASE}/products/${numericId}`
      : `${API_BASE}/products/slug/${encodeURIComponent(idOrSlug)}`;
    fetch(path)
      .then((r) => r.json())
      .then((d) => { if (d.success) setFetched(mapApiProduct(d.data)); })
      .catch(() => { })
      .finally(() => setFetching(false));
  }, [idOrSlug, fromList, numericId]);

  const colorImages = useMemo(() => (p ? getImagesForColor(p, ci) : []), [p, ci]);
  const productSizes = useMemo(() => (p ? getSizesForColor(p, ci) : []), [p, ci]);

  useEffect(() => {
    if (!p) return;
    fetch(`${API_BASE}/products/${p.id}/reviews?size=50`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setReviews(d.data?.content || []); })
      .catch(() => { })
      .finally(() => setRevLoading(false));
  }, [p?.id]);

  useEffect(() => {
    if (productSizes.length > 0) {
      setSz((prev) => (productSizes.includes(prev) ? prev : productSizes[0]));
    }
  }, [p?.id, ci, productSizes.join(",")]);

  useEffect(() => { setBrokenImages({}); setMainImg(0); }, [p?.id, ci]);

  const handleColorChange = (index: number) => {
    setCi(index); setMainImg(0); setBrokenImages({});
  };

  if ((fetching || (products.length === 0 && !fetched)) && !p) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="text-center text-slate-600">Loading product...</div></div>;
  }
  if (!p) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="text-center text-slate-600">Product not found.</div></div>;
  }

  const wished = wishlist.includes(p.id);

  // Related products: same type first, fill from others — filtered to active products
  const relatedPool = products.filter((x) => x.id !== p.id && x.active !== false);
  const typedRelated = relatedPool.filter((x) => x.type === p.type);
  const otherRelated = relatedPool.filter((x) => x.type !== p.type);
  const related = [...typedRelated, ...otherRelated].slice(0, 4);

  const visibleImageIndexes = colorImages.map((_, i) => i).filter((i) => !brokenImages[i]);
  const isVideoActive = mainImg === -1 && !!p.videoUrl;
  const activeImageIndex = isVideoActive ? -1 : (visibleImageIndexes.includes(mainImg) ? mainImg : (visibleImageIndexes[0] ?? -1));
  const mainImageSrc = (!isVideoActive && activeImageIndex >= 0) ? colorImages[activeImageIndex] : "";

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((s, r) => s + (r.rating || 5), 0) / reviews.length).toFixed(1)
      : p.rating;

  const handleSubmitReview = async () => {
    if (!user) return toast("Please login to submit a review", "bad");
    if (!revBody.trim()) return toast("Please enter your review", "bad");
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/products/${p.id}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ rating, title: "Product Review", body: revBody }),
      });
      const data = await res.json();
      if (data.success) {
        toast("Review submitted!", "ok");
        setRevBody("");
        setReviews((prev) => [data.data, ...prev]);
      } else {
        toast(data.message || "Error submitting review", "bad");
      }
    } catch {
      toast("Connection error", "bad");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px' }}>

        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#64748b', marginBottom: 32, paddingBottom: 20, borderBottom: '1px solid #e2e8f0' }}>
          <button onClick={() => router.push('/')} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 13 }}>Home</button>
          <span style={{ color: '#cbd5e1' }}>›</span>
          <button onClick={() => router.push('/products')} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 13 }}>{p.type}</button>
          <span style={{ color: '#cbd5e1' }}>›</span>
          <span style={{ fontWeight: 700, color: '#0f172a' }}>{p.name}</span>
        </div>

        {/* MAIN 2-COLUMN LAYOUT */}
        <div className="pdp-grid">

          {/* LEFT: Image Gallery */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ aspectRatio: '1/1', background: isVideoActive ? '#000' : (mainImageSrc ? '#f8f8f8' : (p.bg || '#f1f5f9')), borderRadius: 20, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              {isVideoActive ? (
                <video src={p.videoUrl} autoPlay loop muted playsInline controls style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#000' }} />
              ) : mainImageSrc ? (
                <img src={mainImageSrc} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={() => { if (activeImageIndex >= 0) setBrokenImages(prev => ({ ...prev, [activeImageIndex]: true })); }} />
              ) : (
                <span style={{ fontSize: 80 }}>{p.emo}</span>
              )}
              {p.badge && <div style={{ position: 'absolute', top: 16, left: 16, background: '#10b981', color: 'white', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>{p.badge}</div>}
            </div>

            {(visibleImageIndexes.length > 1 || p.videoUrl) && (
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(visibleImageIndexes.length + (p.videoUrl ? 1 : 0), 5)}, 1fr)`, gap: 10 }}>
                {p.videoUrl && (
                  <div onClick={() => setMainImg(-1)}
                    style={{ aspectRatio: '1/1', borderRadius: 12, overflow: 'hidden', cursor: 'pointer', border: mainImg === -1 ? '2px solid #008080' : '2px solid #e2e8f0', transition: 'border 0.2s', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                )}
                {visibleImageIndexes.map((i) => (
                  <div key={i} onClick={() => setMainImg(i)}
                    style={{ aspectRatio: '1/1', borderRadius: 12, overflow: 'hidden', cursor: 'pointer', border: mainImg === i ? '2px solid #008080' : '2px solid #e2e8f0', transition: 'border 0.2s' }}>
                    <img src={colorImages[i]} alt={`view ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={() => setBrokenImages(prev => ({ ...prev, [i]: true }))} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Product Info */}
          <div style={{ position: 'sticky', top: 100 }}>
            <div style={{ background: 'white', borderRadius: 20, boxShadow: '0 4px 30px rgba(0,0,0,0.06)', padding: 40, display: 'flex', flexDirection: 'column', gap: 24 }}>

              {/* Collection Tag */}
              <div style={{ display: 'inline-block', background: '#ecfdf5', color: '#059669', padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 700, width: 'fit-content' }}>
                {p.fab || 'Premium'} Collection
              </div>

              {/* Title */}
              <h1 style={{ fontSize: 30, fontWeight: 900, color: '#0f172a', margin: 0, lineHeight: 1.2 }}>{p.name}</h1>

              {/* Rating */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 20, borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#fbbf24', fontSize: 18 }}>{'★'.repeat(Math.floor(Number(avgRating)))}</span>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>{avgRating}</span>
                <span style={{ fontSize: 13, color: '#64748b' }}>{reviews.length} Verified Reviews</span>
                <span style={{ marginLeft: 'auto', fontSize: 13, fontWeight: 700, color: '#10b981' }}>✓ In Stock</span>
              </div>

              {/* Price */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 32, fontWeight: 900, color: '#0f172a' }}>{fmt(p.price)}</span>
                  {p.origPrice && <span style={{ fontSize: 18, color: '#94a3b8', textDecoration: 'line-through' }}>{fmt(p.origPrice)}</span>}
                  {p.origPrice && <span style={{ background: '#fef2f2', color: '#ef4444', fontSize: 12, fontWeight: 800, padding: '2px 8px', borderRadius: 6 }}>{Math.round(((p.origPrice - p.price) / p.origPrice) * 100)}% OFF</span>}
                </div>
                <p style={{ fontSize: 12, color: '#94a3b8', margin: '4px 0 0' }}>Inclusive of all taxes</p>
              </div>

              {/* Color Selector */}
              {p.clrs && p.clrs.length > 0 && (
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 10 }}>
                    Colour: <span style={{ color: '#008080' }}>{p.clrNms?.[ci] || cn(p.clrs[ci])}</span>
                  </label>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {p.clrs.map((c, i) => (
                      <button key={i} onClick={() => handleColorChange(i)}
                        style={{ width: 44, height: 44, borderRadius: 10, border: ci === i ? '3px solid #0f172a' : '2px solid #e2e8f0', backgroundColor: c, cursor: 'pointer', outline: ci === i ? '2px solid #fff' : 'none', outlineOffset: -4 }}
                        title={p.clrNms?.[i] || c} />
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selector */}
              {productSizes.length > 0 && (
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 10 }}>
                    Size: <span style={{ color: '#008080' }}>{sz}</span>
                  </label>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {productSizes.map((s) => (
                      <button key={s} onClick={() => setSz(s)}
                        style={{ padding: '8px 18px', borderRadius: 8, fontWeight: 700, fontSize: 13, border: sz === s ? '2px solid #008080' : '1.5px solid #e2e8f0', background: sz === s ? '#008080' : 'white', color: sz === s ? 'white' : '#475569', cursor: 'pointer', transition: 'all 0.2s' }}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Qty + Add to Bag */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, border: '1.5px solid #e2e8f0', borderRadius: 10, padding: '8px 16px' }}>
                    <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#0f172a', width: 28, height: 28 }}>−</button>
                    <span style={{ fontWeight: 700, minWidth: 24, textAlign: 'center' }}>{qty}</span>
                    <button onClick={() => setQty(q => q + 1)} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#0f172a', width: 28, height: 28 }}>+</button>
                  </div>
                  <button onClick={() => toggleWishlist(p.id)} style={{ background: 'none', border: 'none', fontSize: 26, cursor: 'pointer' }}>{wished ? '❤️' : '🤍'}</button>
                </div>
                <button onClick={() => addToCart(p, ci, sz || productSizes[0] || 'M')}
                  style={{ width: '100%', background: '#0f172a', color: 'white', border: 'none', borderRadius: 12, padding: '16px 24px', fontWeight: 800, fontSize: 15, cursor: 'pointer', transition: 'background 0.2s', letterSpacing: 0.3 }}>
                  Add to Bag — {fmt(p.price * qty)}
                </button>
              </div>

              {/* Trust Badges */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, paddingTop: 20, borderTop: '1px solid #f1f5f9' }}>
                {[['🚚', 'Free Delivery', '₹999+'], ['🔄', 'Easy Returns', '7 Days'], ['✅', 'Quality', 'Guaranteed']].map(([icon, label, detail]) => (
                  <div key={label} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 22, marginBottom: 4 }}>{icon}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>{label}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>{detail}</div>
                  </div>
                ))}
              </div>

              {/* Accordions */}
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 20 }}>
                <Accordion title="📋 Product Details" defaultOpen={true}>
                  <div style={{ marginBottom: 16, color: '#475569', lineHeight: 1.7 }}>{p.desc}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {([[' Fabric', p.fabD || p.fab], ['Fit', p.fit], p.pockets ? ['Pockets', `${p.pockets} Functional Pockets`] : null, ['Weight', p.wt], ['Care', p.care]] as Array<[string, string] | null>)
                      .filter((x): x is [string, string] => !!x && !!x[1])
                      .map(([lbl, val]) => (
                        <div key={lbl} style={{ display: 'flex', gap: 16, paddingBottom: 8, borderBottom: '1px solid #f8fafc' }}>
                          <strong style={{ color: '#0f172a', minWidth: 80, fontSize: 13 }}>{lbl}</strong>
                          <span style={{ color: '#64748b', fontSize: 13 }}>{val}</span>
                        </div>
                      ))}
                  </div>
                </Accordion>
                <Accordion title="🚚 Shipping & Returns">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, color: '#64748b' }}>
                    <p>• Free shipping on orders above ₹999</p>
                    <p>• Standard delivery: 3–7 business days</p>
                    <p>• Easy 7-day returns on unworn items</p>
                    <p>• Track your order from your dashboard</p>
                  </div>
                </Accordion>
              </div>
            </div>
          </div>
        </div>

        {/* REVIEWS */}
        <div style={{ borderTop: '2px solid #f1f5f9', paddingTop: 60 }}>
          <h2 style={{ fontSize: 28, fontWeight: 900, color: '#0f172a', marginBottom: 8 }}>Customer Reviews</h2>
          <p style={{ color: '#94a3b8', marginBottom: 32, fontSize: 14 }}>{reviews.length} Verified Reviews</p>

          {revLoading ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: '#94a3b8' }}>Loading reviews...</div>
          ) : reviews.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 40 }}>
              {reviews.map((r, i) => (
                <div key={r.id || i} style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #f1f5f9', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#008080,#0f766e)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14 }}>{(r.userName || 'U')[0].toUpperCase()}</div>
                    <div>
                      <div style={{ fontWeight: 700, color: '#0f172a', fontSize: 14 }}>{r.userName || 'Verified Customer'}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#94a3b8' }}>
                        <span>{r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-IN') : ''}</span>
                        <span style={{ color: '#fbbf24' }}>{'★'.repeat(r.rating || 5)}</span>
                      </div>
                    </div>
                  </div>
                  <p style={{ color: '#475569', fontSize: 14, lineHeight: 1.6, margin: 0 }}>{r.body}</p>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '40px 0', textAlign: 'center', color: '#94a3b8', background: '#f8fafc', borderRadius: 16, marginBottom: 32 }}>
              No reviews yet. Be the first to share your experience!
            </div>
          )}

          {/* Review Form */}
          <div style={{ background: 'white', borderRadius: 20, padding: 40, border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', marginBottom: 24 }}>Share Your Feedback</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 10 }}>Rating</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} onClick={() => setRating(n)}
                      style={{ width: 40, height: 40, borderRadius: 8, fontWeight: 700, fontSize: 18, border: 'none', background: rating >= n ? '#fbbf24' : '#f1f5f9', color: rating >= n ? 'white' : '#94a3b8', cursor: 'pointer', transition: 'all 0.2s' }}>★</button>
                  ))}
                  <span style={{ marginLeft: 10, fontSize: 13, color: '#64748b', fontWeight: 600 }}>{['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}</span>
                </div>
              </div>
              <textarea value={revBody} onChange={(e) => setRevBody(e.target.value)}
                placeholder="Share your honest experience with this product..."
                style={{ width: '100%', height: 100, padding: 16, border: '1.5px solid #e2e8f0', borderRadius: 12, fontSize: 14, fontFamily: 'inherit', resize: 'none', outline: 'none', boxSizing: 'border-box' }} />
              <button onClick={handleSubmitReview} disabled={submitting || !revBody.trim()}
                style={{ background: '#008080', color: 'white', border: 'none', borderRadius: 10, padding: '14px 32px', fontWeight: 800, fontSize: 14, cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting || !revBody.trim() ? 0.5 : 1, width: 'fit-content', transition: 'all 0.2s' }}>
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </div>
        </div>

        {/* YOU MAY ALSO LIKE */}
        {related.length > 0 && (
          <div style={{ marginTop: 80, paddingTop: 60, borderTop: '2px solid #f1f5f9' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 40 }}>
              <h2 style={{ fontSize: 28, fontWeight: 900, color: '#0f172a', margin: 0 }}>You May Also Like</h2>
              <button onClick={() => router.push('/products')} style={{ background: 'none', border: '1.5px solid #e2e8f0', borderRadius: 8, padding: '8px 20px', fontSize: 13, fontWeight: 700, color: '#64748b', cursor: 'pointer' }}>View All →</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
              {related.map((rel) => (
                <ProductCard key={rel.id} p={rel} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

