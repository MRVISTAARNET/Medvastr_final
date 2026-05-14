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
  products: Product[];
  addToCart: (p: Product, ci?: number, sz?: string) => void;
  updateCartQty: (index: number, delta: number) => void;
  removeFromCart: (index: number) => void;
  clearCart: () => void;
  toggleWishlist: (id: number) => void;
  addProduct: (p: Product) => void;
  updateProduct: (p: Product) => void;
  deleteProduct: (id: number) => void;
  toast: (msg: string, kind?: "ok" | "bad" | "") => void;
  toastMsg: string;
  toastKind: "ok" | "bad" | "";
}

const AppContext = createContext<AppContextType | null>(null);

function cartReducer(state: CartItem[], action: any): CartItem[] {
  switch (action.type) {
    case "SET":
      return action.data;
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
          col: p.clrs?.[ci] || p.clrs?.[0] || "#000",
          colNm: "Color",
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
      return state.filter((_, idx) => idx !== action.index);
    case "CLR":
      return [];
    default:
      return state;
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [cart, dispatch] = useReducer(cartReducer, []);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [toastMsg, setToastMsg] = useState("");
  const [toastKind, setToastKind] = useState<"ok" | "bad" | "">("");

  // Load from Storage
  useEffect(() => {
    const savedCart = localStorage.getItem("mv_cart");
    const savedWish = localStorage.getItem("mv_wish");
    const savedProducts = localStorage.getItem("mv_products");
    
    if (savedCart) dispatch({ type: "SET", data: JSON.parse(savedCart) });
    if (savedWish) setWishlist(JSON.parse(savedWish));
    if (savedProducts) {
      try {
        const parsed = JSON.parse(savedProducts);
        if (parsed && parsed.length > 0) setProducts(parsed);
      } catch (e) {}
    }
  }, []);

  // Save to Storage
  useEffect(() => {
    localStorage.setItem("mv_cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("mv_wish", JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem("mv_products", JSON.stringify(products));
  }, [products]);

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

  const addProduct = useCallback((p: Product) => {
    setProducts((prev) => [p, ...prev]);
  }, []);

  const updateProduct = useCallback((p: Product) => {
    setProducts((prev) => prev.map((item) => (item.id === p.id ? p : item)));
  }, []);

  const deleteProduct = useCallback((id: number) => {
    setProducts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  return (
    <AppContext.Provider
      value={{
        cart,
        wishlist,
        products,
        addToCart,
        updateCartQty,
        removeFromCart,
        clearCart,
        toggleWishlist,
        addProduct,
        updateProduct,
        deleteProduct,
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
