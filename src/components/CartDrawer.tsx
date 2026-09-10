import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useApp } from "@/context/AppContext";
import { fmt } from "@/lib/data";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getImagesForColor } from "@/lib/productUtils";
import { EmbroideryModal } from "@/components/embroidery/EmbroideryModal";
import { API_BASE } from "@/lib/api";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { cart, updateCartQty, removeFromCart, storeSettings, products, addToCart, appliedPromo, setAppliedPromo, toast } = useApp();
  const router = useRouter();
  const [upsellSizes, setUpsellSizes] = useState<Record<number, string>>({});
  const [upsellColorIdxs, setUpsellColorIdxs] = useState<Record<number, number>>({});
  const [lightboxGallery, setLightboxGallery] = useState<{ imgs: string[]; activeIdx: number } | null>(null);
  
  // Promo Code State
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const [activePromos, setActivePromos] = useState<any[]>([]);

  // Fetch active promo codes created in admin
  useEffect(() => {
    if (open) {
      fetch(`${API_BASE}/promos/public/active`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setActivePromos(data.filter((p: any) => p.active !== false));
          }
        })
        .catch(() => {});
    }
  }, [open]);

  // Essential Embroidery Modal State
  const [essentialEmbroideryModal, setEssentialEmbroideryModal] = useState<{ prod: any; colorIdx: number; size: string } | null>(null);

  const sub = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const totalQty = cart.reduce((a, b) => a + b.qty, 0);

  // Dynamic Free Shipping Calculation
  const promoUntilStr = storeSettings?.SHIPPING_PROMO_FREE_UNTIL;
  const isPromoActive = promoUntilStr ? new Date() < new Date(`${promoUntilStr}T23:59:59`) : false;
  const baseFee = Number(storeSettings?.SHIPPING_BASE_FEE);
  const isBaseFeeZero = !isNaN(baseFee) && baseFee === 0;
  const isGlobalFreeShip = isPromoActive || isBaseFeeZero;

  const freeThreshold = Number(storeSettings?.SHIPPING_FREE_THRESHOLD) || 999;
  const remForFreeShip = isGlobalFreeShip ? 0 : Math.max(0, freeThreshold - sub);
  const isFreeShipUnlocked = isGlobalFreeShip || remForFreeShip === 0;
  const freeShipPercent = Math.min(100, Math.round((sub / freeThreshold) * 100));

  // Multi-Item Volume Discount Calculation (1 item: 0%, 2: 5%, 3-4: 10%, 5+: 15%)
  const volumeDiscountRate = totalQty === 2 ? 0.05 : (totalQty === 3 || totalQty === 4) ? 0.10 : totalQty >= 5 ? 0.15 : 0;
  const volumeDiscountPercent = Math.round(volumeDiscountRate * 100);
  const volumeDiscountAmount = Math.round(sub * volumeDiscountRate);

  // Net Subtotal after Volume Discount (prevents loss from double-discounting)
  const netSubtotalAfterVolume = Math.max(0, sub - volumeDiscountAmount);

  // Applied Promo Discount (calculated on Net Subtotal after Volume Discount)
  const promoDiscountAmount = appliedPromo
    ? Math.min(
        netSubtotalAfterVolume,
        Math.round(
          appliedPromo.discountType === "PERCENTAGE" || (appliedPromo.discountValue && appliedPromo.discountValue <= 100 && (!appliedPromo.discountAmount || appliedPromo.discountAmount === 0))
            ? (netSubtotalAfterVolume * (appliedPromo.discountValue || 10)) / 100
            : (appliedPromo.discountAmount || 0)
        )
      )
    : 0;

  const grandTotalAfterDiscount = Math.max(0, netSubtotalAfterVolume - promoDiscountAmount);

  // Validate Promo Code against Net Subtotal after Volume Discount
  const handleApplyPromoCode = async (codeToApply: string) => {
    const cleanCode = codeToApply.trim().toUpperCase();
    if (!cleanCode) return;
    setPromoLoading(true);
    try {
      const res = await fetch(`${API_BASE}/promos/validate?code=${encodeURIComponent(cleanCode)}&total=${netSubtotalAfterVolume}`);
      const data = await res.json();
      if (data.valid && Number(data.discountAmount) > 0) {
        // Calculate promo discount against net subtotal after volume discount
        const calculatedDiscount = data.discountType === "PERCENTAGE"
          ? Math.round((netSubtotalAfterVolume * Number(data.discountValue || 10)) / 100)
          : Math.min(netSubtotalAfterVolume, Number(data.discountAmount));

        setAppliedPromo({
          code: cleanCode,
          discountAmount: calculatedDiscount,
          discountValue: data.discountValue,
          discountType: data.discountType,
          message: data.message || `Coupon ${cleanCode} applied!`,
        });
        toast(`🎉 Coupon ${cleanCode} applied! Saved ${fmt(calculatedDiscount)}`, "ok");
        setPromoCodeInput("");
      } else if (data.valid && Number(data.discountAmount) === 0) {
        toast(`Coupon ${cleanCode} is valid but subtotal is under minimum requirement.`, "bad");
      } else {
        toast(data.message || "Invalid promo code", "bad");
      }
    } catch {
      toast("Could not validate promo code", "bad");
    } finally {
      setPromoLoading(false);
    }
  };

  const handleCheckout = () => {
    onClose();
    router.push("/checkout");
  };

  // Gender-matched curated upsell items (max 4 items, excluding products already in cart)
  const cartProductIds = new Set(cart.map((i) => i.id));
  const cartCatStr = cart.map((i) => (i.name + " " + (i.type || "")).toLowerCase()).join(" ");
  const isCartWomen = cartCatStr.includes("women");
  const isCartMen = cartCatStr.includes("men") && !isCartWomen;

  const genderCandidates = products.filter((p) => {
    if (cartProductIds.has(p.id)) return false;
    const pCatStr = (p.name + " " + (p.type || "") + " " + String((p as any).cat || "")).toLowerCase();
    const isPWomen = pCatStr.includes("women");
    const isPMen = pCatStr.includes("men") && !isPWomen;

    if (isCartWomen) return isPWomen || (!isPMen);
    if (isCartMen) return isPMen || (!isPWomen);
    return true;
  });

  const upsellItems = (genderCandidates.length > 0 ? genderCandidates : products.filter((p) => !cartProductIds.has(p.id))).slice(0, 4);

  return (
    <>
      <div className={`drw-bg${open ? " open" : ""}`} onClick={onClose} />
      <div className={`cart-drw${open ? " open" : ""}`}>
        {/* Drawer Header */}
        <div className="drw-hd">
          <div>
            <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", margin: 0 }}>Shopping Bag</h3>
            <div className="drw-hd-s" style={{ fontSize: "13px", color: "#64748b", marginTop: "2px" }}>
              {totalQty} {totalQty === 1 ? "item" : "items"} in your bag
            </div>
          </div>
          <button className="drw-x" onClick={onClose} aria-label="Close Shopping Bag">
            ✕
          </button>
        </div>

        {/* Status / Shipping Banner */}
        {cart.length > 0 && (
          <div className="cart-status-bar">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", width: "100%" }}>
              <div className="status-msg" style={{ fontSize: "11.5px", fontWeight: 700, color: "#1e1b4b" }}>
                <span>{totalQty >= 2 ? "🔥" : "🎁"}</span>
                <span>
                  {totalQty === 1 && "Add 1 more item for 5% OFF!"}
                  {totalQty === 2 && "5% Multi-Item Discount Applied! (Add 1 more for 10% OFF)"}
                  {(totalQty === 3 || totalQty === 4) && `10% Discount Applied! (Add ${5 - totalQty} more for 15% OFF)`}
                  {totalQty >= 5 && "MAX 15% Savings Applied!"}
                </span>
              </div>
              {volumeDiscountAmount > 0 && (
                <span className="badge-disc" style={{ flexShrink: 0, padding: "2px 6px", fontSize: "10.5px" }}>
                  -{fmt(volumeDiscountAmount)}
                </span>
              )}
            </div>

            {/* Dynamic Free Shipping Progress Bar */}
            <div style={{ marginTop: "4px", width: "100%" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10.5px", fontWeight: 700, color: "#475569", marginBottom: "2px" }}>
                <span>{isFreeShipUnlocked ? "🎉 FREE Express Shipping Unlocked!" : `Add ${fmt(remForFreeShip)} more for FREE Shipping! 🚚`}</span>
                <span>{freeShipPercent}%</span>
              </div>
              <div style={{ height: "4px", width: "100%", background: "rgba(30, 27, 75, 0.08)", borderRadius: "10px", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${freeShipPercent}%`, background: "linear-gradient(90deg, #1e1b4b, #3b82f6)", transition: "width 0.4s ease" }} />
              </div>
            </div>
          </div>
        )}

        {/* Drawer Body */}
        <div className="drw-body">
          {cart.length === 0 ? (
            <div className="empty-cart-state">
              <div className="empty-cart-icon">🛍️</div>
              <div className="empty-cart-title">Your bag is empty</div>
              <div className="empty-cart-sub">
                Explore our premium medical apparel collection and start adding items.
              </div>
              <button className="btn-p empty-cart-btn" onClick={onClose}>
                Continue Shopping
              </button>
            </div>
          ) : (
            <>
              {cart.map((item, idx) => {
                const colorIdx = item.clrs?.indexOf(item.col) ?? 0;
                const images = getImagesForColor(item, colorIdx !== -1 ? colorIdx : 0);
                const thumb = images[0] || item.imgs[0];

                return (
                  <div key={item.k} className="cart-item-row">
                    <div className="cart-item-thumb">
                      {thumb ? (
                        <Image
                          src={thumb.split("?")[0]}
                          alt={item.name}
                          fill
                          style={{ objectFit: "cover" }}
                          sizes="80px"
                        />
                      ) : (
                        <div className="cart-item-emoji">
                          {item.emo || "📦"}
                        </div>
                      )}
                    </div>

                    <div className="cart-item-details">
                      <div>
                        <div className="cart-item-name">{item.name}</div>
                        <div className="cart-item-meta">
                          <span className="meta-tag">
                            <span className="meta-lbl">SIZE:</span> {item.size}
                          </span>
                          <span className="meta-sep">|</span>
                          <span className="meta-tag">
                            <span className="meta-lbl">COLOR:</span>
                            <span
                              className="color-swatch-dot"
                              style={{ background: item.col }}
                            />
                            {item.colNm}
                          </span>
                        </div>

                        {item.embroidery && (
                          <div className="mt-1.5 p-2 bg-[#F7F1FF] border border-[#E0D8F3] rounded-lg text-[11px] text-purple-900 leading-tight">
                            <div className="font-bold text-[#462D8C] flex justify-between items-center mb-0.5">
                              <span>✨ Custom Embroidery ({item.embroidery.selectedOption})</span>
                              <span>+₹{item.embroidery.totalEmbroideryPrice}</span>
                            </div>
                            {item.embroidery.line1 && <div><strong>Line 1:</strong> {item.embroidery.line1}</div>}
                            {item.embroidery.line2 && <div><strong>Line 2:</strong> {item.embroidery.line2}</div>}
                            <div><strong>Style:</strong> {item.embroidery.fontStyle} | {item.embroidery.textColor}</div>
                          </div>
                        )}
                      </div>

                      <div className="cart-item-bottom">
                        <div className="qty-ctl">
                          <button
                            className="qb"
                            onClick={() => updateCartQty(idx, -1)}
                            aria-label="Decrease quantity"
                          >
                            –
                          </button>
                          <span className="qv">{item.qty}</span>
                          <button
                            className="qb"
                            onClick={() => updateCartQty(idx, 1)}
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                        <div className="cart-item-price-wrap">
                          <div className="cart-item-price">{fmt(item.price * item.qty)}</div>
                          <button
                            className="ci-del"
                            onClick={() => removeFromCart(idx)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Redesigned 1-Click Essentials Section */}
              {upsellItems.length > 0 && (
                <div className="upsell-container">
                  <div className="upsell-header-row">
                    <span className="upsell-title">⚡ Frequently Added Essentials</span>
                    <span className="upsell-subtitle">Curated for your order</span>
                  </div>

                  <div className="upsell-list">
                    {upsellItems.map((prod) => {
                      const activeColorIdx = upsellColorIdxs[prod.id] || 0;
                      const activeSize = upsellSizes[prod.id] || prod.sizes?.[0] || "M";
                      const colorImages = getImagesForColor(prod, activeColorIdx);
                      const thumbImg = colorImages[0] || prod.imgs[0];

                      return (
                        <div key={prod.id} className="upsell-card">
                          {/* Top: Product Image + Title & Price */}
                          <div className="upsell-top-row">
                            <div
                              className="upsell-thumb"
                              onClick={() => {
                                const imgsToView =
                                  colorImages.length > 0
                                    ? colorImages.map((img) => img.split("?")[0])
                                    : [thumbImg.split("?")[0]];
                                setLightboxGallery({ imgs: imgsToView, activeIdx: 0 });
                              }}
                              title="Click to zoom image"
                            >
                              {thumbImg ? (
                                <img
                                  src={thumbImg.split("?")[0]}
                                  alt={prod.name}
                                  className="upsell-thumb-img"
                                />
                              ) : (
                                <div className="upsell-thumb-emoji">📦</div>
                              )}
                              <span className="upsell-zoom-icon">🔍</span>
                            </div>

                            <div className="upsell-meta">
                              <div className="upsell-name">{prod.name}</div>
                              <div className="upsell-prices">
                                <span className="upsell-price">{fmt(prod.price)}</span>
                                {((prod as any).mrp || prod.origPrice) &&
                                  ((prod as any).mrp || prod.origPrice) > prod.price && (
                                    <span className="upsell-mrp">
                                      {fmt((prod as any).mrp || prod.origPrice)}
                                    </span>
                                  )}
                              </div>
                            </div>
                          </div>

                          {/* Bottom: Options Select & Add to Bag Button */}
                          <div className="upsell-action-row">
                            <div className="upsell-selects">
                              {prod.clrs && prod.clrs.length > 0 && (
                                <select
                                  aria-label="Select color"
                                  value={activeColorIdx}
                                  onChange={(e) =>
                                    setUpsellColorIdxs({
                                      ...upsellColorIdxs,
                                      [prod.id]: Number(e.target.value),
                                    })
                                  }
                                  className="upsell-select color-select"
                                >
                                  {prod.clrs.map((clr, cIdx) => (
                                    <option key={cIdx} value={cIdx}>
                                      {prod.clrNms?.[cIdx] || `Color ${cIdx + 1}`}
                                    </option>
                                  ))}
                                </select>
                              )}

                              <select
                                aria-label="Select size"
                                value={activeSize}
                                onChange={(e) =>
                                  setUpsellSizes({
                                    ...upsellSizes,
                                    [prod.id]: e.target.value,
                                  })
                                }
                                className="upsell-select size-select"
                              >
                                {(prod.sizes && prod.sizes.length > 0
                                  ? prod.sizes
                                  : ["S", "M", "L", "XL"]
                                ).map((sz) => (
                                  <option key={sz} value={sz}>
                                    Size {sz}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {Boolean(prod.embroideryEnabled) ? (
                              <div className="upsell-btn-duo">
                                <button
                                  type="button"
                                  onClick={() => addToCart(prod, activeColorIdx, activeSize, 1)}
                                  className="upsell-add-btn std-btn"
                                >
                                  + Add Standard
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEssentialEmbroideryModal({ prod, colorIdx: activeColorIdx, size: activeSize })}
                                  className="upsell-emb-btn"
                                >
                                  ✨ Add + Embroidery (+₹99)
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => addToCart(prod, activeColorIdx, activeSize, 1)}
                                className="upsell-add-btn full-btn"
                              >
                                + Add to Bag
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Drawer Footer */}
        {cart.length > 0 && (
          <div className="drw-ft">
            {/* 1-Tap Coupon Codes & Offers Section (Only Admin Created Active Coupons) */}
            <div style={{ margin: "2px 0 8px 0", padding: "8px 10px", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#1e1b4b", marginBottom: "6px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span>🎟️ Coupon & Offers</span>
                {appliedPromo && (
                  <span style={{ fontSize: "10.5px", color: "#047857", fontWeight: 700 }}>✓ Applied</span>
                )}
              </div>

              {appliedPromo ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 10px", backgroundColor: "#ecfdf5", border: "1px solid #a7f3d0", borderRadius: "6px" }}>
                  <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#047857" }}>
                    🎉 {appliedPromo.code} Applied (-{fmt(promoDiscountAmount)})
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setAppliedPromo(null);
                      toast("Coupon removed", "");
                    }}
                    style={{ fontSize: "10.5px", color: "#ef4444", fontWeight: 700, background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <>
                  {/* Dynamic 1-Tap Coupon Chips (Admin Promos Only) */}
                  {activePromos.length > 0 ? (
                    <div style={{ display: "flex", gap: "5px", overflowX: "auto", paddingBottom: "4px", marginBottom: "6px" }}>
                      {activePromos.map((p) => {
                        const label = p.discountType === "PERCENTAGE"
                          ? `${p.code} (${p.discountValue}% OFF)`
                          : p.discountType === "FLAT"
                          ? `${p.code} (₹${p.discountValue} OFF)`
                          : p.code;
                        return (
                          <button
                            key={p.id || p.code}
                            type="button"
                            onClick={() => handleApplyPromoCode(p.code)}
                            style={{ flexShrink: 0, padding: "4px 8px", background: "#ffffff", border: "1px dashed #6366f1", borderRadius: "5px", fontSize: "10.5px", fontWeight: 700, color: "#4338ca", cursor: "pointer" }}
                          >
                            🏷️ {label}
                          </button>
                        );
                      })}
                    </div>
                  ) : null}

                  {/* Manual Input */}
                  <div style={{ display: "flex", gap: "6px" }}>
                    <input
                      type="text"
                      placeholder="ENTER PROMO CODE"
                      value={promoCodeInput}
                      onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                      style={{ flex: 1, padding: "6px 8px", fontSize: "11.5px", border: "1px solid #cbd5e1", borderRadius: "5px", textTransform: "uppercase", outline: "none" }}
                    />
                    <button
                      type="button"
                      onClick={() => handleApplyPromoCode(promoCodeInput)}
                      disabled={promoLoading || !promoCodeInput.trim()}
                      style={{ padding: "6px 12px", backgroundColor: "#1e1b4b", color: "#ffffff", fontSize: "11.5px", fontWeight: 700, borderRadius: "5px", border: "none", cursor: "pointer", opacity: promoCodeInput.trim() ? 1 : 0.6 }}
                    >
                      {promoLoading ? "..." : "APPLY"}
                    </button>
                  </div>
                </>
              )}
            </div>

            <div className="sum-r">
              <span>Subtotal</span>
              <span style={{ fontWeight: 700 }}>{fmt(sub)}</span>
            </div>
            {volumeDiscountAmount > 0 && (
              <div className="sum-r savings-row">
                <span>Multi-Item Savings ({volumeDiscountPercent}%)</span>
                <span style={{ fontWeight: 800 }}>-{fmt(volumeDiscountAmount)}</span>
              </div>
            )}
            {promoDiscountAmount > 0 && (
              <div className="sum-r savings-row" style={{ color: "#047857" }}>
                <span>Coupon Discount ({appliedPromo?.code})</span>
                <span style={{ fontWeight: 800 }}>-{fmt(promoDiscountAmount)}</span>
              </div>
            )}
            <div className="sum-r">
              <span>Shipping</span>
              <span
                style={{
                  fontSize: isFreeShipUnlocked ? "13px" : "12px",
                  fontWeight: 700,
                  color: isFreeShipUnlocked ? "#16a34a" : "#475569",
                }}
              >
                {isFreeShipUnlocked ? "COMPLIMENTARY FREE" : "Calculated at checkout"}
              </span>
            </div>
            <div className="sum-r tot">
              <span>Grand Total</span>
              <span>{fmt(grandTotalAfterDiscount)}</span>
            </div>
            <button className="co-cta" onClick={handleCheckout}>
              Checkout Now →
            </button>
            <div className="ssl-badge">
              🔒 256-Bit SSL Encrypted Checkout
            </div>
          </div>
        )}
      </div>

      {/* ESSENTIAL ITEM EMBROIDERY MODAL */}
      {essentialEmbroideryModal && typeof document !== "undefined" && createPortal(
        <EmbroideryModal
          isOpen={true}
          onClose={() => setEssentialEmbroideryModal(null)}
          onSaveCustomization={(customization) => {
            addToCart(
              essentialEmbroideryModal.prod,
              essentialEmbroideryModal.colorIdx,
              essentialEmbroideryModal.size,
              1,
              customization
            );
            setEssentialEmbroideryModal(null);
            toast(`Added ${essentialEmbroideryModal.prod.name} with Custom Embroidery!`, "ok");
          }}
          baseScrubImage={
            getImagesForColor(essentialEmbroideryModal.prod, essentialEmbroideryModal.colorIdx)[0] ||
            essentialEmbroideryModal.prod.imgs?.[0]
          }
          embroideryPreviewImage={(() => {
            try {
              const prod = essentialEmbroideryModal.prod;
              const colorIdx = essentialEmbroideryModal.colorIdx;
              const config = JSON.parse(prod?.embroideryConfig || '{}');
              const colorName = prod?.clrNms?.[colorIdx] || '';
              const colorHex = prod?.clrs?.[colorIdx] || '';
              const colorImages = getImagesForColor(prod, colorIdx);
              const colorImagesFirst = colorImages && colorImages[0] ? colorImages[0] : '';

              if (config?.colorPreviewImages) {
                if (colorName && config.colorPreviewImages[colorName]) {
                  return config.colorPreviewImages[colorName];
                }
                if (colorHex && config.colorPreviewImages[colorHex]) {
                  return config.colorPreviewImages[colorHex];
                }
                const foundKey = Object.keys(config.colorPreviewImages).find(k => {
                  const lk = k.trim().toLowerCase();
                  return (colorName && lk === colorName.trim().toLowerCase()) ||
                         (colorHex && lk === colorHex.trim().toLowerCase());
                });
                if (foundKey && config.colorPreviewImages[foundKey]) {
                  return config.colorPreviewImages[foundKey];
                }
              }
              if (config?.previewImage) return config.previewImage;
              return colorImagesFirst || prod?.imgs?.[0] || undefined;
            } catch {
              return getImagesForColor(essentialEmbroideryModal.prod, essentialEmbroideryModal.colorIdx)[0] ||
                     essentialEmbroideryModal.prod.imgs?.[0] || undefined;
            }
          })()}
          customPrices={(() => {
            try {
              return JSON.parse(essentialEmbroideryModal.prod?.embroideryConfig || '{}')?.prices;
            } catch {
              return undefined;
            }
          })()}
          selectedColorName={
            essentialEmbroideryModal.prod.clrNms?.[essentialEmbroideryModal.colorIdx] ||
            essentialEmbroideryModal.prod.clrs?.[essentialEmbroideryModal.colorIdx] ||
            "Navy Blue"
          }
        />,
        document.body
      )}

      {/* LIGHTBOX GALLERY MODAL */}
      {lightboxGallery &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="lightbox-overlay"
            onClick={() => setLightboxGallery(null)}
          >
            <button
              type="button"
              onClick={() => setLightboxGallery(null)}
              className="lightbox-close"
              aria-label="Close Preview"
            >
              ✕
            </button>

            {lightboxGallery.imgs.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxGallery((prev) =>
                    prev
                      ? {
                          ...prev,
                          activeIdx:
                            (prev.activeIdx - 1 + prev.imgs.length) % prev.imgs.length,
                        }
                      : null
                  );
                }}
                className="lightbox-nav lightbox-prev"
                aria-label="Previous image"
              >
                ‹
              </button>
            )}

            <div
              className="lightbox-img-wrap"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={lightboxGallery.imgs[lightboxGallery.activeIdx]}
                alt="Product View"
                className="lightbox-img"
              />
            </div>

            {lightboxGallery.imgs.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxGallery((prev) =>
                    prev
                      ? {
                          ...prev,
                          activeIdx: (prev.activeIdx + 1) % prev.imgs.length,
                        }
                      : null
                  );
                }}
                className="lightbox-nav lightbox-next"
                aria-label="Next image"
              >
                ›
              </button>
            )}
          </div>,
          document.body
        )}

      <style jsx>{`
        .cart-status-bar {
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          padding: 6px 14px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          font-size: 11.5px;
          font-weight: 700;
        }
        .status-msg {
          display: flex;
          align-items: center;
          gap: 6px;
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .status-icon {
          font-size: 13px;
        }
        .status-text {
          color: #334155;
        }
        .status-badges {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-shrink: 0;
        }
        .badge-disc {
          background: #dcfce7;
          color: #15803d;
          padding: 2px 8px;
          border-radius: 10px;
          font-size: 10.5px;
          font-weight: 800;
        }
        .badge-free {
          background: #f0fdf4;
          color: #166534;
          border: 1px solid #bbf7d0;
          padding: 2px 8px;
          border-radius: 10px;
          font-size: 10px;
          font-weight: 800;
        }

        .drw-body {
          flex: 1;
          overflow-y: auto;
          padding: 10px 16px;
        }
        .empty-cart-state {
          text-align: center;
          padding: 60px 20px;
        }
        .empty-cart-icon {
          font-size: 56px;
          margin-bottom: 16px;
          opacity: 0.8;
        }
        .empty-cart-title {
          font-size: 18px;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 6px;
        }
        .empty-cart-sub {
          font-size: 13px;
          color: #64748b;
          margin-bottom: 24px;
          line-height: 1.5;
        }
        .empty-cart-btn {
          width: 100%;
          padding: 12px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 700;
        }

        .cart-item-row {
          display: flex;
          gap: 12px;
          padding: 10px 0;
          border-bottom: 1px solid #f1f5f9;
        }
        .cart-item-thumb {
          width: 68px;
          height: 86px;
          position: relative;
          border-radius: 8px;
          overflow: hidden;
          background: #f8fafc;
          flex-shrink: 0;
          border: 1px solid #e2e8f0;
        }
        .cart-item-emoji {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
        }
        .cart-item-details {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-width: 0;
        }
        .cart-item-name {
          font-size: 14px;
          font-weight: 700;
          color: #0f172a;
          line-height: 1.3;
          margin-bottom: 4px;
        }
        .cart-item-meta {
          font-size: 12px;
          color: #64748b;
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }
        .meta-tag {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .meta-lbl {
          font-weight: 700;
          color: #94a3b8;
          font-size: 10.5px;
        }
        .meta-sep {
          color: #cbd5e1;
        }
        .color-swatch-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          border: 1px solid #cbd5e1;
        }
        .cart-item-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 10px;
          gap: 10px;
        }
        .qty-ctl {
          background: #f8fafc;
          border: 1.5px solid #e2e8f0;
          border-radius: 8px;
          padding: 2px;
          display: flex;
          align-items: center;
        }
        .qb {
          width: 28px;
          height: 28px;
          font-size: 14px;
          border: none;
          background: transparent;
          cursor: pointer;
          font-weight: 700;
          color: #0f172a;
        }
        .qv {
          font-size: 13px;
          min-width: 24px;
          font-weight: 800;
          text-align: center;
          color: #0f172a;
        }
        .cart-item-price-wrap {
          text-align: right;
        }
        .cart-item-price {
          font-size: 14px;
          font-weight: 800;
          color: #0f172a;
        }
        .ci-del {
          font-size: 11px;
          color: #94a3b8;
          background: none;
          border: none;
          padding: 0;
          text-decoration: underline;
          margin-top: 2px;
          cursor: pointer;
        }
        .ci-del:hover {
          color: #ef4444;
        }

        /* NEW E-COMMERCE UPSELL DESIGN */
        .upsell-container {
          margin-top: 20px;
          padding: 16px;
          background: #f8fafc;
          border-radius: 16px;
          border: 1.5px solid #e2e8f0;
        }
        .upsell-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 14px;
        }
        .upsell-title {
          font-size: 12px;
          font-weight: 800;
          color: #0f172a;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .upsell-subtitle {
          font-size: 11px;
          color: #64748b;
          font-weight: 500;
        }
        .upsell-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .upsell-card {
          background: #ffffff;
          padding: 14px;
          border-radius: 12px;
          border: 1.5px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          gap: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
          transition: border-color 0.2s;
        }
        .upsell-card:hover {
          border-color: #008080;
        }
        .upsell-top-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .upsell-thumb {
          width: 52px;
          height: 68px;
          border-radius: 8px;
          overflow: hidden;
          background: #f1f5f9;
          flex-shrink: 0;
          cursor: pointer;
          position: relative;
          border: 1px solid #e2e8f0;
        }
        .upsell-thumb-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .upsell-thumb-emoji {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .upsell-zoom-icon {
          position: absolute;
          bottom: 2px;
          right: 2px;
          background: rgba(15, 23, 42, 0.7);
          color: #ffffff;
          font-size: 9px;
          padding: 1px 3px;
          border-radius: 3px;
        }
        .upsell-meta {
          flex: 1;
          min-width: 0;
        }
        .upsell-name {
          font-size: 13.5px;
          font-weight: 700;
          color: #0f172a;
          line-height: 1.35;
          margin-bottom: 4px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .upsell-prices {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .upsell-price {
          font-size: 14px;
          font-weight: 800;
          color: #008080;
        }
        .upsell-mrp {
          font-size: 12px;
          text-decoration: line-through;
          color: #94a3b8;
        }
        .upsell-action-row {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding-top: 10px;
          border-top: 1px solid #f1f5f9;
        }
        .upsell-selects {
          display: flex;
          align-items: center;
          gap: 6px;
          width: 100%;
        }
        .upsell-select {
          padding: 6px 8px;
          border-radius: 6px;
          border: 1.5px solid #cbd5e1;
          font-size: 11.5px;
          font-weight: 700;
          background: #ffffff;
          color: #0f172a;
          outline: none;
          cursor: pointer;
        }
        .color-select {
          flex: 1;
          min-width: 0;
        }
        .size-select {
          flex: 0 0 auto;
        }
        .upsell-btn-duo {
          display: flex;
          gap: 6px;
          width: 100%;
        }
        .upsell-add-btn {
          padding: 8px 12px;
          background: #008080;
          color: #ffffff;
          border: none;
          border-radius: 6px;
          font-size: 11.5px;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s;
          box-shadow: 0 2px 6px rgba(0, 128, 128, 0.2);
          text-align: center;
        }
        .upsell-add-btn:hover {
          background: #0d9488;
        }
        .std-btn {
          flex: 1;
        }
        .full-btn {
          width: 100%;
        }
        .upsell-emb-btn {
          flex: 1.2;
          background-color: #1e1b4b;
          color: #ffffff;
          font-size: 11px;
          font-weight: 700;
          padding: 8px 6px;
          border-radius: 6px;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 3px;
          white-space: nowrap;
          transition: opacity 0.2s;
        }
        .upsell-emb-btn:hover {
          opacity: 0.9;
        }

        /* Footer */
        .savings-row {
          color: #16a34a;
        }
        .ssl-badge {
          text-align: center;
          font-size: 11px;
          color: #64748b;
          margin-top: 10px;
        }

        /* Lightbox */
        .lightbox-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.9);
          backdrop-filter: blur(8px);
          z-index: 999999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .lightbox-close {
          position: absolute;
          top: 24px;
          right: 24px;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.4);
          font-size: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 100;
        }
        .lightbox-nav {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.25);
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.4);
          font-size: 24px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 100;
        }
        .lightbox-prev {
          left: 24px;
        }
        .lightbox-next {
          right: 24px;
        }
        .lightbox-img-wrap {
          max-width: 640px;
          max-height: 82vh;
          width: 90%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }
        .lightbox-img {
          max-width: 100%;
          max-height: 80vh;
          object-fit: contain;
          border-radius: 16px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }

        @media (max-width: 480px) {
          .upsell-action-row {
            flex-direction: column;
            align-items: stretch;
          }
          .upsell-add-btn {
            width: 100%;
            text-align: center;
          }
        }
      `}</style>
    </>
  );
}
