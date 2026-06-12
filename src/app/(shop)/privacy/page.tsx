"use client";

import GenericPage from "@/components/GenericPage";

export default function PrivacyPage() {
  return (
    <GenericPage title="Privacy Policy" desc="Your privacy is important to us.">
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
        <p style={{ marginBottom: "24px" }}>At Medvastr, we are committed to protecting the privacy and security of our customers and site visitors. This Privacy Policy details how we collect, use, and safeguard your personal information when you visit our website or make a purchase.</p>

        <h3 style={{ borderBottom: "1px solid #e2e8f0", paddingBottom: "12px", marginTop: "40px", color: "#0f172a" }}>1. Types of Information We Collect</h3>
        <p style={{ marginBottom: "24px" }}>We collect personal information that you provide to us directly, including but not limited to your name, email address, shipping and billing addresses, phone number, and payment information. We also automatically collect certain information about your device, such as your IP address, browser type, and how you interact with our site through cookies and similar technologies.</p>

        <h3 style={{ borderBottom: "1px solid #e2e8f0", paddingBottom: "12px", marginTop: "40px", color: "#0f172a" }}>2. How We Use Your Information</h3>
        <p style={{ marginBottom: "24px" }}>Your information is used primarily to fulfill orders placed through the site, including processing payments, arranging for shipping, and providing invoices or order confirmations. Additionally, we use this information to communicate with you about our products, protect against potential risk or fraud, and, when in line with the preferences you have shared with us, provide you with information or advertising relating to our medical apparel.</p>

        <h3 style={{ borderBottom: "1px solid #e2e8f0", paddingBottom: "12px", marginTop: "40px", color: "#0f172a" }}>3. Data Sharing and Third Parties</h3>
        <p style={{ marginBottom: "24px" }}>We share your Personal Information with third parties to help us use your Personal Information, as described above. For example, we use specialized payment processors to ensure secure transactions and logistics partners to deliver your scrubs. We may also share information to comply with applicable laws and regulations or to protect our rights.</p>

        <h3 style={{ borderBottom: "1px solid #e2e8f0", paddingBottom: "12px", marginTop: "40px", color: "#0f172a" }}>4. Your Rights and Data Retention</h3>
        <p style={{ marginBottom: "24px" }}>If you are a resident of certain territories, you have the right to access the personal information we hold about you and to ask that your personal information be corrected, updated, or deleted. When you place an order through the Site, we will maintain your Order Information for our records unless and until you ask us to delete this information.</p>

        <h3 style={{ borderBottom: "1px solid #e2e8f0", paddingBottom: "12px", marginTop: "40px", color: "#0f172a" }}>5. Security</h3>
        <p style={{ marginBottom: "24px" }}>We implement a variety of security measures to maintain the safety of your personal information. Your personal information is contained behind secured networks and is only accessible by a limited number of persons who have special access rights to such systems.</p>
      </div>
    </GenericPage>
  );
}
