"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { fmt, cn, Product } from "@/lib/data";
import { useApp } from "@/context/AppContext";
import ProductCard from "@/components/ProductCard";
import { API_BASE } from "@/lib/api";
import { mapApiProduct, getImagesForColor, getSizesForColor } from "@/lib/productUtils";

function DetailAccordion({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`pdp-acc-item ${open ? 'on' : ''}`}>
      <button onClick={() => setOpen(o => !o)} className="pdp-acc-trigger">
        {title}
        <span>{open ? '−' : '+'}</span>
      </button>
      {open && <div className="pdp-acc-content">{children}</div>}
    </div>
  );
}

export default function ProductDetailClient({ initialProduct }: { initialProduct?: any }) {
  const { slug } = useParams();
  const router = useRouter();
  const { products, addToCart, wishlist, toggleWishlist } = useApp();

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
      .catch(() => { });
  }, [p?.id]);

  useEffect(() => {
    if (productSizes.length > 0) {
      setSz((prev) => (productSizes.includes(prev) ? prev : productSizes[0]));
    }
  }, [p?.id, ci, productSizes]);

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
  const related = relatedPool.slice(0, 4);

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
    <div className="pdp-container page">
      {/* ZOOM LIGHTBOX */}
      {zoom && !isVideoActive && (
        <div className="zoom-modal" onClick={() => setZoom(false)}>
          <button className="zoom-close">✕</button>
          <img src={mainMediaSrc} alt={p.name} className="zoom-content" onClick={e => e.stopPropagation()} />
        </div>
      )}

      {/* BREADCRUMB */}
      <nav className="pdp-bc">
        <button onClick={() => router.push('/')}>Home</button>
        <span>/</span>
        <button onClick={() => router.push('/products')}>{p.type || 'Shop'}</button>
        <span>/</span>
        <strong>{p.name}</strong>
      </nav>

      <div className="pdp-grid">
        {/* GALLERY */}
        <div className="pdp-gallery-wrap">
          <div className="pdp-thumbnails">
            {p.videoUrl && (
              <div onClick={() => setMainImg(-1)} className={`pdp-thumbnail ${mainImg === -1 ? 'on' : ''} flex items-center justify-center`}>
                <span style={{ fontSize: '24px' }}>▶</span>
              </div>
            )}
            {visibleImageIndexes.map(i => (
              <div key={i} onClick={() => setMainImg(i)} className={`pdp-thumbnail ${mainImg === i ? 'on' : ''}`}>
                <img src={colorImages[i]} alt="" />
              </div>
            ))}
          </div>

          <div className="pdp-stage" onClick={() => !isVideoActive && setZoom(true)}>
            {isVideoActive ? (
              <video src={mainMediaSrc} autoPlay loop muted playsInline controls />
            ) : (
              <img src={mainMediaSrc} alt={p.name} onError={() => activeImageIndex >= 0 && setBrokenImages(v => ({ ...v, [activeImageIndex]: true }))} />
            )}
          </div>
        </div>

        {/* INFO */}
        <div className="pdp-info-sec">
          <div>
            <span className="pdp-badge-premium">Premium Medical Wear</span>
            <h1 className="pdp-title-premium">{p.name}</h1>

            <div className="pdp-rating-row">
              <div className="pdp-rating-stars">
                <span>★</span> {avgRating}
              </div>
              <span className="pdp-review-count">({reviews.length} Verified Reviews)</span>
            </div>

            <div className="pdp-price-wrap">
              <span className="pdp-price-now">{fmt(p.price)}</span>
              {p.origPrice && (
                <>
                  <span className="pdp-price-was">{fmt(p.origPrice)}</span>
                  <div className="pdp-discount-tag">-{discount}%</div>
                </>
              )}
            </div>
            <span className="pdp-tax-msg">Includes all applicable taxes and handling</span>
          </div>

          {/* OPTIONS */}
          <div className="space-y-10">
            {p.clrs && p.clrs.length > 0 && (
              <div className="pdp-select-group">
                <div className="pdp-select-hd">
                  <label className="pdp-select-label">Select Color</label>
                  <span className="pdp-select-val">Selected Color: <strong style={{ color: 'var(--ink)' }}>{p.clrNms?.[ci] || cn(p.clrs[ci])}</strong></span>
                </div>
                <div className="pdp-color-grid">
                  {p.clrs.map((c, i) => (
                    <div key={i} onClick={() => handleColorChange(i)} className={`pdp-color-dot ${ci === i ? 'on' : ''}`} style={{ background: c }} />
                  ))}
                </div>
              </div>
            )}

            {productSizes.length > 0 && (
              <div className="pdp-select-group">
                <div className="pdp-select-hd">
                  <label className="pdp-select-label">Select Size</label>
                  <button className="pdp-sg">Size Guide</button>
                </div>
                <div className="pdp-size-btn-grid">
                  {productSizes.map(s => (
                    <button key={s} onClick={() => setSz(s)} className={`pdp-size-pill ${sz === s ? 'on' : ''}`}>{s}</button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ACTIONS */}
          <div className="pdp-main-actions">
            <div className="pdp-qty-wish-row">
              <div className="pdp-qty-stepper">
                <button className="pdp-step-btn" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                <div className="pdp-qty-display">{qty}</div>
                <button className="pdp-step-btn" onClick={() => setQty(q => q + 1)}>+</button>
              </div>
              <button onClick={() => toggleWishlist(p.id)} className={`pdp-heart-btn ${wished ? 'on' : ''}`}>
                {wished ? '❤️ WISHLISTED' : '♡ WISHLIST'}
              </button>
            </div>
            <button
              onClick={() => addToCart(p, ci, sz || productSizes[0] || 'M', qty)}
              disabled={isOutOfStock}
              className="pdp-buy-btn"
            >
              {isOutOfStock ? 'Currently Out of Stock' : `Add to Bag • ${fmt(p.price * qty)}`}
            </button>
            <div className="pdp-delivery-msg">Standard delivery in 3-5 business days</div>
          </div>

          {/* ACCORDIONS */}
          <div className="pdp-details-wrap">
            <DetailAccordion title="Performance & Fabric" defaultOpen={true}>
              <p style={{ color: 'var(--lt)', lineHeight: 1.8, marginBottom: '24px', fontSize: '14.5px' }}>{p.desc}</p>
              <div className="pdp-specs-grid">
                {[
                  ['Material', p.fabD || p.fab],
                  ['Silhouette', p.fit],
                  ['Features', p.pockets ? `${p.pockets} Reinforced Pockets` : null],
                  ['Weight', p.wt],
                  ['Maintenance', p.care]
                ].map(([k, v]) => v && (
                  <div key={k} className="pdp-spec-box">
                    <span className="pdp-spec-key">{k}</span>
                    <span className="pdp-spec-val">{v}</span>
                  </div>
                ))}
              </div>
            </DetailAccordion>

            <DetailAccordion title="Shipping & Returns">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {[['🚚', 'Domestic Express Delivery', 'Ships in 24-48 hours. Transit time 3-5 business days across India.'],
                ['🔁', '7-Day Fit Guarantee', 'Easy size exchange for optimal fit. No questions asked.'],
                ['📦', 'Secure Packaging', 'Orders are carefully packed to ensure your garment arrives in perfect condition.']
                ].map(([ico, title, desc]) => (
                  <div key={title} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '22px', flexShrink: 0 }}>{ico}</span>
                    <div>
                      <strong style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: 'var(--ink)', marginBottom: '4px' }}>{title}</strong>
                      <p style={{ fontSize: '13px', color: 'var(--lt)', lineHeight: 1.7, margin: 0 }}>{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </DetailAccordion>
          </div>

          {/* TRUST STRIP */}
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', paddingTop: '24px', borderTop: '1px solid var(--bdr2)' }}>
            {[['🔒', 'Secure Payment'], ['↩️', 'Easy Returns'], ['✅', 'Genuine Product'], ['🚚', 'Free Shipping ₹999+']].map(([ico, label]) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '12px', color: 'var(--lt)', fontWeight: 600 }}>
                <span style={{ fontSize: '16px' }}>{ico}</span> {label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* REVIEWS SECTION */}
      <section className="pdp-reviews-sec">
        <div className="pdp-reviews-hd">
          <h2 className="pdp-reviews-title">Customer Reviews</h2>
          <div className="pdp-reviews-avg">
            <div className="pdp-reviews-score">{avgRating}</div>
            <div>
              <div className="pdp-reviews-stars">{[1, 2, 3, 4, 5].map(s => <span key={s} style={{ color: s <= Math.round(Number(avgRating)) ? '#f59e0b' : '#e2e8f0' }}>★</span>)}</div>
              <div className="pdp-reviews-count">Based on {reviews.length} reviews</div>
            </div>
          </div>
        </div>

        {reviews.length > 0 ? (
          <div className="pdp-review-cards">
            {reviews.slice(0, 6).map((rv, i) => (
              <div key={i} className="pdp-review-card">
                <div className="pdp-rv-top">
                  <div className="pdp-rv-avatar">{(rv.userName || rv.userEmail || 'A').charAt(0).toUpperCase()}</div>
                  <div>
                    <div className="pdp-rv-name">{rv.userName || rv.userEmail?.split('@')[0] || 'Verified Customer'}</div>
                    <div className="pdp-rv-stars">{[1, 2, 3, 4, 5].map(s => <span key={s} style={{ color: s <= (rv.rating || 5) ? '#f59e0b' : '#e2e8f0' }}>★</span>)}</div>
                  </div>
                </div>
                <p className="pdp-rv-body">{rv.review || rv.comment || rv.body || '—'}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="pdp-no-reviews">Be the first to share your experience with this product!</p>
        )}
      </section>

      {/* RELATED */}
      {related.length > 0 && (
        <section className="pdp-related-sec">
          <div className="pdp-related-hd">
            <span className="pdp-related-tag">Curated Selection</span>
            <h2 className="pdp-related-h">Pairs Well With</h2>
          </div>
          <div className="pg-5">
            {related.map(rel => <ProductCard key={rel.id} p={rel} />)}
          </div>
        </section>
      )}
    </div>
  );
}
