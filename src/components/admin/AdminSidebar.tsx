'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const AdminSidebar = () => {
  const pathname = usePathname();

  const links = [
    {
      section: 'Overview', items: [
        { name: 'Dashboard', icon: '📊', href: '/admin' },
        { name: 'Analytics', icon: '📈', href: '/admin/analytics' },
      ]
    },
    {
      section: 'Store', items: [
        { name: 'Orders', icon: '📦', href: '/admin/orders' },
        { name: 'Products', icon: '🥼', href: '/admin/products' },
        { name: 'Categories', icon: '🏷️', href: '/admin/categories' },
        { name: 'Inventory', icon: '📋', href: '/admin/inventory' },
      ]
    },
    {
      section: 'Customers', items: [
        { name: 'Customers', icon: '👥', href: '/admin/customers' },
        { name: 'Reviews', icon: '⭐', href: '/admin/reviews' },
        { name: 'Inquiries', icon: '📩', href: '/admin/inquiries' },
      ]
    },
    {
      section: 'Finance', items: [
        { name: 'Revenue', icon: '💰', href: '/admin/revenue' },
        { name: 'Promo Codes', icon: '🎟️', href: '/admin/promos' },
      ]
    },
    {
      section: 'Settings', items: [
        { name: 'Settings', icon: '⚙️', href: '/admin/settings' },
        { name: 'Appearance', icon: '🎨', href: '/admin/appearance' },
      ]
    },
  ];

  return (
    <div id="admin-sidebar">
      <div className="sb-logo">
        <div className="sb-logo-t">Med<span>vastr</span></div>
        <div className="sb-logo-s">ADMIN DASHBOARD</div>
        <button className="mobile-sidebar-close" onClick={() => {
          const sidebar = document.getElementById('admin-sidebar');
          if (sidebar) sidebar.classList.remove('mobile-show');
        }}>
          ✕
        </button>
      </div>
      <div className="sb-user">
        <div className="sb-user-av">A</div>
        <div>
          <div className="sb-user-name">Admin</div>
          <div className="sb-user-role">Super Administrator</div>
        </div>
      </div>
      <div className="sb-nav">
        {links.map((sec, idx) => (
          <React.Fragment key={idx}>
            <div className="sb-section">{sec.section}</div>
            {sec.items.map((item, i) => (
              <Link
                key={i}
                href={item.href}
                className={`sb-link ${pathname === item.href ? 'active' : ''}`}
              >
                <span className="sb-link-ico">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </React.Fragment>
        ))}
      </div>
      <div className="sb-bottom">
        <Link href="/" target="_blank" className="sb-link" style={{ marginBottom: '4px' }}>
          <span className="sb-link-ico">🌐</span>View Live Site
        </Link>
        <button className="sb-logout" onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('adm_token'); window.location.href = '/admin/login'; }}>
          <span style={{ fontSize: '17px' }}>🚪</span>Sign Out
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
