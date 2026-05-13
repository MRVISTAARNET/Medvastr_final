"use client";

import React, { useState } from "react";

export default function AboutHomeSection() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="about-home">
      <div className="about-home-in">
        <div className="about-content">
          <div className="about-tag">⚕ Introduction</div>
          <h2 className="about-h">
            Medvastr: Stylish & Functional Medical Scrubs, Lab Coats, and Stethoscopes for Men & Women!
          </h2>
          
          <div className={`about-text ${isExpanded ? 'expanded' : ''}`}>
            <p className="about-p">
              <strong>Medvastr</strong> is your one-stop shop for top-quality medical scrubs, lab coats, and underscrubs for men and women. We believe every medical professional deserves comfortable, flexible, and breathable apparel that also projects a highly professional image.
            </p>

            <div className="more-content">
              <h3>Medical Scrub Suits for Men and Women</h3>
              <p>Experience the perfect blend of functionality and fashion with our medical scrub suits. Crafted from a premium polyester-viscose blend, our scrubs offer superior comfort and practicality.</p>
              
              <h4>Types of Scrubs:</h4>
              <ul>
                <li><strong>V-neck Scrubs:</strong> Modern and stylish look, available for both men and women.</li>
                <li><strong>Mandarin Collar Scrubs:</strong> Sophisticated professional appearance.</li>
                <li><strong>Full-Sleeve Scrubs:</strong> Superior coverage and protection.</li>
                <li><strong>Short-Sleeve Scrubs:</strong> Stay cool and comfortable in any medical setting.</li>
              </ul>

              <h3>Lab Coat Aprons for Men and Women</h3>
              <p>Our lab coat aprons blend functionality and sophistication. Meticulously crafted from high-quality polyester, they ensure you make a lasting impression.</p>

              <h4>Types of Lab Coats:</h4>
              <ul>
                <li><strong>Chief Lab Coat:</strong> Distinguished design that exudes authority.</li>
                <li><strong>Focus Lab Coat:</strong> Versatile and sharp for dynamic medical environments.</li>
                <li><strong>Everyday Lab Coat:</strong> Practicality and comfort for daily wear.</li>
              </ul>

              <h3>Underscrubs & Ecoflex™</h3>
              <p>Discover ultimate comfort with Medvastr's underscrubs, crafted from supersoft Pima cotton. Elevate your attire with underscrubs that prioritize your well-being.</p>
              
              <p><strong>Ecoflex Scrubs:</strong> Made from PET Bottles. Each scrub reduces 0.50 tons of carbon footprint and represents recycling six PET bottles. Featuring 4-way stretch for maximum flexibility.</p>

              <h3>Frequently Asked Questions</h3>
              <div className="faq-mini">
                <div><strong>How do I determine the right size?</strong> Refer to our size chart on each product page or contact support.</div>
                <div><strong>Do you offer bulk customization?</strong> Yes, we provide customization for bulk orders. Contact us to discuss your needs.</div>
                <div><strong>What is the return policy?</strong> Returns are accepted for unworn items within the specified period. See our Returns page for details.</div>
              </div>
            </div>
          </div>

          <button className="read-more-btn" onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? "Read Less" : "Read More"}
          </button>
        </div>
      </div>

      <style jsx>{`
        .about-home {
          background: white;
          padding: 100px 0;
          border-top: 1px solid var(--bdr);
        }
        .about-home-in {
          max-width: 1560px;
          margin: 0 auto;
          padding: 0 44px;
        }
        .about-content {
          max-width: 900px;
        }
        .about-tag {
          font-size: 11px;
          font-weight: 800;
          color: var(--t);
          letter-spacing: 2px;
          text-transform: uppercase;
          margin-bottom: 15px;
        }
        .about-h {
          font-family: var(--serif);
          font-size: 42px;
          color: var(--ink);
          margin-bottom: 30px;
          line-height: 1.1;
        }
        .about-p {
          font-size: 18px;
          line-height: 1.7;
          color: var(--ink2);
          margin-bottom: 20px;
        }
        .about-text {
          position: relative;
          max-height: 150px;
          overflow: hidden;
          transition: max-height 0.5s ease;
        }
        .about-text.expanded {
          max-height: 2000px;
        }
        .about-text:not(.expanded)::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 80px;
          background: linear-gradient(to bottom, transparent, white);
        }
        .more-content {
          margin-top: 40px;
        }
        h3 { font-family: var(--serif); font-size: 24px; color: var(--ink); margin: 30px 0 15px; }
        h4 { font-size: 16px; color: var(--ink); margin: 20px 0 10px; font-weight: 700; }
        ul { list-style: disc; margin-left: 20px; color: var(--ink2); margin-bottom: 20px; }
        li { margin-bottom: 8px; line-height: 1.6; }
        .faq-mini { margin-top: 30px; display: grid; gap: 20px; }
        .faq-mini div { font-size: 14px; color: var(--lt); line-height: 1.5; }
        .faq-mini strong { color: var(--ink); display: block; margin-bottom: 4px; }
        
        .read-more-btn {
          margin-top: 30px;
          background: var(--ink);
          color: white;
          border: none;
          padding: 12px 30px;
          border-radius: 999px;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.2s;
        }
        .read-more-btn:hover {
          background: var(--t);
        }
        @media (max-width: 768px) {
          .about-home { padding: 60px 0; }
          .about-home-in { padding: 0 20px; }
          .about-h { font-size: 28px; }
        }
      `}</style>
    </div>
  );
}
