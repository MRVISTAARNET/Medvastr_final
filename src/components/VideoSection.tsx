"use client";

import React, { useState, useEffect } from "react";
import { API_BASE } from "@/lib/api";

export default function VideoSection() {
  const [videoUrl, setVideoUrl] = useState("");

  useEffect(() => {
    fetch(`${API_BASE}/settings/home_video`)
      .then(r => r.json())
      .then(d => {
        if (d.success && d.data) setVideoUrl(d.data);
      })
      .catch(() => { });
  }, []);

  // Convert YouTube watch URL → embed URL
  const embedUrl = videoUrl
    ? videoUrl.replace("watch?v=", "embed/").replace("youtu.be/", "www.youtube.com/embed/")
    : "";

  return (
    <div className="vid-sec">
      <div className="vid-in">
        <div className="vid-ey">Performance in Action</div>
        <h2 className="vid-t">
          Built for the <em>front lines</em>
        </h2>
        <p className="vid-s">
          Watch how Medvastr apparel performs in high-pressure clinical environments. From fluid resistance to 4-way
          stretch flexibility.
        </p>

        <div className="vid-pl">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title="Medvastr Brand Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ width: "100%", height: "100%", border: "none", borderRadius: "inherit" }}
            />
          ) : (
            <div className="vid-ph">
              <div className="play-r">▶</div>
              <div className="play-l">
                Brand <strong>Film</strong>
              </div>
            </div>
          )}
        </div>

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
