"use client";

import React, { useState, useEffect } from "react";
import AdminTopbar from "@/components/admin/AdminTopbar";
import { API_BASE, authHeaders } from "@/lib/api";

export default function AdminAppearance() {
    const [slides, setSlides] = useState([
        { img: "" },
        { img: "" },
        { img: "" }
    ]);
    const [bulkBanner, setBulkBanner] = useState("");
    const [homeVideo1, setHomeVideo1] = useState("");
    const [homeVideo2, setHomeVideo2] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => { fetchSettings(); }, []);

    const fetchSettings = async () => {
        try {
            const [r1, r2, r3, r4, rOld] = await Promise.all([
                fetch(`${API_BASE}/settings/hero_slides`),
                fetch(`${API_BASE}/settings/bulk_banner`),
                fetch(`${API_BASE}/settings/home_video_1`),
                fetch(`${API_BASE}/settings/home_video_2`),
                fetch(`${API_BASE}/settings/home_video`)
            ]);
            const d1 = await r1.json();
            const d2 = await r2.json();
            const d3 = await r3.json();
            const d4 = await r4.json();
            const dOld = await rOld.json();

            if (d1.success && d1.data) {
                try { setSlides(JSON.parse(d1.data)); } catch (e) { }
            } else {
                setSlides([
                    { img: "" },
                    { img: "" },
                    { img: "" }
                ]);
            }
            if (d2.success && d2.data) setBulkBanner(d2.data);
            else setBulkBanner("");

            if (d3.success && d3.data) setHomeVideo1(d3.data);
            else if (dOld.success && dOld.data) setHomeVideo1(dOld.data);

            if (d4.success && d4.data) setHomeVideo2(d4.data);
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
                fetch(`${API_BASE}/settings/home_video_1`, {
                    method: "POST", headers: h,
                    body: JSON.stringify({ value: homeVideo1 })
                }),
                fetch(`${API_BASE}/settings/home_video_2`, {
                    method: "POST", headers: h,
                    body: JSON.stringify({ value: homeVideo2 })
                }),
                fetch(`${API_BASE}/settings/home_video`, {
                    method: "POST", headers: h,
                    body: JSON.stringify({ value: homeVideo1 })
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

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, setter: (url: string) => void, currentUrl?: string) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const originalText = e.target.parentElement?.querySelector('label')?.innerText || "Uploading...";
        if (e.target.parentElement?.querySelector('label')) {
            e.target.parentElement.querySelector('label')!.innerText = "Uploading... ⏳";
        }

        try {
            const token = localStorage.getItem("token");
            if (currentUrl) {
                try {
                    await fetch(`${API_BASE}/upload`, {
                        method: "DELETE",
                        headers: { "Content-Type": "application/json", ...authHeaders(token) },
                        body: JSON.stringify({ url: currentUrl })
                    });
                } catch { }
            }

            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch(`${API_BASE}/upload`, {
                method: "POST",
                headers: authHeaders(token),
                body: formData
            });
            const data = await res.json();
            if (data.success) {
                setter(data.data);
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
                                        placeholder={i === 0 ? "https://your-bucket.s3.ap-south-1.amazonaws.com/media/banner1.webp" : "Leave blank to skip this slide"}
                                        style={{ ...inp, flex: 1 }}
                                    />
                                    <div style={{ position: 'relative', overflow: 'hidden', display: 'inline-block' }}>
                                        <button className="btn-s" style={{ padding: '12px 15px', borderRadius: 8, whiteSpace: 'nowrap' }}>📤 Upload</button>
                                        <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, (url) => handleSlideChange(i, url), s.img)} style={{ position: 'absolute', left: 0, top: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }} />
                                    </div>
                                </div>
                                {s.img && (
                                    <div style={{ marginTop: 10, height: 90, borderRadius: 8, border: "1px solid var(--bdr)", background: `url('${s.img}') center/cover no-repeat`, backgroundColor: "#f5f5f5" }} />
                                )}
                            </div>
                        ))}
                    </div>

                    {/* HOME DUAL VIDEO REELS */}
                    <div style={card}>
                        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>🎬 Homepage Dual Video Reels — "What Doctors Say"</h3>
                        <p style={{ fontSize: 13, color: "var(--lt)", marginBottom: 24 }}>
                            Upload video files directly to S3 bucket (`.mp4` / `.webm`) using the 📤 Upload Video buttons, or paste YouTube links.
                        </p>

                        {/* Video 1 */}
                        <div style={{ marginBottom: 20 }}>
                            <label style={label}>Reel Video 1 (Left Card - e.g. Women's Scrub Reel)</label>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <input
                                    type="text"
                                    value={homeVideo1}
                                    onChange={(e) => setHomeVideo1(e.target.value)}
                                    placeholder="https://medvastr-media-upload.s3.ap-south-1.amazonaws.com/video1.mp4 or YouTube URL"
                                    style={{ ...inp, flex: 1 }}
                                />
                                <div style={{ position: 'relative', overflow: 'hidden', display: 'inline-block' }}>
                                    <button className="btn-s" style={{ padding: '12px 15px', borderRadius: 8, whiteSpace: 'nowrap' }}>📤 Upload Video 1</button>
                                    <input type="file" accept="video/mp4,video/webm,video/quicktime" onChange={(e) => handleFileUpload(e, setHomeVideo1, homeVideo1)} style={{ position: 'absolute', left: 0, top: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }} />
                                </div>
                            </div>
                            {homeVideo1 && (
                                <div style={{ marginTop: 8, fontSize: 12, color: "#166534", fontWeight: 600 }}>
                                    ✅ Video 1 set: {homeVideo1.split('?')[0].slice(-40)}
                                </div>
                            )}
                        </div>

                        {/* Video 2 */}
                        <div style={{ marginBottom: 10 }}>
                            <label style={label}>Reel Video 2 (Right Card - e.g. Men's Scrub Reel)</label>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <input
                                    type="text"
                                    value={homeVideo2}
                                    onChange={(e) => setHomeVideo2(e.target.value)}
                                    placeholder="https://medvastr-media-upload.s3.ap-south-1.amazonaws.com/video2.mp4 or YouTube URL"
                                    style={{ ...inp, flex: 1 }}
                                />
                                <div style={{ position: 'relative', overflow: 'hidden', display: 'inline-block' }}>
                                    <button className="btn-s" style={{ padding: '12px 15px', borderRadius: 8, whiteSpace: 'nowrap' }}>📤 Upload Video 2</button>
                                    <input type="file" accept="video/mp4,video/webm,video/quicktime" onChange={(e) => handleFileUpload(e, setHomeVideo2, homeVideo2)} style={{ position: 'absolute', left: 0, top: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }} />
                                </div>
                            </div>
                            {homeVideo2 && (
                                <div style={{ marginTop: 8, fontSize: 12, color: "#166534", fontWeight: 600 }}>
                                    ✅ Video 2 set: {homeVideo2.split('?')[0].slice(-40)}
                                </div>
                            )}
                        </div>
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
                                <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, setBulkBanner, bulkBanner)} style={{ position: 'absolute', left: 0, top: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }} />
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
