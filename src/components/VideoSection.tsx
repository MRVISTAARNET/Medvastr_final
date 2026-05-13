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

        <div className="vid-pl" style={{ cursor: 'default' }}>
          <div className="vid-ph" style={{ opacity: 1 }}>
            <div className="play-r" style={{ background: 'var(--t)' }}>✓</div>
            <div className="play-l">
              <strong>Premium Quality Tested</strong>
              <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>Lab certified for durability & comfort</div>
            </div>
          </div>
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
