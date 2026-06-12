'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';

const AdminSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useApp();

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
        { name: 'Colors', icon: '🎨', href: '/admin/colors' },
        { name: 'Sizes', icon: '📐', href: '/admin/sizes' },
        { name: 'Attributes', icon: '🏷️', href: '/admin/attributes' },
        { name: 'Navigation', icon: '🧭', href: '/admin/navigation' },
        { name: 'Inventory', icon: '📋', href: '/admin/inventory' },
      ]
    },
    {
      section: 'Marketing', items: [
        { name: 'Bulk Orders', icon: '🛒', href: '/admin/bulk-orders' },
        { name: 'Blog', icon: '📰', href: '/admin/blog' },
        { name: 'Promo Codes', icon: '🎟️', href: '/admin/promos' },
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
      ]
    },
    {
      section: 'Settings', items: [
        { name: 'Settings', icon: '⚙️', href: '/admin/settings' },
      ]
    },
  ];

  const handleLogout = () => {
    logout();
    router.push('/admin/login');
  };

  const displayName = user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Admin';

  return (
    <div id="admin-sidebar">
      <div className="sb-logo">
        <div className="sb-logo-t">Med<span>vastr</span></div>
        <div className="sb-logo-s">ADMIN DASHBOARD</div>
        <button
          type="button"
          className="mobile-sidebar-close"
          aria-label="Close sidebar"
          onClick={() => {
            const sidebar = document.getElementById('admin-sidebar');
            if (sidebar) sidebar.classList.remove('mobile-show');
          }}
        >
          ✕
        </button>
      </div>
      <div className="sb-user">
        <div className="sb-user-av">{displayName.charAt(0).toUpperCase()}</div>
        <div>
          <div className="sb-user-name">{displayName}</div>
          <div className="sb-user-role">Administrator</div>
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
        <Link href="/" target="_blank" rel="noopener noreferrer" className="sb-link" style={{ marginBottom: '4px' }}>
          <span className="sb-link-ico">🌐</span>View Live Site
        </Link>
        <button type="button" className="sb-logout" onClick={handleLogout}>
          <span style={{ fontSize: '17px' }}>🚪</span>Sign Out
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
