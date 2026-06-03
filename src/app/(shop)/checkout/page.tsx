"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { fmt } from "@/lib/data";
import { API_BASE, authHeaders, RAZORPAY_KEY } from "@/lib/api";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const { cart, clearCart, toast, user, isHydrated, setIsAuthOpen } = useApp();
  const [loading, setLoading] = useState(false);
  const [orderNum, setOrderNum] = useState<string | null>(null);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    phone: "",
    paymentMethod: "ONLINE" as "ONLINE" | "COD",
    promoCode: ""
  });

  useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        phone: user.phone || prev.phone
      }));
    }
  }, [user]);

  const sub = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const ship = sub > 999 ? 0 : 99;
  const tot = sub + ship;

  useEffect(() => {
    if (typeof window !== "undefined") {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleOnlinePayment = async (orderData: any) => {
    if (!orderData?.razorpayOrderId) {
      toast("Payment could not be started. Try again or use COD.", "bad");
      return;
    }
    if (!RAZORPAY_KEY) {
      toast("Razorpay is not configured on the storefront.", "bad");
      return;
    }
    const options = {
      key: RAZORPAY_KEY,
      amount: Math.round(orderData.totalAmount * 100),
      currency: "INR",
      name: "Medvastr",
      description: "Medical Wear Purchase",
      order_id: orderData.razorpayOrderId,
      handler: async function (response: any) {
        try {
          const res = await fetch(`${API_BASE}/orders/verify-payment`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...authHeaders(),
            },
            body: JSON.stringify({
              orderNumber: orderData.orderNumber,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature
            })
          });
          const data = await res.json();
          if (data.success) {
            setOrderNum(orderData.orderNumber);
            clearCart();
            toast("Payment Successful!", "ok");
          } else {
            toast(data.message || "Payment verification failed", "bad");
          }
        } catch (e) { toast("Verification failed", "bad"); }
      },
      prefill: {
        name: `${form.firstName} ${form.lastName}`,
        email: user?.email,
        contact: form.phone
      },
      theme: { color: "#008080" }
    };
    new window.Razorpay(options).open();
  };

  const placeOrder = async () => {
    if (!user) {
      setIsAuthOpen(true);
      return toast("Please sign in to place order", "bad");
    }

    if (!form.address || !form.phone || !form.firstName || !form.pincode) {
      return toast("Missing shipping details", "bad");
    }

    setLoading(true);
    const orderRequest = {
      ...form,
      items: cart.map(i => ({
        productId: i.id,
        size: i.size,
        colorHex: i.col,
        colorName: i.colNm,
        quantity: i.qty
      }))
    };

    try {
      const res = await fetch(`${API_BASE}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
        body: JSON.stringify(orderRequest)
      });
      const data = await res.json();
      if (data.success) {
        if (form.paymentMethod === "ONLINE") handleOnlinePayment(data.data);
        else { setOrderNum(data.data.orderNumber); clearCart(); }
      } else toast(data.message, "bad");
    } catch (e) { toast("Error placing order", "bad"); }
    finally { setLoading(false); }
  };

  if (!isHydrated) return <div className="page sec">Loading...</div>;

  if (orderNum) {
    return (
      <div className="page" style={{ padding: '80px 0' }}>
        <div className="sec checkout-success" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '70px', marginBottom: '15px' }}>🎉</div>
          <h2 style={{ fontSize: '32px', marginBottom: '10px' }}>Order Placed!</h2>
          <p style={{ color: '#666', fontSize: '18px', marginBottom: '30px' }}>Your order <strong>{orderNum}</strong> is confirmed.</p>
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
            <Link href="/" className="btn-p">Keep Shopping</Link>
            <Link href="/track" style={{ padding: '12px 25px', borderRadius: '10px', border: '1.5px solid #008080', color: '#008080', fontWeight: 600 }}>Track Status</Link>
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="page sec" style={{ textAlign: 'center', padding: '100px 0' }}>
        <div style={{ fontSize: '50px', marginBottom: '20px' }}>🛒</div>
        <h2>Your bag is empty</h2>
        <p style={{ color: '#888', marginTop: '10px' }}>Add some premium scrubs to get started.</p>
        <Link href="/" className="btn-p" style={{ marginTop: '25px', display: 'inline-block' }}>Visit Products</Link>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="sec">
        <h1 className="checkout-h" style={{ marginBottom: '35px', fontFamily: 'var(--serif)' }}>Checkout</h1>

        <div className="checkout-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 420px', gap: '50px' }}>
          <div className="checkout-main">
            <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: '20px', padding: '35px', boxShadow: '0 5px 15px rgba(0,0,0,0.02)' }}>

              {!user && (
                <div style={{ background: '#f0f9f9', padding: '20px', borderRadius: '12px', marginBottom: '30px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px dashed #008080' }}>
                  <div style={{ fontSize: '14px', color: '#006060', fontWeight: 600 }}>Already a member? Sign in for faster checkout.</div>
                  <button onClick={() => setIsAuthOpen(true)} style={{ background: '#008080', color: '#fff', padding: '8px 20px', borderRadius: '8px', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}>Sign In</button>
                </div>
              )}

              <h3 style={{ marginBottom: '25px', fontSize: '20px', fontWeight: 700 }}>Shipping Address</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <input name="firstName" className="price-inp" placeholder="First Name" value={form.firstName} onChange={handleInputChange} style={{ width: '100%', padding: '14px', borderRadius: '10px', border: '1.2px solid #ddd' }} />
                <input name="lastName" className="price-inp" placeholder="Last Name" value={form.lastName} onChange={handleInputChange} style={{ width: '100%', padding: '14px', borderRadius: '10px', border: '1.2px solid #ddd' }} />
              </div>
              <input name="address" className="price-inp" placeholder="Full Home Address, Street, Floor" value={form.address} onChange={handleInputChange} style={{ width: '100%', padding: '14px', borderRadius: '10px', border: '1.2px solid #ddd', marginBottom: '15px' }} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <input name="city" className="price-inp" placeholder="City" value={form.city} onChange={handleInputChange} style={{ width: '100%', padding: '14px', borderRadius: '10px', border: '1.2px solid #ddd' }} />
                <input name="state" className="price-inp" placeholder="State" value={form.state} onChange={handleInputChange} style={{ width: '100%', padding: '14px', borderRadius: '10px', border: '1.2px solid #ddd' }} />
                <input name="pincode" className="price-inp" placeholder="Pincode" value={form.pincode} onChange={handleInputChange} style={{ width: '100%', padding: '14px', borderRadius: '10px', border: '1.2px solid #ddd' }} />
              </div>
              <input name="phone" className="price-inp" placeholder="Mobile Number" value={form.phone} onChange={handleInputChange} style={{ width: '100%', padding: '14px', borderRadius: '10px', border: '1.2px solid #ddd', marginBottom: '40px' }} />

              <h3 style={{ marginBottom: '25px', fontSize: '20px', fontWeight: 700 }}>Payment Method</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '40px' }}>
                {[
                  { id: 'ONLINE', t: 'Online Payment', s: 'UPI, Credit/Debit Cards, Netbanking' },
                  { id: 'COD', t: 'Cash on Delivery', s: 'Pay in cash when you receive the order' }
                ].map(m => (
                  <div key={m.id} onClick={() => setForm(f => ({ ...f, paymentMethod: m.id as any }))} style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '20px', borderRadius: '15px', border: '1.5px solid', cursor: 'pointer', borderColor: form.paymentMethod === m.id ? '#008080' : '#eee', background: form.paymentMethod === m.id ? '#f6fbfb' : '#fff' }}>
                    <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: '2px solid #ddd', background: form.paymentMethod === m.id ? '#008080' : '#fff', boxShadow: form.paymentMethod === m.id ? 'inset 0 0 0 3px #fff' : 'none' }} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '15px' }}>{m.t}</div>
                      <div style={{ fontSize: '13px', color: '#777' }}>{m.s}</div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={placeOrder}
                disabled={loading}
                className="co-cta"
                style={{ width: '100%', padding: '20px', borderRadius: '15px', background: '#008080', color: '#fff', fontSize: '18px', fontWeight: 800, border: 'none', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}
              >
                {loading ? 'Processing...' : `Place Order • ${fmt(tot)}`}
              </button>
            </div>
          </div>

          <div className="checkout-side">
            <div style={{ background: '#fdfdfd', border: '1px solid #eee', padding: '30px', borderRadius: '20px', position: 'sticky', top: '100px' }}>
              <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: 700 }}>Order Summary</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginBottom: '25px' }}>
                {cart.map(i => (
                  <div key={i.k} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ width: '45px', height: '45px', borderRadius: '10px', background: i.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>{i.emo}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '2px' }}>{i.short}</div>
                      <div style={{ fontSize: '12px', color: '#888' }}>{i.qty} × {i.size} • {i.colNm}</div>
                    </div>
                    <div style={{ fontWeight: 700 }}>{fmt(i.price * i.qty)}</div>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: '1.5px dashed #eee', paddingTop: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '15px' }}>
                  <span style={{ color: '#777' }}>Subtotal</span>
                  <span style={{ fontWeight: 600 }}>{fmt(sub)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '15px' }}>
                  <span style={{ color: '#777' }}>Shipping</span>
                  <span style={{ fontWeight: 600, color: ship === 0 ? '#008080' : 'inherit' }}>{ship === 0 ? 'FREE' : fmt(ship)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px', paddingTop: '15px', borderTop: '1.5px solid #eee' }}>
                  <span style={{ fontWeight: 700, fontSize: '18px' }}>Total Amount</span>
                  <span style={{ fontWeight: 900, fontSize: '22px', color: '#008080' }}>{fmt(tot)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
