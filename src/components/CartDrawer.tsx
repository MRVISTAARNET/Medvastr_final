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
  const { cart, updateCartQty, removeFromCart } = useApp();
  const router = useRouter();

  const sub = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const ship = sub > 999 ? 0 : 99;

  const handleCheckout = () => {
    onClose();
    router.push("/checkout");
  };

  return (
    <>
      <div className={`drw-bg${open ? " open" : ""}`} onClick={onClose} />
      <div className={`cart-drw${open ? " open" : ""}`}>
        <div className="drw-hd">
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>Shopping Bag</h3>
            <div className="drw-hd-s" style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
              {cart.reduce((a, b) => a + b.qty, 0)} items in your bag
            </div>
          </div>
          <button className="drw-x" onClick={onClose} style={{ fontSize: '20px', color: '#94a3b8' }}>
            ✕
          </button>
        </div>

        <div className="drw-body" style={{ padding: '0 20px' }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: "center", padding: "100px 20px" }}>
              <div style={{ fontSize: '70px', marginBottom: '24px', opacity: 0.8 }}>🛍️</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: "#0f172a", marginBottom: '8px' }}>Your bag is empty</div>
              <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '32px' }}>Looks like you haven't added anything to your collection yet.</div>
              <button
                className="btn-p"
                onClick={onClose}
                style={{ width: '100%', padding: '14px', borderRadius: '12px', fontSize: '14px', fontWeight: 700 }}
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            cart.map((item, idx) => {
              const colorIdx = item.clrs?.indexOf(item.col) ?? 0;
              const images = getImagesForColor(item, colorIdx !== -1 ? colorIdx : 0);
              const thumb = images[0] || item.imgs[0];

              return (
                <div key={item.k} style={{
                  display: 'flex',
                  gap: '16px',
                  padding: '24px 0',
                  borderBottom: '1px solid #f1f5f9'
                }}>
                  <div style={{
                    width: '85px',
                    height: '110px',
                    position: 'relative',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    background: '#f8fafc',
                    flexShrink: 0
                  }}>
                    {thumb ? (
                      <Image
                        src={thumb}
                        alt={item.name}
                        fill
                        style={{ objectFit: 'cover' }}
                        sizes="85px"
                      />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                        {item.emo || '📦'}
                      </div>
                    )}
                  </div>

                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{
                        fontSize: '15px',
                        fontWeight: 700,
                        color: '#0f172a',
                        lineHeight: 1.3,
                        marginBottom: '4px'
                      }}>
                        {item.name}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ fontWeight: 600, color: '#94a3b8' }}>SIZE:</span> {item.size}
                        </span>
                        <span style={{ color: '#e2e8f0' }}>|</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontWeight: 600, color: '#94a3b8' }}>COLOR:</span>
                          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: item.col, border: '1px solid #cbd5e1' }} />
                          {item.colNm}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px' }}>
                      <div className="qty-ctl" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '2px' }}>
                        <button className="qb" onClick={() => updateCartQty(idx, -1)} style={{ width: '28px', height: '28px', fontSize: '16px' }}>–</button>
                        <span className="qv" style={{ fontSize: '13px', minWidth: '24px', fontWeight: 700 }}>{item.qty}</span>
                        <button className="qb" onClick={() => updateCartQty(idx, 1)} style={{ width: '28px', height: '28px', fontSize: '16px' }}>+</button>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>{fmt(item.price * item.qty)}</div>
                        <button
                          className="ci-del"
                          onClick={() => removeFromCart(idx)}
                          style={{ fontSize: '11px', color: '#94a3b8', background: 'none', border: 'none', padding: 0, textDecoration: 'underline', marginTop: '4px' }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {cart.length > 0 && (
          <div className="drw-ft">
            <div className="sum-r">
              <span>Subtotal</span>
              <span>{fmt(sub)}</span>
            </div>
            <div className="sum-r">
              <span>Shipping</span>
              <span>{ship === 0 ? "FREE" : fmt(ship)}</span>
            </div>
            <div className="sum-r tot">
              <span>Total</span>
              <span>{fmt(sub + ship)}</span>
            </div>
            <button className="co-cta" onClick={handleCheckout}>
              Checkout Now →
            </button>
            <div style={{ textAlign: "center", fontSize: 11, color: "var(--lt)", marginTop: 15 }}>
              Secure checkout with SSL encryption.
            </div>
          </div>
        )}
      </div>
    </>
  );
}
