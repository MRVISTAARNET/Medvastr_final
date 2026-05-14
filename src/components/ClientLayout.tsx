"use client";

import React, { useState } from "react";
import Announcement from "@/components/Announcement";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import WishlistDrawer from "@/components/WishlistDrawer";
import AccountModal from "@/components/AccountModal";
import Toast from "@/components/Toast";
import { AppProvider } from "@/context/AppContext";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [cartO, setCartO] = useState(false);
  const [wishO, setWishO] = useState(false);
  const [acctO, setAcctO] = useState(false);
  const [user, setUser] = useState<any>(null);

  return (
    <AppProvider>
      <Announcement />
      <Header
        onCart={() => setCartO(true)}
        onWish={() => setWishO(true)}
        onAcct={() => setAcctO(true)}
        user={user}
      />
      <main>{children}</main>
      <Footer />
      <CartDrawer open={cartO} onClose={() => setCartO(false)} />
      <WishlistDrawer open={wishO} onClose={() => setWishO(false)} />
      {acctO && (
        <AccountModal
          onClose={() => setAcctO(false)}
          user={user}
          onLogin={setUser}
          onLogout={() => setUser(null)}
        />
      )}
      <Toast />
      <button
        className="btt show" // Always show for now if scroll is high, logic can be added in a separate component
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        style={{ display: "flex" }} // Initially hidden by CSS but show logic can be added
      >
        ↑
      </button>
    </AppProvider>
  );
}
