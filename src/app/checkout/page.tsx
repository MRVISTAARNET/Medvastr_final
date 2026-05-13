"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
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
    clearCart();
  };

  if (orderNum) {
    return (
      <div className="page">
        <div className="sec checkout-success">
          <div className="success-icon">🎉</div>
          <h1 className="success-h">Order Placed Successfully!</h1>
          <p className="success-p">
            Your order <strong>{orderNum}</strong> has been confirmed. A confirmation email has been sent.
          </p>
          <div className="success-acts">
            <Link href="/" className="btn-p">
              Continue Shopping
            </Link>
            <Link href="/track" className="btn-o">
              Track Order
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="page sec empty-checkout">
        <h2>Your bag is empty</h2>
        <p>Looks like you haven't added any scrubs to your bag yet.</p>
        <Link href="/products" className="btn-p" style={{ marginTop: 20 }}>
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="sec">
        <h1 className="checkout-h">Checkout</h1>

        <div className="checkout-grid">
          {/* Left: Forms */}
          <div className="checkout-main">
            {/* Steps */}
            <div className="checkout-steps">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`step-bar${step >= s ? " on" : ""}`}
                />
              ))}
            </div>

            <div className="checkout-form-box">
              <h3 className="form-hd">Shipping Information</h3>
              <div className="form-row">
                <input className="price-inp" placeholder="First Name" />
                <input className="price-inp" placeholder="Last Name" />
              </div>
              <input className="price-inp" placeholder="Full Address" style={{ marginBottom: 18 }} />
              <div className="form-row-3">
                <input className="price-inp" placeholder="City" />
                <input className="price-inp" placeholder="State" />
                <input className="price-inp" placeholder="PIN Code" />
              </div>
              <input className="price-inp" placeholder="Phone Number" style={{ marginBottom: 32 }} />

              <h3 className="form-hd">Payment Method</h3>
              <div className="payment-opts">
                {[
                  { id: "upi", l: "UPI (Google Pay, PhonePe, etc.)", sub: "Extra 5% off on prepay" },
                  { id: "card", l: "Credit / Debit Card", sub: "Visa, Mastercard, Amex" },
                  { id: "cod", l: "Cash on Delivery", sub: "₹50 COD fee applies" },
                ].map((m) => (
                  <div key={m.id} className="pay-opt">
                    <div className="pay-rad" />
                    <div>
                      <div className="pay-l">{m.l}</div>
                      <div className="pay-s">{m.sub}</div>
                    </div>
                  </div>
                ))}
              </div>

              <button className="co-cta" onClick={placeOrder}>
                Complete Order — {fmt(tot)}
              </button>
            </div>
          </div>

          {/* Right: Summary */}
          <div className="checkout-side">
            <div className="summary-box">
              <h3 className="summary-hd">Order Summary</h3>
              <div className="summary-items">
                {cart.map((item) => (
                  <div key={item.k} className="sum-item">
                    <div className="sum-thumb" style={{ background: item.bg }}>
                      {item.emo}
                    </div>
                    <div className="sum-info">
                      <div className="sum-nm">{item.short}</div>
                      <div className="sum-meta">
                        {item.qty} × {item.size}
                      </div>
                    </div>
                    <div className="sum-pr">{fmt(item.price * item.qty)}</div>
                  </div>
                ))}
              </div>

              <div className="promo-box">
                <div className="promo-in">
                  <input
                    className="price-inp"
                    placeholder="Discount Code"
                    value={promo}
                    onChange={(e) => setPromo(e.target.value)}
                  />
                  <button className="btn-p" onClick={applyPromo}>
                    Apply
                  </button>
                </div>
              </div>

              <div className="sum-totals">
                <div className="sum-row">
                  <span>Subtotal</span>
                  <span>{fmt(sub)}</span>
                </div>
                <div className="sum-row">
                  <span>Shipping</span>
                  <span>{ship === 0 ? "FREE" : fmt(ship)}</span>
                </div>
                {discount > 0 && (
                  <div className="sum-row is-disc">
                    <span>Discount</span>
                    <span>–{fmt(discount)}</span>
                  </div>
                )}
                <div className="sum-total">
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
