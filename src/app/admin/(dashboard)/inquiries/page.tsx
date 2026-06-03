"use client";

import React, { useState, useEffect } from "react";
import AdminTopbar from "@/components/admin/AdminTopbar";
import { API_BASE, authHeaders } from "@/lib/api";

export default function AdminInquiries() {
    const [inquiries, setInquiries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchInquiries();
    }, []);

    const fetchInquiries = async () => {
        try {
            const res = await fetch(`${API_BASE}/inquiries`, {
                headers: await authHeaders(),
            });
            const data = await res.json();
            if (data.success) {
                setInquiries(data.data);
            }
        } catch (e) { }
        setLoading(false);
    };

    const getStatusColor = (s: string) => (s === "NEW" ? "var(--teal)" : "#999");

    if (loading) return <div className="p-xl" style={{ color: "var(--lt)" }}>Loading Inquiries...</div>;

    return (
        <>
            <AdminTopbar title="Inquiries & Form Submissions" sub="View Bulk Orders and Contact form requests" />
            <div className="p-xl">
                {inquiries.length === 0 ? (
                    <div style={{ padding: "40px 0", color: "var(--lt)", textAlign: "center" }}>No inquiries yet.</div>
                ) : (
                    <div style={{ display: "grid", gap: 16 }}>
                        {inquiries.map((iq) => (
                            <div key={iq.id} style={{
                                background: "white", padding: 24, borderRadius: 12, border: "1px solid var(--bdr)"
                            }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                                    <div>
                                        <div style={{ display: "inline-block", background: iq.type === "BULK_ORDER" ? "#e6f2f2" : "#f5f5f5", color: iq.type === "BULK_ORDER" ? "var(--teal)" : "#555", padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700, marginBottom: 8, textTransform: "uppercase" }}>
                                            {iq.type === "BULK_ORDER" ? "Bulk Order" : "Contact Us"}
                                        </div>
                                        <h4 style={{ margin: 0, fontSize: 17 }}>{iq.name}</h4>
                                    </div>
                                    <div style={{ fontSize: 13, color: "var(--lt)" }}>
                                        {new Date(iq.createdAt).toLocaleString()}
                                    </div>
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 16, fontSize: 14 }}>
                                    <div><strong>Email:</strong> <a href={`mailto:${iq.email}`} style={{ color: "var(--teal)" }}>{iq.email}</a></div>
                                    <div><strong>Phone:</strong> {iq.phone}</div>
                                </div>
                                <div style={{ background: "#f8f8f8", padding: 16, borderRadius: 8, fontSize: 14, color: "#333", whiteSpace: "pre-wrap", border: "1px solid #eee" }}>
                                    {iq.message}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
