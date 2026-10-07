"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiJson } from "@/lib/api";
import { fmt, fmtDate } from "@/lib/data";

function numberToWords(num: number): string {
  if (!num || isNaN(num)) return "Zero Rupees Only";
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function inWords(n: number): string {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? ' ' + a[n % 10] : '');
    if (n < 1000) return inWords(Math.floor(n / 100)) + 'Hundred ' + (n % 100 ? inWords(n % 100) : '');
    if (n < 100000) return inWords(Math.floor(n / 1000)) + 'Thousand ' + (n % 1000 ? inWords(n % 1000) : '');
    if (n < 10000000) return inWords(Math.floor(n / 100000)) + 'Lakh ' + (n % 100000 ? inWords(n % 100000) : '');
    return inWords(Math.floor(n / 10000000)) + 'Crore ' + (n % 10000000 ? inWords(n % 10000000) : '');
  }

  const integerPart = Math.floor(num);
  const words = inWords(integerPart).trim();
  return words ? words + " Rupees Only" : "Zero Rupees Only";
}

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

  const items = order.items || [];
  const subtotal = Math.round(order.subtotal || 0);
  const shipping = Math.round(order.shippingAmount || 0);
  const codFee = Math.round(order.codFee || 0);
  const discount = Math.round(order.discountAmount || 0);
  const total = Math.round(order.totalAmount || (subtotal + shipping + codFee - discount));
  
  // GST 5% Tax breakdown for HSN 6211 (CGST 2.5% + SGST 2.5% equal split)
  const taxableSubtotal = Math.max(0, subtotal - discount);
  const rawTax = order.taxAmount ? Number(order.taxAmount) : (taxableSubtotal * 5 / 105);
  const totalTax = Math.round(rawTax * 100) / 100;
  const cgst = Math.round((totalTax / 2) * 100) / 100;
  const sgst = Number((totalTax - cgst).toFixed(2));

  const invoiceNo = `INV-${(order.orderNumber || orderNumber).replace(/[^a-zA-Z0-9-]/g, '')}`;

  const handleDownloadPDF = async () => {
    try {
      const { toPng } = await import('html-to-image');
      const { jsPDF } = await import('jspdf');
      
      const invoiceElement = document.querySelector('.invoice-sheet') as HTMLElement;
      if (!invoiceElement) return;

      const dataUrl = await toPng(invoiceElement, { quality: 1.0, pixelRatio: 2 });
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (invoiceElement.offsetHeight * pdfWidth) / invoiceElement.offsetWidth;
      
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
      <div className="invoice-sheet">
        {/* Header Branding */}
        <div className="inv-header">
          <div>
            <div className="inv-brand-logo">MEDVARN</div>
            <div className="inv-company-name">NAMOKAAR MEDVARN LLP</div>
            <div className="inv-company-address">
              Gagan Shopping Arcade, Lower Level Shop No 1, Krishna Vatika Marg, Gokuldham<br />
              Goregaon East, Mumbai, Maharashtra, India – 400063<br />
              <strong>GSTIN:</strong> 27ABAFN4863B1ZG | <strong>PAN:</strong> ABAFN4863B<br />
              <strong>Email:</strong> info@medvarn.com | <strong>Web:</strong> www.medvarn.com
            </div>
          </div>
          <div className="inv-header-right">
            <div className="inv-title-badge">TAX INVOICE</div>
            <div className="inv-meta-grid">
              <div className="inv-meta-lbl">Invoice No:</div>
              <div className="inv-meta-val">{invoiceNo}</div>
              
              <div className="inv-meta-lbl">Invoice Date:</div>
              <div className="inv-meta-val">{fmtDate(order.createdAt || new Date())}</div>

              <div className="inv-meta-lbl">Order No:</div>
              <div className="inv-meta-val">{order.orderNumber}</div>

              <div className="inv-meta-lbl">Payment Mode:</div>
              <div className="inv-meta-val">{order.paymentMethod || "COD"}</div>

              <div className="inv-meta-lbl">Payment Status:</div>
              <div className="inv-meta-val" style={{ color: order.paymentStatus === "PAID" ? "#166534" : "#92400e", fontWeight: 800 }}>
                {order.paymentStatus || "PENDING"}
              </div>
            </div>
          </div>
        </div>

        <hr className="inv-divider" />

        {/* Address Grid */}
        <div className="inv-address-grid">
          <div className="inv-address-box">
            <div className="inv-section-title">Billed To / Customer</div>
            <div className="inv-person-name">{order.shippingName || "Customer"}</div>
            <div className="inv-address-text">
              {order.shippingAddress}<br />
              {order.shippingCity}, {order.shippingState} – {order.shippingPincode}<br />
              <strong>Phone:</strong> {order.shippingPhone || "—"}<br />
              {order.userEmail && <span><strong>Email:</strong> {order.userEmail}</span>}
            </div>
          </div>

          <div className="inv-address-box">
            <div className="inv-section-title">Shipped To / Delivery Address</div>
            <div className="inv-person-name">{order.shippingName || "Customer"}</div>
            <div className="inv-address-text">
              {order.shippingAddress}<br />
              {order.shippingCity}, {order.shippingState} – {order.shippingPincode}<br />
              <strong>Phone:</strong> {order.shippingPhone || "—"}<br />
              {order.trackingNumber && (
                <div style={{ marginTop: "4px" }}>
                  <strong>AWB Tracking:</strong> {order.trackingNumber} ({order.courierName || "Courier"})
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Itemized Table */}
        <table className="inv-table">
          <thead>
            <tr>
              <th style={{ width: "40px", textAlign: "center" }}>#</th>
              <th>Description of Goods</th>
              <th style={{ width: "80px", textAlign: "center" }}>HSN</th>
              <th style={{ width: "50px", textAlign: "center" }}>Qty</th>
              <th style={{ width: "90px", textAlign: "right" }}>Unit Rate</th>
              <th style={{ width: "70px", textAlign: "center" }}>GST</th>
              <th style={{ width: "100px", textAlign: "right" }}>Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: "center", padding: "20px", color: "#64748b" }}>Item details unavailable</td></tr>
            ) : items.map((item: any, idx: number) => {
              const itemRate = item.unitPrice || 0;
              const itemTotal = item.totalPrice || (itemRate * item.quantity);

              return (
                <tr key={idx}>
                  <td style={{ textAlign: "center", color: "#64748b" }}>{idx + 1}</td>
                  <td>
                    <div className="inv-item-name">{item.productName}</div>
                    <div className="inv-item-meta">
                      Size: {item.size || "—"} | Color: {item.colorName || "—"} {item.sku && `| SKU: ${item.sku}`}
                    </div>
                    {item.embroideryDetails && (
                      <div className="inv-item-embroidery">
                        ✨ Custom Embroidery (+₹{item.embroideryPrice || 99}): {(() => {
                          try {
                            const p = JSON.parse(item.embroideryDetails);
                            return [p.line1, p.line2].filter(Boolean).join(' / ') + ` (${p.textColor || 'white'})`;
                          } catch { return item.embroideryDetails; }
                        })()}
                      </div>
                    )}
                  </td>
                  <td style={{ textAlign: "center", fontFamily: "monospace" }}>6211</td>
                  <td style={{ textAlign: "center", fontWeight: 700 }}>{item.quantity}</td>
                  <td style={{ textAlign: "right" }}>{fmt(itemRate)}</td>
                  <td style={{ textAlign: "center" }}>5%</td>
                  <td style={{ textAlign: "right", fontWeight: 700 }}>{fmt(itemTotal)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Totals & Tax Calculation Breakdown */}
        <div className="inv-totals-section">
          <div className="inv-words-box">
            <div className="inv-words-lbl">Amount in Words:</div>
            <div className="inv-words-val">{numberToWords(total)}</div>

            <div className="inv-tax-breakdown-box">
              <div className="inv-tax-title">GST Tax Breakdown (5% GST for HSN 6211):</div>
              <table className="inv-mini-tax-table">
                <tbody>
                  <tr>
                    <td>CGST (2.5%):</td>
                    <td style={{ textAlign: "right", fontWeight: 600 }}>₹ {cgst.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>SGST (2.5%):</td>
                    <td style={{ textAlign: "right", fontWeight: 600 }}>₹ {sgst.toFixed(2)}</td>
                  </tr>
                  <tr style={{ borderTop: "1px solid #cbd5e1" }}>
                    <td><strong>Total Tax Included:</strong></td>
                    <td style={{ textAlign: "right", fontWeight: 800 }}>₹ {totalTax.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="inv-summary-table">
            <div className="inv-sum-row">
              <span>Subtotal:</span>
              <span>{fmt(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="inv-sum-row" style={{ color: "#166534" }}>
                <span>Discount / Promo:</span>
                <span>-{fmt(discount)}</span>
              </div>
            )}
            <div className="inv-sum-row">
              <span>Shipping Charges:</span>
              <span>{shipping > 0 ? fmt(shipping) : "FREE"}</span>
            </div>
            {codFee > 0 && (
              <div className="inv-sum-row">
                <span>COD Convenience Fee:</span>
                <span>{fmt(codFee)}</span>
              </div>
            )}
            <div className="inv-sum-row inv-grand-total">
              <span>Grand Total (INR):</span>
              <span>{fmt(total)}</span>
            </div>
          </div>
        </div>

        {/* Footer & Signature */}
        <div className="inv-footer">
          <div className="inv-terms">
            <strong>Terms & Conditions:</strong>
            <ol>
              <li>Goods once sold are covered under Medvarn 7-Day Replacement Policy.</li>
              <li>Custom embroidered items are personalized and non-returnable unless defective.</li>
              <li>This is a computer-generated tax invoice and requires no physical signature.</li>
            </ol>
          </div>

          <div className="inv-signature-box">
            <div className="inv-sig-title">For NAMOKAAR MEDVARN LLP</div>
            <div className="inv-stamp">Authorized Signatory</div>
          </div>
        </div>
      </div>

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

        .invoice-sheet {
          max-width: 840px;
          margin: 40px auto;
          background: white;
          padding: 40px;
          border-radius: 12px;
          box-shadow: 0 4px 25px rgba(0,0,0,0.06);
          border: 1px solid #e2e8f0;
        }

        .inv-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
        }

        .inv-brand-logo {
          font-size: 26px;
          font-weight: 900;
          color: #008080;
          letter-spacing: 2px;
        }

        .inv-company-name {
          font-size: 12px;
          font-weight: 800;
          color: #334155;
          margin-top: 2px;
          text-transform: uppercase;
        }

        .inv-company-address {
          font-size: 12px;
          color: #64748b;
          margin-top: 6px;
          line-height: 1.5;
        }

        .inv-header-right {
          text-align: right;
        }

        .inv-title-badge {
          display: inline-block;
          font-size: 18px;
          font-weight: 900;
          color: #0f172a;
          letter-spacing: 2px;
          border-bottom: 2px solid #008080;
          padding-bottom: 4px;
          margin-bottom: 12px;
        }

        .inv-meta-grid {
          display: grid;
          grid-template-columns: auto auto;
          gap: 4px 12px;
          font-size: 12.5px;
          text-align: right;
        }

        .inv-meta-lbl {
          color: #64748b;
          font-weight: 600;
        }

        .inv-meta-val {
          color: #0f172a;
          font-weight: 700;
        }

        .inv-divider {
          border: none;
          border-top: 1.5px solid #e2e8f0;
          margin: 24px 0;
        }

        .inv-address-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          margin-bottom: 30px;
        }

        .inv-address-box {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 16px;
        }

        .inv-section-title {
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #008080;
          margin-bottom: 8px;
        }

        .inv-person-name {
          font-size: 15px;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 4px;
        }

        .inv-address-text {
          font-size: 13px;
          color: #475569;
          line-height: 1.5;
        }

        .inv-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
          font-size: 13px;
        }

        .inv-table th {
          background: #f1f5f9;
          color: #0f172a;
          font-weight: 800;
          text-transform: uppercase;
          font-size: 11px;
          letter-spacing: 0.5px;
          padding: 10px 12px;
          border: 1px solid #cbd5e1;
        }

        .inv-table td {
          padding: 12px;
          border: 1px solid #e2e8f0;
          vertical-align: top;
        }

        .inv-item-name {
          font-weight: 700;
          color: #0f172a;
        }

        .inv-item-meta {
          font-size: 11px;
          color: #64748b;
          margin-top: 3px;
        }

        .inv-item-embroidery {
          font-size: 11px;
          color: #0d9488;
          font-weight: 600;
          margin-top: 3px;
        }

        .inv-totals-section {
          display: grid;
          grid-template-columns: 1fr 280px;
          gap: 30px;
          align-items: flex-start;
          margin-bottom: 30px;
        }

        .inv-words-lbl {
          font-size: 11px;
          font-weight: 800;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .inv-words-val {
          font-size: 13.5px;
          font-weight: 700;
          color: #0f172a;
          margin-top: 2px;
          font-style: italic;
        }

        .inv-tax-breakdown-box {
          margin-top: 16px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 12px 16px;
        }

        .inv-tax-title {
          font-size: 11px;
          font-weight: 700;
          color: #475569;
          margin-bottom: 8px;
        }

        .inv-mini-tax-table {
          width: 100%;
          font-size: 12px;
          color: #334155;
        }

        .inv-mini-tax-table td {
          padding: 3px 0;
        }

        .inv-summary-table {
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          padding: 16px;
        }

        .inv-sum-row {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          margin-bottom: 8px;
          color: #475569;
        }

        .inv-grand-total {
          border-top: 2px solid #0f172a;
          padding-top: 10px;
          margin-top: 10px;
          margin-bottom: 0;
          font-size: 16px;
          font-weight: 900;
          color: #008080;
        }

        .inv-footer {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          border-top: 1.5px dashed #cbd5e1;
          padding-top: 20px;
          margin-top: 20px;
        }

        .inv-terms {
          font-size: 11px;
          color: #64748b;
          max-width: 460px;
          line-height: 1.5;
        }

        .inv-terms ol {
          margin: 4px 0 0;
          padding-left: 16px;
        }

        .inv-signature-box {
          text-align: center;
        }

        .inv-sig-title {
          font-size: 11px;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 40px;
        }

        .inv-stamp {
          font-size: 11px;
          font-weight: 700;
          color: #64748b;
          border-top: 1px solid #94a3b8;
          padding-top: 4px;
        }

        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background: white !important;
          }
          .invoice-sheet {
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
            padding: 0 !important;
            max-width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
}
