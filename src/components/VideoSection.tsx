"use client";

import React, { useState, useEffect, useRef } from "react";
import { API_BASE } from "@/lib/api";

const DEFAULT_VIDEO_1 = "https://medvastr-assets.s3.ap-south-1.amazonaws.com/videos/doctor-review-1.mp4";
const DEFAULT_VIDEO_2 = "https://medvastr-assets.s3.ap-south-1.amazonaws.com/videos/doctor-review-2.mp4";

export default function VideoSection() {
  const [video1, setVideo1] = useState(DEFAULT_VIDEO_1);
  const [video2, setVideo2] = useState(DEFAULT_VIDEO_2);

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
      url: video1 || DEFAULT_VIDEO_1
    },
    {
      id: 2,
      title: "6sense (Black), Steel Blue",
      sub: "Clinical Performance in Action ✨",
      url: video2 || DEFAULT_VIDEO_2
    }
  ];

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

        {/* 2 Portrait Video Reels (Natural 9:16 Ratio - No Cropping) */}
        <div className="vid-reels-row">
          {reels.map((reel) => (
            <ReelCard key={reel.id} reel={reel} />
          ))}
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

function ReelCard({ reel }: { reel: { id: number; title: string; sub: string; url: string } }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        if (videoRef.current) {
          videoRef.current.muted = true;
          setIsMuted(true);
          videoRef.current.play();
          setIsPlaying(true);
        }
      });
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <div className="vid-reel-card-portrait group" onClick={togglePlay}>
      <video
        ref={videoRef}
        src={reel.url}
        loop
        playsInline
        muted={isMuted}
        preload="metadata"
        className="vid-reel-video"
      />

      {/* Subtle Gradient Overlay */}
      <div className="vid-reel-gradient-overlay" />

      {/* Floating Audio Mute/Unmute Pill */}
      {isPlaying && (
        <button className="vid-reel-mute-btn" onClick={toggleMute} title={isMuted ? "Unmute Sound" : "Mute Sound"}>
          {isMuted ? "🔇 Muted" : "🔊 Sound On"}
        </button>
      )}

      {/* Play/Pause Center Circle Icon */}
      {!isPlaying && (
        <div className="vid-reel-play-btn">
          <div className="vid-play-icon">▶</div>
        </div>
      )}

      {/* Bottom Title Caption Bar */}
      <div className="vid-reel-caption-bar">
        <div className="vid-reel-caption-title">{reel.title}</div>
        <div className="vid-reel-caption-sub">{reel.sub}</div>
      </div>
    </div>
  );
}
