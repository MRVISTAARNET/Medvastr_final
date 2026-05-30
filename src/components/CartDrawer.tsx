"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { fmt } from "@/lib/data";
import { useRouter } from "next/navigation";

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
            <h3>Shopping Bag</h3>
            <div className="drw-hd-s">{cart.reduce((a, b) => a + b.qty, 0)} items in your bag</div>
          </div>
          <button className="drw-x" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="drw-body">
          {cart.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 20px", color: "var(--lt)" }}>
              <div style={{ fontSize: 60, marginBottom: 15 }}>🛒</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "var(--ink)", marginBottom: 8 }}>Your bag is empty</div>
              <div style={{ fontSize: 13, marginBottom: 20 }}>Looks like you haven't added anything yet.</div>
              <button className="btn-t" onClick={onClose}>
                Continue Shopping
              </button>
            </div>
          ) : (
            cart.map((item, idx) => (
              <div className="ci" key={item.k}>
                <div className="ci-img" style={{ background: item.bg }}>
                  {item.emo}
                </div>
                <div className="ci-info">
                  <div className="ci-nm">{item.name}</div>
                  <div className="ci-mt">
                    Size: {item.size} | Color: {item.colNm}
                  </div>
                  <div className="ci-row">
                    <div className="qty-ctl">
                      <button className="qb" onClick={() => updateCartQty(idx, -1)}>
                        –
                      </button>
                      <span className="qv">{item.qty}</span>
                      <button className="qb" onClick={() => updateCartQty(idx, 1)}>
                        +
                      </button>
                    </div>
                    <button className="ci-del" onClick={() => removeFromCart(idx)}>
                      Remove
                    </button>
                  </div>
                </div>
                <div className="ci-pr">{fmt(item.price * item.qty)}</div>
              </div>
            ))
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
