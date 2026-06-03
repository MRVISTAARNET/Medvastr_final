"use client";

import React, { useEffect, useState } from "react";
import { useApp } from "@/context/AppContext";
import { fmt, fmtDate } from "@/lib/data";
import Link from "next/link";
import { API_BASE, authHeaders } from "@/lib/api";

export default function MyOrdersPage() {
    const { user, isHydrated } = useApp();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            const fetchOrders = async () => {
                try {
                    const res = await fetch(`${API_BASE}/orders`, {
                        headers: authHeaders()
                    });
                    const data = await res.json();
                    if (data.success) {
                        setOrders(data.data.content || []);
                    }
                } catch (e) {
                    console.error("Failed to fetch orders");
                } finally {
                    setLoading(false);
                }
            };
            fetchOrders();
        } else if (isHydrated) {
            setLoading(false);
        }
    }, [user, isHydrated]);

    if (!isHydrated || loading) return <div className="page sec">Loading your orders...</div>;

    if (!user) {
        return (
            <div className="page sec" style={{ textAlign: 'center', padding: '100px 0' }}>
                <h2>Access Denied</h2>
                <p>Please sign in to view your order history.</p>
                <Link href="/" className="btn-p" style={{ marginTop: 20 }}>Go Home</Link>
            </div>
        );
    }

    return (
        <div className="page">
            <div className="sec">
                <h1 style={{ fontFamily: 'var(--serif)', marginBottom: 40 }}>My Orders</h1>

                {orders.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 0', background: '#f9f9f9', borderRadius: 20 }}>
                        <div style={{ fontSize: 50, marginBottom: 20 }}>📦</div>
                        <h3>No orders yet</h3>
                        <p>You haven't placed any orders with us yet.</p>
                        <Link href="/" className="btn-p" style={{ marginTop: 20, display: 'inline-block' }}>Start Shopping</Link>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        {orders.map((o) => (
                            <div key={o.id} style={{ border: '1px solid #eee', borderRadius: 20, padding: 30, background: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 15 }}>
                                    <div>
                                        <div style={{ fontSize: 12, color: '#888', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Order Number</div>
                                        <div style={{ fontSize: 18, fontWeight: 800, color: '#008080' }}>{o.orderNumber}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 12, color: '#888', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Date Placed</div>
                                        <div style={{ fontWeight: 600 }}>{fmtDate(o.createdAt)}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 12, color: '#888', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Total Amount</div>
                                        <div style={{ fontWeight: 800 }}>{fmt(o.totalAmount)}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 12, color: '#888', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Status</div>
                                        <span style={{
                                            display: 'inline-block',
                                            padding: '6px 12px',
                                            borderRadius: 20,
                                            fontSize: 12,
                                            fontWeight: 700,
                                            background: o.status === 'DELIVERED' ? '#e6f4ea' : '#fef7e0',
                                            color: o.status === 'DELIVERED' ? '#1e7e34' : '#b05d22'
                                        }}>
                                            {o.status}
                                        </span>
                                    </div>
                                    <Link href={`/track?order=${o.orderNumber}`} className="btn-o" style={{ height: 40, padding: '0 20px', borderRadius: 10, fontSize: 13 }}>Track Order</Link>
                                </div>

                                <div style={{ borderTop: '1px solid #eee', paddingTop: 20 }}>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: '#555', marginBottom: 15 }}>Items in this order:</div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 15 }}>
                                        {o.items?.map((item: any, idx: number) => (
                                            <div key={idx} style={{ display: 'flex', gap: 12, alignItems: 'center', background: '#fcfcfc', padding: 12, borderRadius: 12 }}>
                                                <div style={{ fontWeight: 700 }}>{item.quantity} ×</div>
                                                <div>
                                                    <div style={{ fontWeight: 700, fontSize: 14 }}>{item.productName}</div>
                                                    <div style={{ fontSize: 12, color: '#888' }}>Size: {item.size} | {item.colorName}</div>
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
