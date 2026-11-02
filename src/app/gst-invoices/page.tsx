"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { apiJson } from "@/lib/api";
import InvoiceSheet from "@/components/invoice/InvoiceSheet";

type Row = { orderNumber: string };

/** Fetch with limited concurrency so we don't hammer the API for a big month. */
async function mapLimit<T, R>(items: T[], limit: number, fn: (item: T, idx: number) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (true) {
      const i = next++;
      if (i >= items.length) return;
      results[i] = await fn(items[i], i);
    }
  });
  await Promise.all(workers);
  return results;
}

function BulkInvoices() {
  const params = useSearchParams();
  const from = params.get("from") || "";
  const to = params.get("to") || "";

  const [orders, setOrders] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loaded, setLoaded] = useState(0);
  const [failed, setFailed] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    document.title = `GST Invoices ${from} to ${to} | Medvarn`;
    if (!from || !to) {
      setError("Missing date range. Open this page from Admin → GST Reports.");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const rep = await apiJson<{ rows: Row[] }>(`/admin/gst-report?from=${from}&to=${to}`);
        if (!rep.success || !rep.data) {
          setError(rep.message || "Could not load GST report. Please log in as admin and try again.");
          return;
        }
        const rows = rep.data.rows;
        setTotal(rows.length);
        const failedNums: string[] = [];
        const fetched = await mapLimit(rows, 5, async (r) => {
          try {
            const res = await apiJson<any>(`/orders/${encodeURIComponent(r.orderNumber)}`);
            if (!cancelled) setLoaded((n) => n + 1);
            if (res.success && res.data) return res.data;
          } catch {
            /* handled below */
          }
          failedNums.push(r.orderNumber);
          return null;
        });
        if (cancelled) return;
        setOrders(fetched.filter(Boolean));
        setFailed(failedNums);
        setDone(true);
      } catch (e: any) {
        setError(e?.message || "Failed to load invoices");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [from, to]);

  const pct = useMemo(() => (total ? Math.round((loaded / total) * 100) : 0), [loaded, total]);

  if (error) {
    return (
      <div style={{ maxWidth: 520, margin: "80px auto", padding: 30, background: "white", borderRadius: 16, textAlign: "center", fontFamily: "sans-serif", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
        <div style={{ fontSize: 44 }}>📄</div>
        <h2 style={{ color: "#0f172a" }}>Unable to load invoices</h2>
        <p style={{ color: "#64748b", fontSize: 14 }}>{error}</p>
      </div>
    );
  }

  return (
    <div className="bulk-root">
      <div className="no-print bulk-bar">
        <div className="bulk-bar-inner">
          <div>
            <div style={{ fontWeight: 800, fontSize: 15 }}>GST Invoices · {from} → {to}</div>
            <div style={{ fontSize: 12, color: "#cbd5e1", marginTop: 2 }}>
              {done
                ? `${orders.length} invoice${orders.length === 1 ? "" : "s"} ready${failed.length ? ` · ${failed.length} failed to load` : ""}`
                : `Loading invoices… ${loaded}/${total} (${pct}%)`}
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="bulk-btn" disabled={!done || orders.length === 0} onClick={() => window.print()}>
              🖨️ Print / Save as PDF
            </button>
            <button className="bulk-btn bulk-btn-alt" onClick={() => window.close()}>✕ Close</button>
          </div>
        </div>
        {!done && <div className="bulk-progress"><div style={{ width: `${pct}%` }} /></div>}
        {done && (
          <div style={{ maxWidth: 860, margin: "8px auto 0", fontSize: 12, color: "#94a3b8" }}>
            Tip: in the print dialog choose <strong>Save as PDF</strong>, paper size <strong>A4</strong>, and turn off “Headers and footers”.
          </div>
        )}
      </div>

      {done && orders.length === 0 && (
        <p style={{ textAlign: "center", padding: 60, color: "#64748b", fontFamily: "sans-serif" }}>No billable invoices in this date range.</p>
      )}

      {orders.map((o) => (
        <div className="bulk-page" key={o.orderNumber}>
          <InvoiceSheet order={o} orderNumber={o.orderNumber} />
        </div>
      ))}

      <style jsx global>{`
        body { background: #f8fafc; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #0f172a; }
        .bulk-bar { background: #0f172a; color: white; padding: 14px 24px; position: sticky; top: 0; z-index: 100; box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
        .bulk-bar-inner { max-width: 860px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
        .bulk-btn { background: #008080; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 700; font-size: 14px; cursor: pointer; }
        .bulk-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .bulk-btn-alt { background: #334155; padding: 10px 16px; }
        .bulk-progress { max-width: 860px; margin: 10px auto 0; height: 4px; background: #1e293b; border-radius: 4px; overflow: hidden; }
        .bulk-progress > div { height: 100%; background: #14b8a6; transition: width 0.2s; }
        @media print {
          @page { size: A4; margin: 10mm; }
          .no-print { display: none !important; }
          body { background: white !important; }
          .bulk-page { break-after: page; page-break-after: always; }
          .bulk-page:last-child { break-after: auto; page-break-after: auto; }
        }
      `}</style>
    </div>
  );
}

export default function GstInvoicesPage() {
  return (
    <Suspense fallback={null}>
      <BulkInvoices />
    </Suspense>
  );
}
