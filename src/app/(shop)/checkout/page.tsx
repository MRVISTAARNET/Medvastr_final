"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { fmt } from "@/lib/data";
import { apiJson, API_BASE, RAZORPAY_KEY } from "@/lib/api";
import { getImagesForColor } from "@/lib/productUtils";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const { cart, clearCart, toast, user, isHydrated, setIsAuthOpen } = useApp();
  const [submitting, setSubmitting] = useState(false);
  const [orderNum, setOrderNum] = useState<string | null>(null);
  const razorpayLoaded = useRef(false);
  const pendingOrderRef = useRef<any>(null);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    phone: "",
    paymentMethod: "ONLINE" as "ONLINE" | "COD",
    promoCode: "",
  });
  const [promoInput, setPromoInput] = useState("");
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoMsg, setPromoMsg] = useState("");

  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        firstName: user.firstName || prev.firstName,
        lastName: user.lastName || prev.lastName,
        phone: user.phone || prev.phone,
      }));
    }
  }, [user]);

  const sub = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const ship = sub > 999 ? 0 : 99;
  const tot = Math.max(0, sub + ship - promoDiscount);

  const applyPromo = async () => {
    if (!promoInput.trim()) return;
    try {
      const res = await fetch(`${API_BASE}/promos/validate?code=${encodeURIComponent(promoInput)}&total=${sub}`);
      const data = await res.json();
      if (data.valid) {
        setPromoDiscount(Number(data.discountAmount) || 0);
        setForm((f) => ({ ...f, promoCode: promoInput.trim().toUpperCase() }));
        setPromoMsg(data.message || "Promo applied");
      } else {
        setPromoDiscount(0);
        setForm((f) => ({ ...f, promoCode: "" }));
        setPromoMsg(data.message || "Invalid promo");
      }
    } catch {
      setPromoMsg("Could not validate promo");
    }
  };

  useEffect(() => {
    if (typeof window === "undefined" || razorpayLoaded.current) return;
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => {
      razorpayLoaded.current = true;
    };
    document.body.appendChild(script);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const verifyPayment = useCallback(
    async (orderData: any, response: any) => {
      try {
        const data = await apiJson("/orders/verify-payment", {
          method: "POST",
          body: JSON.stringify({
            orderNumber: orderData.orderNumber,
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          }),
        });
        if (data.success) {
          setOrderNum(orderData.orderNumber);
          clearCart();
          toast("Payment Successful!", "ok");
        } else {
          toast(data.message || "Payment verification failed", "bad");
        }
      } catch {
        toast("Payment verification failed", "bad");
      } finally {
        setSubmitting(false);
        pendingOrderRef.current = null;
      }
    },
    [clearCart, toast]
  );

  const handleOnlinePayment = useCallback(
    (orderData: any) => {
      if (!orderData?.razorpayOrderId) {
        toast("Payment could not be started. Try again or use COD.", "bad");
        setSubmitting(false);
        return;
      }
      if (!RAZORPAY_KEY) {
        toast("Razorpay is not configured on the storefront.", "bad");
        setSubmitting(false);
        return;
      }
      if (!window.Razorpay) {
        toast("Payment gateway is still loading. Please try again.", "bad");
        setSubmitting(false);
        return;
      }

      pendingOrderRef.current = orderData;

      const options = {
        key: RAZORPAY_KEY,
        amount: Math.round(orderData.totalAmount * 100),
        currency: "INR",
        name: "Medvastr",
        description: "Medical Wear Purchase",
        order_id: orderData.razorpayOrderId,
        handler: (response: any) => verifyPayment(orderData, response),
        prefill: {
          name: `${form.firstName} ${form.lastName}`.trim(),
          email: user?.email,
          contact: form.phone,
        },
        theme: { color: "#008080" },
        modal: {
          ondismiss: () => {
            setSubmitting(false);
            pendingOrderRef.current = null;
            toast("Payment cancelled", "bad");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", () => {
        setSubmitting(false);
        pendingOrderRef.current = null;
        toast("Payment failed. Please try again.", "bad");
      });
      rzp.open();
    },
    [form.firstName, form.lastName, form.phone, user?.email, toast, verifyPayment]
  );

  const placeOrder = async () => {
    if (submitting) return;
    if (!user) {
      setIsAuthOpen(true);
      return toast("Please sign in to place order", "bad");
    }
    if (!form.address || !form.phone || !form.firstName || !form.pincode) {
      return toast("Missing shipping details", "bad");
    }
    setSubmitting(true);
    const orderRequest = {
      ...form,
      items: cart.map((i) => ({
        productId: i.id,
        variantId: i.variantId,
        size: i.size,
        colorHex: i.col,
        colorName: i.colNm,
        quantity: i.qty,
      })),
    };
    try {
      const data = await apiJson<any>("/orders", {
        method: "POST",
        body: JSON.stringify(orderRequest),
      });
      if (data.success) {
        if (form.paymentMethod === "ONLINE") {
          handleOnlinePayment(data.data);
        } else {
          setOrderNum(data.data.orderNumber);
          clearCart();
          setSubmitting(false);
        }
      } else {
        toast(data.message || "Could not place order", "bad");
        setSubmitting(false);
      }
    } catch {
      toast("Error placing order. Please try again.", "bad");
      setSubmitting(false);
    }
  };

  if (!isHydrated) return <div className="min-h-screen flex items-center justify-center">Loading Experience...</div>;

  if (orderNum) {
    return (
      <div className="co-container page">
        <div className="co-success-card">
          <div className="co-success-icon">🎉</div>
          <h2 className="co-success-h">Order Confirmed!</h2>
          <p className="co-success-p">
            Thank you for choosing Medvastr. Your order <strong>{orderNum}</strong> has been placed and is being prepared for shipment.
          </p>
          <div className="co-success-btns">
            <Link href="/" className="pdp-buy-btn flex items-center justify-center" style={{ height: '60px' }}>Continue Shopping</Link>
            <Link href={`/track?order=${encodeURIComponent(orderNum)}`} className="pdp-heart-btn" style={{ height: '60px' }}>Track Order</Link>
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="co-container page text-center">
        <div className="co-success-icon">🛒</div>
        <h2 className="co-success-h">Your bag is empty</h2>
        <p className="co-success-p">Add some of our premium medical essentials before checking out.</p>
        <Link href="/products" className="pdp-buy-btn inline-flex items-center justify-center" style={{ maxWidth: '300px', height: '60px' }}>Shop Collection</Link>
      </div>
    );
  }

  return (
    <div className="co-container page">
      <h1 className="co-title">Secure Checkout</h1>

      <div className="co-grid-premium">
        <div className="co-card-premium">
          {/* STEP 1: SHIPPING */}
          <div className="co-form-group">
            <h3 className="co-section-title"><span className="step-n">1</span> Delivery Details</h3>
            {!user && (
              <div className="p-6 bg-emerald-50 rounded-xl mb-8 flex justify-between items-center border border-emerald-100">
                <p className="text-sm font-bold text-emerald-900">Sign in to sync your saved addresses.</p>
                <button onClick={() => setIsAuthOpen(true)} className="text-sm font-black text-emerald-600 underline uppercase tracking-widest">Sign In</button>
              </div>
            )}
            <div className="co-input-row">
              <input name="firstName" className="co-input-field" placeholder="First Name" value={form.firstName} onChange={handleInputChange} />
              <input name="lastName" className="co-input-field" placeholder="Last Name" value={form.lastName} onChange={handleInputChange} />
            </div>
            <input name="address" className="co-input-field mb-5" placeholder="Full Address / Street / Floor" value={form.address} onChange={handleInputChange} />
            <div className="co-input-row">
              <input name="city" className="co-input-field" placeholder="City" value={form.city} onChange={handleInputChange} />
              <input name="state" className="co-input-field" placeholder="State" value={form.state} onChange={handleInputChange} />
              <input name="pincode" className="co-input-field" placeholder="Pincode" value={form.pincode} onChange={handleInputChange} />
            </div>
            <input name="phone" className="co-input-field" placeholder="Mobile Number" value={form.phone} onChange={handleInputChange} />
          </div>

          {/* PROMO */}
          <div className="co-form-group">
            <h3 className="co-section-title"><span className="step-n">2</span> Reward Codes</h3>
            <div className="flex gap-4">
              <input className="co-input-field" placeholder="Enter Promo Code" value={promoInput} onChange={e => setPromoInput(e.target.value.toUpperCase())} />
              <button onClick={applyPromo} className="pdp-buy-btn" style={{ width: '140px', height: '60px' }}>APPLY</button>
            </div>
            {promoMsg && <p className={`mt-3 text-xs font-bold ${promoDiscount > 0 ? 'text-emerald-600' : 'text-red-500'}`}>{promoMsg}</p>}
          </div>

          {/* STEP 2: PAYMENT */}
          <div className="co-form-group">
            <h3 className="co-section-title"><span className="step-n">3</span> Payment Selection</h3>
            <div onClick={() => setForm(f => ({ ...f, paymentMethod: 'ONLINE' }))} className={`co-pay-method ${form.paymentMethod === 'ONLINE' ? 'active' : ''}`}>
              <div className="co-radio-circle" />
              <div className="co-pay-info">
                <span className="co-pay-name">Instant Online Payment</span>
                <span className="co-pay-desc">UPI, Cards, Netbanking — Secured by Razorpay</span>
              </div>
              <span className="text-2xl">💳</span>
            </div>
            <div onClick={() => setForm(f => ({ ...f, paymentMethod: 'COD' }))} className={`co-pay-method ${form.paymentMethod === 'COD' ? 'active' : ''}`}>
              <div className="co-radio-circle" />
              <div className="co-pay-info">
                <span className="co-pay-name">Cash on Delivery</span>
                <span className="co-pay-desc">Pay upon receiving your package at your doorstep</span>
              </div>
              <span className="text-2xl">🚚</span>
            </div>
          </div>

          <button onClick={placeOrder} disabled={submitting} className="pdp-buy-btn mt-4">
            {submitting ? "Processing..." : `Complete Purchase — ${fmt(tot)}`}
          </button>
        </div>

        {/* SUMMARY */}
        <aside className="co-sticky-sidebar">
          <h2 className="co-summary-hd">Order Overview</h2>
          <div className="co-item-list">
            {cart.map(i => {
              const colorIdx = i.clrs?.indexOf(i.col) ?? 0;
              const images = getImagesForColor(i, colorIdx !== -1 ? colorIdx : 0);
              const thumb = images[0] || i.imgs?.[0];
              return (
                <div key={i.k} className="co-item-box">
                  <div className="co-item-thumb">
                    {thumb ? <img src={thumb} alt="" /> : <span className="text-2xl">{i.emo}</span>}
                  </div>
                  <div className="co-item-details">
                    <span className="co-item-name">{i.short || i.name}</span>
                    <span className="co-item-variant">{i.qty} × {i.size} / {i.colNm}</span>
                  </div>
                  <span className="co-item-price">{fmt(i.price * i.qty)}</span>
                </div>
              );
            })}
          </div>

          <div className="co-totals-wrap">
            <div className="co-total-row">
              <span>Subtotal</span>
              <span className="co-val-ink">{fmt(sub)}</span>
            </div>
            <div className="co-total-row">
              <span>Shipping Cost</span>
              <span className={ship === 0 ? 'co-val-free' : 'co-val-ink'}>{ship === 0 ? 'COMPLIMENTARY' : fmt(ship)}</span>
            </div>
            {promoDiscount > 0 && (
              <div className="co-total-row">
                <span>Promotional Saving</span>
                <span className="text-emerald-600">-{fmt(promoDiscount)}</span>
              </div>
            )}
            <div className="co-total-row grand">
              <span>Grand Total</span>
              <span>{fmt(tot)}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
