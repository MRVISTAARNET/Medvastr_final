"use client";

import GenericPage from "@/components/GenericPage";

export default function SizeGuidePage() {
  return (
    <GenericPage title="Size Guide" desc="Find the perfect fit for your team.">
      <div className="prose">
        <p>Correct sizing is crucial for comfort during long shifts.</p>
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 20 }}>
          <thead>
            <tr style={{ background: "var(--warm)", textAlign: "left" }}>
              <th style={{ padding: 12, border: "1px solid var(--bdr)" }}>Size</th>
              <th style={{ padding: 12, border: "1px solid var(--bdr)" }}>Chest (inches)</th>
              <th style={{ padding: 12, border: "1px solid var(--bdr)" }}>Waist (inches)</th>
            </tr>
          </thead>
          <tbody>
            {["Small", "Medium", "Large", "XL", "XXL"].map((s) => (
              <tr key={s}>
                <td style={{ padding: 12, border: "1px solid var(--bdr)" }}>{s}</td>
                <td style={{ padding: 12, border: "1px solid var(--bdr)" }}>--</td>
                <td style={{ padding: 12, border: "1px solid var(--bdr)" }}>--</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p style={{ marginTop: 20 }}>Most of our products like Surgeon Gowns are <strong>Free Size</strong>.</p>
      </div>
    </GenericPage>
  );
}
