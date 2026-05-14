import React from 'react';
import '../admin.css';
import AdminSidebar from '@/components/admin/AdminSidebar';

export const metadata = {
  title: 'Medvastr Admin — Dashboard',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
