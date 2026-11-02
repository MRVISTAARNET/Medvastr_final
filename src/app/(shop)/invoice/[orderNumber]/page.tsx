"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiJson } from "@/lib/api";
import InvoiceSheet, { getInvoiceNo } from "@/components/invoice/InvoiceSheet";

export default function OrderInvoicePage() {
  const params = useParams();
  const router = useRouter();
  const orderNumber = params?.orderNumber as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!orderNumber) return;
    document.title = `Tax Invoice #${orderNumber} | Medvarn`;
    fetchInvoiceData();
  }, [orderNumber]);

  const fetchInvoiceData = async () => {
    setLoading(true);
    setError("");
    try {
      // First attempt fetching via standard get order endpoint
      let res = await apiJson<any>(`/orders/${encodeURIComponent(orderNumber)}`);
      if (res.success && res.data) {
        setOrder(res.data);
      } else {
        // Fallback: try public track endpoint
        const trackRes = await apiJson<any>(`/orders/track/${encodeURIComponent(orderNumber)}`);
        if (trackRes.success && trackRes.data) {
          setOrder(trackRes.data);
        } else {
          setError(res.message || "Order invoice not found. Please check order number.");
        }
      }
    } catch (e: any) {
      setError(e?.message || "Failed to load invoice");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "80vh", fontFamily: "sans-serif" }}>
        <div style={{ width: "40px", height: "40px", border: "4px solid #e2e8f0", borderTopColor: "#008080", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
        <p style={{ marginTop: "16px", color: "#64748b", fontWeight: 600 }}>Generating Tax Invoice...</p>
        <style jsx>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div style={{ maxWidth: "500px", margin: "80px auto", padding: "30px", background: "white", borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.05)", textAlign: "center", fontFamily: "sans-serif" }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>📄</div>
        <h2 style={{ color: "#0f172a", marginBottom: "8px" }}>Invoice Unavailable</h2>
        <p style={{ color: "#64748b", fontSize: "14px", lineHeight: "1.5", marginBottom: "24px" }}>{error || "We could not find an order matching this reference."}</p>
        <button onClick={() => router.back()} style={{ background: "#008080", color: "white", border: "none", padding: "10px 24px", borderRadius: "8px", fontWeight: 700, cursor: "pointer" }}>Back</button>
      </div>
    );
  }

  const invoiceNo = getInvoiceNo(order, orderNumber);

  const handleDownloadPDF = async () => {
    try {
      const { toPng } = await import('html-to-image');
      const { jsPDF } = await import('jspdf');
      
      const invoiceElement = document.querySelector('.invoice-sheet') as HTMLElement;
      if (!invoiceElement) return;

      // Force a consistent width (A4 proportions) so it doesn't crop on mobile/small screens
      const targetWidth = 800; 
      const originalWidth = invoiceElement.style.width;
      const originalMaxWidth = invoiceElement.style.maxWidth;
      const originalMargin = invoiceElement.style.margin;

      invoiceElement.style.width = `${targetWidth}px`;
      invoiceElement.style.maxWidth = 'none';
      invoiceElement.style.margin = '0';

      const dataUrl = await toPng(invoiceElement, { 
        quality: 1.0, 
        pixelRatio: 2,
        width: targetWidth,
        style: { transform: 'scale(1)', transformOrigin: 'top left' }
      });

      // Restore original styles
      invoiceElement.style.width = originalWidth;
      invoiceElement.style.maxWidth = originalMaxWidth;
      invoiceElement.style.margin = originalMargin;
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (invoiceElement.offsetHeight * pdfWidth) / targetWidth;
      
      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Invoice_${invoiceNo}.pdf`);
    } catch (err) {
      console.error("Error generating PDF", err);
      // Fallback to print dialog if PDF generation fails
      window.print();
    }
  };

  return (
    <div className="invoice-container">
      {/* Top Floating Control Bar (Hidden on Print) */}
      <div className="no-print control-bar">
        <div className="control-inner">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "20px" }}>📄</span>
            <span style={{ fontWeight: 800, fontSize: "15px", color: "#0f172a" }}>Tax Invoice #{order.orderNumber}</span>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <button onClick={handleDownloadPDF} className="print-btn">
              🖨️ Download PDF
            </button>
            <button onClick={() => window.close()} className="close-btn">
              ✕ Close
            </button>
          </div>
        </div>
      </div>

      {/* Main Printable A4 Tax Invoice Document */}
      <InvoiceSheet order={order} orderNumber={orderNumber} />

      <style jsx global>{`
        body {
          background: #f8fafc;
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          color: #0f172a;
        }

        .invoice-container {
          min-height: 100vh;
          padding-bottom: 60px;
        }

        .control-bar {
          background: #0f172a;
          color: white;
          padding: 14px 24px;
          position: sticky;
          top: 0;
          z-index: 100;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        .control-inner {
          max-width: 860px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .print-btn {
          background: #008080;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .print-btn:hover {
          background: #006666;
        }

        .close-btn {
          background: #334155;
          color: white;
          border: none;
          padding: 10px 16px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
        }

        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background: white !important;
          }
        }
      `}</style>
    </div>
  );
}
