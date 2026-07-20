"use client";
import React from "react";
import Link from "next/link";

const COLORS = {
  navy: "var(--primary-navy)",
  teal: "#008080",
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
          font-size: 11px;
          font-weight: 800;
          color: ${COLORS.teal};
          letter-spacing: 2px;
          text-transform: uppercase;
          margin-bottom: 12px;
          text-align: left;
        }

        .about-subtitle.centered {
          text-align: center;
        }

        .section-title {
          font-size: clamp(24px, 4vw, 32px);
          font-weight: 750;
          margin-bottom: 40px;
          text-align: left;
          color: ${COLORS.navy};
          letter-spacing: -0.5px;
          line-height: 1.25;
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
          padding: 36px;
          border-radius: 16px;
          border-left: 4px solid var(--secondary-blue);
        }

        .highlight-text {
          font-size: 18px;
          line-height: 1.7;
          color: ${COLORS.navy};
          font-weight: 500;
        }

        .story-text {
          font-size: 15px;
          line-height: 1.8;
          color: ${COLORS.slate};
          display: flex;
          flex-direction: column;
          gap: 20px;
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
          padding: 45px 30px;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          text-align: center;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 4px 12px rgba(32, 58, 95, 0.03);
        }

        .promise-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 16px 36px rgba(32, 58, 95, 0.08);
          border-color: var(--secondary-blue);
        }

        .promise-icon {
          font-size: 36px;
          margin-bottom: 24px;
        }

        .promise-card h3 {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 14px;
          color: ${COLORS.navy};
        }

        .promise-card p {
          font-size: 14px;
          line-height: 1.6;
          color: ${COLORS.slate};
          font-weight: 400;
        }

        .different-section {
          margin-bottom: 60px;
        }

        .diff-card {
          padding: 40px 50px;
          border-radius: 20px;
          font-size: 16px;
          line-height: 1.8;
          text-align: left;
          box-shadow: 0 10px 30px rgba(32, 58, 95, 0.05);
        }

        .diff-card.green {
          background: linear-gradient(135deg, #064e3b 0%, #0d9488 100%);
          color: white;
          display: flex;
          gap: 24px;
          align-items: center;
        }

        .green-icon {
          font-size: 44px;
          flex-shrink: 0;
        }

        .diff-card.navy {
          background: ${COLORS.navy};
          color: white;
        }

        .about-cta {
          padding: 100px 24px;
          background: var(--bg-slate);
          text-align: center;
          border-top: 1px solid var(--border-color);
        }

        .cta-content {
          max-width: 650px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
        }

        .cta-title {
          font-size: clamp(24px, 5vw, 36px);
          font-weight: 800;
          color: ${COLORS.navy};
          letter-spacing: -1px;
          line-height: 1.2;
        }

        .cta-desc {
          font-size: 16px;
          color: ${COLORS.slate};
          margin-bottom: 12px;
          line-height: 1.5;
        }

        .premium-btn {
          display: inline-block;
          background: var(--primary-navy);
          color: white;
          padding: 16px 40px;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 700;
          text-decoration: none;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 4px 14px rgba(32, 58, 95, 0.2);
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
          box-shadow: 0 8px 24px rgba(32, 58, 95, 0.25);
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
