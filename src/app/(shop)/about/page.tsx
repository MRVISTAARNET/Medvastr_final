"use client";
import React from "react";
import Link from "next/link";

const COLORS = {
  navy: "var(--primary-navy)",
  blue: "var(--secondary-blue)",
  slate: "var(--secondary-text)",
  light: "var(--bg-slate)",
  white: "var(--white, #ffffff)",
};

export default function AboutPage() {
  React.useEffect(() => {
    document.title = "About Us | Medvastr";
  }, []);

  return (
    <div className="about-page">
      {/* 1. HERO BANNER */}
      <section className="about-hero">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/about-desktop.jpg"
          alt="About Medvastr Desktop"
          className="hero-image-desktop"
          style={{ width: "100%", height: "auto", display: "block" }}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/about-mobile.jpg"
          alt="About Medvastr Mobile"
          className="hero-image-mobile"
          style={{ width: "100%", height: "auto", display: "block" }}
        />
      </section>

      {/* 2. MAIN CONTENT */}
      <section className="about-main">
        <div className="content-container">
          
          {/* Brand Intro & Story */}
          <div className="story-section">
            <h1 className="about-subtitle">OUR HERITAGE</h1>
            <h2 className="section-title">Caring for Those Who Care for Others</h2>
            
            <div className="story-layout">
              <div className="story-highlight-box">
                <p className="highlight-text">
                  For over a decade, Medvastr has stood side-by-side with India's healthcare sector. Established in 2012 as a dedicated hospital supply partner, we have dressed thousands of medical professionals and provided state-of-the-art medical textiles to top-tier healthcare institutions.
                </p>
              </div>
              <div className="story-text">
                <p>
                  Our journey began in the corridors of busy clinics and emergency wards. We observed doctors, nurses, and surgeons working grueling 12 to 24-hour shifts in stiff, restrictive, and standard-issue uniforms. We realized that while medical technology was rapidly advancing, the apparel designed for healthcare heroes remained stagnant. They deserved fabric that worked as hard as they did.
                </p>
                <p>
                  Thus, Medvastr was born. Our mission is simple yet transformative: to engineer professional medical wear that blends advanced fabric technology, anatomical utility, and modern, refined aesthetics.
                </p>
                <p>
                  Today, we meet the rigorous demands of modern clinical environments by offering premium, high-stretch medical scrubs alongside eco-certified hospital linen solutions.
                </p>
              </div>
            </div>
          </div>

          {/* Three Promises Grid */}
          <div className="promises-section">
            <h1 className="about-subtitle centered">OUR COMMITMENT</h1>
            <h2 className="section-title">The Three Pillars of Medvastr</h2>
            <div className="promises-grid">
              <div className="promise-card">
                <div className="promise-icon">✨</div>
                <h3>Advanced Comfort Textiles</h3>
                <p>
                  We utilize a specialized poly-viscose and spandex blend designed for peak flexibility. Engineered to breathe, wick moisture, and remain exceptionally lightweight through long shifts.
                </p>
              </div>
              <div className="promise-card">
                <div className="promise-icon">🛡️</div>
                <h3>Hospital-Grade Durability</h3>
                <p>
                  Medical apparel undergoes aggressive industrial laundering. We utilize reinforced triple-needle stitching and high-performance dyes to prevent color fading and fraying, keeping your team looking sharp.
                </p>
              </div>
              <div className="promise-card">
                <div className="promise-icon">📦</div>
                <h3>A Complete Solution</h3>
                <p>
                  From color-coded departmental scrubs to specialized patient wear and custom hospital linen, we offer end-to-end solutions that streamline logistics and enhance the visual identity of leading hospitals.
                </p>
              </div>
            </div>
          </div>

          {/* Greener Future Sustainability */}
          <div className="different-section">
            <h2 className="section-title">Sustainable Medical Textiles</h2>
            <div className="diff-card green">
              <div className="green-icon">🌿</div>
              <p>
                In line with our commitment to healthcare innovation, Medvastr pioneers eco-friendly textile alternatives. Our <strong>Green Linen</strong> collection provides certified sustainable bedsheets, surgical drapes, and patient apparel, helping institutions reduce their carbon footprint without compromising on clinical hygiene or barrier protection.
              </p>
            </div>
          </div>

          {/* Experience & Trust Section */}
          <div className="different-section" style={{ marginTop: '80px' }}>
            <h2 className="section-title">A Decade of Institutional Trust</h2>
            <div className="diff-card navy">
              <p>
                We don't just design uniforms; we build partnerships. Over 10 years of close collaboration with clinical administrators, laundry managers, and practicing physicians allows us to build garments with anatomical precision and long-term utility.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* 3. FOOTER CTA */}
      <section className="about-cta">
        <div className="cta-content">
          <h2 className="cta-title">
            Ready to experience the Medvastr difference?
          </h2>
          <p className="cta-desc">Join thousands of medical professionals across India who have upgraded their daily workwear.</p>
          <Link href="/products" className="premium-btn">
            Explore the Collection
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
          width: 100%;
          position: relative;
          overflow: hidden;
        }

        .about-main {
          padding: 80px 24px;
          background: ${COLORS.white};
        }

        .content-container {
          max-width: 1100px;
          margin: 0 auto;
        }

        .about-subtitle {
          font-size: 13px !important;
          font-weight: 600 !important;
          color: ${COLORS.blue} !important;
          letter-spacing: 1px !important;
          text-transform: uppercase;
          margin-bottom: 8px;
          text-align: left;
        }

        .about-subtitle.centered {
          text-align: center;
        }

        .section-title {
          font-family: var(--sans) !important;
          font-size: 26px !important;
          font-weight: 600 !important;
          color: ${COLORS.navy} !important;
          line-height: 1.25 !important;
          letter-spacing: -0.015em !important;
          margin-bottom: 30px;
          text-align: left;
        }

        .promises-section .section-title {
          text-align: center;
        }

        .story-section {
          margin-bottom: 90px;
        }

        .story-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          align-items: start;
        }

        .story-highlight-box {
          background: rgba(32, 58, 95, 0.03);
          padding: 30px;
          border-radius: 12px;
          border-left: 4px solid var(--secondary-blue);
        }

        .highlight-text {
          font-size: 15px !important;
          line-height: 1.7 !important;
          color: ${COLORS.navy} !important;
          font-weight: 500 !important;
        }

        .story-text {
          font-size: 14px !important;
          line-height: 1.7 !important;
          color: ${COLORS.slate} !important;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .promises-section {
          margin-bottom: 90px;
        }

        .promises-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 30px;
          margin-top: 20px;
        }

        .promise-card {
          background: ${COLORS.white};
          padding: 40px 24px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          text-align: center;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 4px 12px rgba(32, 58, 95, 0.02);
        }

        .promise-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 28px rgba(32, 58, 95, 0.06);
          border-color: var(--secondary-blue);
        }

        .promise-icon {
          font-size: 32px;
          margin-bottom: 20px;
        }

        .promise-card h3 {
          font-size: 16px !important;
          font-weight: 600 !important;
          margin-bottom: 12px;
          color: ${COLORS.navy} !important;
        }

        .promise-card p {
          font-size: 13px !important;
          line-height: 1.6 !important;
          color: ${COLORS.slate} !important;
          font-weight: 400;
        }

        .different-section {
          margin-bottom: 60px;
        }

        .diff-card {
          padding: 36px 48px;
          border-radius: 16px;
          font-size: 14px !important;
          line-height: 1.7 !important;
          text-align: left;
          box-shadow: 0 10px 30px rgba(32, 58, 95, 0.04);
        }

        .diff-card.green {
          background: linear-gradient(135deg, #064e3b 0%, #0d9488 100%);
          color: white;
          display: flex;
          gap: 24px;
          align-items: center;
        }

        .green-icon {
          font-size: 36px;
          flex-shrink: 0;
        }

        .diff-card.navy {
          background: ${COLORS.navy};
          color: white;
        }

        .diff-card p,
        .diff-card strong {
          color: white !important;
        }

        .about-cta {
          padding: 80px 24px;
          background: var(--bg-slate);
          text-align: center;
          border-top: 1px solid var(--border-color);
        }

        .cta-content {
          max-width: 600px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }

        .cta-title {
          font-size: 26px !important;
          font-weight: 600 !important;
          color: ${COLORS.navy} !important;
          letter-spacing: -0.015em !important;
          line-height: 1.25 !important;
        }

        .cta-desc {
          font-size: 14px !important;
          color: ${COLORS.slate} !important;
          margin-bottom: 12px;
          line-height: 1.5;
        }

        .premium-btn {
          display: inline-block;
          background: var(--primary-navy);
          color: white;
          padding: 14px 36px;
          border-radius: 6px;
          font-size: 14px !important;
          font-weight: 600 !important;
          text-decoration: none;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 4px 12px rgba(32, 58, 95, 0.15);
          letter-spacing: 0.5px;
          text-transform: uppercase;
          border: 2px solid var(--primary-navy);
          cursor: pointer;
        }

        .premium-btn:hover {
          background: white;
          color: var(--primary-navy);
          border-color: var(--primary-navy);
          transform: translateY(-2px);
          box-shadow: 0 6px 18px rgba(32, 58, 95, 0.2);
        }

        @media (max-width: 900px) {
          .story-layout {
            grid-template-columns: 1fr;
            gap: 24px;
          }
          .promises-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }
          .about-main {
            padding: 60px 20px;
          }
          .diff-card {
            padding: 30px;
          }
          .diff-card.green {
            flex-direction: column;
            text-align: center;
            gap: 16px;
          }
        }
      `}</style>
    </div>
  );
}
