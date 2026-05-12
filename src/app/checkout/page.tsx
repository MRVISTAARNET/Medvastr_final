"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { fmt, PROMOS } from "@/lib/data";

export default function CheckoutPage() {
  const { cart, clearCart } = useApp();
  const [step, setStep] = useState(1);
  const [promo, setPromo] = useState("");
  const [discount, setDiscount] = useState(0);
  const [orderNum, setOrderNum] = useState<string | null>(null);

  const sub = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const ship = sub > 999 ? 0 : 99;
  const tot = sub + ship - discount;

  const applyPromo = () => {
    const d = PROMOS[promo.toUpperCase()];
    if (d) {
      setDiscount(sub * d);
    }
  };

  const placeOrder = () => {
    const num = "MVS-" + Date.now().toString().slice(-8);
    setOrderNum(num);
  };

  if (orderNum) {
    return (
      <div className="page">
        <div className="sec" style={{ textAlign: "center", padding: "100px 20px" }}>
          <div style={{ fontSize: 80, marginBottom: 24 }}>🎉</div>
          <h1 style={{ fontFamily: "var(--serif)", fontSize: 42, marginBottom: 12 }}>Order Placed Successfully!</h1>
          <p style={{ fontSize: 16, color: "var(--lt)", marginBottom: 32 }}>
            Your order <strong>{orderNum}</strong> has been confirmed. A confirmation email has been sent.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button className="btn-p" onClick={() => (window.location.href = "/")}>
              Continue Shopping
            </button>
            <button className="btn-o" onClick={() => (window.location.href = "/track")}>
              Track Order
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="page sec" style={{ textAlign: "center", padding: "100px 20px" }}>
        <h2>Your bag is empty</h2>
        <button className="btn-p" style={{ marginTop: 20 }} onClick={() => (window.location.href = "/products")}>
          Browse Products
        </button>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="sec">
        <h1 style={{ fontFamily: "var(--serif)", fontSize: 36, marginBottom: 40 }}>Checkout</h1>

        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 60 }}>
          {/* Left: Forms */}
          <div>
            {/* Steps (Simplified) */}
            <div style={{ display: "flex", gap: 10, marginBottom: 32 }}>
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  style={{
                    flex: 1,
                    height: 4,
                    background: step >= s ? "var(--t)" : "var(--bdr)",
                    borderRadius: 2,
                  }}
                />
              ))}
            </div>

            <div style={{ background: "var(--wh)", border: "1.5px solid var(--bdr)", borderRadius: 20, padding: 34 }}>
              <h3 style={{ fontSize: 18, marginBottom: 24 }}>Shipping Information</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 18 }}>
                <input className="price-inp" placeholder="First Name" />
                <input className="price-inp" placeholder="Last Name" />
              </div>
              <input className="price-inp" placeholder="Full Address" style={{ marginBottom: 18 }} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 18, marginBottom: 18 }}>
                <input className="price-inp" placeholder="City" />
                <input className="price-inp" placeholder="State" />
                <input className="price-inp" placeholder="PIN Code" />
              </div>
              <input className="price-inp" placeholder="Phone Number" style={{ marginBottom: 32 }} />

              <h3 style={{ fontSize: 18, marginBottom: 24 }}>Payment Method</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  { id: "upi", l: "UPI (Google Pay, PhonePe, etc.)", sub: "Extra 5% off on prepay" },
                  { id: "card", l: "Credit / Debit Card", sub: "Visa, Mastercard, Amex" },
                  { id: "cod", l: "Cash on Delivery", sub: "₹50 COD fee applies" },
                ].map((m) => (
                  <div
                    key={m.id}
                    style={{
                      padding: "16px 20px",
                      border: "1.5px solid var(--bdr)",
                      borderRadius: 12,
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ width: 20, height: 20, borderRadius: "50%", border: "2px solid var(--t)" }} />
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700 }}>{m.l}</div>
                      <div style={{ fontSize: 12, color: "var(--lt)" }}>{m.sub}</div>
                    </div>
                  </div>
                ))}
              </div>

              <button className="co-cta" style={{ height: 58, fontSize: 16, marginTop: 40 }} onClick={placeOrder}>
                Complete Order — {fmt(tot)}
              </button>
            </div>
          </div>

          {/* Right: Summary */}
          <div>
            <div
              style={{
                background: "var(--warm)",
                border: "1.5px solid var(--bdr)",
                borderRadius: 20,
                padding: 30,
                position: "sticky",
                top: 100,
              }}
            >
              <h3 style={{ fontSize: 18, marginBottom: 20 }}>Order Summary</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 14, maxHeight: 300, overflowY: "auto", marginBottom: 24 }}>
                {cart.map((item) => (
                  <div key={item.k} style={{ display: "flex", gap: 12 }}>
                    <div
                      style={{
                        width: 54,
                        height: 54,
                        background: item.bg,
                        borderRadius: 8,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 24,
                        flexShrink: 0,
                      }}
                    >
                      {item.emo}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{item.short}</div>
                      <div style={{ fontSize: 11, color: "var(--lt)" }}>
                        {item.qty} × {item.size}
                      </div>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{fmt(item.price * item.qty)}</div>
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    className="price-inp"
                    placeholder="Discount Code"
                    value={promo}
                    onChange={(e) => setPromo(e.target.value)}
                  />
                  <button
                    className="btn-p"
                    style={{ height: 44, padding: "0 20px" }}
                    onClick={applyPromo}
                  >
                    Apply
                  </button>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                  <span style={{ color: "var(--lt)" }}>Subtotal</span>
                  <span>{fmt(sub)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                  <span style={{ color: "var(--lt)" }}>Shipping</span>
                  <span>{ship === 0 ? "FREE" : fmt(ship)}</span>
                </div>
                {discount > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "var(--t)" }}>
                    <span>Discount</span>
                    <span>–{fmt(discount)}</span>
                  </div>
                )}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 20,
                    fontWeight: 800,
                    borderTop: "1.5px solid var(--bdr)",
                    paddingTop: 16,
                    marginTop: 6,
                  }}
                >
                  <span>Total</span>
                  <span>{fmt(tot)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
