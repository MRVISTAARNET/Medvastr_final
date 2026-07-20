"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { fmt, cn, Product } from "@/lib/data";
import { useApp } from "@/context/AppContext";
import ProductCard from "@/components/ProductCard";
import { API_BASE, SITE_URL } from "@/lib/api";
import { mapApiProduct, getImagesForColor, getSizesForColor } from "@/lib/productUtils";
import ProductImageZoom from "@/components/ProductImageZoom";
import ExpandableDescription from "@/components/ExpandableDescription";
import JsonLd from "@/components/JsonLd";

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

function LightboxZoomImage({ src, onError }: { src: string; onError?: () => void }) {
  const [hovered, setHovered] = useState(false);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setPos({ x, y });
  };

  return (
    <div
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseMove={handleMouseMove}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        cursor: hovered ? 'crosshair' : 'zoom-in',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Base image — always visible */}
      <img
        src={src}
        alt="Product Fullscreen"
        onError={onError}
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
          objectFit: 'contain',
          display: 'block',
          userSelect: 'none',
          transition: 'opacity 0.15s ease',
          opacity: hovered ? 0.15 : 1,
        }}
      />

      {/* Zoom overlay — follows cursor */}
      {hovered && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${src})`,
            backgroundRepeat: 'no-repeat',
            backgroundSize: '300%',
            backgroundPosition: `${pos.x}% ${pos.y}%`,
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Hint label */}
      {!hovered && (
        <div style={{
          position: 'absolute',
          bottom: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.5)',
          color: 'white',
          fontSize: 12,
          fontWeight: 600,
          padding: '6px 14px',
          borderRadius: 20,
          letterSpacing: '0.05em',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
        }}>
          🔍 Hover to zoom
        </div>
      )}
    </div>
  );
}

export default function ProductDetailClient({ initialProduct }: { initialProduct?: any }) {
  const { slug } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const colorParam = searchParams ? searchParams.get("color") : null;
  const { products, addToCart, toast, user, setIsAuthOpen, storeSettings, setIsCartOpen } = useApp();

  const [isAdding, setIsAdding] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);

  const idOrSlug = String(slug || "");
  const numericId = Number(idOrSlug);
  const fromList = products.find((x) =>
    Number.isFinite(numericId) && numericId ? x.id === numericId : x.slug === idOrSlug
  );

  const [fetched, setFetched] = useState<Product | null>(initialProduct ? mapApiProduct(initialProduct) : null);
  const [fetching, setFetching] = useState(false);
  const p = fromList || fetched;

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const [ci, setCi] = useState<number | null>(null); // null = no color selected yet
  const [sz, setSz] = useState("");
  const [btmSz, setBtmSz] = useState(""); // Second size for sets

  const [colorError, setColorError] = useState(false);
  const [sizeError, setSizeError] = useState(false);
  const [bottomSizeError, setBottomSizeError] = useState(false);

  const [pincode, setPincode] = useState("");
  const [checkingPincode, setCheckingPincode] = useState(false);
  const [pincodeStatus, setPincodeStatus] = useState<{ serviceable: boolean; etd?: string; cod?: boolean; message?: string } | null>(null);

  const checkPincodeServiceability = async () => {
    if (pincode.length !== 6) return;
    setCheckingPincode(true);
    setPincodeStatus(null);
    try {
      const res = await fetch(`${API_BASE}/shipping/serviceability?pincode=${pincode}&weight=0.5&isCod=false`);
      const text = await res.text();
      try {
        const data = JSON.parse(text);
        if (data.status === 200 && data.data && data.data.available_courier_companies?.length > 0) {
          const companies = data.data.available_courier_companies;
          const etds = companies.map((c: any) => c.etd).filter(Boolean);
          let formattedEtd = "";
          if (etds.length > 0) {
            etds.sort();
            const earliestEtd = new Date(etds[0]);
            if (!isNaN(earliestEtd.getTime())) {
              const day = earliestEtd.getDate();
              const month = earliestEtd.toLocaleDateString('en-GB', { month: 'short' });
              let suffix = "th";
              if (day === 1 || day === 21 || day === 31) suffix = "st";
              else if (day === 2 || day === 22) suffix = "nd";
              else if (day === 3 || day === 23) suffix = "rd";
              formattedEtd = `${day}${suffix} ${month}`;
            }
          }
          const codSupported = companies.some((c: any) => c.cod === 1);
          setPincodeStatus({
            serviceable: true,
            etd: formattedEtd || undefined,
            cod: codSupported
          });
        } else {
          setPincodeStatus({
            serviceable: false,
            message: data.message || "Delivery not available for this pincode"
          });
        }
      } catch (err) {
        setPincodeStatus({
          serviceable: false,
          message: "Unable to verify serviceability for this pincode."
        });
      }
    } catch (e) {
      setPincodeStatus({
        serviceable: false,
        message: "Network error checking serviceability."
      });
    } finally {
      setCheckingPincode(false);
    }
  };

  // Preselect color index from URL query param if available
  useEffect(() => {
    if (p && colorParam) {
      const decodedColor = colorParam.trim().toLowerCase();
      let foundIdx = p.clrNms?.findIndex(
        (name: string) => name.trim().toLowerCase() === decodedColor
      );
      if (foundIdx === -1 || foundIdx === undefined) {
        foundIdx = p.clrs?.findIndex(
          (c: string) => c.trim().toLowerCase() === decodedColor
        );
      }
      if (foundIdx !== -1 && foundIdx !== undefined && foundIdx !== null) {
        setCi(foundIdx);
      }
    }
  }, [p, colorParam]);

  // Clear validation errors when user selects options
  useEffect(() => {
    if (ci !== null) setColorError(false);
  }, [ci]);

  useEffect(() => {
    if (sz) setSizeError(false);
  }, [sz]);

  useEffect(() => {
    if (btmSz) setBottomSizeError(false);
  }, [btmSz]);
  const [qty, setQty] = useState(1);
  const [mainImg, setMainImg] = useState(0);
  const [brokenImages, setBrokenImages] = useState<Record<number, boolean>>({});
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewCount, setReviewCount] = useState(0); // tracks live count

  // Review Form State
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      const url = window.location.href;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(url)
          .then(() => toast("Product link copied to clipboard!", "ok"))
          .catch(() => toast("Failed to copy link.", "bad"));
      } else {
        toast("Clipboard sharing not supported on this browser.", "bad");
      }
    }
  };

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

  const colorImages = useMemo(() => (p ? getImagesForColor(p, ci ?? 0) : []), [p, ci]);
  const productSizes = useMemo(() => (p ? getSizesForColor(p, ci ?? 0) : []), [p, ci]);

  // DO NOT auto-preselect size — user must choose
  useEffect(() => {
    setSz("");
    setBtmSz("");
  }, [p?.id, ci]);

  useEffect(() => {
    if (!p) return;
    // Set initial count from product data
    setReviewCount(p.rev || 0);
    fetch(`${API_BASE}/products/${p.id}/reviews?size=50`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          const fetched = d.data?.content || [];
          setReviews(fetched);
          // Use API total count if available, else use fetched length
          setReviewCount(d.data?.totalElements ?? fetched.length ?? p.rev ?? 0);
        }
      })
      .catch(() => { });
  }, [p?.id]);

  useEffect(() => { setBrokenImages({}); setMainImg(0); }, [p?.id, ci]);

  const handleColorChange = (index: number) => {
    setCi(index);
    setMainImg(0);
    setBrokenImages({});
    if (p && typeof window !== "undefined") {
      const colorName = p.clrNms?.[index] || p.clrs?.[index];
      if (colorName) {
        const query = new URLSearchParams(window.location.search);
        query.set("color", colorName);
        router.replace(`${window.location.pathname}?${query.toString()}`, { scroll: false });
      }
    }
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setIsAuthOpen(true);
      return;
    }
    if (!reviewForm.comment.trim()) return;
    setSubmittingReview(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const res = await fetch(`${API_BASE}/products/${p!.id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          rating: reviewForm.rating,
          title: 'Review',
          body: reviewForm.comment,   // ← correct field name per ReviewRequest DTO
        }),
      });
      const data = await res.json();
      if (res.ok || data.success) {
        const newReview = {
          rating: reviewForm.rating,
          body: reviewForm.comment,
          review: reviewForm.comment,
          comment: reviewForm.comment,
          userName: user.firstName || 'You',
          createdAt: new Date().toISOString(),
          ...(data.data || {}),
        };
        setReviews(prev => [newReview, ...prev]);
        setReviewCount(prev => prev + 1);
        setShowReviewForm(false);
        setReviewForm({ rating: 5, comment: '' });
        toast('Review submitted! Thank you.', 'ok');
      } else {
        toast(data.message || 'Failed to submit review. Please try again.', 'bad');
      }
    } catch {
      toast('Network error. Please check your connection.', 'bad');
    } finally {
      setSubmittingReview(false);
    }
  };

  const [zoom, setZoom] = useState(false);
  const [zoomIndex, setZoomIndex] = useState(0);
  const imageRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (zoom) {
      document.body.classList.add("zoom-open");
    } else {
      document.body.classList.remove("zoom-open");
    }
    return () => {
      document.body.classList.remove("zoom-open");
    };
  }, [zoom]);

  // Scroll the horizontal slider to the target image by its offsetLeft
  const scrollToImage = (index: number) => {
    setMainImg(index);
    const container = scrollContainerRef.current;
    const target = imageRefs.current[index];
    if (container && target) {
      container.scrollTo({
        left: target.offsetLeft,
        behavior: 'smooth',
      });
    }
  };

  // Called on every scroll event inside the horizontal slider.
  // Figures out which slide is centred and updates the active thumbnail.
  const handleSliderScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const scrollLeft = container.scrollLeft;
    const width = container.clientWidth;
    if (width <= 0) return;
    const slideIndex = Math.round(scrollLeft / width);

    if (p && p.videoUrl) {
      // Slide 0 is the video (ref -1), slides 1+ are images
      if (slideIndex === 0) {
        if (mainImg !== -1) setMainImg(-1);
      } else {
        const targetIdx = visibleImageIndexes[slideIndex - 1];
        if (targetIdx !== undefined && mainImg !== targetIdx) setMainImg(targetIdx);
      }
    } else {
      const targetIdx = visibleImageIndexes[slideIndex];
      if (targetIdx !== undefined && mainImg !== targetIdx) setMainImg(targetIdx);
    }
  };

  const openLightbox = (index: number) => {
    setZoomIndex(index);
    setZoom(true);
  };

  if ((fetching || (products.length === 0 && !fetched)) && !p) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="text-center text-slate-600">Loading product...</div></div>;
  }
  if (!p) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="text-center text-slate-600">Product not found.</div></div>;
  }

  const currentVariantId = (p as any).variantId || `${p.id}-${ci || 0}`;
  const related = useMemo(() => {
    if (!p || !products || products.length === 0) return [];
    
    const currentType = (p.type || "").toLowerCase();
    let targetTypes: string[] = [];
    
    if (currentType.includes("scrub") && !currentType.includes("under")) {
      // Current is a scrub suit. Pair with underscrubs, t-shirts, caps, or diagnostics.
      targetTypes = ["underscrub", "underscrubs", "tshirts", "tshirt", "surgical", "diagnostic"];
    } else {
      // Current is anything else (underscrub, tshirt, surgical gown, cap, etc.).
      // Pair with scrub suits!
      targetTypes = ["scrubs", "scrub"];
    }
    
    // 1. Get products matching target types
    let matches = products.filter(x => 
      x.id !== p.id && 
      x.active !== false && 
      targetTypes.some(t => (x.type || "").toLowerCase().includes(t))
    );
    
    // 2. If we don't have enough matches (we need 4), fill with other products
    if (matches.length < 4) {
      const remaining = products.filter(x => 
        x.id !== p.id && 
        x.active !== false && 
        !matches.some(m => m.id === x.id)
      );
      matches = [...matches, ...remaining];
    }
    
    // 3. Take top 4 related items
    return matches.slice(0, 4);
  }, [p, products]);

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

  const isSet = (p as any).style?.toLowerCase() === "set";
  const selectedVariant = ci !== null ? p.variants?.find((v: any) => v.size === sz && v.colorHex === p.clrs?.[ci]) : undefined;
  const isOutOfStock = selectedVariant ? selectedVariant.stockQuantity <= 0 : false;
  const discount = p.origPrice ? Math.round(((p.origPrice - p.price) / p.origPrice) * 100) : 0;

  let freeShippingText = `Free Shipping ₹${storeSettings?.SHIPPING_FREE_THRESHOLD || 999}+`;
  if (storeSettings?.SHIPPING_PROMO_FREE_UNTIL) {
    const promoDate = new Date(storeSettings.SHIPPING_PROMO_FREE_UNTIL);
    if (new Date() < promoDate) {
      freeShippingText = `Free Shipping till ${promoDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`;
    }
  }

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": p.name,
    "image": colorImages && colorImages.length > 0 ? colorImages.map(img => img.startsWith("http") ? img : `${SITE_URL}${img}`) : [],
    "description": p.desc || p.short || "",
    "sku": p.sku || `MVS-${p.id}`,
    "mpn": p.styleId || p.sku || `MVS-${p.id}`,
    "brand": {
      "@type": "Brand",
      "name": p.brand || "Medvastr"
    },
    "offers": {
      "@type": "Offer",
      "url": `${SITE_URL}/product/${p.slug || p.id}`,
      "priceCurrency": "INR",
      "price": p.price,
      "priceValidUntil": new Date(new Date().getFullYear() + 1, 0, 1).toISOString().split('T')[0],
      "itemCondition": "https://schema.org/NewCondition",
      "availability": isOutOfStock ? "https://schema.org/OutOfStock" : "https://schema.org/InStock"
    },
    ...(reviews.length > 0 ? {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": avgRating,
        "reviewCount": reviewCount
      },
      "review": reviews.slice(0, 5).map((r: any) => ({
        "@type": "Review",
        "author": {
          "@type": "Person",
          "name": r.userName || "Verified Customer"
        },
        "datePublished": r.createdAt ? r.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
        "reviewBody": r.body || r.comment || "",
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": r.rating || 5,
          "bestRating": "5"
        }
      }))
    } : {})
  };

  return (
    <div className="pdp-container">
      <JsonLd data={productSchema as any} />
      {/* PRO LIGHTBOX MODAL */}
      {zoom && mounted && typeof document !== "undefined" && createPortal(
        <div className="zoom-modal" onClick={() => setZoom(false)}>
          <button className="zoom-close" onClick={() => setZoom(false)}>✕</button>

          <div className="zoom-modal-nav-wrap" onClick={e => e.stopPropagation()}>
            <button className="zoom-nav-btn prev" onClick={() => setZoomIndex(prev => (prev - 1 + visibleImageIndexes.length) % visibleImageIndexes.length)}>‹</button>

            <div className="zoom-canvas">
              <LightboxZoomImage src={colorImages[visibleImageIndexes[zoomIndex]]} onError={() => setBrokenImages(prev => ({ ...prev, [visibleImageIndexes[zoomIndex]]: true }))} />
            </div>

            <button className="zoom-nav-btn next" onClick={() => setZoomIndex(prev => (prev + 1) % visibleImageIndexes.length)}>›</button>
          </div>

          <div className="zoom-modal-thumbnails" onClick={e => e.stopPropagation()}>
            {visibleImageIndexes.map((vIdx, i) => (
              <div
                key={i}
                className={`zoom-thumb-item ${zoomIndex === i ? 'on' : ''}`}
                onClick={() => setZoomIndex(i)}
              >
                <img src={colorImages[vIdx]} alt="" onError={() => setBrokenImages(prev => ({ ...prev, [vIdx]: true }))} />
              </div>
            ))}
          </div>
        </div>,
        document.body
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
        {/* SIDEBAR THUMBS (Desktop only) */}
        <div className="pdp-sidebar-thumbs mob-hide">
          {visibleImageIndexes.map((i) => (
            <div
              key={i}
              className={`pdp-side-thumb ${mainImg === i ? 'active' : ''}`}
              onClick={() => scrollToImage(i)}
            >
              <img src={colorImages[i]} alt="" onError={() => setBrokenImages(prev => ({ ...prev, [i]: true }))} />
            </div>
          ))}
        </div>

        {/* GALLERY - Horizontal Slider */}
        <div className="pdp-gallery-wrap">
          <div
            ref={scrollContainerRef}
            onScroll={handleSliderScroll}
            className="pdp-main-images horizontal-slider"
          >
            {p.videoUrl && (
              <div className="pdp-main-image-item video-item" ref={el => { (imageRefs.current as any)[-1] = el }}>
                <video src={p.videoUrl} autoPlay loop muted playsInline controls />
              </div>
            )}
            {visibleImageIndexes.map((i) => (
              <div
                key={i}
                ref={el => { (imageRefs.current as any)[i] = el }}
                className="pdp-main-image-item"
                onClick={() => openLightbox(visibleImageIndexes.indexOf(i))}
              >
                <ProductImageZoom 
                  src={colorImages[i]} 
                  alt={`${p.name} - Detail ${i + 1}`} 
                  onError={() => setBrokenImages(prev => ({ ...prev, [i]: true }))}
                />
              </div>
            ))}
          </div>

          {/* Carousel Pagination Dots */}
          <div className="pdp-gallery-dots">
            {p.videoUrl && (
              <button
                className={`pdp-gallery-dot ${mainImg === -1 ? 'active' : ''}`}
                onClick={() => scrollToImage(-1)}
                aria-label="Go to video slide"
              />
            )}
            {visibleImageIndexes.map((i, idx) => (
              <button
                key={i}
                className={`pdp-gallery-dot ${mainImg === i ? 'active' : ''}`}
                onClick={() => scrollToImage(i)}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* INFO */}
        <div className="pdp-info-sec">
          <div>
            <span className="pdp-badge-premium">Premium Medical Wear</span>
            
            <div className="product-title__share-group-container" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', width: '100%', gap: '16px' }}>
              <h1 className="pdp-title-premium" style={{ margin: 0, flex: 1 }}>{p.name}</h1>
              <button type="button" onClick={handleShare} className="product-share-button" aria-label="Share product" style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#482f8f', padding: 0, marginTop: '8px' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="22" viewBox="0 0 20 22" fill="none">
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M14.4111 16.291C14.9999 15.741 15.7888 15.4 16.6666 15.4C18.5111 15.4 20 16.874 20 18.7C20 20.526 18.5111 22 16.6666 22C14.8222 22 13.3333 20.526 13.3333 18.7C13.3333 18.436 13.3777 18.183 13.4333 17.941L5.60002 13.4091C4.99996 13.959 4.21108 14.2999 3.33336 14.2999C1.48892 14.2999 0 12.8261 0 11.0001C0 9.17408 1.48892 7.70005 3.33336 7.70005C4.21108 7.70005 4.99996 8.04098 5.60002 8.59106L13.4333 4.06998C13.3777 3.82804 13.3333 3.56403 13.3333 3.30002C13.3333 1.47403 14.8222 0 16.6666 0C18.5111 0 20 1.47403 20 3.30002C20 5.12601 18.5111 6.60004 16.6666 6.60004C15.7888 6.60004 14.9889 6.25911 14.4 5.70904L6.56658 10.23C6.62215 10.4831 6.66657 10.7361 6.66657 11.0001C6.66657 11.2641 6.62215 11.5171 6.56658 11.77L14.4111 16.291ZM17.7776 3.30016C17.7776 2.69522 17.2777 2.20016 16.6665 2.20016C16.0554 2.20016 15.5554 2.69522 15.5554 3.30016C15.5554 3.90525 16.0554 4.40017 16.6665 4.40017C17.2777 4.40017 17.7776 3.90525 17.7776 3.30016ZM3.33321 12.1002C2.72216 12.1002 2.22209 11.6052 2.22209 11.0002C2.22209 10.3951 2.72216 9.90021 3.33321 9.90021C3.94441 9.90021 4.44433 10.3951 4.44433 11.0002C4.44433 11.6052 3.94441 12.1002 3.33321 12.1002ZM15.5554 18.7001C15.5554 19.3052 16.0554 19.8001 16.6665 19.8001C17.2777 19.8001 17.7776 19.3052 17.7776 18.7001C17.7776 18.0952 17.2777 17.6001 16.6665 17.6001C16.0554 17.6001 15.5554 18.0952 15.5554 18.7001Z" fill="#482F8F"></path>
                </svg>
              </button>
            </div>

            <div className="container-price__review" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px', marginBottom: '8px' }}>
              <div className="pdp-price-wrap" id="priceMainContainer" style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: 0 }}>
                <span className="pdp-price-now" style={{ fontSize: '24px', fontWeight: 800, color: 'var(--ink)' }}>{fmt(p.price)}</span>
                {p.origPrice && (
                  <>
                    <span className="pdp-price-was" style={{ fontSize: '20px', textDecoration: 'line-through', color: '#707070' }}>{fmt(p.origPrice)}</span>
                    <span className="discount-percentage" style={{ fontSize: '13px', fontWeight: 700, color: '#14ae5c', background: 'rgba(20, 174, 92, 0.12)', padding: '2px 8px', borderRadius: '6px' }}>-{discount}% Off</span>
                  </>
                )}
              </div>
              <div className="pdp-rating-row" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <div className="pdp-rating-stars" style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#fef08a', color: '#ca8a04', padding: '4px 10px', borderRadius: '20px', fontSize: '14px', fontWeight: 700 }}>
                  <span style={{ fontSize: '16px', color: '#eab308' }}>★</span> {avgRating}
                </div>
                <a href="#pdp-reviews-sec" className="pdp-review-count" style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, textDecoration: 'underline' }}>({reviewCount} Reviews)</a>
              </div>
            </div>
            <span className="pdp-tax-msg">Includes all applicable taxes and handling</span>
          </div>

          {/* OPTIONS */}
          <div className="space-y-10">
            {p.clrs && p.clrs.length > 0 && (
              <div id="pdp-color-select" className="pdp-select-group">
                <div className="pdp-select-hd">
                  <label className="pdp-select-label">Select Color</label>
                  <span className="pdp-select-val">
                    {ci !== null
                      ? <><strong style={{ color: 'var(--ink)' }}>{p.clrNms?.[ci] || cn(p.clrs[ci])}</strong></>     
                      : <span style={{ color: '#e11d48', fontWeight: 600 }}>Please select a color</span>
                    }
                  </span>
                </div>
                {colorError && (
                  <div style={{ color: '#e11d48', fontSize: '13px', fontWeight: 600, marginTop: '-4px', marginBottom: '8px' }}>
                    ⚠️ Please select a color
                  </div>
                )}
                <div className="pdp-color-grid">
                  {p.clrs.map((c, i) => (
                    <div key={i} onClick={() => handleColorChange(i)} className={`pdp-color-dot ${ci === i ? 'on' : ''}`} style={{ background: c }} />
                  ))}
                </div>
              </div>
            )}

            {/* SIZE SELECTOR(S) */}
            {productSizes.length > 0 && (
              <div id="pdp-size-select" className="pdp-select-group">
                <div className="pdp-select-hd">
                  <label className="pdp-select-label">{isSet ? "Select Top Size" : "Select Size"}</label>
                  <button className="pdp-sg" onClick={() => setShowSizeGuide(true)}>Size Guide</button>
                </div>
                {sizeError && (
                  <div style={{ color: '#e11d48', fontSize: '13px', fontWeight: 600, marginTop: '-4px', marginBottom: '8px' }}>
                    ⚠️ {isSet ? 'Please select a top size' : 'Please select a size'}
                  </div>
                )}
                <div className="pdp-size-btn-grid">
                  {productSizes.map(s => (
                    <button key={s} onClick={() => setSz(s)} className={`pdp-size-pill ${sz === s ? 'on' : ''}`}>{s}</button>
                  ))}
                </div>
              </div>
            )}

            {isSet && productSizes.length > 0 && (
              <div id="pdp-bottom-size-select" className="pdp-select-group" style={{ marginTop: '20px' }}>
                <div className="pdp-select-hd">
                  <label className="pdp-select-label">Select Bottom Size</label>
                  <button className="pdp-sg" onClick={() => setShowSizeGuide(true)}>Size Guide</button>
                </div>
                {bottomSizeError && (
                  <div style={{ color: '#e11d48', fontSize: '13px', fontWeight: 600, marginTop: '-4px', marginBottom: '8px' }}>
                    ⚠️ Please select a bottom size
                  </div>
                )}
                <div className="pdp-size-btn-grid">
                  {productSizes.map(s => (
                    <button key={s} onClick={() => setBtmSz(s)} className={`pdp-size-pill ${btmSz === s ? 'on' : ''}`}>{s}</button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ACTIONS */}
          <div className="pdp-main-actions">
            <div className="pdp-qty-wish-row" style={{ display: 'flex', gap: '10px', alignItems: 'center', width: '100%' }}>
              <div className="pdp-qty-stepper" style={{ height: '52px', border: '1.5px solid #cbd5e1', borderRadius: '8px', padding: '0 8px', width: '120px', background: '#fff' }}>
                <button className="pdp-step-btn" style={{ width: '32px', height: '32px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '18px' }} onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                <div className="pdp-qty-display" style={{ fontWeight: 700 }}>{qty}</div>
                <button className="pdp-step-btn" style={{ width: '32px', height: '32px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '18px' }} onClick={() => setQty(q => q + 1)}>+</button>
              </div>
              <button
                onClick={async (e) => {
                  let firstErrorElementId: string | null = null;
                  // Validate color selection
                  if (p.clrs && p.clrs.length > 0 && ci === null) {
                    setColorError(true);
                    if (!firstErrorElementId) firstErrorElementId = "pdp-color-select";
                  }
                  // Validate top size
                  if (productSizes.length > 0 && !sz) {
                    setSizeError(true);
                    if (!firstErrorElementId) firstErrorElementId = "pdp-size-select";
                  }
                  // For sets: validate bottom size too
                  if (isSet && productSizes.length > 0 && !btmSz) {
                    setBottomSizeError(true);
                    if (!firstErrorElementId) firstErrorElementId = "pdp-bottom-size-select";
                  }
                  if (firstErrorElementId) {
                    const element = document.getElementById(firstErrorElementId);
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                    return;
                  }

                  setIsAdding(true);

                  // Create fly-to-cart particle animation
                  try {
                    const cartIcon = document.querySelector('.cart-pill');
                    if (cartIcon && e.currentTarget) {
                      const btnRect = e.currentTarget.getBoundingClientRect();
                      const cartRect = cartIcon.getBoundingClientRect();

                      const flyEl = document.createElement('div');
                      flyEl.className = 'fly-to-cart-particle';
                      flyEl.style.left = `${btnRect.left + btnRect.width / 2 - 12}px`;
                      flyEl.style.top = `${btnRect.top + btnRect.height / 2 - 12}px`;
                      document.body.appendChild(flyEl);

                      requestAnimationFrame(() => {
                        flyEl.style.transform = `translate(${cartRect.left - btnRect.left}px, ${cartRect.top - btnRect.top}px) scale(0.1)`;
                        flyEl.style.opacity = '0';
                      });

                      setTimeout(() => {
                        flyEl.remove();
                      }, 700);
                    }
                  } catch (err) {
                    console.error(err);
                  }

                  setTimeout(() => {
                    const finalSize = isSet ? `Top: ${sz} / Bot: ${btmSz}` : sz;
                    addToCart(p, ci ?? 0, finalSize || 'M', qty);
                    setIsAdding(false);
                    setAddedSuccess(true);
                    setIsCartOpen(true); // Auto-open cart drawer!
                    
                    setTimeout(() => {
                      setAddedSuccess(false);
                    }, 2000);
                  }, 600);
                }}
                disabled={isOutOfStock || isAdding}
                className={`pdp-buy-btn ${addedSuccess ? 'success-state' : ''}`}
                style={{ flex: 1, height: '52px', border: 'none', background: addedSuccess ? '#16a34a' : '#482f8f', color: '#fff', borderRadius: '8px', fontWeight: 700, fontSize: '15px', textTransform: 'uppercase', cursor: 'pointer', transition: 'background 0.3s' }}
              >
                {isOutOfStock ? 'Currently Out of Stock' : isAdding ? 'Adding...' : addedSuccess ? '✓ Added to Bag!' : `Add to Bag • ${fmt(p.price * qty)}`}
              </button>
            </div>
            <div style={{ marginTop: '20px', padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b', marginBottom: '10px' }}>Delivery Details</div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="text" 
                  maxLength={6}
                  placeholder="Enter Pincode" 
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                  style={{ flex: 1, padding: '8px 12px', border: '1.5px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', outline: 'none', background: 'white', color: '#1e293b' }}
                />
                <button 
                  type="button"
                  onClick={checkPincodeServiceability}
                  disabled={pincode.length !== 6 || checkingPincode}
                  style={{ padding: '8px 16px', background: 'var(--ink, #1e1b4b)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '14px', cursor: pincode.length === 6 && !checkingPincode ? 'pointer' : 'default', opacity: pincode.length === 6 ? 1 : 0.6 }}
                >
                  {checkingPincode ? 'Checking...' : 'Check'}
                </button>
              </div>
              {pincodeStatus ? (
                <div style={{ marginTop: '12px', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {pincodeStatus.serviceable ? (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#16a34a', fontWeight: 600 }}>
                        <span style={{ fontSize: '16px' }}>🚚</span> Delivery {pincodeStatus.etd ? `by ${pincodeStatus.etd}` : 'available'}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: (pincodeStatus.cod && !p.codDisabled) ? '#16a34a' : '#475569', fontWeight: 600 }}>
                        <span style={{ fontSize: '16px' }}>💵</span> {(pincodeStatus.cod && !p.codDisabled) ? 'Cash on delivery available' : 'Prepaid payment only'}
                      </div>
                    </>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#dc2626', fontWeight: 600 }}>
                      <span style={{ fontSize: '16px' }}>❌</span> {pincodeStatus.message || 'Delivery not available for this pincode'}
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ marginTop: '8px', fontSize: '12px', color: '#64748b' }}>
                  Standard delivery in 3-5 business days
                </div>
              )}
            </div>
          </div>

          {/* ACCORDIONS */}
          <div className="pdp-details-wrap">
            <DetailAccordion title="Performance & Fabric" defaultOpen={false}>
              <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '12px', marginBottom: '24px', border: '1px solid #e2e8f0' }}>
                <ExpandableDescription
                  text={p.desc}
                  style={{ color: '#334155', lineHeight: 1.8, fontSize: '15px', fontWeight: 500 }}
                />
              </div>
              <div className="pdp-specs-grid-premium">
                {[
                  { k: 'Material', v: p.fabD || p.fab, i: '🧵' },
                  { k: 'Silhouette', v: p.fit, i: '👕' },
                  { k: 'Features', v: p.pockets ? `${p.pockets} Reinforced Pockets` : null, i: '📦' },
                  { k: 'Weight', v: p.wt, i: '⚖️' },
                  { k: 'Maintenance', v: p.care, i: '🧼' }
                ].map(({ k, v, i }) => v && (
                  <div key={k} className="pdp-spec-card-premium">
                    <div className="pdp-spec-icon-bg">{i}</div>
                    <div>
                      <span className="pdp-spec-key">{k}</span>
                      <span className="pdp-spec-val">{v}</span>
                    </div>
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

    </div>
  </div>

      {/* KNYAMED STYLE FEATURE HIGHLIGHTS STRIP */}
      <div className="pdp-highlights-strip">
        <div className="pdp-hl-col">
          <svg className="pdp-hl-svg" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 82V65" stroke="#0f2044" strokeWidth="2.5" strokeLinecap="round"/>
            <path d="M40 68C43 65 47 62 50 65C53 62 57 65 60 68C56 72 44 72 40 68Z" fill="#a3b899" stroke="#0f2044" strokeWidth="2.5" strokeLinejoin="round"/>
            <path d="M40 66C30 66 26 56 34 46C28 36 38 28 46 36C50 28 62 28 66 36C74 28 84 36 78 46C86 56 82 66 72 66C72 66 66 68 56 68C46 68 40 66 40 66Z" fill="#f8fafd" stroke="#0f2044" strokeWidth="2.5" strokeLinejoin="round"/>
            <path d="M34 46C38 48 42 52 44 58" stroke="#0f2044" strokeWidth="2" strokeLinecap="round"/>
            <path d="M78 46C74 48 70 52 68 58" stroke="#0f2044" strokeWidth="2" strokeLinecap="round"/>
            <path d="M28 24L30 20L32 24L30 28L28 24Z" fill="#ffdf7a" stroke="#0f2044" strokeWidth="1.5"/>
            <path d="M68 20L70 16L72 20L70 24L68 20Z" fill="#ffdf7a" stroke="#0f2044" strokeWidth="1.5"/>
          </svg>
          <span className="pdp-hl-label">Super Soft</span>
        </div>
        <div className="pdp-hl-col">
          <svg className="pdp-hl-svg" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 40C30 35 45 45 55 40C65 35 75 40 80 42C75 48 65 43 55 48C45 53 30 43 20 40Z" fill="#e2eafd" stroke="#0f2044" strokeWidth="2" strokeLinejoin="round"/>
            <path d="M20 52C30 47 45 57 55 52C65 47 75 52 80 54C75 60 65 55 55 60C45 65 30 55 20 52Z" fill="#c3d5ff" stroke="#0f2044" strokeWidth="2" strokeLinejoin="round"/>
            <path d="M20 64C30 59 45 69 55 64C65 59 75 64 80 66C75 72 65 67 55 72C45 77 30 67 20 64Z" fill="#a4c0ff" stroke="#0f2044" strokeWidth="2" strokeLinejoin="round"/>
            <path d="M38 78C38 70 42 62 40 50C38 38 48 26 48 18" stroke="#0f2044" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="1 4" />
            <path d="M50 78C50 68 54 58 52 44C50 30 60 22 60 14" stroke="#0f2044" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="1 4" />
            <path d="M62 78C62 70 66 62 64 50C62 38 72 26 72 18" stroke="#0f2044" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="1 4" />
            <path d="M45 16C46 17 48 18 49 19" stroke="#0f2044" strokeWidth="2.5" strokeLinecap="round"/>
            <path d="M57 12C58 13 60 14 61 15" stroke="#0f2044" strokeWidth="2.5" strokeLinecap="round"/>
            <path d="M69 16C70 17 72 18 73 19" stroke="#0f2044" strokeWidth="2.5" strokeLinecap="round"/>
            <circle cx="28" cy="22" r="3" fill="#ffdf7a" stroke="#0f2044" strokeWidth="1.5"/>
            <circle cx="76" cy="30" r="2" fill="#ffdf7a" stroke="#0f2044" strokeWidth="1.5"/>
          </svg>
          <span className="pdp-hl-label">Breathable</span>
        </div>
        <div className="pdp-hl-col">
          <svg className="pdp-hl-svg" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M30 75L72 25" stroke="#0f2044" strokeWidth="3" strokeLinecap="round"/>
            <path d="M24 81L30 75" stroke="#0f2044" strokeWidth="4" strokeLinecap="round"/>
            <path d="M72 25C65 24 48 30 42 45C38 55 36 65 30 75C40 72 50 68 56 58C62 48 70 32 72 25Z" fill="#f8fafd" stroke="#0f2044" strokeWidth="2.5" strokeLinejoin="round"/>
            <path d="M66 32C60 36 50 42 46 54C42 62 40 70 30 75C36 71 42 67 46 59C50 51 60 38 66 32Z" fill="#ffdf7a" stroke="#0f2044" strokeWidth="1.5" strokeLinejoin="round"/>
            <path d="M46 54L38 52" stroke="#0f2044" strokeWidth="2" strokeLinecap="round"/>
            <path d="M54 44L46 41" stroke="#0f2044" strokeWidth="2" strokeLinecap="round"/>
            <path d="M62 34L54 31" stroke="#0f2044" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span className="pdp-hl-label">Featherlight</span>
        </div>
        <div className="pdp-hl-col">
          <svg className="pdp-hl-svg" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g transform="translate(10, 15) scale(0.8)">
              <path d="M10 20 L30 10 L80 60 L60 70 Z" fill="#ffdf7a" stroke="#0f2044" strokeWidth="2" strokeLinejoin="round"/>
              <path d="M30 40 L50 30 L90 70 L70 80 Z" fill="#ffdf7a" stroke="#0f2044" strokeWidth="2" strokeLinejoin="round"/>
              <path d="M10 60 L60 10 L80 20 L30 70 Z" fill="#c3d5ff" stroke="#0f2044" strokeWidth="2" strokeLinejoin="round"/>
              <path d="M30 80 L80 30 L90 40 L40 90 Z" fill="#c3d5ff" stroke="#0f2044" strokeWidth="2" strokeLinejoin="round"/>
              <path d="M36 28 L46 23 L56 33 L46 38 Z" fill="#ffdf7a" stroke="#0f2044" strokeWidth="2" strokeLinejoin="round"/>
              <path d="M60 50 L70 45 L80 55 L70 60 Z" fill="#ffdf7a" stroke="#0f2044" strokeWidth="2" strokeLinejoin="round"/>
            </g>
          </svg>
          <span className="pdp-hl-label">Poly Viscose</span>
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
              <div className="pdp-reviews-count">Based on {reviewCount} reviews</div>
            </div>
            <button
              onClick={() => {
                if (!user) { setIsAuthOpen(true); toast('Please log in to write a review', ''); return; }
                setShowReviewForm(!showReviewForm);
              }}
              className="pdp-buy-btn"
              style={{ height: '40px', width: 'auto', padding: '0 18px', marginLeft: '16px', fontSize: '12px', letterSpacing: '0', textTransform: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}
            >
              {showReviewForm ? 'Cancel' : user ? 'Write a Review' : '🔒 Login to Review'}
            </button>
          </div>
        </div>

        {showReviewForm && (
          <form onSubmit={submitReview} style={{ background: '#f8fafc', padding: '32px', borderRadius: '16px', marginBottom: '40px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--ink)', marginBottom: '16px' }}>Share your thoughts</h3>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '8px', color: 'var(--lt)' }}>Rating</label>
              <div style={{ display: 'flex', gap: '8px', fontSize: '24px', cursor: 'pointer' }}>
                {[1, 2, 3, 4, 5].map(s => (
                  <span key={s} onClick={() => setReviewForm(f => ({ ...f, rating: s }))} style={{ color: s <= reviewForm.rating ? '#f59e0b' : '#cbd5e1' }}>★</span>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '8px', color: 'var(--lt)' }}>Your Review</label>
              <textarea
                value={reviewForm.comment}
                onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                placeholder="What did you like or dislike?"
                rows={4}
                style={{ width: '100%', padding: '16px', border: '1.5px solid #cbd5e1', borderRadius: '12px', fontSize: '15px', resize: 'none', outline: 'none' }}
              />
            </div>
            <button type="submit" disabled={submittingReview} className="pdp-buy-btn" style={{ height: '48px', width: '200px' }}>
              {submittingReview ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        )}

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
          <div className="pg-4">
            {related.map(rel => <ProductCard key={rel.id} p={rel} />)}
          </div>
        </section>
      )}

      {/* Sticky Bottom Bar on Mobile */}
      <div className="pdp-sticky-bar-mobile">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', alignItems: 'flex-start', minWidth: 0, flex: 1, paddingRight: 12 }}>
          <span style={{
            fontSize: '11px',
            fontWeight: 600,
            color: '#64748b',
            letterSpacing: '0',
            textTransform: 'none',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            maxWidth: '100%',
          }}>
            {p.name.length > 26 ? p.name.slice(0, 26) + '…' : p.name}
          </span>
          <span style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b' }}>{fmt(p.price * qty)}</span>
        </div>
        <button
          onClick={async (e) => {
            let firstErrorElementId: string | null = null;
            // Validate color selection
            if (p.clrs && p.clrs.length > 0 && ci === null) {
              setColorError(true);
              if (!firstErrorElementId) firstErrorElementId = "pdp-color-select";
            }
            // Validate top size
            if (productSizes.length > 0 && !sz) {
              setSizeError(true);
              if (!firstErrorElementId) firstErrorElementId = "pdp-size-select";
            }
            // For sets: validate bottom size too
            if (isSet && productSizes.length > 0 && !btmSz) {
              setBottomSizeError(true);
              if (!firstErrorElementId) firstErrorElementId = "pdp-bottom-size-select";
            }
            if (firstErrorElementId) {
              const element = document.getElementById(firstErrorElementId);
              if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
              return;
            }

            setIsAdding(true);

            // Fly particle coordinates
            try {
              const cartIcon = document.querySelector('.cart-pill');
              if (cartIcon && e.currentTarget) {
                const btnRect = e.currentTarget.getBoundingClientRect();
                const cartRect = cartIcon.getBoundingClientRect();

                const flyEl = document.createElement('div');
                flyEl.className = 'fly-to-cart-particle';
                flyEl.style.left = `${btnRect.left + btnRect.width / 2 - 12}px`;
                flyEl.style.top = `${btnRect.top + btnRect.height / 2 - 12}px`;
                document.body.appendChild(flyEl);

                requestAnimationFrame(() => {
                  flyEl.style.transform = `translate(${cartRect.left - btnRect.left}px, ${cartRect.top - btnRect.top}px) scale(0.1)`;
                  flyEl.style.opacity = '0';
                });

                setTimeout(() => {
                  flyEl.remove();
                }, 700);
              }
            } catch (err) {}

            setTimeout(() => {
              const finalSize = isSet ? `Top: ${sz} / Bot: ${btmSz}` : sz;
              addToCart(p, ci ?? 0, finalSize || 'M', qty);
              setIsAdding(false);
              setAddedSuccess(true);
              setIsCartOpen(true);
              setTimeout(() => setAddedSuccess(false), 2000);
            }, 600);
          }}
          disabled={isOutOfStock || isAdding}
          className={`pdp-buy-btn ${addedSuccess ? 'success-state' : ''}`}
          style={{ flexShrink: 0, width: 'auto', height: '44px', background: addedSuccess ? '#16a34a' : 'var(--primary-navy)', border: 'none', color: '#fff', padding: '0 22px', borderRadius: '8px', fontWeight: 600, fontSize: '13px', textTransform: 'none', whiteSpace: 'nowrap', cursor: 'pointer' }}
        >
          {isOutOfStock ? 'Out of Stock' : isAdding ? 'Adding...' : addedSuccess ? '✓ Added' : 'Add to Bag'}
        </button>
      </div>

      {/* SIZE GUIDE MODAL */}
      {showSizeGuide && (
        <div className="size-guide-backdrop" onClick={() => setShowSizeGuide(false)}>
          <div className="size-guide-modal" onClick={e => e.stopPropagation()}>
            <button className="size-guide-close" onClick={() => setShowSizeGuide(false)}>✕</button>
            <h3 className="size-guide-title">Medvastr Size Specifications Guide</h3>
            <p className="size-guide-subtitle">All measurements are in inches. Body measurements should be taken directly on your body.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', maxHeight: '70vh', overflowY: 'auto', paddingRight: '10px' }}>
              
              {/* TOP SIZE GUIDE */}
              {(p.type?.toLowerCase().includes('scrub') || p.type?.toLowerCase().includes('tshirt') || p.type?.toLowerCase().includes('under') || p.type?.toLowerCase().includes('gown')) && (
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '15px', color: '#1e293b' }}>
                    Top Size Guide ({p.gen?.toLowerCase().includes('women') ? "Women's" : "Men's"})
                  </h4>
                  <div className="size-guide-table-container">
                    <table className="size-guide-table">
                      <thead>
                        <tr>
                          <th>Size</th>
                          <th>Chest (in)</th>
                          <th>Top Length (in)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { sz: "XS", chest: "32 - 34", len: "26.5" },
                          { sz: "S", chest: "35 - 37", len: "27.5" },
                          { sz: "M", chest: "38 - 40", len: "28.5" },
                          { sz: "L", chest: "41 - 43", len: "29.5" },
                          { sz: "XL", chest: "44 - 46", len: "30.5" },
                          { sz: "2XL", chest: "47 - 49", len: "31.5" },
                        ].map(row => (
                          <tr key={row.sz}>
                            <td><strong>{row.sz}</strong></td>
                            <td>{row.chest}</td>
                            <td>{row.len}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div style={{ marginTop: '10px', fontSize: '13px', color: '#64748b' }}>
                    <strong>How to measure Chest:</strong> Measure under your arms around the fullest part of your chest.
                  </div>
                </div>
              )}

              {/* BOTTOM SIZE GUIDE */}
              {(p.type?.toLowerCase().includes('scrub') || p.type?.toLowerCase().includes('pant')) && (
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '15px', color: '#1e293b' }}>
                    Bottom Size Guide ({p.gen?.toLowerCase().includes('women') ? "Women's" : "Men's"})
                  </h4>
                  <div className="size-guide-table-container">
                    <table className="size-guide-table">
                      <thead>
                        <tr>
                          <th>Size</th>
                          <th>Waist (in)</th>
                          <th>Hip (in)</th>
                          <th>Pant Inseam (in)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { sz: "XS", waist: "26 - 28", hip: "33 - 35", inseam: "29" },
                          { sz: "S", waist: "29 - 31", hip: "36 - 38", inseam: "30" },
                          { sz: "M", waist: "32 - 34", hip: "39 - 41", inseam: "30" },
                          { sz: "L", waist: "35 - 37", hip: "42 - 44", inseam: "31" },
                          { sz: "XL", waist: "38 - 40", hip: "45 - 47", inseam: "31" },
                          { sz: "2XL", waist: "41 - 43", hip: "48 - 50", inseam: "32" },
                        ].map(row => (
                          <tr key={row.sz}>
                            <td><strong>{row.sz}</strong></td>
                            <td>{row.waist}</td>
                            <td>{row.hip}</td>
                            <td>{row.inseam}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div style={{ marginTop: '10px', fontSize: '13px', color: '#64748b' }}>
                    <strong>How to measure:</strong><br />
                    • <strong>Waist:</strong> Measure around your natural waistline, keeping the tape comfortably loose.<br />
                    • <strong>Hip:</strong> Stand with your feet together and measure around the fullest part of your hips.<br />
                    • <strong>Inseam:</strong> Measure from the crotch to the bottom of the leg.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .size-guide-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 99999;
          padding: 20px;
          animation: fadeIn 0.2s ease-out;
        }
        .size-guide-modal {
          background: white;
          border-radius: 20px;
          padding: 40px;
          max-width: 700px;
          width: 100%;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          position: relative;
          animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .size-guide-close {
          position: absolute;
          right: 25px;
          top: 25px;
          background: #f1f5f9;
          border: none;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .size-guide-close:hover {
          background: #e2e8f0;
          transform: rotate(90deg);
        }
        .size-guide-title {
          font-family: var(--serif, inherit);
          font-size: 24px;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 10px;
        }
        .size-guide-subtitle {
          font-size: 14px;
          color: #64748b;
          margin-bottom: 25px;
          line-height: 1.6;
        }
        .size-guide-table-container {
          overflow-x: auto;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
        }
        .size-guide-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 14px;
        }
        .size-guide-table th {
          background: #f8fafc;
          padding: 14px 18px;
          font-weight: 700;
          color: #334155;
          border-bottom: 2px solid #e2e8f0;
        }
        .size-guide-table td {
          padding: 14px 18px;
          color: #475569;
          border-bottom: 1px solid #f1f5f9;
        }
        .size-guide-table tr:last-child td {
          border-bottom: none;
        }
        .size-guide-table tr:hover td {
          background: #f8fafc;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
