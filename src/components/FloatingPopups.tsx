"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function FloatingPopups() {
  const [p1, setP1] = useState(false);
  const [p2, setP2] = useState(false);

  useEffect(() => {
    // Popup 1: 4 seconds delay, hides after 10s of being shown
    const t1 = setTimeout(() => {
      setP1(true);
      setTimeout(() => setP1(false), 10000);
    }, 4000);

    // Popup 2: 12 seconds delay, hides after 10s of being shown
    const t2 = setTimeout(() => {
      setP2(true);
      setTimeout(() => setP2(false), 10000);
    }, 12000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <div className="popups-container">
      {/* Bulk Order Popup */}
      {p1 && (
        <div className="popup-card">
          <button className="popup-close" onClick={() => setP1(false)}>✕</button>
          <div className="popup-content">
            <div className="popup-icon">📦</div>
            <div>
              <div className="popup-title">Bulk Orders</div>
              <div className="popup-text">Get exclusive discounts for hospitals & clinics.</div>
              <Link href="/bulk-orders" className="popup-link">Learn More →</Link>
            </div>
          </div>
        </div>
      )}

      {/* Contact Popup */}
      {p2 && (
        <div className="popup-card">
          <button className="popup-close" onClick={() => setP2(false)}>✕</button>
          <div className="popup-content">
            <div className="popup-icon">📞</div>
            <div>
              <div className="popup-title">Need Help?</div>
              <div className="popup-text">Our team is here to assist you 24/7.</div>
              <Link href="/contact" className="popup-link">Contact Us →</Link>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .popups-container {
          position: fixed;
          bottom: 30px;
          right: 30px;
          display: flex;
          flex-direction: column;
          gap: 15px;
          z-index: 9999;
          pointer-events: none;
        }
        .popup-card {
          pointer-events: auto;
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border: 1px solid rgba(255, 255, 255, 0.4);
          border-radius: 20px;
          padding: 20px;
          width: 320px;
          box-shadow: 0 15px 50px rgba(0,0,0,0.12);
          display: flex;
          flex-direction: column;
          position: relative;
          animation: slideIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          transform: translateX(130%);
        }
        @keyframes slideIn {
          to { transform: translateX(0); }
        }
        .popup-close {
          position: absolute;
          top: 12px;
          right: 12px;
          border: none;
          background: #f1f5f9;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          font-size: 10px;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s;
        }
        .popup-close:hover { background: #e2e8f0; color: #1e293b; }
        .popup-content {
          display: flex;
          gap: 15px;
          align-items: center;
        }
        .popup-icon {
          font-size: 28px;
          background: #f1f5f9;
          width: 54px;
          height: 54px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 14px;
          flex-shrink: 0;
        }
        .popup-title {
          font-size: 16px;
          font-weight: 800;
          color: #0f172a;
        }
        .popup-text {
          font-size: 13px;
          color: #64748b;
          margin: 4px 0 10px;
          line-height: 1.5;
          font-weight: 500;
        }
        .popup-link {
          font-size: 13px;
          font-weight: 700;
          color: #008080;
          text-decoration: none;
          border-bottom: 1.5px solid transparent;
          transition: all 0.2s;
        }
        .popup-link:hover { border-bottom-color: #008080; }
        @media (max-width: 768px) {
          .popups-container {
            bottom: 20px;
            right: 20px;
            left: 20px;
          }
          .popup-card {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
