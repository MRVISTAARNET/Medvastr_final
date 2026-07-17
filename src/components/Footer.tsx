"use client";

import React, { useState } from "react";
import Link from "next/link";
import { B } from "@/lib/data";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <footer id="ft">
      {/* 1. Newsletter Strip */}
      <div className="ft-newsletter-strip">
        <div className="ft-ns-inner">
          <div className="ft-ns-text">
            Our emails are like our scrubs. Focused on you!
          </div>
          <div className="ft-ns-form-box">
            {subscribed ? (
              <div className="ft-ns-success">✓ Subscribed successfully!</div>
            ) : (
              <form onSubmit={handleSubscribe} className="ft-ns-form">
                <input
                  type="email"
                  placeholder="Enter Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="ft-ns-input"
                />
                <button type="submit" className="ft-ns-btn">
                  →
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* 2. Main Grid */}
      <div className="ft-g">
        {/* Brand Column */}
        <div className="ft-brand">
          <div className="ft-logo">medvastr</div>
          <span className="ft-tag">Wear Wellness</span>
          <p className="ft-desc">
            Product Manufactured For, Packed & Marketed By Medvastr.
          </p>
          <div className="ft-office-info">
            <strong>Corporate Office</strong>
            <p className="addr-text">{B.addr}</p>
          </div>
          <div className="ft-soc-v2">
            <a href={B.ig} target="_blank" rel="noopener" className="social-circle ig" aria-label="Instagram">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
            <a href={B.fb} target="_blank" rel="noopener" className="social-circle fb" aria-label="Facebook">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.324v-21.35c0-.732-.593-1.325-1.325-1.325z" />
              </svg>
            </a>
            <a href={`https://wa.me/919920314164`} target="_blank" rel="noopener" className="social-circle wa" aria-label="WhatsApp">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.588-5.946 0-6.556 5.332-11.891 11.891-11.891 3.181 0 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.335 11.892-11.891 11.892-1.996 0-3.951-.5-5.688-1.448l-6.304 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884 0 2.225.584 3.899 1.698 5.623l-.991 3.616 3.791-.994zm11.423-7.484c-.307-.154-1.817-.897-2.098-.998-.282-.103-.488-.154-.691.154-.204.309-.789 1.002-.967 1.208-.177.206-.355.231-.662.077-.307-.154-1.297-.478-2.47-1.524-.913-.814-1.53-1.82-1.709-2.128-.179-.309-.019-.476.134-.63.139-.138.307-.359.462-.538.154-.18.206-.309.308-.513.103-.206.052-.385-.026-.538-.077-.154-.691-1.666-.947-2.282-.248-.6-.503-.518-.691-.528l-.589-.011c-.204 0-.538.077-.819.385-.282.308-1.077 1.051-1.077 2.564 0 1.513 1.099 2.973 1.253 3.179.154.206 2.164 3.303 5.244 4.634.733.316 1.305.505 1.748.647.737.236 1.408.203 1.94.124.593-.088 1.817-.743 2.073-1.46.257-.717.257-1.332.18-1.46-.077-.128-.282-.206-.589-.359z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Company */}
        <div className="ft-col">
          <h4>Company</h4>
          <ul className="ft-lnks">
            <li><Link href="/about">About Us</Link></li>
            <li><Link href="/blog">Blog</Link></li>
            <li><Link href="/sizeguide">Size Guide</Link></li>
            <li><Link href="/bulk-orders">Bulk Orders</Link></li>
          </ul>
        </div>

        {/* Support */}
        <div className="ft-col">
          <h4>Support</h4>
          <ul className="ft-lnks">
            <li><Link href="/contact">Contact Us</Link></li>
            <li><Link href="/track">Track Order</Link></li>
            <li><Link href="/refund">Shipping & Returns</Link></li>
            <li><Link href="/privacy">Privacy & Terms</Link></li>
          </ul>
        </div>

        {/* Quick Links */}
        <div className="ft-col">
          <h4>Quick Links</h4>
          <ul className="ft-lnks">
            <li><Link href="/products?type=scrubs">Scrub Suit</Link></li>
            <li><Link href="/products?type=tshirts">Cotton Crew T-Shirt</Link></li>
            <li><Link href="/products?type=underscrub">Full Sleeve Under Scrub</Link></li>
            <li><Link href="/products?cat=surgical-surgeon-gown">Surgical Gown</Link></li>
            <li><Link href="/products?cat=surgical-surgeon-cap">Surgical Cap</Link></li>
          </ul>
        </div>

        {/* Connect With Us */}
        <div className="ft-col">
          <h4>Connect With Us</h4>
          <ul className="ft-lnks connect-info">
            <li>
              <span className="connect-icon">📞</span>
              <div className="connect-details">
                <a href={`tel:${B.phone1}`}>{B.phone1}</a>
                <span className="sep">•</span>
                <a href={`tel:${B.phone2}`}>{B.phone2}</a>
              </div>
            </li>
            <li>
              <span className="connect-icon">✉️</span>
              <a href={`mailto:${B.email}`}>{B.email}</a>
            </li>
          </ul>
        </div>
      </div>

      <div className="ft-btm">
        <div className="ft-copy">
          © 2026 Medvastr. All rights reserved. <br />
          <span className="ft-credit">Made by <a href="https://mrvistaarnet.com" target="_blank" rel="noopener">MrVistaarNet</a> ❤️</span>
        </div>
        <div className="ft-pay">
          {["UPI", "Visa", "MC", "Amex", "COD", "EMI"].map((p) => (
            <span key={p} className="pay-p">{p}</span>
          ))}
        </div>
      </div>

      <style jsx>{`
        footer {
          background: var(--primary-navy);
          color: rgba(255, 255, 255, 0.82);
          padding: 0 0 40px;
          border-top: 1px solid var(--border-color);
          font-family: var(--sans), sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        /* 1. Newsletter Strip */
        .ft-newsletter-strip {
          background: rgba(0, 0, 0, 0.15);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          padding: 30px 40px;
          margin-bottom: 60px;
          width: 100%;
        }
        .ft-ns-inner {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 20px;
        }
        .ft-ns-text {
          font-size: 20px;
          font-weight: 600;
          color: #ffffff;
          letter-spacing: -0.01em;
        }
        .ft-ns-form-box {
          min-width: 320px;
        }
        .ft-ns-form {
          display: flex;
          align-items: center;
          border-bottom: 2px solid rgba(255, 255, 255, 0.3);
          transition: border-color 0.25s ease;
          width: 100%;
        }
        .ft-ns-form:focus-within {
          border-color: #ffffff;
        }
        .ft-ns-input {
          background: transparent !important;
          border: none !important;
          outline: none !important;
          padding: 10px 0 !important;
          font-size: 16px !important;
          color: #ffffff !important;
          flex-grow: 1;
          width: 280px;
          border-radius: 0 !important;
          height: auto !important;
        }
        .ft-ns-input::placeholder {
          color: rgba(255, 255, 255, 0.6);
        }
        .ft-ns-btn {
          background: transparent;
          border: none;
          color: #ffffff;
          font-size: 24px;
          cursor: pointer;
          padding: 0 5px;
          line-height: 1;
          transition: transform 0.2s ease;
        }
        .ft-ns-btn:hover {
          transform: translateX(3px);
        }
        .ft-ns-success {
          color: #22C55E;
          font-weight: 600;
          font-size: 15px;
        }

        /* 2. Main Grid */
        .ft-g {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 40px;
          display: grid;
          grid-template-columns: 2.2fr 1fr 1.2fr 1fr 1.6fr;
          gap: 40px;
          align-items: start;
        }
        .ft-brand {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .ft-logo { 
          font-size: 32px; 
          font-weight: 900; 
          color: #ffffff; 
          letter-spacing: -0.04em; 
          text-transform: lowercase;
          line-height: 1;
        }
        .ft-tag { 
          font-size: 10px; 
          letter-spacing: 2px; 
          color: #FFFFFF; 
          text-transform: uppercase; 
          font-weight: 700; 
          opacity: 0.9;
        }
        .ft-desc { 
          font-size: 13px; 
          color: rgba(255, 255, 255, 0.72);
          line-height: 1.65; 
          max-width: 320px; 
          margin-bottom: 5px;
        }
        .ft-office-info {
          font-size: 13px;
          line-height: 1.6;
        }
        .ft-office-info strong {
          color: rgba(255, 255, 255, 0.95);
          display: block;
          margin-bottom: 4px;
          font-weight: 600;
        }
        .addr-text {
          color: rgba(255, 255, 255, 0.65);
        }
        
        /* Columns */
        h4 { 
          font-size: 14px;
          font-weight: 700; 
          text-transform: capitalize; 
          margin-bottom: 20px; 
          color: #ffffff;
          letter-spacing: 0.02em;
          position: relative;
          padding-bottom: 8px;
        }
        h4::after {
          content: '';
          position: absolute;
          left: 0;
          bottom: 0;
          width: 24px;
          height: 2px;
          background: rgba(255, 255, 255, 0.4);
        }
        
        ul { list-style: none; padding: 0; }
        li { margin-bottom: 10px; }
        li a { font-size: 13px; color: rgba(255, 255, 255, 0.72); transition: all 0.2s; text-decoration: none; font-weight: 400; letter-spacing: 0.01em; }
        li a:hover { color: #ffffff; }
        
        /* Connect Info */
        .connect-info li {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 13px;
          color: rgba(255, 255, 255, 0.72);
        }
        .connect-icon {
          font-size: 13px;
          opacity: 0.85;
        }
        .connect-details {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }
        .connect-info a {
          color: rgba(255, 255, 255, 0.82);
          text-decoration: none;
          font-weight: 500;
        }
        .connect-info a:hover {
          color: #ffffff;
        }
        .sep { opacity: 0.3; }

        .ft-soc-v2 { 
          display: flex; 
          gap: 12px; 
          margin-top: 10px; 
        }
        .social-circle {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          background: rgba(255,255,255,0.06);
          transition: all 0.25s ease;
          border: 1px solid rgba(255,255,255,0.06);
        }
        .social-circle:hover {
          transform: translateY(-3px);
          background: rgba(255,255,255,0.12);
        }

        .ft-btm { 
          max-width: 1400px; 
          margin: 60px auto 0; 
          padding: 30px 40px 0; 
          border-top: 1px solid rgba(255,255,255,0.08); 
          display: flex; 
          justify-content: space-between; 
          align-items: center; 
        }
        .ft-copy { font-size: 13px; color: rgba(255, 255, 255, 0.6); font-weight: 400; line-height: 1.65; }
        .ft-credit a { color: rgba(255, 255, 255, 0.7); font-weight: 600; text-decoration: none; }
        .ft-credit a:hover { color: white; }
        
        .ft-pay { display: flex; gap: 8px; flex-wrap: wrap; justify-content: flex-end; }
        .pay-p { 
          font-size: 10px; 
          font-weight: 600; 
          padding: 4px 10px; 
          background: rgba(255,255,255,0.04); 
          border-radius: 4px; 
          color: rgba(255, 255, 255, 0.6); 
          border: 1px solid rgba(255,255,255,0.1); 
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        @media(max-width: 1024px) {
          .ft-g { gap: 30px; grid-template-columns: 2fr 1fr 1fr; }
        }

        @media(max-width: 768px) {
          footer { padding: 0 0 40px; }
          .ft-newsletter-strip {
            padding: 24px 20px;
            margin-bottom: 40px;
          }
          .ft-ns-inner {
            flex-direction: column;
            align-items: flex-start;
            gap: 15px;
          }
          .ft-ns-text {
            font-size: 17px;
          }
          .ft-ns-form-box {
            width: 100%;
          }
          .ft-ns-input {
            width: 100%;
          }
          .ft-g { grid-template-columns: 1fr; gap: 30px; padding: 0 20px; }
          .ft-brand { text-align: left; align-items: flex-start; }
          .ft-desc { margin: 5px 0; }
          
          .ft-btm { flex-direction: column; text-align: left; align-items: flex-start; gap: 20px; margin-top: 40px; padding: 30px 20px 0; }
          .ft-pay { justify-content: flex-start; width: 100%; }
        }
      `}</style>
    </footer>
  );
}
