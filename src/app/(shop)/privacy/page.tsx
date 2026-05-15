"use client";

import GenericPage from "@/components/GenericPage";

export default function PrivacyPage() {
  return (
    <GenericPage title="Privacy Policy" desc="Your privacy is important to us.">
      <div className="prose">
        <p>This privacy policy describes how Medvastr collects, uses and protects your personal information.</p>
        <h3>1. Information Collection</h3>
        <p>We collect information you provide directly to us, such as when you create an account, make a purchase, or contact support.</p>
        <h3>2. Use of Information</h3>
        <p>We use your information to process orders, provide customer support, and improve our services.</p>
        <h3>3. Data Security</h3>
        <p>We implement industry-standard security measures to protect your data from unauthorized access.</p>
      </div>
    </GenericPage>
  );
}
