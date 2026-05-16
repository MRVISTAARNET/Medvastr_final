"use client";

import GenericPage from "@/components/GenericPage";
import { B } from "@/lib/data";

export default function BulkPage() {
  return (
    <GenericPage title="Bulk Orders" desc="Special pricing for hospitals, clinics and organizations.">
      <div className="prose">
        <p>Looking to outfit your entire team? Medvastr offers specialized bulk ordering solutions.</p>
        <h3>✓ Institutional Pricing</h3>
        <p>Get discounted rates on orders of 20 units or more.</p>
        <h3>✓ Custom Embroidery</h3>
        <p>Add your organization's logo or employee names to any garment.</p>
        <h3>✓ Dedicated Support</h3>
        <p>Work with a dedicated account manager for your procurement needs.</p>
        <div style={{ marginTop: 40, padding: 30, background: "var(--warm)", borderRadius: 12 }}>
          <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Get a Quote Today</div>
          <p style={{ margin: 0 }}>Email us at <strong>{B.email}</strong> or call <strong>{B.phone1}</strong></p>
        </div>
      </div>
    </GenericPage>
  );
}
