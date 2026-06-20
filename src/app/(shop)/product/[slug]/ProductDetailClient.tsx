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
  const isVideo = (url: string) => /\.(mp4|webm|ogg|mov)$/i.test(url);
  const activeImageIndex = (mainImg === -1 && !!p.videoUrl) ? -1 : (visibleImageIndexes.includes(mainImg) ? mainImg : (visibleImageIndexes[0] ?? -1));
  const isVideoActive = (mainImg === -1 && !!p.videoUrl) || (activeImageIndex >= 0 && isVideo(colorImages[activeImageIndex] || ""));
  const mainMediaSrc = (mainImg === -1 && !!p.videoUrl)
    ? p.videoUrl
    : (activeImageIndex >= 0 ? colorImages[activeImageIndex] : "");

  const renderedVideoSrc = isVideoActive ? mainMediaSrc : "";
  const renderedImageSrc = !isVideoActive ? mainMediaSrc : "";

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

  const selectedVariant = useMemo(() => {
    const hex = p.clrs?.[ci];
    return p.variants?.find((v: any) => v.size === sz && v.colorHex === hex);
  }, [p.variants, ci, sz]);

  const isOutOfStock = selectedVariant ? selectedVariant.stockQuantity <= 0 : false;

  const discount = p.origPrice ? Math.round(((p.origPrice - p.price) / p.origPrice) * 100) : 0;

  return (
    <div className="page static" style={{ minHeight: '100vh', background: '#ffffff' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '24px' }}>

        {/* Breadcrumb - Cleaner */}
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-8 uppercase tracking-widest">
          <button onClick={() => router.push('/')} className="hover:text-emerald-600 transition">Home</button>
          <span className="opacity-50">/</span>
          <button onClick={() => router.push('/products')} className="hover:text-emerald-600 transition">{p.type || 'Shop'}</button>
          <span className="opacity-50">/</span>
          <span className="text-slate-900 font-bold">{p.name}</span>
        </div>

        {/* MAIN 2-COLUMN LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* LEFT: Image Gallery (Lg: 7 cols) */}
          <div className="lg:col-span-7 flex flex-col md:flex-row gap-4">

            {/* Desktop Thumbnails (Side) */}
            <div className="hidden md:flex flex-col gap-3 w-20 flex-shrink-0">
              {p.videoUrl && (
                <div
                  onClick={() => setMainImg(-1)}
                  className={`aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all flex items-center justify-center bg-slate-900 text-white ${mainImg === -1 ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-transparent'}`}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                </div>
              )}
              {visibleImageIndexes.map((i) => (
                <div
                  key={i}
                  onClick={() => setMainImg(i)}
                  className={`aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${mainImg === i ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-transparent'}`}
                >
                  <img src={colorImages[i]} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>

            {/* Main Stage */}
            <div className="flex-grow">
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-slate-50 group">
                {isVideoActive ? (
                  <video src={renderedVideoSrc} autoPlay loop muted playsInline controls className="w-full h-full object-contain bg-black" />
                ) : renderedImageSrc ? (
                  <div className="w-full h-full cursor-zoom-in overflow-hidden">
                    <img
                      src={renderedImageSrc}
                      alt={p.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={() => { if (activeImageIndex >= 0) setBrokenImages(prev => ({ ...prev, [activeImageIndex]: true })); }}
                    />
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-6xl opacity-20">{p.emo || '👔'}</div>
                )}

                {/* Mobile Thumbs (Bottom scroll) */}
                <div className="md:hidden absolute bottom-4 left-0 right-0 p-4">
                  <div className="flex justify-center gap-2">
                    {(p.videoUrl ? [-1, ...visibleImageIndexes] : visibleImageIndexes).map((idx) => (
                      <div
                        key={idx}
                        onClick={() => setMainImg(idx)}
                        className={`w-2 h-2 rounded-full transition-all ${mainImg === idx ? 'bg-emerald-500 w-6' : 'bg-white/50'}`}
                      />
                    ))}
                  </div>
                </div>

                {p.badge && (
                  <div className="absolute top-6 left-6 px-4 py-1.5 bg-white/90 backdrop-blur shadow-sm rounded-full text-[10px] font-black uppercase tracking-widest text-slate-900 border border-slate-100 italic">
                    {p.badge}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: Product Info (Lg: 5 cols) */}
          <div className="lg:col-span-5 h-fit lg:sticky lg:top-28">
            <div className="flex flex-col gap-8">

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-full">{p.fab || 'Medvastr'} Elite</div>
                  <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
                    <span>★</span>
                    <span className="text-slate-900">{avgRating}</span>
                    <span className="text-slate-400 font-normal">({reviews.length})</span>
                  </div>
                </div>

                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">{p.name}</h1>

                <div className="flex items-baseline gap-4">
                  <span className="text-3xl font-black text-emerald-600">{fmt(p.price)}</span>
                  {p.origPrice && (
                    <>
                      <span className="text-xl text-slate-300 line-through font-bold">{fmt(p.origPrice)}</span>
                      <span className="bg-rose-50 text-rose-600 px-3 py-1 rounded-lg text-xs font-black">-{discount}% OFF</span>
                    </>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Zero-stress delivery & returns included</p>
              </div>

              <div className="h-px bg-slate-100" />

              {/* Color Selector */}
              {p.clrs && p.clrs.length > 0 && (
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <label className="text-xs font-black text-slate-900 uppercase tracking-widest">Select Color</label>
                    <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">{p.clrNms?.[ci] || cn(p.clrs[ci])}</span>
                  </div>
                  <div className="flex gap-3 flex-wrap">
                    {p.clrs.map((c, i) => (
                      <button
                        key={i}
                        onClick={() => handleColorChange(i)}
                        className={`w-10 h-10 rounded-xl transition-all duration-300 transform ${ci === i ? 'scale-110 ring-2 ring-slate-900 ring-offset-2' : 'hover:scale-105'}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selector */}
              {productSizes.length > 0 && (
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <label className="text-xs font-black text-slate-900 uppercase tracking-widest">Select Size</label>
                    <button className="text-[10px] font-bold text-slate-400 underline uppercase tracking-widest hover:text-emerald-600">Size Guide</button>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {productSizes.map((s) => (
                      <button
                        key={s}
                        onClick={() => setSz(s)}
                        className={`min-w-[64px] h-12 rounded-xl text-sm font-black transition-all ${sz === s ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/10' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col gap-4">
                <div className="flex gap-4">
                  <div className="flex items-center bg-slate-50 rounded-2xl p-1 h-14 w-32 border border-slate-100">
                    <button onClick={() => setQty(q => Math.max(1, q - 1))} className="flex-1 font-bold text-slate-400 hover:text-slate-900 transition">-</button>
                    <span className="w-8 text-center font-black text-slate-900">{qty}</span>
                    <button onClick={() => setQty(q => q + 1)} className="flex-1 font-bold text-slate-400 hover:text-slate-900 transition">+</button>
                  </div>
                  <button
                    onClick={() => toggleWishlist(p.id)}
                    className={`flex-grow h-14 rounded-2xl flex items-center justify-center gap-3 font-bold transition-all border ${wished ? 'bg-rose-50 border-rose-100 text-rose-500' : 'bg-slate-50 border-slate-100 text-slate-400 hover:bg-slate-100'}`}
                  >
                    <span>{wished ? '❤️' : '🤍'}</span>
                    <span className="text-sm uppercase tracking-widest">{wished ? 'In Wishlist' : 'Add to Wishlist'}</span>
                  </button>
                </div>

                <button
                  onClick={() => addToCart(p, ci, sz || productSizes[0] || 'M')}
                  disabled={isOutOfStock}
                  className={`h-16 rounded-2xl flex items-center justify-center gap-3 font-black text-sm uppercase tracking-[0.2em] transition-all transform active:scale-95 ${isOutOfStock ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-emerald-600 text-white shadow-2xl shadow-emerald-600/20 hover:bg-emerald-700 hover:shadow-emerald-600/30'}`}
                >
                  {isOutOfStock ? 'Sold Out' : (
                    <>
                      <span>Add to Shopping Bag</span>
                      <span className="opacity-40">•</span>
                      <span>{fmt(p.price * qty)}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Bundle Callout */}
              {/\b(top|bottom)\b/i.test(p.name) && (
                <div
                  onClick={() => router.push(`/products?cat=${p.catId || 'all'}`)}
                  className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-2xl cursor-pointer group hover:-translate-y-1 transition-all"
                >
                  <div className="flex gap-4 items-start">
                    <div className="text-3xl">🧩</div>
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-orange-600 mb-1 italic">Bundle Opportunity</div>
                      <h4 className="text-slate-900 font-black text-sm mb-2 group-hover:text-emerald-600 transition">Complete the Set & Save 15%</h4>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed">Match this with our professional bottoms to create the perfect clinical ensemble.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Value Props */}
              <div className="grid grid-cols-2 gap-4 pb-12">
                {[
                  { i: '🔬', t: 'Verified Quality', d: 'Clinical grade fabric' },
                  { i: '🧼', t: 'Easy Care', d: 'Machine wash safe' }
                ].map(v => (
                  <div key={v.t} className="flex gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-xl">{v.i}</span>
                    <div>
                      <div className="text-[10px] font-black uppercase text-slate-900">{v.t}</div>
                      <div className="text-[10px] font-bold text-slate-400">{v.d}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="h-px bg-slate-100" />

              {/* Details & Reviews Section */}
              <div className="space-y-4">
                <Accordion title="TECHNICAL SPECIFICATIONS" defaultOpen={true}>
                  <div className="space-y-6">
                    <p className="text-slate-500 leading-relaxed text-sm font-medium">{p.desc}</p>
                    <div className="grid grid-cols-1 gap-2">
                      {([['Fabric Origin', p.fabD || p.fab], ['Fit Profile', p.fit], p.pockets ? ['Security', `${p.pockets} Reinforced Pockets`] : null, ['GSM Weight', p.wt], ['Sterilization', p.care]] as Array<[string, string] | null>)
                        .filter((x): x is [string, string] => !!x && !!x[1])
                        .map(([lbl, val]) => (
                          <div key={lbl} className="flex justify-between items-center py-3 border-b border-slate-50">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{lbl}</span>
                            <span className="text-xs font-black text-slate-900">{val}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                </Accordion>
                <Accordion title="SHIPPING & LOGISTICS">
                  <div className="space-y-4 text-xs font-bold text-slate-500 leading-relaxed italic">
                    <p>📦 Ships within 24-48 hours from our central warehouse.</p>
                    <p>🚛 Standard transit time: 3-5 business days across India.</p>
                    <p>🔁 Hassle-free 7 day replacement window for size optimizations.</p>
                  </div>
                </Accordion>
                <Accordion title={`VERIFIED REVIEWS (${reviews.length})`}>
                  <div className="space-y-6">
                    {reviews.length > 0 ? (
                      reviews.slice(0, 3).map((r, i) => (
                        <div key={i} className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="flex gap-0.5 text-[8px] text-amber-500">{'★'.repeat(r.rating || 5)}</div>
                            <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{r.userName}</span>
                          </div>
                          <p className="text-xs text-slate-500">{r.body}</p>
                        </div>
                      ))
                    ) : <p className="text-xs text-slate-400 italic">No reviews yet for this color.</p>}
                  </div>
                </Accordion>
              </div>
            </div>
          </div>
        </div>

        {/* RELATED PRODUCTS */}
        {related.length > 0 && (
          <div className="mt-32 pt-20 border-t border-slate-100">
            <div className="flex justify-between items-end mb-12">
              <div className="space-y-2">
                <div className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em]">Curated for you</div>
                <h2 className="text-3xl font-black text-slate-900">You May Also Like</h2>
              </div>
              <button onClick={() => router.push('/products')} className="px-8 py-3 bg-slate-900 text-white rounded-full text-xs font-black uppercase tracking-widest hover:bg-emerald-600 transition-all">Explore More</button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
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

