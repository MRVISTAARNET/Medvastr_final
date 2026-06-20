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

  const [zoom, setZoom] = useState(false);

  if ((fetching || (products.length === 0 && !fetched)) && !p) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="text-center text-slate-600">Loading product...</div></div>;
  }
  if (!p) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="text-center text-slate-600">Product not found.</div></div>;
  }

  const wished = wishlist.includes(p.id);
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

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + (r.rating || 5), 0) / reviews.length).toFixed(1)
    : p.rating;

  const selectedVariant = p.variants?.find((v: any) => v.size === sz && v.colorHex === p.clrs?.[ci]);
  const isOutOfStock = selectedVariant ? selectedVariant.stockQuantity <= 0 : false;
  const discount = p.origPrice ? Math.round(((p.origPrice - p.price) / p.origPrice) * 100) : 0;

  return (
    <div className="pdp-container">
      {/* ZOOM MODAL */}
      {zoom && !isVideoActive && (
        <div className="zoom-modal" onClick={() => setZoom(false)}>
          <button className="zoom-close">×</button>
          <button className="zoom-nav zoom-prev" onClick={(e) => {
            e.stopPropagation();
            const cur = visibleImageIndexes.indexOf(mainImg);
            const prev = visibleImageIndexes[(cur - 1 + visibleImageIndexes.length) % visibleImageIndexes.length];
            setMainImg(prev);
          }}>‹</button>
          <img src={mainMediaSrc} alt={p.name} className="zoom-content" onClick={(e) => e.stopPropagation()} />
          <button className="zoom-nav zoom-next" onClick={(e) => {
            e.stopPropagation();
            const cur = visibleImageIndexes.indexOf(mainImg);
            const next = visibleImageIndexes[(cur + 1) % visibleImageIndexes.length];
            setMainImg(next);
          }}>›</button>
        </div>
      )}

      {/* BREADCRUMB */}
      <div className="flex items-center gap-2 text-[10px] text-slate-400 mb-10 uppercase tracking-widest">
        <button onClick={() => router.push('/')}>Home</button>
        <span>/</span>
        <button onClick={() => router.push('/products')}>{p.type || 'Shop'}</button>
        <span>/</span>
        <span className="text-slate-900 font-bold">{p.name}</span>
      </div>

      <div className="pdp-grid">
        {/* LEFT: GALLERY */}
        <div className="pdp-gallery">
          <div className="pdp-thumbs">
            {p.videoUrl && (
              <div onClick={() => setMainImg(-1)} className={`pdp-thumb ${mainImg === -1 ? 'active' : ''} flex items-center justify-center bg-slate-900 text-white`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
              </div>
            )}
            {visibleImageIndexes.map(i => (
              <div key={i} onClick={() => setMainImg(i)} className={`pdp-thumb ${mainImg === i ? 'active' : ''}`}>
                <img src={colorImages[i]} alt="" />
              </div>
            ))}
          </div>

          <div className="pdp-main-stage" onClick={() => !isVideoActive && setZoom(true)}>
            {isVideoActive ? (
              <video src={mainMediaSrc} autoPlay loop muted playsInline controls />
            ) : (
              <img src={mainMediaSrc} alt={p.name} onError={() => activeImageIndex >= 0 && setBrokenImages(v => ({ ...v, [activeImageIndex]: true }))} />
            )}
            {p.badge && (
              <div className="absolute top-6 left-6 px-4 py-1.5 bg-white/95 backdrop-blur shadow-sm rounded-md text-[10px] font-black uppercase tracking-widest text-slate-900 border border-slate-100 italic">
                {p.badge}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: INFO */}
        <div className="pdp-info">
          <div className="pdp-header">
            <span className="pdp-brand">Medvastr Elite</span>
            <h1 className="pdp-title">{p.name}</h1>
            <div className="flex items-center justify-between">
              <div className="pdp-rating">
                <span>★</span> {avgRating} <span className="text-slate-300 font-normal">({reviews.length})</span>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">SKU: {p.sku || 'MVS-P-001'}</span>
            </div>
            <div className="pdp-price-box">
              <span className="pdp-price">{fmt(p.price)}</span>
              {p.origPrice && (
                <>
                  <span className="pdp-orig-price">{fmt(p.origPrice)}</span>
                  <span className="text-emerald-600 text-xs font-black">SAVE {discount}%</span>
                </>
              )}
            </div>
          </div>

          {/* OPTIONS */}
          <div className="space-y-8">
            {p.clrs && p.clrs.length > 0 && (
              <div className="pdp-opt-group">
                <div className="flex justify-between">
                  <label className="pdp-opt-label">Color</label>
                  <span className="text-[11px] font-bold text-slate-900">{p.clrNms?.[ci] || cn(p.clrs[ci])}</span>
                </div>
                <div className="pdp-clr-grid">
                  {p.clrs.map((c, i) => (
                    <button key={i} onClick={() => handleColorChange(i)} className={`pdp-clr-btn ${ci === i ? 'active' : ''}`} style={{ background: c }} />
                  ))}
                </div>
              </div>
            )}

            {productSizes.length > 0 && (
              <div className="pdp-opt-group">
                <div className="flex justify-between">
                  <label className="pdp-opt-label">Size</label>
                  <button className="text-[10px] font-bold text-emerald-600 underline uppercase tracking-widest">Size Guide</button>
                </div>
                <div className="pdp-sz-grid">
                  {productSizes.map(s => (
                    <button key={s} onClick={() => setSz(s)} className={`pdp-sz-btn ${sz === s ? 'active' : ''}`}>{s}</button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ACTIONS */}
          <div className="pdp-actions">
            <div className="pdp-qty-wish">
              <div className="pdp-qty-box">
                <button className="pdp-qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))}>-</button>
                <div className="pdp-qty-val">{qty}</div>
                <button className="pdp-qty-btn" onClick={() => setQty(q => q + 1)}>+</button>
              </div>
              <button onClick={() => toggleWishlist(p.id)} className="pdp-wish-btn">
                {wished ? '❤️ In Wishlist' : '🤍 Add to Wishlist'}
              </button>
            </div>
            <button
              onClick={() => addToCart(p, ci, sz || productSizes[0] || 'M')}
              disabled={isOutOfStock}
              className="pdp-add-btn"
            >
              {isOutOfStock ? 'Sold Out' : `Add to Bag — ${fmt(p.price * qty)}`}
            </button>
            <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest mt-2">Zero-stress delivery & returns included</p>
          </div>

          {/* ACCORDIONS */}
          <div className="pdp-details">
            <Accordion title="TECHNICAL SPECIFICATIONS" defaultOpen={true}>
              <div className="space-y-4">
                <p className="font-medium italic border-l-2 border-emerald-500 pl-4">{p.desc}</p>
                <div className="grid grid-cols-1 gap-2 mt-6">
                  {([['Fabric', p.fabD || p.fab], ['Fit Profile', p.fit], p.pockets ? ['Security', `${p.pockets} Reinforced Pockets`] : null, ['Weight', p.wt], ['Care', p.care]] as Array<[string, string] | null>)
                    .filter((x): x is [string, string] => !!x && !!x[1])
                    .map(([l, v]) => (
                      <div key={l} className="flex justify-between py-3 border-b border-slate-50">
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{l}</span>
                        <span className="text-xs font-black text-slate-800">{v}</span>
                      </div>
                    ))}
                </div>
              </div>
            </Accordion>
            <Accordion title="SHIPPING & LOGISTICS">
              <div className="space-y-3 italic opacity-80">
                <p>📦 Ships within 24-48 hours from our central warehouse.</p>
                <p>🚛 Standard transit time: 3-5 business days across India.</p>
                <p>🔁 Hassle-free 7 day replacement window for size optimizations.</p>
              </div>
            </Accordion>
          </div>
        </div>
      </div>

      {/* RELATED */}
      {related.length > 0 && (
        <div className="mt-40 pt-20 border-t border-slate-100">
          <div className="flex justify-between items-end mb-12">
            <div>
              <div className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em] mb-2 text-center md:text-left">Curated for you</div>
              <h2 className="text-3xl font-black text-slate-900">You May Also Like</h2>
            </div>
            <button onClick={() => router.push('/products')} className="px-8 py-3 bg-slate-900 text-white rounded-full text-xs font-black uppercase tracking-widest hover:bg-emerald-600 transition-all hidden md:block">Explore More</button>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10">
            {related.map(rel => <ProductCard key={rel.id} p={rel} />)}
          </div>
        </div>
      )}
    </div>
  );
}

