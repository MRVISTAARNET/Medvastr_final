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
    document.title = "About Us | Medvarn";
  }, []);

  return (
    <div className="about-page">
      {/* 1. HERO BANNER WITH SMART FALLBACK */}
      <SmartAboutBanner />

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
                  For over a decade, Medvarn has stood side-by-side with India's healthcare sector. Established in 2012 as a dedicated hospital supply partner, we have dressed thousands of medical professionals and provided state-of-the-art medical textiles to top-tier healthcare institutions.
                </p>
              </div>
              <div className="story-text">
                <p>
                  Our journey began in the corridors of busy clinics and emergency wards. We observed doctors, nurses, and surgeons working grueling 12 to 24-hour shifts in stiff, restrictive, and standard-issue uniforms. We realized that while medical technology was rapidly advancing, the apparel designed for healthcare heroes remained stagnant. They deserved fabric that worked as hard as they did.
                </p>
                <p>
                  Thus, Medvarn was born. Our mission is simple yet transformative: to engineer professional medical wear that blends advanced fabric technology, anatomical utility, and modern, refined aesthetics.
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
            <h2 className="section-title">The Three Pillars of Medvarn</h2>
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
                In line with our commitment to healthcare innovation, Medvarn pioneers eco-friendly textile alternatives. Our <strong>Green Linen</strong> collection provides certified sustainable bedsheets, surgical drapes, and patient apparel, helping institutions reduce their carbon footprint without compromising on clinical hygiene or barrier protection.
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
            Ready to experience the Medvarn difference?
          </h2>
          <p className="cta-desc">Join thousands of medical professionals across India who have upgraded their daily workwear.</p>
          <Link href="/products" className="premium-btn">
            Explore the Collection
          </Link>
        </div>
      </section>

      <style jsx>{`
        .about-page {
          background: #ffffff;
          color: #0f172a;
          font-family: var(--sans), Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }

        .about-hero {
          width: 100%;
          position: relative;
          overflow: hidden;
        }

        .about-main {
          padding: 80px 24px;
          background: #ffffff;
        }

        .content-container {
          max-width: 1100px;
          margin: 0 auto;
        }

        .about-subtitle {
          font-family: var(--sans), Inter, system-ui, sans-serif !important;
          font-size: 13px !important;
          font-weight: 700 !important;
          color: #008080 !important;
          letter-spacing: 1.5px !important;
          text-transform: uppercase;
          margin-bottom: 10px;
          text-align: left;
        }

        .about-subtitle.centered {
          text-align: center;
        }

        .section-title {
          font-family: var(--sans), Inter, system-ui, sans-serif !important;
          font-size: 32px !important;
          font-weight: 800 !important;
          color: #0f172a !important;
          line-height: 1.25 !important;
          letter-spacing: -0.5px !important;
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
          background: #f8fafc;
          padding: 32px;
          border-radius: 16px;
          border-left: 4px solid #008080;
          box-shadow: 0 4px 20px rgba(0,0,0,0.02);
        }

        .highlight-text {
          font-family: var(--sans), Inter, system-ui, sans-serif !important;
          font-size: 16px !important;
          line-height: 1.7 !important;
          color: #0f172a !important;
          font-weight: 600 !important;
        }

        .story-text {
          font-family: var(--sans), Inter, system-ui, sans-serif !important;
          font-size: 15px !important;
          line-height: 1.75 !important;
          color: #475569 !important;
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
          background: #ffffff;
          padding: 40px 28px;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          text-align: center;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);
        }

        .promise-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 32px rgba(15, 23, 42, 0.08);
          border-color: #008080;
        }

        .promise-icon {
          font-size: 36px;
          margin-bottom: 20px;
        }

        .promise-card h3 {
          font-family: var(--sans), Inter, system-ui, sans-serif !important;
          font-size: 18px !important;
          font-weight: 700 !important;
          margin-bottom: 12px;
          color: #0f172a !important;
        }

        .promise-card p {
          font-family: var(--sans), Inter, system-ui, sans-serif !important;
          font-size: 14px !important;
          line-height: 1.65 !important;
          color: #64748b !important;
          font-weight: 400;
        }

        .different-section {
          margin-bottom: 60px;
        }

        .diff-card {
          padding: 36px 48px;
          border-radius: 20px;
          font-family: var(--sans), Inter, system-ui, sans-serif !important;
          font-size: 15px !important;
          line-height: 1.75 !important;
          text-align: left;
          box-shadow: 0 10px 30px rgba(15, 23, 42, 0.05);
        }

        .diff-card.green {
          background: linear-gradient(135deg, #064e3b 0%, #0d9488 100%);
          color: white;
          display: flex;
          gap: 24px;
          align-items: center;
        }

        .green-icon {
          font-size: 40px;
          flex-shrink: 0;
        }

        .diff-card.navy {
          background: #0f172a;
          color: white;
        }

        .diff-card p,
        .diff-card strong {
          color: white !important;
        }

        .about-cta {
          padding: 80px 24px;
          background: #f8fafc;
          text-align: center;
          border-top: 1px solid #e2e8f0;
        }

        .cta-content {
          max-width: 650px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }

        .cta-title {
          font-family: var(--sans), Inter, system-ui, sans-serif !important;
          font-size: 30px !important;
          font-weight: 800 !important;
          color: #0f172a !important;
          letter-spacing: -0.5px !important;
          line-height: 1.3 !important;
        }

        .cta-desc {
          font-size: 15px !important;
          color: #64748b !important;
          margin-bottom: 12px;
          line-height: 1.6;
        }

        .premium-btn {
          display: inline-block;
          background: #0f172a;
          color: white;
          padding: 16px 40px;
          border-radius: 10px;
          font-size: 15px !important;
          font-weight: 700 !important;
          text-decoration: none;
          transition: all 0.3s ease;
          box-shadow: 0 4px 16px rgba(15, 23, 42, 0.2);
          letter-spacing: 0.5px;
          text-transform: uppercase;
          border: 2px solid #0f172a;
          cursor: pointer;
        }

        .premium-btn:hover {
          background: white;
          color: #0f172a;
          border-color: #0f172a;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(15, 23, 42, 0.25);
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

function SmartAboutBanner() {
  const deskCandidates = [
    "https://d2tnzshqdaedbc.cloudfront.net/about-desktop.jpg",
    "https://d2tnzshqdaedbc.cloudfront.net/about-us-desktop.jpg",
    "https://d2tnzshqdaedbc.cloudfront.net/about-banner.jpg",
    "https://d2tnzshqdaedbc.cloudfront.net/about-us.jpg",
    "https://d2tnzshqdaedbc.cloudfront.net/about-desktop.png",
    "https://d2tnzshqdaedbc.cloudfront.net/about-us.png",
    "https://d2tnzshqdaedbc.cloudfront.net/about-desktop.webp"
  ];
  const mobCandidates = [
    "https://d2tnzshqdaedbc.cloudfront.net/about-mobile.jpg",
    "https://d2tnzshqdaedbc.cloudfront.net/about-us-mobile.jpg",
    "https://d2tnzshqdaedbc.cloudfront.net/about-us-mob.jpg",
    "https://d2tnzshqdaedbc.cloudfront.net/about-banner-mob.jpg",
    "https://d2tnzshqdaedbc.cloudfront.net/about-mobile.png",
    "https://d2tnzshqdaedbc.cloudfront.net/about-us-mob.png",
    "https://d2tnzshqdaedbc.cloudfront.net/about-mobile.webp"
  ];

  const [deskIdx, setDeskIdx] = React.useState(0);
  const [mobIdx, setMobIdx] = React.useState(0);

  return (
    <section className="about-hero" style={{ width: "100%", overflow: "hidden" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={deskCandidates[deskIdx] || deskCandidates[0]}
        alt="About Medvarn Desktop"
        className="hero-image-desktop"
        onError={() => {
          if (deskIdx < deskCandidates.length - 1) setDeskIdx(deskIdx + 1);
        }}
        style={{ width: "100%", height: "auto", display: "block" }}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={mobCandidates[mobIdx] || mobCandidates[0]}
        alt="About Medvarn Mobile"
        className="hero-image-mobile"
        onError={() => {
          if (mobIdx < mobCandidates.length - 1) setMobIdx(mobIdx + 1);
        }}
        style={{ width: "100%", height: "auto", display: "block" }}
      />
    </section>
  );
}
