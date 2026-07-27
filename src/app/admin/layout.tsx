import React from 'react';
import './admin.css';
import { AppProvider } from '@/context/AppContext';

export const metadata = {
  title: 'Medvarn Admin — Dashboard',
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="admin-body">
      <AppProvider>
        {children}
      </AppProvider>
    </div>
  );
}
