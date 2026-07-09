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

              {/* TIMELINE */}
              {tracking.timeline?.length > 0 && (
                <div style={{ marginBottom: "40px", paddingBottom: "40px", borderBottom: "1px solid #e2e8f0" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a", marginBottom: "24px" }}>Delivery Status</h3>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                    {tracking.timeline.map((ev: any, i: number) => {
                      const isLast = i === tracking.timeline.length - 1;
                      const isCompleted = ev.completed;
                      const isCurrent = isCompleted && (!tracking.timeline[i+1] || !tracking.timeline[i+1].completed);
                      
                      return (
                        <div key={i} style={{ display: "flex", gap: "20px" }}>
                          {/* Node & Line */}
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "24px" }}>
                            <div style={{ 
                              width: "24px", height: "24px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2,
                              background: isCompleted ? "#10b981" : "#f1f5f9",
                              color: "white", fontSize: "12px", border: isCompleted ? "none" : "2px solid #e2e8f0",
                              boxShadow: isCurrent ? "0 0 0 4px rgba(16, 185, 129, 0.2)" : "none"
                            }}>
                              {isCompleted && "✓"}
                            </div>
                            {!isLast && (
                              <div style={{ width: "2px", flex: 1, background: isCompleted && !isCurrent ? "#10b981" : "#e2e8f0", margin: "4px 0" }} />
                            )}
                          </div>
                          
                          {/* Content */}
                          <div style={{ paddingBottom: isLast ? "0" : "30px", paddingTop: "2px" }}>
                            <div style={{ fontSize: "15px", fontWeight: isCurrent ? "800" : "600", color: isCompleted ? "#0f172a" : "#94a3b8" }}>
                              {ev.status || ev.label}
                            </div>
                            {ev.timestamp && (
                              <div style={{ fontSize: "13px", color: "#64748b", marginTop: "2px" }}>
                                {new Date(ev.timestamp).toLocaleString("en-US", { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {/* FEEDBACK WIDGET */}
              <div style={{ marginTop: '20px', marginBottom: '40px', padding: '30px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', marginBottom: '6px', textAlign: 'center' }}>
                  Rate Your Experience
                </h3>
                <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px', textAlign: 'center' }}>
                  How likely are you to recommend Medvastr to your friends and family?
                </p>

                {feedbackSubmitted ? (
                  <div style={{ textAlign: 'center', padding: '10px 0' }}>
                    <div style={{ fontSize: '40px', marginBottom: '12px' }}>🎉</div>
                    <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#10b981', margin: '0 0 6px' }}>Thank you for your feedback!</h4>
                    <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>Your response helps us improve the Medvastr shopping experience.</p>
                  </div>
                ) : (
                  <div>
                    {/* Rating buttons 0-10 */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '24px' }}>
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                        const isSelected = feedbackRating === num;
                        return (
                          <button
                            key={num}
                            onClick={() => setFeedbackRating(num)}
                            style={{
                              width: '42px',
                              height: '42px',
                              borderRadius: '50%',
                              border: isSelected ? 'none' : '1px solid #cbd5e1',
                              background: isSelected ? '#008080' : 'white',
                              color: isSelected ? 'white' : '#0f172a',
                              fontWeight: '700',
                              fontSize: '14px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.2s ease',
                              boxShadow: isSelected ? '0 4px 10px rgba(0, 128, 128, 0.3)' : 'none'
                            }}
                          >
                            {num}
                          </button>
                        );
                      })}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b', padding: '0 10px', marginTop: '-18px', marginBottom: '24px' }}>
                      <span>Not likely at all</span>
                      <span>Extremely likely</span>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>
                        Remarks / Suggestions (Optional)
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Please tell us about your experience..."
                        value={feedbackRemarks}
                        onChange={(e) => setFeedbackRemarks(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          outline: 'none',
                          fontSize: '14px',
                          resize: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    <button
                      onClick={async () => {
                        if (feedbackRating === null) {
                          alert('Please select a rating score first.');
                          return;
                        }
                        setSubmittingFeedback(true);
                        try {
                          const res = await apiJson<any>('/orders/feedback', {
                            method: 'POST',
                            body: JSON.stringify({
                              orderNumber: tracking.orderNumber,
                              rating: feedbackRating,
                              remarks: feedbackRemarks
                            })
                          });
                          if (res.success) {
                            setFeedbackSubmitted(true);
                          } else {
                            alert(res.message || 'Failed to submit feedback');
                          }
                        } catch (e) {
                          alert('Failed to submit feedback. Please try again.');
                        } finally {
                          setSubmittingFeedback(false);
                        }
                      }}
                      disabled={feedbackRating === null || submittingFeedback}
                      style={{
                        width: '100%',
                        background: '#0f172a',
                        color: 'white',
                        padding: '14px',
                        border: 'none',
                        borderRadius: '10px',
                        fontWeight: '700',
                        fontSize: '15px',
                        cursor: feedbackRating === null || submittingFeedback ? 'not-allowed' : 'pointer',
                        opacity: feedbackRating === null ? 0.6 : 1
                      }}
                    >
                      {submittingFeedback ? 'Submitting...' : 'Submit Feedback'}
                    </button>
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
