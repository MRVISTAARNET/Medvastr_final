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
            Medvastr: Stylish & Functional Medical Scrubs, Lab Coats, and Stethoscopes for Men & Women!
          </h2>
          
          <div className={`about-rich-text ${showAll ? "expanded" : ""}`}>
            <p className="about-p">
              Medvastr is your one-stop shop for top-quality medical scrubs, lab coats, and underscrubs for men and women. We believe every medical professional deserves comfortable, flexible, and breathable apparel that also projects a highly professional image.
            </p>

            <div className="about-details">
              <h3>Medical Scrub Suits for Men and Women</h3>
              <p>Experience the perfect blend of functionality and fashion with our medical scrub suits. Crafted from a premium polyester-viscose blend, our scrubs offer superior comfort and practicality.</p>

              <h4>Types of Scrubs for Men and Women:</h4>
              <ul>
                <li><strong>V-neck Scrubs:</strong> Embrace a modern and stylish look with our flattering V-neck scrubs, available for both men and women.</li>
                <li><strong>Mandarin Collar Scrubs:</strong> Revamp your professional appearance with our sophisticated Mandarin collar scrubs.</li>
                <li><strong>Full-Sleeve Scrubs:</strong> Experience superior coverage and protection with our practical full-sleeve scrubs.</li>
                <li><strong>Short-Sleeve Scrubs:</strong> Stay cool and comfortable in our breathable short-sleeve scrubs, ideal for any medical setting.</li>
              </ul>

              <h3>Lab Coat Aprons for Men and Women</h3>
              <p>Our lab coat aprons blend functionality and sophistication. Meticulously crafted from high-quality polyester, they offer the perfect combination of durability and comfort, ensuring you make a lasting impression.</p>

              <h4>Types of Lab Coats:</h4>
              <ul>
                <li><strong>Chief Lab Coat:</strong> Command attention and exude authority with this distinguished design.</li>
                <li><strong>Focus Lab Coat:</strong> Stay sharp and focused in this versatile lab coat, perfect for the dynamic medical environment.</li>
                <li><strong>Everyday Lab Coat:</strong> Embrace the practicality and comfort of this staple lab coat for daily wear.</li>
              </ul>

              <h3>Long-Sleeve and Short-Sleeve Underscrubs for Men and Women</h3>
              <p>Discover ultimate comfort with Medvastr's underscrubs, crafted from supersoft Pima cotton. Elevate your medical attire with underscrubs that prioritize your well-being and redefine style in healthcare.</p>

              <h4>Types of Underscrubs:</h4>
              <ul>
                <li><strong>Long-Sleeve Underscrubs:</strong> Experience all-day comfort and warmth with extra coverage and breathability. Available in grey and white.</li>
                <li><strong>Short-Sleeve Underscrubs:</strong> Stay cool and stylish in this lighter, comfortable option. Available in grey and white.</li>
              </ul>

              <h3>Ecoflex Scrubs - Sustainable Medical Scrubs</h3>
              <ul>
                <li><strong>Made from PET Bottles:</strong> Each scrub embodies our commitment to environmental safety.</li>
                <li><strong>Reduced Carbon Footprint:</strong> One Ecoflex scrub reduces 0.50 tons of carbon footprint. Each scrub represents the recycling of six PET bottles.</li>
                <li><strong>4-Way Stretch:</strong> Designed for comfort and flexibility in the fast-paced medical environment.</li>
              </ul>

              <h3>Surgical Caps for Men and Women</h3>
              <h4>Types of Scrub Caps:</h4>
              <ul>
                <li><strong>Designer Scrub Caps:</strong> Express your individuality with our vibrant range of printed caps, including designs like Camouflage, Smiley, and Evil Eye.</li>
                <li><strong>Plain Scrub Caps:</strong> Opt for a classic and understated look with our plain caps in various colors.</li>
              </ul>

              <h3>Medvastr’s 6sense Stethoscope</h3>
              <p>Building on our commitment to providing comprehensive solutions for medical professionals, Medvastr recognizes the critical role of diagnostic tools like the stethoscope. While our primary focus lies in crafting stylish and functional apparel such as medical scrubs, lab coats, and underscrubs, we understand the importance of reliable equipment in your daily practice.</p>
              <p>For those seeking advanced auscultation technology, we invite you to explore the features and benefits of the 6sense Stethoscope, a valuable tool that complements our high-quality medical wear.</p>

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
