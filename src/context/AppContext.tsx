"use client";

import React, { createContext, useContext, useReducer, useState, useCallback, useEffect } from "react";
import { Product, PRODUCTS } from "@/lib/data";

interface CartItem extends Product {
  k: string;
  col: string;
  colNm: string;
  size: string;
  qty: number;
}

interface AppContextType {
  cart: CartItem[];
  wishlist: number[];
  addToCart: (p: Product, ci?: number, sz?: string) => void;
  updateCartQty: (index: number, delta: number) => void;
  removeFromCart: (index: number) => void;
  clearCart: () => void;
  toggleWishlist: (id: number) => void;
  toast: (msg: string, kind?: "ok" | "bad" | "") => void;
  toastMsg: string;
  toastKind: "ok" | "bad" | "";
}

const AppContext = createContext<AppContextType | null>(null);

function cartReducer(state: CartItem[], action: any): CartItem[] {
  switch (action.type) {
    case "ADD": {
      const { p, ci, sz } = action;
      const k = `${p.id}-${ci}-${sz}`;
      const existing = state.find((i) => i.k === k);
      if (existing) {
        return state.map((i) => (i.k === k ? { ...i, qty: i.qty + 1 } : i));
      }
      return [
        ...state,
        {
          ...p,
          k,
          col: p.clrs[ci] || p.clrs[0],
          colNm: "Color", // Simplified for now, can be improved with cn()
          size: sz,
          qty: 1,
        },
      ];
    }
    case "QTY":
      return state
        .map((i, idx) => (idx === action.index ? { ...i, qty: Math.max(0, i.qty + action.delta) } : i))
        .filter((i) => i.qty > 0);
    case "DEL":
      return state.filter((_, idx) => idx === action.index);
    case "CLR":
      return [];
    default:
      return state;
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [cart, dispatch] = useReducer(cartReducer, []);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [toastMsg, setToastMsg] = useState("");
  const [toastKind, setToastKind] = useState<"ok" | "bad" | "">("");

  const toast = useCallback((msg: string, kind: "ok" | "bad" | "" = "") => {
    setToastMsg(msg);
    setToastKind(kind);
    setTimeout(() => setToastMsg(""), 3200);
  }, []);

  const addToCart = useCallback((p: Product, ci = 0, sz = "M") => {
    dispatch({ type: "ADD", p, ci, sz });
  }, []);

  const updateCartQty = useCallback((index: number, delta: number) => {
    dispatch({ type: "QTY", index, delta });
  }, []);

  const removeFromCart = useCallback((index: number) => {
    dispatch({ type: "DEL", index });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: "CLR" });
  }, []);

  const toggleWishlist = useCallback(
    (id: number) => {
      setWishlist((prev) => {
        const isWished = prev.includes(id);
        toast(isWished ? "Removed from wishlist" : "Saved to wishlist ❤️", isWished ? "" : "ok");
        return isWished ? prev.filter((x) => x !== id) : [...prev, id];
      });
    },
    [toast]
  );

  return (
    <AppContext.Provider
      value={{
        cart,
        wishlist,
        addToCart,
        updateCartQty,
        removeFromCart,
        clearCart,
        toggleWishlist,
        toast,
        toastMsg,
        toastKind,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
}
