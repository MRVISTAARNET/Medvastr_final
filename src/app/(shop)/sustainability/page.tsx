"use client";

import GenericPage from "@/components/GenericPage";

export default function SustainabilityPage() {
  return (
    <GenericPage title="Sustainability" desc="Creating a better future for healthcare.">
      <div className="prose">
        <p>At Medvastr, we believe that high-quality medical supplies shouldn't come at the cost of our planet.</p>
        <h3>1. Eco-friendly Materials</h3>
        <p>We are increasing the use of organic cotton and recycled fibers in our product lines.</p>
        <h3>2. Responsible Manufacturing</h3>
        <p>We partner with factories that adhere to fair labor practices and minimize water waste.</p>
        <h3>3. Minimal Packaging</h3>
        <p>We have reduced plastic use in our shipping materials by 60% since 2025.</p>
      </div>
    </GenericPage>
  );
}
