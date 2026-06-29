"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { fmt } from "@/lib/data";
import { apiJson, API_BASE, RAZORPAY_KEY, getToken } from "@/lib/api";
import { getImagesForColor } from "@/lib/productUtils";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const { cart, clearCart, toast, user, isHydrated, setIsAuthOpen, storeSettings } = useApp();
  const [submitting, setSubmitting] = useState(false);
  const [orderNum, setOrderNum] = useState<string | null>(null);
  const [shippingCost, setShippingCost] = useState<number>(0);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingError, setShippingError] = useState("");
  const [shippingSuccess, setShippingSuccess] = useState("");
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
    email: "",
    paymentMethod: "ONLINE" as "ONLINE" | "COD",
    promoCode: "",
  });
  const [promoInput, setPromoInput] = useState("");
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoMsg, setPromoMsg] = useState("");

  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        firstName: user.firstName || prev.firstName,
        lastName: user.lastName || prev.lastName,
        phone: user.phone || prev.phone,
        email: user.email || prev.email,
      }));
      
      // Fetch saved addresses
      const fetchAddrs = async () => {
        const token = getToken();
        if (!token) return;
        try {
          const res = await apiJson<any[]>("/users/me/addresses", { headers: { Authorization: `Bearer ${token}` } });
          if (res.success && Array.isArray(res.data)) {
            setSavedAddresses(res.data);
          }
        } catch {}
      };
      fetchAddrs();
    }
  }, [user]);

  const sub = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const tot = Math.max(0, sub + shippingCost - promoDiscount);

  // Shiprocket Serviceability Call
  useEffect(() => {
    if (form.pincode.length !== 6) {
      setShippingError("");
      setShippingSuccess("");
      return;
    }
    if (form.pincode.length === 6 && cart.length > 0) {
      setShippingLoading(true);
      setShippingError("");
      setShippingSuccess("");
      const totalWeight = cart.reduce((s, i) => {
        let w = 0.5;
        if (i.wt) {
          const num = parseFloat(i.wt);
          if (!isNaN(num)) {
            const lower = i.wt.toLowerCase();
            if (lower.includes('kg')) {
              w = num;
            } else if (lower.includes('g') || lower.includes('gm')) {
              w = num / 1000;
            } else {
              w = num < 10 ? num : num / 1000;
            }
          }
        }
        return s + Math.max(0.1, w) * i.qty;
      }, 0);
      const isCod = form.paymentMethod === "COD";
      
      // Shiprocket logic commented out in favor of backend promotional shipping calculation
      /*
      // Auto-fill City & State using public API first
      fetch(`https://api.postalpincode.in/pincode/${form.pincode}`)
        ...
      */

      fetch(`${API_BASE}/orders/shipping-fee?subtotal=${sub}`)
        .then(r => r.json())
        .then(data => {
          if (data.success) {
            setShippingCost(Number(data.data));
            setShippingSuccess(Number(data.data) === 0 ? "✓ Free Promotional Shipping Applied!" : "✓ Delivery Available. Estimated in 5-7 days.");
          } else {
            setShippingCost(99);
          }
        })
        .catch(console.error)
        .finally(() => setShippingLoading(false));
    }
  }, [form.pincode, form.paymentMethod, cart]);

  const applyPromo = async () => {
    if (!promoInput.trim()) return;
    try {
      const res = await fetch(`${API_BASE}/promos/validate?code=${encodeURIComponent(promoInput)}&total=${sub}`);
      const data = await res.json();
      const discountAmt = Number(data.discountAmount) || 0;
      if (data.valid && discountAmt > 0) {
        setPromoDiscount(discountAmt);
        setForm((f) => ({ ...f, promoCode: promoInput.trim().toUpperCase() }));
        setPromoMsg(data.message || "Promo applied");
      } else if (data.valid && discountAmt === 0) {
        setPromoDiscount(0);
        setForm((f) => ({ ...f, promoCode: "" }));
        setPromoMsg("This promo code is valid but provides a ₹0 discount. Check minimum cart value.");
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
    if (
      !form.firstName?.trim() ||
      !form.lastName?.trim() ||
      !form.address?.trim() ||
      !form.city?.trim() ||
      !form.state?.trim() ||
      !form.pincode?.trim() ||
      !form.phone?.trim() ||
      !form.email?.trim()
    ) {
      return toast("Please fill in all shipping details, including email *", "bad");
    }
    setSubmitting(true);
    const orderRequest = {
      ...form,
      shippingAmount: shippingCost,
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

  if (!isHydrated) {
    return <div className="co-container page" style={{ minHeight: '70vh' }} />;
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
              <div className="co-signin-banner">
                <div className="co-signin-text">
                  <span style={{ fontSize: '20px' }}>⚡</span>
                  <div>
                    <strong>Faster checkout</strong>
                    <p>Sign in to auto-fill your saved address</p>
                  </div>
                </div>
                <button onClick={() => setIsAuthOpen(true)} className="co-signin-btn">Sign In</button>
              </div>
            )}
            
            {user && savedAddresses.length > 0 && (
              <div style={{ marginBottom: "20px", padding: "20px", background: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                <h4 style={{ fontSize: "14px", fontWeight: 700, marginBottom: "12px", color: "#0f172a" }}>Select a Saved Address</h4>
                <div style={{ display: "flex", gap: "12px", overflowX: "auto", paddingBottom: "5px" }}>
                  {savedAddresses.map(a => (
                    <div 
                      key={a.id} 
                      onClick={() => setForm(f => ({
                        ...f, address: a.addressLine1 + (a.addressLine2 ? ', ' + a.addressLine2 : ''), city: a.city, state: a.state, pincode: a.pincode, phone: a.phone
                      }))}
                      style={{ border: "1px solid #cbd5e1", background: "white", padding: "12px", borderRadius: "8px", cursor: "pointer", minWidth: "200px" }}
                    >
                      <div style={{ fontWeight: 700, fontSize: "13px", marginBottom: "4px" }}>{a.type}</div>
                      <div style={{ fontSize: "12px", color: "#64748b" }}>{a.addressLine1}, {a.city} {a.pincode}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="co-input-row">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>
                  First Name <span style={{ color: '#e11d48' }}>*</span>
                </label>
                <input name="firstName" className="co-input-field" placeholder="First Name" value={form.firstName} onChange={handleInputChange} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>
                  Last Name <span style={{ color: '#e11d48' }}>*</span>
                </label>
                <input name="lastName" className="co-input-field" placeholder="Last Name" value={form.lastName} onChange={handleInputChange} />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '20px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>
                Full Address / Street / Floor <span style={{ color: '#e11d48' }}>*</span>
              </label>
              <input name="address" className="co-input-field" placeholder="Full Address / Street / Floor" value={form.address} onChange={handleInputChange} />
            </div>
            <div className="co-input-row-3">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>
                  City <span style={{ color: '#e11d48' }}>*</span>
                </label>
                <input name="city" className="co-input-field" placeholder="City" value={form.city} onChange={handleInputChange} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>
                  State <span style={{ color: '#e11d48' }}>*</span>
                </label>
                <input name="state" className="co-input-field" placeholder="State" value={form.state} onChange={handleInputChange} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>
                  Pincode <span style={{ color: '#e11d48' }}>*</span>
                </label>
                <input name="pincode" className="co-input-field" placeholder="Pincode" maxLength={6} value={form.pincode} onChange={e => setForm({...form, pincode: e.target.value.replace(/[^0-9]/g, '')})} />
              </div>
            </div>
            {shippingError && <p style={{ color: '#e11d48', fontSize: '13px', fontWeight: 600, marginBottom: '20px' }}>{shippingError}</p>}
            {shippingSuccess && <p style={{ color: '#10b981', fontSize: '13px', fontWeight: 600, marginBottom: '20px' }}>{shippingSuccess}</p>}
            {shippingLoading && <p style={{ color: '#008080', fontSize: '13px', fontWeight: 600, marginBottom: '20px' }}>Calculating live shipping rates...</p>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '20px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>
                Mobile Number <span style={{ color: '#e11d48' }}>*</span>
              </label>
              <input name="phone" className="co-input-field" placeholder="Mobile Number" value={form.phone} onChange={handleInputChange} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '20px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>
                Email Address <span style={{ color: '#e11d48' }}>*</span>
              </label>
              <input name="email" type="email" className="co-input-field" placeholder="Email Address" value={form.email} onChange={handleInputChange} />
            </div>
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
            {submitting ? 'Processing...' : `Complete Purchase — ${fmt(tot)}`}
          </button>

          {/* TRUST STRIP */}
          <div className="co-checkout-trust">
            <div className="co-trust-badge">🔒 SSL Encrypted</div>
            <div className="co-trust-badge">🛡️ Razorpay Secured</div>
            <div className="co-trust-badge">↩️ Easy Returns</div>
            <div className="co-trust-badge">
              📦 {(() => {
                let txt = `Free Shipping ₹${storeSettings?.SHIPPING_FREE_THRESHOLD || 999}+`;
                if (storeSettings?.SHIPPING_PROMO_FREE_UNTIL) {
                  const promoDate = new Date(storeSettings.SHIPPING_PROMO_FREE_UNTIL);
                  if (new Date() < promoDate) {
                    txt = `Free Shipping till ${promoDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`;
                  }
                }
                return txt;
              })()}
            </div>
          </div>
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
              <span>Shipping Cost {shippingLoading ? '(Calculating...)' : ''}</span>
              <span className={shippingCost === 0 ? 'co-val-free' : 'co-val-ink'}>{shippingCost === 0 ? 'COMPLIMENTARY' : fmt(shippingCost)}</span>
            </div>
            {promoDiscount > 0 && (
              <div className="co-total-row">
                <span>Promotional Saving</span>
                <span style={{ color: '#16a34a' }}>-{fmt(promoDiscount)}</span>
              </div>
            )}
            <div className="co-total-row grand">
              <span>Grand Total</span>
              <span>{fmt(tot)}</span>
            </div>
          </div>

          {/* SIDEBAR TRUST INFO */}
          <div className="co-sidebar-trust">
            {[['🚚', 'Live Courier Rates', `Shipping is calculated directly via Shiprocket.`],
            ['↩️', 'Easy Returns', '7-day hassle-free returns on all orders.'],
            ['💬', 'Support', 'Need help? Chat with us or call Mon–Sat 10am–6pm.']
            ].map(([ico, title, desc]) => (
              <div key={title} className="co-sidebar-policy">
                <span className="co-sidebar-policy-icon">{ico}</span>
                <div>
                  <strong>{title}</strong>
                  <p>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
