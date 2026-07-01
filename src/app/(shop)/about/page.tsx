"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";

const COLORS = {
  navy: "#0a0f1c",
  teal: "#008080",
  slate: "#475569",
  light: "#f8fafc",
  white: "#ffffff",
};

export default function AboutPage() {
  return (
    <div className="about-page">
      {/* 1. HERO BANNER */}
      <section className="about-hero">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://d2tnzshqdaedbc.cloudfront.net/about-1.jpg"
          alt="Medvastr Excellence"
          style={{ width: "100%", height: "auto", display: "block" }}
        />
      </section>

      {/* 2. MAIN CONTENT */}
      <section className="about-main">
        <div className="content-container">
          <div className="story-section">
            <h2 className="section-title">Caring for Those Who Care for Others</h2>
            <div className="story-text">
              <p>
                Since 2012, we have been a trusted partner for top hospitals, supplying high-quality linen and uniforms.
              </p>
              <p>
                Over the years, we watched healthcare heroes working exhausting shifts in stiff, uncomfortable scrubs.
                We knew they deserved better.
              </p>
              <p className="highlight">
                That is why we created <strong>Medvastr</strong>—a brand dedicated to changing medical apparel for the better.
              </p>
              <p>
                We meet the needs of modern hospitals by offering premium medical scrubs and eco-friendly green linen products.
              </p>
            </div>
          </div>

          <div className="promises-section">
            <h2 className="section-title">Our Three Simple Promises</h2>
            <div className="promises-grid">
              <div className="promise-card">
                <div className="promise-icon">✨</div>
                <h3>Comfort That Lasts</h3>
                <p>
                  We use a special, soft fabric blend with a little bit of stretch. It breathes well,
                  keeps you dry, and feels lightweight even during a long 12-hour shift.
                </p>
              </div>
              <div className="promise-card">
                <div className="promise-icon">🛡️</div>
                <h3>Made to Endure</h3>
                <p>
                  Hospital uniform washing is tough. Our uniforms use high-quality dyes and strong stitching
                  so they stay bright, professional, and looking like new—even after multiple washes.
                </p>
              </div>
              <div className="promise-card">
                <div className="promise-icon">📦</div>
                <h3>A Complete Solution</h3>
                <p>
                  We don't just sell scrubs. We supply entire hospitals with everything they need,
                  from nursing uniforms to patient clothes and bed linens, all color-coded by department.
                </p>
              </div>
            </div>
          </div>

          <div className="different-section">
            <h2 className="section-title">A Greener Future</h2>
            <div className="diff-card green">
              <p>
                Alongside our scrubs, we offer <strong>Green Linen</strong> options—eco-friendly, sustainable hospital linens
                designed to reduce waste and help healthcare facilities lower their environmental footprint without losing quality or safety.
              </p>
            </div>
          </div>

          <div className="different-section" style={{ marginTop: '60px' }}>
            <h2 className="section-title">What Makes Us Different?</h2>
            <div className="diff-card">
              <p>
                <strong>Real Experience:</strong> We have over a decade of real experience working directly with hospitals.
                We know exactly what fabric works, what lasts, and what healthcare workers actually need to feel good at work.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FOOTER CTA */}
      <section className="about-cta" style={{ background: '#f8fafc', padding: '120px 24px' }}>
        <div className="cta-content" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 950, marginBottom: '50px', color: '#0f172a', letterSpacing: '-1.5px', lineHeight: 1.1 }}>
            Ready to experience the Medvastr difference?
          </h2>
          <a href="/products" className="premium-btn">
            Explore Our Products
          </a>
        </div>
      </section>

      <style jsx>{`
        .about-page {
          background: ${COLORS.white};
          color: ${COLORS.navy};
          font-family: inherit;
        }

        .about-hero {
          width: 100%;
          position: relative;
          overflow: hidden;
        }


        .hero-content {
          position: relative;
          z-index: 1;
          padding: 0 20px;
        }

        .hero-content h1 {
          font-size: 56px;
          font-weight: 900;
          margin-bottom: 16px;
          letter-spacing: -2px;
        }

        .hero-content p {
          font-size: 20px;
          opacity: 0.9;
          font-weight: 500;
        }

        .about-main {
          padding: 100px 24px;
        }

        .content-container {
          max-width: 1000px;
          margin: 0 auto;
        }

        .section-title {
          font-size: 32px;
          font-weight: 800;
          margin-bottom: 40px;
          text-align: center;
          color: ${COLORS.navy};
          letter-spacing: -0.5px;
        }

        .story-section {
          margin-bottom: 100px;
          text-align: center;
        }

        .story-text {
          font-size: 18px;
          line-height: 1.8;
          color: ${COLORS.slate};
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .story-text .highlight {
          font-size: 22px;
          color: ${COLORS.navy};
          background: ${COLORS.light};
          padding: 30px;
          border-radius: 16px;
          border-left: 5px solid ${COLORS.teal};
        }

        .promises-section {
          margin-bottom: 100px;
        }

        .promises-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 30px;
        }

        .promise-card {
          background: ${COLORS.white};
          padding: 40px 30px;
          border-radius: 20px;
          border: 1px solid #e2e8f0;
          text-align: center;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .promise-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.05);
          border-color: ${COLORS.teal};
        }

        .promise-icon {
          font-size: 40px;
          margin-bottom: 20px;
        }

        .promise-card h3 {
          font-size: 20px;
          font-weight: 800;
          margin-bottom: 15px;
          color: ${COLORS.navy};
        }

        .promise-card p {
          font-size: 15px;
          line-height: 1.6;
          color: ${COLORS.slate};
        }

        .different-section {
          text-align: center;
        }

        .diff-card {
          background: ${COLORS.navy};
          color: ${COLORS.white};
          padding: 50px;
          border-radius: 24px;
          font-size: 20px;
          line-height: 1.6;
        }

        .diff-card.green {
          background: linear-gradient(135deg, #064e3b 0%, #0d9488 100%);
        }

        .about-cta {
          padding: 100px 24px;
          background: ${COLORS.light};
          text-align: center;
        }

        .cta-content h2 {
          font-size: 36px;
          font-weight: 850;
          margin-bottom: 30px;
          letter-spacing: -1px;
        }

        .premium-btn {
          display: inline-block;
          background: linear-gradient(135deg, #ff4d4d 0%, #ff8c1a 30%, #ffcc00 60%, #ff8c1a 85%, #ff4d4d 100%);
          background-size: 200% auto;
          color: white;
          padding: 24px 80px;
          border-radius: 100px;
          font-size: 24px;
          font-weight: 900;
          text-decoration: none;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          box-shadow: 0 20px 50px rgba(255, 77, 77, 0.4), inset 0 2px 2px rgba(255,255,255,0.4);
          letter-spacing: 2px;
          text-transform: uppercase;
          border: 3px solid white;
          cursor: pointer;
          position: relative;
          overflow: hidden;
        }

        .premium-btn:hover {
          transform: translateY(-10px) scale(1.05);
          box-shadow: 0 30px 60px rgba(255, 77, 77, 0.6);
          background-position: right center;
        }

        .premium-btn:active {
          transform: translateY(-2px);
        }

        @media (max-width: 900px) {
          .promises-grid {
            grid-template-columns: 1fr;
          }
          .hero-content h1 {
            font-size: 40px;
          }
          .about-main {
            padding: 60px 24px;
          }
        }
      `}</style>
    </div>
  );
}
