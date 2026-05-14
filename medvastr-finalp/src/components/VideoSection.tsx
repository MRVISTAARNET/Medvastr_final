"use client";

import React from "react";

export default function VideoSection() {

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
          <div className="vid-ph">
            <div className="play-r">▶</div>
            <div className="play-l">
              Brand <strong>Film</strong>
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
