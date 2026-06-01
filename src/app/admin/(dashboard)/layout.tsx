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
    if (isHydrated && (!user || user.role !== 'ADMIN')) {
      router.push('/admin/login');
    }
  }, [user, isHydrated, router]);

  if (!isHydrated || !user || user.role !== 'ADMIN') {
    return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="spinner">Authenticating...</div>
    </div>;
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
