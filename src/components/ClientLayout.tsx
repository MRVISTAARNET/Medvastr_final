"use client";

import React, { useState, useEffect } from "react";
import Announcement from "@/components/Announcement";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MarqueeTicker from "@/components/MarqueeTicker";
import CartDrawer from "@/components/CartDrawer";
import WishlistDrawer from "@/components/WishlistDrawer";
import AccountModal from "@/components/AccountModal";
import Toast from "@/components/Toast";
import FloatingPopups from "@/components/FloatingPopups";
import ErrorBoundary from "@/components/ErrorBoundary";
import { AppProvider, useApp } from "@/context/AppContext";

function LayoutContent({ children }: { children: React.ReactNode }) {
  const [cartO, setCartO] = useState(false);
  const [wishO, setWishO] = useState(false);
  const [showBtt, setShowBtt] = useState(false);
  const { user, isAuthOpen, setIsAuthOpen } = useApp();

  useEffect(() => {
    const onScroll = () => setShowBtt(window.scrollY > 300);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <Announcement />
      <Header
        onCart={() => setCartO(true)}
        onWish={() => setWishO(true)}
        onAcct={() => setIsAuthOpen(true)}
        user={user}
      />
      <main>
        <ErrorBoundary>{children}</ErrorBoundary>
      </main>
      <Footer />
      <CartDrawer open={cartO} onClose={() => setCartO(false)} />
      <WishlistDrawer open={wishO} onClose={() => setWishO(false)} />
      {isAuthOpen && <AccountModal onClose={() => setIsAuthOpen(false)} />}
      <Toast />
      <FloatingPopups />
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
