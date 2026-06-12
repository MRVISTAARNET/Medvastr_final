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
  const activeImageIndex = visibleImageIndexes.includes(mainImg) ? mainImg : visibleImageIndexes[0] ?? -1;
  const mainImageSrc = activeImageIndex >= 0 ? colorImages[activeImageIndex] : "";

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
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-600 mb-8 pb-6 border-b border-slate-200">
          <button onClick={() => router.push("/")} className="hover:text-emerald-600 transition">Home</button>
          <span className="text-slate-400">›</span>
          <button onClick={() => router.push("/products")} className="hover:text-emerald-600 transition">{p.type}</button>
          <span className="text-slate-400">›</span>
          <span className="font-semibold text-slate-900">{p.name}</span>
        </div>

        {/* ─── MAIN 2-COLUMN GRID ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* LEFT: Image Gallery */}
          <div className="flex flex-col gap-4">
            {/* Main Image */}
            <div
              className="aspect-square bg-slate-100 rounded-2xl overflow-hidden flex items-center justify-center relative"
              style={{ background: mainImageSrc ? "#f8f8f8" : p.bg }}
            >
              {mainImageSrc ? (
                <img
                  src={mainImageSrc}
                  alt={`${p.name} — ${p.clrNms?.[ci] || "view"}`}
                  className="w-full h-full object-contain"
                  onError={() => {
                    if (activeImageIndex >= 0)
                      setBrokenImages((prev) => ({ ...prev, [activeImageIndex]: true }));
                  }}
                />
              ) : (
                <span className="text-9xl">{p.emo}</span>
              )}
              {p.badge && (
                <div className="absolute top-4 left-4 bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                  {p.badge}
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {visibleImageIndexes.length > 1 && (
              <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(visibleImageIndexes.length, 5)}, 1fr)` }}>
                {visibleImageIndexes.map((i) => (
                  <div
                    key={i}
                    onClick={() => setMainImg(i)}
                    className={`aspect-square rounded-lg overflow-hidden cursor-pointer transition-all ${
                      mainImg === i
                        ? 'ring-2 ring-emerald-500 border-2 border-emerald-500'
                        : 'border-2 border-slate-200 hover:border-emerald-300'
                    }`}
                  >
                    <img
                      src={colorImages[i]} alt={`view ${i + 1}`}
                      className="w-full h-full object-cover"
                      onError={() => setBrokenImages((prev) => ({ ...prev, [i]: true }))}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Product Info (Sticky) */}
          <div className="lg:sticky lg:top-24 lg:h-fit">
            <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
              {/* Collection Tag */}
              <div className="inline-block bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-semibold">
                {p.fab || "Premium"} Collection
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900">{p.name}</h1>

              {/* Rating & Reviews */}
              <div className="flex items-center gap-4 pb-4 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="text-lg text-amber-400">{"★".repeat(Math.floor(Number(avgRating)))}</span>
                  <span className="font-semibold text-slate-900">{avgRating}</span>
                </div>
                <span className="text-sm text-slate-600">{reviews.length} Verified Reviews</span>
                <span className="ml-auto text-sm font-semibold text-emerald-600">✓ In Stock</span>
              </div>

              {/* Price */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-bold text-slate-900">{fmt(p.price)}</span>
                  {p.origPrice && <span className="text-lg text-slate-500 line-through">{fmt(p.origPrice)}</span>}
                </div>
                <p className="text-xs text-slate-600">Inclusive of all taxes</p>
              </div>

              {/* Color Selector */}
              {p.clrs && p.clrs.length > 0 && (
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-slate-900">
                    Colour: <span className="text-emerald-600">{p.clrNms?.[ci] || cn(p.clrs[ci])}</span>
                  </label>
                  <div className="flex gap-3 flex-wrap">
                    {p.clrs.map((c, i) => (
                      <button
                        key={i}
                        onClick={() => handleColorChange(i)}
                        className={`w-12 h-12 rounded-lg border-2 transition-all ${
                          ci === i ? 'border-slate-900 ring-2 ring-slate-900' : 'border-slate-200'
                        }`}
                        style={{ backgroundColor: c }}
                        title={p.clrNms?.[i] || c}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selector */}
              {productSizes.length > 0 && (
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-slate-900">
                    Size: <span className="text-emerald-600">{sz}</span>
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {productSizes.map((s) => (
                      <button
                        key={s}
                        onClick={() => setSz(s)}
                        className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                          sz === s
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity & Add to Cart */}
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3 border-2 border-slate-200 rounded-lg p-2">
                    <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded transition">−</button>
                    <span className="w-8 text-center font-semibold">{qty}</span>
                    <button onClick={() => setQty((q) => q + 1)} className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded transition">+</button>
                  </div>
                  <button
                    onClick={() => toggleWishlist(p.id)}
                    className="text-2xl hover:scale-110 transition"
                  >
                    {wished ? "❤️" : "🤍"}
                  </button>
                </div>
                <button
                  onClick={() => {
                    addToCart(p, ci, sz || productSizes[0] || "M");
                  }}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-4 rounded-lg transition"
                >
                  Add to Bag — {fmt(p.price * qty)}
                </button>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200">
                {[
                  ["🚚", "Free Delivery", "₹999+"],
                  ["🔄", "Easy Returns", "7 Days"],
                  ["✅", "Quality", "Guaranteed"]
                ].map(([icon, label, detail]) => (
                  <div key={label} className="text-center">
                    <div className="text-2xl mb-1">{icon}</div>
                    <div className="text-xs font-semibold text-slate-900">{label}</div>
                    <div className="text-xs text-slate-600">{detail}</div>
                  </div>
                ))}
              </div>

              {/* Accordions */}
              <div className="space-y-0 border-t border-slate-200 pt-6">
                <Accordion title="📋 Product Details" defaultOpen={true}>
                  <div className="mb-4 text-slate-700">{p.desc}</div>
                  <div className="space-y-3 text-sm">
                    {([
                      ["Fabric", p.fabD || p.fab || "Premium, breathable stretch fabric"],
                      ["Fit", p.fit || "Tailored athletic fit"],
                      p.pockets ? ["Pockets", `${p.pockets} Functional Pockets`] : null,
                      ["Weight", p.wt || "Lightweight"],
                      ["Care", p.care || "Machine washable"],
                    ] as Array<[string, string] | null>)
                      .filter((item): item is [string, string] => item !== null)
                      .map(([label, value]) => (
                        <div key={label} className="flex gap-4 pb-2 border-b border-slate-100">
                          <strong className="text-slate-900 min-w-24">{label}</strong>
                          <span className="text-slate-600">{value}</span>
                        </div>
                      ))}
                  </div>
                </Accordion>

                <Accordion title="🚚 Shipping & Returns">
                  <div className="space-y-2 text-sm text-slate-700">
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

        {/* ─── REVIEWS SECTION ─── */}
        <div className="border-t-2 border-slate-200 pt-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Customer Reviews</h2>
          <p className="text-slate-600 mb-8">{reviews.length} Verified Reviews</p>

          {revLoading ? (
            <div className="py-8 text-center text-slate-500">Loading reviews...</div>
          ) : reviews.length > 0 ? (
            <div className="space-y-4 mb-8">
              {reviews.map((r, i) => (
                <div key={r.id || i} className="bg-white rounded-lg p-6 border border-slate-200 hover:shadow-md transition">
                  <div className="flex items-start gap-4 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {(r.userName || "U")[0].toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-slate-900">{r.userName || "Verified Customer"}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-2">
                        <span>{r.createdAt ? new Date(r.createdAt).toLocaleDateString("en-IN") : ""}</span>
                        <span className="text-amber-400">{"★".repeat(r.rating || 5)}</span>
                      </div>
                    </div>
                  </div>
                  {r.title && <div className="font-semibold text-slate-900 mb-2">{r.title}</div>}
                  <p className="text-slate-700 text-sm leading-relaxed">{r.body}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-slate-500 bg-slate-50 rounded-lg">
              No reviews yet. Be the first to share your experience!
            </div>
          )}

          {/* Review Form */}
          <div className="bg-gradient-to-br from-slate-50 to-emerald-50 rounded-xl p-8 border-2 border-slate-200">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Share Your Feedback</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-3">Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      onClick={() => setRating(n)}
                      className={`w-10 h-10 rounded-lg font-bold text-lg transition-all ${
                        rating >= n
                          ? 'bg-amber-400 text-white'
                          : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                  <span className="ml-3 text-sm text-slate-600 font-semibold">
                    {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][rating]}
                  </span>
                </div>
              </div>
              <div>
                <textarea
                  value={revBody}
                  onChange={(e) => setRevBody(e.target.value)}
                  placeholder="Share your honest experience with this product..."
                  className="w-full h-24 p-4 border-2 border-slate-300 rounded-lg focus:border-emerald-500 focus:outline-none resize-none text-sm"
                />
              </div>
              <button
                onClick={handleSubmitReview}
                disabled={submitting || !revBody.trim()}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-lg transition"
              >
                {submitting ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          </div>
        </div>

        {/* ─── RELATED PRODUCTS ─── */}
        {related.length > 0 && (
          <div className="mt-16 pt-12 border-t-2 border-slate-200">
            <h2 className="text-3xl font-bold text-slate-900 mb-8">You May Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
