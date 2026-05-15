"use client";

import GenericPage from "@/components/GenericPage";

export default function TermsPage() {
  return (
    <GenericPage title="Terms of Service" desc="Please read these terms carefully.">
      <div className="prose">
        <p>By using Medvastr's services, you agree to comply with and be bound by the following terms and conditions.</p>
        <h3>1. Acceptance of Terms</h3>
        <p>Your access to and use of Medvastr is subject exclusively to these Terms and Conditions.</p>
        <h3>2. Use of Site</h3>
        <p>You agree to use the site only for lawful purposes and in a way that does not infringe the rights of others.</p>
        <h3>3. Intellectual Property</h3>
        <p>All content on this site is the property of Medvastr and is protected by copyright laws.</p>
      </div>
    </GenericPage>
  );
}
