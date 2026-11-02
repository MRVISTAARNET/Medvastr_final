'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import AdminTopbar from '@/components/admin/AdminTopbar';
import { apiJson } from '@/lib/api';

type GstRow = {
  invoiceNo: string;
  invoiceDate: string; // already in IST, e.g. 2026-10-05T14:03:22
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  state: string;
  pincode: string;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  hsn: string;
  taxRate: string;
  taxableValue: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalTax: number;
  otherCharges: number;
  invoiceValue: number;
};

type GstSummary = {
  invoiceCount: number;
  taxableValue: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalTax: number;
  otherCharges: number;
  invoiceValue: number;
  excludedCount: number;
  excludedValue: number;
};

const pad = (n: number) => String(n).padStart(2, '0');
const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

function presetRange(key: 'last' | 'this' | 'fy'): { from: string; to: string } {
  const now = new Date();
  if (key === 'this') {
    return { from: iso(new Date(now.getFullYear(), now.getMonth(), 1)), to: iso(now) };
  }
  if (key === 'fy') {
    const startYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
    return { from: iso(new Date(startYear, 3, 1)), to: iso(now) };
  }
  const first = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const last = new Date(now.getFullYear(), now.getMonth(), 0);
  return { from: iso(first), to: iso(last) };
}

const inr = (n: number) =>
  '₹ ' + Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtInvDate = (s: string) => {
  if (!s) return '—';
  const [d] = s.split('T');
  const [y, m, day] = d.split('-');
  return `${day}-${m}-${y}`;
};

const csvCell = (v: unknown) => {
  const s = v === null || v === undefined ? '' : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export default function AdminGstReports() {
  const initial = useMemo(() => presetRange('last'), []);
  const [from, setFrom] = useState(initial.from);
  const [to, setTo] = useState(initial.to);
  const [preset, setPreset] = useState<'last' | 'this' | 'fy' | 'custom'>('last');
  const [rows, setRows] = useState<GstRow[]>([]);
  const [summary, setSummary] = useState<GstSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    if (!from || !to) return;
    setLoading(true);
    setError('');
    try {
      const res = await apiJson<{ rows: GstRow[]; summary: GstSummary }>(`/admin/gst-report?from=${from}&to=${to}`);
      if (res.success && res.data) {
        setRows(res.data.rows || []);
        setSummary(res.data.summary || null);
      } else {
        setRows([]);
        setSummary(null);
        setError(res.message || 'Could not load GST report');
      }
    } catch (e: any) {
      setRows([]);
      setSummary(null);
      setError(e?.message || 'Could not load GST report');
    }
    setLoading(false);
  }, [from, to]);

  useEffect(() => {
    load();
  }, [load]);

  const applyPreset = (key: 'last' | 'this' | 'fy') => {
    const r = presetRange(key);
    setFrom(r.from);
    setTo(r.to);
    setPreset(key);
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.invoiceNo?.toLowerCase().includes(q) ||
        r.orderNumber?.toLowerCase().includes(q) ||
        r.customerName?.toLowerCase().includes(q) ||
        r.state?.toLowerCase().includes(q)
    );
  }, [rows, search]);

  const downloadCsv = () => {
    if (!rows.length || !summary) return;
    const header = [
      'Invoice No', 'Invoice Date', 'Order No', 'Customer', 'Phone', 'Place of Supply (State)', 'Pincode',
      'HSN', 'GST Rate', 'Taxable Value', 'CGST', 'SGST', 'IGST', 'Total GST',
      'Shipping + COD Fee', 'Invoice Value', 'Payment Mode', 'Payment Status',
    ];
    const lines = [header.map(csvCell).join(',')];
    rows.forEach((r) => {
      lines.push(
        [
          r.invoiceNo, fmtInvDate(r.invoiceDate), r.orderNumber, r.customerName, r.customerPhone, r.state, r.pincode,
          r.hsn, r.taxRate, r.taxableValue.toFixed(2), r.cgst.toFixed(2), r.sgst.toFixed(2), r.igst.toFixed(2),
          r.totalTax.toFixed(2), r.otherCharges.toFixed(2), r.invoiceValue.toFixed(2), r.paymentMethod, r.paymentStatus,
        ].map(csvCell).join(',')
      );
    });
    lines.push(
      [
        'TOTAL', '', `${summary.invoiceCount} invoices`, '', '', '', '', '', '',
        summary.taxableValue.toFixed(2), summary.cgst.toFixed(2), summary.sgst.toFixed(2), summary.igst.toFixed(2),
        summary.totalTax.toFixed(2), summary.otherCharges.toFixed(2), summary.invoiceValue.toFixed(2), '', '',
      ].map(csvCell).join(',')
    );
    // BOM so Excel opens ₹/UTF-8 text correctly
    const blob = new Blob(['\uFEFF' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GST_Sales_Register_${from}_to_${to}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const openInvoices = () => {
    window.open(`/gst-invoices?from=${from}&to=${to}`, '_blank');
  };

  const chip = (key: 'last' | 'this' | 'fy', label: string) => (
    <button
      type="button"
      onClick={() => applyPreset(key)}
      className={preset === key ? 'btn-primary' : ''}
      style={
        preset === key
          ? { padding: '8px 14px' }
          : { padding: '8px 14px', border: '1px solid var(--border, #e2e8f0)', background: 'transparent', borderRadius: 8, cursor: 'pointer', fontWeight: 600, color: 'inherit' }
      }
    >
      {label}
    </button>
  );

  return (
    <>
      <AdminTopbar title="GST Reports" sub="Monthly GST sales register & tax invoices for filing / client requests" />
      <div className="admin-content">
        <div className="panel">
          {/* Filters */}
          <div className="table-card" style={{ marginBottom: 22 }}>
            <div className="table-hd" style={{ flexWrap: 'wrap', gap: 12 }}>
              <div className="table-hd-left">
                <div className="table-title">Select Period</div>
              </div>
              <div className="table-hd-right" style={{ flexWrap: 'wrap', gap: 8 }}>
                {chip('last', 'Last Month')}
                {chip('this', 'This Month')}
                {chip('fy', 'This Financial Year')}
                <input
                  type="date"
                  className="tbl-search"
                  value={from}
                  max={to}
                  onChange={(e) => { setFrom(e.target.value); setPreset('custom'); }}
                  aria-label="From date"
                />
                <span style={{ color: 'var(--txt3)' }}>to</span>
                <input
                  type="date"
                  className="tbl-search"
                  value={to}
                  min={from}
                  onChange={(e) => { setTo(e.target.value); setPreset('custom'); }}
                  aria-label="To date"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="table-card" style={{ marginBottom: 22, padding: 16, color: '#b91c1c' }}>⚠️ {error}</div>
          )}

          {/* Summary */}
          <div className="stats-grid" style={{ marginBottom: 22 }}>
            <SummaryCard ico="🧾" bg="#dbeafe" label="Invoices" val={loading ? '…' : String(summary?.invoiceCount ?? 0)}
              sub={summary && summary.excludedCount > 0 ? `${summary.excludedCount} excluded` : 'Billable orders'} />
            <SummaryCard ico="💼" bg="#daf3ef" label="Taxable Value" val={loading ? '…' : inr(summary?.taxableValue ?? 0)} sub="Excl. GST" />
            <SummaryCard ico="🏛️" bg="#fef5e4" label="Total GST Collected" val={loading ? '…' : inr(summary?.totalTax ?? 0)}
              sub={summary ? `CGST ${inr(summary.cgst)} · SGST ${inr(summary.sgst)} · IGST ${inr(summary.igst)}` : ''} />
            <SummaryCard ico="💰" bg="#ede9fe" label="Total Invoice Value" val={loading ? '…' : inr(summary?.invoiceValue ?? 0)} sub="Incl. GST & shipping" />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 22 }}>
            <button type="button" className="btn-primary" onClick={downloadCsv} disabled={loading || rows.length === 0}
              style={{ opacity: loading || rows.length === 0 ? 0.5 : 1 }}>
              ⬇️ Download GST Report (Excel/CSV)
            </button>
            <button type="button" className="btn-primary" onClick={openInvoices} disabled={loading || rows.length === 0}
              style={{ opacity: loading || rows.length === 0 ? 0.5 : 1, background: '#0f766e' }}>
              🧾 Print / Save All Invoices as PDF
            </button>
          </div>

          {summary && summary.excludedCount > 0 && (
            <div style={{ marginBottom: 22, padding: '12px 16px', borderRadius: 10, background: '#fffbeb', border: '1px solid #fde68a', color: '#92400e', fontSize: 13 }}>
              ℹ️ {summary.excludedCount} order{summary.excludedCount === 1 ? '' : 's'} worth {inr(summary.excludedValue)} left out:
              cancelled, returned/RTO, failed or unpaid online payments aren&apos;t taxable sales.
            </div>
          )}

          {/* Register */}
          <div className="table-card">
            <div className="table-hd">
              <div className="table-hd-left">
                <div className="table-title">GST Sales Register</div>
              </div>
              <div className="table-hd-right">
                <input
                  className="tbl-search"
                  placeholder="Search invoice, order, customer, state…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Invoice</th><th>Date</th><th>Customer</th><th>State</th><th>Rate</th>
                    <th style={{ textAlign: 'right' }}>Taxable</th>
                    <th style={{ textAlign: 'right' }}>CGST</th>
                    <th style={{ textAlign: 'right' }}>SGST</th>
                    <th style={{ textAlign: 'right' }}>IGST</th>
                    <th style={{ textAlign: 'right' }}>Total GST</th>
                    <th style={{ textAlign: 'right' }}>Ship/COD</th>
                    <th style={{ textAlign: 'right' }}>Invoice Value</th>
                    <th>Payment</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={14} style={{ textAlign: 'center', padding: 40, color: 'var(--txt3)' }}>Loading GST data…</td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan={14} style={{ textAlign: 'center', padding: 40, color: 'var(--txt3)' }}>
                      {rows.length === 0 ? 'No billable invoices in this period.' : 'No invoices match your search.'}
                    </td></tr>
                  ) : (
                    filtered.map((r) => (
                      <tr key={r.orderNumber}>
                        <td className="td-mono td-bold">{r.invoiceNo}</td>
                        <td>{fmtInvDate(r.invoiceDate)}</td>
                        <td>{r.customerName || '—'}</td>
                        <td>{r.state || '—'}</td>
                        <td>{r.taxRate}</td>
                        <td style={{ textAlign: 'right' }}>{inr(r.taxableValue)}</td>
                        <td style={{ textAlign: 'right' }}>{r.cgst ? inr(r.cgst) : '—'}</td>
                        <td style={{ textAlign: 'right' }}>{r.sgst ? inr(r.sgst) : '—'}</td>
                        <td style={{ textAlign: 'right' }}>{r.igst ? inr(r.igst) : '—'}</td>
                        <td style={{ textAlign: 'right' }} className="td-bold">{inr(r.totalTax)}</td>
                        <td style={{ textAlign: 'right' }}>{r.otherCharges ? inr(r.otherCharges) : '—'}</td>
                        <td style={{ textAlign: 'right' }} className="td-bold">{inr(r.invoiceValue)}</td>
                        <td>
                          <span className={`badge ${r.paymentStatus === 'PAID' ? 'b-grn' : 'b-warn'}`}>
                            {r.paymentMethod} · {r.paymentStatus}
                          </span>
                        </td>
                        <td>
                          <a href={`/invoice/${encodeURIComponent(r.orderNumber)}`} target="_blank" rel="noopener noreferrer"
                            style={{ color: '#0f766e', fontWeight: 600, textDecoration: 'none' }}>
                            Invoice ↗
                          </a>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                {!loading && summary && rows.length > 0 && !search.trim() && (
                  <tfoot>
                    <tr style={{ fontWeight: 800, background: 'rgba(0,128,128,0.06)' }}>
                      <td colSpan={5}>TOTAL ({summary.invoiceCount} invoices)</td>
                      <td style={{ textAlign: 'right' }}>{inr(summary.taxableValue)}</td>
                      <td style={{ textAlign: 'right' }}>{inr(summary.cgst)}</td>
                      <td style={{ textAlign: 'right' }}>{inr(summary.sgst)}</td>
                      <td style={{ textAlign: 'right' }}>{inr(summary.igst)}</td>
                      <td style={{ textAlign: 'right' }}>{inr(summary.totalTax)}</td>
                      <td style={{ textAlign: 'right' }}>{inr(summary.otherCharges)}</td>
                      <td style={{ textAlign: 'right' }}>{inr(summary.invoiceValue)}</td>
                      <td colSpan={2}></td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function SummaryCard({ ico, label, val, sub, bg }: { ico: string; label: string; val: string; sub?: string; bg: string }) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <div className="stat-ico" style={{ background: bg }}>{ico}</div>
      </div>
      <div className="stat-n">{val}</div>
      <div className="stat-l">{label}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--txt3)', marginTop: 4 }}>{sub}</div>}
    </div>
  );
}
