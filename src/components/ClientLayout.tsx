"use client";

import React, { useState, useEffect } from "react";
import Announcement from "@/components/Announcement";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import AccountModal from "@/components/AccountModal";
import Toast from "@/components/Toast";
import WhatsAppButton from "@/components/WhatsAppButton";
import ErrorBoundary from "@/components/ErrorBoundary";
import { AppProvider, useApp } from "@/context/AppContext";

function LayoutContent({ children }: { children: React.ReactNode }) {
  const [showBtt, setShowBtt] = useState(false);
  const { user, isAuthOpen, setIsAuthOpen, isCartOpen, setIsCartOpen } = useApp();

  useEffect(() => {
    const onScroll = () => setShowBtt(window.scrollY > 300);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <Announcement />
      <Header
        onCart={() => setIsCartOpen(true)}
        onWish={() => {}}
        onAcct={() => setIsAuthOpen(true)}
        user={user}
      />
      <main>
        <ErrorBoundary>{children}</ErrorBoundary>
      </main>
      <Footer />
      <CartDrawer open={isCartOpen} onClose={() => setIsCartOpen(false)} />
      {isAuthOpen && <AccountModal onClose={() => setIsAuthOpen(false)} />}
      <Toast />
      <WhatsAppButton />
      {showBtt && (
        <button
          type="button"
          className="btt show"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          style={{ display: "flex" }}
          aria-label="Back to top"
        >
          ↑
        </button>
      )}
    </>
  );
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <LayoutContent>{children}</LayoutContent>
    </AppProvider>
  );
}
