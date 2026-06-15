"use client";
import React from "react";
import Link from "next/link";

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
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>About Medvastr</h1>
          <p>Dedicated to changing medical apparel for the better.</p>
        </div>
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
      <section className="about-cta">
        <div className="cta-content">
          <h2>Experience the Medvastr Difference.</h2>
          <Link href="/products" className="cta-button">
            Explore Our Products
          </Link>
        </div>
      </section>

      <style jsx>{`
        .about-page {
          background: ${COLORS.white};
          color: ${COLORS.navy};
          font-family: inherit;
        }

        .about-hero {
          height: 400px;
          background: linear-gradient(135deg, ${COLORS.navy} 0%, #1e293b 100%);
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          color: ${COLORS.white};
          overflow: hidden;
        }

        .hero-overlay {
          position: absolute;
          inset: 0;
          background: url('https://www.transparenttextures.com/patterns/cubes.png');
          opacity: 0.1;
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

        .cta-button {
          display: inline-block;
          background: ${COLORS.teal};
          color: ${COLORS.white};
          padding: 18px 48px;
          border-radius: 100px;
          font-size: 18px;
          font-weight: 700;
          text-decoration: none;
          transition: all 0.3s ease;
          box-shadow: 0 10px 20px rgba(0,128,128,0.2);
        }

        .cta-button:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 30px rgba(0,128,128,0.3);
          background: #006666;
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
