'use client';

import React, { useState, useEffect } from 'react';
import AdminTopbar from '@/components/admin/AdminTopbar';
import { fmt, fmtNum, fmtDate } from '@/lib/data';
import { API_BASE } from '@/lib/api';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const [usersRes, ordersRes] = await Promise.all([
          fetch(`${API_BASE}/users?size=100`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch(`${API_BASE}/orders/admin/all?size=500`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);
        const usersData = await usersRes.json();
        const ordersData = await ordersRes.json();

        if (usersData.success && ordersData.success) {
          const allOrders = ordersData.data.content || [];
          setCustomers(usersData.data.content.map((u: any) => {
            const userOrders = allOrders.filter((o: any) => 
              (o.userId && o.userId === u.id) || 
              (o.userEmail && o.userEmail.toLowerCase() === u.email.toLowerCase()) ||
              (o.shippingPhone && u.phone && o.shippingPhone.replace(/\D/g, '') === u.phone.replace(/\D/g, ''))
            );

            const totalSpent = userOrders.reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);
            
            // Get the city from the latest order
            const latestOrder = userOrders[0];
            const city = latestOrder?.shippingCity || '—';

            return {
              id: u.id,
              name: `${u.firstName} ${u.lastName}`,
              email: u.email,
              phone: u.phone,
              orders: userOrders.length,
              spent: totalSpent,
              city: city,
              joined: u.createdAt,
              role: u.role
            };
          }));
        }
      } catch (e) {
        console.error("Failed to fetch customers and orders", e);
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
