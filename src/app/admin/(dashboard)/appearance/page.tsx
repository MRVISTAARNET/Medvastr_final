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
    const [homeVideo, setHomeVideo] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => { fetchSettings(); }, []);

    const fetchSettings = async () => {
        try {
            const [r1, r2, r3] = await Promise.all([
                fetch(`${API_BASE}/settings/hero_slides`),
                fetch(`${API_BASE}/settings/bulk_banner`),
                fetch(`${API_BASE}/settings/home_video`)
            ]);
            const d1 = await r1.json();
            const d2 = await r2.json();
            const d3 = await r3.json();

            if (d1.success && d1.data) {
                try { setSlides(JSON.parse(d1.data)); } catch (e) { }
            } else {
                setSlides([
                    { img: SLIDES[0]?.img || "" },
                    { img: SLIDES[1]?.img || "" },
                    { img: "" }
                ]);
            }
            if (d2.success && d2.data) setBulkBanner(d2.data);
            else setBulkBanner("/ChatGPT Image May 13, 2026, 04_40_07 PM.png");
            if (d3.success && d3.data) setHomeVideo(d3.data);
        } catch (e) { }
        setLoading(false);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const h = { ...authHeaders(), "Content-Type": "application/json" };
            await Promise.all([
                fetch(`${API_BASE}/settings/hero_slides`, {
                    method: "POST", headers: h,
                    body: JSON.stringify({ value: JSON.stringify(slides.slice(0, 3)) })
                }),
                fetch(`${API_BASE}/settings/bulk_banner`, {
                    method: "POST", headers: h,
                    body: JSON.stringify({ value: bulkBanner })
                }),
                fetch(`${API_BASE}/settings/home_video`, {
                    method: "POST", headers: h,
                    body: JSON.stringify({ value: homeVideo })
                })
            ]);
            alert("✅ Appearance settings saved! Changes will reflect on the site.");
        } catch (e) {
            alert("Error saving settings. Please try again.");
        }
        setSaving(false);
    };

    const handleSlideChange = (i: number, val: string) => {
        const s = [...slides];
        s[i] = { ...s[i], img: val };
        setSlides(s);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, setter: (url: string) => void) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const originalText = e.target.parentElement?.querySelector('label')?.innerText || "Uploading...";
        if (e.target.parentElement?.querySelector('label')) {
            e.target.parentElement.querySelector('label')!.innerText = "Uploading... ⏳";
        }

        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch(`${API_BASE}/media/upload`, {
                method: "POST",
                headers: await authHeaders(),
                body: formData
            });
            const data = await res.json();
            if (data.success) {
                setter(data.data.url);
            } else {
                alert("Upload failed");
            }
        } catch (error) {
            alert("Error uploading file");
        } finally {
            if (e.target.parentElement?.querySelector('label')) {
                e.target.parentElement.querySelector('label')!.innerText = originalText;
            }
            e.target.value = "";
        }
    };

    if (loading) return <div className="p-xl" style={{ color: "var(--lt)" }}>Loading Settings...</div>;

    const inp = { width: "100%", padding: "12px 14px", borderRadius: 8, border: "1.5px solid var(--bdr)", fontSize: 13, fontFamily: "inherit", boxSizing: "border-box" } as React.CSSProperties;
    const card = { background: "white", padding: "20px 30px", borderRadius: 16, border: "1px solid var(--bdr)", marginBottom: 20 } as React.CSSProperties;
    const label = { fontSize: 12, fontWeight: 700, color: "var(--lt)", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" } as React.CSSProperties;

    return (
        <>
            <AdminTopbar title="Store Appearance" sub="Manage banners and video for the homepage" />
            <div className="p-xl">
                <div style={{ maxWidth: "100%", boxSizing: "border-box" }}>

                    {/* HOME BANNERS */}
                    <div style={card}>
                        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>🖼️ Homepage Slider Banners</h3>
                        <p style={{ fontSize: 13, color: "var(--lt)", marginBottom: 24 }}>
                            Upload images to S3 via Media Library, then paste the URL here. Recommended size: 1920×600px.
                        </p>
                        {slides.map((s, i) => (
                            <div key={i} style={{ marginBottom: 22 }}>
                                <label style={label}>Banner Slide {i + 1}</label>
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    <input
                                        type="text"
                                        value={s.img}
                                        onChange={(e) => handleSlideChange(i, e.target.value)}
                                        placeholder={i === 0 ? "/Last_Day_Website_Home_page_Desktop_Banner.webp" : "Leave blank to skip this slide"}
                                        style={{ ...inp, flex: 1 }}
                                    />
                                    <div style={{ position: 'relative', overflow: 'hidden', display: 'inline-block' }}>
                                        <button className="btn-s" style={{ padding: '12px 15px', borderRadius: 8, whiteSpace: 'nowrap' }}>📤 Upload</button>
                                        <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, (url) => handleSlideChange(i, url))} style={{ position: 'absolute', left: 0, top: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }} />
                                    </div>
                                </div>
                                {s.img && (
                                    <div style={{ marginTop: 10, height: 90, borderRadius: 8, border: "1px solid var(--bdr)", background: `url('${s.img}') center/cover no-repeat`, backgroundColor: "#f5f5f5" }} />
                                )}
                            </div>
                        ))}
                    </div>

                    {/* HOME VIDEO */}
                    <div style={card}>
                        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>🎬 Homepage Video — "Built for the Front Lines"</h3>
                        <p style={{ fontSize: 13, color: "var(--lt)", marginBottom: 24 }}>
                            Paste a YouTube link (e.g. <code>https://www.youtube.com/watch?v=XXXX</code>) or YouTube short link. Leave blank to show the placeholder.
                        </p>
                        <label style={label}>YouTube Video URL or Direct Upload</label>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <input
                                type="text"
                                value={homeVideo}
                                onChange={(e) => setHomeVideo(e.target.value)}
                                placeholder="https://www.youtube.com/watch?v=..."
                                style={{ ...inp, flex: 1 }}
                            />
                            <div style={{ position: 'relative', overflow: 'hidden', display: 'inline-block' }}>
                                <button className="btn-s" style={{ padding: '12px 15px', borderRadius: 8, whiteSpace: 'nowrap' }}>📤 Upload Video</button>
                                <input type="file" accept="video/mp4,video/webm" onChange={(e) => handleFileUpload(e, setHomeVideo)} style={{ position: 'absolute', left: 0, top: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }} />
                            </div>
                        </div>
                        {homeVideo && (
                            <div style={{ marginTop: 14, padding: "10px 14px", background: "var(--off)", borderRadius: 8, fontSize: 13, color: "var(--t)", fontWeight: 600 }}>
                                ✅ Video will show as an embedded player on the homepage.
                            </div>
                        )}
                    </div>

                    {/* BULK BANNER */}
                    <div style={card}>
                        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>📦 Bulk Order Banner</h3>
                        <p style={{ fontSize: 13, color: "var(--lt)", marginBottom: 24 }}>
                            Image shown in the Bulk Order section on the homepage. Recommended: wide landscape image.
                        </p>
                        <label style={label}>Bulk Banner Image URL</label>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <input
                                type="text"
                                value={bulkBanner}
                                onChange={(e) => setBulkBanner(e.target.value)}
                                placeholder="/bulk-banner.png or https://..."
                                style={{ ...inp, flex: 1 }}
                            />
                            <div style={{ position: 'relative', overflow: 'hidden', display: 'inline-block' }}>
                                <button className="btn-s" style={{ padding: '12px 15px', borderRadius: 8, whiteSpace: 'nowrap' }}>📤 Upload</button>
                                <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, setBulkBanner)} style={{ position: 'absolute', left: 0, top: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }} />
                            </div>
                        </div>
                        {bulkBanner && (
                            <div style={{ marginTop: 10, height: 90, borderRadius: 8, border: "1px solid var(--bdr)", background: `url('${bulkBanner}') center/contain no-repeat`, backgroundColor: "#fbfaf8" }} />
                        )}
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="btn-p"
                        style={{ padding: "0 40px", height: 54, fontSize: 16, borderRadius: 12, opacity: saving ? 0.7 : 1 }}
                    >
                        {saving ? "Saving..." : "💾 Save All Appearance Settings"}
                    </button>

                </div>
            </div>
        </>
    );
}
