"use client";

import GenericPage from "@/components/GenericPage";

export default function RefundPage() {
  return (
    <GenericPage title="Refund Policy" desc="Our commitment to your satisfaction.">
      <div className="prose">
        <p>At Medvastr, we want you to be completely satisfied with your purchase.</p>
        <h3>1. Returns</h3>
        <p>We accept returns of unused and unwashed items within 7 days of delivery.</p>
        <h3>2. Refunds</h3>
        <p>Once we receive and inspect your return, we will process your refund within 5-7 business days.</p>
        <h3>3. Exchanges</h3>
        <p>We offer size exchanges free of cost for your first exchange per order.</p>
      </div>
    </GenericPage>
  );
}
