"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

const BULK_ITEMS: Record<string, any> = {
    "linen-bedding": {
        name: "Linen & Bedding",
        desc: "Hospital-grade linens designed for durability and patient comfort. Our bedding is engineered to withstand over 200 industrial washes while maintaining its softness and structural integrity.",
        images: [
            "https://medvastr-assets.s3.ap-south-1.amazonaws.com/bulk-linen.png",
            "https://medvastr-assets.s3.ap-south-1.amazonaws.com/bulk-linen-2.png",
            "https://medvastr-assets.s3.ap-south-1.amazonaws.com/bulk-linen-3.png",
        ],
        features: [
            "Anti-microbial finish",
            "High thread count for comfort",
            "Color-coded by department",
            "Shrink-resistant fabric"
        ],
        bulkInfo: "Standard bulk discount applies. Custom embroidery available for orders above 100 sets."
    },
    "brown-blanket": {
        name: "Brown Blanket",
        desc: "Plush yet lightweight ward blankets that provide essential warmth. These blankets are designed for easy maintenance and fast drying times, ideal for high-churn clinical environments.",
        images: [
            "https://medvastr-assets.s3.ap-south-1.amazonaws.com/bulk-blanket.png",
            "https://medvastr-assets.s3.ap-south-1.amazonaws.com/bulk-blanket-2.png",
            "https://medvastr-assets.s3.ap-south-1.amazonaws.com/bulk-blanket-3.png",
        ],
        features: [
            "Thermal insulation",
            "Hypoallergenic material",
            "Stitched edges for durability",
            "Flame retardant treated"
        ],
        bulkInfo: "Minimum order 20 units. Special rates for hospital-wide procurement."
    },
    "maternity-gown": {
        name: "Maternity Gown",
        desc: "Ergonomically designed maternity gowns providing ease of access for nursing and clinical checks. Made from breathable, lightweight fabric to ensure mother's comfort during stay.",
        images: [
            "https://medvastr-assets.s3.ap-south-1.amazonaws.com/bulk-maternity.png",
            "https://medvastr-assets.s3.ap-south-1.amazonaws.com/bulk-maternity-2.png",
            "https://medvastr-assets.s3.ap-south-1.amazonaws.com/bulk-maternity-3.png",
        ],
        features: [
            "Side access panels",
            "Soft poplin fabric",
            "Snap button closures",
            "Generous fit"
        ],
        bulkInfo: "Multiple patterns available. Inquire for custom color schemes."
    }
};

export default function BulkProductPage() {
    const { slug } = useParams();
    const item = BULK_ITEMS[slug as string];
    const [mainImg, setMainImg] = useState(item?.images[0] || "");

    if (!item) {
        return (
            <div className="page" style={{ textAlign: "center", padding: "100px 20px" }}>
                <h1>Product Not Found</h1>
                <Link href="/bulk-orders" style={{ color: "#008080", textDecoration: "underline" }}>Back to Bulk Orders</Link>
            </div>
        );
    }

    return (
        <div className="page" style={{ background: "#f8fafc", minHeight: "100vh", paddingBottom: "100px" }}>
            <div className="sec">
                {/* Breadcrumb */}
                <div style={{ marginBottom: "30px", fontSize: "14px", color: "#64748b" }}>
                    <Link href="/">Home</Link> <span style={{ margin: "0 8px" }}>/</span>
                    <Link href="/bulk-orders">Bulk Orders</Link> <span style={{ margin: "0 8px" }}>/</span>
                    <span style={{ color: "#0f172a", fontWeight: 700 }}>{item.name}</span>
                </div>

                <div className="bulk-product-layout">
                    {/* IMAGE GALLERY */}
                    <div className="gallery-column">
                        <div className="main-image-box">
                            <img src={mainImg} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        </div>
                        <div className="thumbs-row">
                            {item.images.map((img: string, i: number) => (
                                <div
                                    key={i}
                                    className={`thumb ${mainImg === img ? "active" : ""}`}
                                    onClick={() => setMainImg(img)}
                                >
                                    <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                </div>
                            ))}
                        </div>
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

                        <Link href="/contact" className="enquiry-btn">
                            Enquiry Now
                        </Link>
                    </div>
                </div>
            </div>

            <style jsx>{`
        .bulk-product-layout {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 80px;
          align-items: start;
        }

        .gallery-column {
          position: sticky;
          top: 120px;
        }

        .main-image-box {
          aspect-ratio: 16/10;
          background: white;
          border-radius: 32px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0,0,0,0.08);
          margin-bottom: 25px;
          border: 1px solid #f1f5f9;
        }

        .thumbs-row {
          display: flex;
          gap: 20px;
          justify-content: center;
        }

        .thumb {
          width: 100px;
          height: 70px;
          border-radius: 16px;
          overflow: hidden;
          cursor: pointer;
          border: 3px solid transparent;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          opacity: 0.6;
        }

        .thumb:hover {
          opacity: 1;
          transform: translateY(-5px);
        }

        .thumb.active {
          border-color: #008080;
          box-shadow: 0 10px 25px rgba(0,128,128,0.2);
          opacity: 1;
        }

        .prod-title {
          font-size: 56px;
          font-weight: 900;
          color: #0f172a;
          margin-bottom: 15px;
          letter-spacing: -2px;
          line-height: 1;
        }

        .bulk-badge {
          display: inline-block;
          background: linear-gradient(135deg, #0d9488 0%, #059669 100%);
          color: white;
          padding: 8px 20px;
          border-radius: 100px;
          font-size: 12px;
          font-weight: 800;
          margin-bottom: 30px;
          letter-spacing: 1.5px;
          box-shadow: 0 10px 20px rgba(5,150,105,0.2);
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

        .enquiry-btn {
          display: block;
          background: #008080;
          color: white;
          text-align: center;
          padding: 20px;
          border-radius: 14px;
          font-size: 18px;
          font-weight: 800;
          text-decoration: none;
          transition: all 0.3s;
          box-shadow: 0 10px 25px rgba(0,128,128,0.2);
        }

        .enquiry-btn:hover {
          transform: translateY(-3px);
          background: #006666;
          box-shadow: 0 15px 35px rgba(0,128,128,0.3);
        }

        @media (max-width: 900px) {
          .bulk-product-layout {
            grid-template-columns: 1fr;
            gap: 40px;
          }
          .prod-title {
            font-size: 32px;
          }
        }
      `}</style>
        </div>
    );
}
