"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function FloatingPopups() {
    const [show, setShow] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setShow(true), 3000);
        return () => clearTimeout(timer);
    }, []);

    if (!show) return null;

    return (
        <div className="popups-container">
            {/* Bulk Order Popup */}
            <div className="popup-card">
                <button className="popup-close" onClick={() => setShow(false)}>✕</button>
                <div className="popup-content">
                    <div className="popup-icon">📦</div>
                    <div>
                        <div className="popup-title">Bulk Orders</div>
                        <div className="popup-text">Get exclusive discounts for hospitals & clinics.</div>
                        <Link href="/bulk-orders" className="popup-link">Learn More →</Link>
                    </div>
                </div>
            </div>

            {/* Contact Popup */}
            <div className="popup-card delay-1">
                <div className="popup-content">
                    <div className="popup-icon">📞</div>
                    <div>
                        <div className="popup-title">Need Help?</div>
                        <div className="popup-text">Our team is here to assist you 24/7.</div>
                        <Link href="/contact" className="popup-link">Contact Us →</Link>
                    </div>
                </div>
            </div>

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
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 16px;
          padding: 20px;
          width: 300px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.1);
          display: flex;
          flex-direction: column;
          position: relative;
          animation: slideIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          transform: translateX(120%);
        }
        .delay-1 {
          animation-delay: 0.5s;
        }
        @keyframes slideIn {
          to { transform: translateX(0); }
        }
        .popup-close {
          position: absolute;
          top: 10px;
          right: 10px;
          border: none;
          background: none;
          font-size: 14px;
          color: #94a3b8;
          cursor: pointer;
        }
        .popup-content {
          display: flex;
          gap: 15px;
          align-items: center;
        }
        .popup-icon {
          font-size: 32px;
          background: #f1f5f9;
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
        }
        .popup-title {
          font-size: 16px;
          font-weight: 700;
          color: #1e293b;
        }
        .popup-text {
          font-size: 13px;
          color: #64748b;
          margin: 4px 0 10px;
          line-height: 1.4;
        }
        .popup-link {
          font-size: 13px;
          font-weight: 600;
          color: #008080;
          text-decoration: none;
        }
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
