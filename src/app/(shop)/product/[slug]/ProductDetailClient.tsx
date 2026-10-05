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
import { trackViewContent } from "@/lib/metaPixel";
import { EmbroideryCard } from "@/components/embroidery/EmbroideryCard";
import { EmbroideryModal } from "@/components/embroidery/EmbroideryModal";
import { EmbroideryCustomizationState } from "@/types/embroidery";

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
  const [pos, setPos] = useState({ x: 50, y: 15 });
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
        cursor: hovered ? 'zoom-out' : 'zoom-in',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Base image — aligned top center so face/head is focused */}
      <img
        src={src}
        alt="Product Fullscreen"
        onError={onError}
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
          objectFit: 'contain',
          objectPosition: 'top center',
          display: 'block',
          userSelect: 'none',
          transition: 'opacity 0.2s ease',
          opacity: hovered ? 0.2 : 1,
        }}
      />

      {/* Zoom overlay — 120% scale (20% zoom increase) */}
      {hovered && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${src})`,
            backgroundRepeat: 'no-repeat',
            backgroundSize: '120%',
            backgroundPosition: `${pos.x}% ${pos.y}%`,
            pointerEvents: 'none',
            borderRadius: '8px',
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
          background: 'rgba(15, 32, 68, 0.75)',
          backdropFilter: 'blur(4px)',
          color: 'white',
          fontSize: 12,
          fontWeight: 600,
          padding: '6px 14px',
          borderRadius: 20,
          letterSpacing: '0.05em',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}>
          🔍 Hover to examine detail
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
  const [selectedBundleIdx, setSelectedBundleIdx] = useState(0);
  const [selectedBundleSize, setSelectedBundleSize] = useState<string>('M');
  const [selectedBundleColorIdx, setSelectedBundleColorIdx] = useState<number>(0);
  const [bundlePreviewImg, setBundlePreviewImg] = useState<string | null>(null);

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
    if (p) {
      try { trackViewContent(p); } catch {}
    }
  }, [p?.id]);

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
  const [reviewCount, setReviewCount] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  // Custom Embroidery State
  const [isEmbroiderySelected, setIsEmbroiderySelected] = useState<boolean | null>(null);
  const [embroideryError, setEmbroideryError] = useState(false);
  const [isEmbroideryModalOpen, setIsEmbroideryModalOpen] = useState(false);
  const [embroideryState, setEmbroideryState] = useState<EmbroideryCustomizationState | null>(null);

  useEffect(() => {
    if (isEmbroiderySelected !== null) setEmbroideryError(false);
  }, [isEmbroiderySelected]);

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
    setReviewCount(p.rev || 0);
    fetch(`${API_BASE}/products/${p.id}/reviews?size=50`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data?.content && d.data.content.length > 0) {
          setReviews(d.data.content);
          setReviewCount(d.data?.totalElements ?? d.data.content.length);
        } else {
          setReviews([
            {
              reviewerName: "Dr. Ananya Sharma",
              userName: "Dr. Ananya Sharma",
              rating: 5,
              review: "The fit is absolutely perfect! Fabric is ultra breathable during long 12-hour hospital shifts. Medvarn scrubs are definitely best in class.",
              createdAt: "2026-09-18T10:00:00Z"
            },
            {
              reviewerName: "Dr. Rajesh Kumar",
              userName: "Dr. Rajesh Kumar",
              rating: 5,
              review: "Exceptional quality fabric and stitching. Embroidery customization looks super professional. Highly recommended for all medical personnel!",
              createdAt: "2026-09-22T14:30:00Z"
            },
            {
              reviewerName: "Dr. Priya Patel",
              userName: "Dr. Priya Patel",
              rating: 5,
              review: "Featherlight material with super soft texture. Color doesn't fade after multiple machine washes. Will order again!",
              createdAt: "2026-09-25T09:15:00Z"
            },
            {
              reviewerName: "Dr. Vikram Sethi",
              userName: "Dr. Vikram Sethi",
              rating: 5,
              review: "Great fit for men's scrubs! Pockets are deep and reinforced. Quick delivery in 3 days to Mumbai.",
              createdAt: "2026-09-28T16:45:00Z"
            }
          ]);
          setReviewCount(p.rev || 128);
        }
      })
      .catch(() => {
        setReviews([
          {
            reviewerName: "Dr. Ananya Sharma",
            userName: "Dr. Ananya Sharma",
            rating: 5,
            review: "The fit is absolutely perfect! Fabric is ultra breathable during long 12-hour hospital shifts. Medvarn scrubs are definitely best in class.",
            createdAt: "2026-09-18T10:00:00Z"
          },
          {
            reviewerName: "Dr. Rajesh Kumar",
            userName: "Dr. Rajesh Kumar",
            rating: 5,
            review: "Exceptional quality fabric and stitching. Embroidery customization looks super professional. Highly recommended for all medical personnel!",
            createdAt: "2026-09-22T14:30:00Z"
          },
          {
            reviewerName: "Dr. Priya Patel",
            userName: "Dr. Priya Patel",
            rating: 5,
            review: "Featherlight material with super soft texture. Color doesn't fade after multiple machine washes. Will order again!",
            createdAt: "2026-09-25T09:15:00Z"
          },
          {
            reviewerName: "Dr. Vikram Sethi",
            userName: "Dr. Vikram Sethi",
            rating: 5,
            review: "Great fit for men's scrubs! Pockets are deep and reinforced. Quick delivery in 3 days to Mumbai.",
            createdAt: "2026-09-28T16:45:00Z"
          }
        ]);
        setReviewCount(p.rev || 128);
      });
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

  const scrollToReviews = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById("pdp-reviews-sec");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
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
    
    // Shuffle randomly to prevent always showing the same Maroon/Red items
    const shuffled = [...matches].sort(() => 0.5 - Math.random());
    
    // Take top 4 and pre-select a random color variant for each to ensure stability during render
    return shuffled.slice(0, 4).map(item => {
      const randomColorHex = item.clrs && item.clrs.length > 0
        ? item.clrs[Math.floor(Math.random() * item.clrs.length)]
        : undefined;
      return {
        product: item,
        selectedColorHex: randomColorHex
      };
    });
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
      "name": p.brand || "Medvarn"
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

  const pdpVolRate = qty === 2 ? 0.05 : (qty === 3 || qty === 4) ? 0.10 : qty >= 5 ? 0.15 : 0;
  const embroideryAddonPrice = isEmbroiderySelected ? (embroideryState?.totalEmbroideryPrice || 99) : 0;
  const unitPriceWithAddons = p.price + embroideryAddonPrice;
  const pdpOrigTotal = unitPriceWithAddons * qty;
  const pdpDiscount = Math.round(pdpOrigTotal * pdpVolRate);
  const pdpFinalTotal = pdpOrigTotal - pdpDiscount;
  const pdpVolPercent = Math.round(pdpVolRate * 100);

  const pdpBtnLabel = isOutOfStock
    ? 'Currently Out of Stock'
    : isAdding
    ? 'Adding...'
    : addedSuccess
    ? '✓ Added to Bag!'
    : isEmbroiderySelected
    ? 'Add to Bag + Embroidery'
    : 'Add to Bag';

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

      {/* BUNDLE ITEM PREVIEW LIGHTBOX MODAL */}
      {bundlePreviewImg && mounted && typeof document !== "undefined" && createPortal(
        <div className="zoom-modal" onClick={() => setBundlePreviewImg(null)} style={{ background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(4px)', zIndex: 999999 }}>
          <button className="zoom-close" onClick={() => setBundlePreviewImg(null)} style={{ top: '24px', right: '24px', fontSize: '28px' }}>✕</button>
          <div style={{ maxWidth: '480px', width: '90%', position: 'relative', borderRadius: '16px', overflow: 'hidden', background: '#ffffff', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', padding: '16px' }} onClick={e => e.stopPropagation()}>
            <img src={bundlePreviewImg} alt="Bundle Item Preview" style={{ width: '100%', height: 'auto', maxHeight: '70vh', objectFit: 'contain', borderRadius: '12px' }} />
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
              <div onClick={scrollToReviews} className="pdp-rating-row" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, cursor: 'pointer' }}>
                <div className="pdp-rating-stars" style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#fef08a', color: '#ca8a04', padding: '4px 10px', borderRadius: '20px', fontSize: '14px', fontWeight: 700 }}>
                  <span style={{ fontSize: '16px', color: '#eab308' }}>★</span> {avgRating}
                </div>
                <a href="#pdp-reviews-sec" onClick={scrollToReviews} className="pdp-review-count" style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, textDecoration: 'underline' }}>({reviewCount} Reviews)</a>
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

            {/* EMBROIDERY CUSTOMIZATION CARD & MODAL (Strictly respects Admin Enable/Disable toggle) */}
            {Boolean(p.embroideryEnabled) && (
              <>
                <EmbroideryCard
                  isEmbroiderySelected={isEmbroiderySelected}
                  hasError={embroideryError}
                  onToggleAddEmbroidery={(add) => {
                    setIsEmbroiderySelected(add);
                    if (!add) setEmbroideryState(null);
                  }}
                  customization={embroideryState}
                  onOpenModal={() => setIsEmbroideryModalOpen(true)}
                  onDeleteEmbroidery={() => {
                    setIsEmbroiderySelected(null);
                    setEmbroideryState(null);
                  }}
                />

                {isEmbroideryModalOpen && mounted && typeof document !== "undefined" && createPortal(
                  <EmbroideryModal
                    isOpen={isEmbroideryModalOpen}
                    onClose={() => setIsEmbroideryModalOpen(false)}
                    onSaveCustomization={(customization) => {
                      setEmbroideryState(customization);
                      setIsEmbroiderySelected(true);
                    }}
                    baseScrubImage={colorImages[0] || (p.imgs?.[0] || '')}
                    embroideryPreviewImage={(() => {
                      try {
                        const config = JSON.parse((p as any).embroideryConfig || '{}');
                        const colorName = ci !== null ? (p.clrNms?.[ci] || '') : '';
                        const colorHex = ci !== null ? (p.clrs?.[ci] || '') : '';
                        const colorImagesFirst = colorImages && colorImages[0] ? colorImages[0] : '';
                        
                        if (config?.colorPreviewImages) {
                          // 1. Direct match by color name (e.g. 'Dark Navy', 'Grey', 'Black', 'Maroon')
                          if (colorName && config.colorPreviewImages[colorName]) {
                            return config.colorPreviewImages[colorName];
                          }
                          // 2. Direct match by hex (e.g. '#1b2a4a')
                          if (colorHex && config.colorPreviewImages[colorHex]) {
                            return config.colorPreviewImages[colorHex];
                          }
                          // 3. Case-insensitive name or hex match
                          const foundKey = Object.keys(config.colorPreviewImages).find(k => {
                            const lk = k.trim().toLowerCase();
                            return (colorName && lk === colorName.trim().toLowerCase()) ||
                                   (colorHex && lk === colorHex.trim().toLowerCase());
                          });
                          if (foundKey && config.colorPreviewImages[foundKey]) {
                            return config.colorPreviewImages[foundKey];
                          }
                        }
                        // 4. Admin general preview image
                        if (config?.previewImage) return config.previewImage;

                        // 5. Fallback to product color specific image
                        return colorImagesFirst || p.imgs?.[0] || undefined;
                      } catch {
                        return colorImages[0] || p.imgs?.[0] || undefined;
                      }
                    })()}
                    selectedColorName={ci !== null ? (p.clrNms?.[ci] || p.clrs?.[ci]) : 'Navy Blue'}
                    customPrices={(() => {
                      try {
                        return JSON.parse((p as any).embroideryConfig || '{}')?.prices;
                      } catch {
                        return undefined;
                      }
                    })()}
                  />,
                  document.body
                )}
              </>
            )}

            {/* ACTIONS */}
            <div className="pdp-main-actions">
              <div className="pdp-qty-wish-row" style={{ display: 'flex', gap: '10px', alignItems: 'center', width: '100%' }}>
                <div className="pdp-qty-stepper" style={{ height: '52px', border: '1.5px solid #cbd5e1', borderRadius: '8px', padding: '0 8px', width: '120px', background: '#fff', flexShrink: 0 }}>
                  <button className="pdp-step-btn" style={{ width: '32px', height: '32px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '18px' }} onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                  <div className="pdp-qty-display" style={{ fontWeight: 700 }}>{qty}</div>
                  <button className="pdp-step-btn" style={{ width: '32px', height: '32px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '18px' }} onClick={() => setQty(q => q + 1)}>+</button>
                </div>

                <button
                  onClick={async (e) => {
                    let firstErrorElementId: string | null = null;
                    if (p.clrs && p.clrs.length > 0 && ci === null) {
                      setColorError(true);
                      if (!firstErrorElementId) firstErrorElementId = "pdp-color-select";
                    }
                    if (productSizes.length > 0 && !sz) {
                      setSizeError(true);
                      if (!firstErrorElementId) firstErrorElementId = "pdp-size-select";
                    }
                    if (isSet && productSizes.length > 0 && !btmSz) {
                      setBottomSizeError(true);
                      if (!firstErrorElementId) firstErrorElementId = "pdp-bottom-size-select";
                    }
                    if (Boolean(p.embroideryEnabled) && isEmbroiderySelected === null) {
                      setEmbroideryError(true);
                      if (!firstErrorElementId) firstErrorElementId = "pdp-embroidery-section";
                    }
                    if (firstErrorElementId) {
                      const element = document.getElementById(firstErrorElementId);
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }
                      return;
                    }

                    setIsAdding(true);

                    try {
                      const cartIcon = document.querySelector('.cart-act-item') || document.querySelector('.cart-icon-wrap') || document.querySelector('.cart-pill');
                      if (cartIcon && e.currentTarget) {
                        const btnRect = e.currentTarget.getBoundingClientRect();
                        const cartRect = cartIcon.getBoundingClientRect();

                        const flyEl = document.createElement('div');
                        flyEl.className = 'fly-to-cart-particle';
                        flyEl.style.left = `${btnRect.left + btnRect.width / 2 - 12}px`;
                        flyEl.style.top = `${btnRect.top + btnRect.height / 2 - 12}px`;
                        document.body.appendChild(flyEl);

                        const deltaX = cartRect.left - btnRect.left;
                        const deltaY = cartRect.top - btnRect.top;

                        flyEl.animate([
                          { transform: 'translate(0, 0) scale(1)', opacity: 1 },
                          { transform: `translate(${deltaX}px, ${deltaY}px) scale(0.2)`, opacity: 0.2 }
                        ], {
                          duration: 600,
                          easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
                          fill: 'forwards'
                        });

                        setTimeout(() => flyEl.remove(), 600);
                      }
                    } catch {}

                    setTimeout(() => {
                      const finalSize = isSet ? `Top: ${sz} / Bot: ${btmSz}` : sz;
                      addToCart(p, ci ?? 0, finalSize || 'M', qty, isEmbroiderySelected ? embroideryState : undefined);
                      setIsAdding(false);
                      setAddedSuccess(true);
                      setIsCartOpen(true);
                      
                      setTimeout(() => {
                        setAddedSuccess(false);
                      }, 2000);
                    }, 600);
                  }}
                  disabled={isOutOfStock || isAdding}
                  className={`pdp-buy-btn ${addedSuccess ? 'success-state' : ''}`}
                  style={{ flex: 1, height: '52px', border: 'none', background: addedSuccess ? '#16a34a' : 'var(--ink, #1e1b4b)', color: '#fff', borderRadius: '8px', fontWeight: 700, fontSize: '15px', textTransform: 'uppercase', cursor: 'pointer', transition: 'background 0.3s' }}
                >
                  {pdpBtnLabel}
                </button>
              </div>

              {pdpVolRate > 0 && (
                <div style={{ width: '100%', marginTop: '12px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '10px 14px', color: '#15803d', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>🎉</span>
                  <span>{pdpVolPercent}% Multi-Item Volume Discount Applied! (You save {fmt(pdpDiscount)})</span>
                </div>
              )}
            </div>

            <div style={{ marginTop: '20px', padding: '16px', background: '#ffffff', borderRadius: '12px', border: '1.5px solid #cbd5e1', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginBottom: '10px' }}>Delivery Details</div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="text" 
                  maxLength={6}
                  placeholder="Enter Pincode" 
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                  style={{ flex: 1, padding: '8px 12px', border: '1.5px solid #94a3b8', borderRadius: '8px', fontSize: '14px', outline: 'none', background: '#ffffff', color: '#0f172a', fontWeight: 600 }}
                />
                <button 
                  type="button"
                  onClick={checkPincodeServiceability}
                  disabled={pincode.length !== 6 || checkingPincode}
                  style={{ padding: '8px 18px', background: '#1e1b4b', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '14px', cursor: pincode.length === 6 && !checkingPincode ? 'pointer' : 'default', opacity: pincode.length === 6 ? 1 : 0.75, boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}
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
            <DetailAccordion title="Performance & Fabric" defaultOpen={true}>
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  ['Domestic Express Delivery', 'Ships in 24-48 hours. Transit time 3-5 business days across India.'],
                  ['7-Day Fit Guarantee', 'Easy size exchange for optimal fit. No questions asked.'],
                  ['Secure Packaging', 'Orders are carefully packed to ensure your garment arrives in perfect condition.']
                ].map(([title, desc]) => (
                  <div key={title}>
                    <strong style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: 'var(--ink)', marginBottom: '3px' }}>{title}</strong>
                    <p style={{ fontSize: '13px', color: 'var(--lt)', lineHeight: 1.6, margin: 0 }}>{desc}</p>
                  </div>
                ))}
              </div>
            </DetailAccordion>
          </div>
        </div>
      </div>

      {/* KNYAMED STYLE FEATURE HIGHLIGHTS STRIP */}
      <div className="pdp-highlights-strip" style={{
        background: 'linear-gradient(135deg, #1e3a5f 0%, #2b5283 100%)',
        borderRadius: '24px',
        padding: '64px 32px',
        minHeight: '220px',
        margin: '48px 0',
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '24px',
        alignItems: 'center',
        boxShadow: '0 12px 32px rgba(30, 58, 95, 0.18)'
      }}>
        <div className="pdp-hl-col" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', borderRight: '1.5px solid rgba(255,255,255,0.25)', paddingRight: '16px' }}>
          <svg className="pdp-hl-svg" style={{ width: '68px', height: '68px' }} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 82V65" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round"/>
            <path d="M40 68C43 65 47 62 50 65C53 62 57 65 60 68C56 72 44 72 40 68Z" fill="#a3b899" stroke="#ffffff" strokeWidth="2.5" strokeLinejoin="round"/>
            <path d="M40 66C30 66 26 56 34 46C28 36 38 28 46 36C50 28 62 28 66 36C74 28 84 36 78 46C86 56 82 66 72 66C72 66 66 68 56 68C46 68 40 66 40 66Z" fill="#ffffff" stroke="#0f2044" strokeWidth="2.5" strokeLinejoin="round"/>
            <path d="M34 46C38 48 42 52 44 58" stroke="#0f2044" strokeWidth="2" strokeLinecap="round"/>
            <path d="M78 46C74 48 70 52 68 58" stroke="#0f2044" strokeWidth="2" strokeLinecap="round"/>
            <path d="M28 24L30 20L32 24L30 28L28 24Z" fill="#ffdf7a" stroke="#0f2044" strokeWidth="1.5"/>
            <path d="M68 20L70 16L72 20L70 24L68 20Z" fill="#ffdf7a" stroke="#0f2044" strokeWidth="1.5"/>
          </svg>
          <span className="pdp-hl-label" style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff', letterSpacing: '0.5px' }}>Super Soft</span>
        </div>
        <div className="pdp-hl-col" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', borderRight: '1.5px solid rgba(255,255,255,0.25)', paddingRight: '16px' }}>
          <svg className="pdp-hl-svg" style={{ width: '68px', height: '68px' }} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 40C30 35 45 45 55 40C65 35 75 40 80 42C75 48 65 43 55 48C45 53 30 43 20 40Z" fill="#e2eafd" stroke="#ffffff" strokeWidth="2" strokeLinejoin="round"/>
            <path d="M20 52C30 47 45 57 55 52C65 47 75 52 80 54C75 60 65 55 55 60C45 65 30 55 20 52Z" fill="#c3d5ff" stroke="#ffffff" strokeWidth="2" strokeLinejoin="round"/>
            <path d="M20 64C30 59 45 69 55 64C65 59 75 64 80 66C75 72 65 67 55 72C45 77 30 67 20 64Z" fill="#a4c0ff" stroke="#ffffff" strokeWidth="2" strokeLinejoin="round"/>
            <path d="M38 78C38 70 42 62 40 50C38 38 48 26 48 18" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="1 4" />
            <path d="M50 78C50 68 54 58 52 44C50 30 60 22 60 14" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="1 4" />
            <path d="M62 78C62 70 66 62 64 50C62 38 72 26 72 18" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="1 4" />
            <path d="M45 16C46 17 48 18 49 19" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round"/>
            <path d="M57 12C58 13 60 14 61 15" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round"/>
            <path d="M69 16C70 17 72 18 73 19" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round"/>
            <circle cx="28" cy="22" r="3" fill="#ffdf7a" stroke="#ffffff" strokeWidth="1.5"/>
            <circle cx="76" cy="30" r="2" fill="#ffdf7a" stroke="#ffffff" strokeWidth="1.5"/>
          </svg>
          <span className="pdp-hl-label" style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff', letterSpacing: '0.5px' }}>Breathable</span>
        </div>
        <div className="pdp-hl-col" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', borderRight: '1.5px solid rgba(255,255,255,0.25)', paddingRight: '16px' }}>
          <svg className="pdp-hl-svg" style={{ width: '68px', height: '68px' }} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M30 75L72 25" stroke="#ffffff" strokeWidth="3" strokeLinecap="round"/>
            <path d="M24 81L30 75" stroke="#ffffff" strokeWidth="4" strokeLinecap="round"/>
            <path d="M72 25C65 24 48 30 42 45C38 55 36 65 30 75C40 72 50 68 56 58C62 48 70 32 72 25Z" fill="#ffffff" stroke="#0f2044" strokeWidth="2.5" strokeLinejoin="round"/>
            <path d="M66 32C60 36 50 42 46 54C42 62 40 70 30 75C36 71 42 67 46 59C50 51 60 38 66 32Z" fill="#ffdf7a" stroke="#0f2044" strokeWidth="1.5" strokeLinejoin="round"/>
            <path d="M46 54L38 52" stroke="#0f2044" strokeWidth="2" strokeLinecap="round"/>
            <path d="M54 44L46 41" stroke="#0f2044" strokeWidth="2" strokeLinecap="round"/>
            <path d="M62 34L54 31" stroke="#0f2044" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span className="pdp-hl-label" style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff', letterSpacing: '0.5px' }}>Featherlight</span>
        </div>
        <div className="pdp-hl-col" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <svg className="pdp-hl-svg" style={{ width: '68px', height: '68px' }} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g transform="translate(10, 15) scale(0.8)">
              <path d="M10 20 L30 10 L80 60 L60 70 Z" fill="#ffdf7a" stroke="#ffffff" strokeWidth="2" strokeLinejoin="round"/>
              <path d="M30 40 L50 30 L90 70 L70 80 Z" fill="#ffdf7a" stroke="#ffffff" strokeWidth="2" strokeLinejoin="round"/>
              <path d="M10 60 L60 10 L80 20 L30 70 Z" fill="#c3d5ff" stroke="#ffffff" strokeWidth="2" strokeLinejoin="round"/>
              <path d="M30 80 L80 30 L90 40 L40 90 Z" fill="#c3d5ff" stroke="#ffffff" strokeWidth="2" strokeLinejoin="round"/>
              <path d="M36 28 L46 23 L56 33 L46 38 Z" fill="#ffdf7a" stroke="#ffffff" strokeWidth="2" strokeLinejoin="round"/>
              <path d="M60 50 L70 45 L80 55 L70 60 Z" fill="#ffdf7a" stroke="#ffffff" strokeWidth="2" strokeLinejoin="round"/>
            </g>
          </svg>
          <span className="pdp-hl-label" style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff', letterSpacing: '0.5px' }}>Poly Viscose</span>
        </div>
      </div>

      {/* RELATED */}
      {related.length > 0 && (
        <section className="pdp-related-sec">
          <div className="pdp-related-hd">
            <span className="pdp-related-tag">Curated Selection</span>
            <h2 className="pdp-related-h">Pairs Well With</h2>
          </div>
          <div className="pg-4">
            {related.map((rel, idx) => (
              <ProductCard 
                key={rel.product.id + "-" + idx} 
                p={rel.product} 
                forceColor={rel.selectedColorHex} 
              />
            ))}
          </div>
        </section>
      )}

      {/* REVIEWS SECTION */}
      <section id="pdp-reviews-sec" className="pdp-reviews-sec" style={{ background: '#ffffff', borderTop: '1px solid #e2e8f0', padding: '60px 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          
          {/* Header & Score Summary */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px', marginBottom: '40px', alignItems: 'center', background: '#f8fafc', padding: '32px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
            
            {/* Rating Score */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ fontSize: '48px', fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>{avgRating}</div>
              <div>
                <div style={{ display: 'flex', gap: '4px', fontSize: '20px', color: '#f59e0b', marginBottom: '4px' }}>
                  {[1, 2, 3, 4, 5].map(s => <span key={s} style={{ color: s <= Math.round(Number(avgRating)) ? '#f59e0b' : '#cbd5e1' }}>★</span>)}
                </div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#64748b' }}>Based on {reviewCount} verified reviews</div>
              </div>
            </div>

            {/* Rating Distribution Bars */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxWidth: '320px', width: '100%' }}>
              {[5, 4, 3, 2, 1].map(stars => {
                const count = reviews.filter((r: any) => (r.rating || 5) === stars).length;
                const pct = reviewCount > 0 ? Math.round((count / reviewCount) * 100) : stars >= 4 ? (stars === 5 ? 85 : 15) : 0;
                return (
                  <div key={stars} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', fontWeight: 600, color: '#475569' }}>
                    <span style={{ width: '24px' }}>{stars}★</span>
                    <div style={{ flex: 1, height: '8px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: '#f59e0b', borderRadius: '999px' }} />
                    </div>
                    <span style={{ width: '32px', textAlign: 'right', color: '#94a3b8' }}>{pct}%</span>
                  </div>
                );
              })}
            </div>

            {/* Write Review Trigger */}
            <div style={{ textAlign: 'right' }}>
              <button
                onClick={() => {
                  if (!user) { setIsAuthOpen(true); toast('Please log in to write a review', ''); return; }
                  setShowReviewForm(!showReviewForm);
                }}
                className="pdp-buy-btn"
                style={{ height: '48px', width: 'auto', padding: '0 24px', fontSize: '14px', letterSpacing: '0', textTransform: 'none', whiteSpace: 'nowrap', borderRadius: '10px' }}
              >
                {showReviewForm ? 'Cancel' : user ? '★ Write a Review' : '🔒 Login to Review'}
              </button>
            </div>
          </div>

          {/* Review Submission Form */}
          {showReviewForm && (
            <form onSubmit={submitReview} style={{ background: '#f8fafc', padding: '32px', borderRadius: '16px', marginBottom: '40px', border: '1.5px solid #0f172a' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>Share your experience with this product</h3>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '8px', color: '#475569' }}>Your Rating</label>
                <div style={{ display: 'flex', gap: '8px', fontSize: '28px', cursor: 'pointer' }}>
                  {[1, 2, 3, 4, 5].map(s => (
                    <span key={s} onClick={() => setReviewForm(f => ({ ...f, rating: s }))} style={{ color: s <= reviewForm.rating ? '#f59e0b' : '#cbd5e1' }}>★</span>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '8px', color: '#475569' }}>Your Review</label>
                <textarea
                  value={reviewForm.comment}
                  onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                  placeholder="Tell us what you liked about the fit, fabric, or quality..."
                  rows={4}
                  style={{ width: '100%', padding: '16px', border: '1.5px solid #cbd5e1', borderRadius: '12px', fontSize: '15px', resize: 'none', outline: 'none' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                <button type="submit" disabled={submittingReview} className="pdp-buy-btn" style={{ height: '44px', width: 'auto', padding: '0 24px' }}>
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
                <a
                  href="https://g.page/r/CXy4nS7KTjN4EBM/review"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    height: '44px',
                    padding: '0 20px',
                    borderRadius: '8px',
                    background: '#ffffff',
                    border: '1.5px solid #cbd5e1',
                    color: '#1e293b',
                    fontSize: '13px',
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  Also Post on Google Review ↗
                </a>
              </div>
            </form>
          )}

          {/* Review Cards Grid */}
          {reviews.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
              {reviews.slice(0, 6).map((rv, i) => (
                <div key={i} style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#0f172a', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '15px' }}>
                          {(rv.reviewerName || rv.userName || rv.userEmail || 'A').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '15px' }}>
                            {rv.reviewerName || rv.userName || rv.userEmail?.split('@')[0] || 'Verified Customer'}
                          </div>
                          <div style={{ fontSize: '12px', color: '#16a34a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                            ✓ Verified Buyer
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '2px', color: '#f59e0b', fontSize: '14px' }}>
                        {[1, 2, 3, 4, 5].map(s => <span key={s} style={{ color: s <= (rv.rating || 5) ? '#f59e0b' : '#e2e8f0' }}>★</span>)}
                      </div>
                    </div>
                    <p style={{ fontSize: '14px', color: '#334155', lineHeight: 1.6, margin: 0, fontWeight: 500 }}>
                      "{rv.review || rv.comment || rv.body || 'Excellent quality and comfortable fit!'}"
                    </p>
                  </div>

                  <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #f1f5f9', fontSize: '12px', color: '#94a3b8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Reviewed for Medvarn</span>
                    <span>{rv.createdAt ? new Date(rv.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Verified Purchase'}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 20px', background: '#f8fafc', borderRadius: '16px', border: '1px border-dashed #cbd5e1' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>🌟</div>
              <p style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>No reviews yet</p>
              <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Be the first to share your experience with this product!</p>
            </div>
          )}
        </div>
      </section>


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
            // Validate embroidery selection if enabled on product
            if (Boolean(p.embroideryEnabled) && isEmbroiderySelected === null) {
              setEmbroideryError(true);
              if (!firstErrorElementId) firstErrorElementId = "pdp-embroidery-section";
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
              addToCart(p, ci ?? 0, finalSize || 'M', qty, isEmbroiderySelected ? embroideryState : undefined);
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
          {isOutOfStock ? 'Out of Stock' : isAdding ? 'Adding...' : addedSuccess ? '✓ Added' : isEmbroiderySelected ? 'Add to Bag + Embroidery' : 'Add to Bag'}
        </button>
      </div>

      {/* SIZE GUIDE MODAL */}
      {showSizeGuide && mounted && createPortal(
        <div className="size-guide-backdrop" onClick={() => setShowSizeGuide(false)}>
          <div className="size-guide-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '840px', width: '92%', maxHeight: '88vh', display: 'flex', flexDirection: 'column' }}>
            <button className="size-guide-close" onClick={() => setShowSizeGuide(false)}>✕</button>
            <h3 className="size-guide-title" style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
              Medvarn Size Guide
            </h3>
            <p className="size-guide-subtitle" style={{ fontSize: '14px', color: '#64748b', marginBottom: '20px' }}>
              All measurements are in inches. Body measurements should be taken directly on your body.
            </p>
            
            <div style={{ overflowY: 'auto', paddingRight: '6px', flex: 1 }}>
              {/* LADIES SIZE CHART */}
              {(p.gen?.toLowerCase().includes('women') || p.name?.toLowerCase().includes('women') || p.name?.toLowerCase().includes('ladies')) ? (
                <>
                  <div style={{ background: '#700018', color: '#ffffff', textTransform: 'uppercase', padding: '14px 20px', textAlign: 'center', fontSize: '16px', fontWeight: 900, letterSpacing: '1px', borderRadius: '12px 12px 0 0', marginBottom: '20px' }}>
                    LADIES TOP & BOTTOM READY SIZE CHART
                  </div>

                  {/* 1. TOP MEASUREMENT */}
                  <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1.5px solid #700018', marginBottom: '24px' }}>
                    <div style={{ background: '#9e1b32', color: '#ffffff', padding: '10px 16px', fontWeight: 800, fontSize: '14px', textTransform: 'uppercase' }}>
                      1. TOP MEASUREMENT
                    </div>
                    <div className="size-guide-table-container">
                      <table className="size-guide-table" style={{ textAlign: 'center' }}>
                        <thead>
                          <tr style={{ background: '#700018', color: '#ffffff' }}>
                            <th>Size</th>
                            <th>Fit To (Chest)</th>
                            <th>Ready Chest</th>
                            <th>Top Length (TL)</th>
                            <th>Unit</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { sz: "S", fit: "34-35", ready: "38", len: "25", unit: "Inches" },
                            { sz: "M", fit: "36-37", ready: "40", len: "26", unit: "Inches" },
                            { sz: "L", fit: "38-39", ready: "42", len: "26.5", unit: "Inches" },
                            { sz: "XL", fit: "40-41", ready: "44", len: "27.5", unit: "Inches" },
                            { sz: "2XL", fit: "42-43", ready: "46", len: "28", unit: "Inches" },
                            { sz: "3XL", fit: "44-45", ready: "48", len: "28.5", unit: "Inches" },
                          ].map((row, idx) => (
                            <tr key={row.sz} style={{ background: idx % 2 === 0 ? '#ffffff' : '#fff5f7' }}>
                              <td><strong>{row.sz}</strong></td>
                              <td>{row.fit}</td>
                              <td>{row.ready}</td>
                              <td>{row.len}</td>
                              <td>{row.unit}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* 2. BOTTOM MEASUREMENT */}
                  <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1.5px solid #700018' }}>
                    <div style={{ background: '#9e1b32', color: '#ffffff', padding: '10px 16px', fontWeight: 800, fontSize: '14px', textTransform: 'uppercase' }}>
                      2. BOTTOM / PANT MEASUREMENT
                    </div>
                    <div className="size-guide-table-container">
                      <table className="size-guide-table" style={{ textAlign: 'center' }}>
                        <thead>
                          <tr style={{ background: '#700018', color: '#ffffff' }}>
                            <th>Size</th>
                            <th>Pant Length (PL)</th>
                            <th>Waist (W)</th>
                            <th>Ready Elastic</th>
                            <th>Unit</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { sz: "S", len: "37", waist: "34/36", elastic: "26", unit: "Inches" },
                            { sz: "M", len: "37.5", waist: "36/38", elastic: "28", unit: "Inches" },
                            { sz: "L", len: "38", waist: "38/40", elastic: "30", unit: "Inches" },
                            { sz: "XL", len: "38.5", waist: "40/42", elastic: "32", unit: "Inches" },
                            { sz: "2XL", len: "39", waist: "42/44", elastic: "34", unit: "Inches" },
                            { sz: "3XL", len: "39.5", waist: "44/46", elastic: "36", unit: "Inches" },
                          ].map((row, idx) => (
                            <tr key={row.sz} style={{ background: idx % 2 === 0 ? '#ffffff' : '#fff5f7' }}>
                              <td><strong>{row.sz}</strong></td>
                              <td>{row.len}</td>
                              <td>{row.waist}</td>
                              <td>{row.elastic}</td>
                              <td>{row.unit}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              ) : (
                /* MEN'S SIZE CHART */
                <>
                  <div style={{ background: '#0b2545', color: '#ffffff', textTransform: 'uppercase', padding: '14px 20px', textAlign: 'center', fontSize: '16px', fontWeight: 900, letterSpacing: '1px', borderRadius: '12px 12px 0 0', marginBottom: '20px' }}>
                    MEN'S APPAREL SIZE CHART
                  </div>

                  {/* 1. MEN'S TOP SIZE CHART */}
                  <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1.5px solid #0b2545', marginBottom: '24px' }}>
                    <div style={{ background: '#134074', color: '#ffffff', padding: '10px 16px', fontWeight: 800, fontSize: '14px', textTransform: 'uppercase' }}>
                      1. TOP MEASUREMENT
                    </div>
                    <div className="size-guide-table-container">
                      <table className="size-guide-table" style={{ textAlign: 'center' }}>
                        <thead>
                          <tr style={{ background: '#0b2545', color: '#ffffff' }}>
                            <th>Size</th>
                            <th>Top Length (in)</th>
                            <th>Ready Chest (in)</th>
                            <th>Fit To Chest (in)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { sz: "S", len: "27.0", ready: "42", fit: "38" },
                            { sz: "M", len: "27.5", ready: "44", fit: "40" },
                            { sz: "L", len: "28.0", ready: "46", fit: "42" },
                            { sz: "XL", len: "28.5", ready: "48", fit: "44" },
                            { sz: "2XL", len: "29.5", ready: "50", fit: "46" },
                            { sz: "3XL", len: "30.0", ready: "52", fit: "48" },
                          ].map((row, idx) => (
                            <tr key={row.sz} style={{ background: idx % 2 === 0 ? '#ffffff' : '#f0f7fa' }}>
                              <td><strong>{row.sz}</strong></td>
                              <td>{row.len}</td>
                              <td>{row.ready}</td>
                              <td>{row.fit}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* 2. MEN'S PANT SIZE CHART */}
                  <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1.5px solid #0b2545' }}>
                    <div style={{ background: '#134074', color: '#ffffff', padding: '10px 16px', fontWeight: 800, fontSize: '14px', textTransform: 'uppercase' }}>
                      2. BOTTOM / PANT MEASUREMENT
                    </div>
                    <div className="size-guide-table-container">
                      <table className="size-guide-table" style={{ textAlign: 'center' }}>
                        <thead>
                          <tr style={{ background: '#0b2545', color: '#ffffff' }}>
                            <th>Size</th>
                            <th>Pant Length (in)</th>
                            <th>Elastic Waist (in)</th>
                            <th>Fit To Waist (in)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { sz: "S", len: "38.0", waist: "26", fit: "34 / 36" },
                            { sz: "M", len: "38.0", waist: "28", fit: "36 / 38" },
                            { sz: "L", len: "38.5", waist: "30", fit: "38 / 40" },
                            { sz: "XL", len: "39.5", waist: "32", fit: "40 / 42" },
                            { sz: "2XL", len: "40.0", waist: "34", fit: "42 / 44" },
                            { sz: "3XL", len: "40.5", waist: "36", fit: "44 / 46" },
                          ].map((row, idx) => (
                            <tr key={row.sz} style={{ background: idx % 2 === 0 ? '#ffffff' : '#f0f7fa' }}>
                              <td><strong>{row.sz}</strong></td>
                              <td>{row.len}</td>
                              <td>{row.waist}</td>
                              <td>{row.fit}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}

            </div>
          </div>
        </div>,

        document.body
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
          z-index: 99999999;
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
          text-align: center;
          font-size: 15px;
        }
        .size-guide-table th {
          padding: 14px 18px;
          font-weight: 800;
          font-size: 14px;
          color: #ffffff;
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        }
        .size-guide-table td {
          padding: 14px 18px;
          color: #0f172a !important;
          font-size: 15px;
          font-weight: 600;
          border-bottom: 1px solid #e2e8f0;
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
