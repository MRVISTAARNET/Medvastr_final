"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

const BULK_ITEMS: Record<string, any> = {
  "brown-blanket": {
    name: "Brown Blanket",
    desc: "Plush yet lightweight ward blankets that provide essential warmth. These blankets are designed for easy maintenance and fast drying times, ideal for high-churn clinical environments.",
    images: [
      "https://d2tnzshqdaedbc.cloudfront.net/bulk-blanket-1.jpg",
      "https://d2tnzshqdaedbc.cloudfront.net/bulk-blanket-2.jpg",
    ],
    features: [
      "Thermal insulation",
      "Hypoallergenic material",
      "Stitched edges for durability",
      "Flame retardant treated"
    ],
    bulkInfo: "Minimum order 50 units. Special rates for hospital-wide procurement."
  },
  "brown-blankets": {
    name: "Brown Blanket",
    desc: "Plush yet lightweight ward blankets that provide essential warmth. These blankets are designed for easy maintenance and fast drying times, ideal for high-churn clinical environments.",
    images: [
      "https://d2tnzshqdaedbc.cloudfront.net/bulk-blanket-1.jpg",
      "https://d2tnzshqdaedbc.cloudfront.net/bulk-blanket-2.jpg",
    ],
    features: [
      "Thermal insulation",
      "Hypoallergenic material",
      "Stitched edges for durability",
      "Flame retardant treated"
    ],
    bulkInfo: "Minimum order 50 units. Special rates for hospital-wide procurement."
  },
  "maternity-gown": {
    name: "Maternity Gown",
    desc: "Ergonomically designed maternity gowns providing ease of access for nursing and clinical checks. Made from breathable, lightweight fabric to ensure mother's comfort during stay.",
    images: [
      "https://d2tnzshqdaedbc.cloudfront.net/bulk-maternity-1.jpg",
      "https://d2tnzshqdaedbc.cloudfront.net/bulk-maternity-2.jpg",
      "https://d2tnzshqdaedbc.cloudfront.net/bulk-maternity-3.jpg",
    ],
    features: [
      "Side access panels",
      "Soft poplin fabric",
      "Snap button closures",
      "Generous fit"
    ],
    bulkInfo: "Multiple patterns available. Inquire for custom color schemes."
  },
  "linen-and-bedding": {
    name: "Linen & Bedding",
    desc: "Hospital-grade linens designed for durability and patient comfort. Our bedding is engineered to withstand over 200 industrial washes while maintaining its softness and structural integrity.",
    images: [
      "https://d2tnzshqdaedbc.cloudfront.net/bulk-linen-1.jpg",
      "https://d2tnzshqdaedbc.cloudfront.net/bulk-linen-2.jpg",
    ],
    features: [
      "Anti-microbial finish",
      "High thread count for comfort",
      "Color-coded by department",
      "Shrink-resistant fabric"
    ],
    bulkInfo: "Standard bulk discount applies. Custom embroidery available for orders above 100 sets."
  },
  "patient-dress": {
    name: "Patient Dresses",
    desc: "Soft, durable patient gowns and pajamas designed for clinical accessibility and patient dignity. Made from breathable cotton blends.",
    images: [
      "https://d2tnzshqdaedbc.cloudfront.net/bulk-patient-1.jpg",
      "https://d2tnzshqdaedbc.cloudfront.net/bulk-patient-2.jpg",
      "https://d2tnzshqdaedbc.cloudfront.net/bulk-patient-3.jpg",
      "https://d2tnzshqdaedbc.cloudfront.net/bulk-patient-4.jpg",
      "https://d2tnzshqdaedbc.cloudfront.net/bulk-patient-5.jpg",
      "https://d2tnzshqdaedbc.cloudfront.net/bulk-patient-6.jpg",
    ],
    features: [
      "Easy-tie closures",
      "Breathable cotton blend",
      "Reinforced seams",
      "Unisex design"
    ],
    bulkInfo: "Bulk pricing starts at 100 units. Custom sizes available."
  },
  "scrub-suit": {
    name: "Scrub Suit",
    desc: "Premium medical scrubs crafted from high-performance fabric that resistant to fading, shrinking, and wrinkles. Features multi-pocket utility and an ergonomic design for all-day comfort.",
    images: [
      "https://d2tnzshqdaedbc.cloudfront.net/bulk-scrub-suit-1.jpg",
      "https://d2tnzshqdaedbc.cloudfront.net/bulk-scrub-suit-2.jpg",
      "https://d2tnzshqdaedbc.cloudfront.net/bulk-scrub-suit-3.jpg",
    ],
    features: [
      "Moisture-wicking fabric",
      "Two-way stretch",
      "Anti-wrinkle finish",
      "Multiple utility pockets"
    ],
    bulkInfo: "Bulk orders above 50 sets qualify for institutional pricing. Custom embroidery/logo available."
  }
};

export default function BulkProductPage() {
  const { slug } = useParams();
  const item = BULK_ITEMS[slug as string];

  if (!item) {
    // Fallback for dynamic categories not in hardcoded list
    return (
      <div className="page" style={{ background: "#f8fafc", minHeight: "100vh", paddingBottom: "100px" }}>
        <div className="sec" style={{ textAlign: "center", paddingTop: "120px" }}>
          <div style={{ maxWidth: "800px", margin: "0 auto", background: "white", padding: "60px", borderRadius: "32px", boxShadow: "0 20px 60px rgba(0,0,0,0.05)" }}>
            <div style={{ fontSize: "64px", marginBottom: "20px" }}>📦</div>
            <h1 style={{ fontSize: "42px", fontWeight: 950, marginBottom: "20px", color: "#0f172a" }}>Professional Bulk Request</h1>
            <p style={{ fontSize: "18px", color: "#64748b", marginBottom: "40px", lineHeight: 1.8 }}>
              You are requesting details for <strong>{slug}</strong>. We provide high-grade institutional supplies
              for professional healthcare environments. Please send an enquiry for precise specifications and bulk pricing.
            </p>
            <a href={`/contact?subject=Bulk Inquiry: ${slug}`} className="enquiry-btn">
              ✉️ Request Quick Quote for {String(slug).replace(/-/g, ' ')}
            </a>
            <div style={{ marginTop: "30px" }}>
              <Link href="/bulk-orders" style={{ color: "#64748b", fontWeight: 600, textDecoration: "none" }}>← Back to Bulk Orders</Link>
            </div>
          </div>
        </div>
        <style jsx>{`
                    .enquiry-btn {
                        display: inline-block;
                        background: linear-gradient(135deg, #ff4c29 0%, #ff1e56 100%);
                        color: white;
                        padding: 22px 60px;
                        border-radius: 100px;
                        font-size: 20px;
                        font-weight: 900;
                        text-decoration: none;
                        box-shadow: 0 15px 35px rgba(255, 30, 86, 0.3);
                        text-transform: uppercase;
                        letter-spacing: 1px;
                        transition: all 0.3s;
                    }
                    .enquiry-btn:hover {
                        transform: translateY(-5px);
                        box-shadow: 0 20px 45px rgba(255, 30, 86, 0.4);
                    }
                `}</style>
      </div>
    );
  }

  // Fallback if image fails
  const handleImageError = (e: any) => {
    e.target.src = "https://placehold.co/600x800/f1f5f9/94a3b8?text=" + encodeURIComponent(item.name);
  };

  return (
    <div className="page static" style={{ background: "#ffffff", minHeight: "100vh", paddingBottom: "100px", position: 'relative' }}>
      <div className="sec">
        {/* Breadcrumb */}
        <div style={{ marginBottom: "30px", fontSize: "14px", color: "#64748b" }}>
          <Link href="/">Home</Link> <span style={{ margin: "0 8px" }}>/</span>
          <Link href="/bulk-orders">Bulk Orders</Link> <span style={{ margin: "0 8px" }}>/</span>
          <span style={{ color: "#0f172a", fontWeight: 700 }}>{item.name}</span>
        </div>

        <div className="bulk-product-layout">
          {/* IMAGE GALLERY - VERTICAL STACK */}
          <div className="gallery-column">
            {item.images.map((img: string, i: number) => (
              <div key={i} className="main-image-box">
                <img
                  src={img}
                  alt={`${item.name} ${i + 1}`}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={handleImageError}
                />
              </div>
            ))}
          </div>

          {/* PRODUCT INFO */}
          <div className="info-column">
            <h1 className="prod-title">{item.name}</h1>
            <div className="bulk-badge">INSTITUTIONAL PRICING</div>

            <p className="prod-desc">{item.desc}</p>

            <div className="features-list">
              <h3>Key Features</h3>
              <ul>
                {item.features.map((f: string) => (
                  <li key={f}>✓ {f}</li>
                ))}
              </ul>
            </div>

            <div className="bulk-notice">
              <h3>📦 Bulk Information</h3>
              <p>{item.bulkInfo}</p>
            </div>

            <div className="cta-box">
              <p className="cta-text">Looking for bulk pricing? Send us an enquiry today!</p>
              <a href={`/contact?subject=Bulk Enquiry: ${item.name}`} className="enquiry-btn">
                ✉️ Send Enquiry for {item.name}
              </a>
            </div>
          </div>
        </div>

        {/* BOTTOM CTA - WIDE BUTTON */}
        <div className="bottom-cta-section">
          <div className="bottom-cta-card">
            <h2>Ready to place a bulk order?</h2>
            <p>Get the best institutional pricing for {item.name}. Our team will get back to you within 24 hours.</p>
            <a href={`/contact?subject=Bulk Enquiry: ${item.name}`} className="enquiry-btn-wide">
              ✉️ Send Enquiry for {item.name}
            </a>
          </div>
        </div>
      </div>

      <style jsx>{`
        .bulk-product-layout {
          display: flex;
          gap: 80px;
          align-items: flex-start;
          width: 100%;
          position: relative;
        }

        .gallery-column {
          flex: 1.2;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .main-image-box {
          aspect-ratio: 1 / 1;
          background: white;
          border-radius: 32px;
          overflow: hidden;
          border: 1px solid #e2e8f0;
        }

        .info-column {
          flex: 1;
          position: sticky;
          top: 100px;
          align-self: flex-start;
          height: fit-content;
          z-index: 99;
        }

        .prod-title {
          font-size: 56px;
          font-weight: 950;
          color: #0f172a;
          margin-bottom: 5px;
          letter-spacing: -2px;
          line-height: 1.1;
        }

        .bulk-badge {
          display: inline-block;
          background: #3b82f6;
          color: white;
          padding: 6px 16px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 900;
          margin-bottom: 35px;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .prod-desc {
          font-size: 18px;
          line-height: 1.8;
          color: #475569;
          margin-bottom: 40px;
        }

        .features-list {
          margin-bottom: 40px;
        }

        .features-list h3 {
          font-size: 16px;
          font-weight: 800;
          margin-bottom: 15px;
          text-transform: uppercase;
          color: #0f172a;
        }

        .features-list ul {
          list-style: none;
          padding: 0;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .features-list li {
          font-size: 15px;
          color: #475569;
          font-weight: 600;
        }

        .bulk-notice {
          background: white;
          padding: 24px;
          border-radius: 16px;
          border-left: 5px solid #008080;
          margin-bottom: 40px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.03);
        }

        .bulk-notice h3 {
          font-size: 16px;
          margin-bottom: 8px;
          color: #0f172a;
        }

        .bulk-notice p {
          font-size: 14px;
          color: #64748b;
          margin: 0;
          line-height: 1.6;
        }

        .cta-box {
          margin-top: 50px;
          padding: 30px;
          background: #f0fdf4;
          border-radius: 24px;
          border: 2px dashed #008080;
          text-align: center;
        }

        .cta-text {
          font-size: 16px;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 20px;
        }

        .enquiry-btn {
          display: inline-block;
          background: linear-gradient(135deg, #ff4c29 0%, #ff1e56 100%);
          color: white;
          text-align: center;
          padding: 20px 50px;
          border-radius: 100px;
          font-size: 20px;
          font-weight: 900;
          text-decoration: none;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          box-shadow: 0 12px 35px rgba(255, 30, 86, 0.35);
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .enquiry-btn:hover {
          transform: translateY(-8px) scale(1.03);
          box-shadow: 0 22px 50px rgba(255, 30, 86, 0.45);
          filter: brightness(1.1);
        }

        .bottom-cta-section {
          margin-top: 80px;
          padding: 60px 0;
          border-top: 1px solid #e2e8f0;
          text-align: center;
        }

        .bottom-cta-card {
          background: #f8fafc;
          padding: 60px 40px;
          border-radius: 40px;
          border: 1px solid #e2e8f0;
          max-width: 900px;
          margin: 0 auto;
        }

        .bottom-cta-card h2 {
          font-size: 40px;
          font-weight: 950;
          color: #0f172a;
          margin-bottom: 12px;
          letter-spacing: -1.5px;
        }

        .bottom-cta-card p {
          font-size: 18px;
          color: #64748b;
          margin-bottom: 40px;
        }

        .enquiry-btn-wide {
          display: inline-block;
          width: 100%;
          max-width: 500px;
          background: linear-gradient(135deg, #ff4c29 0%, #ff1e56 100%);
          color: white;
          text-align: center;
          padding: 24px 50px;
          border-radius: 100px;
          font-size: 20px;
          font-weight: 900;
          text-decoration: none;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          box-shadow: 0 15px 45px rgba(255, 30, 86, 0.4);
          text-transform: uppercase;
          letter-spacing: 1.5px;
        }

        .enquiry-btn-wide:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 25px 60px rgba(255, 30, 86, 0.5);
          filter: brightness(1.1);
        }

        @media (max-width: 1024px) {
          .bulk-product-layout {
            flex-direction: column;
            gap: 40px;
          }
          .gallery-column {
             width: 100%;
          }
          .info-column {
            position: static;
             width: 100%;
          }
          .prod-title {
            font-size: 32px;
          }
        }
      `}</style>
    </div>
  );
}
