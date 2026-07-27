'use client';

import React, { useState, useEffect } from 'react';
import AdminTopbar from '@/components/admin/AdminTopbar';
import { fmt, fmtNum, fmtDate } from '@/lib/data';
import { API_BASE } from '@/lib/api';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        const token = localStorage.getItem('token');
        if (!token) {
          setError("Admin token missing. Redirecting to admin login...");
          setTimeout(() => { window.location.href = '/admin/login'; }, 2000);
          return;
        }

        const [usersRes, ordersRes] = await Promise.all([
          fetch(`${API_BASE}/users?size=200`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch(`${API_BASE}/orders/admin/all?size=500`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);

        if (usersRes.status === 401 || ordersRes.status === 401 || usersRes.status === 403 || ordersRes.status === 403) {
          setError("Admin session expired. Redirecting to admin login...");
          setTimeout(() => { window.location.href = '/admin/login'; }, 2000);
          return;
        }

        const usersData = await usersRes.json();
        const ordersData = await ordersRes.json();

        const rawUsers = usersData.success ? (usersData.data?.content || usersData.data || []) : [];
        const allOrders = ordersData.success ? (ordersData.data?.content || ordersData.data || []) : [];

        // Build customer map indexed by email / phone
        const customerMap = new Map<string, any>();

        // 1. Add registered users
        rawUsers.forEach((u: any) => {
          const key = (u.email || u.phone || `user_${u.id}`).toLowerCase();
          customerMap.set(key, {
            id: u.id,
            name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email || 'Customer',
            email: u.email || '—',
            phone: u.phone || '—',
            orders: 0,
            spent: 0,
            city: '—',
            joined: u.createdAt || new Date().toISOString(),
            role: u.role || 'CUSTOMER'
          });
        });

        // 2. Aggregate order details & add guest buyers
        allOrders.forEach((o: any) => {
          const email = o.userEmail || (o.user && o.user.email);
          const phone = o.shippingPhone || (o.user && o.user.phone);
          const name = o.shippingName || (o.user ? `${o.user.firstName || ''} ${o.user.lastName || ''}`.trim() : 'Guest Customer');

          let matchKey = '';
          if (email) {
            for (const [k, v] of customerMap.entries()) {
              if (v.email && v.email.toLowerCase() === email.toLowerCase()) {
                matchKey = k;
                break;
              }
            }
          }
          if (!matchKey && phone) {
            const cleanPhone = phone.replace(/\D/g, '');
            for (const [k, v] of customerMap.entries()) {
              if (v.phone && v.phone.replace(/\D/g, '') === cleanPhone) {
                matchKey = k;
                break;
              }
            }
          }

          if (!matchKey) {
            matchKey = (email || phone || `order_${o.id}`).toLowerCase();
            customerMap.set(matchKey, {
              id: `guest_${o.id}`,
              name: name,
              email: email || '—',
              phone: phone || '—',
              orders: 0,
              spent: 0,
              city: o.shippingCity || '—',
              joined: o.createdAt || new Date().toISOString(),
              role: 'GUEST'
            });
          }

          const record = customerMap.get(matchKey);
          if (record) {
            record.orders += 1;
            record.spent += (o.totalAmount || 0);
            if (record.city === '—' && o.shippingCity) {
              record.city = o.shippingCity;
            }
          }
        });

        setCustomers(Array.from(customerMap.values()));
      } catch (e) {
        console.error("Failed to fetch customers and orders", e);
        setError("Failed to load customer details. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    (c.phone && c.phone.includes(search))
  );

  const maxSpent = customers.length > 0 ? Math.max(...customers.map((c: any) => c.spent || 0)) : 0;
  const avgOrders = customers.length > 0 ? (
    customers.reduce((s: number, c: any) => s + (c.orders || 0), 0) / customers.length
  ).toFixed(1) : '0';
  const avgSpent = customers.length > 0 ?
    customers.reduce((s: number, c: any) => s + (c.spent || 0), 0) / customers.length : 0;

  if (loading) {
    return (
      <>
        <AdminTopbar title="Customers" sub="View and manage customer accounts" />
        <div className="admin-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
          <div style={{ color: 'var(--ink)', opacity: 0.5, fontSize: 16 }}>Loading customers...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <AdminTopbar
        title="Customers"
        sub="View and manage customer accounts"
      />
      <div className="admin-content">
        <div className="panel">
          {error && (
            <div style={{ padding: '12px 16px', background: '#fef2f2', border: '1px solid #fca5a5', color: '#991b1b', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', fontWeight: 600 }}>
              ⚠️ {error}
            </div>
          )}
          <div className="stats-grid" style={{ marginBottom: '22px' }}>
            <StatCard ico="👥" label="Total Customers" val={fmtNum(customers.length)} sub="registered accounts" dir="neu" bg="#dbeafe" />
            <StatCard ico="🏆" label="Top Spender" val={fmt(maxSpent)} sub="Highest lifetime value" dir="neu" bg="#fef5e4" />
            <StatCard ico="📦" label="Avg Orders" val={avgOrders} sub="per customer" dir="neu" bg="#daf3ef" />
            <StatCard ico="💰" label="Avg Spend" val={fmt(avgSpent)} sub="per customer" dir="neu" bg="#ede9fe" />
          </div>

          <div className="table-card">
            <div className="table-hd">
              <div className="table-hd-left">
                <div className="table-title">Customers</div>
                <div className="table-sub">{filteredCustomers.length} of {customers.length} registered customers</div>
              </div>
              <div className="table-hd-right">
                <input 
                  className="tbl-search" 
                  placeholder="Search by name or email..." 
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Contact</th>
                  <th>City</th>
                  <th>Orders</th>
                  <th>Total Spent</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((c: any) => (
                  <tr key={c.id}>
                    <td>
                      <div className="td-flex">
                        <div
                          className="td-avatar"
                          style={{
                            background: 'var(--teal3)',
                            fontSize: '16px',
                            fontWeight: 700,
                            color: 'var(--teal)',
                          }}
                        >
                          {(c.name || 'U').charAt(0)}
                        </div>
                        <div>
                          <div className="td-name">{c.name}</div>
                          <div className="td-meta">{c.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>{c.phone || '—'}</td>
                    <td>{c.city || '—'}</td>
                    <td className="td-bold">{c.orders || 0}</td>
                    <td className="td-bold">{fmt(c.spent || 0)}</td>
                    <td>
                      <span className={`badge ${c.role === 'ADMIN' ? 'b-purple' : 'b-gray'}`}>
                        {c.role}
                      </span>
                    </td>
                    <td>{fmtDate(c.joined)}</td>
                    <td>
                      <div className="act-btns">
                        <div className="act-btn" title="View Profile">
                          👁️
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

function StatCard({ ico, label, val, sub, dir, bg }: any) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <div className="stat-ico" style={{ background: bg }}>
          {ico}
        </div>
        <div className={`stat-badge badge-${dir === 'up' ? 'up' : dir === 'dn' ? 'dn' : 'neu'}`}>
          {dir === 'up' ? '↑' : dir === 'dn' ? '↓' : '—'} {sub.split(' ')[0]}
        </div>
      </div>
      <div className="stat-n">{val}</div>
      <div className="stat-l">{label}</div>
    </div>
  );
}
