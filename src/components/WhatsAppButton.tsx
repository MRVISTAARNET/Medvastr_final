"use client";

import React from "react";

export default function WhatsAppButton() {
  const whatsappUrl = "https://wa.me/918976488911?text=Hi!%20I%20have%20a%20question%20about%20Medvastr%20scrubs.";

  return (
    <>
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-float-btn"
        aria-label="Chat on WhatsApp"
      >
        <svg
          viewBox="0 0 24 24"
          width="30"
          height="30"
          fill="currentColor"
          className="whatsapp-svg"
        >
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.713-1.458L0 24zm6.59-4.846c1.666.988 3.311 1.485 5.352 1.486 5.517 0 10.005-4.487 10.008-10.007.001-2.673-1.042-5.186-2.935-7.078C17.128 1.663 14.62 1.62 12.012 1.62c-5.522 0-10.014 4.488-10.017 10.009-.001 2.095.547 4.14 1.595 5.922L2.553 21.6l4.094-1.446zm9.046-5.437c.297.148.512.22.682.502.17.283.17 1.626-.69 2.476-.86.85-2.227.637-3.999-.071-1.771-.709-3.93-2.585-5.15-4.707-1.219-2.122-1.14-3.472-.234-4.38.906-.908 1.67-.85 1.84-.709.17.14.368.397.48.623.114.227.227.51.142.68-.086.17-.425.51-.623.708-.198.198-.425.425-.198.822.227.396.906 1.485 1.955 2.418 1.05.933 2.126 1.416 2.522 1.586.397.17.623.142.85-.113.227-.255.963-1.132 1.218-1.53.255-.396.51-.31.85-.17z" />
        </svg>
      </a>

      <style jsx>{`
        .whatsapp-float-btn {
          position: fixed;
          bottom: 25px;
          right: 25px;
          background-color: #25d366;
          color: white;
          width: 58px;
          height: 58px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 20px rgba(37, 211, 102, 0.4);
          z-index: 9999;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          animation: whatsapp-pulse 2s infinite;
        }

        .whatsapp-float-btn:hover {
          transform: scale(1.1) translateY(-2px);
          box-shadow: 0 8px 24px rgba(37, 211, 102, 0.6);
          background-color: #20ba5a;
        }

        .whatsapp-svg {
          filter: drop-shadow(0 1px 2px rgba(0,0,0,0.1));
        }

        @keyframes whatsapp-pulse {
          0% {
            box-shadow: 0 4px 20px rgba(37, 211, 102, 0.4);
          }
          50% {
            box-shadow: 0 4px 24px 8px rgba(37, 211, 102, 0.2);
          }
          100% {
            box-shadow: 0 4px 20px rgba(37, 211, 102, 0.4);
          }
        }

        @media (max-width: 768px) {
          .whatsapp-float-btn {
            bottom: 20px;
            right: 20px;
            width: 52px;
            height: 52px;
          }
        }
      `}</style>
    </>
  );
}
