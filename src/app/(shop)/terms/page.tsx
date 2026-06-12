"use client";

import GenericPage from "@/components/GenericPage";

export default function TermsPage() {
  return (
    <GenericPage title="Terms of Service" desc="Please read these terms carefully.">
      <div
        className="prose"
        style={{
          textAlign: "justify",
          lineHeight: "1.8",
          color: "#334155",
          fontSize: "16px",
          maxWidth: "100%",
          margin: "0 auto"
        }}
      >
        <p style={{ marginBottom: "24px" }}>Welcome to Medvastr. By accessing our website and purchasing our medical apparel, you agree to be bound by the following terms and conditions. Please read them carefully before making a purchase.</p>

        <h3 style={{ borderBottom: "1px solid #e2e8f0", paddingBottom: "12px", marginTop: "40px", color: "#0f172a" }}>1. Agreement to Terms</h3>
        <p style={{ marginBottom: "24px" }}>These Terms of Service constitute a legally binding agreement made between you, whether personally or on behalf of an entity, and Medvastr, concerning your access to and use of our website. You agree that by accessing the site, you have read, understood, and agreed to be bound by all of these terms.</p>

        <h3 style={{ borderBottom: "1px solid #e2e8f0", paddingBottom: "12px", marginTop: "40px", color: "#0f172a" }}>2. Product Information and Pricing</h3>
        <p style={{ marginBottom: "24px" }}>We strive to display our products as accurately as possible. However, we do not guarantee that the color, texture, or detail of the apparel shown on your screen will exactly match the actual product. Prices for our products are subject to change without notice. We reserve the right to modify or discontinue any product or service at any time.</p>

        <h3 style={{ borderBottom: "1px solid #e2e8f0", paddingBottom: "12px", marginTop: "40px", color: "#0f172a" }}>3. Orders and Payments</h3>
        <p style={{ marginBottom: "24px" }}>By placing an order, you represent that all information provided is accurate and complete. We reserve the right to refuse any order you place with us. In the event that we make a change to or cancel an order, we may attempt to notify you by contacting the email or billing address provided at the time the order was made.</p>

        <h3 style={{ borderBottom: "1px solid #e2e8f0", paddingBottom: "12px", marginTop: "40px", color: "#0f172a" }}>4. Shipping and Delivery</h3>
        <p style={{ marginBottom: "24px" }}>Delivery times are estimates and may vary based on your location and external factors. Medvastr is not responsible for delays caused by logistics partners or customs clearance processes. Risk of loss and title for items purchased pass to you upon our delivery to the carrier.</p>

        <h3 style={{ borderBottom: "1px solid #e2e8f0", paddingBottom: "12px", marginTop: "40px", color: "#0f172a" }}>5. Intellectual Property</h3>
        <p style={{ marginBottom: "24px" }}>Unless otherwise indicated, the site and its entire contents (including designs, text, and graphics) are the proprietary property of Medvastr and are protected by copyright and trademark laws. You may not use, reproduce, or distribute any content without our express written permission.</p>

        <h3 style={{ borderBottom: "1px solid #e2e8f0", paddingBottom: "12px", marginTop: "40px", color: "#0f172a" }}>6. Limitation of Liability</h3>
        <p style={{ marginBottom: "24px" }}>In no event shall Medvastr be liable for any direct, indirect, incidental, or consequential damages resulting from your use of the site or the purchase of our products. Our total liability to you for any claim shall not exceed the amount paid by you for the product in question.</p>
      </div>
    </GenericPage>
  );
}
