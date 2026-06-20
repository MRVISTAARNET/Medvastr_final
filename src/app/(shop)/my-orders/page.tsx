"use client";

import React, { useEffect, useState } from "react";
import { useApp } from "@/context/AppContext";
import { fmt, fmtDate } from "@/lib/data";
import Link from "next/link";
import { apiJson } from "@/lib/api";
import { logError } from "@/lib/logger";

export default function MyOrdersPage() {
  const { user, isHydrated, setIsAuthOpen } = useApp();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      if (isHydrated) setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        const data = await apiJson<{ content: any[] }>("/orders");
        if (data.success) {
          setOrders(data.data?.content || []);
        } else {
          setError(data.message || "Could not load orders");
        }
      } catch (e) {
        logError("my-orders", e);
        setError("Failed to load orders. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, isHydrated]);

  if (!isHydrated || loading) {
    return <div className="page sec">Loading your orders...</div>;
  }

  if (!user) {
    return (
      <div className="page sec" style={{ textAlign: "center", padding: "100px 0" }}>
        <h2>Sign in required</h2>
        <p>Please sign in to view your order history.</p>
        <button
          type="button"
          className="btn-p"
          style={{ marginTop: 20 }}
          onClick={() => setIsAuthOpen(true)}
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="sec">
        <h1 style={{ fontFamily: "var(--serif)", marginBottom: 40 }}>My Orders</h1>

        {error && (
          <div style={{ background: "#fff5f5", color: "#c53030", padding: 16, borderRadius: 12, marginBottom: 24 }}>
            {error}
          </div>
        )}

        {orders.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", background: "#f9f9f9", borderRadius: 20 }}>
            <div style={{ fontSize: 50, marginBottom: 20 }} aria-hidden="true">
              📦
            </div>
            <h3>No orders yet</h3>
            <p>You haven&apos;t placed any orders with us yet.</p>
            <Link href="/products" className="btn-p" style={{ marginTop: 20, display: "inline-block" }}>
              Start Shopping
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {orders.map((o) => (
              <div
                key={o.id}
                style={{
                  border: "1px solid #eee",
                  borderRadius: 20,
                  padding: 30,
                  background: "#fff",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 15 }}>
                  <div>
                    <div style={{ fontSize: 12, color: "#888", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>
                      Order Number
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: "#008080" }}>{o.orderNumber}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: "#888", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>
                      Date Placed
                    </div>
                    <div style={{ fontWeight: 600 }}>{fmtDate(o.createdAt)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: "#888", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>
                      Total Amount
                    </div>
                    <div style={{ fontWeight: 800 }}>{fmt(o.totalAmount)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: "#888", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>
                      Status
                    </div>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "6px 12px",
                        borderRadius: 20,
                        fontSize: 12,
                        fontWeight: 700,
                        background: o.status === "DELIVERED" ? "#e6f4ea" : "#fef7e0",
                        color: o.status === "DELIVERED" ? "#1e7e34" : "#b05d22",
                      }}
                    >
                      {o.status}
                    </span>
                  </div>
                  <Link
                    href={`/track?order=${encodeURIComponent(o.orderNumber)}`}
                    className="btn-o"
                    style={{ height: 40, padding: "0 20px", borderRadius: 10, fontSize: 13 }}
                  >
                    Track Order
                  </Link>
                </div>

                <div style={{ borderTop: "1px solid #eee", paddingTop: 20 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#555", marginBottom: 15 }}>Items in this order:</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 15 }}>
                    {o.items?.map((item: any, idx: number) => (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          gap: 12,
                          alignItems: "center",
                          background: "#fcfcfc",
                          padding: 12,
                          borderRadius: 12,
                        }}
                      >
                        <div style={{
                          width: '50px',
                          height: '65px',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          background: '#f1f5f9',
                          flexShrink: 0
                        }}>
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt=""
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                              📦
                            </div>
                          )}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: 14 }}>
                            <span style={{ color: '#008080', marginRight: 4 }}>{item.quantity} ×</span>
                            {item.productName}
                          </div>
                          <div style={{ fontSize: 12, color: "#888" }}>
                            Size: {item.size} | {item.colorName}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
