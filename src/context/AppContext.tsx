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
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [toastMsg, setToastMsg] = useState("");
  const [toastKind, setToastKind] = useState<"ok" | "bad" | "">("");

  // Load from Storage & API
  useEffect(() => {
    const savedCart = localStorage.getItem("mv_cart");
    const savedWish = localStorage.getItem("mv_wish");
    
    if (savedCart) dispatch({ type: "SET", data: JSON.parse(savedCart) });
    if (savedWish) setWishlist(JSON.parse(savedWish));

    // Fetch products from backend
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?size=100`);
        const data = await res.json();
        if (data.success) {
          // Map backend DTO to frontend Product interface
          const mapped: Product[] = data.data.content.map((p: any) => ({
            id: p.id,
            name: p.name,
            short: p.name.split(' ').slice(-2).join(' '),
            fab: p.fabric,
            type: p.type,
            gen: p.gender,
            price: p.price,
            origPrice: p.originalPrice,
            rating: p.rating,
            rev: p.reviewCount,
            badge: p.badge,
            clrs: p.variants?.map((v: any) => v.colorHex).filter((v: any, i: number, a: any[]) => a.indexOf(v) === i) || [],
            emo: p.emoji || '🥼',
            bg: p.bgColor || '#f0f0f0',
            desc: p.description,
            fabD: p.fabricDetail || '',
            stretch: p.stretchType || '',
            pockets: p.pocketCount || 0,
            care: p.careInstructions || '',
            wt: p.weight || '',
            fit: p.fit || '',
            imgs: p.imageUrls || [],
            catId: p.categoryId,
          }));
          setProducts(mapped);
        }
      } catch (e) {
        console.error("Failed to fetch products:", e);
      }
    };

    const fetchCategories = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`);
        const data = await res.json();
        if (data.success) {
          setCategories(data.data);
        }
      } catch (e) {
        console.error("Failed to fetch categories:", e);
      }
    };

    fetchProducts();
    fetchCategories();
  }, []);

  // Save to Storage
  useEffect(() => {
    localStorage.setItem("mv_cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("mv_wish", JSON.stringify(wishlist));
  }, [wishlist]);

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

  const addProduct = useCallback(async (p: Product) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: p.name,
          description: p.desc,
          price: p.price,
          type: p.type,
          gender: p.gen,
          badge: p.badge,
          emoji: p.emo,
          bgColor: p.bg,
          fabricDetail: p.fabD,
          stretchType: p.stretch,
          pocketCount: p.pockets,
          careInstructions: p.care,
          weight: p.wt,
          fit: p.fit,
          categoryId: p.catId,
          imageUrls: p.imgs
        })
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) => [p, ...prev]); // Optimistic update or refetch
        toast("Product added to backend!", "ok");
      }
    } catch (e) {
      toast("Failed to add product", "bad");
    }
  }, [toast]);

  const updateProduct = useCallback(async (p: Product) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${p.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: p.name,
          description: p.desc,
          price: p.price,
          type: p.type,
          gender: p.gen,
          badge: p.badge,
          emoji: p.emo,
          bgColor: p.bg,
          fabricDetail: p.fabD,
          stretchType: p.stretch,
          pocketCount: p.pockets,
          careInstructions: p.care,
          weight: p.wt,
          fit: p.fit,
          categoryId: p.catId,
          imageUrls: p.imgs
        })
      });
      if (res.ok) {
        setProducts((prev) => prev.map((item) => (item.id === p.id ? p : item)));
        toast("Product updated!", "ok");
      }
    } catch (e) {
      toast("Update failed", "bad");
    }
  }, [toast]);

  const deleteProduct = useCallback(async (id: number) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setProducts((prev) => prev.filter((item) => item.id !== id));
        toast("Product deleted!", "ok");
      }
    } catch (e) {
      toast("Delete failed", "bad");
    }
  }, [toast]);

  return (
    <AppContext.Provider
      value={{
        cart,
        wishlist,
        products,
        categories,
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
