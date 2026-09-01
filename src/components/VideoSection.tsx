"use client";

import React, { useState, useEffect } from "react";
import { API_BASE } from "@/lib/api";

const DEFAULT_VIDEO_1 = "https://medvastr-media-upload.s3.ap-south-1.amazonaws.com/videos/doctor-review-1.mp4";
const DEFAULT_VIDEO_2 = "https://medvastr-media-upload.s3.ap-south-1.amazonaws.com/videos/doctor-review-2.mp4";

export default function VideoSection() {
  const [video1, setVideo1] = useState(DEFAULT_VIDEO_1);
  const [video2, setVideo2] = useState(DEFAULT_VIDEO_2);
  const [activePlaying, setActivePlaying] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/settings/home_video_1`).then(r => r.json()).catch(() => ({})),
      fetch(`${API_BASE}/settings/home_video_2`).then(r => r.json()).catch(() => ({})),
      fetch(`${API_BASE}/settings/home_video`).then(r => r.json()).catch(() => ({}))
    ]).then(([d1, d2, dOld]) => {
      if (d1?.success && d1?.data) setVideo1(d1.data);
      else if (dOld?.success && dOld?.data) setVideo1(dOld.data);

      if (d2?.success && d2?.data) setVideo2(d2.data);
    });
  }, []);

  const reels = [
    {
      id: 1,
      title: "ecoflex™ Women's V-Neck",
      sub: "Date with A Doctor 🩺",
      url: video1 || DEFAULT_VIDEO_1,
      poster: "https://images.unsplash.com/photo-1594824813571-24a69c100dd1?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: 2,
      title: "6sense (Black), Steel Blue",
      sub: "Honest Clinical Review ✨",
      url: video2 || DEFAULT_VIDEO_2,
      poster: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: 3,
      title: "ecoflex™ Men's Solitaire",
      sub: "First Day as A Doctor 🥼",
      url: video1 || DEFAULT_VIDEO_1,
      poster: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: 4,
      title: "Medvarn FlexiFit™ Scrub Suit",
      sub: "Performance in Action 🏃",
      url: video2 || DEFAULT_VIDEO_2,
      poster: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80"
    }
  ];

  const getEmbedUrl = (url: string) => {
    if (!url) return "";
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      return url.replace("watch?v=", "embed/").replace("youtu.be/", "www.youtube.com/embed/") + "?autoplay=1";
    }
    return url;
  };

  const isDirectVideo = (url: string) => {
    if (!url) return true;
    const clean = url.split("?")[0].toLowerCase();
    return clean.endsWith(".mp4") || clean.endsWith(".webm") || clean.endsWith(".mov") || url.includes("/upload") || url.includes(".s3.");
  };

  return (
    <div className="vid-sec">
      <div className="vid-in">
        <div className="vid-ey">What Doctors Say</div>
        <h2 className="vid-t">
          Join the <em>Medvarn club</em>
        </h2>
        <p className="vid-s">
          Watch real healthcare professionals perform in high-pressure clinical environments wearing Medvarn scrubs.
        </p>

        {/* 4 Portrait Video Reel Carousel (Responsive Grid / Horizontal Touch Track) */}
        <div className="vid-reels-scroll-track">
          {reels.map((reel) => {
            const isPlaying = activePlaying === reel.id;
            const embed = getEmbedUrl(reel.url);
            const isDirect = isDirectVideo(reel.url);

            return (
              <div key={reel.id} className="vid-reel-card-item">
                {isPlaying ? (
                  <div style={{ width: "100%", height: "100%", position: "relative", borderRadius: "18px", overflow: "hidden", background: "#000" }}>
                    {isDirect ? (
                      <video
                        src={reel.url}
                        controls
                        autoPlay
                        loop
                        playsInline
                        style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "18px" }}
                      />
                    ) : (
                      <iframe
                        src={embed}
                        title={reel.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        style={{ width: "100%", height: "100%", border: "none", borderRadius: "18px" }}
                      />
                    )}
                  </div>
                ) : (
                  <div className="vid-reel-card-inner" onClick={() => setActivePlaying(reel.id)}>
                    {/* Background Poster Image */}
                    <div
                      className="vid-reel-poster-bg"
                      style={{ backgroundImage: `url('${reel.poster}')` }}
                    />
                    
                    <div className="vid-reel-gradient-overlay" />

                    {/* Play Circle Icon */}
                    <div className="vid-reel-play-btn">
                      <div className="vid-play-icon">▶</div>
                    </div>

                    {/* Bottom Caption Title matching screenshot 3 */}
                    <div className="vid-reel-caption-bar">
                      <div className="vid-reel-caption-title">{reel.title}</div>
                      <div className="vid-reel-caption-sub">{reel.sub}</div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Feature Badges Strip */}
        <div className="vid-perks">
          {[
            ["🧪", "Fluid Resistant"],
            ["🏃", "Athletic Stretch"],
            ["🧊", "Cool-Touch Tech"],
            ["🛡️", "Anti-Microbial"],
          ].map(([i, t]) => (
            <div className="vp" key={t}>
              <span className="vp-i">{i}</span>
              {t}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
