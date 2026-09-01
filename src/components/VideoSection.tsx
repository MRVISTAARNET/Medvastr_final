"use client";

import React, { useState, useEffect } from "react";
import { API_BASE } from "@/lib/api";

const DEFAULT_VIDEO_1 = "https://medvastr-media-upload.s3.ap-south-1.amazonaws.com/videos/doctor-review-1.mp4";
const DEFAULT_VIDEO_2 = "https://medvastr-media-upload.s3.ap-south-1.amazonaws.com/videos/doctor-review-2.mp4";

export default function VideoSection() {
  const [video1, setVideo1] = useState(DEFAULT_VIDEO_1);
  const [video2, setVideo2] = useState(DEFAULT_VIDEO_2);
  const [title1, setTitle1] = useState("FlexiFit™ Women's V-Neck Scrub Suit");
  const [title2, setTitle2] = useState("Classic Solitaire™ Scrub Suit in Action");
  const [playing1, setPlaying1] = useState(false);
  const [playing2, setPlaying2] = useState(false);

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

  const getEmbedUrl = (url: string) => {
    if (!url) return "";
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      return url.replace("watch?v=", "embed/").replace("youtu.be/", "www.youtube.com/embed/") + "?autoplay=1";
    }
    return url;
  };

  const isDirectVideo = (url: string) => {
    if (!url) return false;
    const clean = url.split("?")[0].toLowerCase();
    return clean.endsWith(".mp4") || clean.endsWith(".webm") || clean.endsWith(".mov") || url.includes("/upload") || url.includes(".s3.");
  };

  const renderVideoPlayer = (url: string, title: string, isPlaying: boolean, onPlay: () => void) => {
    const embed = getEmbedUrl(url);
    const isDirect = isDirectVideo(url);

    if (isPlaying && url) {
      if (isDirect) {
        return (
          <video
            src={url}
            controls
            autoPlay
            loop
            playsInline
            className="w-full h-full object-cover rounded-[16px]"
          />
        );
      }
      return (
        <iframe
          src={embed}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full border-none rounded-[16px]"
        />
      );
    }

    return (
      <div className="vid-reel-card group" onClick={onPlay}>
        {/* Background Poster / Gradient Placeholder */}
        <div className="vid-reel-bg">
          <div className="vid-reel-overlay" />
        </div>

        {/* Play Button Overlay */}
        <div className="vid-reel-play-btn">
          <div className="vid-play-icon">▶</div>
        </div>

        {/* Bottom Caption Overlay */}
        <div className="vid-reel-caption">
          <span className="vid-reel-title">{title}</span>
          <span className="vid-reel-sub">Tap to watch video 🎬</span>
        </div>
      </div>
    );
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

        {/* 2 Vertical Video Reels Side-by-Side */}
        <div className="vid-reels-grid">
          <div className="vid-reel-wrapper">
            {renderVideoPlayer(video1, title1, playing1, () => setPlaying1(true))}
          </div>
          <div className="vid-reel-wrapper">
            {renderVideoPlayer(video2, title2, playing2, () => setPlaying2(true))}
          </div>
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
