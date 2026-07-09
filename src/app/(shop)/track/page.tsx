"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { B, fmt } from "@/lib/data";
import { apiJson, API_BASE } from "@/lib/api";
import GenericPage from "@/components/GenericPage";
import { useApp } from "@/context/AppContext";

function TrackContent() {
  useEffect(() => {
    document.title = "Track Your Order | Medvastr";
  }, []);

  const { user, setIsAuthOpen } = useApp();
  const searchParams = useSearchParams();
  const [orderNum, setOrderNum] = useState(searchParams.get("order") || "");
  const [tracking, setTracking] = useState<any>(null);
  const [orderData, setOrderData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState<number | null>(null);
  const [feedbackRemarks, setFeedbackRemarks] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  useEffect(() => {
    const q = searchParams.get("order");
    if (q) {
      setOrderNum(q);
      trackOrder(q);
    }
  }, [searchParams]);

  const trackOrder = async (num?: string) => {
    const n = (num || orderNum).trim();
    if (!n) return;
    setLoading(true);
    setError("");
    setTracking(null);
    setOrderData(null);
    setFeedbackSubmitted(false);
    setFeedbackRating(null);
    setFeedbackRemarks("");
    try {
      // Fetch timeline
      const trackJson = await apiJson<any>(`/orders/track/${encodeURIComponent(n)}`);
      
      // Fetch full order details
      const orderJson = await apiJson<any>(`/orders/${encodeURIComponent(n)}`);

      if (trackJson.success && trackJson.data) {
        let finalTracking = trackJson.data;
        if (orderJson.success && orderJson.data && orderJson.data.trackingNumber) {
          try {
             const srResponse = await apiJson<any>(`/shipping/track/${orderJson.data.trackingNumber}`);
             const srJson = srResponse as any;
             if (srJson.tracking_data?.shipment_track_activities?.length > 0) {
                const activities = srJson.tracking_data.shipment_track_activities;
                const realScans = activities.map((act: any) => ({
                   label: act.activity + (act.location ? ` - ${act.location}` : ''),
                   completed: true,
                   timestamp: act.date
                }));
                // Overwrite backend timeline with real scans (keeping "Order Placed" at the start)
                finalTracking.timeline = [
                   finalTracking.timeline[0],
                   ...realScans.reverse()
                ];
             }
          } catch (e) {}
        }
        setTracking(finalTracking);
      } else {
        setError(trackJson.message || "Order not found");
      }

      if (orderJson.success && orderJson.data) {
        setOrderData(orderJson.data);
      }

      // Check feedback
      try {
        const fbCheck = await apiJson<any>(`/orders/feedback/check/${encodeURIComponent(n)}`);
        if (fbCheck.success) {
          setFeedbackSubmitted(fbCheck.data === true);
        }
      } catch (e) {}
    } catch (err: any) {
      if (err.status === 401 || err.message?.toLowerCase().includes("unauthorized") || err.message?.toLowerCase().includes("login") || err.message?.toLowerCase().includes("access")) {
        setIsAuthOpen(true);
        setError("Please log in to track your order.");
      } else {
        setError("Could not fetch tracking info");
      }
    } finally {
      setLoading(false);
    }
  };

  const getEstimatedDelivery = () => {
    if (tracking?.estimatedDeliveryDate) {
      try {
        const cleanedStr = tracking.estimatedDeliveryDate.replace(" ", "T");
        const d = new Date(cleanedStr);
        if (!isNaN(d.getTime())) {
          return d.toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric' });
        }
      } catch (e) {}
    }
    if (!orderData?.createdAt) return "TBD";
    const d = new Date(orderData.createdAt);
    d.setDate(d.getDate() + 5); // Example: 5 days shipping
    return d.toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh", paddingBottom: "60px" }}>
      <div className="container" style={{ paddingTop: "40px" }}>
        
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          
          <div style={{ background: "white", borderRadius: "16px", padding: "30px", boxShadow: "0 4px 20px rgba(0,0,0,0.03)", marginBottom: "20px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: "800", color: "#0f172a", marginBottom: "8px" }}>Track Your Order</h1>
            <p style={{ color: "#64748b", fontSize: "15px", marginBottom: "24px" }}>Enter your order ID to get real-time delivery updates.</p>
            
            <div style={{ display: "flex", gap: "12px", background: "#f1f5f9", padding: "8px", borderRadius: "12px" }}>
              <input
                type="text"
                placeholder="e.g. MVS-2026-000001"
                style={{ flex: 1, padding: "14px 20px", border: "none", background: "transparent", outline: "none", fontSize: "16px", fontWeight: "600", color: "#1e293b" }}
                value={orderNum}
                onChange={(e) => setOrderNum(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && trackOrder()}
              />
              <button 
                onClick={() => trackOrder()} 
                disabled={loading}
                style={{ background: "#0f172a", color: "white", padding: "0 30px", border: "none", borderRadius: "8px", fontWeight: "700", cursor: loading ? "not-allowed" : "pointer" }}
              >
                {loading ? "..." : "TRACK"}
              </button>
            </div>
            {error && <p style={{ color: "#ef4444", marginTop: "16px", fontSize: "14px", fontWeight: "500", display: "flex", alignItems: "center", gap: "6px" }}>⚠️ {error}</p>}
          </div>

          {tracking && orderData && (
            <div style={{ background: "white", borderRadius: "16px", padding: "30px", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
              
              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "20px", marginBottom: "30px", paddingBottom: "30px", borderBottom: "1px solid #e2e8f0" }}>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>Order ID</div>
                  <div style={{ fontSize: "22px", fontWeight: "800", color: "#0f172a" }}>{tracking.orderNumber}</div>
                  <div style={{ fontSize: "14px", color: "#64748b", marginTop: "4px" }}>Placed on {new Date(orderData.createdAt).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' })}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "13px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>Est. Delivery</div>
                  <div style={{ fontSize: "20px", fontWeight: "700", color: "#10b981" }}>{getEstimatedDelivery()}</div>
                  {tracking.trackingNumber && (
                     <div style={{ fontSize: "14px", color: "#0f172a", marginTop: "4px", fontWeight: "600" }}>
                       AWB: <span style={{ color: "#3b82f6" }}>{tracking.trackingNumber}</span> ({tracking.courierName})
                     </div>
                  )}
                </div>
              </div>

              {/* STATUS & SHIPROCKET REDIRECT */}
              <div style={{ 
                background: "#f8fafc", 
                borderRadius: "12px", 
                padding: "24px", 
                border: "1px solid #e2e8f0", 
                marginBottom: "35px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center"
              }}>
                <div style={{ fontSize: "13px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>Current Status</div>
                <div style={{ 
                  fontSize: "18px", 
                  fontWeight: "800", 
                  color: orderData.status === "DELIVERED" ? "#166534" : 
                         orderData.status === "CANCELLED" ? "#991b1b" : 
                         orderData.status === "SHIPPED" || orderData.status === "OUT_FOR_DELIVERY" ? "#1e40af" : "#92400e",
                  background: orderData.status === "DELIVERED" ? "#dcfce7" : 
                              orderData.status === "CANCELLED" ? "#fee2e2" : 
                              orderData.status === "SHIPPED" || orderData.status === "OUT_FOR_DELIVERY" ? "#dbeafe" : "#fef3c7",
                  padding: "6px 18px",
                  borderRadius: "999px",
                  display: "inline-block",
                  marginBottom: "20px"
                }}>
                  {orderData.status || "CONFIRMED"}
                </div>

                {tracking.trackingNumber ? (
                  <div style={{ width: "100%" }}>
                    <p style={{ fontSize: "15px", color: "#475569", margin: "0 0 20px", fontWeight: "500", lineHeight: "1.6" }}>
                      Your package is being shipped via <strong>{tracking.courierName || "Courier Partner"}</strong>.<br />
                      AWB Tracking Number: <span style={{ fontFamily: "monospace", fontWeight: "700", color: "#0f172a", fontSize: "16px" }}>{tracking.trackingNumber}</span>
                    </p>
                    <a 
                      href={`https://shiprocket.co/tracking/${tracking.trackingNumber}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-t"
                      style={{ 
                        display: "inline-flex", 
                        alignItems: "center", 
                        justifyContent: "center",
                        gap: "8px",
                        background: "#008080", 
                        color: "white", 
                        padding: "12px 28px", 
                        borderRadius: "8px", 
                        fontWeight: "700", 
                        fontSize: "15px",
                        textDecoration: "none",
                        boxShadow: "0 4px 12px rgba(0, 128, 128, 0.2)",
                        transition: "all 0.2s ease"
                      }}
                    >
                      🚚 Track Live on Shiprocket
                    </a>
                  </div>
                ) : (
                  <div>
                    <p style={{ fontSize: "14px", color: "#64748b", margin: 0 }}>
                      Once your order is handed over to our courier partner, the tracking details and a direct AWB tracking link will appear here.
                    </p>
                  </div>
                )}
              </div>

              {/* Order Details Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px", marginBottom: "40px" }}>
                <div>
                  <h3 style={{ fontSize: "14px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "12px" }}>Shipping Address</h3>
                  <div style={{ fontSize: "15px", color: "#0f172a", lineHeight: "1.6" }}>
                    <div style={{ fontWeight: "600", marginBottom: "4px" }}>{orderData.shippingName}</div>
                    {orderData.shippingAddress}<br />
                    {orderData.shippingCity}, {orderData.shippingState} {orderData.shippingPincode}<br />
                    <span style={{ color: "#64748b", marginTop: "4px", display: "inline-block" }}>Phone: {orderData.shippingPhone}</span>
                  </div>
                </div>
                <div>
                  <h3 style={{ fontSize: "14px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "12px" }}>Payment Info</h3>
                  <div style={{ fontSize: "15px", color: "#0f172a", lineHeight: "1.6" }}>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "8px" }}>
                      Method: <span style={{ fontWeight: "700", background: "#f1f5f9", padding: "2px 8px", borderRadius: "4px", fontSize: "13px" }}>{orderData.paymentMethod}</span>
                    </div>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      Status: <span style={{ fontWeight: "700", color: orderData.paymentStatus === "PAID" ? "#10b981" : "#f59e0b" }}>{orderData.paymentStatus}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items & Summary */}
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a", marginBottom: "16px" }}>Items in this Order</h3>
                <div style={{ border: "1px solid #e2e8f0", borderRadius: "12px", overflow: "hidden" }}>
                  {orderData.items.map((item: any, i: number) => (
                    <div key={i} style={{ display: "flex", gap: "16px", padding: "16px", borderBottom: i !== orderData.items.length - 1 ? "1px solid #e2e8f0" : "none", background: "#f8fafc" }}>
                      <div style={{ width: "80px", height: "80px", borderRadius: "8px", background: "white", border: "1px solid #e2e8f0", overflow: "hidden" }}>
                        <img src={item.imageUrl || "https://via.placeholder.com/80"} alt={item.productName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                        <div style={{ fontSize: "15px", fontWeight: "700", color: "#0f172a" }}>{item.productName}</div>
                        <div style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>Size: {item.size} | Color: {item.colorName}</div>
                        <div style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>Qty: {item.quantity}</div>
                      </div>
                      <div style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a", alignSelf: "center" }}>
                        {fmt(item.totalPrice)}
                      </div>
                    </div>
                  ))}
                  
                  {/* Summary Block */}
                  <div style={{ background: "white", padding: "20px 24px", borderTop: "1px solid #e2e8f0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "15px", color: "#64748b" }}>
                      <span>Subtotal</span>
                      <span>{fmt(orderData.subtotal)}</span>
                    </div>
                    {orderData.discountAmount > 0 && (
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "15px", color: "#10b981" }}>
                        <span>Discount</span>
                        <span>-{fmt(orderData.discountAmount)}</span>
                      </div>
                    )}
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px", fontSize: "15px", color: "#64748b" }}>
                      <span>Shipping</span>
                      <span>{orderData.shippingAmount > 0 ? fmt(orderData.shippingAmount) : "FREE"}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "16px", borderTop: "1px solid #e2e8f0", fontSize: "18px", fontWeight: "800", color: "#0f172a" }}>
                      <span>Grand Total</span>
                      <span>{fmt(orderData.totalAmount)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: "16px", marginTop: "40px" }}>
                <Link href="/products" style={{ flex: 1, textAlign: "center", background: "#f1f5f9", color: "#0f172a", padding: "14px", borderRadius: "10px", fontWeight: "700", textDecoration: "none" }}>
                  Continue Shopping
                </Link>
                <a href={`tel:${B.phone1}`} style={{ flex: 1, textAlign: "center", background: "#008080", color: "white", padding: "14px", borderRadius: "10px", fontWeight: "700", textDecoration: "none" }}>
                  Contact Support
                </a>
              </div>

              {!user && (
                <div style={{ marginTop: "30px", padding: "24px", background: "linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)", borderRadius: "16px", border: "1px solid #7dd3fc", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
                  <div style={{ flex: 1, minWidth: "260px", textAlign: "left" }}>
                    <h4 style={{ margin: "0 0 6px", fontSize: "16px", fontWeight: "800", color: "#0369a1" }}>Save Your Order History</h4>
                    <p style={{ margin: 0, fontSize: "14px", color: "#0284c7", lineHeight: "1.5" }}>Sign in or register an account to track all your orders, save delivery addresses, and checkout faster next time.</p>
                  </div>
                  <button 
                    onClick={() => setIsAuthOpen(true)}
                    style={{ background: "#0369a1", color: "white", padding: "12px 24px", border: "none", borderRadius: "8px", fontWeight: "700", cursor: "pointer" }}
                  >
                    Login / Register
                  </button>
                </div>
              )}

            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: "center", padding: "100px", color: "#64748b" }}>Loading Tracking Portal...</div>}>
      <TrackContent />
    </Suspense>
  );
}
