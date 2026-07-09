"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function AboutHomeSection() {
  const [showAll, setShowAll] = useState(false);

  return (
    <div className="about-home">
      <div className="about-home-in">
        <div style={{ width: "100%" }}>
          <div className="about-tag">⚕ Introduction</div>
          <h2 className="about-h">
            Medvastr: Stylish & Functional Medical Scrubs and Surgical Wear for Men & Women!
          </h2>
          
          <div className={`about-rich-text ${showAll ? "expanded" : ""}`}>
            <p className="about-p">
              Medvastr is your one-stop shop for top-quality medical scrubs, surgical wear, and base layers for men and women. We believe every medical professional deserves comfortable, flexible, and breathable apparel that also projects a highly professional image.
            </p>

            <div className="about-details">
              <h3>Medical Scrub Suits for Men and Women</h3>
              <p>Experience the perfect blend of mobility, style, and utility. Crafted with premium, durable fabric, our scrubs are tailored to support you through long, demanding shifts.</p>
              <ul>
                <li><strong>Flexi Fit V Scrub:</strong> Embrace a modern, comfortable, and highly professional look with our signature Flexi Fit V Scrub, tailored to fit healthcare workers perfectly.</li>
              </ul>

              <h3>Under Scrubs & Tops for Men and Women</h3>
              <p>Elevate your medical attire with base layers and tops designed to prioritize your well-being and temperature control.</p>
              <ul>
                <li><strong>Full Sleeve Underscrub:</strong> Experience all-day comfort, warmth, and compression with extra coverage and breathability under your scrubs.</li>
                <li><strong>Cotton T-Shirt:</strong> A classic, breathable short-sleeve top designed from premium cotton for ultimate daily comfort and durability.</li>
              </ul>

              <h3>Surgical Wear for Men and Women</h3>
              <p>Critical barrier protection designed to keep you and your patients safe without sacrificing comfort.</p>
              <ul>
                <li><strong>Surgical Gown:</strong> High-performance, fluid-resistant gowns engineered to provide reliable barrier protection during clinical procedures.</li>
                <li><strong>Surgical Cap:</strong> Lightweight, secure-fit caps designed to keep you comfortable and compliant throughout your shift.</li>
              </ul>

              <div className="about-faqs">
                <h3>Frequently Asked Questions</h3>
                <div className="faq-item">
                  <strong>How do I determine the right size for my medical scrubs?</strong>
                  <p>Refer to our comprehensive size chart available on each product page to find the perfect fit. If you have specific questions, our customer service team is ready to assist you.</p>
                </div>
                <div className="faq-item">
                  <strong>Are your sustainable scrubs as durable as traditional scrubs?</strong>
                  <p>Yes, our sustainable scrubs are crafted with the same commitment to durability and quality. We prioritize eco-friendly materials without compromising on the longevity of the garment.</p>
                </div>
                <div className="faq-item">
                  <strong>Can I order a sample before placing a bulk order?</strong>
                  <p>Yes, we offer sample orders for bulk purchases. Contact our sales team to discuss your requirements, and they will guide you through the sample order process.</p>
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 24, display: "flex", gap: 16 }}>
            <button className="btn-p" onClick={() => setShowAll(!showAll)}>
              {showAll ? "Read Less" : "Read More"}
            </button>
            <Link href="/products" className="btn-g">
              Shop Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
