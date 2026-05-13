"use client";

import React, { useState } from "react";

export default function VideoSection() {
  const [play, setPlay] = useState(false);

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

        <div className="vid-pl" onClick={() => setPlay(true)}>
          {!play ? (
            <div className="vid-ph">
              <div className="play-r">▶</div>
              <div className="play-l">
                Play <strong>Video</strong>
              </div>
            </div>
          ) : (
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
              title="Medvastr Video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
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
