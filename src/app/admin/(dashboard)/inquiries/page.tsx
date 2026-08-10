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

    const formatDate = (dateStr: string) => {
        if (!dateStr) return "";
        try {
            const isoStr = (dateStr.endsWith("Z") || dateStr.includes("+")) ? dateStr : dateStr + "Z";
            const d = new Date(isoStr);
            return d.toLocaleString("en-IN", {
                timeZone: "Asia/Kolkata",
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: true
            });
        } catch (e) {
            return dateStr;
        }
    };

    if (loading) return <div className="p-xl" style={{ color: "var(--lt)" }}>Loading Inquiries...</div>;

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
            <AdminTopbar title="Inquiries & Form Submissions" sub="View Bulk Orders and Contact form requests" />
            <div style={{ flex: 1, overflowY: "auto", padding: "24px 32px 60px", maxWidth: "100%" }}>
                {inquiries.length === 0 ? (
                    <div style={{ padding: "40px 0", color: "var(--lt)", textAlign: "center" }}>No inquiries yet.</div>
                ) : (
                    <div style={{ display: "grid", gap: 16, maxWidth: "1200px", margin: "0 auto" }}>
                        {inquiries.map((iq) => (
                            <div key={iq.id} style={{
                                background: "white", padding: 24, borderRadius: 12, border: "1px solid var(--bdr)", boxShadow: "0 2px 8px rgba(0,0,0,0.03)"
                            }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
                                    <div>
                                        <div style={{ display: "inline-block", background: iq.type === "BULK_ORDER" ? "#e6f2f2" : "#f5f5f5", color: iq.type === "BULK_ORDER" ? "var(--teal)" : "#555", padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700, marginBottom: 8, textTransform: "uppercase" }}>
                                            {iq.type === "BULK_ORDER" ? "Bulk Order" : "Contact Us"}
                                        </div>
                                        <h4 style={{ margin: 0, fontSize: 17, color: "#0f172a", fontWeight: 700 }}>{iq.name}</h4>
                                    </div>
                                    <div style={{ fontSize: 13, color: "#64748b", fontWeight: 600, background: "#f8fafc", padding: "4px 10px", borderRadius: 6, border: "1px solid #e2e8f0" }}>
                                        🕒 {formatDate(iq.createdAt)}
                                    </div>
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 16, fontSize: 14 }}>
                                    <div><strong>Email:</strong> <a href={`mailto:${iq.email}`} style={{ color: "var(--teal)", fontWeight: 600 }}>{iq.email}</a></div>
                                    <div><strong>Phone:</strong> <span style={{ fontWeight: 600 }}>{iq.phone}</span></div>
                                </div>
                                <div style={{ background: "#f8fafc", padding: 16, borderRadius: 8, fontSize: 14, color: "#334155", whiteSpace: "pre-wrap", border: "1px solid #e2e8f0", lineHeight: 1.6 }}>
                                    {iq.message}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
