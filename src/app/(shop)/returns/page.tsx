"use client";

import GenericPage from "@/components/GenericPage";

export default function ReturnsPage() {
  return (
    <GenericPage title="Returns & Exchanges" desc="Easy 7-day hassle-free process.">
      <div className="prose">
        <p>We offer a straightforward return and exchange process for all our hospital supplies.</p>
        <h3>How it works:</h3>
        <ol>
          <li>Submit a request via our contact form or email.</li>
          <li>We will arrange a pickup from your location.</li>
          <li>Once inspected, we will process your exchange or refund.</li>
        </ol>
        <p>Note: Items must be in their original packaging and unused.</p>
      </div>
    </GenericPage>
  );
}
