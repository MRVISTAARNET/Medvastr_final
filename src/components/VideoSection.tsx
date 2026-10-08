"use client";

import React, { useState, useEffect, useRef } from "react";
import { API_BASE } from "@/lib/api";

const DEFAULT_VIDEO_1 = "https://medvastr-assets.s3.ap-south-1.amazonaws.com/videos/doctor-review-1.mp4";
const DEFAULT_VIDEO_2 = "https://medvastr-assets.s3.ap-south-1.amazonaws.com/videos/doctor-review-2.mp4";
const DEFAULT_VIDEO_3 = "https://medvastr-assets.s3.ap-south-1.amazonaws.com/videos/doctor-review-3.mp4";
const DEFAULT_VIDEO_4 = "https://medvastr-assets.s3.ap-south-1.amazonaws.com/videos/doctor-review-4.mp4";

export default function VideoSection() {
  const [video1, setVideo1] = useState(DEFAULT_VIDEO_1);
  const [video2, setVideo2] = useState(DEFAULT_VIDEO_2);
  const [video3, setVideo3] = useState(DEFAULT_VIDEO_3);
  const [video4, setVideo4] = useState(DEFAULT_VIDEO_4);
  const [title1, setTitle1] = useState("FlexiFit Women's V-Neck Scrub Suit");
  const [title2, setTitle2] = useState("Classic Solitaire Scrub Suit");
  const [title3, setTitle3] = useState("Pro-Active Men's Scrub");
  const [title4, setTitle4] = useState("Medvarn Signature Scrub");

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
      title: title1 ? title1.replace(/™/g, "") : "FlexiFit Women's V-Neck Scrub Suit",
      sub: "Clinical Doctor Review 🩺",
      url: video1 || DEFAULT_VIDEO_1
    },
    {
      id: 2,
      title: title2 ? title2.replace(/™/g, "") : "Classic Solitaire Scrub Suit",
      sub: "Performance in Action ✨",
      url: video2 || DEFAULT_VIDEO_2
    },
    {
      id: 3,
      title: title3 ? title3.replace(/™/g, "") : "Pro-Active Men's Scrub",
      sub: "All-Day Comfort 💯",
      url: video3 || DEFAULT_VIDEO_3
    },
    {
      id: 4,
      title: title4 ? title4.replace(/™/g, "") : "Medvarn Signature Scrub",
      sub: "Premium Quality 🌟",
      url: video4 || DEFAULT_VIDEO_4
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

        {/* Portrait Video Reels (Natural 9:16 Ratio - No Cropping) */}
        <div className="vid-reels-row">
          {reels.map((reel) => (
            <ReelCard key={reel.id} reel={reel} />
          ))}
        </div>

        {/* Scroll Indicator */}
        <div className="vid-scroll-indicator">
          <span className="vid-scroll-text">← Swipe to explore more videos →</span>
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

      {/* Subtle Bottom Gradient Overlay */}
      <div className="vid-reel-gradient-overlay" />

      {/* Floating Audio Mute/Unmute Pill */}
      {isPlaying && (
        <button className="vid-reel-mute-btn" onClick={toggleMute} title={isMuted ? "Unmute Sound" : "Mute Sound"}>
          {isMuted ? "🔇 Muted" : "🔊 Sound On"}
        </button>
      )}

      {/* Play Center Circle Icon */}
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
