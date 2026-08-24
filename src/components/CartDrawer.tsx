"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import { useApp } from "@/context/AppContext";
import { fmt } from "@/lib/data";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getImagesForColor } from "@/lib/productUtils";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { cart, updateCartQty, removeFromCart, storeSettings, products, addToCart } = useApp();
  const router = useRouter();
  const [upsellSizes, setUpsellSizes] = useState<Record<number, string>>({});
  const [upsellColorIdxs, setUpsellColorIdxs] = useState<Record<number, number>>({});
  const [lightboxGallery, setLightboxGallery] = useState<{ imgs: string[]; activeIdx: number } | null>(null);

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

  // Multi-Item Volume Discount Calculation (1 item: 0%, 2: 5%, 3-4: 10%, 5+: 15%)
  const volumeDiscountRate = totalQty === 2 ? 0.05 : (totalQty === 3 || totalQty === 4) ? 0.10 : totalQty >= 5 ? 0.15 : 0;
  const volumeDiscountPercent = Math.round(volumeDiscountRate * 100);
  const volumeDiscountAmount = Math.round(sub * volumeDiscountRate);
  const grandTotalAfterDiscount = Math.max(0, sub - volumeDiscountAmount);

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
            <div className="status-msg">
              <span className="status-icon">{totalQty >= 2 ? "🎉" : "🎁"}</span>
              <span className="status-text">
                {totalQty === 1 && "Add 1 more item for 5% OFF!"}
                {totalQty === 2 && "5% Multi-Item Discount Applied! (Add 1 more for 10% OFF)"}
                {(totalQty === 3 || totalQty === 4) && `10% Discount Applied! (Add ${5 - totalQty} more for 15% OFF)`}
                {totalQty >= 5 && "🔥 MAX 15% Multi-Item Savings Applied!"}
              </span>
            </div>

            <div className="status-badges">
              {volumeDiscountAmount > 0 && (
                <span className="badge-disc">
                  -{fmt(volumeDiscountAmount)}
                </span>
              )}
              <span className="badge-free">
                FREE SHIP
              </span>
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

              {/* 1-Click Upsell Essentials */}
              {upsellItems.length > 0 && (
                <div className="upsell-container">
                  <div className="upsell-title">⚡ Frequently Added Essentials</div>
                  <div className="upsell-list">
                    {upsellItems.map((prod) => {
                      const activeColorIdx = upsellColorIdxs[prod.id] || 0;
                      const activeSize = upsellSizes[prod.id] || prod.sizes?.[0] || "M";
                      const colorImages = getImagesForColor(prod, activeColorIdx);
                      const thumbImg = colorImages[0] || prod.imgs[0];

                      return (
                        <div key={prod.id} className="upsell-card">
                          <div className="upsell-info-wrap">
                            <div
                              className="upsell-thumb"
                              onClick={() => {
                                const imgsToView =
                                  colorImages.length > 0
                                    ? colorImages.map((img) => img.split("?")[0])
                                    : [thumbImg.split("?")[0]];
                                setLightboxGallery({ imgs: imgsToView, activeIdx: 0 });
                              }}
                              title="Click to preview color photos"
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
                              <span className="upsell-zoom-badge">🔍</span>
                            </div>

                            <div className="upsell-text">
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

                          <div className="upsell-controls">
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
                                className="upsell-select"
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
                                  {sz}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              onClick={() => addToCart(prod, activeColorIdx, activeSize, 1)}
                              className="upsell-add-btn"
                            >
                              + Add
                            </button>
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
          padding: 10px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          font-size: 12px;
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
          font-size: 14px;
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
          font-size: 11px;
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
          padding: 16px 20px;
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
          gap: 14px;
          padding: 16px 0;
          border-bottom: 1px solid #f1f5f9;
        }
        .cart-item-thumb {
          width: 76px;
          height: 96px;
          position: relative;
          border-radius: 10px;
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

        /* Upsells */
        .upsell-container {
          margin-top: 20px;
          padding: 14px;
          background: #f8fafc;
          border-radius: 14px;
          border: 1px solid #e2e8f0;
        }
        .upsell-title {
          font-size: 11.5px;
          font-weight: 800;
          color: #0f172a;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 10px;
        }
        .upsell-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .upsell-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #ffffff;
          padding: 10px 12px;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
          gap: 10px;
          flex-wrap: wrap;
        }
        .upsell-info-wrap {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
          flex: 1;
        }
        .upsell-thumb {
          width: 42px;
          height: 52px;
          border-radius: 6px;
          overflow: hidden;
          background: #f1f5f9;
          flex-shrink: 0;
          cursor: pointer;
          position: relative;
          border: 1px solid #cbd5e1;
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
        .upsell-zoom-badge {
          position: absolute;
          bottom: 2px;
          right: 2px;
          background: rgba(0,0,0,0.6);
          color: #ffffff;
          font-size: 8px;
          padding: 1px 2px;
          border-radius: 2px;
        }
        .upsell-text {
          min-width: 0;
          flex: 1;
        }
        .upsell-name {
          font-size: 13px;
          font-weight: 700;
          color: #0f172a;
          line-height: 1.25;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .upsell-prices {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 2px;
        }
        .upsell-price {
          font-size: 12px;
          font-weight: 800;
          color: #008080;
        }
        .upsell-mrp {
          font-size: 11px;
          text-decoration: line-through;
          color: #94a3b8;
        }
        .upsell-controls {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-shrink: 0;
        }
        .upsell-select {
          padding: 4px 6px;
          border-radius: 6px;
          border: 1.5px solid #cbd5e1;
          font-size: 11px;
          font-weight: 700;
          background: #ffffff;
          color: #0f172a;
          outline: none;
          cursor: pointer;
          max-width: 90px;
        }
        .size-select {
          max-width: 55px;
        }
        .upsell-add-btn {
          padding: 6px 12px;
          background: #f0fdf4;
          border: 1.5px solid #bbf7d0;
          color: #166534;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 800;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s;
        }
        .upsell-add-btn:hover {
          background: #166534;
          color: white;
          border-color: #166534;
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
          .upsell-card {
            flex-direction: column;
            align-items: stretch;
          }
          .upsell-controls {
            width: 100%;
            justify-content: space-between;
          }
          .upsell-select {
            flex: 1;
            max-width: none;
          }
          .size-select {
            flex: 0 0 60px;
          }
        }
      `}</style>
    </>
  );
}
