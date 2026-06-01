"use client";
import React, { useEffect } from 'react';
import '../admin.css';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isHydrated } = useApp();
  const router = useRouter();

  useEffect(() => {
    // Only redirect if we ARE hydrated AND we've confirmed there is no admin user
    if (isHydrated) {
      if (!user || user.role !== 'ADMIN') {
        router.push('/admin/login');
      }
    }
  }, [user, isHydrated, router]);

  // If we aren't hydrated yet, or we're waiting for the redirect, show nothing or a spinner
  if (!isHydrated || !user || user.role !== 'ADMIN') {
    return (
      <div style={{ height: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0b' }}>
        <div style={{ color: '#6366f1', fontSize: '1.2rem', fontWeight: '500' }}>
          Verifying Security...
        </div>
      </div>
    );
  }

  return (
    <>
      <div id="admin-app">
        <AdminSidebar />
        <main id="admin-main">
          {children}
        </main>
      </div>
      <div id="admin-toast"></div>
    </>
  );
}
