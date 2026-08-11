"use client";

import React from "react";
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

  const sub = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const totalQty = cart.reduce((a, b) => a + b.qty, 0);

  // Dynamic Free Shipping Calculation with Admin Promo Date Check
  const promoUntilStr = storeSettings?.SHIPPING_PROMO_FREE_UNTIL;
  const isPromoActive = promoUntilStr ? new Date() < new Date(`${promoUntilStr}T23:59:59`) : false;
  const baseFee = Number(storeSettings?.SHIPPING_BASE_FEE);
  const isBaseFeeZero = !isNaN(baseFee) && baseFee === 0;
  const isGlobalFreeShip = isPromoActive || isBaseFeeZero;

  const freeThreshold = Number(storeSettings?.SHIPPING_FREE_THRESHOLD) || 999;
  const remForFreeShip = isGlobalFreeShip ? 0 : Math.max(0, freeThreshold - sub);
  const shipProgress = isGlobalFreeShip ? 100 : Math.min(100, Math.round((sub / freeThreshold) * 100));
  const isFreeShipUnlocked = isGlobalFreeShip || remForFreeShip === 0;

  // Multi-Item Volume Discount Calculation (1 item: 0%, 2 items: 5%, 3+ items: 10%)
  const volumeDiscountRate = totalQty === 2 ? 0.05 : totalQty >= 3 ? 0.10 : 0;
  const volumeDiscountAmount = Math.round(sub * volumeDiscountRate);
  const grandTotalAfterDiscount = Math.max(0, sub - volumeDiscountAmount);

  const handleCheckout = () => {
    onClose();
    router.push("/checkout");
  };

  // Upsell candidates (products not already in cart)
  const cartProductIds = new Set(cart.map((i) => i.id));
  const upsellItems = products.filter((p) => !cartProductIds.has(p.id)).slice(0, 3);

  return (
    <>
      <div className={`drw-bg${open ? " open" : ""}`} onClick={onClose} />
      <div className={`cart-drw${open ? " open" : ""}`}>
        {/* Drawer Header */}
        <div className="drw-hd">
          <div>
            <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a" }}>Shopping Bag</h3>
            <div className="drw-hd-s" style={{ fontSize: "13px", color: "#64748b", marginTop: "2px" }}>
              {totalQty} {totalQty === 1 ? "item" : "items"} in your bag
            </div>
          </div>
          <button className="drw-x" onClick={onClose} style={{ fontSize: "20px", color: "#94a3b8" }}>
            ✕
          </button>
        </div>

        {/* Compact Combined Status Banner */}
        {cart.length > 0 && (
          <div style={{
            background: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            fontSize: '12px',
            fontWeight: 700
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
              <span style={{ fontSize: '14px' }}>{totalQty >= 2 ? '🎉' : '🎁'}</span>
              <span style={{ color: totalQty >= 3 ? '#15803d' : totalQty === 2 ? '#0284c7' : '#334155' }}>
                {totalQty === 1 && "Add 1 more item for 5% OFF!"}
                {totalQty === 2 && "5% Multi-Item Discount Applied! (Add 1 more for 10% OFF)"}
                {totalQty >= 3 && "MAX 10% Multi-Item Savings Applied!"}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
              {volumeDiscountAmount > 0 && (
                <span style={{ background: '#dcfce7', color: '#15803d', padding: '1px 6px', borderRadius: '10px', fontSize: '11px', fontWeight: 800 }}>
                  -{fmt(volumeDiscountAmount)}
                </span>
              )}
              <span style={{ background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', padding: '1px 6px', borderRadius: '10px', fontSize: '10px', fontWeight: 800 }}>
                FREE SHIP
              </span>
            </div>
          </div>
        )}

        {/* Drawer Body */}
        <div className="drw-body" style={{ padding: "0 20px" }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 20px" }}>
              <div style={{ fontSize: "64px", marginBottom: "20px", opacity: 0.8 }}>🛍️</div>
              <div style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", marginBottom: "8px" }}>
                Your bag is empty
              </div>
              <div style={{ fontSize: "14px", color: "#64748b", marginBottom: "28px" }}>
                Explore our premium medical apparel collection and start adding items.
              </div>
              <button
                className="btn-p"
                onClick={onClose}
                style={{ width: "100%", padding: "14px", borderRadius: "12px", fontSize: "14px", fontWeight: 700 }}
              >
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
                  <div
                    key={item.k}
                    style={{
                      display: "flex",
                      gap: "16px",
                      padding: "20px 0",
                      borderBottom: "1px solid #f1f5f9",
                    }}
                  >
                    <div
                      style={{
                        width: "80px",
                        height: "104px",
                        position: "relative",
                        borderRadius: "10px",
                        overflow: "hidden",
                        background: "#f8fafc",
                        flexShrink: 0,
                      }}
                    >
                      {thumb ? (
                        <Image src={thumb.split("?")[0]} alt={item.name} fill style={{ objectFit: "cover" }} sizes="80px" />
                      ) : (
                        <div
                          style={{
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "24px",
                          }}
                        >
                          {item.emo || "📦"}
                        </div>
                      )}
                    </div>

                    <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                      <div>
                        <div
                          style={{
                            fontSize: "14px",
                            fontWeight: 700,
                            color: "#0f172a",
                            lineHeight: 1.3,
                            marginBottom: "4px",
                          }}
                        >
                          {item.name}
                        </div>
                        <div style={{ fontSize: "12px", color: "#64748b", display: "flex", gap: "8px", flexWrap: "wrap" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                            <span style={{ fontWeight: 600, color: "#94a3b8" }}>SIZE:</span> {item.size}
                          </span>
                          <span style={{ color: "#e2e8f0" }}>|</span>
                          <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <span style={{ fontWeight: 600, color: "#94a3b8" }}>COLOR:</span>
                            <div
                              style={{
                                width: "10px",
                                height: "10px",
                                borderRadius: "50%",
                                background: item.col,
                                border: "1px solid #cbd5e1",
                              }}
                            />
                            {item.colNm}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "10px" }}>
                        <div
                          className="qty-ctl"
                          style={{
                            background: "#f8fafc",
                            border: "1px solid #e2e8f0",
                            borderRadius: "8px",
                            padding: "2px",
                          }}
                        >
                          <button
                            className="qb"
                            onClick={() => updateCartQty(idx, -1)}
                            style={{ width: "26px", height: "26px", fontSize: "14px" }}
                          >
                            –
                          </button>
                          <span className="qv" style={{ fontSize: "13px", minWidth: "24px", fontWeight: 700 }}>
                            {item.qty}
                          </span>
                          <button
                            className="qb"
                            onClick={() => updateCartQty(idx, 1)}
                            style={{ width: "26px", height: "26px", fontSize: "14px" }}
                          >
                            +
                          </button>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: "14px", fontWeight: 800, color: "#0f172a" }}>
                            {fmt(item.price * item.qty)}
                          </div>
                          <button
                            className="ci-del"
                            onClick={() => removeFromCart(idx)}
                            style={{
                              fontSize: "11px",
                              color: "#94a3b8",
                              background: "none",
                              border: "none",
                              padding: 0,
                              textDecoration: "underline",
                              marginTop: "2px",
                              cursor: "pointer",
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* 1-Click Upsell Strip */}
              {upsellItems.length > 0 && (
                <div style={{ marginTop: "24px", padding: "16px", background: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                  <div style={{ fontSize: "12px", fontWeight: 800, color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "10px" }}>
                    ⚡ Frequently Added Essentials
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {upsellItems.map((prod) => (
                      <div
                        key={prod.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          background: "#ffffff",
                          padding: "8px 12px",
                          borderRadius: "8px",
                          border: "1px solid #e2e8f0",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div
                            style={{
                              width: "36px",
                              height: "44px",
                              borderRadius: "4px",
                              overflow: "hidden",
                              background: "#f1f5f9",
                              flexShrink: 0,
                            }}
                          >
                            {prod.imgs && prod.imgs[0] ? (
                              <img src={prod.imgs[0].split("?")[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            ) : (
                              prod.emo
                            )}
                          </div>
                          <div>
                            <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>{prod.name}</div>
                            <div style={{ fontSize: "12px", fontWeight: 800, color: "#008080" }}>{fmt(prod.price)}</div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => addToCart(prod, 0, prod.sizes?.[0] || "M", 1)}
                          style={{
                            padding: "6px 12px",
                            background: "#f0fdf4",
                            border: "1px solid #bbf7d0",
                            color: "#166534",
                            borderRadius: "6px",
                            fontSize: "12px",
                            fontWeight: 700,
                            cursor: "pointer",
                            whiteSpace: "nowrap",
                          }}
                        >
                          + Add
                        </button>
                      </div>
                    ))}
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
              <div className="sum-r" style={{ color: "#16a34a" }}>
                <span>Multi-Item Savings ({totalQty === 2 ? "5%" : "10%"})</span>
                <span style={{ fontWeight: 800 }}>-{fmt(volumeDiscountAmount)}</span>
              </div>
            )}
            <div className="sum-r">
              <span>Shipping</span>
              <span style={{ fontSize: isFreeShipUnlocked ? "13px" : "12px", fontWeight: 700, color: isFreeShipUnlocked ? "#16a34a" : "#475569" }}>
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
            <div style={{ textAlign: "center", fontSize: 11, color: "var(--lt)", marginTop: 12 }}>
              🔒 256-Bit SSL Encrypted Checkout
            </div>
          </div>
        )}
      </div>
    </>
  );
}
