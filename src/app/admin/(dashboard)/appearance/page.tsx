"use client";

import React, { useState, useEffect } from "react";
import AdminTopbar from "@/components/admin/AdminTopbar";
import { API_BASE, authHeaders } from "@/lib/api";
import { SLIDES } from "@/lib/data";

export default function AdminAppearance() {
    const [slides, setSlides] = useState([
        { img: "" },
        { img: "" },
        { img: "" }
    ]);
    const [bulkBanner, setBulkBanner] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const [resSlides, resBulk] = await Promise.all([
                fetch(`${API_BASE}/settings/hero_slides`),
                fetch(`${API_BASE}/settings/bulk_banner`)
            ]);
            const dataSlides = await resSlides.json();
            const dataBulk = await resBulk.json();

            if (dataSlides.success && dataSlides.data) {
                setSlides(JSON.parse(dataSlides.data));
            } else {
                // Init with defaults
                setSlides([
                    { img: SLIDES[0]?.img || "" },
                    { img: SLIDES[1]?.img || "" },
                    { img: "" }
                ]);
            }

            if (dataBulk.success && dataBulk.data) {
                setBulkBanner(dataBulk.data);
            } else {
                setBulkBanner("/ChatGPT Image May 13, 2026, 04_40_07 PM.png");
            }
        } catch (e) { }
        setLoading(false);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await fetch(`${API_BASE}/settings/hero_slides`, {
                method: "POST",
                headers: await authHeaders(),
                body: JSON.stringify({ value: JSON.stringify(slides.slice(0, 3)) })
            });
            await fetch(`${API_BASE}/settings/bulk_banner`, {
                method: "POST",
                headers: await authHeaders(),
                body: JSON.stringify({ value: bulkBanner })
            });
            alert("Settings saved successfully!");
        } catch (e) {
            alert("Error saving settings");
        }
        setSaving(false);
    };

    const handleSlideChange = (index: number, val: string) => {
        const s = [...slides];
        s[index].img = val;
        setSlides(s);
    };

    if (loading) return <div className="p-xl" style={{ color: "var(--lt)" }}>Loading Settings...</div>;

    return (
        <>
            <AdminTopbar title="Store Appearance" sub="Manage Homepage and Bulk Order banners" />
            <div className="p-xl">
                <div style={{ maxWidth: 700 }}>

                    {/* Home Banners */}
                    <div style={{ background: "white", padding: 30, borderRadius: 16, border: "1px solid var(--bdr)", marginBottom: 30 }}>
                        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Homepage Slider Banners</h3>
                        <p style={{ fontSize: 13, color: "var(--lt)", marginBottom: 20 }}>Enter the direct image URLs (from media library or external) for the main homepage sliding banners.</p>

                        {slides.map((s, i) => (
                            <div key={i} style={{ marginBottom: 20 }}>
                                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--lt)", display: "block", marginBottom: 6 }}>Slide {i + 1} Image URL</label>
                                <input
                                    type="text"
                                    value={s.img}
                                    onChange={(e) => handleSlideChange(i, e.target.value)}
                                    placeholder="/banner-1.jpg or https://..."
                                    style={{ width: "100%", padding: 12, borderRadius: 8, border: "1.5px solid var(--bdr)", fontSize: 14 }}
                                />
                                {s.img && (
                                    <div style={{ marginTop: 10, height: 100, borderRadius: 8, border: "1px solid var(--bdr)", background: `url(${s.img}) center/cover` }} />
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Bulk Banner */}
                    <div style={{ background: "white", padding: 30, borderRadius: 16, border: "1px solid var(--bdr)", marginBottom: 30 }}>
                        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Bulk Order Banner</h3>
                        <p style={{ fontSize: 13, color: "var(--lt)", marginBottom: 20 }}>Enter the direct image URL for the banner shown on the Bulk Orders page.</p>

                        <div style={{ marginBottom: 20 }}>
                            <label style={{ fontSize: 12, fontWeight: 700, color: "var(--lt)", display: "block", marginBottom: 6 }}>Bulk Banner Image URL</label>
                            <input
                                type="text"
                                value={bulkBanner}
                                onChange={(e) => setBulkBanner(e.target.value)}
                                placeholder="/bulk-banner.png or https://..."
                                style={{ width: "100%", padding: 12, borderRadius: 8, border: "1.5px solid var(--bdr)", fontSize: 14 }}
                            />
                            {bulkBanner && (
                                <div style={{ marginTop: 10, height: 100, borderRadius: 8, border: "1px solid var(--bdr)", background: `url(${bulkBanner}) center/contain no-repeat` }} />
                            )}
                        </div>
                    </div>

                    <button onClick={handleSave} disabled={saving} className="btn-p" style={{ padding: "0 30px", height: 50, fontSize: 15, borderRadius: 10 }}>
                        {saving ? "Saving..." : "Save Appearance Settings"}
                    </button>

                </div>
            </div>
        </>
    );
}
